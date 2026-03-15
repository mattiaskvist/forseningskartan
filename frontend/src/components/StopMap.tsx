import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Site } from "../types/sl";

type StopMapProps = {
    sites: Site[];
    selectedSite: Site | null;
    handleSelectSiteCB: (siteId: number | null) => void;
};

const STOCKHOLM_CENTER: [number, number] = [59.3293, 18.0686];
const STOCKHOLM_ZOOM = 11;
const SELECTED_SITE_ZOOM = 14;

const TILE_LAYER_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_LAYER_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

const UNSELECTED_MARKER_STYLE: L.CircleMarkerOptions = {
    radius: 4,
    color: "#38bdf8",
    fillColor: "#38bdf8",
    fillOpacity: 0.7,
    weight: 1,
};

const SELECTED_MARKER_STYLE: L.CircleMarkerOptions = {
    radius: 7,
    color: "#ef4444",
    fillColor: "#ef4444",
    fillOpacity: 0.95,
    weight: 2,
};

function setMarkerSelectedStyleCB(marker: L.CircleMarker, isSelected: boolean) {
    marker.setStyle(isSelected ? SELECTED_MARKER_STYLE : UNSELECTED_MARKER_STYLE);
}

export function StopMap({ sites, selectedSite, handleSelectSiteCB }: StopMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const markersBySiteIdRef = useRef<Map<number, L.CircleMarker>>(new Map());
    const selectedMarkerRef = useRef<L.CircleMarker | null>(null);
    const selectedSiteIdRef = useRef<number | null>(null);

    // Keep selected site id outside the marker rebuild effect to avoid re-creating markers on selection changes.
    useEffect(() => {
        selectedSiteIdRef.current = selectedSite?.id ?? null;
    }, [selectedSite]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) {
            return;
        }

        const map = L.map(mapContainerRef.current, {
            center: STOCKHOLM_CENTER,
            zoom: STOCKHOLM_ZOOM,
            zoomControl: true,
        });

        L.tileLayer(TILE_LAYER_URL, {
            attribution: TILE_LAYER_ATTRIBUTION,
            maxZoom: 19,
        }).addTo(map);

        map.whenReady(() => {
            map.invalidateSize();
        });

        mapRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
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

        markersLayer.clearLayers();
        markersBySiteIdRef.current.clear();
        selectedMarkerRef.current = null;

        const selectedSiteId = selectedSiteIdRef.current;

        for (const site of sites) {
            const marker = L.circleMarker([site.lat, site.lon], UNSELECTED_MARKER_STYLE);

            marker.bindTooltip(site.name);
            marker.on("click", () => {
                handleSelectSiteCB(site.id);
            });
            marker.addTo(markersLayer);
            markersBySiteIdRef.current.set(site.id, marker);
        }

        if (selectedSiteId !== null) {
            const selectedMarker = markersBySiteIdRef.current.get(selectedSiteId) ?? null;
            if (selectedMarker) {
                setMarkerSelectedStyleCB(selectedMarker, true);
                selectedMarkerRef.current = selectedMarker;
            }
        }
    }, [sites, handleSelectSiteCB]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }

        if (selectedMarkerRef.current) {
            setMarkerSelectedStyleCB(selectedMarkerRef.current, false);
        }

        if (selectedSite) {
            const selectedMarker = markersBySiteIdRef.current.get(selectedSite.id) ?? null;
            if (selectedMarker) {
                setMarkerSelectedStyleCB(selectedMarker, true);
            }
            selectedMarkerRef.current = selectedMarker;

            map.flyTo([selectedSite.lat, selectedSite.lon], SELECTED_SITE_ZOOM, {
                animate: true,
                duration: 0.4,
            });
            return;
        }

        selectedMarkerRef.current = null;
        map.setView(STOCKHOLM_CENTER, STOCKHOLM_ZOOM);
    }, [selectedSite]);

    return (
        <div
            ref={mapContainerRef}
            className="h-[500px] min-w-[700px] rounded border"
            aria-label="Stockholm stop map"
        />
    );
}
