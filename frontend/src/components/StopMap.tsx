import { useCallback, useEffect, useRef } from "react";
import {
    CircleMarker,
    Control,
    LayerGroup,
    Map as LeafletMap,
    TileLayer,
    type CircleMarkerOptions,
    type ControlPosition,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Site } from "../types/sl";
import { AppStyle } from "../types/appStyle";

type StopMapProps = {
    allSites: Site[];
    filteredSites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    appStyle: AppStyle;
    userLocation: { lat: number; lon: number } | null;
    mapCenterOnUserRequestedAt: number;
};

const STOCKHOLM_CENTER: [number, number] = [59.3293, 18.0686];
const STOCKHOLM_ZOOM = 13;
const SELECTED_SITE_ZOOM = 14;
const ZOOM_CONTROL_POSITION: ControlPosition = "bottomleft";

const MAP_TILES: Record<AppStyle, { url: string; attribution: string }> = {
    Dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
    Light: {
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
    Classic: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
};

const SELECTED_MARKER_STYLE: CircleMarkerOptions = {
    radius: 7,
    color: "#ef4444",
    fillColor: "#ef4444",
    fillOpacity: 0.95,
    weight: 2,
};

function getUnselectedMarkerStyle(appStyle: AppStyle): CircleMarkerOptions {
    const UNSELECTED_MARKER_COLOR_BY_STYLE: Record<AppStyle, string> = {
        Dark: "#38bdf8",
        Light: "#0284c7",
        Classic: "#2563eb",
    };
    const color = UNSELECTED_MARKER_COLOR_BY_STYLE[appStyle];
    return {
        radius: 4,
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 1,
    };
}

function setMarkerSelectedStyle(marker: CircleMarker, isSelected: boolean, appStyle: AppStyle) {
    marker.setStyle(isSelected ? SELECTED_MARKER_STYLE : getUnselectedMarkerStyle(appStyle));
}

export function StopMap({
    allSites,
    filteredSites,
    selectedSite,
    handleSelectSiteCB,
    appStyle,
    userLocation,
    mapCenterOnUserRequestedAt,
}: StopMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const tileLayerRef = useRef<TileLayer | null>(null);
    const markersLayerRef = useRef<LayerGroup | null>(null);
    const allMarkersBySiteIdRef = useRef<Map<number, CircleMarker>>(new Map());
    const allSitesByIdRef = useRef<Map<number, Site>>(new Map());
    const visibleSiteIdsRef = useRef<Set<number>>(new Set());
    const selectedMarkerRef = useRef<CircleMarker | null>(null);
    const selectedSiteIdRef = useRef<number | null>(null);
    const mapStyleRef = useRef(appStyle);
    const userMarkerRef = useRef<CircleMarker | null>(null);

    useEffect(() => {
        mapStyleRef.current = appStyle;
    }, [appStyle]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) {
            return;
        }

        const map = new LeafletMap(mapContainerRef.current, {
            center: STOCKHOLM_CENTER,
            zoom: STOCKHOLM_ZOOM,
            zoomControl: false,
        });

        new Control.Zoom({
            position: ZOOM_CONTROL_POSITION,
        }).addTo(map);

        function handleMapReadyACB() {
            map.invalidateSize();
        }
        map.whenReady(handleMapReadyACB);

        mapRef.current = map;
        markersLayerRef.current = new LayerGroup().addTo(map);
        const allMarkersBySiteId = allMarkersBySiteIdRef.current;
        const allSitesById = allSitesByIdRef.current;
        const visibleSiteIds = visibleSiteIdsRef.current;

        return () => {
            map.remove();
            mapRef.current = null;
            tileLayerRef.current = null;
            markersLayerRef.current = null;
            allMarkersBySiteId.clear();
            allSitesById.clear();
            visibleSiteIds.clear();
            selectedMarkerRef.current = null;
            selectedSiteIdRef.current = null;
            userMarkerRef.current = null;
        };
    }, []);

    // Update tile layer when map style changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }

        const style = MAP_TILES[appStyle];

        if (tileLayerRef.current) {
            tileLayerRef.current.removeFrom(map);
        }

        const tileLayer = new TileLayer(style.url, {
            attribution: style.attribution,
            maxZoom: 19,
        });
        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;
    }, [appStyle]);

    const createSiteMarker = useCallback(
        (site: Site): CircleMarker => {
            const marker = new CircleMarker(
                [site.lat, site.lon],
                getUnselectedMarkerStyle(mapStyleRef.current)
            );
            marker.bindTooltip(site.name);

            function handleSiteMarkerClickACB() {
                const selectedSiteId = selectedSiteIdRef.current;
                const nextSiteId = selectedSiteId === site.id ? null : site.id;
                handleSelectSiteCB(nextSiteId);
            }
            marker.on("click", handleSiteMarkerClickACB);

            return marker;
        },
        [handleSelectSiteCB]
    );

    // Build and cache markers once for all sites, then reuse them across filter changes
    useEffect(() => {
        if (!markersLayerRef.current) {
            return;
        }

        const allMarkersBySiteId = allMarkersBySiteIdRef.current;
        const allSitesById = allSitesByIdRef.current;
        const nextSiteIds = new Set<number>();

        // Build markers for all sites
        function addSiteMarkerCB(site: Site) {
            nextSiteIds.add(site.id);
            allSitesById.set(site.id, site);

            if (allMarkersBySiteId.has(site.id)) {
                return;
            }

            const marker = createSiteMarker(site);

            allMarkersBySiteId.set(site.id, marker);
        }
        allSites.forEach(addSiteMarkerCB);

        // Remove markers for sites that are no longer present in allSites
        function removeStaleSiteCB(marker: CircleMarker, siteId: number) {
            if (nextSiteIds.has(siteId)) {
                return;
            }
            markersLayerRef.current?.removeLayer(marker);
            allMarkersBySiteId.delete(siteId);
            allSitesById.delete(siteId);
            visibleSiteIdsRef.current.delete(siteId);
        }
        allMarkersBySiteId.forEach(removeStaleSiteCB);

        // If the currently selected site is no longer in the list of all sites, deselect it
        if (selectedSiteIdRef.current !== null && !nextSiteIds.has(selectedSiteIdRef.current)) {
            selectedMarkerRef.current = null;
            selectedSiteIdRef.current = null;
        }
    }, [allSites, handleSelectSiteCB, createSiteMarker]);

    // Update markers when sites change
    useEffect(() => {
        const markersLayer = markersLayerRef.current;
        if (!markersLayer) {
            return;
        }
        const currentMarkersLayer = markersLayer;

        const allMarkersBySiteId = allMarkersBySiteIdRef.current;
        const allSitesById = allSitesByIdRef.current;
        const visibleSiteIds = visibleSiteIdsRef.current;
        const nextVisibleSiteIds = new Set<number>(filteredSites.map((site) => site.id));

        // Remove markers for sites that are no longer visible
        function hideNoLongerVisibleSiteCB(siteId: number) {
            if (nextVisibleSiteIds.has(siteId)) {
                return;
            }
            const marker = allMarkersBySiteId.get(siteId);
            if (marker) {
                currentMarkersLayer.removeLayer(marker);
            }
            visibleSiteIds.delete(siteId);
        }
        Array.from(visibleSiteIds).forEach(hideNoLongerVisibleSiteCB);

        // Add markers for newly visible sites
        function showNewlyVisibleSiteCB(siteId: number) {
            if (visibleSiteIds.has(siteId)) {
                return;
            }

            let marker = allMarkersBySiteId.get(siteId);
            if (!marker) {
                const site = allSitesById.get(siteId);
                if (!site) {
                    return;
                }

                marker = createSiteMarker(site);

                allMarkersBySiteId.set(siteId, marker);
            }

            marker.addTo(currentMarkersLayer);
            visibleSiteIds.add(siteId);
        }
        nextVisibleSiteIds.forEach(showNewlyVisibleSiteCB);
    }, [filteredSites, handleSelectSiteCB, createSiteMarker]);

    // Update marker styles when map style changes
    useEffect(() => {
        const selectedSiteId = selectedSiteIdRef.current;
        function setMarkerStyleCB(marker: CircleMarker, siteId: number) {
            setMarkerSelectedStyle(marker, siteId === selectedSiteId, appStyle);
        }
        allMarkersBySiteIdRef.current.forEach(setMarkerStyleCB);
    }, [appStyle]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }
        selectedSiteIdRef.current = selectedSite?.id ?? null;

        if (selectedMarkerRef.current) {
            setMarkerSelectedStyle(selectedMarkerRef.current, false, mapStyleRef.current);
        }

        if (selectedSite) {
            const selectedMarker = allMarkersBySiteIdRef.current.get(selectedSite.id) ?? null;
            if (selectedMarker) {
                setMarkerSelectedStyle(selectedMarker, true, mapStyleRef.current);
            }
            selectedMarkerRef.current = selectedMarker;
            return;
        }

        selectedMarkerRef.current = null;
    }, [selectedSite]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }

        if (selectedSite) {
            map.flyTo([selectedSite.lat, selectedSite.lon], SELECTED_SITE_ZOOM, {
                animate: true,
                duration: 0.4,
            });
        }
    }, [selectedSite]);

    // Fly to user location when trigger changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !userLocation || mapCenterOnUserRequestedAt === 0) {
            return;
        }

        map.flyTo([userLocation.lat, userLocation.lon], SELECTED_SITE_ZOOM, {
            animate: true,
            duration: 0.6,
        });
    }, [mapCenterOnUserRequestedAt, userLocation]);

    // Update user marker when location changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !userLocation) {
            if (userMarkerRef.current) {
                userMarkerRef.current.remove();
                userMarkerRef.current = null;
            }
            return;
        }

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
        } else {
            userMarkerRef.current = new CircleMarker([userLocation.lat, userLocation.lon], {
                radius: 7,
                color: "#ffffff",
                fillColor: "#3b82f6",
                fillOpacity: 1,
                weight: 2,
            })
                .bindTooltip("You are here")
                .addTo(map);
        }
    }, [userLocation]);

    return <div ref={mapContainerRef} className="h-full w-full" aria-label="Stockholm stop map" />;
}
