export type LanguageCode = "en" | "sv";

export const isLanguageCode = (candidate: unknown): candidate is LanguageCode =>
    typeof candidate === "string" && (candidate === "en" || candidate === "sv");

// --------- views -----------
interface accountStrings {
    signOut: string;
    deleteAccount: string;
    loading: string;
    logoutSuccess: string;
    logoutError: string;
    deleteSuccess: string;
    deleteError: string;
    deleteConfirm: string;
    recentLoginRequired: string;
}

interface departureEmptyStrings {
    noUpcomingDepartures: string;
}

interface departureHeaderStrings {
    unfavorite: string;
    favorite: string;
    loginFavorite: string;
    close: string;
}

interface departureDetailsStrings {
    back: string;
    plannedDeparture: string;
    expectedDeparture: string;
    delay: string;
    stop: string;
}

interface departureStrings {
    loading: string;
}

interface mapDeparturesPanelStrings {
    departures: string;
}

interface mapStrings {
    loading: string;
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
    loading: string;
    showingFilteredRoutes: (showing: number, total: number) => string;
    showingAllFilteredRoutes: (total: number) => string;
}

interface sideBarStrings {
    login: string;
    style: string;
    favoriteStops: string;
    loginToFavorite: string;
    selectToFavorite: string;
}

// --------- components -----------
interface loginStrings {
    signIn: string;
    loading: string;
}

interface searchBarStrings {
    searchStops: string;
    typeStopName: string;
}

interface departureListStrings {
    searchPlaceholder: string;
    noTransportModes: string;
    planned: string;
    predicted: string;
    to: string;
}

interface routeDetailsPageStrings {
    back: string;
    uniqueTrips: string;
    loadingTrend: string;
    departureDelayTrend: string;
    arrivalDelayTrend: string;
}

interface routeDelayControlsStrings {
    dateSelection: string;
    eventType: string;
    transportMode: string;
    searchRoute: string;
    departure: string;
    arrival: string;
    sameDayLastWeek: string;
    last7Days: string;
    last5Weekdays: string;
    lastWeekend: string;
    customDate: string;
}

interface departureDelayStatsStrings {
    noData: string;
    departures: string;
    arrivals: string;
    onTime: string;
    delayed: string;
    onAverageBy: string;
    ahead: string;
    minute: string;
    minutes: string;
    time: string;
    times: string;
}

interface departureHistoricalDelaysStrings {
    title: string;
    loading: string;
}

interface availableDatesPickerStrings {
    selectDate: string;
}

interface appStyleSelectorStrings {
    ariaLabel: string;
}

export interface TranslationStrings {
    account: accountStrings;
    departureEmpty: departureEmptyStrings;
    departureHeader: departureHeaderStrings;
    departureDetails: departureDetailsStrings;
    departure: departureStrings;
    mapDeparturePanel: mapDeparturesPanelStrings;
    routeDelayLeaderboard: routeDelayLeaderboardStrings;
    routeDelayRouteFallback: routeDelayRouteFallbackStrings;
    routeDelayRoutes: routeDelayRoutesStrings;
    routeDelaySectionToggle: routeDelaySectionToggleStrings;
    routeDelay: routeDelayStrings;
    sideBar: sideBarStrings;
    map: mapStrings;

    login: loginStrings;
    searchBar: searchBarStrings;
    departureList: departureListStrings;
    routeDetailsPage: routeDetailsPageStrings;
    routeDelayControls: routeDelayControlsStrings;
    departureDelayStats: departureDelayStatsStrings;
    departureHistoricalDelays: departureHistoricalDelaysStrings;
    availableDatesPicker: availableDatesPickerStrings;
    appStyleSelector: appStyleSelectorStrings;
}

