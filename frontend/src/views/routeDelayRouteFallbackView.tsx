import { Box, Button, Typography } from "@mui/material";
import { TranslationStrings } from "../utils/translations";

type RouteDelayRouteFallbackViewProps = {
    onBackToRoutes: () => void;
    t: TranslationStrings['routeDelayRouteFallback'];
};

export function RouteDelayRouteFallbackView({ onBackToRoutes, t }: RouteDelayRouteFallbackViewProps) {
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
                {t.notAvailable}
            </Typography>
            <Button variant="outlined" size="small" onClick={onBackToRoutes}>
                {t.back}
            </Button>
        </Box>
    );
}
