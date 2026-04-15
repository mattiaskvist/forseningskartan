import { mapStyles, MapStyle } from "./StopMap";

type MapStyleSelectorProps = {
    mapStyle: MapStyle;
    setMapStyle: (style: MapStyle) => void;
};

export function MapStyleSelector({ mapStyle, setMapStyle }: MapStyleSelectorProps) {
    const isDarkMapStyle = mapStyle === "Dark";
    const containerClass = isDarkMapStyle
        ? "border-slate-200/80 bg-white/95"
        : "border-slate-900/70 bg-slate-900/80 ring-1 ring-white/20";

    function getButtonToneClass(isActive: boolean) {
        if (isDarkMapStyle) {
            return isActive
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-300 hover:text-slate-900 hover:shadow-sm";
        } else {
            return isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-200 hover:bg-white/20 hover:text-white hover:shadow-sm";
        }
    }

    function getMapStyleButtonCB(style: MapStyle) {
        function setMapStyleACB() {
            setMapStyle(style);
        }
        const isActive = mapStyle === style;
        const buttonToneClass = getButtonToneClass(isActive);

        return (
            <button
                key={style}
                onClick={setMapStyleACB}
                className={`rounded-md px-2 py-1 text-sm font-semibold transition-all ${buttonToneClass}`}
            >
                {style}
            </button>
        );
    }

    return (
        <div className={`pointer-events-auto rounded-md p-1 shadow-xl ${containerClass}`}>
            <div className="flex items-center gap-1">{mapStyles.map(getMapStyleButtonCB)}</div>
        </div>
    );
}
