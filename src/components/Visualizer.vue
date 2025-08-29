<template>
  <canvas ref="threeCanvas" class="three-bg"></canvas>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, PropType } from "vue";
import * as THREE from "three";

export default defineComponent({
  props: {
    audioElement: { type: Object as PropType<HTMLAudioElement>, required: false },
  },
  setup(props) {
    const threeCanvas = ref<HTMLCanvasElement | null>(null);
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let particleSystem: THREE.Points;
    let particlePositions: Float32Array;
    let particleScales: Float32Array;
    let velocities: Float32Array;
    let particleCount = 500;
    let rafId = 0;

    let analyser: AnalyserNode;
    let dataArray: Uint8Array;

    let mouse = { x: 0, y: 0 };

    const createHeartTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ff4081";
      ctx.beginPath();
      ctx.moveTo(32, 16);
      ctx.bezierCurveTo(32, 0, 0, 0, 0, 32);
      ctx.bezierCurveTo(0, 64, 32, 64, 32, 64);
      ctx.bezierCurveTo(32, 64, 64, 64, 64, 32);
      ctx.bezierCurveTo(64, 0, 32, 0, 32, 16);
      ctx.fill();
      return new THREE.CanvasTexture(canvas);
    };

    const initScene = () => {
      if (!threeCanvas.value) return;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.z = 25;

      renderer = new THREE.WebGLRenderer({
        canvas: threeCanvas.value,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // --- particles geometry ---
      const geometry = new THREE.BufferGeometry();
      particlePositions = new Float32Array(particleCount * 3);
      particleScales = new Float32Array(particleCount);
      velocities = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 50;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;

        particleScales[i] = Math.random() * 0.5 + 0.5;

        velocities[i * 3] = (Math.random() - 0.5) * 0.05;
        velocities[i * 3 + 1] = Math.random() * 0.05;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      geometry.setAttribute("scale", new THREE.BufferAttribute(particleScales, 0.1));

      const texture = createHeartTexture();

      const material = new THREE.PointsMaterial({
        size: 1,
        map: texture,
        transparent: true,
        alphaTest: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      // --- audio analyser ---
      if (props.audioElement) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(props.audioElement);
        if(!source) return;
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      }

      // --- mouse ---
      window.addEventListener("mousemove", (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      });

      animate();
    };

    const animateParticles = () => {
      if (analyser && dataArray) analyser.getByteFrequencyData(dataArray);

      for (let i = 0; i < particleCount; i++) {
        // move by velocity
        particlePositions[i * 3] += velocities[i * 3] + mouse.x * 0.2;
        particlePositions[i * 3 + 1] += velocities[i * 3 + 1] + (dataArray ? dataArray[i % dataArray.length] / 5000 : 0);
        particlePositions[i * 3 + 2] += velocities[i * 3 + 2] + mouse.y * 0.2;

        // wrap around
        if (particlePositions[i * 3 + 1] > 20) particlePositions[i * 3 + 1] = -20;
        if (particlePositions[i * 3 + 1] < -20) particlePositions[i * 3 + 1] = 20;
        if (particlePositions[i * 3] > 25) particlePositions[i * 3] = -25;
        if (particlePositions[i * 3] < -25) particlePositions[i * 3] = 25;
        if (particlePositions[i * 3 + 2] > 25) particlePositions[i * 3 + 2] = -25;
        if (particlePositions[i * 3 + 2] < -25) particlePositions[i * 3 + 2] = 25;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
    };

    const animate = () => {
      animateParticles();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    const onResize = () => {
      if (!threeCanvas.value) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    onMounted(() => {
      initScene();
      window.addEventListener("resize", onResize);
    });

    onBeforeUnmount(() => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      if (particleSystem) scene.remove(particleSystem);
      renderer.dispose();
    });

    return { threeCanvas };
  },
});
</script>

<style scoped>
.three-bg {
  width: 100%;
  height: 100vh;
  display: block;
  background: #05050a;
}
</style>
