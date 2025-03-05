# React Native Installation Guide

## Prerequisites

Ensure you have the following installed:

- **Node.js** (LTS version) → [Download](https://nodejs.org/)
- **Watchman** (for macOS) → `brew install watchman`
- **Java Development Kit (JDK)** (for Android) → [Download JDK](https://adoptium.net/)
- **Android Studio** (for Android) → [Download](https://developer.android.com/studio)
- **Xcode** (for iOS, macOS only) → Install via App Store

## Installation Steps

### 1. Install React Native CLI

```sh
npm install -g react-native-cli
```

### 2. Create a New Project

```sh
npx react-native init MyApp
cd MyApp
```

### 3. Run on Android Emulator or Device

#### Start Metro Bundler

```sh
npx react-native start
```

#### Run on Android

```sh
npx react-native run-android
```

### 4. Run on iOS Simulator (macOS only)

```sh
npx react-native run-ios
```

## Android Setup

1. Open **Android Studio** and install:
   - Android SDK (API Level 31+)
   - Android Emulator
   - Platform Tools
2. Set environment variables (Windows):
   ```sh
   set ANDROID_HOME=C:\Users\YourUser\AppData\Local\Android\Sdk
   set PATH=%PATH%;%ANDROID_HOME%\platform-tools
   ```
3. Enable **USB Debugging** on your Android device.

## iOS Setup (Mac Only)

1. Install CocoaPods:
   ```sh
   sudo gem install cocoapods
   cd ios && pod install
   ```
2. Open `ios/MyApp.xcworkspace` in Xcode.
3. Ensure an iOS Simulator or device is selected, then build and run.

## Common Issues & Fixes

### Metro Bundler Not Starting?

```sh
npx react-native start --reset-cache
```

### Android Build Issues?

```sh
cd android && ./gradlew clean
```

### iOS Build Issues?

```sh
cd ios && pod install --repo-update
```

## Additional Resources

- React Native Docs: [https://reactnative.dev/docs/getting-started](https://reactnative.dev/docs/getting-started)
- Troubleshooting: [https://reactnative.dev/docs/troubleshooting](https://reactnative.dev/docs/troubleshooting)
