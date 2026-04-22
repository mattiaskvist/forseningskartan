import { type MouseEvent } from "react";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AppStyle, appStyles } from "../types/appStyle";
import { TranslationStrings } from "../utils/translations";

type AppStyleSelectorProps = {
    appStyle: AppStyle;
    setAppStyle: (style: AppStyle) => void;
    isQuickOverlay?: boolean;
    t: TranslationStrings["appStyleSelector"];
};

export function AppStyleSelector({
    appStyle,
    setAppStyle,
    isQuickOverlay = false,
    t,
}: AppStyleSelectorProps) {
    function handleStyleChangeACB(_: MouseEvent<HTMLElement>, nextStyle: AppStyle | null) {
        if (nextStyle) {
            setAppStyle(nextStyle);
        }
    }

    function getAppStyleButtonCB(style: AppStyle) {
        return (
            <ToggleButton key={style} value={style}>
                {style}
            </ToggleButton>
        );
    }

    const toggleGroup = (
        <ToggleButtonGroup
            size="small"
            exclusive
            value={appStyle}
            onChange={handleStyleChangeACB}
            aria-label={t.ariaLabel}
        >
            {appStyles.map(getAppStyleButtonCB)}
        </ToggleButtonGroup>
    );

    if (!isQuickOverlay) {
        return toggleGroup;
    }

    // wrap in Paper with backdrop blur and shadow for better visibility
    // used when the selector is overlaid on the map, to ensure it stands out against the map background
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 0.5,
                borderRadius: 1.5,
                bgcolor: "background.paper",
                backdropFilter: "blur(4px)",
                boxShadow: 4,
            }}
        >
            {toggleGroup}
        </Paper>
    );
}
