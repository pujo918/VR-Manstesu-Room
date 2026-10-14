// =================================================================
// EFEK SUARA WEB AUDIO API SINTETIS (TANPA ASSET FILE AUDIO LUAR)
// =================================================================
function playAudioFeedback(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'door') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(160, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.18);
            osc.start();
            osc.stop(ctx.currentTime + 0.18);
        } else if (type === 'window') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.28);
            osc.start();
            osc.stop(ctx.currentTime + 0.28);
        } else if (type === 'sit') {
            // Bunyi gesekan kursi lembut
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'knock') {
            // Bunyi ketukan pintu kayu padat (solid wood knock)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(125, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.7, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.09);
            osc.start();
            osc.stop(ctx.currentTime + 0.09);
        } else if (type === 'ojigi') {
            // Efek hembusan sopan saat membungkuk formal
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.28);
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.32);
            osc.start();
            osc.stop(ctx.currentTime + 0.32);
        } else if (type === 'click') {
            // Suara klik tombol UI
            osc.type = 'sine';
            osc.frequency.setValueAtTime(650, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        }
    } catch (e) {}
}
