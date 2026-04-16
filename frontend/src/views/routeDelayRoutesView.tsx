import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import { PageSizeOption, PageSizeOptions, RouteDelayListItem } from "../types/routeDelays";
import { getDelayTextColorClass } from "../utils/time";

type RouteDelayRoutesViewProps = {
    pagedRouteItems: RouteDelayListItem[];
    currentPage: number;
    totalPages: number;
    routesPerPage: PageSizeOption;
    onSelectRoute: (routeKey: string) => void;
    onPageChange: (nextPage: number) => void;
    onRoutesPerPageChange: (nextPageSize: PageSizeOption) => void;
};

export function RouteDelayRoutesView({
    pagedRouteItems,
    currentPage,
    totalPages,
    routesPerPage,
    onSelectRoute,
    onPageChange,
    onRoutesPerPageChange,
}: RouteDelayRoutesViewProps) {
    function getRouteListItemCB(routeItem: RouteDelayListItem) {
        const { id, label, avgDelayMinutes, uniqueTrips } = routeItem;

        function handleClickACB() {
            onSelectRoute(id);
        }

        return (
            <li key={id}>
                <button
                    type="button"
                    className={`w-full rounded border p-2 text-left transition 
                        border-slate-200 hover:border-slate-300 hover:bg-slate-50
                        flex items-center justify-between`}
                    onClick={handleClickACB}
                >
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-600">
                            Average delay:{" "}
                            <span className={getDelayTextColorClass(avgDelayMinutes)}>
                                {avgDelayMinutes} min
                            </span>
                            , {uniqueTrips} unique trips
                        </p>
                    </div>
                    <ArrowForwardIosIcon className="mr-2" />
                </button>
            </li>
        );
    }

    function getRoutesPerPageOptionCB(pageSize: number) {
        return (
            <MenuItem key={pageSize} value={pageSize}>
                {pageSize} / page
            </MenuItem>
        );
    }

    function handleRoutesPerPageChangeACB(event: SelectChangeEvent<number>) {
        onRoutesPerPageChange(event.target.value as PageSizeOption);
    }

    function handlePaginationChangeACB(_: React.ChangeEvent<unknown>, nextPage: number) {
        onPageChange(nextPage);
    }

    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <FormControl size="small" sx={{ minWidth: 125 }}>
                    <InputLabel id="routes-per-page-label">Rows</InputLabel>
                    <Select
                        labelId="routes-per-page-label"
                        label="Rows"
                        value={routesPerPage}
                        onChange={handleRoutesPerPageChangeACB}
                    >
                        {PageSizeOptions.map(getRoutesPerPageOptionCB)}
                    </Select>
                </FormControl>

                {totalPages > 1 ? (
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePaginationChangeACB}
                        color="primary"
                        shape="rounded"
                        size="small"
                        siblingCount={1}
                        boundaryCount={1}
                    />
                ) : null}
            </div>

            {pagedRouteItems.length === 0 ? (
                <p className="rounded border border-slate-200 p-3 text-sm text-slate-500">
                    No routes match the selected filters.
                </p>
            ) : (
                <ul className="space-y-2">{pagedRouteItems.map(getRouteListItemCB)}</ul>
            )}
        </section>
    );
}
