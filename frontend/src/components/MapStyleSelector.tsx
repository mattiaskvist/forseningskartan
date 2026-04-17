import { AppStyle, appStyles } from "../types/appStyle";

type MapStyleSelectorProps = {
    appStyle: AppStyle;
    setAppStyle: (style: AppStyle) => void;
};

export function MapStyleSelector({ appStyle, setAppStyle }: MapStyleSelectorProps) {
    function getMapStyleButtonCB(style: AppStyle) {
        function setMapStyleACB() {
            setAppStyle(style);
        }
        const isActive = appStyle === style;

        return (
            <button
                key={style}
                onClick={setMapStyleACB}
                className={`style-selector-button ${isActive ? "style-selector-button-active" : ""}`}
            >
                {style}
            </button>
        );
    }

    return (
        <div className="style-selector">
            <div className="style-selector-buttons">{appStyles.map(getMapStyleButtonCB)}</div>
        </div>
    );
}
