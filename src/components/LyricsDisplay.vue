<template>
  <div class="lyrics-display">
    <div
      v-for="(line, index) in lyrics"
      :key="index"
      class="lyric-line"
      :class="{ active: isActiveLine(index) }"
    >
      <span
        class="highlighted-text"
        :style="{
          '--progress': getHighlightProgress(index) + '%'
        }"
      >
        {{ line.text }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { LyricLine } from '@/types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'LyricsDisplay',
  props: {
    lyrics: {
      type: Array as PropType<LyricLine[]>,
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const isActiveLine = (index: number) => {
      const currentLine = props.lyrics[index];
      const nextLine = props.lyrics[index + 1];
      if (!currentLine) return false;

      const afterCurrent = props.currentTime >= currentLine.time;
      const beforeNext = !nextLine || props.currentTime < nextLine.time;

      return afterCurrent && beforeNext;
    };

    const getHighlightProgress = (index: number) => {
      if (!isActiveLine(index)) return 0;

      const currentLine = props.lyrics[index];
      const nextLine = props.lyrics[index + 1];
      const duration = (nextLine ? nextLine.time : currentLine.time + 3) - currentLine.time;
      const elapsed = props.currentTime - currentLine.time;

      return Math.min((elapsed / duration) * 100, 100);
    };

    return {
      isActiveLine,
      getHighlightProgress,
    };
  },
});
</script>

<style scoped>
.lyrics-display {
  font-size: 1.5rem;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.lyric-line {
  position: relative;
  overflow: hidden;
}

.highlighted-text {
  background: linear-gradient(to right, #ff4081 var(--progress), #fff var(--progress));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: none;
}
</style>
