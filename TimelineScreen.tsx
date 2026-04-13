import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import type { Clip } from "../types";
import { mergeClips, formatDuration, getTotalDuration } from "../utils/merge";
import { BRAND, APP_NAME } from "../theme";

const { width: SCREEN_W } = Dimensions.get("window");

interface Props {
  clips: Clip[];
  onDeleteClip: (id: string) => void;
  onGoCamera: () => void;
}

export default function TimelineScreen({
  clips,
  onDeleteClip,
  onGoCamera,
}: Props) {
  const [merging, setMerging] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  const handleMergeAndSave = async () => {
    if (clips.length === 0) return;

    setMerging(true);
    try {
      const outputUri = await mergeClips(clips);
      if (!outputUri) {
        Alert.alert("오류", "병합에 실패했습니다.");
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "권한 필요",
          "저장을 위해 미디어 라이브러리 권한이 필요합니다."
        );
        return;
      }

      await MediaLibrary.saveToLibraryAsync(outputUri);
      Alert.alert("저장 완료 ✓", "갤러리에 저장되었습니다.");
    } catch (err) {
      console.warn(err);
      Alert.alert("오류", "저장 중 문제가 발생했습니다.");
    } finally {
      setMerging(false);
    }
  };

  const handleShare = async () => {
    if (clips.length === 0) return;

    setMerging(true);
    try {
      const outputUri = await mergeClips(clips);
      if (!outputUri) {
        Alert.alert("오류", "병합에 실패했습니다.");
        return;
      }

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("공유 불가", "이 기기에서는 공유를 사용할 수 없습니다.");
        return;
      }

      await Sharing.shareAsync(outputUri, {
        mimeType: "video/mp4",
        dialogTitle: `${APP_NAME}로 만든 영상`,
      });
    } catch (err) {
      console.warn(err);
    } finally {
      setMerging(false);
    }
  };

  const handleDeleteClip = (id: string) => {
    Alert.alert("클립 삭제", "이 클립을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          if (previewUri) {
            const clip = clips.find((c) => c.id === id);
            if (clip?.uri === previewUri) setPreviewUri(null);
          }
          onDeleteClip(id);
        },
      },
    ]);
  };

  const totalDuration = getTotalDuration(clips);

  const renderClip = ({ item, index }: { item: Clip; index: number }) => (
    <Pressable
      style={[
        styles.clipItem,
        previewUri === item.uri && styles.clipItemActive,
      ]}
      onPress={() => setPreviewUri(item.uri)}
      onLongPress={() => handleDeleteClip(item.id)}
    >
      <View style={styles.clipIndex}>
        <Text style={styles.clipIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.clipInfo}>
        <Text style={styles.clipDuration}>
          {formatDuration(item.duration)}
        </Text>
      </View>
      <View style={styles.clipBar}>
        <View
          style={[
            styles.clipBarFill,
            { width: `${(item.duration / 10000) * 100}%` },
          ]}
        />
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onGoCamera} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← 촬영</Text>
        </Pressable>
        <Text style={styles.headerTitle}>타임라인</Text>
        <Text style={styles.headerSub}>
          {clips.length}개 · {formatDuration(totalDuration)}
        </Text>
      </View>

      {/* Video Preview */}
      <View style={styles.previewContainer}>
        {previewUri ? (
          <Video
            ref={videoRef}
            source={{ uri: previewUri }}
            style={styles.preview}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            useNativeControls={false}
          />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderText}>
              클립을 탭하여 미리보기
            </Text>
          </View>
        )}
      </View>

      {/* Clip List */}
      <View style={styles.listContainer}>
        {clips.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>촬영된 클립이 없습니다</Text>
            <Pressable style={styles.emptyBtn} onPress={onGoCamera}>
              <Text style={styles.emptyBtnText}>촬영하기</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={clips}
            renderItem={renderClip}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Bottom Actions */}
      {clips.length > 0 && (
        <View style={styles.actions}>
          {merging ? (
            <View style={styles.mergingRow}>
              <ActivityIndicator color={BRAND.accent} />
              <Text style={styles.mergingText}>병합 중...</Text>
            </View>
          ) : (
            <>
              <Pressable
                style={[styles.actionBtn, styles.saveBtn]}
                onPress={handleMergeAndSave}
              >
                <Text style={[styles.actionBtnText, { color: BRAND.bg }]}>
                  저장
                </Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.shareBtn]}
                onPress={handleShare}
              >
                <Text
                  style={[styles.actionBtnText, { color: BRAND.textPrimary }]}
                >
                  공유
                </Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.bg,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    color: BRAND.textSecondary,
    fontSize: 15,
  },
  headerTitle: {
    color: BRAND.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSub: {
    color: BRAND.textTertiary,
    fontSize: 14,
    marginTop: 4,
  },

  // Preview
  previewContainer: {
    width: SCREEN_W,
    height: SCREEN_W * (9 / 16),
    backgroundColor: "#111",
  },
  preview: {
    flex: 1,
  },
  previewPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewPlaceholderText: {
    color: BRAND.textHint,
    fontSize: 14,
  },

  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  clipItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  clipItemActive: {
    backgroundColor: BRAND.bgCardActive,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  clipIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,107,74,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clipIndexText: {
    color: BRAND.accent,
    fontSize: 13,
    fontWeight: "600",
  },
  clipInfo: {
    marginRight: 12,
    width: 48,
  },
  clipDuration: {
    color: BRAND.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  clipBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  clipBarFill: {
    height: "100%",
    backgroundColor: BRAND.accent,
    borderRadius: 2,
  },

  // Empty
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: BRAND.textTertiary,
    fontSize: 15,
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: BRAND.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyBtnText: {
    color: BRAND.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  // Actions
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: BRAND.accent,
  },
  shareBtn: {
    backgroundColor: BRAND.btnMuted,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  mergingRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  mergingText: {
    color: BRAND.textSecondary,
    fontSize: 14,
  },
});
