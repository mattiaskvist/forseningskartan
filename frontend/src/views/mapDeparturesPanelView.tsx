import { Paper, Typography } from "@mui/material";
import { DepartureView, DepartureViewProps } from "./departureView";
import { TranslationStrings } from "../utils/translations";

type MapDeparturesPanelViewProps = {
    departureViewProps: DepartureViewProps;
    t: TranslationStrings['mapDeparturePanel'];
};

export function MapDeparturesPanelView({ departureViewProps, t }: MapDeparturesPanelViewProps) {
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
                    {t.departures}
                </Typography>
                <DepartureView {...departureViewProps} />
            </Paper>
        </aside>
    );
}
