import { Typography } from "@mui/material";

export function DepartureEmptyStateView() {
    return (
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
            No upcoming departures
        </Typography>
    );
}
