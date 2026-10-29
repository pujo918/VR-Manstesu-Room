// =========================================================================
// SISTEM PEREKAM SUARA KANDIDAT & PENGIRIMAN GOOGLE APPS SCRIPT
// Mensetsu VR Room - Audio Recorder (WebM/WAV) + Google Drive 5TB & Central Spreadsheet
// =========================================================================

(function () {
    // URL Endpoint Google Apps Script Web App (Dapat diubah oleh Sensei/Developer)
    window.MensetsuGoogleConfig = {
        // URL Web App Deployment dari script Code.gs
        scriptUrl: localStorage.getItem('mensetsu_gas_url') || 'https://script.google.com/macros/s/AKfycbxvC0Ft6EhIAQY3wNUT3Xk2p0hpYrEpTrHvGSakIXPFiTOmWjtSfllQBvmcchEpKBh7/exec',
        isConfigured: function () {
            return !!this.scriptUrl && this.scriptUrl.startsWith('https://script.google.com');
        }
    };

    window.MensetsuRecorder = {
        mediaStream: null,
        audioContext: null,
        sourceNode: null,
        processorNode: null,
        pcmChunks: [],
        inputSampleRate: 44100,
        recordedAudios: {
            question_intro: null,
            question1: null,
            question2: null,
            question3: null,
            question4: null,
            question5: null
        },
        currentQuestionKey: null,
        isRecording: false,
        recordStartTime: 0,
        timerInterval: null,
        isMicPermissionGranted: false,

        checkPermissionStatus: async function () {
            if (this.isMicPermissionGranted) return 'granted';
            if (navigator.permissions && navigator.permissions.query) {
                try {
                    const status = await navigator.permissions.query({ name: 'microphone' });
                    if (status && status.state === 'granted') {
                        this.isMicPermissionGranted = true;
                        if (!window.MensetsuState) window.MensetsuState = {};
                        window.MensetsuState.micGranted = true;
                    }
                    return status ? status.state : 'prompt';
                } catch (e) {
                    return 'prompt';
                }
            }
            return 'prompt';
        },

        requestPermission: async function () {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                const err = new Error('Browser tidak mendukung getUserMedia');
                console.warn(err);
                throw err;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });

                this.isMicPermissionGranted = true;
                if (!window.MensetsuState) window.MensetsuState = {};
                window.MensetsuState.micGranted = true;

                // Bangunkan AudioContext sejenak agar audio engine web mobile terbuka
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    try {
                        const tempCtx = new AudioCtx();
                        if (tempCtx.state === 'suspended') {
                            await tempCtx.resume();
                        }
                        setTimeout(() => {
                            if (tempCtx.state !== 'closed') tempCtx.close().catch(() => {});
                        }, 120);
                    } catch (e) {}
                }

                // Matikan track stream sementara agar indikator perekaman merah tidak menyala
                // di tab browser sampai pengguna benar-benar menjawab di ruang wawancara
                stream.getTracks().forEach(track => track.stop());

                return true;
            } catch (err) {
                this.isMicPermissionGranted = false;
                if (!window.MensetsuState) window.MensetsuState = {};
                window.MensetsuState.micGranted = false;
                console.warn('Izin akses mikrofon gagal atau ditolak:', err);
                throw err;
            }
        },

        init: function () {
            console.log('Sistem Perekam Suara WAV & Integrasi Cloud Siap.');
            this.createRecorderUI();
        },

        createRecorderUI: function () {
            if (document.getElementById('voice-recorder-hud')) return;

            const hud = document.createElement('div');
            hud.id = 'voice-recorder-hud';
            hud.innerHTML = `
                <div class="recorder-card" id="recorder-card" style="display:none;">
                    <div class="recorder-header">
                        <span class="rec-dot"></span>
                        <span class="rec-title" id="rec-title">Merekam jawaban</span>
                        <span class="rec-timer" id="rec-timer">00:00</span>
                    </div>
                    <div class="rec-visualizer" id="rec-visualizer">
                        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                    </div>
                    <div class="rec-footer">
                        <button type="button" class="btn-rec-stop" id="btn-rec-stop">
                            <span>Selesai merekam (atau tekan B)</span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(hud);

            document.getElementById('btn-rec-stop').addEventListener('click', () => {
                // Pastikan klik tombol di layar juga memicu penyelesaian giliran jawab wawancara
                if (typeof window.handleMobileMicButton === 'function' && this.isRecording) {
                    window.handleMobileMicButton();
                } else {
                    this.stopRecording();
                }
            });
        },

        startRecording: function (questionKey, onStoppedCallback) {
            this.currentQuestionKey = questionKey;
            this.onStopped = onStoppedCallback;
            this.pcmChunks = [];

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (typeof window.showActionToast === 'function') {
                    window.showActionToast('Browser tidak mendukung mikrofon (pastikan akses melalui localhost atau HTTPS).');
                }
                return;
            }

            navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            })
                .then((stream) => {
                    this.mediaStream = stream;
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    this.audioContext = new AudioCtx();
                    this.inputSampleRate = this.audioContext.sampleRate || 44100;

                    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
                    this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

                    const bars = document.querySelectorAll('#rec-visualizer .bar');

                    this.processorNode.onaudioprocess = (e) => {
                        if (!this.isRecording) return;
                        const inputData = e.inputBuffer.getChannelData(0);
                        const copy = new Float32Array(inputData.length);
                        copy.set(inputData);
                        this.pcmChunks.push(copy);

                        // Hitung level volume suara (RMS) untuk menggerakkan grafik bar secara real-time
                        if (bars && bars.length > 0) {
                            let sumSq = 0;
                            for (let i = 0; i < inputData.length; i += 8) {
                                sumSq += inputData[i] * inputData[i];
                            }
                            const rms = Math.sqrt(sumSq / (inputData.length / 8));
                            const level = Math.min(1, rms * 9.5);
                            for (let b = 0; b < bars.length; b++) {
                                const wave = Math.max(0.18, Math.min(1, level * (0.6 + 0.5 * Math.sin(Date.now() * 0.015 + b))));
                                bars[b].style.transform = `scaleY(${wave.toFixed(2)})`;
                            }
                        }
                    };

                    // Hubungkan ke GainNode 0 agar tidak terjadi feedback ke speaker namun prosesor tetap jalan
                    const zeroGain = this.audioContext.createGain();
                    zeroGain.gain.value = 0;
                    this.sourceNode.connect(this.processorNode);
                    this.processorNode.connect(zeroGain);
                    zeroGain.connect(this.audioContext.destination);

                    this.isRecording = true;
                    this.recordStartTime = Date.now();
                    this.showRecorderHUD(true);
                    this.startTimer();
                    window.dispatchEvent(new CustomEvent('mensetsu-rec-started', { detail: { questionKey: this.currentQuestionKey } }));
                })
                .catch((err) => {
                    console.warn('Akses mikrofon gagal atau ditolak:', err);
                    if (typeof window.showActionToast === 'function') {
                        window.showActionToast('Izin mikrofon belum aktif! Klik ikon gembok di address bar browser & izinkan Microphone.');
                    }
                    this.isRecording = true;
                    this.recordStartTime = Date.now();
                    this.showRecorderHUD(true);
                    this.startTimer();
                    window.dispatchEvent(new CustomEvent('mensetsu-rec-started', { detail: { questionKey: this.currentQuestionKey } }));
                });
        },

        stopRecording: function () {
            if (!this.isRecording) return;
            this.isRecording = false;
            this.stopTimer();
            this.showRecorderHUD(false);
            window.dispatchEvent(new CustomEvent('mensetsu-rec-stopped'));

            const targetKey = this.currentQuestionKey || 'question1';

            // Hentikan node audio & mikrofon
            try {
                if (this.processorNode) {
                    this.processorNode.disconnect();
                    this.processorNode.onaudioprocess = null;
                    this.processorNode = null;
                }
                if (this.sourceNode) {
                    this.sourceNode.disconnect();
                    this.sourceNode = null;
                }
                if (this.audioContext && this.audioContext.state !== 'closed') {
                    this.audioContext.close().catch(() => {});
                    this.audioContext = null;
                }
                if (this.mediaStream) {
                    this.mediaStream.getTracks().forEach(track => track.stop());
                    this.mediaStream = null;
                }
            } catch (e) {
                console.warn('Pembersihan stream audio:', e);
            }

            // Konversi rekaman PCM langsung ke format standar WAV (16kHz 16-bit Mono) secara sinkron
            const wavBase64 = this.encodePCMToWavBase64(this.pcmChunks, this.inputSampleRate, 16000);
            this.recordedAudios[targetKey] = wavBase64;
            this.pcmChunks = [];

            const sizeKb = Math.round((wavBase64.length * 3 / 4) / 1024);
            console.log(`Rekaman WAV ${targetKey} berhasil disimpan (${sizeKb} KB).`);

            if (typeof window.showActionToast === 'function') {
                const qLabelMap = {
                    question_intro: 'Perkenalan Diri (Jikoshoukai)',
                    question1: 'Jawaban 1 (Alasan ke Jepang)',
                    question2: 'Jawaban 2 (Alasan Pilih Kampus)',
                    question3: 'Jawaban 3 (Sumber Info Kampus)',
                    question4: 'Jawaban 4 (Kelebihan Diri)',
                    question5: 'Jawaban 5 (Kekurangan & Solusi)'
                };
                const labelTxt = qLabelMap[targetKey] || targetKey;
                window.showActionToast(`Audio ${labelTxt} tersimpan (${sizeKb} KB).`);
            }

            if (this.onStopped) {
                const cb = this.onStopped;
                this.onStopped = null;
                cb(wavBase64);
            }
        },

        // Encoder PCM Float32 -> WAV 16-bit Mono (dengan Auto-Gain Normalization agar suara jernih & lantang di Google Drive)
        encodePCMToWavBase64: function (chunks, srcRate, targetRate) {
            let totalLen = 0;
            for (let i = 0; i < chunks.length; i++) {
                totalLen += chunks[i].length;
            }

            // Jika tidak ada sampel (misal mic belum diizinkan), buat 1 detik WAV hening yang valid agar file tidak korup
            if (totalLen === 0) {
                const silentSamples = new Int16Array(targetRate);
                return this.buildWavDataUrl(silentSamples, targetRate);
            }

            const merged = new Float32Array(totalLen);
            let offset = 0;
            for (let i = 0; i < chunks.length; i++) {
                merged.set(chunks[i], offset);
                offset += chunks[i].length;
            }

            // Downsample ke 16.000 Hz Mono (standar jernih suara manusia & ukuran file ringan untuk upload Drive)
            const ratio = srcRate / targetRate;
            const outLength = Math.max(1, Math.floor(totalLen / ratio));
            const resampled = new Float32Array(outLength);
            let maxPeak = 0;

            for (let i = 0; i < outLength; i++) {
                const start = Math.floor(i * ratio);
                const end = Math.min(totalLen, Math.floor((i + 1) * ratio) || (start + 1));
                let sum = 0;
                let count = 0;
                for (let j = start; j < end; j++) {
                    sum += merged[j];
                    count++;
                }
                const val = count > 0 ? (sum / count) : merged[start];
                resampled[i] = val;
                const abs = Math.abs(val);
                if (abs > maxPeak) maxPeak = abs;
            }

            // Auto-Gain Normalization: angkat volume jika suara mic laptop terlalu pelan (maks penguatan 5.5x)
            let gain = 1.0;
            if (maxPeak > 0.004 && maxPeak < 0.85) {
                gain = Math.min(5.5, 0.85 / maxPeak);
            }

            const pcm16 = new Int16Array(outLength);
            for (let i = 0; i < outLength; i++) {
                const s = Math.max(-1, Math.min(1, resampled[i] * gain));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            return this.buildWavDataUrl(pcm16, targetRate);
        },

        buildWavDataUrl: function (pcm16Samples, sampleRate) {
            const numChannels = 1;
            const bytesPerSample = 2;
            const blockAlign = numChannels * bytesPerSample;
            const byteRate = sampleRate * blockAlign;
            const dataSize = pcm16Samples.length * bytesPerSample;
            const buffer = new ArrayBuffer(44 + dataSize);
            const view = new DataView(buffer);

            const writeStr = (pos, str) => {
                for (let i = 0; i < str.length; i++) {
                    view.setUint8(pos + i, str.charCodeAt(i));
                }
            };

            // RIFF WAVE Header Standar (100% kompatibel dengan pemutar audio Google Drive)
            writeStr(0, 'RIFF');
            view.setUint32(4, 36 + dataSize, true);
            writeStr(8, 'WAVE');
            writeStr(12, 'fmt ');
            view.setUint32(16, 16, true);             // Subchunk1Size (16 untuk PCM)
            view.setUint16(20, 1, true);              // AudioFormat (1 = Linear PCM)
            view.setUint16(22, numChannels, true);    // NumChannels (1 = Mono)
            view.setUint32(24, sampleRate, true);     // SampleRate (16000 Hz)
            view.setUint32(28, byteRate, true);       // ByteRate
            view.setUint16(32, blockAlign, true);     // BlockAlign
            view.setUint16(34, 16, true);             // BitsPerSample (16-bit)
            writeStr(36, 'data');
            view.setUint32(40, dataSize, true);

            let pos = 44;
            for (let i = 0; i < pcm16Samples.length; i++, pos += 2) {
                view.setInt16(pos, pcm16Samples[i], true);
            }

            // Konversi ArrayBuffer ke Base64 Data URL
            const bytes = new Uint8Array(buffer);
            const chunkSize = 0x8000;
            const binaryParts = [];
            for (let i = 0; i < bytes.length; i += chunkSize) {
                binaryParts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize)));
            }
            return 'data:audio/wav;base64,' + btoa(binaryParts.join(''));
        },

        showRecorderHUD: function (visible) {
            const card = document.getElementById('recorder-card');
            if (card) {
                card.style.display = visible ? 'flex' : 'none';
            }
        },

        startTimer: function () {
            const timerEl = document.getElementById('rec-timer');
            this.timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.recordStartTime) / 1000);
                const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
                const s = String(elapsed % 60).padStart(2, '0');
                if (timerEl) timerEl.textContent = `${m}:${s}`;
            }, 500);
        },

        stopTimer: function () {
            if (this.timerInterval) clearInterval(this.timerInterval);
        },

        blobToBase64: function (blob) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        },

        // Kirim Payload Lengkap ke Google Apps Script
        sendDataToGoogleCloud: function () {
            const payload = {
                timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
                sessionId: window.MensetsuState ? window.MensetsuState.sessionId : 'MENSET-UNKNOWN',
                studentName: window.MensetsuState ? window.MensetsuState.studentName : 'Kandidat',
                deviceMode: window.MensetsuState ? window.MensetsuState.deviceMode : 'pc',
                hasWatchedVideo: (window.MensetsuState && window.MensetsuState.hasWatchedVideo) ? 'Sudah Ditonton' : 'Belum Ditonton',
                totalMannerScore: window.MannerEvaluation ? window.MannerEvaluation.getTotalScore() : 0,
                mannerDetails: window.MannerEvaluation ? window.MannerEvaluation.getSummaryPayload().conciseNote : '-',
                audioIntro: this.recordedAudios.question_intro || '',
                audioQ1: this.recordedAudios.question1 || '',
                audioQ2: this.recordedAudios.question2 || '',
                audioQ3: this.recordedAudios.question3 || '',
                audioQ4: this.recordedAudios.question4 || '',
                audioQ5: this.recordedAudios.question5 || ''
            };

            const endpoint = window.MensetsuGoogleConfig.scriptUrl;

            if (!endpoint) {
                console.log('Endpoint Google Apps Script belum dikonfigurasi. Data tersimpan di penyimpanan lokal.', payload);
                localStorage.setItem(`mensetsu_result_${payload.sessionId}`, JSON.stringify(payload));
                return Promise.resolve({ status: 'saved_locally', payload });
            }

            return fetch(endpoint, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script Web App redirect handling
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(() => {
                console.log('Data wawancara dan audio berhasil dikirim ke Google Drive dan Spreadsheet.');
                return { status: 'success' };
            }).catch((err) => {
                console.error('Gagal mengirim ke Google Apps Script:', err);
                return { status: 'error', error: err };
            });
        }
    };

    // Auto-init saat siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.MensetsuRecorder.init());
    } else {
        window.MensetsuRecorder.init();
    }
})();
