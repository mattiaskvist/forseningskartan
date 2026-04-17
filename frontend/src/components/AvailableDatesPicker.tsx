import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import minMax from "dayjs/plugin/minMax";

dayjs.extend(minMax);

type AvailableDatesPickerProps = {
    availableDates: string[];
    selectedDate: string | null;
    onSelectDate: (date: string) => void;
};

export function AvailableDatesPicker({
    availableDates,
    selectedDate,
    onSelectDate,
}: AvailableDatesPickerProps) {
    function getDayjsDateCB(date: string): Dayjs {
        return dayjs(date);
    }
    const dayjsDates = availableDates.map(getDayjsDateCB);
    const minDate = dayjs.min(dayjsDates) ?? undefined;
    const maxDate = dayjs.max(dayjsDates) ?? undefined;
    const selectedDayjsDate = selectedDate ? getDayjsDateCB(selectedDate) : null;

    function shouldDisableDateCB(date: Dayjs): boolean {
        return !availableDates.includes(date.format("YYYY-MM-DD"));
    }

    function handleDateChangeACB(selectedDate: Dayjs | null) {
        if (selectedDate) {
            onSelectDate(selectedDate.format("YYYY-MM-DD"));
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                disabled={availableDates.length === 0}
                format="YYYY-MM-DD"
                label={"Select delay date"}
                minDate={minDate}
                maxDate={maxDate}
                onChange={handleDateChangeACB}
                shouldDisableDate={shouldDisableDateCB}
                value={selectedDayjsDate}
            />
        </LocalizationProvider>
    );
}
