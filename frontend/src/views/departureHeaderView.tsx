import Button from "@mui/material/Button";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

type DepartureHeaderViewProps = {
    selectedSiteName: string;
    isFavoriteStop: boolean;
    isUserLoggedIn: boolean;
    onToggleFavoriteStop: () => void;
    onClose: () => void;
};

export function DepartureHeaderView({
    selectedSiteName,
    isFavoriteStop,
    isUserLoggedIn,
    onToggleFavoriteStop,
    onClose,
}: DepartureHeaderViewProps) {
    return (
        <div className="flex items-center justify-between gap-2">
            <h3 className="themed-text text-sm font-medium">{selectedSiteName}</h3>
            <div className="flex items-center gap-1">
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
