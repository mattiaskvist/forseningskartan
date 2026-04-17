import { Box, Button, Typography } from "@mui/material";

type RouteDelayRouteFallbackViewProps = {
    onBackToRoutes: () => void;
};

export function RouteDelayRouteFallbackView({ onBackToRoutes }: RouteDelayRouteFallbackViewProps) {
    return (
        <Box
            sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
            }}
        >
            <Typography sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                The selected route is no longer available for the current filters.
            </Typography>
            <Button variant="outlined" size="small" onClick={onBackToRoutes}>
                Back to routes
            </Button>
        </Box>
    );
}
