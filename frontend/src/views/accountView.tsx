import { Box, Paper, Typography, Avatar, Button, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AuthUserState } from "../store/authSlice";

type AccountViewProps = {
    user: AuthUserState;
    onLogout: () => void;
    onDelete: () => void;
};

export function AccountView({ user, onLogout, onDelete }: AccountViewProps) {
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
                    maxWidth: "32rem",
                    p: 3,
                    borderRadius: 2,
                    backdropFilter: "blur(4px)",
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: theme.palette.surface.panelTitle,
                    }}
                >
                    My Account
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 3,
                        gap: 2,
                    }}
                >
                    {user.photoURL ? (
                        <Avatar
                            src={user.photoURL}
                            alt={`${user.displayName || "User"}'s avatar`}
                            sx={{ width: 96, height: 96, boxShadow: 3 }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: 96,
                                height: 96,
                                boxShadow: 3,
                                fontSize: "1.875rem",
                                fontWeight: 700,
                                bgcolor: theme.palette.surface.avatarBg,
                                color: theme.palette.surface.avatarText,
                            }}
                        >
                            {(user.displayName || user.email || "?")[0].toUpperCase()}
                        </Avatar>
                    )}

                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {user.displayName || "User"}
                        </Typography>
                        <Typography color="text.secondary">{user.email}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ mt: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 3 }}>
                    <Button fullWidth variant="outlined" onClick={onLogout}>
                        Sign Out
                    </Button>
                    <Button fullWidth variant="outlined" color="error" onClick={onDelete}>
                        Delete Account
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
