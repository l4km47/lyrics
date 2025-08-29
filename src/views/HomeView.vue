<template>
  <div v-if="!isAudioLoaded" class="play-btn">
    <button @click="() => { startAudio(); }" style="color: white;z-index: 999;"> {{'Start'
      }}</button>
  </div>
  <div class="home-view">
    <Visualizer v-if="isAudioLoaded" :audio-element="audioElement" />
    <LyricsVisualizer v-if="isAudioLoaded" font-url="Noto Sans Sinhala_Regular.json" :lyrics="lyrics"
      :audio-element="audioElement" :current-time="currentTime" />

  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Visualizer from '../components/Visualizer.vue';
import LyricsVisualizer from '@/components/LyricsVisualizer.vue';
import { LyricLine } from '@/types';

export default {
  components: { Visualizer, LyricsVisualizer },
  setup() {
    const audioElement = ref<HTMLAudioElement | null>(null);
    const lyrics = ref<LyricLine[]>([]);
    const currentTime = ref(0);
    const isAudioLoaded = ref(false);
    const isPlaying = ref(false);
    let rafId: number | null = null;

    onMounted( () => {
      
    });

    const startAudio = async() => {
       // Create audio element and attach to DOM
      audioElement.value = new Audio('/audio.mp3');
      audioElement.value.crossOrigin = 'anonymous';
      document.body.appendChild(audioElement.value); // ensures user gesture works

      // Load LRC
      const response = await fetch('/ll.lrc');
      const lrcText = await response.text();
      lyrics.value = parseLyrics(lrcText);

      if (!audioElement.value) return;

      // This must be called in a user gesture
      audioElement.value.play()
        .then(() => {
          isPlaying.value = true;
          trackTime();
          audioElement.value!.addEventListener('ended', stopTracking);
        })
        .catch(err => {
          console.warn('Audio playback blocked', err);
        });
      isAudioLoaded.value = true;
  
    };

    const trackTime = () => {
      const update = () => {
        if (audioElement.value) currentTime.value = audioElement.value.currentTime;
        rafId = requestAnimationFrame(update);
      };
      update();
    };

    const stopTracking = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const parseLyrics = (text: string): LyricLine[] => {
      const lines: LyricLine[] = [];
      text.split('\n').forEach(line => {
        if (/^\[[a-zA-Z]+:.*\]$/.test(line)) return;
        const timestampRegex = /\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\]/g;
        let match: RegExpExecArray | null;
        const timestamps: number[] = [];
        while ((match = timestampRegex.exec(line)) !== null) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseFloat(match[2]);
          timestamps.push(minutes * 60 + seconds);
        }
        const lyricText = line.replace(timestampRegex, '').trim();
        if (!lyricText) return;
        timestamps.forEach(time => lines.push({ time, text: lyricText }));
      });
      return lines.sort((a, b) => a.time - b.time);
    };

    onUnmounted(() => {
      stopTracking();
      if (audioElement.value) {
        audioElement.value.pause();
        audioElement.value.src = '';
      }
    });

    return { lyrics, currentTime, audioElement, isAudioLoaded, isPlaying, startAudio };
  },
};
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

button{
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  padding: 12px 24px;
  font-size: 18px;
  background-color: #ea0062;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>