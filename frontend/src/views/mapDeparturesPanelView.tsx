import RefreshIcon from "@mui/icons-material/Refresh";
import { IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { DepartureView, DepartureViewProps } from "./departureView";
import { TranslationStrings } from "../utils/translations";

type MapDeparturesPanelViewProps = {
    departureViewProps: DepartureViewProps;
    isLoading: boolean;
    lastUpdatedText: string | null;
    onRefreshDepartures: () => void;
    t: TranslationStrings["mapDeparturePanel"];
};

export function MapDeparturesPanelView({
    departureViewProps,
    isLoading,
    lastUpdatedText,
    onRefreshDepartures,
    t,
}: MapDeparturesPanelViewProps) {
    // The panel owns panel-level chrome; DepartureView only renders the selected stop content.
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
                <div className="flex justify-between gap-2">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {t.departures}
                    </Typography>
                    <div className="flex items-center gap-1">
                        {lastUpdatedText ? (
                            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                                {lastUpdatedText}
                            </Typography>
                        ) : null}
                        <Tooltip title={t.refresh}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onRefreshDepartures}
                                    disabled={isLoading}
                                    aria-label={t.refresh}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                </div>
                <DepartureView {...departureViewProps} />
            </Paper>
        </aside>
    );
}
