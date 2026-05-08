# Surgical Tray Capture — POC

A React Native (Expo) proof-of-concept for top-down surgical tray image capture with automatic orientation enforcement and image compression.

---

## Features

- **Orientation enforcement** — Camera shutter is locked until the device is held flat (pitch ≤ 5°, roll ≤ 5°)
- **Haptic feedback** — Vibration when alignment is achieved and on capture
- **Image compression** — Captured image is automatically compressed to 50% JPEG quality
- **Side-by-side comparison** — Review original and compressed image with full metadata (resolution, format, file size, savings)
- **Save to Photos** — Save either version directly to the device photo library

---

## Requirements

- macOS with [Xcode](https://developer.apple.com/xcode/) installed
- Node.js 18+
- A physical iPhone (orientation detection does not work on the iOS Simulator)

---

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Build and run on iOS**

```bash
npx expo run:ios
```

This will compile the native iOS app and launch it on a connected iPhone or the iOS Simulator.

> The first build takes a few minutes. Subsequent runs are faster.

**3. Start the dev server only (if the app is already installed)**

```bash
npx expo start
```

---

## Permissions

The app will request the following permissions on first launch:

| Permission | Purpose |
|---|---|
| Camera | Capture top-down tray images |
| Motion & Fitness | Detect device orientation (pitch/roll) |
| Photo Library | Save captured images to Photos |

---

## Project Structure

```
app/
  _layout.tsx         # Root layout (expo-router)
  index.tsx           # App entry — state management and screen routing

components/
  Camera.tsx          # Camera viewfinder with alignment overlay and shutter
  PhotoReview.tsx     # Image review with original/compressed comparison

helpers/
  constants.ts        # Shared constants (e.g. alignment threshold)
  types.ts            # Shared TypeScript types
  utils.ts            # Utility functions (formatBytes, getPitch, getRoll, getFormat)
```

---

## Tech Stack

| | |
|---|---|
| Framework | Expo SDK 54 + React Native 0.81.5 |
| Language | TypeScript |
| Styling | NativeWind v5 (Tailwind CSS) |
| Navigation | Expo Router |
| Camera | expo-camera |
| Orientation | expo-sensors (DeviceMotion) |
| Compression | expo-image-manipulator |
| Haptics | expo-haptics |
| Media Library | expo-media-library |
