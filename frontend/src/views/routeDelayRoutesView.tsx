import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
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
    const theme = useTheme();

    function getRouteListItemCB(routeItem: RouteDelayListItem) {
        const { id, label, avgDelayMinutes, uniqueTrips } = routeItem;

        function handleClickACB() {
            onSelectRoute(id);
        }

        return (
            <li key={id}>
                <Box
                    component="button"
                    type="button"
                    onClick={handleClickACB}
                    sx={{
                        width: "100%",
                        borderRadius: 1,
                        border: 1,
                        borderColor: theme.palette.surface.panelBorder,
                        p: 1,
                        textAlign: "left",
                        transition: "opacity 150ms",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        bgcolor: "transparent",
                        cursor: "pointer",
                        "&:hover": { opacity: 0.9 },
                    }}
                >
                    <div>
                        <Typography
                            sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}
                        >
                            {label}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                            Average delay:{" "}
                            <span className={getDelayTextColorClass(avgDelayMinutes)}>
                                {avgDelayMinutes} min
                            </span>
                            , {uniqueTrips} unique trips
                        </Typography>
                    </div>
                    <ArrowForwardIosIcon className="mr-2" />
                </Box>
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
                <Typography
                    sx={{
                        border: 1,
                        borderColor: theme.palette.surface.panelBorder,
                        borderRadius: 1,
                        p: 1.5,
                        fontSize: "0.875rem",
                        color: "text.secondary",
                    }}
                >
                    No routes match the selected filters.
                </Typography>
            ) : (
                <ul className="space-y-2">{pagedRouteItems.map(getRouteListItemCB)}</ul>
            )}
        </section>
    );
}
