import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function LoginView() {
    const theme = useTheme();

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
                    maxWidth: "28rem",
                    p: 3,
                    borderRadius: 2,
                    backdropFilter: "blur(4px)",
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        textAlign: "center",
                        mb: 3,
                        color: theme.palette.surface.panelTitle,
                    }}
                >
                    Sign In
                </Typography>
                <div id="firebaseui-auth-container" className="pt-2 pb-4"></div>
            </Paper>
        </Box>
    );
}
