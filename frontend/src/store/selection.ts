import { getDepartures } from "./actions";
import { setSelectedDeparture, setSelectedSiteId } from "./reducers";
import { AppDispatch } from "./store";

type SelectSiteParams = {
    dispatch: AppDispatch;
    siteId: number | null;
};

export function selectSite({ dispatch, siteId }: SelectSiteParams) {
    dispatch(setSelectedDeparture(null));
    dispatch(setSelectedSiteId(siteId));
    if (siteId === null) {
        return;
    }

    dispatch(getDepartures(siteId));
}
