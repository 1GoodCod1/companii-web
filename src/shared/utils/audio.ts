export function playNotificationSound() {
    try {
        const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        
        function playChime(freq: number, startTime: number) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.98, startTime + 0.3);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

            osc.start(startTime);
            osc.stop(startTime + 0.4);
        }

        const now = ctx.currentTime;
        playChime(659.25, now); 
        playChime(880.00, now + 0.15); 

        setTimeout(() => { 
            if (ctx.state !== 'closed') void ctx.close(); 
        }, 1000);
    } catch (e) {
        console.error('Failed to play notification sound', e);
    }
}
