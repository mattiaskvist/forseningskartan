import { DepartureHeaderView } from "./departureHeaderView";
import { TranslationStrings } from "../utils/translations";
import { DepartureContentView, DepartureContentViewProps } from "./departureContentView";

export type DepartureViewProps = {
    selectedSiteName: string;
    onClose: () => void;
    isLoading: boolean;
    lastUpdatedText: string | null;
    onRefreshDepartures: () => void;
    isFavoriteStop: boolean;
    isUserLoggedIn: boolean;
    onToggleFavoriteStop: () => void;
    tHeader: TranslationStrings["departureHeader"];
    departureViewContentProps: DepartureContentViewProps;
};

export function DepartureView({
    selectedSiteName,
    onClose,
    isLoading,
    lastUpdatedText,
    onRefreshDepartures,
    isFavoriteStop,
    isUserLoggedIn,
    onToggleFavoriteStop,
    tHeader,
    departureViewContentProps,
}: DepartureViewProps) {
    return (
        <div className="flex flex-col gap-2">
            {/* View components stay passive in MVP: render props and invoke presenter callbacks. */}
            <DepartureHeaderView
                selectedSiteName={selectedSiteName}
                isFavoriteStop={isFavoriteStop}
                isUserLoggedIn={isUserLoggedIn}
                onToggleFavoriteStop={onToggleFavoriteStop}
                isLoading={isLoading}
                lastUpdatedText={lastUpdatedText}
                onRefreshDepartures={onRefreshDepartures}
                onClose={onClose}
                t={tHeader}
            />
            <DepartureContentView {...departureViewContentProps} />
        </div>
    );
}
