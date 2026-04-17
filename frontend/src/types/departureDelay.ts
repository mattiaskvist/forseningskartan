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

export function getPresetDescription(selectedDates: string[], selectedHourUTC?: number): string {
    if (selectedDates.length === 0) {
        return "No available dates for this preset";
    }

    const dateRange = getDateRangeText(selectedDates);
    const hourRange = selectedHourUTC !== undefined ? formatHourRangeLocal(selectedHourUTC) : "";

    return `Selected dates: ${dateRange}${hourRange ? `, ${hourRange}` : ""}`;
}

export const DatePresetLabelMap: Record<DatePreset, string> = {
    sameDayLastWeek: "Same day last week",
    last7Days: "Last 7 days",
    last5Weekdays: "Last 5 weekdays",
    lastWeekend: "Last weekend",
    customDate: "Custom date",
};
export const DatePresets: DatePreset[] = Object.keys(DatePresetLabelMap) as DatePreset[];

export type DatePreset =
    | "sameDayLastWeek"
    | "last7Days"
    | "last5Weekdays"
    | "lastWeekend"
    | "customDate";
export type EventType = "departure" | "arrival";
export type StatType = "delay" | "ahead";
