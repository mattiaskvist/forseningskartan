import { LineChart } from "@mui/x-charts/LineChart";
import { RouteDelayTrendPoint } from "../types/routeDelays";

type RouteDelayTrendChartProps = {
    points: RouteDelayTrendPoint[];
    title: string;
};

export function RouteDelayTrendChart({ points, title }: RouteDelayTrendChartProps) {
    const xLabels = points.map((point) => point.date.slice(5));
    const yValues = points.map((point) => point.avgDelayMinutes);

    return (
        <div className="border border-slate-200 rounded p-3">
            <p className="text-sm text-slate-900">{title}</p>
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
        </div>
    );
}
