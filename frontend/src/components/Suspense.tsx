import { Typography, CircularProgress } from "@mui/material";

type SuspenseProps = {
    message: string;
    fullscreen?: boolean;
};

export function Suspense({ message, fullscreen = false }: SuspenseProps) {
    return (
        <div
            className={[
                "flex items-center justify-center w-full gap-4",
                fullscreen ? "h-full" : "min-h-16 rounded-md",
            ].join(" ")}
        >
            <CircularProgress size={40} />
            <Typography className="font-semibold">{message}</Typography>
        </div>
    );
}
