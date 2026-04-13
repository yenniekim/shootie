import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRecorder } from "../hooks/useRecorder";
import { BRAND, APP_NAME, TAGLINE } from "../theme";
import type { Clip } from "../types";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const MAX_SEC = 10;

interface Props {
  onClipCaptured: (clip: Clip) => void;
  onGoTimeline: () => void;
  clipCount: number;
}

export default function CameraScreen({
  onClipCaptured,
  onGoTimeline,
  clipCount,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const { cameraRef, isRecording, startRecording, stopRecording } =
    useRecorder();

  const [elapsed, setElapsed] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for record button
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Timer + progress bar
  useEffect(() => {
    if (isRecording) {
      setElapsed(0);
      progressAnim.setValue(0);

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: MAX_SEC * 1000,
        useNativeDriver: false,
      }).start();

      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= MAX_SEC) {
            return MAX_SEC;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
      progressAnim.setValue(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  const handlePressIn = async () => {
    const clip = await startRecording();
    if (clip) {
      onClipCaptured(clip);
    }
  };

  const handlePressOut = () => {
    stopRecording();
  };

  // Permission screen
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.brandName}>{APP_NAME}</Text>
        <Text style={styles.permissionTitle}>카메라 권한</Text>
        <Text style={styles.permissionDesc}>
          {TAGLINE}
          {"\n"}카메라 접근을 허용해주세요.
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>권한 허용</Text>
        </Pressable>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Camera Preview — full 9:16 */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="video"
      />

      {/* Top: brand mark + progress bar */}
      <View style={styles.topOverlay}>
        {!isRecording && (
          <Text style={styles.topBrand}>{APP_NAME}</Text>
        )}
        {isRecording && (
          <>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[styles.progressFill, { width: progressWidth }]}
              />
            </View>
            <Text style={styles.timer}>
              {elapsed.toFixed(1)}s / {MAX_SEC}s
            </Text>
          </>
        )}
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomOverlay}>
        {/* Clip counter */}
        {clipCount > 0 && (
          <Pressable style={styles.timelineBtn} onPress={onGoTimeline}>
            <View style={styles.clipBadge}>
              <Text style={styles.clipBadgeText}>{clipCount}</Text>
            </View>
            <Text style={styles.timelineBtnLabel}>클립</Text>
          </Pressable>
        )}

        {/* Record button */}
        <Animated.View
          style={[
            styles.recordBtnOuter,
            { transform: [{ scale: pulseAnim }] },
            isRecording && styles.recordBtnOuterActive,
          ]}
        >
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
              styles.recordBtnInner,
              isRecording && styles.recordBtnInnerActive,
            ]}
          />
        </Animated.View>

        {/* Spacer for layout balance */}
        <View style={styles.spacer} />
      </View>

      {/* Hint */}
      {!isRecording && (
        <Text style={styles.hint}>꾹 누르면 촬영 · 최대 10초</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.bg,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },

  // Permission
  permissionContainer: {
    flex: 1,
    backgroundColor: BRAND.bg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  brandName: {
    color: BRAND.accent,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 24,
  },
  permissionTitle: {
    color: BRAND.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  permissionDesc: {
    color: BRAND.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionBtn: {
    backgroundColor: BRAND.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  permissionBtnText: {
    color: BRAND.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  // Top overlay
  topOverlay: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  topBrand: {
    color: BRAND.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
    opacity: 0.7,
  },
  progressTrack: {
    width: "100%",
    height: 3,
    backgroundColor: BRAND.progressTrack,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BRAND.accent,
    borderRadius: 2,
  },
  timer: {
    color: BRAND.textSecondary,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    marginTop: 8,
  },

  // Bottom overlay
  bottomOverlay: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  timelineBtn: {
    position: "absolute",
    left: 40,
    alignItems: "center",
  },
  clipBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  clipBadgeText: {
    color: BRAND.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  timelineBtnLabel: {
    color: BRAND.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  spacer: {
    width: 60,
    position: "absolute",
    right: 40,
  },

  // Record button
  recordBtnOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordBtnOuterActive: {
    borderColor: BRAND.accent,
  },
  recordBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  recordBtnInnerActive: {
    borderRadius: 12,
    width: 36,
    height: 36,
    backgroundColor: BRAND.accent,
  },

  // Hint
  hint: {
    position: "absolute",
    bottom: 146,
    alignSelf: "center",
    color: BRAND.textHint,
    fontSize: 13,
  },
});
