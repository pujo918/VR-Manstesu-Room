/**
 * =========================================================================
 * JAPANESE SIGNS & 3D DOCUMENTS COMPONENT SYSTEM FOR MENSETSU VR
 * =========================================================================
 * Menggunakan HTML5 Canvas 2D Textures untuk merender huruf Kanji, Hiragana,
 * dan Katakana Bahasa Jepang secara 100% sempurna tanpa masalah missing glyph
 * pada font default A-Frame (Roboto MSDF font).
 *
 * Menggunakan font bawaan Windows / cross-platform:
 * "Yu Gothic", "Meiryo", "Hiragino Kaku Gothic ProN", "MS Gothic", sans-serif.
 * =========================================================================
 */

// -------------------------------------------------------------------------
// 1. KOMPONEN UNIVERSAL: jp-text
// Pengganti <a-text> yang mendukung penuh karakter Jepang, multiline,
// warna teks, latar belakang, dan border akrilik/emas.
// -------------------------------------------------------------------------
AFRAME.registerComponent('jp-text', {
    schema: {
        value: { type: 'string', default: '' },
        color: { type: 'string', default: '#ffffff' },
        bg: { type: 'string', default: 'transparent' },
        border: { type: 'string', default: '' },
        borderWidth: { type: 'number', default: 2 },
        fontSize: { type: 'int', default: 36 },
        fontWeight: { type: 'string', default: 'bold' },
        fontFamily: { type: 'string', default: '"Yu Gothic", "Meiryo", "Hiragino Sans", "MS Gothic", sans-serif' },
        align: { type: 'string', default: 'center' },
        width: { type: 'number', default: 1.0 },
        height: { type: 'number', default: 0.4 },
        lineSpacing: { type: 'number', default: 1.3 },
        opacity: { type: 'number', default: 1.0 },
        transparent: { type: 'boolean', default: true }
    },

    init: function () {
        this.renderText();
    },

    update: function (oldData) {
        if (!oldData || oldData.value !== this.data.value || 
            oldData.color !== this.data.color || 
            oldData.bg !== this.data.bg ||
            oldData.fontSize !== this.data.fontSize) {
            this.renderText();
        }
    },

    renderText: function () {
        const d = this.data;
        if (!d.value) return;

        // Hitung rasio canvas beresolusi tinggi agar teks sangat tajam di VR
        const canvasW = 512;
        const aspect = Math.max(0.01, d.width) / Math.max(0.01, d.height);
        const canvasH = Math.max(32, Math.round(canvasW / aspect));

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');

        // Background
        if (d.bg !== 'transparent') {
            ctx.fillStyle = d.bg;
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // Border dekoratif
        if (d.border) {
            ctx.strokeStyle = d.border;
            ctx.lineWidth = Math.max(1, d.borderWidth * (canvasW / 512));
            ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, canvasW - ctx.lineWidth, canvasH - ctx.lineWidth);
        }

        // Render Teks Multiline
        const scale = canvasW / 512;
        const fSize = Math.round(d.fontSize * scale);
        ctx.font = `${d.fontWeight} ${fSize}px ${d.fontFamily}`;
        ctx.fillStyle = d.color;
        ctx.textAlign = d.align;
        ctx.textBaseline = 'middle';

        let startX = canvasW / 2;
        if (d.align === 'left') startX = 24 * scale;
        if (d.align === 'right') startX = canvasW - (24 * scale);

        // Dukung newline literal '\n' atau string encoded '\\n'
        const lines = d.value.replace(/\\n/g, '\n').split('\n');
        const lineH = fSize * d.lineSpacing;
        const totalH = (lines.length - 1) * lineH;
        const startY = (canvasH - totalH) / 2;

        lines.forEach((line, idx) => {
            ctx.fillText(line, startX, startY + (idx * lineH));
        });

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;

        const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: d.transparent,
            opacity: d.opacity,
            side: THREE.DoubleSide,
            depthWrite: !d.transparent
        });

        if (this.mesh) {
            this.el.removeObject3D('jp-text-mesh');
        }

        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(d.width, d.height), mat);
        this.el.setObject3D('jp-text-mesh', this.mesh);
    },

    remove: function () {
        if (this.mesh) {
            this.el.removeObject3D('jp-text-mesh');
        }
    }
});

