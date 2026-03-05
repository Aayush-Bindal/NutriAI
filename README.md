# NutriAI

AI-powered calorie and nutrition tracker built with React Native and Google Gemini. Describe what you ate in plain language and get instant nutritional analysis with personalized daily goals.

Built with a focus on **Indian cuisine** — understands roti, dal, idli, dosa, poha, rajma chawal, and more — while supporting global foods too.

## Features

- **AI Meal Logging** — Type what you ate in natural language. Gemini AI returns calories, protein, carbs, fat, fiber, and a friendly nutrition tip.
- **Personalized Goals** — Calorie and macro targets calculated from your age, gender, weight, height, fitness goal, and activity level using the Mifflin-St Jeor equation.
- **Dashboard** — Animated calorie ring, macro progress bars (carbs, protein, fat, fiber), date navigation, and meal history at a glance.
- **Weight Tracking** — Log weight entries over time, view progress on an SVG graph, track BMI with color-coded categories.
- **Backup & Restore** — Export all your data as a JSON file and restore it on any device. API key is never included in backups.
- **Secure by Default** — Your Gemini API key is stored in the device's secure enclave via `expo-secure-store`. All data stays on your device.
- **Haptic Feedback** — Tactile responses on interactions throughout the app.

## Why NutriAI?

Most calorie tracking apps are slow, cluttered, and require manually searching through large food databases. NutriAI takes a different approach.

**Natural Language Logging**
Just describe what you ate — no scrolling through long food lists. The AI understands real meals like "2 roti with dal and sabzi".

**No Ads, No Tracking**
NutriAI is designed as a clean experience. No ads, no trackers, and no unnecessary data collection.

**Your Data Stays On Your Device**
All user data (meals, profile, weight logs) is stored locally on your phone. Nothing is uploaded to external servers. Even backups are exported manually as JSON files that you control.

**Works With Real Food**
Unlike many trackers focused on packaged Western foods, NutriAI understands common Indian meals such as roti, dal, poha, dosa, rajma chawal, and more.

**No Locked Analytics**
Most nutrition apps hide useful insights behind subscriptions. NutriAI keeps dashboards, weight tracking, and macro analytics fully accessible.

**Built for Simplicity**
The goal is to make calorie tracking frictionless: type your meal, get instant analysis, and move on with your day.

## Tech Stack

| Layer        | Technology                                          |
| ------------ | --------------------------------------------------- |
| Framework    | React Native 0.81 + Expo SDK 54                     |
| Routing      | Expo Router (file-based)                            |
| AI           | Google Gemini API (`gemini-3.1-flash-lite-preview`) |
| State        | React Context (ProfileContext, MealContext)         |
| Storage      | AsyncStorage + SecureStore                          |
| Animations   | React Native Reanimated 4, Animated API             |
| Charts       | react-native-svg (Polyline, Circle)                 |
| Architecture | React Native New Architecture + React Compiler      |

## Project Structure

```
nutriai/
├── app/                    # Screens (file-based routing)
│   ├── _layout.jsx         # Root layout, providers, onboarding gate
│   ├── index.jsx           # Dashboard
│   ├── log.jsx             # Log meal (modal)
│   └── profile.jsx         # Settings, weight, backup (modal)
│
├── components/             # UI components
│   ├── Onboarding.jsx      # 6-step onboarding wizard
│   ├── CalorieHeroCard.jsx  # Calorie display card
│   ├── CalorieRing.jsx     # Animated SVG progress ring
│   ├── MacrosRow.jsx       # 2x2 macro nutrient grid
│   ├── DashboardHeader.jsx # Greeting header
│   ├── DateStrip.jsx       # Horizontal date selector
│   ├── MealsList.jsx       # Meal sections container
│   ├── MealSection.jsx     # Individual meal type card
│   ├── AiTip.jsx           # AI tip badge
│   └── LogMealButton.jsx   # Floating action button
│
├── context/                # State management
│   ├── ProfileContext.jsx  # Profile, goals, weight, backup/restore
│   └── MealContext.jsx     # Daily meal data
│
├── constants/              # App constants
│   ├── theme.js            # Colors, responsive scaling, shadows
│   └── gemini.js           # Gemini API integration
│
└── assets/images/          # App icon
```

## Download

Grab the latest APK from [GitHub Releases](../../releases/latest) and install it directly on your Android device — no build tools needed.

1. Go to the [Releases](../../releases) page
2. Download the `.apk` file from the latest release
3. Open it on your Android phone and follow the install prompt
4. You may need to enable **Install from unknown sources** in your device settings

> You'll still need your own Gemini API key to use AI meal logging. Get one for free at [aistudio.google.com](https://aistudio.google.com/).

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/) (free tier available)

### Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/nutriai.git
cd nutriai

# Install dependencies
npm install

# Start the dev server
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator / `i` for iOS simulator.

### Get Your API Key

1. Go to [aistudio.google.com](https://aistudio.google.com/)
2. Create a free API key
3. Enter it during onboarding or in the Settings page

## How It Works

1. **Onboarding** — Enter your details (name, age, gender, weight, height, goal, activity level). The app calculates your daily calorie and macro targets.
2. **Log a meal** — Tap the log button and describe your meal: _"2 roti with dal makhani and raita"_. Gemini AI analyzes it and returns a full nutritional breakdown.
3. **Track progress** — View your daily intake on the dashboard. Log your weight over time and watch the progress graph.
4. **Backup your data** — Export everything as a JSON file from Settings. Restore it anytime, even during onboarding on a new device.

## Nutrition Calculation

- **BMR**: Mifflin-St Jeor equation
- **TDEE**: BMR × activity multiplier (1.2–1.725)
- **Calorie goal**: TDEE adjusted for goal (−400 lose, +300 gain)
- **Protein**: 1.6–2.0 g/kg body weight based on goal
- **Fat**: 25% of calorie goal
- **Carbs**: Remaining calories after protein and fat
- **Fiber**: 38g (male) / 25g (female) per dietary guidelines

## License

This project is for personal/educational use.
