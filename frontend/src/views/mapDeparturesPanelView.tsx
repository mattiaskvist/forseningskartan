import { Paper, Typography } from "@mui/material";
import { DepartureView, DepartureViewProps } from "./departureView";

type MapDeparturesPanelViewProps = {
    departureViewProps: DepartureViewProps;
};

export function MapDeparturesPanelView({ departureViewProps }: MapDeparturesPanelViewProps) {
    return (
        <aside className="pointer-events-auto z-[1000] w-[min(420px,calc(100vw-2rem))]">
            <Paper
                variant="outlined"
                sx={{
                    maxHeight: "calc(100vh - 2rem)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    overflowY: "auto",
                    p: 1.5,
                    borderRadius: 2,
                    backdropFilter: "blur(4px)",
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                    Departures
                </Typography>
                <DepartureView {...departureViewProps} />
            </Paper>
        </aside>
    );
}
