// =========================================================================
// SISTEM EVALUASI ETIKA MENSETSU OTOMATIS (SANDBOX MANNER EVALUATOR)
// Mensetsu VR Room - Real-Time Manner Scoring (Max 30 Points)
// Sesuai Standar Wawancara Beasiswa S2 Jepang (Akademis) & Skenario Sensei
// =========================================================================

(function () {
    window.MannerEvaluation = {
        score: {
            // Kategori I: Etika & Tata Krama (Maks 30)
            knock: 0,        // Max 5
            doorHandling: 0, // Max 5
            entryBow: 0,     // Max 5
            seating: 0,      // Max 5
            eyeContact: 0,   // Max 5
            exitManner: 0,   // Max 5

            // Kategori II: Bahasa Jepang & Kelancaran Vokal (Maks 35)
            japaneseDetection: 0, // Max 15
            fluencyDuration: 0,   // Max 10
            vocalClarity: 0,      // Max 10

            // Kategori III: Struktur & Kesesuaian Isi Jawaban (Maks 35)
            taskFulfillment: 0,   // Max 15
            relevanceKeywords: 0, // Max 10
            keigoPoliteness: 0    // Max 10
        },
        maxScore: 100,
        maxMannerScore: 30,
        maxLanguageScore: 35,
        maxContentScore: 35,
        feedback: {
            knock: 'Belum mengetuk pintu',
            doorHandling: 'Belum masuk ruangan',
            entryBow: 'Belum membungkuk (ojigi)',
            seating: 'Belum duduk di kursi kandidat',
            eyeContact: 'Belum memulai sesi duduk wawancara',
            exitManner: 'Wawancara belum selesai',

            japaneseDetection: 'Menunggu analisis audio',
            fluencyDuration: 'Menunggu analisis durasi',
            vocalClarity: 'Menunggu rekaman suara',

            taskFulfillment: 'Menunggu penyelesaian 6 soal',
            relevanceKeywords: 'Menunggu analisis kata kunci',
            keigoPoliteness: 'Menunggu analisis kesopanan Keigo'
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

        reset: function () {
            this.score = {
                knock: 0,
                doorHandling: 0,
                entryBow: 0,
                seating: 0,
                eyeContact: 0,
                exitManner: 0,

                japaneseDetection: 0,
                fluencyDuration: 0,
                vocalClarity: 0,

                taskFulfillment: 0,
                relevanceKeywords: 0,
                keigoPoliteness: 0
            };
            this.feedback = {
                knock: 'Belum mengetuk pintu',
                doorHandling: 'Belum masuk ruangan',
                entryBow: 'Belum membungkuk (ojigi)',
                seating: 'Belum duduk di kursi kandidat',
                eyeContact: 'Belum memulai sesi duduk wawancara',
                exitManner: 'Wawancara belum selesai',

                japaneseDetection: 'Menunggu analisis audio',
                fluencyDuration: 'Menunggu analisis durasi',
                vocalClarity: 'Menunggu rekaman suara',

                taskFulfillment: 'Menunggu penyelesaian 6 soal',
                relevanceKeywords: 'Menunggu analisis kata kunci',
                keigoPoliteness: 'Menunggu analisis kesopanan Keigo'
            };
            this.flags = {
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
            };
            this.gazeStats = {
                totalSittingFrames: 0,
                facingInterviewerFrames: 0
            };
            console.log('Evaluasi Etika telah di-reset ke kondisi awal.');
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

        evaluateSpeechAndContent: function () {
            const recorder = window.MensetsuRecorder;
            const transcripts = (recorder && recorder.transcripts) ? recorder.transcripts : {};
            const metrics = (recorder && recorder.speechMetrics) ? recorder.speechMetrics : {};
            const recordedAudios = (recorder && recorder.recordedAudios) ? recorder.recordedAudios : {};

            const keys = ['question_intro', 'question1', 'question2', 'question3', 'question4', 'question5'];

            // 1. KATEGORI II - BAHASA JEPANG & KELANCARAN VOKAL (MAKS 35)
            // A. Deteksi Bahasa Jepang (Maks 15)
            const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
            let jpQuestionCount = 0;
            let totalJpChars = 0;
            let totalSpeechSeconds = 0;
            let validAudioCount = 0;

            keys.forEach(k => {
                const text = (transcripts[k] || '').trim();
                const metric = metrics[k] || {};
                const audio = recordedAudios[k];

                if (jpRegex.test(text)) {
                    jpQuestionCount++;
                    const matches = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g);
                    if (matches) totalJpChars += matches.length;
                }
                if (metric.durationSec > 0) {
                    totalSpeechSeconds += metric.durationSec;
                }
                if (audio && audio.length > 500) {
                    validAudioCount++;
                }
            });

            if (jpQuestionCount >= 4 || totalJpChars >= 40) {
                this.score.japaneseDetection = 15;
                this.feedback.japaneseDetection = `Pengucapan bahasa Jepang terdeteksi jelas pada ${jpQuestionCount}/6 pertanyaan (${totalJpChars} karakter).`;
            } else if (jpQuestionCount >= 2 || totalJpChars >= 15) {
                this.score.japaneseDetection = 11;
                this.feedback.japaneseDetection = `Bahasa Jepang terdeteksi pada ${jpQuestionCount}/6 pertanyaan (${totalJpChars} karakter).`;
            } else if (jpQuestionCount >= 1 || totalJpChars >= 5) {
                this.score.japaneseDetection = 7;
                this.feedback.japaneseDetection = `Sebagian kecil kosakata bahasa Jepang terdeteksi (${totalJpChars} karakter).`;
            } else if (validAudioCount >= 3) {
                this.score.japaneseDetection = 6;
                this.feedback.japaneseDetection = `Audio respon suara terekam (${validAudioCount} pertanyaan). Evaluasi detail aksen & kata oleh Sensei.`;
            } else {
                this.score.japaneseDetection = 0;
                this.feedback.japaneseDetection = 'Tidak terdeteksi pelafalan bahasa Jepang atau suara hening.';
            }

            // B. Durasi Respon & Kelancaran Pacing (Maks 10)
            const avgDuration = validAudioCount > 0 ? (totalSpeechSeconds / validAudioCount) : 0;
            if (avgDuration >= 15 && avgDuration <= 65) {
                this.score.fluencyDuration = 10;
                this.feedback.fluencyDuration = `Durasi bicara sangat ideal (rata-rata ${Math.round(avgDuration)} dtk/jawaban, total ${totalSpeechSeconds} dtk).`;
            } else if ((avgDuration >= 8 && avgDuration < 15) || (avgDuration > 65 && avgDuration <= 95)) {
                this.score.fluencyDuration = 7;
                this.feedback.fluencyDuration = `Durasi bicara cukup baik (${Math.round(avgDuration)} dtk/jawaban). Standar ideal 20–60 dtk.`;
            } else if (avgDuration > 0) {
                this.score.fluencyDuration = 4;
                this.feedback.fluencyDuration = avgDuration < 8 ? `Jawaban terlalu singkat (${Math.round(avgDuration)} dtk).` : `Jawaban agak bertele-tele (${Math.round(avgDuration)} dtk).`;
            } else {
                this.score.fluencyDuration = 0;
                this.feedback.fluencyDuration = 'Kandidat tidak melakukan perekaman jawaban suara.';
            }

            // C. Kejelasan & Energi Audio (Maks 10)
            if (validAudioCount === 6) {
                this.score.vocalClarity = 10;
                this.feedback.vocalClarity = 'Seluruh 6 sesi rekaman audio tersimpan dengan volume suara jelas.';
            } else if (validAudioCount >= 4) {
                this.score.vocalClarity = 8;
                this.feedback.vocalClarity = `${validAudioCount} dari 6 audio berhasil direkam dengan baik.`;
            } else if (validAudioCount >= 1) {
                this.score.vocalClarity = 5;
                this.feedback.vocalClarity = `Hanya ${validAudioCount} audio terisi. Pastikan mic ditekan dengan benar saat menjawab.`;
            } else {
                this.score.vocalClarity = 0;
                this.feedback.vocalClarity = 'Tidak ada rekaman audio suara yang tersimpan.';
            }

            // 2. KATEGORI III - STRUKTUR & KESESUAIAN ISI JAWABAN (MAKS 35)
            // A. Kelengkapan Menjawab 6 Tahapan (Maks 15)
            if (validAudioCount === 6) {
                this.score.taskFulfillment = 15;
                this.feedback.taskFulfillment = 'Lengkap: Menuntaskan Jikoshoukai + 5 pertanyaan pewawancara.';
            } else if (validAudioCount === 5) {
                this.score.taskFulfillment = 12;
                this.feedback.taskFulfillment = 'Menjawab 5 dari 6 tahapan wawancara.';
            } else if (validAudioCount >= 3) {
                this.score.taskFulfillment = 8;
                this.feedback.taskFulfillment = `Menjawab ${validAudioCount} dari 6 tahapan. Sebagian pertanyaan dilewati.`;
            } else if (validAudioCount >= 1) {
                this.score.taskFulfillment = 4;
                this.feedback.taskFulfillment = `Hanya menjawab ${validAudioCount} tahapan. Wawancara belum tuntas.`;
            } else {
                this.score.taskFulfillment = 0;
                this.feedback.taskFulfillment = 'Tidak ada pertanyaan wawancara yang dijawab.';
            }

            // B. Kesesuaian Kata Kunci Topik / Content Relevance (Maks 10)
            const topicKeywords = {
                question_intro: [/私/, /名前/, /大学/, /専攻/, /よろしく/, /申します/, /インドネシア/, /学生/],
                question1: [/日本/, /留学/, /理由/, /学び/, /技術/, /文化/, /きっかけ/, /将来/, /先進/],
                question2: [/大学/, /志望/, /研究/, /教授/, /カリキュラム/, /施設/, /魅力/, /環境/, /専門/],
                question3: [/情報/, /ホームページ/, /サイト/, /先輩/, /説明会/, /調べ/, /知った/, /ネット/, /先生/],
                question4: [/長所/, /強み/, /得意/, /努力/, /粘り強/, /経験/, /自信/, /責任/, /諦め/],
                question5: [/短所/, /弱み/, /克服/, /改善/, /注意/, /気をつけて/, /努力/, /意識/, /直す/]
            };

            let matchedTopics = 0;
            keys.forEach(k => {
                const text = transcripts[k] || '';
                const patterns = topicKeywords[k] || [];
                const hasMatch = patterns.some(p => p.test(text));
                if (hasMatch) matchedTopics++;
            });

            if (matchedTopics >= 4) {
                this.score.relevanceKeywords = 10;
                this.feedback.relevanceKeywords = `Isi jawaban sangat relevan (${matchedTopics}/6 topik mencocokkan kata kunci tema).`;
            } else if (matchedTopics >= 2) {
                this.score.relevanceKeywords = 7;
                this.feedback.relevanceKeywords = `Cukup relevan (${matchedTopics}/6 topik mencocokkan kata kunci).`;
            } else if (validAudioCount >= 4) {
                this.score.relevanceKeywords = 5;
                this.feedback.relevanceKeywords = 'Jawaban audio terekam. Relevansi isi dapat disempurnakan oleh Sensei.';
            } else {
                this.score.relevanceKeywords = Math.min(4, validAudioCount * 1);
                this.feedback.relevanceKeywords = 'Kata kunci tema belum banyak terdeteksi pada teks jawaban.';
            }

            // C. Tingkat Kesopanan Bahasa Jepang / Keigo Politeness (Maks 10)
            const politePatterns = [/です/, /ます/, /ございま/, /いたしました/, /存じま/, /いただきます/, /おります/];
            let politeCount = 0;
            keys.forEach(k => {
                const text = transcripts[k] || '';
                politePatterns.forEach(p => {
                    const matches = text.match(new RegExp(p.source, 'g'));
                    if (matches) politeCount += matches.length;
                });
            });

            if (politeCount >= 8) {
                this.score.keigoPoliteness = 10;
                this.feedback.keigoPoliteness = `Penggunaan bahasa formal sopan sangat konsisten (${politeCount} bentuk Teineigo/Keigo).`;
            } else if (politeCount >= 4) {
                this.score.keigoPoliteness = 7;
                this.feedback.keigoPoliteness = `Penggunaan bahasa sopan cukup baik (${politeCount} bentuk Teineigo terdeteksi).`;
            } else if (validAudioCount >= 4) {
                this.score.keigoPoliteness = 5;
                this.feedback.keigoPoliteness = 'Sikap santun terdeteksi. Evaluasi detail Keigo/tata bahasa dinilai oleh Sensei.';
            } else {
                this.score.keigoPoliteness = Math.min(3, validAudioCount * 1);
                this.feedback.keigoPoliteness = 'Bentuk formal sopan (Desu/Masu) belum terdeteksi secara konsisten.';
            }
        },

        getMannerTotalScore: function () {
            return (
                this.score.knock +
                this.score.doorHandling +
                this.score.entryBow +
                this.score.seating +
                this.score.eyeContact +
                this.score.exitManner
            );
        },

        getLanguageTotalScore: function () {
            return (
                this.score.japaneseDetection +
                this.score.fluencyDuration +
                this.score.vocalClarity
            );
        },

        getContentTotalScore: function () {
            return (
                this.score.taskFulfillment +
                this.score.relevanceKeywords +
                this.score.keigoPoliteness
            );
        },

        getTotalScore: function () {
            return this.getMannerTotalScore() + this.getLanguageTotalScore() + this.getContentTotalScore();
        },

        getGradeTitle: function (score) {
            if (score >= 90) return 'Sangat Memuaskan (S)';
            if (score >= 80) return 'Memenuhi Standar (A)';
            if (score >= 70) return 'Cukup Baik (B)';
            return 'Perlu Latihan Intensif (C)';
        },

        getSummaryPayload: function () {
            this.evaluateSpeechAndContent();

            const studentName = window.MensetsuState ? window.MensetsuState.studentName : 'Kandidat';
            const sessionId = window.MensetsuState ? window.MensetsuState.sessionId : 'MENSET-000000';
            const devMode = window.MensetsuState ? window.MensetsuState.deviceMode : 'pc';

            const mannerTot = this.getMannerTotalScore();
            const langTot = this.getLanguageTotalScore();
            const contentTot = this.getContentTotalScore();
            const grandTot = mannerTot + langTot + contentTot;

            const recorder = window.MensetsuRecorder;
            const transcripts = (recorder && recorder.transcripts) ? recorder.transcripts : {};

            return {
                timestamp: new Date().toISOString(),
                sessionId: sessionId,
                studentName: studentName,
                deviceMode: devMode,
                totalScore: grandTot,
                maxScore: this.maxScore,
                totalMannerScore: mannerTot,
                maxMannerScore: this.maxMannerScore,
                totalLanguageScore: langTot,
                maxLanguageScore: this.maxLanguageScore,
                totalContentScore: contentTot,
                maxContentScore: this.maxContentScore,
                gradeTitle: this.getGradeTitle(grandTot),

                breakdown: {
                    // Kat I
                    knock: { score: this.score.knock, max: 5, note: this.feedback.knock },
                    doorHandling: { score: this.score.doorHandling, max: 5, note: this.feedback.doorHandling },
                    entryBow: { score: this.score.entryBow, max: 5, note: this.feedback.entryBow },
                    seating: { score: this.score.seating, max: 5, note: this.feedback.seating },
                    eyeContact: { score: this.score.eyeContact, max: 5, note: this.feedback.eyeContact },
                    exitManner: { score: this.score.exitManner, max: 5, note: this.feedback.exitManner },
                    // Kat II
                    japaneseDetection: { score: this.score.japaneseDetection, max: 15, note: this.feedback.japaneseDetection },
                    fluencyDuration: { score: this.score.fluencyDuration, max: 10, note: this.feedback.fluencyDuration },
                    vocalClarity: { score: this.score.vocalClarity, max: 10, note: this.feedback.vocalClarity },
                    // Kat III
                    taskFulfillment: { score: this.score.taskFulfillment, max: 15, note: this.feedback.taskFulfillment },
                    relevanceKeywords: { score: this.score.relevanceKeywords, max: 10, note: this.feedback.relevanceKeywords },
                    keigoPoliteness: { score: this.score.keigoPoliteness, max: 10, note: this.feedback.keigoPoliteness }
                },

                transcripts: {
                    intro: transcripts.question_intro || '',
                    q1: transcripts.question1 || '',
                    q2: transcripts.question2 || '',
                    q3: transcripts.question3 || '',
                    q4: transcripts.question4 || '',
                    q5: transcripts.question5 || ''
                },

                conciseNote: `Etika: ${mannerTot}/30 | Bahasa: ${langTot}/35 | Isi: ${contentTot}/35`,
                languageNote: `Jepang: ${this.score.japaneseDetection}/15 | Pacing: ${this.score.fluencyDuration}/10 | Audio: ${this.score.vocalClarity}/10`,
                contentNote: `Kelengkapan: ${this.score.taskFulfillment}/15 | Kata Kunci: ${this.score.relevanceKeywords}/10 | Keigo: ${this.score.keigoPoliteness}/10`
            };
        },

        showEvaluationModal: function () {
            if (document.getElementById('manner-score-modal')) return;

            const payload = this.getSummaryPayload();

            // Kirim otomatis data lengkap yang terbarui ke Google Apps Script / Spreadsheet
            if (window.MensetsuRecorder && typeof window.MensetsuRecorder.sendDataToGoogleCloud === 'function') {
                try { window.MensetsuRecorder.sendDataToGoogleCloud(); } catch (_) {}
            }

            const modal = document.createElement('div');
            modal.id = 'manner-score-modal';
            modal.innerHTML = `
                <div class="score-modal-card">
                    <div class="score-doc-header">
                        <div class="doc-header-titles">
                            <h2 class="doc-inst-title">大学院入試 面接総合評価表</h2>
                            <p class="doc-sub-title">Lembar Penilaian Komprehensif Wawancara Beasiswa S2 Jepang (100 Poin Penuh)</p>
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
                            <div class="summary-score-label">NILAI TOTAL HASIL EVALUASI OTOMATIS</div>
                            <div class="summary-score-value">${payload.totalScore} <span class="max-denom">/ ${payload.maxScore}</span></div>
                            <div class="summary-score-status">${payload.gradeTitle}</div>
                            <div class="score-pills-row">
                                <span class="score-pill-sub">Etika: <strong>${payload.totalMannerScore}/30</strong></span>
                                <span class="score-pill-sub">Bahasa: <strong>${payload.totalLanguageScore}/35</strong></span>
                                <span class="score-pill-sub">Isi: <strong>${payload.totalContentScore}/35</strong></span>
                            </div>
                        </div>
                        <div class="hanko-seal ${payload.totalScore >= 70 ? 'seal-pass' : 'seal-review'}">
                            <div class="hanko-circle">
                                <span class="hanko-text">${payload.totalScore >= 70 ? '合格' : '要復習'}</span>
                                <span class="hanko-sub">${payload.totalScore >= 70 ? 'LULUS' : 'EVALUASI'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="eval-table-container">
                        <table class="eval-sheet-table">
                            <thead>
                                <tr>
                                    <th style="width: 28px;">No</th>
                                    <th>Aspek Penilaian</th>
                                    <th>Standar Formal</th>
                                    <th style="width: 58px;">Skor</th>
                                    <th>Catatan Hasil Deteksi Sistem</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- KATEGORI I: ETIKA -->
                                <tr class="category-row-header">
                                    <td colspan="5">KATEGORI I: ETIKA & TATA KRAMA MENSETSU (${payload.totalMannerScore} / 30 Poin)</td>
                                </tr>
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
                                    <td>Membungkuk 30° setelah salam masuk</td>
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

                                <!-- KATEGORI II: BAHASA JEPANG & KELANCARAN -->
                                <tr class="category-row-header">
                                    <td colspan="5">KATEGORI II: BAHASA JEPANG & KELANCARAN VOKAL (${payload.totalLanguageScore} / 35 Poin)</td>
                                </tr>
                                <tr>
                                    <td class="text-center">7</td>
                                    <td><strong>Pelafalan Bahasa Jepang</strong><br><span class="jp-sub">日本語の発音・語彙</span></td>
                                    <td>Berbicara dalam kosakata & huruf Jepang</td>
                                    <td class="text-center score-cell">${payload.breakdown.japaneseDetection.score}/15</td>
                                    <td>${payload.breakdown.japaneseDetection.note}</td>
                                </tr>
                                <tr>
                                    <td class="text-center">8</td>
                                    <td><strong>Kelancaran & Durasi Respon</strong><br><span class="jp-sub">回答の時間配分</span></td>
                                    <td>Durasi jawaban ideal 20–60 detik per soal</td>
                                    <td class="text-center score-cell">${payload.breakdown.fluencyDuration.score}/10</td>
                                    <td>${payload.breakdown.fluencyDuration.note}</td>
                                </tr>
                                <tr>
                                    <td class="text-center">9</td>
                                    <td><strong>Kejelasan & Energi Vokal</strong><br><span class="jp-sub">声の明瞭さ・大きさ</span></td>
                                    <td>Suara jelas, lantang, dan terekam sempurna</td>
                                    <td class="text-center score-cell">${payload.breakdown.vocalClarity.score}/10</td>
                                    <td>${payload.breakdown.vocalClarity.note}</td>
                                </tr>

                                <!-- KATEGORI III: STRUKTUR & ISI JAWABAN -->
                                <tr class="category-row-header">
                                    <td colspan="5">KATEGORI III: STRUKTUR & KESESUAIAN ISI JAWABAN (${payload.totalContentScore} / 35 Poin)</td>
                                </tr>
                                <tr>
                                    <td class="text-center">10</td>
                                    <td><strong>Kelengkapan Soal Wawancara</strong><br><span class="jp-sub">質問項目の完遂度</span></td>
                                    <td>Menjawab 6 tahapan (Intro s.d. Pertanyaan 5)</td>
                                    <td class="text-center score-cell">${payload.breakdown.taskFulfillment.score}/15</td>
                                    <td>${payload.breakdown.taskFulfillment.note}</td>
                                </tr>
                                <tr>
                                    <td class="text-center">11</td>
                                    <td><strong>Kesesuaian Tema / Kata Kunci</strong><br><span class="jp-sub">質問に対する妥当性</span></td>
                                    <td>Isi respon mencocokkan kata kunci pertanyaan</td>
                                    <td class="text-center score-cell">${payload.breakdown.relevanceKeywords.score}/10</td>
                                    <td>${payload.breakdown.relevanceKeywords.note}</td>
                                </tr>
                                <tr>
                                    <td class="text-center">12</td>
                                    <td><strong>Tingkat Kesopanan (Keigo)</strong><br><span class="jp-sub">敬語・丁寧語の表現</span></td>
                                    <td>Menggunakan pola kalimat sopan (Desu/Masu)</td>
                                    <td class="text-center score-cell">${payload.breakdown.keigoPoliteness.score}/10</td>
                                    <td>${payload.breakdown.keigoPoliteness.note}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Transkrip Rekaman Suara -->
                    <button type="button" class="transcript-toggle-btn" id="btn-toggle-transcript">
                        <span>🎙️ Lihat Transkrip Suara Jawaban Anda (ja-JP)</span>
                        <span id="trans-toggle-arrow">▼</span>
                    </button>
                    <div class="transcript-list" id="transcript-container" style="display: none;">
                        <div class="transcript-item">
                            <div class="transcript-label">自己紹介（Perkenalan Diri / Intro）:</div>
                            <div class="transcript-text">${payload.transcripts.intro || '<em style="color:#64748b;">(Tidak ada transkrip teks terekam)</em>'}</div>
                        </div>
                        <div class="transcript-item">
                            <div class="transcript-label">Q1. 日本への留学理由（Alasan Studi ke Jepang）:</div>
                            <div class="transcript-text">${payload.transcripts.q1 || '<em style="color:#64748b;">(Tidak ada transkrip teks terekam)</em>'}</div>
                        </div>
                        <div class="transcript-item">
                            <div class="transcript-label">Q2. 志望理由（Alasan Memilih Kampus）:</div>
                            <div class="transcript-text">${payload.transcripts.q2 || '<em style="color:#64748b;">(Tidak ada transkrip teks terekam)</em>'}</div>
                        </div>
                        <div class="transcript-item">
                            <div class="transcript-label">Q3. 情報の入手方法（Cara Tahu Info Kampus）:</div>
                            <div class="transcript-text">${payload.transcripts.q3 || '<em style="color:#64748b;">(Tidak ada transkrip teks terekam)</em>'}</div>
                        </div>
                        <div class="transcript-item">
                            <div class="transcript-label">Q4. 長所・強み（Kelebihan Diri）:</div>
                            <div class="transcript-text">${payload.transcripts.q4 || '<em style="color:#64748b;">(Tidak ada transkrip teks terekam)</em>'}</div>
                        </div>
                        <div class="transcript-item">
                            <div class="transcript-label">Q5. 短所・克服方法（Kekurangan & Solusi）:</div>
                            <div class="transcript-text">${payload.transcripts.q5 || '<em style="color:#64748b;">(Tidak ada transkrip teks terekam)</em>'}</div>
                        </div>
                    </div>

                    <div class="sensei-notice-box">
                        <strong>Catatan untuk Sensei:</strong> Seluruh nilai dan transkrip di atas dihitung secara otomatis oleh sistem simulasi WebXR & Speech Analyzer sebagai baseline awal (100 poin penuh). Sensei dapat mendengarkan rekaman audio di Google Drive dan memiliki kendali penuh untuk <strong>mengedit/menyesuaikan nilai secara manual kapan saja di Google Spreadsheet</strong>.
                    </div>

                    <div class="score-modal-actions">
                        <button type="button" class="btn-primary" id="btn-restart-sim">Ulangi Simulasi</button>
                        <button type="button" class="btn-secondary" id="btn-close-score">Selesai & Tutup</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const toggleBtn = document.getElementById('btn-toggle-transcript');
            const transList = document.getElementById('transcript-container');
            const transArrow = document.getElementById('trans-toggle-arrow');
            if (toggleBtn && transList) {
                toggleBtn.addEventListener('click', () => {
                    const isShown = transList.style.display !== 'none';
                    transList.style.display = isShown ? 'none' : 'block';
                    if (transArrow) transArrow.textContent = isShown ? '▼' : '▲';
                });
            }

            document.getElementById('btn-close-score').addEventListener('click', () => {
                modal.remove();
            });
            document.getElementById('btn-restart-sim').addEventListener('click', () => {
                window.location.reload();
            });
        },

        showFinalScoreModal: function () {
            this.showEvaluationModal();
        }
    };

    // Auto-init saat siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.MannerEvaluation.init());
    } else {
        window.MannerEvaluation.init();
    }
})();
