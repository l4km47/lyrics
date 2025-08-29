<template>
  <canvas ref="threeCanvas" class="bg-canvas"></canvas>
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
    let camera: THREE.OrthographicCamera;
    let renderer: THREE.WebGLRenderer;
    let material: THREE.ShaderMaterial;
    let mesh: THREE.Mesh;
    let rafId = 0;

    let analyser: AnalyserNode;
    let dataArray: Uint8Array;

    const initScene = () => {
      if (!threeCanvas.value) return;

      scene = new THREE.Scene();
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Orthographic camera covers entire screen
      camera = new THREE.OrthographicCamera(
        0, width, height, 0, -1, 1
      );

      renderer = new THREE.WebGLRenderer({
        canvas: threeCanvas.value,
        antialias: true,
        alpha: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Plane covering entire screen
      const geometry = new THREE.PlaneGeometry(width, height);

      // Shader material for gradient
      material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBass: { value: 0 },
          uResolution: { value: new THREE.Vector2(width, height) },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uBass;
          uniform vec2 uResolution;
          varying vec2 vUv;

          void main() {
            vec3 color1 = vec3(0.1, 0.1, 0.3);
            vec3 color2 = vec3(0.8, 0.3, 0.5);

            // Modify gradient by bass
            float mixAmount = smoothstep(0.0, 1.0, vUv.y + sin(uTime*0.5)*0.2 + uBass*0.5);
            vec3 color = mix(color1, color2, mixAmount);

            gl_FragColor = vec4(color, 1.0);
          }
        `,
      });

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(width / 2, height / 2, 0);
      scene.add(mesh);

      // --- Audio ---
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(props.audioElement);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      animate();
    };

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);

      // Simple bass value (average of low frequencies)
      let bass = 0;
      for (let i = 0; i < 8; i++) bass += dataArray[i];
      bass /= 8 * 255; // normalized 0-1

      material.uniforms.uBass.value = bass;
      material.uniforms.uTime.value += 0.01;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    const onResize = () => {
      if (!threeCanvas.value) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      material.uniforms.uResolution.value.set(w, h);
      camera.right = w;
      camera.top = h;
      camera.updateProjectionMatrix();
      mesh.position.set(w / 2, h / 2, 0);
    };

    onMounted(() => {
      initScene();
      window.addEventListener("resize", onResize);
    });

    onBeforeUnmount(() => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    });

    return { threeCanvas };
  },
});
</script>

<style scoped>
.bg-canvas {
  width: 100%;
  height: 100vh;
  display: block;
}
</style>
