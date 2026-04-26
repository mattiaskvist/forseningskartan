export type LanguageCode = "en" | "sv";

export const isLanguageCode = (candidate: unknown): candidate is LanguageCode =>
    typeof candidate === "string" && (candidate === "en" || candidate === "sv");

export interface AccountStrings {
    signOut: string;
    deleteAccount: string;
    loading: string;
    logoutSuccess: string;
    logoutError: string;
    deleteSuccess: string;
    deleteError: string;
    deleteConfirm: string;
    recentLoginRequired: string;
    title: string;
    user: string;
}

export interface DepartureEmptyStrings {
    noUpcomingDepartures: string;
}

export interface DepartureHeaderStrings {
    unfavorite: string;
    favorite: string;
    loginFavorite: string;
    close: string;
}

export interface DepartureDetailsStrings {
    back: string;
    plannedDeparture: string;
    expectedDeparture: string;
    delay: string;
    stop: string;
}

export interface DepartureStrings {
    loading: string;
}

export interface MapDeparturesPanelStrings {
    departures: string;
}

export interface MapStrings {
    loading: string;
    centerOnMyLocation: string;
    centerOnMyLocationAriaLabel: string;
    geolocationUnsupported: string;
    locationSecureConnectionRequired: string;
    locationLookupFailed: string;
    locationPermissionDenied: string;
    locationUnavailable: string;
    locationTimeout: string;
    findingLocation: string;
    loginToSaveFavoriteStops: string;
    stopRemovedFromFavorites: string;
    stopAddedToFavorites: string;
}

export interface MapSearchStrings {
    hideUnusedStops: string;
    showingStops: (showing: number, total: number) => string;
}

export interface RouteDelayLeaderboardStrings {
    rank: string;
    route: string;
    avgDelay: string;
    uniqueTrips: string;
    min: string;
    noData: string;
}

export interface RouteDelayRouteFallbackStrings {
    notAvailable: string;
    back: string;
}

export interface RouteDelayRoutesStrings {
    min: string;
    unique: string;
    page: string;
    noMatch: string;
    averageDelay: string;
}

export interface RouteDelaySectionToggleStrings {
    routes: string;
    leaderboard: string;
}

export interface RouteDelayStrings {
    delays: string;
    loading: string;
    showingFilteredRoutes: (showing: number, total: number) => string;
    showingAllFilteredRoutes: (total: number) => string;
}

export interface LanguageSelectorStrings {
    ariaLabel: string;
    english: string;
    swedish: string;
}

export interface SideBarStrings {
    login: string;
    style: string;
    language: string;
    favoriteStops: string;
    loginToFavorite: string;
    selectToFavorite: string;
    navigation: string;
    map: string;
    routeDelays: string;
    about: string;
    myAccount: string;
    languageSelector: LanguageSelectorStrings;
}

export type SidebarRouteLabelKey = keyof Pick<SideBarStrings, "map" | "routeDelays" | "about">;

export interface LoginStrings {
    signIn: string;
    loading: string;
    loginSuccess: string;
}

export interface SearchBarStrings {
    searchStops: string;
    typeStopName: string;
    noStopsFound: string;
}

export interface DepartureListStrings {
    searchPlaceholder: string;
    noTransportModes: string;
    planned: string;
    predicted: string;
    to: string;
}

export interface RouteDetailsPageStrings {
    back: string;
    uniqueTrips: string;
    loadingTrend: string;
    departureDelayTrend: string;
    arrivalDelayTrend: string;
    trendChartDateAxis: string;
    trendChartAvgDelayAxis: string;
}

export interface RouteDelayControlsStrings {
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

export interface DepartureDelayStatsStrings {
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

export interface DepartureHistoricalDelaysStrings {
    title: string;
    loading: string;
    selectedDatesLabel: string;
    noAvailableDates: string;
}

export interface AvailableDatesPickerStrings {
    startDate: string;
    endDate: string;
}

export interface AppStyleSelectorStrings {
    ariaLabel: string;
    light: string;
    dark: string;
    classic: string;
}

export interface AboutStrings {
    title: string;
    description: string;
}

export interface TransportModesStrings {
    bus: string;
    tram: string;
    metro: string;
    train: string;
    ferry: string;
    ship: string;
    taxi: string;
    other: string;
}

export interface TranslationStrings {
    account: AccountStrings;
    departureEmpty: DepartureEmptyStrings;
    departureHeader: DepartureHeaderStrings;
    departureDetails: DepartureDetailsStrings;
    departure: DepartureStrings;
    mapDeparturePanel: MapDeparturesPanelStrings;
    routeDelayLeaderboard: RouteDelayLeaderboardStrings;
    routeDelayRouteFallback: RouteDelayRouteFallbackStrings;
    routeDelayRoutes: RouteDelayRoutesStrings;
    routeDelaySectionToggle: RouteDelaySectionToggleStrings;
    routeDelay: RouteDelayStrings;
    sideBar: SideBarStrings;
    map: MapStrings;
    mapSearch: MapSearchStrings;
    login: LoginStrings;
    searchBar: SearchBarStrings;
    departureList: DepartureListStrings;
    routeDetailsPage: RouteDetailsPageStrings;
    routeDelayControls: RouteDelayControlsStrings;
    departureDelayStats: DepartureDelayStatsStrings;
    departureHistoricalDelays: DepartureHistoricalDelaysStrings;
    availableDatesPicker: AvailableDatesPickerStrings;
    appStyleSelector: AppStyleSelectorStrings;
    about: AboutStrings;
    transportModes: TransportModesStrings;
}
