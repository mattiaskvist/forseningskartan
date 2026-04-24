import { Typography, ToggleButtonGroup } from "@mui/material";
import React from "react";

type FilterToggleButtonGroupProps<T> = {
    label?: string;
    options: T[];
    selectedValue: T | null;
    onValueChange: (value: T) => void;
    renderButtonCB: (option: T) => React.ReactNode;
    allowDeselect?: boolean;
    onDeselect?: () => void;
};

export function FilterToggleButtonGroup<T>({
    label,
    options,
    selectedValue,
    onValueChange,
    renderButtonCB,
    allowDeselect = false,
    onDeselect,
}: FilterToggleButtonGroupProps<T>) {
    function handleChangeACB(_: React.MouseEvent<HTMLElement>, nextValue: T | null) {
        if (nextValue === null) {
            if (allowDeselect && onDeselect) {
                onDeselect();
            }
            return;
        }
        onValueChange(nextValue);
    }

    return (
        <div>
            {label && (
                <Typography sx={{ fontSize: "0.75rem", color: "text.primary" }}>{label}</Typography>
            )}
            <ToggleButtonGroup
                color="primary"
                size="small"
                exclusive
                value={selectedValue}
                onChange={handleChangeACB}
            >
                {options.map(renderButtonCB)}
            </ToggleButtonGroup>
        </div>
    );
}
