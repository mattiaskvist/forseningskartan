import dayjs from "dayjs";
import { Departure } from "../types/sl";
import { DatePreset, EventType } from "../types/departureDelay";
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

export function getDelayTextColorClass(delayMinutes: number | null) {
    if (delayMinutes === null) {
        return "themed-text-muted";
    }
    if (delayMinutes <= 0) {
        return "text-emerald-600";
    }
    if (delayMinutes > 0 && delayMinutes <= 3) {
        return "text-amber-600";
    }
    return "text-rose-600";
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
    customDate: string | null,
    availableDates: string[]
): string[] {
    const referenceDate = dayjs().format("YYYY-MM-DD"); // relative to todays date
    const sortedDates = [...availableDates].sort(sortDatesDescendingCB);
    function isBeforeReferenceDateFilterCB(date: string): boolean {
        return isBeforeReferenceDateCB(date, referenceDate);
    }

    function isWeekdayCB(date: string): boolean {
        return !isWeekendCB(date);
    }

    const previousDates = sortedDates.filter(isBeforeReferenceDateFilterCB);
    const lastWeekDate = dayjs(referenceDate).subtract(7, "day").format("YYYY-MM-DD");

    switch (selectedDatePreset) {
        case "sameDayLastWeek":
            return availableDates.includes(lastWeekDate) ? [lastWeekDate] : [];
        case "last7Days":
            return previousDates.slice(0, 7);
        case "last5Weekdays":
            return previousDates.filter(isWeekdayCB).slice(0, 5);
        case "lastWeekend":
            return previousDates.filter(isWeekendCB).slice(0, 2);
        case "customDate":
            return customDate && availableDates.includes(customDate) ? [customDate] : [];
    }
}
