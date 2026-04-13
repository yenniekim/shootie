# Shootie 슈티

> 누구나 브이로거

누구나 브이로거가 될 수 있는 세로 영상 앱.

## 기능

- **카메라 촬영** — 버튼 꾹 누르는 동안 촬영 (최대 10초)
- **타임라인** — 촬영 순서대로 클립 나열, 탭하여 미리보기
- **병합 & 저장** — 전체 클립을 하나의 MP4로 병합 후 갤러리 저장
- **공유** — 병합된 영상 바로 공유
- 갤러리 접근 / 필터 / BGM / 자막 없음. 심플하게.

## 기술 스택

- Expo SDK 51 · TypeScript
- expo-camera (CameraView)
- expo-av (Video preview)
- ffmpeg-kit-react-native (클립 병합)
- expo-sharing / expo-media-library

## 브랜드

- **이름**: Shootie (슈티)
- **의미**: Shoot(촬영하다) + ie
- **액센트 컬러**: #FF6B4A (Warm Coral)
- **배경**: #0A0A0A (Deep Black)

## 설치 및 실행

```bash
npm install

# ⚠️ ffmpeg-kit은 네이티브 모듈 → Expo Go 불가, dev client 필요
npx expo prebuild
npx expo run:ios    # 또는
npx expo run:android
```

## 프로젝트 구조

```
shootie/
├── App.tsx                     # 앱 진입점, 화면 전환
├── app.config.ts               # Expo 설정 (Shootie)
├── package.json
├── tsconfig.json
└── src/
    ├── theme.ts                # 브랜드 컬러 & 상수
    ├── types/index.ts          # Clip, AppScreen 타입
    ├── hooks/useRecorder.ts    # 카메라 녹화 로직
    ├── utils/merge.ts          # ffmpeg 병합 + 유틸
    └── components/
        ├── CameraScreen.tsx    # 촬영 화면
        └── TimelineScreen.tsx  # 타임라인 + 저장/공유
```
