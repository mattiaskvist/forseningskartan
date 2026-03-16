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

type StopMapProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
};

const STOCKHOLM_CENTER: [number, number] = [59.3293, 18.0686];
const STOCKHOLM_ZOOM = 13;
const SELECTED_SITE_ZOOM = 14;
const ZOOM_CONTROL_POSITION: ControlPosition = "bottomleft";

const TILE_LAYER_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_LAYER_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

const UNSELECTED_MARKER_STYLE: CircleMarkerOptions = {
    radius: 4,
    color: "#38bdf8",
    fillColor: "#38bdf8",
    fillOpacity: 0.7,
    weight: 1,
};

const SELECTED_MARKER_STYLE: CircleMarkerOptions = {
    radius: 7,
    color: "#ef4444",
    fillColor: "#ef4444",
    fillOpacity: 0.95,
    weight: 2,
};

function setMarkerSelectedStyleCB(marker: CircleMarker, isSelected: boolean) {
    marker.setStyle(isSelected ? SELECTED_MARKER_STYLE : UNSELECTED_MARKER_STYLE);
}

export function StopMap({ sites, selectedSite, handleSelectSiteCB }: StopMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const markersLayerRef = useRef<LayerGroup | null>(null);
    const markersBySiteIdRef = useRef<Map<number, CircleMarker>>(new Map());
    const selectedMarkerRef = useRef<CircleMarker | null>(null);
    const selectedSiteIdRef = useRef<number | null>(null);

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

        new TileLayer(TILE_LAYER_URL, {
            attribution: TILE_LAYER_ATTRIBUTION,
            maxZoom: 19,
        }).addTo(map);

        map.whenReady(() => {
            map.invalidateSize();
        });

        mapRef.current = map;
        markersLayerRef.current = new LayerGroup().addTo(map);
        const markersBySiteId = markersBySiteIdRef.current;

        return () => {
            map.remove();
            mapRef.current = null;
            markersLayerRef.current = null;
            markersBySiteId.clear();
            selectedMarkerRef.current = null;
            selectedSiteIdRef.current = null;
        };
    }, []);

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
            const marker = new CircleMarker([site.lat, site.lon], UNSELECTED_MARKER_STYLE);
            marker.bindTooltip(site.name);
            marker.on("click", () => {
                const selectedSiteId = selectedSiteIdRef.current;
                const nextSiteId = selectedSiteId === site.id ? null : site.id;
                handleSelectSiteCB(nextSiteId);
            });
            marker.addTo(currentMarkersLayer);
            markersBySiteId.set(site.id, marker);
        }

        sites.forEach(addSiteMarkerCB);
    }, [sites, handleSelectSiteCB]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }
        selectedSiteIdRef.current = selectedSite?.id ?? null;

        if (selectedMarkerRef.current) {
            setMarkerSelectedStyleCB(selectedMarkerRef.current, false);
        }

        if (selectedSite) {
            const selectedMarker = markersBySiteIdRef.current.get(selectedSite.id) ?? null;
            if (selectedMarker) {
                setMarkerSelectedStyleCB(selectedMarker, true);
            }
            selectedMarkerRef.current = selectedMarker;
            return;
        }

        selectedMarkerRef.current = null;
    }, [selectedSite, sites]);

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
