import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";
import { LanguageSelector } from "../components/LanguageSelector";
import { LanguageCode, TranslationStrings } from "../utils/translations";

type AppIntroViewProps = {
    isOpen: boolean;
    currentLanguage: LanguageCode;
    onLanguageChange: (language: LanguageCode) => void;
    onClose: () => void;
    t: TranslationStrings["appIntro"];
    tLanguageSelector: TranslationStrings["sideBar"]["languageSelector"];
};

export function AppIntroView({
    isOpen,
    currentLanguage,
    onLanguageChange,
    onClose,
    t,
    tLanguageSelector,
}: AppIntroViewProps) {
    function renderIntroItemCB(item: TranslationStrings["appIntro"]["items"][number]) {
        return (
            <ListItem key={item.title} disableGutters>
                <ListItemText
                    primary={item.title}
                    secondary={item.description}
                    primaryTypographyProps={{ fontWeight: 600 }}
                />
            </ListItem>
        );
    }

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t.title}</DialogTitle>
            <DialogContent>
                <Typography sx={{ color: "text.secondary", mb: 1 }}>{t.description}</Typography>
                <List disablePadding>{t.items.map(renderIntroItemCB)}</List>
                <LanguageSelector
                    currentLanguage={currentLanguage}
                    onLanguageChange={onLanguageChange}
                    t={tLanguageSelector}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    {t.actionLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
