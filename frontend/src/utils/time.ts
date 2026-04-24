import dayjs from "dayjs";
import { Departure } from "../types/sl";
import { CustomDateRange, DatePreset, EventType } from "../types/departureDelay";
import { DelaySummary } from "../types/historicalDelay";

export function formatTime(rawTime: string | undefined): string {
    if (!rawTime) {
        return "-";
    }

    const date = new Date(rawTime);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

export function formatDelay(delayMinutes: number | null): string {
    if (delayMinutes === null) {
        return "delay unavailable";
    }

    if (delayMinutes === 0) {
        return "On time";
    }

    if (delayMinutes < 0) {
        return `Ahead by ${Math.abs(delayMinutes)} min`;
    }

    return `Late by ${delayMinutes} min`;
}

export function getDelayMinutes(departure: Departure): number | null {
    if (!departure.expected) {
        return 0;
    }

    const expectedTimestamp = Date.parse(departure.expected);
    const scheduledTimestamp = Date.parse(departure.scheduled);
    if (Number.isNaN(expectedTimestamp) || Number.isNaN(scheduledTimestamp)) {
        return null;
    }

    return Math.round((expectedTimestamp - scheduledTimestamp) / 60000);
}

export function getAvgDelaySeconds(summary: DelaySummary, selectedEventType: EventType): number {
    return selectedEventType === "departure"
        ? summary.departureDelayStats.avgSeconds
        : summary.arrivalDelayStats.avgSeconds;
}

export function getAvgDelayMinutes(summary: DelaySummary, selectedEventType: EventType): number {
    const avgDelaySeconds = getAvgDelaySeconds(summary, selectedEventType);
    return Number((avgDelaySeconds / 60).toFixed(1));
}

export function getDelayColorToken(delayMinutes: number | null) {
    if (delayMinutes === null) {
        return "text.secondary";
    }
    if (delayMinutes <= 0) {
        return "success.main";
    }
    if (delayMinutes > 0 && delayMinutes <= 3) {
        return "warning.main";
    }
    return "error.main";
}

// in dayjs 0 is Sunday and 6 Saturday
const WEEKEND_WEEKDAYS = new Set([0, 6]);

function isBeforeReferenceDateCB(date: string, referenceDate: string): boolean {
    return dayjs(date).isBefore(dayjs(referenceDate), "day");
}

function isWeekendCB(date: string): boolean {
    const weekday = dayjs(date).day();
    return WEEKEND_WEEKDAYS.has(weekday);
}

export function sortDatesDescendingCB(a: string, b: string): number {
    return dayjs(b).valueOf() - dayjs(a).valueOf();
}

export function getDatesForPreset(
    selectedDatePreset: DatePreset,
    customDateRange: CustomDateRange | null,
    availableDates: string[]
): string[] {
    const referenceDate = dayjs().format("YYYY-MM-DD"); // relative to todays date
    const sortedDates = [...availableDates].sort(sortDatesDescendingCB);
    const latestDate = sortedDates[0] ?? null;

    function isBeforeReferenceDateFilterCB(date: string): boolean {
        return isBeforeReferenceDateCB(date, referenceDate);
    }

    function isWeekdayCB(date: string): boolean {
        return !isWeekendCB(date);
    }

    const previousDates = sortedDates.filter(isBeforeReferenceDateFilterCB);
    const lastWeekDate = dayjs(referenceDate).subtract(7, "day").format("YYYY-MM-DD");

    function getEffectiveCustomDateRange(): CustomDateRange | null {
        // treat a half-filled range as a single-day selection, falling back to the latest date if needed.
        const startDate =
            customDateRange?.startDate ?? customDateRange?.endDate ?? latestDate ?? null;
        const endDate =
            customDateRange?.endDate ?? customDateRange?.startDate ?? latestDate ?? null;

        if (!startDate || !endDate) {
            return null;
        }

        if (dayjs(startDate).isAfter(dayjs(endDate), "day")) {
            return {
                startDate: endDate,
                endDate: startDate,
            };
        }

        return {
            startDate,
            endDate,
        };
    }

    switch (selectedDatePreset) {
        case "sameDayLastWeek":
            return availableDates.includes(lastWeekDate) ? [lastWeekDate] : [];
        case "last7Days":
            return previousDates.slice(0, 7);
        case "last5Weekdays":
            return previousDates.filter(isWeekdayCB).slice(0, 5);
        case "lastWeekend":
            return previousDates.filter(isWeekendCB).slice(0, 2);
        case "customDate": {
            const effectiveCustomDateRange = getEffectiveCustomDateRange();

        if (!effectiveCustomDateRange) {
            return [];
        }

        const { startDate, endDate } = effectiveCustomDateRange;

        function isDateWithinCustomRangeCB(date: string): boolean {
            // keep only available dates that fall inside the inclusive custom range.
            return (
                (dayjs(date).isAfter(dayjs(startDate), "day") ||
                    dayjs(date).isSame(dayjs(startDate), "day")) &&
                    (dayjs(date).isBefore(dayjs(endDate), "day") ||
                        dayjs(date).isSame(dayjs(endDate), "day"))
                );
            }

            return sortedDates.filter(isDateWithinCustomRangeCB);
        }
    }
}
