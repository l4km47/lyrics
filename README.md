# Audio Lyrics Visualizer

This project is an audio-reactive lyrics visualizer built with Vue 3 and Vite. It utilizes the Web Audio API for real-time audio analysis and provides a creative visualization of audio frequencies while displaying synchronized lyrics.

## Features

- **Audio Playback**: Users can upload and control audio playback (play, pause).
- **Real-Time Audio Analysis**: Utilizes the Web Audio API to analyze audio data and visualize it.
- **Synced Lyrics Rendering**: Displays lyrics with real-time highlighting based on audio playback position.
- **Creative Visualizations**: Renders dynamic visualizations that react to audio frequency data.

## Project Structure

```
audio-lyrics-visualizer
├── src
│   ├── assets                # Static assets (images, audio files)
│   ├── components            # Vue components
│   │   ├── AudioPlayer.vue       # Audio playback controls
│   │   ├── LyricsDisplay.vue     # Lyrics display with highlighting
│   │   ├── LyricsVisualizer.vue  # Lyrics visualization synced with audio
│   │   ├── Visualizer.vue        # Canvas visualizations
│   │   ├── AudioAnalyzer.vue     # Audio analysis using Web Audio API
│   │   └── BackDrop.vue          # Visual backdrop component
│   ├── composables           # Composable functions
│   │   └── useAudioAnalysis.ts   # Audio analysis logic
│   ├── views                 # Application views
│   │   └── HomeView.vue          # Main layout integrating components
│   ├── App.vue               # Root component
│   ├── main.js               # JS entry point of the application
│   ├── main.ts               # TS entry point of the application
│   └── types                 # Type definitions
│       └── index.ts              # Types for audio analysis and lyrics
├── public
│   ├── audio.mp3                 # Example audio file
│   ├── favicon.ico               # App favicon
│   ├── index.html                # Public HTML file
│   ├── ll.lrc                    # Example lyrics file
│   └── Noto Sans Sinhala_Regular.json # Font file for lyrics
├── index.html                # Main HTML file
├── package.json              # NPM configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.js            # Vite JS config
├── vite.config.ts            # Vite TS config
└── README.md                 # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd lyrics
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Place example `.lrc` lyrics and `song.mp3` in the `public/` folder for testing.

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

- Upload an audio file using the audio player component.
- The lyrics will be displayed and highlighted in sync with the audio playback.
- Visualizations will react to the audio frequencies in real-time.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.