import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import minMax from "dayjs/plugin/minMax";

dayjs.extend(minMax);

type AvailableDatesPickerProps = {
    availableDates: string[];
    onSelectDate: (date: string) => void;
};

export function AvailableDatesPicker({ availableDates, onSelectDate }: AvailableDatesPickerProps) {
    function getDayjsDate(date: string): Dayjs {
        return dayjs(date);
    }
    const dayjsDates = availableDates.map(getDayjsDate);
    const minDate = dayjs.min(dayjsDates) ?? undefined;
    const maxDate = dayjs.max(dayjsDates) ?? undefined;

    function shouldDisableDate(date: Dayjs): boolean {
        return !availableDates.includes(date.format("YYYY-MM-DD"));
    }

    function handleDateChange(selectedDate: Dayjs | null) {
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
                onChange={handleDateChange}
                shouldDisableDate={shouldDisableDate}
            />
        </LocalizationProvider>
    );
}
