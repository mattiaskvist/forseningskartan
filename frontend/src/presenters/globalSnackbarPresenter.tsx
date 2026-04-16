import { GlobalSnackbar } from "../components/GlobalSnackbar";
import { getSnackbarMessageCB, getSnackbarOpenCB, getSnackbarSeverityCB } from "../store/selectors";
import { hideSnackbar } from "../store/snackbarSlice";
import { useAppDispatch, useAppSelector } from "../store/store";

export function GlobalSnackbarPresenter() {
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
        <GlobalSnackbar
            isOpen={isOpen}
            message={message}
            severity={severity}
            onClose={handleCloseCB}
        />
    );
}
