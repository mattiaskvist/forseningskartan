import { getDepartures } from "./actions";
import { setSelectedSiteId } from "./reducers";
import { AppDispatch } from "./store";

type SelectSiteParams = {
    dispatch: AppDispatch;
    siteId: number | null;
};

export function selectSiteCB({ dispatch, siteId }: SelectSiteParams) {
    dispatch(setSelectedSiteId(siteId));
    if (siteId === null) {
        return;
    }

    dispatch(getDepartures(siteId));
}
