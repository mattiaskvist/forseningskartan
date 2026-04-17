import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { RouteDelayTrendPoint } from "../types/routeDelays";

type RouteDelayTrendChartProps = {
    points: RouteDelayTrendPoint[];
    title: string;
};

export function RouteDelayTrendChart({ points, title }: RouteDelayTrendChartProps) {
    function getMonthDayFromDateCB(point: RouteDelayTrendPoint) {
        return point.date.slice(5);
    }
    function getAvgDelayMinutesCB(point: RouteDelayTrendPoint) {
        return point.avgDelayMinutes;
    }
    const xLabels = points.map(getMonthDayFromDateCB);
    const yValues = points.map(getAvgDelayMinutesCB);

    return (
        <Box
            sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
            }}
        >
            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>{title}</Typography>
            <LineChart
                height={250}
                margin={{ top: 24, right: 32, bottom: 4, left: 16 }}
                xAxis={[
                    {
                        scaleType: "point",
                        data: xLabels,
                        label: "Date",
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
                        label: "Avg delay (min)",
                        connectNulls: false,
                        showMark: true,
                    },
                ]}
            />
        </Box>
    );
}
