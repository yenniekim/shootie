import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Shootie",
  slug: "shootie",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    backgroundColor: "#0A0A0A",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.shootie.app",
    infoPlist: {
      NSCameraUsageDescription:
        "Shootie가 브이로그를 촬영하기 위해 카메라 접근이 필요합니다.",
      NSMicrophoneUsageDescription:
        "Shootie가 오디오를 녹음하기 위해 마이크 접근이 필요합니다.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0A0A0A",
    },
    package: "com.shootie.app",
    permissions: ["CAMERA", "RECORD_AUDIO"],
  },
  plugins: [
    [
      "expo-camera",
      {
        cameraPermission:
          "Shootie가 브이로그를 촬영하기 위해 카메라 접근이 필요합니다.",
        microphonePermission:
          "Shootie가 오디오를 녹음하기 위해 마이크 접근이 필요합니다.",
        recordAudioAndroid: true,
      },
    ],
  ],
};

export default config;
