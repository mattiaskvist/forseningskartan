import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { SnackbarSeverity } from "../store/snackbarSlice";

type GlobalSnackbarProps = {
    isOpen: boolean;
    message: string;
    severity: SnackbarSeverity;
    onClose: (_event?: React.SyntheticEvent | Event, reason?: string) => void;
};

export function GlobalSnackbar({ isOpen, message, severity, onClose }: GlobalSnackbarProps) {
    return (
        <Snackbar
            open={isOpen}
            autoHideDuration={3000}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert onClose={onClose} severity={severity} variant="filled">
                {message}
            </Alert>
        </Snackbar>
    );
}
