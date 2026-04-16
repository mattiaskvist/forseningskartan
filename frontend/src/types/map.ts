export const mapStyles = ["Dark", "Light", "Classic"] as const;
export type MapStyle = (typeof mapStyles)[number];
