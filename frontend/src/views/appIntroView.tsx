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

type AppIntroViewProps = {
    isOpen: boolean;
    title: string;
    description: string;
    items: {
        title: string;
        description: string;
    }[];
    actionLabel: string;
    onClose: () => void;
};

export function AppIntroView({
    isOpen,
    title,
    description,
    items,
    actionLabel,
    onClose,
}: AppIntroViewProps) {
    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography sx={{ color: "text.secondary", mb: 1 }}>{description}</Typography>
                <List disablePadding>
                    {items.map((item) => (
                        <ListItem key={item.title} disableGutters>
                            <ListItemText
                                primary={item.title}
                                secondary={item.description}
                                primaryTypographyProps={{ fontWeight: 600 }}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    {actionLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
