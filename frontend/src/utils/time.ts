import { Departure } from "../types/sl";

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