export const translations: Record<LanguageCode, TranslationStrings> = {
    en: {
        account: {
            signOut: "Sign Out",
            deleteAccount: "Delete Account",
            loading: "Loading account details...",
            logoutSuccess: "Logged out",
            logoutError: "Failed to log out",
            deleteSuccess: "Account deleted",
            deleteError: "Failed to delete account. Please try again later.",
            deleteConfirm:
                "Are you sure you want to delete your account? This action cannot be undone.",
            recentLoginRequired: "Please log in again before deleting your account.",
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
        departureDetails: {
            back: "Back",
            plannedDeparture: "Planned departure",
            expectedDeparture: "Expected departure",
            delay: "Delay",
            stop: "Stop",
        },
        departure: {
            loading: "Loading departures...",
        },
        mapDeparturePanel: {
            departures: "Departures",
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
            noMatch: "No routes match the selected filters.",
        },
        routeDelaySectionToggle: {
            routes: "Routes",
            leaderboard: "Delay Leaderboard",
        },
        routeDelay: {
            delays: "Route Delays",
            loading: "Loading route delays...",
            showingFilteredRoutes: (showing, total) =>
                `Showing ${showing} of ${total} filtered routes`,
            showingAllFilteredRoutes: (total) => `Showing ${total} filtered routes`,
        },
        sideBar: {
            login: "Log in",
            style: "App Style",
            favoriteStops: "Favorite stops",
            loginToFavorite: "Log in to favorite stops",
            selectToFavorite: "Select a stop to favorite it",
        },
        map: {
            loading: "Loading transit data and preparing the map...",
        },
        login: {
            signIn: "Sign In",
            loading: "Loading authentication...",
        },
        searchBar: {
            searchStops: "Search stops",
            typeStopName: "Type a stop name",
        },
        departureList: {
            searchPlaceholder: "Search by destination or line",
            noTransportModes: "No transport modes selected",
            planned: "Planned",
            predicted: "Predicted",
            to: "to",
        },
        routeDetailsPage: {
            back: "Back",
            uniqueTrips: "unique trips",
            loadingTrend: "Loading route trend...",
            departureDelayTrend: "Departure delay trend over selected dates",
            arrivalDelayTrend: "Arrival delay trend over selected dates",
        },
        routeDelayControls: {
            dateSelection: "Date selection",
            eventType: "Event type",
            transportMode: "Transport Mode",
            searchRoute: "Search route",
            departure: "Departure",
            arrival: "Arrival",
            sameDayLastWeek: "Same day last week",
            last7Days: "Last 7 days",
            last5Weekdays: "Last 5 weekdays",
            lastWeekend: "Last weekend",
            customDate: "Custom date",
        },
        departureDelayStats: {
            noData: "No route delay data found.",
            departures: "departures",
            arrivals: "arrivals",
            onTime: "on time",
            delayed: "Delayed:",
            onAverageBy: "on average by",
            ahead: "Ahead:",
            minute: "minute",
            minutes: "minutes",
            time: "time",
            times: "times",
        },
        departureHistoricalDelays: {
            title: "Historical delays",
            loading: "Loading historical delay stats...",
        },
        availableDatesPicker: {
            selectDate: "Select delay date",
        },
        appStyleSelector: {
            ariaLabel: "App style selector",
        },
    },
    sv: {
        account: {
            signOut: "Logga Ut",
            deleteAccount: "Radera Konto",
            loading: "Laddar kontouppgifter...",
            logoutSuccess: "Utloggad",
            logoutError: "Misslyckades med att logga ut",
            deleteSuccess: "Kontot raderat",
            deleteError: "Misslyckades med att radera kontot. Försök igen senare.",
            deleteConfirm:
                "Är du säker på att du vill radera ditt konto? Denna åtgärd kan inte ångras.",
            recentLoginRequired: "Vänligen logga in igen innan du raderar ditt konto.",
        },
        departureEmpty: {
            noUpcomingDepartures: "Inga kommande avgångar",
        },
        departureHeader: {
            unfavorite: "Ta bort från favoriter",
            favorite: "Gör till favorit",
            loginFavorite: "Logga in för att göra till favorit",
            close: "Stäng",
        },
        departureDetails: {
            back: "Tillbaka",
            plannedDeparture: "Planerad avgång",
            expectedDeparture: "Beräknad avgång",
            delay: "Försening",
            stop: "Hållplats",
        },
        departure: {
            loading: "Laddar in avgångar...",
        },
        mapDeparturePanel: {
            departures: "Avgångar",
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
            noMatch: "Inga linjer matchar de valda filtren.",
        },
        routeDelaySectionToggle: {
            routes: "Linjer",
            leaderboard: "Förseningstopplista",
        },
        routeDelay: {
            delays: "Linjeförseningar",
            loading: "Laddar linjeförseningar...",
            showingFilteredRoutes: (showing, total) =>
                `Visar ${showing} av ${total} filtrerade linjer`,
            showingAllFilteredRoutes: (total) => `Visar ${total} filtrerade linjer`,
        },
        sideBar: {
            login: "Logga in",
            style: "App-stil",
            favoriteStops: "Favorithållplatser",
            loginToFavorite: "Logga in för att spara favoriter",
            selectToFavorite: "Välj en hållplats för att spara den",
        },
        map: {
            loading: "Laddar kollektivtrafikdata och förbereder kartan...",
        },
        login: {
            signIn: "Logga in",
            loading: "Laddar autentisering...",
        },
        searchBar: {
            searchStops: "Sök hållplatser",
            typeStopName: "Skriv ett hållplatsnamn",
        },
        departureList: {
            searchPlaceholder: "Sök på destination eller linje",
            noTransportModes: "Inga transportmedel valda",
            planned: "Planerad",
            predicted: "Beräknad",
            to: "mot",
        },
        routeDetailsPage: {
            back: "Tillbaka",
            uniqueTrips: "unika resor",
            loadingTrend: "Laddar trend för linje...",
            departureDelayTrend: "Avgångsförseningstrend över valda datum",
            arrivalDelayTrend: "Ankomstförseningstrend över valda datum",
        },
        routeDelayControls: {
            dateSelection: "Datumval",
            eventType: "Händelsetyp",
            transportMode: "Transportmedel",
            searchRoute: "Sök linje",
            departure: "Avgång",
            arrival: "Ankomst",
            sameDayLastWeek: "Samma dag förra veckan",
            last7Days: "Senaste 7 dagarna",
            last5Weekdays: "Senaste 5 vardagarna",
            lastWeekend: "Senaste helgen",
            customDate: "Eget datum",
        },
        departureDelayStats: {
            noData: "Ingen försening hittades.",
            departures: "avgångar",
            arrivals: "ankomster",
            onTime: "i tid",
            delayed: "Försenade:",
            onAverageBy: "i genomsnitt med",
            ahead: "Tidiga:",
            minute: "minut",
            minutes: "minuter",
            time: "gång",
            times: "gånger",
        },
        departureHistoricalDelays: {
            title: "Historiska förseningar",
            loading: "Laddar historisk förseningstatistik...",
        },
        availableDatesPicker: {
            selectDate: "Välj datum",
        },
        appStyleSelector: {
            ariaLabel: "Välj tema",
        },
    },
};
