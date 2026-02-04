import { DEFAULT_AUDIO_CONFIG, type AudioConfig } from '@/types/voice';

/**
 * AudioRecorder class for capturing microphone input as PCM16
 */
export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private config: AudioConfig;
  private onAudioData: ((data: ArrayBuffer) => void) | null = null;
  private isMuted = false;

  constructor(config: AudioConfig = DEFAULT_AUDIO_CONFIG) {
    this.config = config;
  }

  async start(onAudioData: (data: ArrayBuffer) => void): Promise<void> {
    this.onAudioData = onAudioData;

    try {
      // Check if mediaDevices is available (requires HTTPS or localhost)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Microphone access requires a secure connection (HTTPS). ' +
          'Please access this page over HTTPS or use localhost.'
        );
      }

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.inputSampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context with target sample rate
      this.audioContext = new AudioContext({
        sampleRate: this.config.inputSampleRate,
      });

      // Create source from media stream
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Use ScriptProcessor for PCM16 conversion (deprecated but widely supported)
      // Buffer size of 1024 samples at 16kHz = 64ms chunks
      const bufferSize = 1024;
      this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      // Accumulator for chunking
      let accumulatedSamples: number[] = [];
      const samplesPerChunk = this.config.chunkSize / 2; // 2 bytes per sample

      this.scriptProcessor.onaudioprocess = (event) => {
        if (this.isMuted || !this.onAudioData) return;

        const inputData = event.inputBuffer.getChannelData(0);

        // Add samples to accumulator
        for (let i = 0; i < inputData.length; i++) {
          accumulatedSamples.push(inputData[i]);
        }

        // Send chunks when we have enough samples
        while (accumulatedSamples.length >= samplesPerChunk) {
          const chunk = accumulatedSamples.splice(0, samplesPerChunk);
          const pcm16Data = this.float32ToPcm16(new Float32Array(chunk));
          this.onAudioData(pcm16Data);
        }
      };

      // Connect audio graph
      this.sourceNode.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  stop(): void {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.onAudioData = null;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  private float32ToPcm16(float32Array: Float32Array): ArrayBuffer {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcm16.buffer;
  }
}

/**
 * AudioPlayer class for playing audio responses
 * Supports both raw PCM16 data and encoded audio formats
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private onPlaybackStart: (() => void) | null = null;
  private onPlaybackEnd: (() => void) | null = null;
  private sampleRate: number;

  constructor(sampleRate: number = 24000) {
    this.sampleRate = sampleRate;
    // Create AudioContext - let browser choose optimal sample rate for playback
    this.audioContext = new AudioContext();
    console.log('AudioPlayer created, browser sampleRate:', this.audioContext.sampleRate, 'target sampleRate:', this.sampleRate);
  }

  setCallbacks(onStart: () => void, onEnd: () => void): void {
    this.onPlaybackStart = onStart;
    this.onPlaybackEnd = onEnd;
  }

  async playAudioData(audioData: ArrayBuffer): Promise<void> {
    console.log('AudioPlayer.playAudioData called, size:', audioData.byteLength);

    if (!this.audioContext) {
      console.log('Creating new AudioContext with sampleRate:', this.sampleRate);
      this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
    }

    console.log('AudioContext state:', this.audioContext.state);

    // Resume audio context if suspended (required by browsers)
    if (this.audioContext.state === 'suspended') {
      console.log('AudioContext suspended, resuming...');
      await this.audioContext.resume();
      console.log('AudioContext resumed, new state:', this.audioContext.state);
    }

    this.audioQueue.push(audioData);
    console.log('Audio queued, queue length:', this.audioQueue.length, 'isPlaying:', this.isPlaying);

    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext(): Promise<void> {
    console.log('playNext called, queue length:', this.audioQueue.length);

    if (this.audioQueue.length === 0 || !this.audioContext) {
      console.log('Queue empty or no context, stopping playback');
      this.isPlaying = false;
      this.onPlaybackEnd?.();
      return;
    }

    this.isPlaying = true;
    this.onPlaybackStart?.();

    const audioData = this.audioQueue.shift()!;
    console.log('Processing audio chunk, size:', audioData.byteLength);

    try {
      let audioBuffer: AudioBuffer;

      // Try to decode as encoded audio first (MP3, WAV with headers, etc.)
      try {
        audioBuffer = await this.audioContext.decodeAudioData(audioData.slice(0));
        console.log('Decoded as encoded audio, duration:', audioBuffer.duration, 'seconds');
      } catch (decodeErr) {
        // If decoding fails, treat as raw PCM16 data
        console.log('decodeAudioData failed, treating as raw PCM16:', decodeErr);
        audioBuffer = this.pcm16ToAudioBuffer(audioData);
        console.log('PCM16 audio buffer created, duration:', audioBuffer.duration, 'seconds');
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      this.currentSource = source;

      source.onended = () => {
        console.log('Audio chunk playback ended');
        this.currentSource = null;
        this.playNext();
      };

      console.log('Starting audio playback...');
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  /**
   * Convert raw PCM16 data to AudioBuffer
   */
  private pcm16ToAudioBuffer(pcm16Data: ArrayBuffer): AudioBuffer {
    const int16Array = new Int16Array(pcm16Data);
    const float32Array = new Float32Array(int16Array.length);

    // Convert PCM16 to Float32 (-1.0 to 1.0)
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }

    // Use the target sample rate for PCM data (typically 24kHz for OpenAI TTS)
    const pcmSampleRate = this.sampleRate;
    console.log('Creating PCM16 AudioBuffer, samples:', float32Array.length, 'sampleRate:', pcmSampleRate);

    // Create AudioBuffer
    const audioBuffer = this.audioContext!.createBuffer(
      1, // mono
      float32Array.length,
      pcmSampleRate
    );

    // Copy data to the buffer
    audioBuffer.copyToChannel(float32Array, 0);

    return audioBuffer;
  }

  stop(): void {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  interrupt(): void {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
    this.onPlaybackEnd?.();
  }
}

/**
 * Calculate audio level (0-100) for visualization
 */
export function calculateAudioLevel(pcm16Data: ArrayBuffer): number {
  const int16Array = new Int16Array(pcm16Data);
  let sum = 0;
  for (let i = 0; i < int16Array.length; i++) {
    sum += Math.abs(int16Array[i]);
  }
  const average = sum / int16Array.length;
  // Normalize to 0-100 range
  return Math.min(100, (average / 32768) * 200);
}
