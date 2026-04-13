import { useRef, useState, useCallback } from "react";
import { CameraView } from "expo-camera";
import type { Clip } from "../types";

const MAX_DURATION_MS = 10_000;

export function useRecorder() {
  const cameraRef = useRef<CameraView>(null);
  const [isRecording, setIsRecording] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async (): Promise<Clip | null> => {
    if (!cameraRef.current || isRecording) return null;

    setIsRecording(true);
    startTimeRef.current = Date.now();

    // Auto-stop after MAX_DURATION
    const stopPromise = new Promise<void>((resolve) => {
      timerRef.current = setTimeout(() => {
        resolve();
      }, MAX_DURATION_MS);
    });

    try {
      const recordPromise = cameraRef.current.recordAsync({
        maxDuration: MAX_DURATION_MS / 1000,
      });

      // recordAsync resolves when recording stops
      const video = await recordPromise;

      if (!video?.uri) return null;

      const duration = Date.now() - startTimeRef.current;

      const clip: Clip = {
        id: `clip_${Date.now()}`,
        uri: video.uri,
        duration: Math.min(duration, MAX_DURATION_MS),
        createdAt: Date.now(),
      };

      return clip;
    } catch (err) {
      console.warn("Recording error:", err);
      return null;
    } finally {
      setIsRecording(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [isRecording]);

  return {
    cameraRef,
    isRecording,
    startRecording,
    stopRecording,
  };
}
