// Rich Web Audio API Synthesizer for Christian Wedding - Pachelbel's Canon in D & Sacred Hymn
class WeddingAudioPlayer {
    constructor() {
        this.audioCtx = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.tempo = 66; // Gentle, reverent tempo (BPM)
        this.currentStep = 0;
        this.loopTimer = null;
        this.masterGain = null;
        this.reverbNode = null;
        this.onStateChange = null;

        // Note frequencies (Hz)
        this.notes = {
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F#3': 185.00, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C#4': 277.18, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C#5': 554.37, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
        };

        // Canon in D - Sacred Hymn arrangement (Bass line, harmony, and lead melody)
        this.bassLine = [
            'D3', 'A3', 'B3', 'F#3', 'G3', 'D3', 'G3', 'A3'
        ];

        // 8-measure progression loops with melodic variations
        this.melodyPhases = [
            // Phase 1: Gentle Opening Chime / Arpeggio
            [
                ['F#5', 'D5', 'A4'], ['E5', 'C#5', 'A4'], ['D5', 'B4', 'F#4'], ['C#5', 'A4', 'F#4'],
                ['B4', 'G4', 'D4'], ['A4', 'F#4', 'D4'], ['B4', 'G4', 'D4'], ['C#5', 'A4', 'E4']
            ],
            // Phase 2: Flowing Wedding Processional
            [
                ['D5', 'F#4', 'A4'], ['C#5', 'E4', 'A4'], ['B4', 'D4', 'F#4'], ['A4', 'C#4', 'F#4'],
                ['G4', 'B3', 'D4'], ['F#4', 'A3', 'D4'], ['G4', 'B3', 'D4'], ['A4', 'C#4', 'E4']
            ],
            // Phase 3: Uplifting Grace
            [
                ['F#5', 'A5', 'D5'], ['E5', 'A5', 'C#5'], ['D5', 'F#5', 'B4'], ['C#5', 'E5', 'A4'],
                ['B4', 'D5', 'G4'], ['A4', 'D5', 'F#4'], ['B4', 'D5', 'G4'], ['C#5', 'E5', 'A4']
            ]
        ];

        this.currentPhase = 0;
        this.measure = 0;
    }

    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();

            // Master Gain
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);

            // Church Cathedral Reverb Simulation (Impulse Response)
            this.reverbNode = this.createCathedralReverb(2.8, 0.02);

            this.masterGain.connect(this.reverbNode);
            this.reverbNode.connect(this.audioCtx.destination);

            // Direct subtle dry signal
            const dryGain = this.audioCtx.createGain();
            dryGain.gain.setValueAtTime(0.65, this.audioCtx.currentTime);
            this.masterGain.connect(dryGain);
            dryGain.connect(this.audioCtx.destination);
        }

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    createCathedralReverb(duration, decay) {
        const rate = this.audioCtx.sampleRate;
        const length = rate * duration;
        const impulse = this.audioCtx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = i / length;
            // Exponential decay with natural acoustic diffusion
            const factor = Math.exp(-n / decay) * (1 - n);
            left[i] = (Math.random() * 2 - 1) * factor;
            right[i] = (Math.random() * 2 - 1) * factor;
        }

        const convolver = this.audioCtx.createConvolver();
        convolver.buffer = impulse;
        return convolver;
    }

    playPianoHarpNote(freq, time, duration = 1.8, velocity = 0.5) {
        if (!this.audioCtx || !freq) return;

        // Rich compound tone: Warm acoustic triangle + subtle warm sine + harmonic overtone
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const sub = this.audioCtx.createOscillator();

        const noteGain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, time);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, time); // 1st octave overtone for chime/bell sparkle

        sub.type = 'sine';
        sub.frequency.setValueAtTime(freq * 0.5, time); // warm body

        // Gentle acoustic filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2600, time);
        filter.frequency.exponentialRampToValueAtTime(600, time + duration);

        // Natural piano/harp ADSR envelope
        const peakGain = velocity * 0.35;
        noteGain.gain.setValueAtTime(0.0001, time);
        noteGain.gain.linearRampToValueAtTime(peakGain, time + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(peakGain * 0.45, time + 0.35);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        sub.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc1.start(time);
        osc2.start(time);
        sub.start(time);

        osc1.stop(time + duration);
        osc2.stop(time + duration);
        sub.stop(time + duration);
    }

    step() {
        if (!this.isPlaying || !this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        const secondsPerBeat = 60 / this.tempo;
        const measureIndex = this.measure % 8;

        // Bass Note (Cathedral Organ/Cello warmth)
        const bassNote = this.bassLine[measureIndex];
        const bassFreq = this.notes[bassNote];
        if (bassFreq) {
            this.playPianoHarpNote(bassFreq * 0.5, now, secondsPerBeat * 3.8, 0.45);
        }

        // Chords & Melody Arpeggios
        const phaseMelody = this.melodyPhases[this.currentPhase];
        const currentChordNotes = phaseMelody[measureIndex];

        // 4 gentle 16th-to-eighth notes in the measure for angelic harp/piano movement
        currentChordNotes.forEach((noteName, idx) => {
            const noteFreq = this.notes[noteName];
            if (noteFreq) {
                const noteTime = now + (idx * (secondsPerBeat * 0.8));
                this.playPianoHarpNote(noteFreq, noteTime, secondsPerBeat * 2.2, 0.38 - (idx * 0.04));
            }
        });

        this.measure++;
        if (this.measure % 8 === 0) {
            this.currentPhase = (this.currentPhase + 1) % this.melodyPhases.length;
        }

        // Schedule next measure
        const nextTimeMs = (secondsPerBeat * 3.2) * 1000;
        this.loopTimer = setTimeout(() => this.step(), nextTimeMs);
    }

    start() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.step();
        if (this.onStateChange) this.onStateChange(true);
    }

    pause() {
        this.isPlaying = false;
        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = null;
        }
        if (this.onStateChange) this.onStateChange(false);
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.start();
        }
    }

    setMute(mute) {
        this.isMuted = mute;
        if (this.masterGain && this.audioCtx) {
            this.masterGain.gain.setValueAtTime(mute ? 0 : 0.4, this.audioCtx.currentTime);
        }
    }
}

// Global instance
window.weddingAudio = new WeddingAudioPlayer();
