export interface Lyric {
  text: string;
  time: number; // Time in seconds
}

export interface AudioAnalysisData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number; // Current playback time in seconds
  duration: number; // Total duration of the audio in seconds
}

export interface VisualizerSettings {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface LyricLine {
  text: string;
  time: number;
}