import { SnackbarPayload } from "../store/snackbarSlice";
import { GeolocationRequestErrorCode } from "../types/geolocation";
import { TranslationStrings } from "./translations";

export function getGeolocationSnackbarPayload(
    errorCode: GeolocationRequestErrorCode,
    tMap: TranslationStrings["map"]
): SnackbarPayload {
    switch (errorCode) {
        case "unsupported":
            return { message: tMap.geolocationUnsupported, severity: "error" };
        case "insecure-context":
            return { message: tMap.locationSecureConnectionRequired, severity: "warning" };
        case "permission-denied":
            return { message: tMap.locationPermissionDenied, severity: "error" };
        case "position-unavailable":
            return { message: tMap.locationUnavailable, severity: "error" };
        case "timeout":
            return { message: tMap.locationTimeout, severity: "error" };
        case "lookup-failed":
        default:
            return { message: tMap.locationLookupFailed, severity: "error" };
    }
}

export function getGeolocationRequestErrorCode(
    error: GeolocationPositionError
): GeolocationRequestErrorCode {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return "permission-denied";
        case error.POSITION_UNAVAILABLE:
            return "position-unavailable";
        case error.TIMEOUT:
            return "timeout";
        default:
            return "lookup-failed";
    }
}
