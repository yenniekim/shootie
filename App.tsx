import React, { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import CameraScreen from "./src/components/CameraScreen";
import TimelineScreen from "./src/components/TimelineScreen";
import type { Clip, AppScreen } from "./src/types";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("camera");
  const [clips, setClips] = useState<Clip[]>([]);

  const handleClipCaptured = useCallback((clip: Clip) => {
    setClips((prev) => [...prev, clip]);
  }, []);

  const handleDeleteClip = useCallback((id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <>
      <StatusBar style="light" />
      {screen === "camera" ? (
        <CameraScreen
          onClipCaptured={handleClipCaptured}
          onGoTimeline={() => setScreen("timeline")}
          clipCount={clips.length}
        />
      ) : (
        <TimelineScreen
          clips={clips}
          onDeleteClip={handleDeleteClip}
          onGoCamera={() => setScreen("camera")}
        />
      )}
    </>
  );
}
