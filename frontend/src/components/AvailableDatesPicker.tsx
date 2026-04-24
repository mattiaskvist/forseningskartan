import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Box } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { CustomDateRange } from "../types/departureDelay";

dayjs.extend(minMax);

type AvailableDatesPickerProps = {
    availableDates: string[];
    selectedDateRange: CustomDateRange | null;
    onSelectDateRange: (dateRange: CustomDateRange | null) => void;
};

export function AvailableDatesPicker({
    availableDates,
    selectedDateRange,
    onSelectDateRange,
}: AvailableDatesPickerProps) {
    function getDayjsDateCB(date: string): Dayjs {
        return dayjs(date);
    }
    const dayjsDates = availableDates.map(getDayjsDateCB);
    const minDate = dayjs.min(dayjsDates) ?? undefined;
    const maxDate = dayjs.max(dayjsDates) ?? undefined;
    const selectedStartDayjsDate = selectedDateRange?.startDate
        ? getDayjsDateCB(selectedDateRange.startDate)
        : null;
    const selectedEndDayjsDate = selectedDateRange?.endDate
        ? getDayjsDateCB(selectedDateRange.endDate)
        : null;

    function shouldDisableDateCB(date: Dayjs): boolean {
        return !availableDates.includes(date.format("YYYY-MM-DD"));
    }

    function updateDateRange(nextDateRange: CustomDateRange) {
        // normalize an empty selection back to null so the store has one "no custom range" state.
        if (!nextDateRange.startDate && !nextDateRange.endDate) {
            onSelectDateRange(null);
            return;
        }

        onSelectDateRange(nextDateRange);
    }

    function handleStartDateChangeACB(nextStartDate: Dayjs | null) {
        const startDate = nextStartDate?.format("YYYY-MM-DD") ?? null;
        let endDate = selectedDateRange?.endDate ?? null;

        // Keep the range ordered if the user picks a start date after the current end date.
        if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate), "day")) {
            endDate = startDate;
        }

        updateDateRange({ startDate, endDate });
    }

    function handleEndDateChangeACB(nextEndDate: Dayjs | null) {
        const endDate = nextEndDate?.format("YYYY-MM-DD") ?? null;
        let startDate = selectedDateRange?.startDate ?? null;

        // the same ordering rule when the end date is moved before the current start date.
        if (startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate), "day")) {
            startDate = endDate;
        }

        updateDateRange({ startDate, endDate });
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                <DatePicker
                    disabled={availableDates.length === 0}
                    format="YYYY-MM-DD"
                    label="From date"
                    minDate={minDate}
                    maxDate={maxDate}
                    onChange={handleStartDateChangeACB}
                    shouldDisableDate={shouldDisableDateCB}
                    value={selectedStartDayjsDate}
                />
                <DatePicker
                    disabled={availableDates.length === 0}
                    format="YYYY-MM-DD"
                    label="To date"
                    minDate={minDate}
                    maxDate={maxDate}
                    onChange={handleEndDateChangeACB}
                    shouldDisableDate={shouldDisableDateCB}
                    value={selectedEndDayjsDate}
                />
            </Box>
        </LocalizationProvider>
    );
}
