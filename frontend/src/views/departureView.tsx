import { DepartureHeaderView } from "./departureHeaderView";
import { TranslationStrings } from "../utils/translations";
import { DepartureContentView, DepartureContentViewProps } from "./departureContentView";

export type DepartureViewProps = {
    selectedSiteName: string;
    onClose: () => void;
    isFavoriteStop: boolean;
    isUserLoggedIn: boolean;
    onToggleFavoriteStop: () => void;
    tHeader: TranslationStrings["departureHeader"];
    departureViewContentProps: DepartureContentViewProps;
};

export function DepartureView({
    selectedSiteName,
    onClose,
    isFavoriteStop,
    isUserLoggedIn,
    onToggleFavoriteStop,
    tHeader,
    departureViewContentProps,
}: DepartureViewProps) {
    return (
        <div className="flex flex-col gap-2">
            <DepartureHeaderView
                selectedSiteName={selectedSiteName}
                isFavoriteStop={isFavoriteStop}
                isUserLoggedIn={isUserLoggedIn}
                onToggleFavoriteStop={onToggleFavoriteStop}
                onClose={onClose}
                t={tHeader}
            />
            <DepartureContentView {...departureViewContentProps} />
        </div>
    );
}
