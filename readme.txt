
========================================================================
                               NAV-LORE
              Your AI-Powered Historical Tour Assistant
========================================================================

NavLore is a cross-platform mobile and web application designed to fill
the 'context gap' in modern navigation. It transforms a standard map
interface into a charismatic digital tour guide using the Gemini 2.5
Flash generative AI model.

------------------------------------------------------------------------
1. PREREQUISITES
------------------------------------------------------------------------
Before running the project, ensure you have the following installed:
- Node.js (LTS recommended): https://nodejs.org/
- npm (installed with Node) or yarn
- Expo Go (on your mobile device for testing):
  Available on iOS App Store and Android Play Store.

------------------------------------------------------------------------
2. INSTALLATION
------------------------------------------------------------------------
1. Download or Clone the project folder.
2. Open your terminal/command prompt.
3. Navigate to the project root directory:
   cd path/to/NavLore
4. Install the required dependencies:
   npm install

------------------------------------------------------------------------
3. CONFIGURATION (CRITICAL)
------------------------------------------------------------------------
For security, the current codebase contains placeholder values or
'false messages' for the API keys. You MUST update these to use the app.

A. Gemini AI API Key:
   - Go to 'screens/screens/' or wherever your AI service resides.
   - Look for the variable 'GEMINI_API_KEY'.
   - Replace the existing placeholder/false message with your real key 
     from the Google AI Studio (https://aistudio.google.com/).
   - Alternatively, create a '.env' file in the root directory:
     EXPO_PUBLIC_GEMINI_API_KEY=your_actual_key_here

B. Firebase Configuration:
   - Open 'config/firebaseConfig.js'.
   - Update the 'firebaseConfig' object with your project credentials 
     from the Firebase Console (https://console.firebase.google.com/).

C. Google Maps:
   - Ensure your Google Maps API key is enabled in the Google Cloud 
     Console for both Android and iOS platforms.

------------------------------------------------------------------------
4. RUNNING THE APPLICATION
------------------------------------------------------------------------
1. In the terminal, run:
   npx expo start

2. To view the application:
   - Press 'w' to open in your Web Browser.
   - Press 'a' to open in an Android Emulator.
   - Press 'i' to open in an iOS Simulator (Mac only).
   - Scan the QR code with the 'Expo Go' app on your phone to see it live.

------------------------------------------------------------------------
5. PROJECT STRUCTURE OVERVIEW
------------------------------------------------------------------------
- app/            : Expo Router files (Tabs, Auth, Layout)
- components/     : Reusable UI elements (Text, Views, Icons)
- config/         : Firebase and System configurations
- screens/screens/: Core application screens (Home, Map, Login, etc.)
- navigation/     : Custom navigation logic

------------------------------------------------------------------------
6. TROUBLESHOOTING
------------------------------------------------------------------------
- "The archives are silent": This means your Gemini API key is missing,
  invalid, or has reached its rate limit.
- Dependency errors: Delete the 'node_modules' folder and run 
  'npm install' again.
- Map not displaying: Check your internet connection and verify your 
  Google Maps API key permissions in the Cloud Console.

------------------------------------------------------------------------
7. LICENSE & CONTRIBUTIONS
------------------------------------------------------------------------
Feel free to contribute to this project by submitting a Pull Request 
on GitHub. 
========================================================================
