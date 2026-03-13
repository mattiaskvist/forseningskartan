import { useEffect, useState } from "react";
import Autocomplete, {
    AutocompleteRenderInputParams,
    createFilterOptions,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Site } from "../types/sl";

const filterOptions = createFilterOptions<Site>({
    ignoreCase: true, // case insensitive matching
    trim: true, // trim whitespace
    limit: 100, // max number of suggestions to show, no limit is a bit laggy
});

type SearchBarProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
};

export function SearchBar({ sites, selectedSite, handleSelectSiteCB }: SearchBarProps) {
    const [inputValue, setInputValue] = useState(""); // site name in input field

    function setInputValueStateCB() {
        setInputValue(selectedSite?.name ?? "");
    }
    useEffect(setInputValueStateCB, [selectedSite]);

    function getSiteNameCB(site: Site): string {
        return site.name;
    }

    function isOptionEqualToValueCB(option: Site, value: Site): boolean {
        return option.id === value.id;
    }

    function handleChangeCB(_: React.ChangeEvent<{}>, site: Site | null) {
        // when user selects option
        handleSelectSiteCB(site?.id ?? null);
        setInputValue(site?.name ?? "");
    }
    function handleInputChangeCB(_: React.ChangeEvent<{}>, newInputValue: string) {
        // when user types in input
        setInputValue(newInputValue);
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

    return (
        <Autocomplete
            filterOptions={filterOptions}
            getOptionLabel={getSiteNameCB}
            inputValue={inputValue}
            isOptionEqualToValue={isOptionEqualToValueCB}
            noOptionsText={inputValue ? "No stops found" : "Start typing to search stops"}
            onChange={handleChangeCB}
            onInputChange={handleInputChangeCB}
            openOnFocus
            options={sites}
            renderInput={getRenderInputCB}
            renderOption={renderOptionCB}
            value={selectedSite}
        />
    );
}
