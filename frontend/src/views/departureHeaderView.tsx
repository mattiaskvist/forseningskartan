import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import RefreshIcon from "@mui/icons-material/Refresh";

type DepartureHeaderViewProps = {
    selectedSiteName: string;
    isFavoriteStop: boolean;
    isUserLoggedIn: boolean;
    onToggleFavoriteStop: () => void;
    isLoading: boolean;
    lastUpdatedText: string | null;
    onRefreshDepartures: () => void;
    onClose: () => void;
};

export function DepartureHeaderView({
    selectedSiteName,
    isFavoriteStop,
    isUserLoggedIn,
    onToggleFavoriteStop,
    isLoading,
    lastUpdatedText,
    onRefreshDepartures,
    onClose,
}: DepartureHeaderViewProps) {
    return (
        <div className="flex items-start justify-between gap-2">
            <div>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "text.primary" }}>
                    {selectedSiteName}
                </Typography>
                {lastUpdatedText ? (
                    <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                        {lastUpdatedText}
                    </Typography>
                ) : null}
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="text"
                    size="small"
                    onClick={onRefreshDepartures}
                    disabled={isLoading}
                    startIcon={<RefreshIcon />}
                    aria-label="Refresh departures"
                >
                    Refresh
                </Button>
                <Button
                    variant="text"
                    size="small"
                    onClick={onToggleFavoriteStop}
                    startIcon={isFavoriteStop ? <StarIcon /> : <StarBorderIcon />}
                    aria-label={
                        isUserLoggedIn
                            ? isFavoriteStop
                                ? "Remove stop from favorites"
                                : "Add stop to favorites"
                            : "Log in to save favorites"
                    }
                >
                    {isUserLoggedIn
                        ? isFavoriteStop
                            ? "Unfavorite"
                            : "Favorite"
                        : "Log in to favorite"}
                </Button>
                <Button
                    variant="text"
                    size="small"
                    onClick={onClose}
                    aria-label="Close departures view"
                >
                    Close
                </Button>
            </div>
        </div>
    );
}
