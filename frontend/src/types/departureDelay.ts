export type DatePreset = "sameDayLastWeek" | "last5Weekdays" | "lastWeekend" | "customDate";

export function getPresetDescription(selectedDatePreset: DatePreset): string {
    switch (selectedDatePreset) {
        case "sameDayLastWeek":
            return "Stats for the same day from last week at the hour of departure.";
        case "last5Weekdays":
            return "Stats from the latest 5 weekdays before this departure at the hour of departure.";
        case "lastWeekend":
            return "Stats from the most recent weekend before this departure at the hour of departure.";
        case "customDate":
            return "Stats for selected date at the hour of departure.";
    }
}

export const DATE_PRESET_LABELS: { preset: DatePreset; label: string }[] = [
    { preset: "sameDayLastWeek", label: "Same day last week" },
    { preset: "last5Weekdays", label: "Average last 5 weekdays" },
    { preset: "lastWeekend", label: "Average last weekend" },
    { preset: "customDate", label: "Custom date" },
];

export type EventType = "departure" | "arrival";
export type StatType = "delay" | "ahead";
