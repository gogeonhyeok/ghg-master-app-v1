// A short, voiced “rib-bit”: rounded throat resonances, gently pulsing air,
// and a lower second syllable. Generate locally so sound needs no audio download.
export function synthesizeCroak(sampleRate: number, voiceId = "pond"): Float32Array {
  let seed = 2166136261;
  for (const character of voiceId) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  const pitch = 185 + (seed % 35);
  const samples = new Float32Array(Math.ceil(sampleRate * .56));
  const syllables = [
    { start: .015, duration: .17, pitch: pitch * 1.12, strength: .85 },
    { start: .245, duration: .26, pitch: pitch * .92, strength: 1 },
  ];

  for (const syllable of syllables) {
    // Emphasize the throat's resonances instead of a pure whistle or buzzy sawtooth.
    const harmonics = Array.from({ length: 10 }, (_, index) => {
      const harmonic = index + 1;
      const frequency = harmonic * syllable.pitch;
      const resonance = Math.exp(-(((frequency - 600) / 280) ** 2))
        + .35 * Math.exp(-(((frequency - 1150) / 400) ** 2));
      return (resonance + .12) / harmonic;
    });
    const normalization = harmonics.reduce((sum, weight) => sum + weight, 0);
    let phase = 0;
    let air = 0;
    for (let index = 0; index < Math.ceil(syllable.duration * sampleRate); index++) {
      const time = index / sampleRate;
      const progress = time / syllable.duration;
      const attack = Math.min(1, time / .018);
      const release = Math.min(1, (syllable.duration - time) / .065);
      const envelope = Math.sin(attack * Math.PI / 2) ** 2 * Math.sin(release * Math.PI / 2) ** 2;
      const flutter = .76 + .24 * Math.sin(2 * Math.PI * 31 * time);
      const frequency = syllable.pitch * (1.16 - .34 * progress + .018 * Math.sin(2 * Math.PI * 18 * time));
      phase += 2 * Math.PI * frequency / sampleRate;
      let voiced = 0;
      for (let harmonic = 0; harmonic < harmonics.length; harmonic++) {
        voiced += harmonics[harmonic] * Math.sin(phase * (harmonic + 1));
      }
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      air = .8 * air + .2 * (seed / 4294967296 * 2 - 1);
      const rounded = Math.tanh(1.6 * voiced / normalization + .045 * air);
      samples[Math.round(syllable.start * sampleRate) + index] = .3 * rounded * envelope * flutter * syllable.strength;
    }
  }
  return samples;
}

export function playCroak(context: AudioContext, voiceId?: string): () => void {
  const samples = synthesizeCroak(context.sampleRate, voiceId);
  const buffer = context.createBuffer(1, samples.length, context.sampleRate);
  buffer.getChannelData(0).set(samples);
  const source = context.createBufferSource();
  const volume = context.createGain();
  let stopped = false;
  source.buffer = buffer;
  source.connect(volume);
  volume.connect(context.destination);
  source.onended = () => { stopped = true; source.disconnect(); volume.disconnect(); };
  source.start();

  return () => {
    if (stopped) return;
    stopped = true;
    // A brief fade prevents a click when muting or replacing a croak.
    const now = context.currentTime;
    volume.gain.cancelScheduledValues(now);
    volume.gain.setValueAtTime(1, now);
    volume.gain.linearRampToValueAtTime(0, now + .02);
    source.stop(now + .025);
  };
}
