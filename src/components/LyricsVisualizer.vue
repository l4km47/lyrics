<template>
  <div class="lyrics-container">
    <div
      v-for="(line, index) in lyrics"
      :key="index"
      class="lyric-line"
      ref="lyricRefs"
    >
      <span class="gradient-text">{{ line.text }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, nextTick, PropType } from "vue";
import gsap from "gsap";
import { LyricLine } from "@/types";

export default defineComponent({
  name: "GsapLyricsRandom",
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
    const lyricRefs = ref<HTMLDivElement[]>([]);
    let activeIndex = -1;

    // pool of random animation presets
    const animationPresets = [
      { y: 50, x: 0, rotation: 0 },
      { y: -50, x: 0, rotation: 0 },
      { y: 0, x: 50, rotation: 10 },
      { y: 0, x: -50, rotation: -10 },
      { y: 50, x: 50, rotation: 5 },
      { y: -50, x: -50, rotation: -5 },
    ];

    const showLine = (index: number) => {
      if (index === activeIndex) return;
      activeIndex = index;

      lyricRefs.value.forEach((el, i) => {
        if (!el) return;
        if (i === index) {
          // choose random preset for entrance
          const preset = animationPresets[Math.floor(Math.random() * animationPresets.length)];

          gsap.fromTo(
            el,
            { x: preset.x, y: preset.y, opacity: 0, scale: 0.8, rotation: preset.rotation },
            { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "power3.out" }
          );
        } else {
          gsap.to(el, {
            x: 0,
            y: -50,
            opacity: 0,
            scale: 0.8,
            rotation: 0,
            duration: 0.6,
            ease: "power2.in",
          });
        }
      });
    };

    const updateCurrentLine = () => {
      const ct = props.currentTime;
      const index = props.lyrics.findIndex(
        (line, i) => ct >= line.time && (i === props.lyrics.length - 1 || ct < props.lyrics[i + 1].time)
      );
      if (index !== -1) showLine(index);
    };

    onMounted(() => {
      nextTick(() => {
        watch(
          () => props.currentTime,
          () => {
            updateCurrentLine();
          }
        );
      });
    });

    return { lyricRefs };
  },
});
</script>

<style scoped>
.lyrics-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: "Noto Sans Sinhala", sans-serif;
  text-align: center;
  pointer-events: none;
  width: 80%;
}

.lyric-line {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  font-size: 2rem;
  font-weight: 600;
  opacity: 0;
  background-color: transparent !important;
}

.gradient-text {
  background: linear-gradient(90deg, #ffffff 0%, #eb3d80 100%);
  text-shadow: 0 0 6px #ff4081, 0 0 12px #ffffff;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
 
.lyrics-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: "Noto Sans Sinhala", sans-serif;
  text-align: center;
  pointer-events: none;
  width: 80%;
  background: transparent; /* must be transparent */
}

</style>
