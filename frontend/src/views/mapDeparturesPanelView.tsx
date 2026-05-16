import RefreshIcon from "@mui/icons-material/Refresh";
import { IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { DepartureView, DepartureViewProps } from "./departureView";
import { TranslationStrings } from "../utils/translations";

type MapDeparturesPanelViewProps = {
    departureViewProps: DepartureViewProps;
    isFullscreen: boolean;
    isLoading: boolean;
    lastUpdatedText: string | null;
    onRefreshDepartures: () => void;
    t: TranslationStrings["mapDeparturePanel"];
};

export function MapDeparturesPanelView({
    departureViewProps,
    isFullscreen,
    isLoading,
    lastUpdatedText,
    onRefreshDepartures,
    t,
}: MapDeparturesPanelViewProps) {
    // Use a fullscreen panel on mobile and a compact floating panel on desktop.
    const layout = isFullscreen
        ? {
              position: "fixed",
              inset: 0, // top/right/bottom/left = 0, panel fills the entire screen
              width: "100%",
              height: "100%",
              maxHeight: "100%",
              borderRadius: 0,
          }
        : {
              position: "static",
              inset: "auto", // let the document flow determine the position
              width: "420px",
              height: "auto",
              maxHeight: "calc(100vh - 2rem)", // max height of viewport minus some margin
              borderRadius: 2,
          };

    // The panel owns panel-level chrome; DepartureView only renders the selected stop content.
    return (
        // pointerEvents: "auto" allows clicks to pass through the panel when it's transparent (no stop selected)
        <aside style={{ pointerEvents: "auto", zIndex: 1000 }}>
            <Paper
                variant="outlined"
                sx={{
                    ...layout,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    overflowY: "auto",
                    p: 1.5,
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
