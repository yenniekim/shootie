export interface Clip {
  id: string;
  uri: string;
  duration: number; // ms
  createdAt: number; // timestamp
  thumbnailUri?: string;
}

export type AppScreen = "camera" | "timeline";
