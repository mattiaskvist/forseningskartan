import {
    Box,
    Paper,
    Typography,
    Avatar,
    Button,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import { AuthUserState } from "../store/authSlice";
import { TranslationStrings } from "../utils/translations";

type AccountViewProps = {
    user: AuthUserState;
    onLogout: () => void;
    isDeleteDialogOpen: boolean;
    onDeleteRequested: () => void;
    onDeleteCancelled: () => void;
    onDeleteConfirmed: () => void;
    t: TranslationStrings["account"];
};

export function AccountView({
    user,
    onLogout,
    isDeleteDialogOpen,
    onDeleteRequested,
    onDeleteCancelled,
    onDeleteConfirmed,
    t,
}: AccountViewProps) {
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
                    sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
                >
                    {t.title}
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
                            alt={`${user.displayName || t.user}'s avatar`}
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
                            }}
                        >
                            {(user.displayName || user.email || "?")[0].toUpperCase()}
                        </Avatar>
                    )}

                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {user.displayName || t.user}
                        </Typography>
                        <Typography color="text.secondary">{user.email}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ mt: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 3 }}>
                    <Button fullWidth variant="outlined" onClick={onLogout}>
                        {t.signOut}
                    </Button>
                    <Button fullWidth variant="outlined" color="error" onClick={onDeleteRequested}>
                        {t.deleteAccount}
                    </Button>
                </Box>
            </Paper>
            <Dialog open={isDeleteDialogOpen} onClose={onDeleteCancelled}>
                <DialogTitle>{t.deleteAccount}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t.deleteConfirm}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onDeleteCancelled}>{t.cancelDelete}</Button>
                    <Button color="error" variant="contained" onClick={onDeleteConfirmed}>
                        {t.deleteAccount}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
