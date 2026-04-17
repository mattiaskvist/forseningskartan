import { ToggleButtonGroup } from "@mui/material";
import React from "react";

type FilterToggleButtonGroupProps<T> = {
    label: string;
    options: T[];
    selectedValue: T;
    onValueChange: (value: T) => void;
    renderButtonCB: (option: T) => React.ReactNode;
};

export function FilterToggleButtonGroup<T>({
    label,
    options,
    selectedValue,
    onValueChange,
    renderButtonCB,
}: FilterToggleButtonGroupProps<T>) {
    function handleChangeACB(_: React.MouseEvent<HTMLElement>, nextValue: T | null) {
        if (nextValue !== null) {
            onValueChange(nextValue);
        }
    }

    return (
        <div>
            <p className="text-xs text-slate-900">{label}</p>
            <ToggleButtonGroup
                color="primary"
                size="small"
                exclusive
                value={selectedValue}
                onChange={handleChangeACB}
            >
                <div className="mt-1 flex flex-wrap gap-1">{options.map(renderButtonCB)}</div>
            </ToggleButtonGroup>
        </div>
    );
}
