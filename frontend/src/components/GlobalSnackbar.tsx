import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useAppDispatch, useAppSelector } from "../store/store";
import { getSnackbarMessageCB, getSnackbarOpenCB, getSnackbarSeverityCB } from "../store/selectors";
import { hideSnackbar } from "../store/snackbarSlice";

export function GlobalSnackbar() {
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(getSnackbarOpenCB);
    const message = useAppSelector(getSnackbarMessageCB);
    const severity = useAppSelector(getSnackbarSeverityCB);

    function handleCloseCB(_event?: React.SyntheticEvent | Event, reason?: string) {
        if (reason === "clickaway") {
            return;
        }

        dispatch(hideSnackbar());
    }

    return (
        <Snackbar
            open={isOpen}
            autoHideDuration={3000}
            onClose={handleCloseCB}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert onClose={handleCloseCB} severity={severity} variant="filled">
                {message}
            </Alert>
        </Snackbar>
    );
}
