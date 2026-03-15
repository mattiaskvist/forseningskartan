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

export function StopMap({ sites, selectedSite, handleSelectSiteCB }: StopMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const handleSelectSiteRef = useRef(handleSelectSiteCB);

    // keep handleSelectSiteCB up to date in the ref so
    // that marker click handlers always have the latest callback.
    // If we dont do this, the marker click handlers will have a
    // stale callback and not work after the first render
    useEffect(() => {
        handleSelectSiteRef.current = handleSelectSiteCB;
    }, [handleSelectSiteCB]);

    // Initialize the map on component mount and clean up on unmount
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

        return () => {
            map.remove();
            mapRef.current = null;
            markersLayerRef.current = null;
        };
    }, []);

    // Update markers and map view when sites or selectedSite changes
    useEffect(() => {
        const map = mapRef.current;
        const markersLayer = markersLayerRef.current;
        if (!map || !markersLayer) {
            return;
        }

        markersLayer.clearLayers();

        for (const site of sites) {
            const isSelected = selectedSite?.id === site.id;
            const marker = L.circleMarker([site.lat, site.lon], {
                radius: isSelected ? 7 : 4,
                color: isSelected ? "#ef4444" : "#38bdf8",
                fillColor: isSelected ? "#ef4444" : "#38bdf8",
                fillOpacity: isSelected ? 0.95 : 0.7,
                weight: isSelected ? 2 : 1,
            });

            marker.bindTooltip(site.name);
            marker.on("click", () => {
                handleSelectSiteRef.current(site.id);
            });
            marker.addTo(markersLayer);
        }

        if (selectedSite) {
            map.flyTo([selectedSite.lat, selectedSite.lon], SELECTED_SITE_ZOOM, {
                animate: true,
                duration: 0.4,
            });
            return;
        }

        map.setView(STOCKHOLM_CENTER, STOCKHOLM_ZOOM);
    }, [sites, selectedSite]);

    return (
        <div
            ref={mapContainerRef}
            className="h-[500px] min-w-[700px] rounded border"
            aria-label="Stockholm stop map"
        />
    );
}
