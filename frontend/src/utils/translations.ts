import type { LanguageCode, TranslationStrings } from "../types/translations";

export { isLanguageCode } from "../types/translations";
export type { LanguageCode, TranslationStrings } from "../types/translations";

export const translations: Record<LanguageCode, TranslationStrings> = {
    en: {
        account: {
            signOut: "Sign Out",
            deleteAccount: "Delete Account",
            cancelDelete: "Cancel",
            loading: "Loading account details...",
            logoutSuccess: "Logged out",
            logoutError: "Failed to log out",
            deleteSuccess: "Account deleted",
            deleteError: "Failed to delete account. Please try again later.",
            deleteConfirm:
                "Are you sure you want to delete your account? This action cannot be undone.",
            recentLoginRequired: "Please log in again before deleting your account.",
            title: "My Account",
            user: "User",
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
            refresh: "Refresh",
            lastUpdated: (time) => `Last updated ${time}`,
        },
        appIntro: {
            title: "Welcome to Förseningskartan",
            description:
                "Use live and historical delay data to understand what is happening now and what usually happens over time.",
            items: [
                {
                    title: "Find a stop",
                    description: "Search or filter the map to inspect Stockholm transit stops.",
                },
                {
                    title: "Check live departures",
                    description:
                        "Open a stop to see upcoming departures and current delay predictions.",
                },
                {
                    title: "Compare historical delays",
                    description:
                        "Select a departure to see how that line usually performs at similar times.",
                },
                {
                    title: "Explore route delays",
                    description:
                        "Use Route Delays to compare routes, dates, transport modes, and trends.",
                },
            ],
            actionLabel: "Get started",
        },
        routeDelayLeaderboard: {
            min: "min",
            rank: "Rank",
            route: "Route",
            avgDelay: "Avg delay",
            uniqueTrips: "Unique trips",
            noData: "No leaderboard data available.",
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
            averageDelay: "Average delay",
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
            language: "Language",
            favoriteStops: "Favorite stops",
            loadingFavoriteStops: "Loading favorite stops...",
            loginToFavorite: "Log in to favorite stops",
            selectToFavorite: "Select a stop to favorite it",
            navigation: "Navigation",
            map: "Map",
            routeDelays: "Route Delays",
            about: "About",
            myAccount: "My Account",
            languageSelector: {
                ariaLabel: "Select language",
                english: "English",
                swedish: "Swedish",
            },
        },
        map: {
            loading: "Loading transit data and preparing the map...",
            centerOnMyLocation: "Center on my location",
            centerOnMyLocationAriaLabel: "center map on user's location",
            geolocationUnsupported: "Geolocation is not supported by your browser.",
            locationSecureConnectionRequired:
                "Location access requires a secure connection. Please check your URL.",
            locationLookupFailed: "Failed to get your location.",
            locationPermissionDenied:
                "Location permission denied. Please click the lock icon in your browser's address bar to reset permissions.",
            locationUnavailable: "Location information is unavailable on your device.",
            locationTimeout: "Location request timed out. Please try again.",
            findingLocation: "Finding your location...",
            loginToSaveFavoriteStops: "Log in to save favorite stops.",
            stopRemovedFromFavorites: "Removed stop from favorites.",
            stopAddedToFavorites: "Added stop to favorites.",
            refreshDeparturesFailed: "Failed to refresh departures.",
        },
        mapSearch: {
            hideUnusedStops: "Hide unused stops",
            showingStops: (showing, total) => `Showing ${showing}/${total} stops`,
        },
        login: {
            signIn: "Sign In",
            loading: "Loading authentication...",
            loginSuccess: "Logged in",
        },
        searchBar: {
            searchStops: "Search stops",
            typeStopName: "Type a stop name",
            noStopsFound: "No stops found",
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
            trendChartDateAxis: "Date",
            trendChartAvgDelayAxis: "Avg delay (min)",
            trendChartDaily: "Daily",
            trendChartHourly: "Hourly",
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
            customDate: "Custom date range",
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
            selectedDatesLabel: "Selected dates",
            noAvailableDates: "No available dates for this preset",
            toRouteDelayDetails: "Route delays",
        },
        availableDatesPicker: {
            startDate: "From date",
            endDate: "To date",
        },
        appStyleSelector: {
            ariaLabel: "App style selector",
            light: "Light",
            dark: "Dark",
            classic: "Classic",
        },
        about: {
            title: "About",
            description: "Förseningskartan - a transit delay visualization tool.",
        },
        transportModes: {
            bus: "Bus",
            tram: "Tram",
            metro: "Metro",
            train: "Train",
            ferry: "Ferry",
            taxi: "Taxi",
            other: "Other",
        },
    },
    sv: {
        account: {
            signOut: "Logga ut",
            deleteAccount: "Radera konto",
            cancelDelete: "Avbryt",
            loading: "Laddar kontouppgifter...",
            logoutSuccess: "Utloggad",
            logoutError: "Misslyckades med att logga ut",
            deleteSuccess: "Kontot raderat",
            deleteError: "Misslyckades med att radera kontot. Försök igen senare.",
            deleteConfirm:
                "Är du säker på att du vill radera ditt konto? Denna åtgärd kan inte ångras.",
            recentLoginRequired: "Logga in igen innan du raderar ditt konto.",
            title: "Mitt konto",
            user: "Användare",
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
            refresh: "Uppdatera",
            lastUpdated: (time) => `Senast uppdaterad ${time}`,
        },
        appIntro: {
            title: "Välkommen till Förseningskartan",
            description:
                "Använd live- och historisk förseningsdata för att förstå vad som händer nu och vad som brukar hända över tid.",
            items: [
                {
                    title: "Hitta en hållplats",
                    description:
                        "Sök eller filtrera kartan för att undersöka hållplatser i Stockholms kollektivtrafik.",
                },
                {
                    title: "Se liveavgångar",
                    description:
                        "Öppna en hållplats för att se kommande avgångar och aktuella förseningsprognoser.",
                },
                {
                    title: "Jämför historiska förseningar",
                    description:
                        "Välj en avgång för att se hur linjen brukar prestera vid liknande tider.",
                },
                {
                    title: "Utforska linjeförseningar",
                    description:
                        "Använd Linjeförseningar för att jämföra linjer, datum, trafikslag och trender.",
                },
            ],
            actionLabel: "Kom igång",
        },
        routeDelayLeaderboard: {
            min: "min",
            rank: "Placering",
            route: "Linje",
            avgDelay: "Genomsnittlig försening",
            uniqueTrips: "Unika resor",
            noData: "Ingen data för förseningstopplistan.",
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
            averageDelay: "Genomsnittlig försening",
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
            language: "Språk",
            favoriteStops: "Favorithållplatser",
            loadingFavoriteStops: "Laddar favorithållplatser...",
            loginToFavorite: "Logga in för att spara favoriter",
            selectToFavorite: "Välj en hållplats för att spara den",
            navigation: "Navigering",
            map: "Karta",
            routeDelays: "Linjeförseningar",
            about: "Om",
            myAccount: "Mitt konto",
            languageSelector: {
                ariaLabel: "Välj språk",
                english: "Engelska",
                swedish: "Svenska",
            },
        },
        map: {
            loading: "Laddar kollektivtrafikdata och förbereder kartan...",
            centerOnMyLocation: "Centrera på min plats",
            centerOnMyLocationAriaLabel: "centrera kartan på användarens plats",
            geolocationUnsupported: "Geolokalisering stöds inte av din webbläsare.",
            locationSecureConnectionRequired:
                "Åtkomst till platsinformation kräver en säker anslutning. Kontrollera din URL.",
            locationLookupFailed: "Det gick inte att hämta din plats.",
            locationPermissionDenied:
                "Platsbehörighet nekades. Klicka på låsikonen i webbläsarens adressfält för att återställa behörigheter.",
            locationUnavailable: "Platsinformation är inte tillgänglig på din enhet.",
            locationTimeout: "Platsförfrågan tog för lång tid. Försök igen.",
            findingLocation: "Hämtar din plats...",
            loginToSaveFavoriteStops: "Logga in för att spara favorithållplatser.",
            stopRemovedFromFavorites: "Hållplats borttagen från favoriter.",
            stopAddedToFavorites: "Hållplats tillagd i favoriter.",
            refreshDeparturesFailed: "Misslyckades med att uppdatera avgångar.",
        },
        mapSearch: {
            hideUnusedStops: "Dölj oanvända hållplatser",
            showingStops: (showing, total) => `Visar ${showing}/${total} hållplatser`,
        },
        login: {
            signIn: "Logga in",
            loading: "Laddar autentisering...",
            loginSuccess: "Inloggad",
        },
        searchBar: {
            searchStops: "Sök hållplatser",
            typeStopName: "Skriv ett hållplatsnamn",
            noStopsFound: "Inga hållplatser hittades",
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
            trendChartDateAxis: "Datum",
            trendChartAvgDelayAxis: "Genomsnittlig försening (min)",
            trendChartDaily: "Daglig",
            trendChartHourly: "Timvis",
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
            customDate: "Eget datumintervall",
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
            selectedDatesLabel: "Valda datum",
            noAvailableDates: "Inga tillgängliga datum för detta val",
            toRouteDelayDetails: "Visa linjeförseningar",
        },
        availableDatesPicker: {
            startDate: "Från datum",
            endDate: "Till datum",
        },
        appStyleSelector: {
            ariaLabel: "Välj tema",
            light: "Ljust",
            dark: "Mörkt",
            classic: "Klassiskt",
        },
        about: {
            title: "Om",
            description:
                "Förseningskartan - ett verktyg för att visualisera förseningar i kollektivtrafiken.",
        },
        transportModes: {
            bus: "Buss",
            tram: "Spårvagn",
            metro: "Tunnelbana",
            train: "Tåg",
            ferry: "Färja",
            taxi: "Taxi",
            other: "Övrigt",
        },
    },
};
