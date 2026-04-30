import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { TranslationStrings } from "../utils/translations";

type DepartureHeaderViewProps = {
    selectedSiteName: string;
    isFavoriteStop: boolean;
    isUserLoggedIn: boolean;
    onToggleFavoriteStop: () => void;
    isLoading: boolean;
    lastUpdatedText: string | null;
    onRefreshDepartures: () => void;
    onClose: () => void;
    t: TranslationStrings["departureHeader"];
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
    t,
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
                    aria-label={t.refresh}
                >
                    {t.refresh}
                </Button>
                <Button
                    variant="text"
                    size="small"
                    onClick={onToggleFavoriteStop}
                    startIcon={isFavoriteStop ? <StarIcon /> : <StarBorderIcon />}
                    aria-label={
                        isUserLoggedIn
                            ? isFavoriteStop
                                ? t.unfavorite
                                : t.favorite
                            : t.loginFavorite
                    }
                >
                    {isUserLoggedIn
                        ? isFavoriteStop
                            ? t.unfavorite
                            : t.favorite
                        : t.loginFavorite}
                </Button>
                <Button variant="text" size="small" onClick={onClose} aria-label={t.close}>
                    {t.close}
                </Button>
            </div>
        </div>
    );
}
