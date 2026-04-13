import * as FileSystem from "expo-file-system";
import type { Clip } from "../types";

/**
 * Merge clips using ffmpeg-kit-react-native.
 * 
 * NOTE: ffmpeg-kit requires a dev client (expo prebuild).
 * It does NOT work in Expo Go.
 */
export async function mergeClips(clips: Clip[]): Promise<string | null> {
  if (clips.length === 0) return null;

  // Single clip — just return as-is
  if (clips.length === 1) return clips[0].uri;

  try {
    const { FFmpegKit, ReturnCode } = await import("ffmpeg-kit-react-native");

    const outputPath = `${FileSystem.cacheDirectory}merged_${Date.now()}.mp4`;

    // Build concat filter
    const inputs = clips.map((c) => `-i "${c.uri}"`).join(" ");
    const filterParts = clips.map((_, i) => `[${i}:v][${i}:a]`).join("");
    const filter = `${filterParts}concat=n=${clips.length}:v=1:a=1[outv][outa]`;

    const command = `${inputs} -filter_complex "${filter}" -map "[outv]" -map "[outa]" -preset ultrafast -y "${outputPath}"`;

    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    if (ReturnCode.isSuccess(returnCode)) {
      return outputPath;
    }

    console.warn("FFmpeg merge failed with code:", returnCode);
    return null;
  } catch (err) {
    console.warn("Merge error:", err);
    return null;
  }
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function getTotalDuration(clips: Clip[]): number {
  return clips.reduce((sum, c) => sum + c.duration, 0);
}
