import { Site } from "../types/sl";

type MapViewProps = {
    sites: Site[];
    selectedSiteId: number | null;
    handleSelectSiteCB: (siteId: number) => void;
};

export function MapView({ sites, selectedSiteId, handleSelectSiteCB }: MapViewProps) {
    function onSelectSiteACB(evt: React.ChangeEvent<HTMLSelectElement>) {
        handleSelectSiteCB(Number(evt.target.value));
    }

    function getSiteOptionCB(site: Site) {
        return (
            <option key={site.id} value={site.id}>
                {site.name}
            </option>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {sites.length} sites. Select site:
            <select
                value={selectedSiteId ?? 0}
                onChange={onSelectSiteACB}
            >
                {sites.map(getSiteOptionCB)}
            </select>
        </div>
    );
}
