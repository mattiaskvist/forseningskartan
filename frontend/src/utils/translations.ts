export type LanguageCode = 'en' | 'sv';

// --------- views -----------
interface accountStrings {
    signOut: string;
    deleteAccount: string;
}

interface departureEmptyStrings {
    noUpcomingDepartures: string
}

interface departureHeaderStrings {
    unfavorite: string;
    favorite: string;
    loginFavorite: string;

    close: string;
}

interface departureStrings {
    loading: string;
}

interface mapDeparturesPanelStrings {
    departures: string;
}

interface routeDelayLeaderboardStrings {
    rank: string;
    avgDelay: string;
    uniqueTrips: string;
    min: string;
}

interface routeDelayRouteFallbackStrings {
    notAvailable: string;
    back: string;
}

interface routeDelayRoutesStrings {
    min: string;
    unique: string;
    page: string;
    noMatch: string;
}

interface routeDelaySectionToggleStrings {
    routes: string;
    leaderboard: string;
}

interface routeDelayStrings {
    delays: string;
}

interface sideBarStrings {
    login: string;
    style: string;
    favoriteStops: string;

    loginToFavorite: string;
    selectToFavorite: string;
}

// TODO: components & routes




export interface TranslationStrings {
    account: accountStrings;
    departureEmpty: departureEmptyStrings;
    departureHeader: departureHeaderStrings;
    departure: departureStrings;
    mapDeparturePanel: mapDeparturesPanelStrings;
    routeDelayLeaderboard: routeDelayLeaderboardStrings;
    routeDelayRouteFallback: routeDelayRouteFallbackStrings;
    routeDelayRoutes: routeDelayRoutesStrings;
    routeDelaySectionToggle: routeDelaySectionToggleStrings;
    routeDelay: routeDelayStrings;
    sideBar: sideBarStrings;
}

export const translations: Record<LanguageCode, TranslationStrings> = {
    en: {
        account: {
            signOut: "Sign Out",
            deleteAccount: "Delete Account",
        },
        departureEmpty: {
            noUpcomingDepartures: "No upcoming departures",
        },
        departureHeader: {
            unfavorite: "Unfavorite",
            favorite: "Favorite",
            loginFavorite: "Log in to favorite",
            close: "Close",
        },
        departure: {
            loading: "Loading departures...",
        },
        mapDeparturePanel: {
            departures: "Departures"
        },
        routeDelayLeaderboard: {
            min: "min",
            rank: "Rank",
            avgDelay: "Avg delay",
            uniqueTrips: "Unique trips",
        },
        routeDelayRouteFallback: {
            notAvailable: "The selected route is no longer available for the current filters.",
            back: "Back",
        },
        routeDelayRoutes: {
            min: "min",
            unique: "unique trips",
            page: "page",
            noMatch: "No routes match the selected filters."
        },
        routeDelaySectionToggle: {
            routes: "Routes",
            leaderboard: "Delay Leaderboard"
        },
        routeDelay: {
            delays: "Route Delays",
        },
        sideBar: {
            login: "Log In",
            style: "Style",
            favoriteStops: "Favorite stops",

            loginToFavorite: "Log in to favorite stops",
            selectToFavorite: "Select a stop to favorite it",
        },
    },
    sv: {
        account: {
            signOut: "Logga Ut",
            deleteAccount: "Radera Konto",
        },
        departureEmpty: {
            noUpcomingDepartures: "Inga kommande avgångar"
        },
        departureHeader: {
            unfavorite: "Ta bort från favoriter",
            favorite: "Gör till favorit",
            loginFavorite: "Logga in för att göra till favorit",
            close: "Stäng",
        },
        departure: {
            loading: "Laddar in avgångar...",
        },
        mapDeparturePanel: {
            departures: "Avgångar"
        },
        routeDelayLeaderboard: {
            min: "min",
            rank: "Placering",
            avgDelay: "Genomsnittlig försening",
            uniqueTrips: "Unika resor",
        },
        routeDelayRouteFallback: {
            notAvailable: "Den valda linjen är inte längre tillgänglig för de valda filtren.",
            back: "Tillbaka",
        },
        routeDelayRoutes: {
            min: "min",
            unique: "unika resor",
            page: "sida",
            noMatch: "Inga linjer matchar de valda filtren."
        },
        routeDelaySectionToggle: {
            routes: "Linjer",
            leaderboard: "Förseningstopplista"
        },
        routeDelay: {
            delays: "Linjeförseningar",
        },
        sideBar: {
            login: "Logga In",
            style: "Tema",
            favoriteStops: "Favorithållplatser",

            loginToFavorite: "Logga in för att spara favoriter",
            selectToFavorite: "Välj en hållplats för att göra det till en favorit",
        },
    }
}