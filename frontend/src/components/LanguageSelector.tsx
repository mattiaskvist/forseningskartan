import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import { LanguageCode } from "../utils/translations";

type LanguageSelectorProps = {
    currentLanguage: LanguageCode;
    onLanguageChange: (lang: LanguageCode) => void;
};

const LANGUAGE_OPTIONS: Array<{
    code: LanguageCode;
    flag: string;
    label: string;
    ariaLabel: string;
}> = [
    { code: "en", flag: "🇬🇧", label: "EN", ariaLabel: "English" },
    { code: "sv", flag: "🇸🇪", label: "SV", ariaLabel: "Svenska" },
];

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
    return (
        <Box sx={{ width: "100%" }}>
            <ToggleButtonGroup
                value={currentLanguage}
                exclusive
                onChange={(_, newLang) => {
                    if (newLang) onLanguageChange(newLang as LanguageCode);
                }}
                size="small"
                fullWidth
                aria-label="Select language"
            >
                {LANGUAGE_OPTIONS.map(({ code, flag, label, ariaLabel }) => (
                    <ToggleButton
                        key={code}
                        value={code}
                        aria-label={ariaLabel}
                        sx={{
                            flex: 1,
                            py: 1,
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            transition: "all 150ms ease-in-out",
                            "&.Mui-selected": {
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                            },
                            "&:hover:not(.Mui-selected)": {
                                bgcolor: "action.hover",
                            },
                        }}
                    >
                        <span style={{ marginRight: "0.5rem" }}>{flag}</span>
                        {label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
}
