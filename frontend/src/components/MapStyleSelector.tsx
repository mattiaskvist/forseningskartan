import { type MouseEvent } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AppStyle, appStyles } from "../types/appStyle";

type MapStyleSelectorProps = {
    appStyle: AppStyle;
    setAppStyle: (style: AppStyle) => void;
};

export function MapStyleSelector({ appStyle, setAppStyle }: MapStyleSelectorProps) {
    function handleStyleChangeACB(_: MouseEvent<HTMLElement>, nextStyle: AppStyle | null) {
        if (nextStyle) {
            setAppStyle(nextStyle);
        }
    }

    function getMapStyleButtonCB(style: AppStyle) {
        return (
            <ToggleButton key={style} value={style}>
                {style}
            </ToggleButton>
        );
    }

    return (
        <ToggleButtonGroup
            size="small"
            exclusive
            value={appStyle}
            onChange={handleStyleChangeACB}
            aria-label="App style selector"
        >
            {appStyles.map(getMapStyleButtonCB)}
        </ToggleButtonGroup>
    );
}
