# RNG Analyzer Mobile App

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Backend API](#backend-api)
- [Screens](#screens)
- [Core Components](#core-components)
- [Services](#services)
- [Example Predictions](#example-predictions)
- [Prerequisites](#prerequisites)
- [Setup and Local Execution](#setup-and-local-execution)
- [How It Works](#how-it-works)
- [Important Configuration](#important-configuration)

## Overview

The RNG Analyzer Mobile App is an Expo (React Native) application that serves as a client for the [RNG Flaw Detection API](https://github.com/parthDOOM/RNG_API/tree/master). It allows users to select binary (`.bin`) files containing data from Random Number Generators (RNGs), send them to the backend API for analysis, and view the results. The app also maintains a history of past analyses and offers basic settings.

The primary purpose is to assess the health and identify potential flaws in RNG sequences by leveraging a machine learning model deployed in the backend.

## Features

* **File Selection:** Allows users to pick `.bin` files from their device.
* **API Interaction:** Sends the selected file to the RNG Flaw Detection API for analysis.
* **Result Display:** Clearly presents the analysis results, including:
    * Predicted RNG status (e.g., "Healthy", "Biased", "Periodic").
    * Confidence score for the prediction.
    * Detailed explanations and recommendations for detected flaws.
    * Full probability distribution across all possible classes.
* **Analysis History:** Stores and displays a list of past analyses for easy reference.
* **Settings:** Provides options to manage app behavior (e.g., auto-save results).
* **User-Friendly Interface:** Designed with clear navigation and informative components.

## Technology Stack

* **Expo SDK:** Framework for building universal React applications.
* **React Native:** For building native mobile applications using JavaScript and React.
* **TypeScript:** For type safety and improved developer experience.
* **Expo Router:** For file-system based routing and navigation.
* **Lucide React Native:** For icons.
* **AsyncStorage:** For persisting analysis history locally on the device.

## Backend API

This mobile application relies on a separate backend API, the **RNG Flaw Detection API**.
* **Purpose:** The API receives a binary file, extracts statistical features, and uses a pre-trained machine learning model (TensorFlow/Keras) to classify the RNG sequence's health or flaw type.
* **Core Functionality:**
    1.  Accepts `.bin` file uploads.
    2.  Performs comprehensive statistical feature extraction (mean, standard deviation, entropy, chi-squared, KS-test, FFT, PSD, etc.).
    3.  Scales features and feeds them to a neural network.
    4.  Returns a prediction (e.g., "Healthy", "Biased," "Periodic") along with class probabilities.
* **API Endpoint used by the app:** `POST /predict_bin/`

## [Link to APK of application](https://drive.google.com/file/d/1QRY0aoircIA8VMbsleJYxApd4XujRfkD/view?usp=sharing)

## [Demonstration Video for App](https://drive.google.com/file/d/1lrACEeDUCvn1KXHEUr6Zh719v9X9TNw8/view?usp=sharing)

## Screens

The app is organized into the following main screens, managed via a tab navigator:

1.  **Analyzer Screen (`app/(tabs)/index.tsx`)**
    * Allows users to select a `.bin` file.
    * Displays information about the selected file (name, size).
    * Initiates the analysis by sending the file to the backend API.
    * Shows a loading indicator during analysis.
    * Presents the results using the `AnalysisResultCard` component.
    * Handles and displays errors if they occur during the process.
    * Allows users to start a new analysis.

2.  **History Screen (`app/(tabs)/history.tsx`)**
    * Displays a list of previously analyzed files and their results.
    * Shows the filename, timestamp, predicted status, and confidence for each entry.
    * Allows users to clear the entire analysis history.
    * Provides an empty state message if no history is available.

3.  **Settings Screen (`app/(tabs)/settings.tsx`)**
    * Provides options to configure the app, such as:
        * Toggling auto-save of results to history.
        * Toggling the display of technical details in results (future enhancement).
    * Includes links to the API website, help/documentation (placeholder), and an "About" section (placeholder).
    * Displays the app version.

## Core Components

* **`AnalysisResultCard.tsx`**: A crucial component responsible for rendering the detailed analysis results received from the API. It displays the predicted class, confidence, vulnerability status, explanations, and recommendations in a structured and user-friendly card format.
* **`Header.tsx`**: A reusable header component displayed at the top of screens, showing the screen title and an optional back button. (Note: Currently, the tab headers provided by Expo Router are primarily used).
* **`EmptyState.tsx`**: A component used to display a message when there is no data to show, for example, in the History screen when no analyses have been saved yet.
* **Layouts (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`)**: Manage the overall structure, font loading, splash screen, and tab navigation for the application.

## Services

* **`services/api.ts`**:
    * Handles all communication with the backend RNG Flaw Detection API.
    * Contains the `analyzeFileWithApi` function, which takes a file asset, constructs a `FormData` object, and sends it to the API's `/predict_bin/` endpoint.
    * Manages API response parsing and error handling.
    * **Crucially, this file contains the `API_URL` constant that must be configured to point to your deployed backend API.**
* **`services/historyService.ts`**:
    * Manages the storage and retrieval of analysis history using `AsyncStorage`.
    * Provides functions to `saveAnalysisToHistory`, `getAnalysisHistory`, and `clearHistory`.
    * Defines the `HistoryItem` type for structuring saved data.


### Model Architecture
![Example Prediction on TRNG Data](/images/model.jpg)

## Example Predictions

Below are examples of how the application displays predictions for different types of RNG data.

### Healthy TRNG Data Example

![Example Prediction on TRNG Data](/images/trng.jpg)

### Flawed Data Example

![Example Prediction on Flawed Data](/images/flawed.jpg)

## Prerequisites

Before you begin, ensure you have the following installed:
* Node.js (LTS version recommended)
* npm (Node Package Manager) or Yarn
* Expo CLI: `npm install -g expo-cli`
* A running instance of the [RNG Flaw Detection API](https://github.com/parthDOOM/RNG_API/tree/master) accessible via a URL.

## Setup and Local Execution

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-expo-app-directory>
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Configure the API URL:**
    * Open the file `services/api.ts`.
    * Locate the `API_URL` constant.
    * **Modify this URL to point to your running instance of the RNG Flaw Detection API.** For example:
        ```typescript
        // const API_URL = '[https://rng-api.onrender.com/predict_bin/](https://rng-api.onrender.com/predict_bin/)'; // Example
        const API_URL = 'http://localhost:8000/predict_bin/'; // For local API
        ```

4.  **Run the Application:**
    ```bash
    npx expo start
    ```
    This will start the Metro Bundler. You can then run the app on:
    * An Android emulator/device (press `a` in the terminal)
    * An iOS simulator/device (press `i` in the terminal)
    * In a web browser (press `w` in the terminal) - Note: Full compatibility, especially file system access, is best on native devices.

## How It Works

1.  **File Selection:** On the "Analyzer" screen, the user taps "Select .bin File" to open the device's document picker.
2.  **File Upload:** The user selects a `.bin` file. The app prepares this file for upload.
3.  **API Request:** The `analyzeFileWithApi` service is called. It sends the selected file as `multipart/form-data` to the configured `API_URL` (the `/predict_bin/` endpoint of the backend).
4.  **Backend Processing:** The RNG Flaw Detection API processes the file:
    * Reads the binary data.
    * Extracts statistical features.
    * Uses its machine learning model to predict the RNG flaw type.
    * Returns a JSON response containing the `predicted_class_name`, `probabilities`, and other details.
5.  **Display Results:** The Expo app receives the JSON response. The `AnalysisResultCard` component then displays this information in a structured manner.
6.  **Save to History:** If "auto-save results" is enabled (default), the analysis result (filename, timestamp, predicted class, and primary probability) is saved to the device's local storage via `historyService.ts`.
7.  **View History:** The user can navigate to the "History" screen to view a list of all saved analyses.

## Important Configuration

### API URL

The most critical configuration step is setting the `API_URL` in `for_gemini/services/api.ts`. This URL **must** point to the correct address of your deployed RNG Flaw Detection API. If this is not configured correctly, the app will not be able to analyze any files.

```typescript
// In for_gemini/services/api.ts
// Make sure this URL is correct!
const API_URL = 'YOUR_DEPLOYED_API_ENDPOINT/predict_bin/';