// -------------------------------------------------------------------------
// 2. KOMPONEN PLAKAT AKRILIK RESEPSIONIS: jp-reception-sign
// Menghasilkan plakat meja resepsionis mewah "受　付 / RECEPTION"
// -------------------------------------------------------------------------
AFRAME.registerComponent('jp-reception-sign', {
    init: function () {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Gradasi hitam elegan khas akrilik meja kantor Tokyo
        const bgGrad = ctx.createLinearGradient(0, 0, 640, 200);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e293b');
        bgGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 640, 200);

        // Frame garis aksen emas halus (Gold Foil Trim)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 6;
        ctx.strokeRect(12, 12, 616, 176);
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, 600, 160);

        // Baut kuningan sudut
        ctx.fillStyle = '#fbbf24';
        [[22, 22], [618, 22], [22, 178], [618, 178]].forEach(([bx, by]) => {
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Teks Utama Kanji: 受　付
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 92px "Yu Gothic", "Meiryo", "Hiragino Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('受　付', 320, 86);

        // Subtitle Bahasa Inggris Elegan: RECEPTION
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 26px sans-serif';
        ctx.letterSpacing = '6px';
        ctx.fillText('RECEPTION', 320, 150);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;

        const group = new THREE.Group();

        // Papan dasar akrilik tebal
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(0.38, 0.12, 0.024),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.1 })
        );
        group.add(base);

        // Muka bertekstur kanji
        const face = new THREE.Mesh(
            new THREE.PlaneGeometry(0.37, 0.115),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 })
        );
        face.position.set(0, 0, 0.013);
        group.add(face);

        this.el.setObject3D('mesh', group);
    }
});

// -------------------------------------------------------------------------
// 3. KOMPONEN BUKU TAMU / FORMULIR KUNJUNGAN: jp-visitor-sheet
// Menghasilkan papan clipboard formulir resepsionis "ご来社受付票"
// -------------------------------------------------------------------------
AFRAME.registerComponent('jp-visitor-sheet', {
    init: function () {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Kertas putih bersih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 800);

        // Garis tepi ganda
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.strokeRect(30, 30, 540, 740);

        // Header Form
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px "Yu Gothic", "Meiryo", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ご 来 社 受 付 票', 300, 90);

        ctx.font = '16px "Yu Gothic", "Meiryo", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('（ 訪問者記入用紙 / Visitor Sign-In ）', 300, 125);

        // Tanggal Kunjungan
        ctx.textAlign = 'right';
        ctx.font = '18px "Yu Gothic", "Meiryo", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText('受付日: 2026年 9月 20日 (土)', 540, 165);

        // Garis batas header
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, 185);
        ctx.lineTo(570, 185);
        ctx.stroke();

        // Tabel Form Isian
        const fields = [
            { label: '入館時刻', val: '09 : 45' },
            { label: '貴社名', val: '面接応募者（新卒・キャリア）' },
            { label: 'ご芳名', val: '佐藤　健太　様' },
            { label: 'ご訪問先', val: '人事総務部　採用課' },
            { label: 'ご用件', val: '第1面接室　一次面接選考' }
        ];

        let y = 230;
        fields.forEach((f) => {
            // Label box
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(50, y - 28, 140, 44);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(50, y - 28, 140, 44);

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 18px "Yu Gothic", "Meiryo", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(f.label, 65, y);

            // Value field
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(190, y - 28, 360, 44);

            ctx.fillStyle = '#1e3a8a';
            ctx.font = 'bold 20px "Yu Gothic", "Meiryo", sans-serif';
            ctx.fillText(f.val, 210, y);

            y += 62;
        });

        // Syarat Kunjungan
        ctx.fillStyle = '#64748b';
        ctx.font = '15px "Yu Gothic", "Meiryo", sans-serif';
        ctx.fillText('※ 館内では入館証を着用し、携帯電話はマナーモードに設定してください。', 50, 580);
        ctx.fillText('※ 面接終了後は受付にて入館証をご返却ください。', 50, 610);

        // Cap Stempel Merah Resmi "受付済" (Official Hanko Stamp)
        ctx.save();
        ctx.translate(460, 680);
        ctx.rotate(-0.08);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 22px "Yu Mincho", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('受　付', 0, -12);
        ctx.fillText('検　印', 0, 14);
        ctx.restore();

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;

        const group = new THREE.Group();

        // Papan clipboard hitam di belakang
        const board = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.012, 0.38),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
        );
        group.add(board);

        // Klip Logam di Sisi Atas Dokumen
        const clip = new THREE.Mesh(
            new THREE.BoxGeometry(0.11, 0.018, 0.03),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
        );
        clip.position.set(0, 0.01, -0.175);
        group.add(clip);

        // Kertas Formulir
        const paper = new THREE.Mesh(
            new THREE.PlaneGeometry(0.26, 0.35),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })
        );
        paper.rotation.x = -Math.PI / 2;
        paper.position.set(0, 0.007, 0.01);
        group.add(paper);

        this.el.setObject3D('mesh', group);
    }
});

