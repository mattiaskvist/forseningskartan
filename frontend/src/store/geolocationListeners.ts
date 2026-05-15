import { getGeolocationSnackbarPayload } from "../utils/geolocation";
import { translations } from "../utils/translations";
import { requestUserGeolocation } from "./actions";
import { showSnackbar } from "./snackbarSlice";
import { listenerMiddleware, RootState } from "./store";

// Show snackbar when geolocation request is initiated
listenerMiddleware.startListening({
    actionCreator: requestUserGeolocation.pending,
    effect: (_, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const tMap = translations[state.userPreferences.language].map;

        listenerApi.dispatch(
            showSnackbar({
                message: tMap.findingLocation,
                severity: "info",
            })
        );
    },
});

// Show snackbar on geolocation failure with reason-specific message
listenerMiddleware.startListening({
    actionCreator: requestUserGeolocation.rejected,
    effect: (action, listenerApi) => {
        const state = listenerApi.getState() as RootState;
        const tMap = translations[state.userPreferences.language].map;

        const reason = action.payload;
        if (!reason) {
            return;
        }

        const snackbarPayload = getGeolocationSnackbarPayload(reason, tMap);
        listenerApi.dispatch(showSnackbar(snackbarPayload));
    },
});
