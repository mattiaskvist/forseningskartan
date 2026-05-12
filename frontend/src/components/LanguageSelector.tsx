import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";
import { LanguageCode, isLanguageCode, TranslationStrings } from "../utils/translations";

type LanguageSelectorProps = {
    currentLanguage: LanguageCode;
    onLanguageChange: (lang: LanguageCode) => void;
    t: TranslationStrings["sideBar"]["languageSelector"];
};

const LANGUAGE_OPTIONS: Array<{
    code: LanguageCode;
    flag: string;
    label: string;
}> = [
    { code: "en", flag: "🇬🇧", label: "EN" },
    { code: "sv", flag: "🇸🇪", label: "SV" },
];

export function LanguageSelector({ currentLanguage, onLanguageChange, t }: LanguageSelectorProps) {
    return (
        <Box sx={{ width: "100%" }}>
            <ToggleButtonGroup
                value={currentLanguage}
                exclusive
                onChange={(_, newLang) => {
                    if (isLanguageCode(newLang)) {
                        onLanguageChange(newLang);
                    }
                }}
                size="small"
                fullWidth
                aria-label={t.ariaLabel}
            >
                {LANGUAGE_OPTIONS.map(({ code, flag, label }) => (
                    <ToggleButton
                        key={code}
                        value={code}
                        aria-label={code === "en" ? t.english : t.swedish}
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