// -------------------------------------------------------------------------
// 4. KOMPONEN PLAKAT PINTU RUANG WAWANCARA: jp-door-sign
// Menghasilkan plakat pintu akrilik elegan "第1面接室"
// -------------------------------------------------------------------------
AFRAME.registerComponent('jp-door-sign', {
    init: function () {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');

        // Background putih satin semi-matte
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 180);

        // Border list halus
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.strokeRect(8, 8, 496, 164);

        // 4 baut sudut logam
        ctx.fillStyle = '#64748b';
        [[18, 18], [494, 18], [18, 162], [494, 162]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Tulisan Utama: 第1面接室
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 78px "Yu Gothic", "Meiryo", "Hiragino Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('第1面接室', 256, 75);

        // Subtitle: INTERVIEW ROOM 1
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('INTERVIEW ROOM 1', 256, 138);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;

        const group = new THREE.Group();

        // Papan dasar akrilik
        const plate = new THREE.Mesh(
            new THREE.BoxGeometry(0.46, 0.165, 0.015),
            new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
        );
        group.add(plate);

        // Muka tulisan
        const face = new THREE.Mesh(
            new THREE.PlaneGeometry(0.45, 0.155),
            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 })
        );
        face.position.set(0, 0, 0.009);
        group.add(face);

        this.el.setObject3D('mesh', group);
    }
});

// -------------------------------------------------------------------------
// 5. KOMPONEN LAMPU STATUS DI ATAS PINTU: jp-door-indicator
// Awal: Menyala Merah "第1面接室 / 【 準 備 中 】" (Belum Boleh Masuk)
// Setelah Dipanggil: Menyala Hijau "第1面接室 / 【 入 室 可 】" (Silakan Masuk)
// -------------------------------------------------------------------------
AFRAME.registerComponent('jp-door-indicator', {
    init: function () {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 512;
        this.canvas.height = 200;
        this.ctx = this.canvas.getContext('2d');

        this.tex = new THREE.CanvasTexture(this.canvas);
        this.tex.generateMipmaps = true;

        const group = new THREE.Group();

        this.boxMat = new THREE.MeshStandardMaterial({
            color: 0xdc2626,
            emissive: 0xb91c1c,
            emissiveIntensity: 0.45,
            roughness: 0.35
        });

        this.boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.60, 0.22, 0.04),
            this.boxMat
        );
        group.add(this.boxMesh);

        this.faceMat = new THREE.MeshStandardMaterial({
            map: this.tex,
            emissive: 0xffffff,
            emissiveIntensity: 0.35,
            roughness: 0.3
        });

        this.faceMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.58, 0.20),
            this.faceMat
        );
        this.faceMesh.position.set(0, 0, 0.022);
        group.add(this.faceMesh);

        this.el.setObject3D('mesh', group);

        const isAlreadyCalled = !!(window.MensetsuState && window.MensetsuState.isCalledForInterview);
        this.updateIndicatorState(isAlreadyCalled);

        this._onCalled = () => {
            this.updateIndicatorState(true);
        };
        window.addEventListener('mensetsu-called-to-enter', this._onCalled);
        window.addEventListener('mensetsu-video-watched', this._onCalled);
    },

    updateIndicatorState: function (isAllowed) {
        const ctx = this.ctx;
        if (!ctx) return;

        if (isAllowed) {
            // Latar belakang Hijau Emerald Menyala (Boleh Masuk)
            ctx.fillStyle = '#15803d';
            ctx.fillRect(0, 0, 512, 200);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, 492, 180);

            ctx.fillStyle = '#bbf7d0';
            ctx.font = 'bold 44px "Yu Gothic", "Meiryo", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('第 1 面 接 室', 256, 68);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 64px "Yu Gothic", "Meiryo", sans-serif';
            ctx.fillText('【 入 室 可 】', 256, 140);

            if (this.boxMat) {
                this.boxMat.color.setHex(0x16a34a);
                this.boxMat.emissive.setHex(0x15803d);
                this.boxMat.emissiveIntensity = 0.65;
                this.boxMat.needsUpdate = true;
            }
        } else {
            // Latar belakang Merah Menyala (Belum Dipanggil / Tidak Boleh Masuk)
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(0, 0, 512, 200);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, 492, 180);

            ctx.fillStyle = '#fecaca';
            ctx.font = 'bold 44px "Yu Gothic", "Meiryo", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('第 1 面 接 室', 256, 68);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 64px "Yu Gothic", "Meiryo", sans-serif';
            ctx.fillText('【 準 備 中 】', 256, 140);

            if (this.boxMat) {
                this.boxMat.color.setHex(0xdc2626);
                this.boxMat.emissive.setHex(0xb91c1c);
                this.boxMat.emissiveIntensity = 0.45;
                this.boxMat.needsUpdate = true;
            }
        }

        if (this.tex) {
            this.tex.needsUpdate = true;
        }
    },

    remove: function () {
        if (this._onCalled) {
            window.removeEventListener('mensetsu-called-to-enter', this._onCalled);
            window.removeEventListener('mensetsu-video-watched', this._onCalled);
        }
    }
});

