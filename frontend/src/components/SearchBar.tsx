import Autocomplete, {
    AutocompleteRenderInputParams,
    createFilterOptions,
} from "@mui/material/Autocomplete";
import { FilterOptionsState } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Site } from "../types/sl";

const defaultFilterOptions = createFilterOptions<Site>({
    ignoreCase: true, // case insensitive matching
    trim: true, // trim whitespace
    limit: 100, // max number of suggestions to show, no limit is a bit laggy
});

type SearchBarProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    recentSearchSiteIds?: number[];
};

export function SearchBar({
    sites,
    selectedSite,
    handleSelectSiteCB,
    recentSearchSiteIds = [],
}: SearchBarProps) {
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
        return <TextField {...params} label="Search stops" placeholder="Type a stop name" />;
    }

    function renderOptionCB(
        props: React.HTMLAttributes<HTMLLIElement> & { key: React.Key },
        site: Site
    ) {
        // customize how options are shown and avoid dupicate key errors
        return (
            <li {...props} key={site.id}>
                {site.name}
            </li>
        );
    }

    // this custom filter options function checks if the user has typed anything in the search bar,
    // if not it shows the recent search site ids as suggestions,
    // otherwise it uses the default filter options function to show matching sites based on the user input
    function customFilterOptionsCB(options: Site[], state: FilterOptionsState<Site>) {
        if (state.inputValue.trim() === "" && recentSearchSiteIds.length > 0) {
            return recentSearchSiteIds
                .map((siteId) => options.find((site) => site.id === siteId))
                .filter((site): site is Site => !!site);
        }
        return defaultFilterOptions(options, state);
    }

    return (
        <Autocomplete
            filterOptions={customFilterOptionsCB}
            getOptionLabel={getSiteNameCB}
            isOptionEqualToValue={isOptionEqualToValueCB}
            noOptionsText="No stops found"
            onChange={handleChangeCB}
            openOnFocus
            options={sites}
            renderInput={getRenderInputCB}
            renderOption={renderOptionCB}
            value={selectedSite}
        />
    );
}
