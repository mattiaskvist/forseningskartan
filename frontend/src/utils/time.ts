import dayjs from "dayjs";
import { Departure } from "../types/sl";
import { DatePreset } from "../types/departureDelay";

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

// in dayjs 0 is Sunday and 6 Saturday
const WEEKEND_WEEKDAYS = new Set([0, 6]);

export function isBeforeReferenceDateCB(date: string, referenceDate: string): boolean {
    return dayjs(date).isBefore(dayjs(referenceDate), "day");
}

export function isWeekendCB(date: string): boolean {
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
    const previousDates = sortedDates.filter((date) =>
        isBeforeReferenceDateCB(date, referenceDate)
    );
    const lastWeekDate = dayjs(referenceDate).subtract(7, "day").format("YYYY-MM-DD");

    switch (selectedDatePreset) {
        case "sameDayLastWeek":
            return availableDates.includes(lastWeekDate) ? [lastWeekDate] : [];
        case "last7Days":
            return previousDates.slice(0, 7);
        case "last5Weekdays":
            return previousDates.filter((date) => !isWeekendCB(date)).slice(0, 5);
        case "lastWeekend":
            return previousDates.filter(isWeekendCB).slice(0, 2);
        case "customDate":
            return customDate && availableDates.includes(customDate) ? [customDate] : [];
    }
}
