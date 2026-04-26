import { ReactNode } from "react";
import { DepartureHeaderView } from "./departureHeaderView";
import { TranslationStrings } from "../utils/translations";

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
    content: ReactNode;
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
    content,
}: DepartureViewProps) {
    return (
        <div className="flex flex-col gap-2">
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
            {content}
        </div>
    );
}
