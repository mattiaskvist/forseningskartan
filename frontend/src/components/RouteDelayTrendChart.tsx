import { Box, ToggleButton, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import {
    RouteDelayTrendPoint,
    RouteDelayTimeGranularity,
    RouteDelayTimeGranularityOptions,
} from "../types/routeDelays";
import { TranslationStrings } from "../utils/translations";
import { FilterToggleButtonGroup } from "./FilterToggleButtonGroup";

type RouteDelayTrendChartProps = {
    points: RouteDelayTrendPoint[];
    title: string;
    timeGranularity: RouteDelayTimeGranularity;
    onTimeGranularityChange: (granularity: RouteDelayTimeGranularity) => void;
    t: TranslationStrings["routeDetailsPage"];
};

export function RouteDelayTrendChart({
    points,
    title,
    timeGranularity,
    onTimeGranularityChange,
    t,
}: RouteDelayTrendChartProps) {
    function getMonthDayFromDateCB(point: RouteDelayTrendPoint) {
        const date = new Date(point.date);
        if (Number.isNaN(date.getTime())) {
            return point.date;
        }

        if (timeGranularity === "hourly") {
            // 2026-03-20T06:00:00Z -> Mar 20, 06:00
            return date.toLocaleString("sv-SE", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Europe/Stockholm",
            });
        } else {
            // 2026-03-20 -> Mar 20
            return date.toLocaleString("sv-SE", {
                month: "short",
                day: "numeric",
                timeZone: "Europe/Stockholm",
            });
        }
    }
    function getAvgDelayMinutesCB(point: RouteDelayTrendPoint) {
        return point.avgDelayMinutes;
    }
    const xLabels = points.map(getMonthDayFromDateCB);
    const yValues = points.map(getAvgDelayMinutesCB);

    function getTimeGranularityButtonCB(granularity: RouteDelayTimeGranularity) {
        const labelMap: Record<RouteDelayTimeGranularity, string> = {
            daily: t.trendChartDaily,
            hourly: t.trendChartHourly,
        };
        return (
            <ToggleButton value={granularity} aria-label={granularity}>
                {labelMap[granularity]}
            </ToggleButton>
        );
    }

    return (
        <Box
            sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                    {title}
                </Typography>
                <FilterToggleButtonGroup
                    options={RouteDelayTimeGranularityOptions}
                    selectedValue={timeGranularity}
                    onValueChange={onTimeGranularityChange}
                    renderButtonCB={getTimeGranularityButtonCB}
                />
            </Box>
            <LineChart
                height={250}
                margin={{ top: 24, right: 32, bottom: 4, left: 16 }}
                xAxis={[
                    {
                        scaleType: "point",
                        data: xLabels,
                        label: t.trendChartDateAxis,
                    },
                ]}
                yAxis={[
                    {
                        min: 0,
                    },
                ]}
                series={[
                    {
                        data: yValues,
                        label: t.trendChartAvgDelayAxis,
                        connectNulls: false,
                        showMark: true,
                    },
                ]}
            />
        </Box>
    );
}
