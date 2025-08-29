<template>
  <div>
    <canvas ref="canvas" width="800" height="400"></canvas>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'AudioAnalyzer',
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationId: number;

    const draw = () => {
      if (canvas.value) {
        const canvasContext = canvas.value.getContext('2d');
        analyser.getByteFrequencyData(dataArray);
        canvasContext?.clearRect(0, 0, canvas.value.width, canvas.value.height);
        
        const barWidth = (canvas.value.width / dataArray.length) * 2.5;
        let barHeight: number;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          barHeight = dataArray[i];
          canvasContext?.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
          canvasContext?.fillRect(x, canvas.value.height - barHeight / 2, barWidth, barHeight / 2);
          x += barWidth + 1;
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    onMounted(() => {
      draw();
    });

    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId);
      audioContext.close();
    });

    return {
      canvas,
    };
  },
};
</script>

<style scoped>
canvas {
  display: block;
  margin: 0 auto;
  background: #000;
}
</style>