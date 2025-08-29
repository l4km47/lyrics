import { ref, onMounted, onUnmounted, Ref } from 'vue';

// Add this declaration to extend the Window interface
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

export function useAudioAnalysis(audioElement: HTMLMediaElement | Ref<HTMLAudioElement | null, HTMLAudioElement | null>) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const isAnalyzing = ref(false);

    const setupAudio = () => {
        // Extract the actual HTMLMediaElement if audioElement is a Ref
        const element =
            (audioElement && typeof (audioElement as Ref<any>).value !== 'undefined')
                ? (audioElement as Ref<HTMLAudioElement | null>).value
                : (audioElement as HTMLMediaElement);

        if (!element) {
            console.warn('Audio element is not available for analysis.');
            return;
        }

        const source = audioContext.createMediaElementSource(element);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 2048;
    };

    const startAnalysis = () => {
        if (!isAnalyzing.value) {
            audioContext.resume().then(() => {
                isAnalyzing.value = true;
                analyze();
            });
        }
    };

    const stopAnalysis = () => {
        isAnalyzing.value = false;
    };

    const analyze = () => {
        if (!isAnalyzing.value) return;

        analyser.getByteFrequencyData(dataArray);
        requestAnimationFrame(analyze);
    };

    onMounted(() => {
        setupAudio();
    });

    onUnmounted(() => {
        stopAnalysis();
        audioContext.close();
    });

    return {
        dataArray,
        startAnalysis,
        stopAnalysis,
    };
}