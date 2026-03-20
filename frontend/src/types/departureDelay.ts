import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

function formatHourRangeLocal(hourUTC: number): string {
    // create a UTC time at the given hour
    const start = dayjs.utc().hour(hourUTC).minute(0).second(0);

    // convert to local time
    const localStart = start.local();
    const localEnd = localStart.add(59, "minute");

    return `${localStart.format("HH:mm")}-${localEnd.format("HH:mm")}`;
}

function getDateRangeText(selectedDates: string[]): string {
    const sortedDates = [...selectedDates].sort();
    const fromDate = sortedDates[0];
    const toDate = sortedDates[sortedDates.length - 1];

    if (fromDate === toDate) {
        return fromDate;
    }
    return `${fromDate} - ${toDate}`;
}

export function getPresetDescription(selectedDates: string[], selectedHourUTC: number): string {
    const dateRange = getDateRangeText(selectedDates);
    const hourRange = formatHourRangeLocal(selectedHourUTC);
    return `Stats for ${dateRange}, ${hourRange}`;
}

export const DATE_PRESET_LABELS: { preset: DatePreset; label: string }[] = [
    { preset: "sameDayLastWeek", label: "Same day last week" },
    { preset: "last5Weekdays", label: "Average last 5 weekdays" },
    { preset: "lastWeekend", label: "Average last weekend" },
    { preset: "customDate", label: "Custom date" },
];

export type DatePreset = "sameDayLastWeek" | "last5Weekdays" | "lastWeekend" | "customDate";
export type EventType = "departure" | "arrival";
export type StatType = "delay" | "ahead";
