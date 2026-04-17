import { mapStyles, MapStyle } from "./map";

export const appStyles = mapStyles;
export type AppStyle = MapStyle;

export function getMapStyleForAppStyle(appStyle: AppStyle): MapStyle {
    return appStyle;
}
