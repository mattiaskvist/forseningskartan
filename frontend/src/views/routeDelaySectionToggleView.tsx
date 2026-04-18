import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { RouteDelaySection } from "../types/routeDelays";

type RouteDelaySectionToggleViewProps = {
    selectedSection: RouteDelaySection;
    onSelectedSectionChange: (section: RouteDelaySection) => void;
};

export function RouteDelaySectionToggleView({
    selectedSection,
    onSelectedSectionChange,
}: RouteDelaySectionToggleViewProps) {
    function handleSectionChangeACB(
        _: React.MouseEvent<HTMLElement>,
        nextSection: RouteDelaySection | null
    ) {
        if (nextSection) {
            onSelectedSectionChange(nextSection);
        }
    }

    return (
        <ToggleButtonGroup
            exclusive
            fullWidth
            value={selectedSection}
            onChange={handleSectionChangeACB}
            sx={{
                flexWrap: "nowrap",
                gap: 0,
                "& .MuiToggleButtonGroup-grouped": {
                    flex: 1,
                },
            }}
        >
            <ToggleButton value="routes" sx={{ fontWeight: 600 }}>
                Routes
            </ToggleButton>
            <ToggleButton value="leaderboard" sx={{ fontWeight: 600 }}>
                Delay Leaderboard
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
