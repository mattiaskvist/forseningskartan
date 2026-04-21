import { useEffect, useRef } from "react";
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
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
    siteIdsWithNoDepartures: Set<number>;
    appStyle: AppStyle;
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

function getNoDeparturesMarkerStyle(): CircleMarkerOptions {
    return {
        radius: 4,
        color: "#f97316",
        fillColor: "#f97316",
        fillOpacity: 0.85,
        weight: 1,
    };
}

function setMarkerStyle(
    marker: CircleMarker,
    isSelected: boolean,
    appStyle: AppStyle,
    hasNoDeparturesToday: boolean
) {
    if (isSelected) {
        marker.setStyle(SELECTED_MARKER_STYLE);
        return;
    }

    marker.setStyle(
        hasNoDeparturesToday ? getNoDeparturesMarkerStyle() : getUnselectedMarkerStyle(appStyle)
    );
}

export function StopMap({
    sites,
    selectedSite,
    handleSelectSiteCB,
    siteIdsWithNoDepartures,
    appStyle,
}: StopMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const tileLayerRef = useRef<TileLayer | null>(null);
    const markersLayerRef = useRef<LayerGroup | null>(null);
    const markersBySiteIdRef = useRef<Map<number, CircleMarker>>(new Map());
    const selectedMarkerRef = useRef<CircleMarker | null>(null);
    const selectedSiteIdRef = useRef<number | null>(null);
    const mapStyleRef = useRef(appStyle);

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
        const markersBySiteId = markersBySiteIdRef.current;

        return () => {
            map.remove();
            mapRef.current = null;
            tileLayerRef.current = null;
            markersLayerRef.current = null;
            markersBySiteId.clear();
            selectedMarkerRef.current = null;
            selectedSiteIdRef.current = null;
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

    // Update markers when sites change
    useEffect(() => {
        const markersLayer = markersLayerRef.current;
        if (!markersLayer) {
            return;
        }
        const currentMarkersLayer = markersLayer;

        markersLayer.clearLayers();
        const markersBySiteId = markersBySiteIdRef.current;
        markersBySiteId.clear();
        selectedMarkerRef.current = null;

        function addSiteMarkerCB(site: Site) {
            const marker = new CircleMarker(
                [site.lat, site.lon],
                siteIdsWithNoDepartures.has(site.id)
                    ? getNoDeparturesMarkerStyle()
                    : getUnselectedMarkerStyle(mapStyleRef.current)
            );
            marker.bindTooltip(site.name);

            function handleSiteMarkerClickACB() {
                const selectedSiteId = selectedSiteIdRef.current;
                const nextSiteId = selectedSiteId === site.id ? null : site.id;
                handleSelectSiteCB(nextSiteId);
            }
            marker.on("click", handleSiteMarkerClickACB);

            marker.addTo(currentMarkersLayer);
            markersBySiteId.set(site.id, marker);
        }

        sites.forEach(addSiteMarkerCB);
    }, [sites, handleSelectSiteCB, siteIdsWithNoDepartures]);

    // Update marker styles when map style changes
    useEffect(() => {
        const selectedSiteId = selectedSiteIdRef.current;
        function setMarkerStyleCB(marker: CircleMarker, siteId: number) {
            setMarkerStyle(
                marker,
                siteId === selectedSiteId,
                appStyle,
                siteIdsWithNoDepartures.has(siteId)
            );
        }
        markersBySiteIdRef.current.forEach(setMarkerStyleCB);
    }, [appStyle, siteIdsWithNoDepartures]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }
        const previousSelectedSiteId = selectedSiteIdRef.current;
        selectedSiteIdRef.current = selectedSite?.id ?? null;

        if (selectedMarkerRef.current) {
            setMarkerStyle(
                selectedMarkerRef.current,
                false,
                mapStyleRef.current,
                previousSelectedSiteId !== null
                    ? siteIdsWithNoDepartures.has(previousSelectedSiteId)
                    : false
            );
        }

        if (selectedSite) {
            const selectedMarker = markersBySiteIdRef.current.get(selectedSite.id) ?? null;
            if (selectedMarker) {
                setMarkerStyle(selectedMarker, true, mapStyleRef.current, false);
            }
            selectedMarkerRef.current = selectedMarker;
            return;
        }

        selectedMarkerRef.current = null;
    }, [selectedSite, sites, siteIdsWithNoDepartures]);

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

    return <div ref={mapContainerRef} className="h-full w-full" aria-label="Stockholm stop map" />;
}
