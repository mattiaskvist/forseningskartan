import { Typography } from "@mui/material";
import { TranslationStrings } from "../utils/translations";

export function DepartureEmptyStateView({ t }: { t: TranslationStrings['departureEmpty'] }) {
    return (
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
            {t.noUpcomingDepartures}
        </Typography>
    );
}
