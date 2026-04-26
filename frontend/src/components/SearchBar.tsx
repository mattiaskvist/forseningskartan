import Autocomplete, {
    AutocompleteRenderInputParams,
    createFilterOptions,
} from "@mui/material/Autocomplete";
import { FilterOptionsState } from "@mui/material";
import TextField from "@mui/material/TextField";
import HistoryIcon from "@mui/icons-material/History";
import { useMemo } from "react";
import { Site } from "../types/sl";
import { TranslationStrings } from "../utils/translations";

const defaultFilterOptions = createFilterOptions<Site>({
    ignoreCase: true, // case insensitive matching
    trim: true, // trim whitespace
    limit: 100, // max number of suggestions to show, no limit is a bit laggy
});

type SearchBarProps = {
    allSites: Site[];
    filteredSites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds?: number[];
    t: TranslationStrings["searchBar"];
};

export function SearchBar({
    allSites,
    filteredSites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds = [],
    t,
}: SearchBarProps) {
    // useMemo to avoid unnecessary recalculations on every render
    const visibleSiteIds = useMemo(
        () => new Set(filteredSites.map((site) => site.id)),
        [filteredSites]
    );
    const allSitesById = useMemo(() => {
        function getSiteIdPairCB(site: Site) {
            return [site.id, site] as const;
        }
        return new Map(allSites.map(getSiteIdPairCB));
    }, [allSites]);
    const recentVisibleSites = useMemo(
        () =>
            recentSearchSiteIds
                .map((siteId) => allSitesById.get(siteId))
                .filter((site): site is Site => !!site && visibleSiteIds.has(site.id)),
        [recentSearchSiteIds, allSitesById, visibleSiteIds]
    );

    function getSiteNameCB(site: Site): string {
        return site.name;
    }

    function isOptionEqualToValueCB(option: Site, value: Site): boolean {
        return option.id === value.id;
    }

    function handleChangeCB(_: unknown, site: Site | null) {
        // when user selects option
        handleSelectSiteCB(site?.id ?? null);
    }

    function getRenderInputCB(params: AutocompleteRenderInputParams): React.ReactNode {
        return <TextField {...params} label={t.searchStops} placeholder={t.typeStopName} />;
    }

    function renderOptionCB(
        props: React.HTMLAttributes<HTMLLIElement> & { key: React.Key },
        site: Site
    ) {
        // check if the site is in the recent search site ids to show a history icon next to it
        const isRecent = recentSearchSiteIds.includes(site.id);

        // customize how options are shown and avoid dupicate key errors
        return (
            <li {...props} key={site.id}>
                {isRecent && (
                    <HistoryIcon
                        fontSize="small"
                        color="action"
                        sx={{ marginRight: 1, opacity: 0.7 }}
                    />
                )}
                {site.name}
            </li>
        );
    }

    // prioritize sites that are in the recent search list
    function compareSitesByRecencyCB(siteA: Site, siteB: Site): number {
        const aIsRecent = recentSearchSiteIds.includes(siteA.id);
        const bIsRecent = recentSearchSiteIds.includes(siteB.id);
        if (aIsRecent && !bIsRecent) return -1;
        if (!aIsRecent && bIsRecent) return 1;
        return 0;
    }

    // this custom filter options function checks if the user has typed anything in the search bar,
    // if not it shows the recent search site ids as suggestions at the top of the list,
    // otherwise it uses the default filter options function to show matching sites based on the user input
    // but bubbles up matching recent search sites for a nice user experience
    function customFilterOptionsCB(options: Site[], state: FilterOptionsState<Site>) {
        const visibleOptions = options.filter((site) => visibleSiteIds.has(site.id));
        const defaultOptions = defaultFilterOptions(visibleOptions, state);

        if (state.inputValue.trim() === "" && recentSearchSiteIds.length > 0) {
            const remainingSites = defaultOptions.filter(
                (site) => !recentVisibleSites.includes(site)
            ); // avoid duplicates
            return [...recentVisibleSites, ...remainingSites].slice(0, defaultOptions.length); // keep the total number of options within the default limit
        }

        // bubble up recent searches
        defaultOptions.sort(compareSitesByRecencyCB);
        return defaultOptions;
    }

    return (
        <Autocomplete
            filterOptions={customFilterOptionsCB}
            getOptionLabel={getSiteNameCB}
            isOptionEqualToValue={isOptionEqualToValueCB}
            noOptionsText={t.noStopsFound}
            onChange={handleChangeCB}
            openOnFocus
            options={allSites}
            renderInput={getRenderInputCB}
            renderOption={renderOptionCB}
            value={selectedSite}
        />
    );
}
