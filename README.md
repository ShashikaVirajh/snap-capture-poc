# Surgical Tray Capture — POC

A React Native (Expo) proof-of-concept for top-down surgical tray image capture with automatic orientation enforcement, image compression, and side-by-side comparison review.

---

## Overview

This POC validates the Expo + React Native stack for a clinical top-down capture workflow. The goal was to capture a surgical tray image from directly above, automatically compress it, and present a clear summary of the capture to the user.

### Original Requirements

- Detect when the device is held flat (top-down orientation)
- Lock the camera shutter until orientation is correct
- Capture the image and compress it automatically
- Show original and compressed image details (size, resolution, format)

### What Was Built

All original requirements are met, plus additional polish:

| Feature | Details |
|---|---|
| Orientation detection | DeviceMotion pitch + roll, both must be within ±5° |
| Alignment feedback | Green/red corner brackets + status pill + haptic vibration on alignment |
| Camera capture | Shutter locked until aligned, haptic on capture, full-screen compressing state while processing |
| Auto compression | Captured as PNG (lossless), compressed once to JPEG quality 50 — no double lossy compression |
| Side-by-side review | Original and compressed shown together, tap either to fullscreen |
| Capture summary | 6-field details grid — ORIGINAL · COMPRESSED · SAVED / RESOLUTION · FORMAT (PNG → JPEG) · CAPTURED |
| Storage saved card | Highlights MB saved and % reduction |
| Save to Photos | Always saves the compressed version |
| Dark clinical UI | Monochrome dark theme with blue accent, consistent across all screens |

---

## Requirements

- Node.js 18+
- [Expo Go](https://expo.dev/go) installed on a physical iPhone
- A physical iPhone is required — DeviceMotion (orientation detection) does not work on the iOS Simulator

---

## Setup

**1. Clone the repo**

```bash
git clone <repo-url>
cd snap-capture-poc
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the dev server**

```bash
npx expo start
```

**4. Open in Expo Go**

A QR code will appear in the terminal. Open the iPhone camera app, point it at the QR code, and tap the Expo Go link. The app will open instantly — no Xcode or build step required.

---

## Troubleshooting

If you encounter Metro bundler errors or module resolution issues, do a clean install:

```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

---

## Device Settings

### Haptic feedback

For haptics to work, both must be enabled on the iPhone:

**Settings → Sounds & Haptics**
- System Haptics → **ON**

**Settings → Accessibility → Touch**
- Vibration → **ON**

### Permissions

The app will request the following permissions on first launch:

| Permission | Purpose |
|---|---|
| Camera | Capture top-down tray images |
| Motion & Fitness | Detect device orientation (pitch/roll) via DeviceMotion |
| Photo Library | Save compressed image to Photos |

---

## How to Use

1. Tap **OPEN CAMERA** on the landing screen
2. Hold the phone directly above the surgical tray, face down
3. Watch the pitch and roll indicators — both must reach green (within ±5°)
4. A haptic vibration confirms alignment — the shutter unlocks automatically
5. Tap the shutter button to capture
6. Review the **CAPTURE SUMMARY** screen:
   - Tap either image to view fullscreen
   - Check the details grid and storage saved card
7. Tap **SAVE COMPRESSED** to save to Photos, or **RETAKE** to go back to camera
8. Tap **✕** to discard and return to the landing screen

---

## Project Structure

```
app/
  _layout.tsx                        # Root layout (expo-router)
  index.tsx                          # App root — state management and component routing

components/
  Landing.tsx                        # Entry screen — app intro and open camera button
  Capture.tsx                        # Camera viewfinder, orientation detection, alignment overlay
  Review.tsx                         # Capture summary — side-by-side images, details, save actions
  shared/
    FullscreenImageModal.tsx         # Reusable fullscreen image viewer modal

helpers/
  constants.ts        # Shared constants (ORIENTATION_THRESHOLD)
  types.ts            # Shared TypeScript types (TCompressedPhoto, TImageType)
  utils.ts            # Utility functions (isPitchAligned, isRollAligned, isDeviceAligned,
                      #   getLargestPictureSize, getPitch, getRoll, formatFileSize, getImageFormat)
```

---

## Tech Stack

| | |
|---|---|
| Framework | Expo SDK 54 + React Native 0.81.5 |
| Language | TypeScript |
| Styling | NativeWind v5 (Tailwind CSS 4) |
| Navigation | Expo Router |
| Camera | expo-camera |
| Orientation | expo-sensors (DeviceMotion) |
| Compression | expo-image-manipulator |
| Haptics | expo-haptics |
| Media Library | expo-media-library |
| Icons | @expo/vector-icons (Ionicons) |

---

## Future Improvements

| Improvement | Details |
|---|---|
| Auto capture | Automatically trigger shutter when device is aligned — no manual tap needed |
| Configurable threshold | Allow alignment tolerance to be adjusted beyond the current ±5° |
| Configurable compression | Expose JPEG quality setting instead of hardcoded 50% |
| Unit tests | Utility functions are already extracted and ready for test coverage |

---

## Notes

- The camera captures in PNG (lossless) first, then compresses once to JPEG quality 50 — this avoids double lossy compression that would occur if capturing JPEG and re-encoding to JPEG
- Compression reduces file size significantly (typically 40–70%) without a noticeable visual difference at normal viewing distances
- Resolution is preserved — only the file size changes, not the pixel dimensions
- The app is portrait-locked; orientation detection uses raw accelerometer data via DeviceMotion
