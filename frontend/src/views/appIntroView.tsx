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
    onClose: () => void;
};

const introItems = [
    {
        title: "Find a stop",
        description: "Search or filter the map to inspect Stockholm transit stops.",
    },
    {
        title: "Check live departures",
        description: "Open a stop to see upcoming departures and current delay predictions.",
    },
    {
        title: "Compare historical delays",
        description: "Select a departure to see how that line usually performs at similar times.",
    },
    {
        title: "Explore route delays",
        description: "Use Route Delays to compare routes, dates, transport modes, and trends.",
    },
];

export function AppIntroView({ isOpen, onClose }: AppIntroViewProps) {
    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Welcome to Förseningskartan</DialogTitle>
            <DialogContent>
                <Typography sx={{ color: "text.secondary", mb: 1 }}>
                    Use live and historical delay data to understand what is happening now and what
                    usually happens over time.
                </Typography>
                <List disablePadding>
                    {introItems.map((item) => (
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
                    Get started
                </Button>
            </DialogActions>
        </Dialog>
    );
}
