# Market Dashboard 📈

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![React Navigation](https://img.shields.io/badge/React_Navigation-6b52ad?style=for-the-badge&logo=react-navigation&logoColor=white)](https://reactnavigation.org/)
[![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![MMKV](https://img.shields.io/badge/MMKV-000000?style=for-the-badge&logo=sqlite&logoColor=white)](https://github.com/mrousavy/react-native-mmkv)
[![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

**A high-performance, real-time financial tracking application built with React Native and Expo.**

---

## 🏗️ Technical Narrative: The 'Why'

In the development of financial applications, performance and data consistency are paramount. However, the path to a robust production build often involves deep technical hurdles. 

A significant challenge faced during this project was navigating persistent **Android native build failures**. Specifically, the integration of high-performance libraries led to complex **C++ linker errors ("undefined symbol")** within the NDK environment. This required a deep dive into native dependency resolution and environment-specific configurations.

The solution was a successful transition to a **custom EAS Build (Expo Application Services)** workflow. By leveraging advanced EAS configurations and resolving internal native module conflicts, I ensured a stable, scalable CI/CD pipeline that handles native C++ complexities without compromising the rapid iteration speed provided by the Expo ecosystem.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Core** | React Native (Expo) |
| **State / Caching** | TanStack Query (React Query) v5 |
| **Storage** | MMKV (High-speed key-value storage) |
| **Navigation** | React Navigation |
| **API / Networking** | Axios |
| **Language** | TypeScript |

---

## ✨ Key Features

*   **Real-Time Market Data**: Integration with financial APIs (Finnhub) to provide live price updates and market indicators.
*   **Persistent Portfolio Watchlist**: A personalized watchlist powered by **MMKV** for near-instant data retrieval and persistence.
*   **Optimized Data Caching**: Intelligent caching and background revalidation using **TanStack Query** to minimize API calls and ensure a smooth UX.
*   **High-Performance UI**: Responsive design tailored for mobile platforms, ensuring 60fps interactions even during heavy data updates.

---

## 🚀 Getting Started

Follow these steps to set up the project locally for development.

### Prerequisites

*   Node.js (LTS)
*   Expo Go app (for quick testing) or Android Studio/Xcode (for native builds)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lucifer123486/market-dashboard-app.git
   cd market-dashboard-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Finnhub API Key:
   ```env
   EXPO_PUBLIC_FINNHUB_API_KEY=your_api_key_here
   ```

### Running the App

*   **Development Mode:**
    ```bash
    npx expo start
    ```

*   **EAS Build (Production):**
    To trigger a custom native build:
    ```bash
    eas build --platform android
    ```

---

## 🗺️ Future Roadmap

- [ ] **User Authentication**: Secure login and multi-device profile syncing.
- [ ] **Advanced Visualization**: Implementation of interactive historical trend charts (Candlestick/Line).
- [ ] **Theming**: Dynamic Dark/Light mode toggle based on system preferences.
- [ ] **Push Notifications**: Real-time alerts for price movements and market news.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
