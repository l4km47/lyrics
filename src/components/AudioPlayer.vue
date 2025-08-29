<template>
  <div class="player">
    <!-- Optional file inputs for local selection -->
    <input type="file" accept="audio/*" @change="onAudioFileChange" />
    <input type="file" accept=".lrc,.txt" @change="onLyricsFileChange" />

    <audio ref="audioElement" controls autoplay crossorigin="anonymous"></audio>
    <div>Current Time: {{ currentTime?.toFixed(2) }}s</div>

    <button @click="playAudio">Play</button>
    <button @click="pauseAudio">Pause</button>
    <button @click="stopAudio">Stop</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";

export default defineComponent({
  emits: ["audio-loaded"],
  name: "AudioPlayer",
  setup(_, { emit }) {
    const audioElement = ref<HTMLAudioElement | null>(null);
    const currentTime = ref(0);

    // Track selected files (optional)
    const audioFile = ref<File | null>(null);
    const lyricsFile = ref<File | null>(null);

    const loadFromPublic = async () => {
      if (!audioElement.value) return;

      // Load static audio from public folder
      const audioUrl = "/audio.mp3";
      const lrcUrl = "/ll.lrc";

      audioElement.value.src = audioUrl;

      // Fetch LRC file
      const response = await fetch(lrcUrl);
      const lrcText = await response.text();

      emit("audio-loaded", audioElement.value, lrcText);

      audioElement.value.addEventListener("timeupdate", () => {
        currentTime.value = audioElement.value?.currentTime || 0;
      });
    };

    const onAudioFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        audioFile.value = target.files[0];
        if (audioElement.value) {
          audioElement.value.src = URL.createObjectURL(audioFile.value);
        }
        // Emit only if lyrics is selected
        if (lyricsFile.value) {
          readLyricsFile(lyricsFile.value);
        }
      }
    };

    const onLyricsFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        lyricsFile.value = target.files[0];
        if (audioFile.value) {
          readLyricsFile(lyricsFile.value);
        }
      }
    };

    const readLyricsFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        emit("audio-loaded", audioElement.value, text);
      };
      reader.readAsText(file);
    };

    const playAudio = () => audioElement.value?.play();
    const pauseAudio = () => audioElement.value?.pause();
    const stopAudio = () => {
      if (audioElement.value) {
        audioElement.value.pause();
        audioElement.value.currentTime = 0;
      }
    };

    const onAudioEnded = () => {
      console.log("Audio ended");
    };

    onMounted(() => {
      // Try loading from public by default
      loadFromPublic();
    });

    return {
      audioElement,
      currentTime,
      onAudioFileChange,
      onLyricsFileChange,
      playAudio,
      pauseAudio,
      stopAudio,
      onAudioEnded,
    };
  },
});
</script>

<style scoped>
.player {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
  padding: 10px;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

input {
  margin: 3px 0;
  padding: 5px;
}

button {
  margin: 5px 0;
  padding: 8px 12px;
  background-color: #ea0062;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
