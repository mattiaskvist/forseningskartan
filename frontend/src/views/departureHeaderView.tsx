import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { TranslationStrings } from "../utils/translations";

type DepartureHeaderViewProps = {
    selectedSiteName: string;
    isFavoriteStop: boolean;
    isUserLoggedIn: boolean;
    onToggleFavoriteStop: () => void;
    onClose: () => void;
    t: TranslationStrings['departureHeader'];
};

export function DepartureHeaderView({
    selectedSiteName,
    isFavoriteStop,
    isUserLoggedIn,
    onToggleFavoriteStop,
    onClose,
    t,
}: DepartureHeaderViewProps) {
    return (
        <div className="flex items-center justify-between gap-2">
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "text.primary" }}>
                {selectedSiteName}
            </Typography>
            <div className="flex items-center gap-1">
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
                <Button
                    variant="text"
                    size="small"
                    onClick={onClose}
                    aria-label={t.close}
                >
                    {t.close}
                </Button>
            </div>
        </div>
    );
}
