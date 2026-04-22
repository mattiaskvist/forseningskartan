import { Box, Paper, Typography } from "@mui/material";
import { TranslationStrings } from "../utils/translations";

type AboutViewProps = {
    t: TranslationStrings["about"];
};

export function AboutView({ t }: AboutViewProps) {
    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                width: "100%",
                alignItems: "flex-start",
                justifyContent: "center",
                overflowY: "auto",
                p: 4,
                pt: 10,
                bgcolor: "background.default",
                color: "text.primary",
            }}
        >
            <Paper
                variant="outlined"
                sx={{
                    width: "100%",
                    maxWidth: "48rem",
                    p: 3,
                    borderRadius: 2,
                    backdropFilter: "blur(4px)",
                }}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {t.title}
                </Typography>
                <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                    {t.description}
                </Typography>
            </Paper>
        </Box>
    );
}
