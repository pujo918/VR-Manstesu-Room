// =========================================================================
// SISTEM EVALUASI ETIKA MENSETSU OTOMATIS (SANDBOX MANNER EVALUATOR)
// Mensetsu VR Room - Real-Time Manner Scoring (Max 30 Points)
// Sesuai Standar Wawancara Beasiswa S2 Jepang (Akademis) & Skenario Sensei
// =========================================================================

(function () {
    window.MannerEvaluation = {
        score: {
            knock: 0,        // Max 5
            doorHandling: 0, // Max 5
            entryBow: 0,     // Max 5
            seating: 0,       // Max 5
            eyeContact: 0,    // Max 5
            exitManner: 0    // Max 5
        },
        maxScore: 30,
        feedback: {
            knock: 'Belum mengetuk pintu',
            doorHandling: 'Belum masuk ruangan',
            entryBow: 'Belum membungkuk (ojigi)',
            seating: 'Belum duduk di kursi kandidat',
            eyeContact: 'Belum memulai sesi duduk wawancara',
            exitManner: 'Wawancara belum selesai'
        },
        flags: {
            knockCountBeforeEntry: 0,
            hasOpenedDoorFirstTime: false,
            hasEnteredRoom: false,
            hasClosedDoorAfterEntry: false,
            hasBowedAfterEntry: false,
            hasStoodBesideChair: false,
            offeredSeatByNpc: false,
            hasSatDown: false,
            satPrematurely: false,
            interviewFinished: false,
            hasStoodAtEnd: false,
            hasBowedAtEnd: false,
            hasLeftRoom: false
        },
        gazeStats: {
            totalSittingFrames: 0,
            facingInterviewerFrames: 0
        },

        init: function () {
            console.log('Sistem Evaluasi Etika Mensetsu (30 Poin Otomatis) Aktif.');
            this.bindEvents();
            this.startTrackingLoop();
        },

        bindEvents: function () {
            // 1. Pantau Ketukan Pintu
            window.addEventListener('mensetsu-knock', (e) => {
                const count = e.detail ? e.detail.count : 1;
                if (!this.flags.hasEnteredRoom) {
                    this.flags.knockCountBeforeEntry = count;
                    this.evaluateKnock(count);
                }
            });

            // 2. Pantau Ojigi (Membungkuk 30°)
            window.addEventListener('mensetsu-ojigi', () => {
                const camera = document.getElementById('player-camera');
                if (!camera) return;
                const pos = camera.getAttribute('position');

                // Jika berada di dalam ruang wawancara (Z < 5.8) dan belum duduk
                if (pos.z < 5.8 && pos.z > 0.0 && !this.flags.hasSatDown) {
                    this.flags.hasBowedAfterEntry = true;
                    this.score.entryBow = 5;
                    this.feedback.entryBow = 'Ojigi 30° saat masuk dilakukan dengan sempurna (5/5)';
                    console.log('Evaluasi: Ojigi masuk valid (+5 Poin)');
                }
                // Jika wawancara selesai dan pemain membungkuk perpisahan
                else if (this.flags.interviewFinished && this.flags.hasStoodAtEnd) {
                    this.flags.hasBowedAtEnd = true;
                    this.evaluateExit();
                }
            });

            // 3. Pantau NPC Memberikan Instruksi Duduk
            window.addEventListener('mensetsu-npc-permit-sit', () => {
                this.flags.offeredSeatByNpc = true;
                console.log('NPC: "Douzo osuwari kudasai" (Silakan duduk)');
            });
        },

        evaluateKnock: function (count) {
            if (count === 3) {
                this.score.knock = 5;
                this.feedback.knock = 'Ketukan 3 kali tepat sesuai etika formal Jepang (5/5)';
            } else if (count === 2) {
                this.score.knock = 2;
                this.feedback.knock = 'Mengetuk 2 kali (2 ketukan biasanya untuk cek toilet di Jepang) (2/5)';
            } else if (count > 3) {
                this.score.knock = 2;
                this.feedback.knock = `Mengetuk ${count} kali (terlalu banyak / tergesa-gesa) (2/5)`;
            } else {
                this.score.knock = 1;
                this.feedback.knock = 'Mengetuk 1 kali (kurang formal) (1/5)';
            }
        },

        startTrackingLoop: function () {
            const checkInterval = setInterval(() => {
                const camera = document.getElementById('player-camera');
                if (!camera) return;

                const pos = camera.getAttribute('position');
                const isSitting = window.isSitting;

                // A. Deteksi Masuk Ruang Wawancara (Garis Z = 5.8)
                if (pos.z < 5.8 && !this.flags.hasEnteredRoom) {
                    this.flags.hasEnteredRoom = true;
                    console.log('Kandidat melangkah masuk ke Ruang Wawancara.');

                    // Jika masuk tanpa ketuk pintu sama sekali
                    if (this.flags.knockCountBeforeEntry === 0) {
                        this.score.knock = 0;
                        this.feedback.knock = 'Masuk ruangan tanpa mengetuk pintu sama sekali (0/5)';
                    }
                }

                // B. Deteksi Menutup Pintu Setelah Masuk
                if (this.flags.hasEnteredRoom && !this.flags.hasClosedDoorAfterEntry) {
                    // Jika pintu ditutup kembali oleh pemain saat berada di dekat pintu (Z antara 4.0 dan 5.8)
                    if (!window.isDoorOpen && pos.z > 3.8 && pos.z < 5.8) {
                        this.flags.hasClosedDoorAfterEntry = true;
                        this.score.doorHandling = 5;
                        this.feedback.doorHandling = 'Menutup pintu kembali dengan sopan dan tenang (5/5)';
                        console.log('Evaluasi: Pintu ditutup kembali setelah masuk (+5 Poin)');
                    }
                    // Jika kandidat sudah berjalan jauh mendekati kursi (Z < 1.0) tapi pintu masih dibiarkan terbuka!
                    else if (window.isDoorOpen && pos.z < 1.2) {
                        this.flags.hasClosedDoorAfterEntry = true;
                        this.score.doorHandling = 0;
                        this.feedback.doorHandling = 'Pintu dibiarkan terbuka saat menuju kursi kandidat (0/5)';
                        console.log('Evaluasi: Pintu dibiarkan terbuka (0 Poin)');
                    }
                }

                // C. Deteksi Posisi Berdiri di Samping Kursi Kandidat (X ≈ -0.7, Z ≈ -1.0)
                const distToMarker = Math.hypot(pos.x - (-0.7), pos.z - (-1.0));
                if (distToMarker < 0.65 && !isSitting && !this.flags.hasSatDown) {
                    if (!this.flags.hasStoodBesideChair) {
                        this.flags.hasStoodBesideChair = true;
                        console.log('Kandidat berdiri di penanda formal sisi kiri kursi.');
                    }
                }

                // D. Deteksi Duduk di Kursi Kandidat
                if (isSitting && window.currentSeat && window.currentSeat.id === 'candidate-chair') {
                    if (!this.flags.hasSatDown) {
                        this.flags.hasSatDown = true;

                        // Cek apakah berdiri di samping kursi dulu atau langsung duduk
                        if (this.flags.hasStoodBesideChair) {
                            this.score.seating = 5;
                            this.feedback.seating = 'Berdiri di samping kursi dan duduk dengan sopan setelah dipersilakan (5/5)';
                        } else {
                            this.flags.satPrematurely = true;
                            this.score.seating = 1;
                            this.feedback.seating = 'Langsung duduk tanpa berdiri di samping kursi kandidat terlebih dahulu (1/5)';
                        }
                        console.log(`Evaluasi Duduk: ${this.feedback.seating}`);
                    }

                    // E. Pelacakan Kontak Mata (Eye Contact Tracker) saat Duduk
                    this.trackEyeContact(camera);
                }

                // F. Deteksi Wawancara Selesai & Berdiri
                if (this.flags.interviewFinished && !isSitting && this.flags.hasSatDown && !this.flags.hasStoodAtEnd) {
                    this.flags.hasStoodAtEnd = true;
                    console.log('Kandidat berdiri di akhir wawancara.');
                }

                // G. Deteksi Keluar Ruangan (Z > 6.0)
                if (this.flags.interviewFinished && pos.z > 6.2 && !this.flags.hasLeftRoom) {
                    this.flags.hasLeftRoom = true;
                    this.evaluateExit();
                    this.showEvaluationModal();
                }

            }, 250);
        },

        // Pelacak Kontak Mata: Memastikan pemain memandang ke arah meja pewawancara (-Z)
        trackEyeContact: function (camera) {
            this.gazeStats.totalSittingFrames++;

            let isFacing = false;
            const lookControls = camera.components['look-controls'];
            if (lookControls && lookControls.yawObject) {
                // Yaw sudut pandang (dalam radian)
                let yaw = lookControls.yawObject.rotation.y % (Math.PI * 2);
                if (yaw > Math.PI) yaw -= Math.PI * 2;
                if (yaw < -Math.PI) yaw += Math.PI * 2;

                // Menghadap ke arah -Z (pewawancara) adalah sekitar yaw 0 (± 38 derajat / 0.66 rad)
                if (Math.abs(yaw) < 0.66) {
                    isFacing = true;
                }
            } else {
                isFacing = true; // Fallback
            }

            if (isFacing) {
                this.gazeStats.facingInterviewerFrames++;
            }

            // Hitung Rasio Kontak Mata
            const ratio = this.gazeStats.facingInterviewerFrames / Math.max(1, this.gazeStats.totalSittingFrames);
            const percentage = Math.round(ratio * 100);

            if (percentage >= 65) {
                this.score.eyeContact = 5;
                this.feedback.eyeContact = `Kontak mata fokus ke pewawancara: ${percentage}% (5/5)`;
            } else if (percentage >= 40) {
                this.score.eyeContact = 3;
                this.feedback.eyeContact = `Kontak mata cukup, sesekali melihat ke arah lain: ${percentage}% (3/5)`;
            } else {
                this.score.eyeContact = 1;
                this.feedback.eyeContact = `Kontak mata kurang, pandangan sering teralihkan: ${percentage}% (1/5)`;
            }
        },

        evaluateExit: function () {
            let exitPts = 0;
            const reasons = [];

            if (this.flags.hasStoodAtEnd) {
                exitPts += 2;
                reasons.push('Berdiri setelah selesai');
            }
            if (this.flags.hasBowedAtEnd) {
                exitPts += 3;
                reasons.push('Melakukan Ojigi salam penutup (Shitsurei itashimashita)');
            }

            this.score.exitManner = Math.min(5, exitPts);
            this.feedback.exitManner = reasons.length > 0 ? `${reasons.join(', ')} (${this.score.exitManner}/5)` : 'Keluar tanpa salam perpisahan (0/5)';
        },

        getTotalScore: function () {
            return (
                this.score.knock +
                this.score.doorHandling +
                this.score.entryBow +
                this.score.seating +
                this.score.eyeContact +
                this.score.exitManner
            );
        },

        getSummaryPayload: function () {
            const studentName = window.MensetsuState ? window.MensetsuState.studentName : 'Kandidat';
            const sessionId = window.MensetsuState ? window.MensetsuState.sessionId : 'MENSET-000000';
            const devMode = window.MensetsuState ? window.MensetsuState.deviceMode : 'pc';

            return {
                timestamp: new Date().toISOString(),
                sessionId: sessionId,
                studentName: studentName,
                deviceMode: devMode,
                totalMannerScore: this.getTotalScore(),
                maxMannerScore: this.maxScore,
                breakdown: {
                    knock: { score: this.score.knock, max: 5, note: this.feedback.knock },
                    doorHandling: { score: this.score.doorHandling, max: 5, note: this.feedback.doorHandling },
                    entryBow: { score: this.score.entryBow, max: 5, note: this.feedback.entryBow },
                    seating: { score: this.score.seating, max: 5, note: this.feedback.seating },
                    eyeContact: { score: this.score.eyeContact, max: 5, note: this.feedback.eyeContact },
                    exitManner: { score: this.score.exitManner, max: 5, note: this.feedback.exitManner }
                },
                conciseNote: `Ketuk: ${this.score.knock}/5 | Pintu: ${this.score.doorHandling}/5 | Ojigi Masuk: ${this.score.entryBow}/5 | Duduk: ${this.score.seating}/5 | Kontak Mata: ${this.score.eyeContact}/5 | Keluar: ${this.score.exitManner}/5`
            };
        },

        showEvaluationModal: function () {
            if (document.getElementById('manner-score-modal')) return;

            const payload = this.getSummaryPayload();
            const modal = document.createElement('div');
            modal.id = 'manner-score-modal';
            modal.innerHTML = `
                <div class="score-modal-card">
                    <div class="score-doc-header">
                        <div class="doc-header-titles">
                            <h2 class="doc-inst-title">大学院入試 面接マナー評価表</h2>
                            <p class="doc-sub-title">Lembar Penilaian Etika Wawancara Pascasarjana Jepang</p>
                        </div>
                        <div class="doc-meta-grid">
                            <div class="meta-item"><span class="meta-label">Kandidat:</span> <strong>${payload.studentName}</strong></div>
                            <div class="meta-item"><span class="meta-label">ID Sesi:</span> <code>${payload.sessionId}</code></div>
                            <div class="meta-item"><span class="meta-label">Perangkat:</span> <span>${payload.deviceMode.toUpperCase()}</span></div>
                            <div class="meta-item"><span class="meta-label">Tanggal:</span> <span>${new Date().toLocaleDateString('ja-JP')}</span></div>
                        </div>
                    </div>

                    <div class="score-summary-bar">
                        <div class="summary-score-block">
                            <div class="summary-score-label">Nilai Etika & Tata Krama (Kategori I)</div>
                            <div class="summary-score-value">${payload.totalMannerScore} <span class="max-denom">/ ${payload.maxMannerScore}</span></div>
                            <div class="summary-score-status">${this.getGradeTitle(payload.totalMannerScore)}</div>
                        </div>
                        <div class="hanko-seal ${payload.totalMannerScore >= 24 ? 'seal-pass' : 'seal-review'}">
                            <div class="hanko-circle">
                                <span class="hanko-text">${payload.totalMannerScore >= 24 ? '合格' : '要復習'}</span>
                                <span class="hanko-sub">${payload.totalMannerScore >= 24 ? 'LULUS' : 'EVALUASI'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="eval-table-container">
                        <table class="eval-sheet-table">
                            <thead>
                                <tr>
                                    <th style="width: 32px;">No</th>
                                    <th>Aspek Penilaian</th>
                                    <th>Standar Formal</th>
                                    <th style="width: 60px;">Skor</th>
                                    <th>Catatan Sistem</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="text-center">1</td>
                                    <td><strong>Ketukan pintu</strong><br><span class="jp-sub">入室前のノック</span></td>
                                    <td>3 ketukan tenang</td>
                                    <td class="text-center score-cell">${payload.breakdown.knock.score}/5</td>
                                    <td>${payload.breakdown.knock.note}</td>
                                </tr>
                                <tr>
                                    <td class="text-center">2</td>
                                    <td><strong>Penutupan pintu</strong><br><span class="jp-sub">ドアの開閉動作</span></td>
                                    <td>Tutup pintu kembali dengan tenang</td>
                                    <td class="text-center score-cell">${payload.breakdown.doorHandling.score}/5</td>
                                    <td>${payload.breakdown.doorHandling.note}</td>
                                </tr>
                                <tr>
                                    <td class="text-center">3</td>
                                    <td><strong>Ojigi saat masuk</strong><br><span class="jp-sub">入室時のお辞儀</span></td>
                                    <td>Membungkuk 30 derajat setelah salam masuk</td>
                                    <td class="text-center score-cell">${payload.breakdown.entryBow.score}/5</td>
                                    <td>${payload.breakdown.entryBow.note}</td>
                                </tr>
                                <tr>
                                    <td class="text-center">4</td>
                                    <td><strong>Etika duduk</strong><br><span class="jp-sub">着席のマナー</span></td>
                                    <td>Berdiri di samping kursi, duduk setelah dipersilakan</td>
                                    <td class="text-center score-cell">${payload.breakdown.seating.score}/5</td>
                                    <td>${payload.breakdown.seating.note}</td>
                                </tr>
                                <tr>
                                    <td class="text-center">5</td>
                                    <td><strong>Kontak mata</strong><br><span class="jp-sub">アイコンタクト</span></td>
                                    <td>Fokus pandangan ke arah pewawancara</td>
                                    <td class="text-center score-cell">${payload.breakdown.eyeContact.score}/5</td>
                                    <td>${payload.breakdown.eyeContact.note}</td>
                                </tr>
                                <tr>
                                    <td class="text-center">6</td>
                                    <td><strong>Etika keluar ruangan</strong><br><span class="jp-sub">退室のマナー</span></td>
                                    <td>Berdiri, salam penutup, dan ojigi perpisahan</td>
                                    <td class="text-center score-cell">${payload.breakdown.exitManner.score}/5</td>
                                    <td>${payload.breakdown.exitManner.note}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="sensei-notice-box">
                        <strong>Catatan untuk Sensei:</strong> Nilai di atas merupakan evaluasi otomatis sistem untuk Kategori I (Etika & Tata Krama, maks 30 poin). Nilai Kategori II (Bahasa & Kelancaran, maks 35 poin) dan Kategori III (Struktur Jawaban, maks 35 poin) dinilai manual oleh Sensei pada Google Spreadsheet.
                    </div>

                    <div class="score-modal-actions">
                        <button type="button" class="btn-primary" id="btn-restart-sim">Ulangi simulasi</button>
                        <button type="button" class="btn-secondary" id="btn-close-score">Selesai dan tutup</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('btn-close-score').addEventListener('click', () => {
                modal.remove();
            });
            document.getElementById('btn-restart-sim').addEventListener('click', () => {
                window.location.reload();
            });
        },

        showFinalScoreModal: function () {
            this.showEvaluationModal();
        },

        getGradeTitle: function (score) {
            if (score >= 28) return 'Sangat Baik (S)';
            if (score >= 24) return 'Memenuhi Standar (A)';
            if (score >= 18) return 'Cukup Baik, Perlu Latihan (B)';
            return 'Perlu Latihan Ulang Etika (C)';
        }
    };

    // Auto-init saat siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.MannerEvaluation.init());
    } else {
        window.MannerEvaluation.init();
    }
})();
