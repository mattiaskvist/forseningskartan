export const appStyles = ["Dark", "Light", "Classic"] as const;
export type AppStyle = (typeof appStyles)[number];