// -------------------------------------------------------------------------
// 6. KOMPONEN PENANDA LANTAI POSISI BERDIRI KANDIDAT: jp-floor-marker
// Menghasilkan lingkaran lantai dengan panduan "面接待機位置 / 椅子の左側"
// dan sepasang jejak sepatu formal pantofel Jepang
// -------------------------------------------------------------------------
AFRAME.registerComponent('jp-floor-marker', {
    init: function () {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Background transparan
        ctx.clearRect(0, 0, 512, 512);

        // Lingkaran luar beraksen cyan
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(256, 256, 240, 0, Math.PI * 2);
        ctx.stroke();

        // Lingkaran dalam lembut
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.beginPath();
        ctx.arc(256, 256, 230, 0, Math.PI * 2);
        ctx.fill();

        // Jejak Kaki Sepatu Pantofel Formal (Etika Berdiri Tegak)
        const drawShoe = (cx, cy) => {
            ctx.fillStyle = '#0f172a';
            // Telapak depan
            ctx.beginPath();
            ctx.ellipse(cx, cy - 18, 22, 42, 0, 0, Math.PI * 2);
            ctx.fill();
            // Tumit belakang
            ctx.beginPath();
            ctx.ellipse(cx, cy + 34, 18, 22, 0, 0, Math.PI * 2);
            ctx.fill();
        };

        drawShoe(220, 240);
        drawShoe(292, 240);

        // Teks Atas: 面接待機位置
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Yu Gothic", "Meiryo", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('面接待機位置', 256, 120);

        // Teks Bawah: （椅子の左側・着席前待機）
        ctx.font = 'bold 24px "Yu Gothic", "Meiryo", sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('（椅子の左側・着席前待機）', 256, 380);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;

        const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.76), mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0.025, 0);
        this.el.setObject3D('mesh', mesh);
    }
});

