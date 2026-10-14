// =========================================================================
// SISTEM PEREKAM SUARA KANDIDAT & PENGIRIMAN GOOGLE APPS SCRIPT
// Mensetsu VR Room - Audio Recorder (WebM/WAV) + Google Drive 5TB & Central Spreadsheet
// =========================================================================

(function () {
    // URL Endpoint Google Apps Script Web App (Dapat diubah oleh Sensei/Developer)
    window.MensetsuGoogleConfig = {
        // Ganti URL di bawah ini dengan URL Web App Deployment dari script Code.gs
        scriptUrl: localStorage.getItem('mensetsu_gas_url') || '',
        isConfigured: function () {
            return !!this.scriptUrl && this.scriptUrl.startsWith('https://script.google.com');
        }
    };

    window.MensetsuRecorder = {
        mediaRecorder: null,
        audioChunks: [],
        recordedAudios: {
            question1: null, // Base64 data
            question2: null
        },
        currentQuestionKey: null,
        isRecording: false,
        recordStartTime: 0,
        timerInterval: null,

        init: function () {
            console.log('Sistem Perekam Suara & Integrasi Cloud Siap.');
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
                    <div class="rec-visualizer">
                        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                        <span class="bar"></span><span class="bar"></span><span class="bar"></span>
                    </div>
                    <div class="rec-footer">
                        <button type="button" class="btn-rec-stop" id="btn-rec-stop">
                            <span>Selesai merekam</span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(hud);

            document.getElementById('btn-rec-stop').addEventListener('click', () => {
                this.stopRecording();
            });
        },

        startRecording: function (questionKey, onStoppedCallback) {
            this.currentQuestionKey = questionKey;
            this.onStopped = onStoppedCallback;
            this.audioChunks = [];

            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    this.mediaStream = stream;
                    this.mediaRecorder = new MediaRecorder(stream, {
                        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
                    });

                    this.mediaRecorder.ondataavailable = (e) => {
                        if (e.data && e.data.size > 0) {
                            this.audioChunks.push(e.data);
                        }
                    };

                    this.mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
                        this.blobToBase64(audioBlob).then((base64) => {
                            this.recordedAudios[this.currentQuestionKey] = base64;
                            console.log(`Rekaman ${this.currentQuestionKey} tersimpan (${Math.round(audioBlob.size / 1024)} KB)`);
                            
                            if (typeof window.showActionToast === 'function') {
                                window.showActionToast(`Audio ${this.currentQuestionKey === 'question1' ? 'jawaban 1' : 'jawaban 2'} tersimpan.`);
                            }

                            if (this.onStopped) this.onStopped(base64);
                        });

                        // Hentikan semua tracks mikrofon
                        if (this.mediaStream) {
                            this.mediaStream.getTracks().forEach(track => track.stop());
                        }
                    };

                    this.mediaRecorder.start(250);
                    this.isRecording = true;
                    this.recordStartTime = Date.now();
                    this.showRecorderHUD(true);
                    this.startTimer();
                })
                .catch((err) => {
                    console.warn('Akses mikrofon tidak diizinkan. Menggunakan mode simulasi:', err);
                    // Fallback jika tidak ada mic: buat rekaman dummy agar simulasi tetap lancar
                    this.isRecording = true;
                    this.showRecorderHUD(true);
                    this.startTimer();
                    this.mediaRecorder = {
                        state: 'recording',
                        stop: () => {
                            const dummyBase64 = 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwE=';
                            this.recordedAudios[this.currentQuestionKey] = dummyBase64;
                            if (this.onStopped) this.onStopped(dummyBase64);
                        }
                    };
                });
        },

        stopRecording: function () {
            if (!this.isRecording) return;
            this.isRecording = false;
            this.stopTimer();
            this.showRecorderHUD(false);

            if (this.mediaRecorder && typeof this.mediaRecorder.stop === 'function') {
                this.mediaRecorder.stop();
            }
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
                audioQ1: this.recordedAudios.question1 || '',
                audioQ2: this.recordedAudios.question2 || ''
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
