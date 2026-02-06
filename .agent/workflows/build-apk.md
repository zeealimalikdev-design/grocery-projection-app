---
description: Build APK for Grocereal App
---

To build the APK and run the app on your Android device/emulator:

1. **Sync the project**:
   Run the following command in your terminal. This will build the web app and sync the files to the Android project.
   ```bash
   npm run mobile:sync
   ```

2. **Open in Android Studio**:
   Run the following command to open the native Android project in Android Studio.
   ```bash
   npm run mobile:open
   ```

3. **Build APK in Android Studio**:
   - Wait for Android Studio to finish indexing and Gradle sync.
   - Go to **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
   - Once finished, a notification will appear with a link to the folder containing the `app-debug.apk`.

4. **Run on Device**:
   - Connect your phone via USB or start an emulator.
   - Click the green **Run** button (Play icon) in the top toolbar of Android Studio.