// -------------------------------------------------------------------------
// 7. KOMPONEN DOKUMEN RESMI MEJA WAWANCARA: jp-interview-desk
// Menghasilkan seluruh dokumen di meja pewawancara dalam bentuk mesh 3D
// bertekstur Canvas resolusi tinggi dengan orientasi 180° menghadap pewawancara:
// - Map berkas: 応募書類一式
// - Lembar evaluasi kiri & kanan: 面接評価表 (dengan kriteria nilai [S] [A] [B] [C])
// - Resume tengah: 履歴書 (Lengkap foto, nama Sato Kenta, tabel pendidikan, nilai TOEIC 850 & N1)
// - Lembar penilaian ketua: 面接官採点表 (Lengkap cap stempel merah "合格" 印)
// - Plakat jabatan: 主面接官
// -------------------------------------------------------------------------
AFRAME.registerComponent('jp-interview-desk', {
    init: function () {
        const group = new THREE.Group();

        // -------------------------------------------------------------
        // A. RESUME LENGKAP KANDIDAT: 履歴書 (Center - Kiri)
        // -------------------------------------------------------------
        const canRireki = document.createElement('canvas');
        canRireki.width = 600;
        canRireki.height = 800;
        const ctxR = canRireki.getContext('2d');

        // Kertas putih
        ctxR.fillStyle = '#ffffff';
        ctxR.fillRect(0, 0, 600, 800);

        // Border ganda form JIS
        ctxR.strokeStyle = '#0f172a';
        ctxR.lineWidth = 2.5;
        ctxR.strokeRect(25, 25, 550, 750);

        // Judul Utama: 履　歴　書
        ctxR.fillStyle = '#0f172a';
        ctxR.font = 'bold 44px "Yu Gothic", "Meiryo", sans-serif';
        ctxR.textAlign = 'left';
        ctxR.fillText('履　歴　書', 50, 80);

        ctxR.font = '16px "Yu Gothic", "Meiryo", sans-serif';
        ctxR.fillStyle = '#475569';
        ctxR.fillText('2026年 9月 20日 現在', 270, 78);

        // Kotak Pasfoto Formal (Pojok Kanan Atas)
        ctxR.strokeStyle = '#94a3b8';
        ctxR.lineWidth = 1.5;
        ctxR.strokeRect(430, 45, 120, 150);

        // Coba gambar foto avatar kandidat jika sudah dimuat di DOM
        const imgAvatar = document.getElementById('tex-candidate-head-clean') || document.getElementById('tex-candidate-head');
        if (imgAvatar && imgAvatar.complete) {
            try {
                ctxR.drawImage(imgAvatar, 432, 47, 116, 146);
            } catch (e) {
                ctxR.fillStyle = '#3b82f6';
                ctxR.fillRect(432, 47, 116, 146);
            }
        } else {
            ctxR.fillStyle = '#2563eb';
            ctxR.fillRect(432, 47, 116, 146);
            ctxR.fillStyle = '#ffffff';
            ctxR.font = 'bold 16px sans-serif';
            ctxR.textAlign = 'center';
            ctxR.fillText('写真貼付', 490, 125);
        }

        // Garis Pembatas Identitas
        ctxR.strokeStyle = '#0f172a';
        ctxR.lineWidth = 2;
        ctxR.strokeRect(45, 110, 365, 85);

        ctxR.fillStyle = '#0f172a';
        ctxR.font = '14px "Yu Gothic", sans-serif';
        ctxR.textAlign = 'left';
        ctxR.fillText('ふりがな:  さとう　けんた', 55, 132);
        ctxR.font = 'bold 28px "Yu Gothic", sans-serif';
        ctxR.fillText('氏　名:  佐藤　健太', 55, 168);

        // Informasi Tambahan
        ctxR.font = '15px "Yu Gothic", sans-serif';
        ctxR.fillStyle = '#334155';
        ctxR.fillText('生年月日:  2002年 4月15日生（満24歳） 男', 50, 222);
        ctxR.fillText('現住所:  東京都新宿区西新宿2丁目 〇〇マンション', 50, 246);

        // Tabel Riwayat Pendidikan & Pengalaman
        ctxR.fillStyle = '#0f172a';
        ctxR.font = 'bold 20px "Yu Gothic", sans-serif';
        ctxR.fillText('■ 学歴・職歴', 50, 285);

        ctxR.strokeStyle = '#cbd5e1';
        ctxR.lineWidth = 1;
        ctxR.strokeRect(45, 298, 510, 155);

        const eduList = [
            '2021年  3月    東京都立 〇〇高等学校 卒業',
            '2021年  4月    東京国際大学 経済学部 入学',
            '2025年  3月    同大学 卒業（学士取得）',
            '2025年  4月    現在に至る（ITソリューション総合職 志望）'
        ];
        eduList.forEach((item, i) => {
            ctxR.fillStyle = '#1e293b';
            ctxR.font = '16px "Yu Gothic", sans-serif';
            ctxR.fillText(item, 60, 328 + (i * 32));
        });

        // Tabel Lisensi & Sertifikasi (資格・免許)
        ctxR.fillStyle = '#0f172a';
        ctxR.font = 'bold 20px "Yu Gothic", sans-serif';
        ctxR.fillText('■ 免許・資格', 50, 485);

        ctxR.strokeStyle = '#cbd5e1';
        ctxR.strokeRect(45, 498, 510, 120);

        const certs = [
            '2024年  6月    実用英語技能検定 準1級 取得',
            '2024年 11月    TOEIC Listening & Reading 850点',
            '2025年  7月    日本語能力試験（JLPT） N1 合格'
        ];
        certs.forEach((c, i) => {
            ctxR.fillStyle = '#0284c7';
            ctxR.font = 'bold 16px "Yu Gothic", sans-serif';
            ctxR.fillText(c, 60, 528 + (i * 32));
        });

        // Alasan Melamar (志望の動機)
        ctxR.fillStyle = '#0f172a';
        ctxR.font = 'bold 20px "Yu Gothic", sans-serif';
        ctxR.fillText('■ 志望の動機・自己PR', 50, 648);

        ctxR.fillStyle = '#334155';
        ctxR.font = '15px "Yu Gothic", sans-serif';
        ctxR.fillText('「貴社の先進的なクラウド技術とグローバル展開力に強く共感し、', 60, 678);
        ctxR.fillText('自らの語学力と粘り強さを活かして信頼されるエンジニアを目指します。」', 60, 706);

        const texRireki = new THREE.CanvasTexture(canRireki);
        texRireki.generateMipmaps = true;

        // Mesh Resume (Menghadap pewawancara: rotasi Y = 180°)
        const rirekiGroup = new THREE.Group();
        // Map pelindung hitam di bawah kertas
        rirekiGroup.add(new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.008, 0.42),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
        ));
        // Kertas resume
        const rirekiPaper = new THREE.Mesh(
            new THREE.PlaneGeometry(0.29, 0.38),
            new THREE.MeshStandardMaterial({ map: texRireki, roughness: 0.9 })
        );
        rirekiPaper.rotation.x = -Math.PI / 2;
        rirekiPaper.rotation.z = Math.PI; // Menghadap pewawancara
        rirekiPaper.position.set(0, 0.007, 0);
        rirekiGroup.add(rirekiPaper);
        rirekiGroup.position.set(0.17, 0.005, 0);
        group.add(rirekiGroup);

        // -------------------------------------------------------------
        // B. LEMBAR PENILAIAN UTAMA KETUA PEWAWANCARA: 面接官採点表
        // -------------------------------------------------------------
        const canScore = document.createElement('canvas');
        canScore.width = 600;
        canScore.height = 800;
        const ctxS = canScore.getContext('2d');

        // Kertas Penilaian
        ctxS.fillStyle = '#ffffff';
        ctxS.fillRect(0, 0, 600, 800);

        ctxS.strokeStyle = '#b91c1c';
        ctxS.lineWidth = 3;
        ctxS.strokeRect(25, 25, 550, 750);

        // Header
        ctxS.fillStyle = '#991b1b';
        ctxS.font = 'bold 36px "Yu Gothic", sans-serif';
        ctxS.textAlign = 'center';
        ctxS.fillText('2026年度 採用面接採点表', 300, 80);

        ctxS.fillStyle = '#0f172a';
        ctxS.font = 'bold 18px "Yu Gothic", sans-serif';
        ctxS.textAlign = 'left';
        ctxS.fillText('受験番号: B-1042      氏名: 佐藤 健太', 45, 125);
        ctxS.fillText('面接官: 主面接官（人事総務部長）', 330, 125);

        ctxS.strokeStyle = '#0f172a';
        ctxS.lineWidth = 1.5;
        ctxS.beginPath();
        ctxS.moveTo(40, 142);
        ctxS.lineTo(560, 142);
        ctxS.stroke();

        // Kriteria Evaluasi Tabel
        const scoreCriteria = [
            { item: '1. 第一印象・入退室マナー', grade: '【 S 】' },
            { item: '2. 適切な敬語表現・言葉遣い', grade: '【 A 】' },
            { item: '3. 志望動機・熱意・企業研究', grade: '【 S 】' },
            { item: '4. コミュニケーション・傾聴力', grade: '【 S 】' },
            { item: '5. 課題解決力・今後の将来性', grade: '【 A 】' }
        ];

        let sy = 190;
        scoreCriteria.forEach((sc) => {
            ctxS.fillStyle = '#1e293b';
            ctxS.font = 'bold 20px "Yu Gothic", sans-serif';
            ctxS.textAlign = 'left';
            ctxS.fillText(sc.item, 50, sy);

            ctxS.fillStyle = '#dc2626';
            ctxS.font = 'bold 24px sans-serif';
            ctxS.textAlign = 'right';
            ctxS.fillText(sc.grade, 540, sy);

            ctxS.strokeStyle = '#e2e8f0';
            ctxS.lineWidth = 1;
            ctxS.beginPath();
            ctxS.moveTo(45, sy + 16);
            ctxS.lineTo(555, sy + 16);
            ctxS.stroke();

            sy += 55;
        });

        // Catatan Evaluasi Pulpen Merah
        ctxS.fillStyle = '#b91c1c';
        ctxS.font = 'bold 19px "Yu Gothic", sans-serif';
        ctxS.textAlign = 'left';
        ctxS.fillText('【面接官所見・特記事項】', 50, 495);
        ctxS.fillStyle = '#1e3a8a';
        ctxS.font = '17px "Yu Gothic", sans-serif';
        ctxS.fillText('・姿勢が終始美しく、ハキハキとした明るい応答。', 60, 530);
        ctxS.fillText('・語学資格（JLPT N1 / TOEIC 850）の実力充分。', 60, 560);
        ctxS.fillText('・誠実さと主体性が高く、即戦力として期待できる。', 60, 590);

        // Cap Stempel Merah Besar: 【 採用内定（合格） 】
        ctxS.save();
        ctxS.translate(300, 685);
        ctxS.rotate(-0.04);
        ctxS.strokeStyle = '#dc2626';
        ctxS.lineWidth = 5;
        ctxS.strokeRect(-180, -40, 360, 80);

        ctxS.fillStyle = '#dc2626';
        ctxS.font = 'bold 36px "Yu Gothic", "Meiryo", sans-serif';
        ctxS.textAlign = 'center';
        ctxS.textBaseline = 'middle';
        ctxS.fillText('総合判定：【 合 格 】', 0, 0);
        ctxS.restore();

        const texScore = new THREE.CanvasTexture(canScore);
        texScore.generateMipmaps = true;

        // Mesh Clipboard Lembar Penilaian Ketua
        const scoreGroup = new THREE.Group();
        // Papan clipboard
        scoreGroup.add(new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.01, 0.42),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
        ));
        // Klip Logam di Sisi Atas (+Z)
        const sClip = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.012, 0.03),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
        );
        sClip.position.set(0, 0.009, 0.19);
        scoreGroup.add(sClip);

        // Kertas Penilaian
        const scorePaper = new THREE.Mesh(
            new THREE.PlaneGeometry(0.29, 0.37),
            new THREE.MeshStandardMaterial({ map: texScore, roughness: 0.9 })
        );
        scorePaper.rotation.x = -Math.PI / 2;
        scorePaper.rotation.z = Math.PI + 0.07; // Menghadap pewawancara dengan sedikit variasi sudut natural
        scorePaper.position.set(0, 0.008, -0.01);
        scoreGroup.add(scorePaper);

        scoreGroup.position.set(-0.17, 0.006, 0);
        group.add(scoreGroup);

        // -------------------------------------------------------------
        // C. PLAKAT NAMA JABATAN MEJA: 主面接官
        // -------------------------------------------------------------
        const canPlate = document.createElement('canvas');
        canPlate.width = 400;
        canPlate.height = 100;
        const ctxP = canPlate.getContext('2d');

        ctxP.fillStyle = '#0f172a';
        ctxP.fillRect(0, 0, 400, 100);

        ctxP.strokeStyle = '#fbbf24';
        ctxP.lineWidth = 3;
        ctxP.strokeRect(6, 6, 388, 88);

        ctxP.fillStyle = '#ffffff';
        ctxP.font = 'bold 44px "Yu Gothic", "Meiryo", sans-serif';
        ctxP.textAlign = 'center';
        ctxP.textBaseline = 'middle';
        ctxP.fillText('主 面 接 官', 200, 42);

        ctxP.font = 'bold 16px sans-serif';
        ctxP.fillStyle = '#94a3b8';
        ctxP.fillText('CHIEF INTERVIEWER', 200, 78);

        const texPlate = new THREE.CanvasTexture(canPlate);
        texPlate.generateMipmaps = true;

        const plateGroup = new THREE.Group();
        const pBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.045, 0.06),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
        );
        plateGroup.add(pBox);

        const pFace = new THREE.Mesh(
            new THREE.PlaneGeometry(0.27, 0.04),
            new THREE.MeshBasicMaterial({ map: texPlate })
        );
        pFace.rotation.x = -Math.PI / 10;
        pFace.position.set(0, 0.005, 0.031);
        plateGroup.add(pFace);

        plateGroup.position.set(0, 0.025, 0.33);
        group.add(plateGroup);

        // -------------------------------------------------------------
        // D. MAP BERKAS ARSIP JEPANG: 応募書類一式 (Ujung Kiri)
        // -------------------------------------------------------------
        const canFolder = document.createElement('canvas');
        canFolder.width = 400;
        canFolder.height = 500;
        const ctxF = canFolder.getContext('2d');

        ctxF.fillStyle = '#1e3a8a';
        ctxF.fillRect(0, 0, 400, 500);

        ctxF.strokeStyle = '#fbbf24';
        ctxF.lineWidth = 4;
        ctxF.strokeRect(20, 20, 360, 460);

        ctxF.fillStyle = '#ffffff';
        ctxF.font = 'bold 36px "Yu Gothic", "Meiryo", sans-serif';
        ctxF.textAlign = 'center';
        ctxF.fillText('応 募 書 類 一 式', 200, 180);

        ctxF.font = 'bold 20px "Yu Gothic", sans-serif';
        ctxF.fillStyle = '#fef08a';
        ctxF.fillText('新卒・中途採用選考資料', 200, 230);

        ctxF.font = '16px sans-serif';
        ctxF.fillStyle = '#cbd5e1';
        ctxF.fillText('GLOBAL TECH JAPAN CORP.', 200, 340);

        const texFolder = new THREE.CanvasTexture(canFolder);
        texFolder.generateMipmaps = true;

        const folderGroup = new THREE.Group();
        // Map bawah merah
        folderGroup.add(new THREE.Mesh(
            new THREE.BoxGeometry(0.34, 0.02, 0.44),
            new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5 })
        ));
        // Map atas biru
        const topFolder = new THREE.Mesh(
            new THREE.BoxGeometry(0.33, 0.02, 0.43),
            new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 })
        );
        topFolder.position.set(0, 0.02, 0);
        topFolder.rotation.y = -0.05;
        folderGroup.add(topFolder);

        const folderFace = new THREE.Mesh(
            new THREE.PlaneGeometry(0.30, 0.40),
            new THREE.MeshStandardMaterial({ map: texFolder, roughness: 0.6 })
        );
        folderFace.rotation.x = -Math.PI / 2;
        folderFace.rotation.z = Math.PI; // Menghadap pewawancara
        folderFace.position.set(0, 0.032, 0);
        folderGroup.add(folderFace);

        folderGroup.position.set(-1.85, 0.015, -0.05);
        group.add(folderGroup);

        // -------------------------------------------------------------
        // E. LEMBAR EVALUASI PEWAWANCARA KIRI & KANAN (Side Interviewers)
        // -------------------------------------------------------------
        const createSideEvalClipboard = (xPos, rotZOffset, penColor) => {
            const canSide = document.createElement('canvas');
            canSide.width = 512;
            canSide.height = 700;
            const ctxE = canSide.getContext('2d');

            ctxE.fillStyle = '#ffffff';
            ctxE.fillRect(0, 0, 512, 700);

            ctxE.strokeStyle = '#1e3a8a';
            ctxE.lineWidth = 2.5;
            ctxE.strokeRect(20, 20, 472, 660);

            ctxE.fillStyle = '#0f172a';
            ctxE.font = 'bold 32px "Yu Gothic", sans-serif';
            ctxE.textAlign = 'center';
            ctxE.fillText('面 接 評 価 表', 256, 75);

            ctxE.font = '16px "Yu Gothic", sans-serif';
            ctxE.fillStyle = '#334155';
            ctxE.fillText('候補者氏名： 佐藤 健太（一次面接）', 256, 115);

            ctxE.strokeStyle = '#0f172a';
            ctxE.lineWidth = 1;
            ctxE.beginPath();
            ctxE.moveTo(35, 135);
            ctxE.lineTo(477, 135);
            ctxE.stroke();

            const evalRows = [
                { title: '身だしなみ・礼儀作法', score: '[ S ]' },
                { title: 'コミュニケーション能力', score: '[ A ]' },
                { title: '論理的思考・表現力', score: '[ A ]' },
                { title: '専門スキル・適性', score: '[ S ]' },
                { title: '企業文化への適応性', score: '[ A ]' }
            ];

            let rowY = 185;
            evalRows.forEach((r) => {
                ctxE.fillStyle = '#1e293b';
                ctxE.font = 'bold 18px "Yu Gothic", sans-serif';
                ctxE.textAlign = 'left';
                ctxE.fillText(r.title, 45, rowY);

                ctxE.fillStyle = '#0284c7';
                ctxE.font = 'bold 22px sans-serif';
                ctxE.textAlign = 'right';
                ctxE.fillText(r.score, 465, rowY);

                ctxE.strokeStyle = '#e2e8f0';
                ctxE.beginPath();
                ctxE.moveTo(40, rowY + 16);
                ctxE.lineTo(472, rowY + 16);
                ctxE.stroke();

                rowY += 60;
            });

            ctxE.fillStyle = '#1e3a8a';
            ctxE.font = 'bold 17px "Yu Gothic", sans-serif';
            ctxE.textAlign = 'left';
            ctxE.fillText('総合所見: 次回役員面接へ推薦可', 45, 530);

            const texSide = new THREE.CanvasTexture(canSide);
            texSide.generateMipmaps = true;

            const cGroup = new THREE.Group();
            // Papan clipboard
            cGroup.add(new THREE.Mesh(
                new THREE.BoxGeometry(0.32, 0.01, 0.42),
                new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
            ));
            // Klip atas
            const sClip = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.012, 0.03),
                new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
            );
            sClip.position.set(0, 0.009, 0.19);
            cGroup.add(sClip);

            // Kertas
            const paperMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(0.29, 0.37),
                new THREE.MeshStandardMaterial({ map: texSide, roughness: 0.9 })
            );
            paperMesh.rotation.x = -Math.PI / 2;
            paperMesh.rotation.z = Math.PI + rotZOffset; // Menghadap pewawancara
            paperMesh.position.set(0, 0.008, -0.01);
            cGroup.add(paperMesh);

            cGroup.position.set(xPos, 0.006, 0.0);
            return cGroup;
        };

        // Lembar Pewawancara Kiri (X = -1.3m, tepat di depan kursi Tanaka-sensei)
        group.add(createSideEvalClipboard(-1.30, -0.05, 0x0284c7));

        // Lembar Pewawancara Kanan (X = +1.3m, tepat di depan kursi Suzuki-sensei)
        group.add(createSideEvalClipboard(1.30, 0.05, 0x0f172a));

        this.el.setObject3D('mesh', group);
    }
});
