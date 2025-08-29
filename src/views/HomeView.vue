<template>
    <button v-if="!isPlaying" @click="()=>{play();}" style="color: white;z-index: 999;"> {{ currentTime.toFixed(2) || 'Play' }}</button>
  <div class="home-view">
    <Visualizer v-if="isAudioLoaded" :audio-element="audioElement" />
    <LyricsVisualizer 
      v-if="isAudioLoaded"
      font-url="Noto Sans Sinhala_Regular.json"
      :lyrics="lyrics" 
      :audio-element="audioElement"
      :current-time="currentTime"
    />

  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Visualizer from '../components/Visualizer.vue';
import LyricsVisualizer from '@/components/LyricsVisualizer.vue';
import { LyricLine } from '@/types';
import AudioPlayer from '@/components/AudioPlayer.vue';

export default {
  components: { Visualizer, LyricsVisualizer,AudioPlayer },
  setup() {
    const audioElement = ref<HTMLAudioElement | null>(null);
    const lyrics = ref<LyricLine[]>([]);
    const currentTime = ref(0);
    let rafId: number | null = null;
    const isAudioLoaded = ref(false);
    const isPlaying=ref(false);

    const play = () => {
      console.log(audioElement.value)
      if (audioElement.value) {
        audioElement.value.play().then(() => {
          startTrackingTime();
          isPlaying.value=true;
        });
        audioElement.value.addEventListener('ended', stopTrackingTime);

      }
    };

    const loadAudioAndLyrics = async () => {
      // Create audio element
      audioElement.value = document.createElement('audio');
      audioElement.value.crossOrigin = 'anonymous';
      audioElement.value.src = '/audio.mp3';

      // Fetch LRC file
      const response = await fetch('/ll.lrc');
      const lrcText = await response.text();
      lyrics.value = parseLyrics(lrcText);

      // Auto-play
      //audioElement.value.play().then(() => {
      //  startTrackingTime();
      //});

      // Stop tracking when audio ends

      isAudioLoaded.value = true;
      console.log('Audio and lyrics loaded');
    };

    const startTrackingTime = () => {
      const update = () => {
        if (audioElement.value) {
          currentTime.value = audioElement.value.currentTime;
        }
        rafId = requestAnimationFrame(update);
      };
      update();
    };

    const stopTrackingTime = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const parseLyrics = (text: string): LyricLine[] => {
      const lines: LyricLine[] = [];
      text.split('\n').forEach(line => {
        if (/^\[[a-zA-Z]+:.*\]$/.test(line)) return; // skip metadata
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

    onMounted(() => {
      loadAudioAndLyrics();
    });

    onUnmounted(() => {
      stopTrackingTime();
      if (audioElement.value) {
        audioElement.value.pause();
        audioElement.value.src = '';
      }
    });

    return {
      lyrics,
      currentTime,
      audioElement,
      isAudioLoaded,
      loadAudioAndLyrics,
      play,
      isPlaying
    };
  },
};
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
}

button{
  background: transparent;
  border: 1px solid white;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
