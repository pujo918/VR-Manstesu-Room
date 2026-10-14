// =========================================================================
// SISTEM BUKU & DOKUMEN REALISTIS (3D CURVED GEOMETRY, GRAPHIC COVERS & ZERO-GAP)
// Sesuai Peraturan Mutlak User:
// 1. Punggung buku ("cover samping") menghadap ke depan (+Z) ke arah pengunjung:
//    - Menampilkan judul Kanji vertikal, iga emas timbul (spine ribs), dan logo penerbit
//    - Kertas halaman ada di bagian dalam (belakang), TIDAK TERLIHAT dari depan!
// 2. Seluruh buku berdiri SALING BERDEMPETAN RAPAT (ZERO GAP / TIDAK BERJARAK):
//    - Setiap buku saling menempel presisi dengan buku di sebelahnya
// 3. Cover buku yang terlihat (buku miring & tumpukan atas) memiliki desain grafis lengkap:
//    - Double frame list emas foil
//    - Emblem / simbol geometris korporat
//    - Plakat judul Kanji & Romaji profesional
//    - Sabuk jaket kertas Jepang (Obi strip / 帯)
// 4. Variasi kondisi: Masih Bagus (mulus bersih) vs Kusam/Bekas (krem gading, kuning sepia)
// =========================================================================

// --- GENERATOR TEXTURE KANVAS: SAMPUL BUKU (FRONT COVER ARTWORK) ---
function createBookCoverTexture(title, subtitle, publisher, baseColorHex, accentColorHex, hasObi, obiText, emblemType) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // 1. Warna Dasar Cover & Gradasi Tekstur Kertas
    ctx.fillStyle = baseColorHex || '#1e3a8a';
    ctx.fillRect(0, 0, 512, 768);

    const grad = ctx.createLinearGradient(0, 0, 512, 768);
    grad.addColorStop(0, 'rgba(255,255,255,0.15)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 768);

    // 2. Double Frame List Emas Foil Elegan
    const accent = accentColorHex || '#fbbf24';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(26, 26, 460, 716);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(34, 34, 444, 700);

    // Ornamen Sudut (Corner Studs)
    ctx.fillStyle = accent;
    [[34, 34], [478, 34], [34, 734], [478, 734]].forEach(([cx, cy]) => {
        ctx.fillRect(cx - 5, cy - 5, 10, 10);
    });

    // 3. Header Seri Buku Bisnis
    ctx.fillStyle = accent;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GLOBAL TECH CORPORATE LIBRARY', 256, 85);

    // 4. Emblem / Simbol Geometris Korporat di Tengah Atas
    ctx.save();
    ctx.translate(256, 175);
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;

    if (emblemType === 'laurel') {
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-2, -26, 4, 12);
        }
    } else {
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(28, 0);
        ctx.lineTo(0, 32);
        ctx.lineTo(-28, 0);
        ctx.closePath();
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // 5. Kotak Plakat Judul Utama
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(48, 255, 416, 175);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 255, 416, 175);

    // Judul Utama Buku (Kanji Jepang Tebal)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title || '経営戦略論', 256, 320);

    ctx.fillStyle = accent;
    ctx.fillRect(160, 342, 192, 2.5);

    // Subtitle Buku
    ctx.fillStyle = '#f8fafc';
    ctx.font = '19px sans-serif';
    ctx.fillText(subtitle || '未来を拓く組織イノベーション', 256, 380);

    // 6. Penerbit & Penulis
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '16px sans-serif';
    ctx.fillText(publisher || '日本経済出版 / GLOBAL TECH PRESS', 256, 475);

    // 7. Sabuk Kertas Jepang (Obi Strip / 帯)
    if (hasObi) {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(16, 520, 480, 210);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('【 累計50万部突破！ 全国推薦図書 】', 256, 570);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(obiText || '変化を恐れない企業だけが生き残る！', 256, 625);

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#fed7aa';
        ctx.fillText('ビジネスパーソン必読の決定版テキスト', 256, 675);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
}

// --- GENERATOR TEXTURE KANVAS: PUNGGUNG BUKU ("COVER SAMPING") ---
function createBookSpineTexture(title, publisher, baseColorHex, accentColorHex, volNumber) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // 1. Warna Dasar Cover Samping (Hardcover Leather / Cloth)
    ctx.fillStyle = baseColorHex || '#090d16';
    ctx.fillRect(0, 0, 128, 768);

    // 2. Tekstur gradient punggung buku (efek silinder 3D melengkung dengan pencahayaan realistis)
    const grad = ctx.createLinearGradient(0, 0, 128, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.50)');
    grad.addColorStop(0.18, 'rgba(255,255,255,0.06)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    grad.addColorStop(0.82, 'rgba(255,255,255,0.06)');
    grad.addColorStop(1, 'rgba(0,0,0,0.50)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 768);

    const accent = accentColorHex || '#fbbf24';

    // 3. Ornamen Frame Emas Punggung Atas (Double Gold Foil Bands)
    ctx.fillStyle = accent;
    ctx.fillRect(10, 26, 108, 6);
    ctx.fillRect(10, 38, 108, 2.5);
    ctx.fillRect(10, 46, 108, 1.5);

    // 4. Badge / Emblem Emas di Kepala Punggung Buku
    ctx.save();
    ctx.translate(64, 82);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Judul Kanji Vertikal di Punggung Buku
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    const chars = (title || '経営戦略').split('');
    let startY = 145;
    const spacing = Math.min(44, (380 / Math.max(chars.length, 1)));
    chars.forEach(ch => {
        ctx.fillText(ch, 64, startY);
        startY += spacing;
    });

    // 6. Nomor Jilid / Volume Emas (Jika ada)
    if (volNumber) {
        ctx.fillStyle = accent;
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(volNumber, 64, startY + 28);
    }

    // 7. Garis Emas Punggung Bawah
    ctx.fillStyle = accent;
    ctx.fillRect(10, 660, 108, 1.5);
    ctx.fillRect(10, 666, 108, 2.5);
    ctx.fillRect(10, 674, 108, 6);

    // 8. Nama Penerbit Resmi di Kaki Punggung
    ctx.font = '15px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(publisher || '丸善出版', 64, 725);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
}

// --- FUNGSI GENERATOR BUKU REALISTIS TUNGGAL ---
function createRealisticBook(cfg) {
    const group = new THREE.Group();

    // Pastikan membaca properti baik w/width, h/height, d/depth agar tidak ada celah/gap!
    const w = cfg.w || cfg.width || 0.038;          // Tebal punggung buku (X)
    const h = cfg.h || cfg.height || 0.25;          // Tinggi buku (Y)
    const d = cfg.d || cfg.depth || 0.20;           // Kedalaman buku ke dalam rak (Z)
    const cond = cfg.condition || 'used';  // 'new' | 'used' | 'aged'

    const baseHex = cfg.hexStr || '#1e3a8a';
    const accentHex = cfg.accentHex || '#fbbf24';

    // 1. PUNGGUNG BUKU ("COVER SAMPING") MENGHADAP KE DEPAN (+Z)
    // Sisi inilah yang dilihat dari luar rak: cover samping berwarna dengan judul Kanji & iga emas!
    // TIDAK MEMPERLIHATKAN LEMBAR KERTAS DI DEPAN!
    const spineTex = createBookSpineTexture(cfg.titleKanji, cfg.publisher, baseHex, accentHex, cfg.volNumber);
    const spineMat = new THREE.MeshStandardMaterial({
        map: spineTex,
        roughness: cond === 'new' ? 0.30 : 0.55,
        metalness: cond === 'new' ? 0.12 : 0.04
    });

    // Permukaan cembung 3D halus menghadap ke +Z (ke arah mata pengunjung)
    const spineSegX = 8;
    const spineGeo = new THREE.PlaneGeometry(w, h, spineSegX, 1);
    const sPos = spineGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
        const sx = sPos.getX(i);
        const curveZ = (1.0 - Math.pow(sx / (w * 0.5), 2)) * 0.0035;
        sPos.setZ(i, curveZ);
    }
    spineGeo.computeVertexNormals();

    const spineMesh = new THREE.Mesh(spineGeo, spineMat);
    spineMesh.position.set(0, h * 0.5, 0); // Di bibir depan Z = 0
    group.add(spineMesh);

    // 2. PARIT ENGSEL JILIDAN (FRENCH GROOVE / JOINT CREASE)
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.85 });
    const grooveGeo = new THREE.CylinderGeometry(0.0012, 0.0012, h * 0.98, 8);
    const g1 = new THREE.Mesh(grooveGeo, grooveMat);
    g1.position.set(-w * 0.5 + 0.001, h * 0.5, -0.002);
    group.add(g1);
    const g2 = new THREE.Mesh(grooveGeo, grooveMat);
    g2.position.set(w * 0.5 - 0.001, h * 0.5, -0.002);
    group.add(g2);

    // 3. IGA PUNGGUNG EMAS TIMBUL (SPINE RIBS)
    if (cfg.hasGoldStamping || cond === 'aged') {
        const ribMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.88, roughness: 0.18 });
        const ribY = [h * 0.20, h * 0.40, h * 0.60, h * 0.80];
        ribY.forEach(ry => {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.003, 0.003), ribMat);
            rib.position.set(0, ry, 0.004);
            group.add(rib);
        });
    }

    // 4. COVER DEPAN DI SISI KIRI (X = -w/2, MEMANJANG KE DALAM RAK -Z)
    // Bertekstur sampul bergambar lengkap jika buku miring atau sampulnya terlihat!
    const coverThick = 0.0024;
    const coverGeo = new THREE.BoxGeometry(coverThick, h, d);

    const coverTex = createBookCoverTexture(
        cfg.titleKanji || '経営戦略',
        cfg.subtitle || '組織イノベーションと成長戦略',
        cfg.publisher || '日本経済出版',
        baseHex,
        accentHex,
        cfg.hasObi,
        cfg.obiText,
        cfg.emblemType || 'diamond'
    );

    const frontCoverMat = new THREE.MeshStandardMaterial({
        map: coverTex,
        roughness: cond === 'new' ? 0.28 : 0.55,
        metalness: cond === 'new' ? 0.12 : 0.04
    });
    const frontCover = new THREE.Mesh(coverGeo, frontCoverMat);
    frontCover.position.set(-w * 0.5 + coverThick * 0.5, h * 0.5, -d * 0.5);
    group.add(frontCover);

    // 5. COVER BELAKANG DI SISI KANAN (X = +w/2, MEMANJANG KE DALAM RAK -Z)
    const backCoverMat = new THREE.MeshStandardMaterial({
        color: cfg.coverColor || 0x1e3a8a,
        roughness: cond === 'new' ? 0.30 : 0.60
    });
    const backCover = new THREE.Mesh(new THREE.BoxGeometry(coverThick, h, d), backCoverMat);
    backCover.position.set(w * 0.5 - coverThick * 0.5, h * 0.5, -d * 0.5);
    group.add(backCover);

    // 6. BLOK KERTAS HALAMAN (PAGE BLOCK) DI DALAM BUKU (TERSEMBUNYI DI BELAKANG PUNGGUNG)
    // Blok lembaran kertas berada di dalam rak (-Z), tidak terlihat dari depan!
    const pageW = w - 0.005;
    const pageH = h - 0.006;
    const pageD = d - 0.006;
    let pageColor = 0xf8fafc;
    if (cond === 'used') pageColor = 0xfef3c7;
    if (cond === 'aged') pageColor = 0xfde68a;

    const pageGeo = new THREE.BoxGeometry(pageW, pageH, pageD);
    const pageMat = new THREE.MeshStandardMaterial({ color: pageColor, roughness: 0.9 });
    const pageMesh = new THREE.Mesh(pageGeo, pageMat);
    pageMesh.position.set(0, h * 0.5, -pageD * 0.5 - 0.004);
    group.add(pageMesh);

    // 7. PITA PEMBATAS SUTRA (BOOKMARK RIBBON) MENJUNTAI DI DEPAN PUNGGUNG
    if (cfg.hasRibbon) {
        const ribbonCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, h - 0.002, 0.001),
            new THREE.Vector3((Math.random() - 0.5) * 0.008, h * 0.5, 0.003),
            new THREE.Vector3((Math.random() - 0.5) * 0.012, 0.004, 0.004),
            new THREE.Vector3((Math.random() - 0.5) * 0.015, -0.018, 0.005)
        ]);
        const ribbon = new THREE.Mesh(
            new THREE.TubeGeometry(ribbonCurve, 12, 0.0016, 6, false),
            new THREE.MeshStandardMaterial({ color: cfg.ribbonColor || 0xdc2626, roughness: 0.45 })
        );
        group.add(ribbon);
    }

    if (cfg.leanAngle) {
        group.rotation.z = cfg.leanAngle * (Math.PI / 180);
    }

    return group;
}

// --- FUNGSI GENERATOR BINDER A4 & KING FILE JEPANG ---
function createRealisticBinder(cfg) {
    const group = new THREE.Group();

    const w = cfg.w || cfg.width || 0.068;
    const h = cfg.h || cfg.height || 0.32;
    const d = cfg.d || cfg.depth || 0.28;

    // Bodi Utama Binder memanjang ke belakang (-Z)
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: cfg.color || 0x1e3a8a,
        roughness: 0.55,
        metalness: 0.05
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, h * 0.5, -d * 0.5);
    group.add(body);

    // Kertas Label Punggung Menghadap Depan (+Z)
    const labelH = h * 0.88;
    const labelW = w * 0.82;
    const labelMat = new THREE.MeshStandardMaterial({
        color: cfg.isUsed ? 0xfef3c7 : 0xffffff,
        roughness: 0.75
    });
    const label = new THREE.Mesh(new THREE.BoxGeometry(labelW, labelH, 0.001), labelMat);
    label.position.set(0, h * 0.5, 0.001);
    group.add(label);

    // Jalur Aksen Warna Klasik King File
    const bandMat = new THREE.MeshStandardMaterial({ color: cfg.bandColor || 0xdc2626 });
    const band = new THREE.Mesh(new THREE.BoxGeometry(labelW, 0.015, 0.0015), bandMat);
    band.position.set(0, h * 0.85, 0.0015);
    group.add(band);

    // Lubang Tarik Jari Logam Chrome
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        metalness: 0.92,
        roughness: 0.15
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0024, 12, 24), ringMat);
    ring.position.set(0, h * 0.5, 0.0015);
    group.add(ring);

    // Plat Logam Penguat Sudut Bawah
    const cornerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const cornerGeo = new THREE.BoxGeometry(0.003, 0.025, 0.025);
    const c1 = new THREE.Mesh(cornerGeo, cornerMat);
    c1.position.set(-w * 0.5, 0.012, -0.012);
    group.add(c1);

    const c2 = new THREE.Mesh(cornerGeo, cornerMat);
    c2.position.set(w * 0.5, 0.012, -0.012);
    group.add(c2);

    return group;
}

// =========================================================================
// 1. KOMPONEN TINGKAT 1: ARSIP KANTOR JEPANG (KING FILES RAPAT BERDEMPETAN)
// =========================================================================
AFRAME.registerComponent('shelf-books-tier1', {
    init: function () {
        const group = new THREE.Group();

        // SISI KIRI: 6 King Files A4 Jumbo SALING BERDEMPETAN RAPAT (ZERO GAP!)
        const binderData = [
            { w: 0.068, h: 0.32, d: 0.28, color: 0x1e3a8a, bandColor: 0xdc2626, isUsed: false, pullZ: 0 },
            { w: 0.068, h: 0.32, d: 0.28, color: 0x1e3a8a, bandColor: 0x2563eb, isUsed: true, pullZ: 0.012 },
            { w: 0.068, h: 0.32, d: 0.28, color: 0x14532d, bandColor: 0x16a34a, isUsed: false, pullZ: 0 },
            { w: 0.068, h: 0.32, d: 0.28, color: 0x334155, bandColor: 0xeab308, isUsed: true, pullZ: 0 },
            { w: 0.068, h: 0.32, d: 0.28, color: 0x0f172a, bandColor: 0x9333ea, isUsed: false, pullZ: 0 },
            { w: 0.068, h: 0.32, d: 0.28, color: 0x78350f, bandColor: 0xd97706, isUsed: true, pullZ: 0 }
        ];

        let curX = -0.56;
        binderData.forEach(b => {
            const binder = createRealisticBinder(b);
            binder.position.set(curX + b.w * 0.5, 0, 0.14 + b.pullZ);
            group.add(binder);
            curX += b.w; // Presisi berdempetan rapat!
        });

        // SISI KANAN: 2 Kotak Arsip Dokumen Kraft & 3 Buku Hukum Perusahaan Berdempetan
        const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.31, 0.27), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 }));
        box1.position.set(0.12, 0.155, 0.005);
        group.add(box1);

        const box2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.31, 0.27), new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 }));
        box2.position.set(0.21, 0.155, 0.005);
        group.add(box2);

        // 3 Buku Hukum Perusahaan menempel rapat di samping box file
        const refBooks = [
            { w: 0.048, h: 0.28, d: 0.22, coverColor: 0x0f172a, hexStr: '#0f172a', titleKanji: '会社法実務', subtitle: '最新会社法解説 & 実例', publisher: '有斐閣', condition: 'aged', hasGoldStamping: true, emblemType: 'laurel' },
            { w: 0.042, h: 0.27, d: 0.21, coverColor: 0x1e3a8a, hexStr: '#1e3a8a', titleKanji: '国際取引法', subtitle: 'Global Legal Practice', publisher: '商事法務', condition: 'used', hasRibbon: true, ribbonColor: 0xdc2626 },
            { w: 0.038, h: 0.26, d: 0.20, coverColor: 0x14532d, hexStr: '#14532d', titleKanji: '労務基準法', subtitle: 'Labor Compliance 2026', publisher: '日経BP', condition: 'new', hasObi: true, obiColor: 0xeab308, obiText: '実務担当者必携の決定版！' }
        ];

        let bX = 0.255;
        refBooks.forEach(rb => {
            const bMesh = createRealisticBook(rb);
            bMesh.position.set(bX + rb.w * 0.5, 0, 0.14);
            group.add(bMesh);
            bX += rb.w; // Berdempetan rapat!
        });

        // Bookend logam kanan
        const bookend = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.18, 0.16), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 }));
        bookend.position.set(bX + 0.002, 0.09, 0.06);
        group.add(bookend);

        this.el.setObject3D('mesh', group);
    }
});

// =========================================================================
// 2. KOMPONEN TINGKAT 2: BUKU MANAJEMEN & WAWANCARA (RAPAT BERDEMPETAN)
// =========================================================================
AFRAME.registerComponent('shelf-books-tier2', {
    init: function () {
        const group = new THREE.Group();

        // SISI KIRI: 9 Buku Manajemen Berdiri Saling Berdempetan Rapat (Zero Gap!)
        const standingLeftBooks = [
            { w: 0.038, h: 0.26, d: 0.21, coverColor: 0x1e3a8a, hexStr: '#1e3a8a', titleKanji: '経営戦略', subtitle: '競争優位の源泉と実践', publisher: 'ダイヤモンド社', condition: 'new', hasObi: true, obiColor: 0xdc2626, obiText: '全国ビジネス書 第1位獲得！' },
            { w: 0.036, h: 0.25, d: 0.20, coverColor: 0x991b1b, hexStr: '#991b1b', titleKanji: '組織行動論', subtitle: 'チーム成果を最大化する', publisher: '日経BP', condition: 'used', hasRibbon: true, ribbonColor: 0xfbbf24 },
            { w: 0.040, h: 0.24, d: 0.19, coverColor: 0x14532d, hexStr: '#14532d', titleKanji: '財務会計', subtitle: 'Corporate Finance 2026', publisher: '中央経済社', condition: 'aged', hasGoldStamping: true },
            { w: 0.042, h: 0.27, d: 0.22, coverColor: 0x0f172a, hexStr: '#0f172a', titleKanji: '意思決定論', subtitle: '不確実性のリーダーシップ', publisher: '東洋経済', condition: 'used', hasGoldStamping: true, emblemType: 'laurel' },
            { w: 0.038, h: 0.25, d: 0.20, coverColor: 0x78350f, hexStr: '#78350f', titleKanji: '企業倫理', subtitle: '信頼を築くガバナンス', publisher: '有斐閣', condition: 'aged' },
            { w: 0.035, h: 0.26, d: 0.21, coverColor: 0x581c87, hexStr: '#581c87', titleKanji: 'DX変革論', subtitle: 'Digital Transformation', publisher: '翔泳社', condition: 'new', hasObi: true, obiColor: 0xeab308, obiText: 'これからの時代を生き抜くDX' },
            { w: 0.038, h: 0.24, d: 0.19, coverColor: 0x0f766e, hexStr: '#0f766e', titleKanji: '市場創出', subtitle: 'ブルーオーシャン実践', publisher: 'ハーバード社', condition: 'used' },
            { w: 0.040, h: 0.25, d: 0.20, coverColor: 0x334155, hexStr: '#334155', titleKanji: '人事評価', subtitle: '公平で納得感のある制度', publisher: '労務行政', condition: 'used' },
            { w: 0.036, h: 0.26, d: 0.21, coverColor: 0x172554, hexStr: '#172554', titleKanji: '未来予測', subtitle: 'Megatrends 2030', publisher: 'PHP研究所', condition: 'new' }
        ];

        let curX = -0.56;
        standingLeftBooks.forEach(b => {
            const bMesh = createRealisticBook(b);
            bMesh.position.set(curX + b.w * 0.5, 0, 0.14);
            group.add(bMesh);
            curX += b.w; // Presisi menempel rapat tanpa celah!
        });

        // 2 BUKU MIRING BERSANDAR ALAMI (Cover bergambar penuh terlihat jelas!)
        const leaningBooks = [
            { w: 0.036, h: 0.25, d: 0.20, coverColor: 0xb45309, hexStr: '#b45309', titleKanji: '対話の技法', subtitle: 'コミュニケーション戦略', publisher: '講談社', condition: 'used', leanAngle: -14, hasObi: true, obiColor: 0xdc2626, obiText: '面接官の心を掴む話し方', emblemType: 'laurel' },
            { w: 0.034, h: 0.24, d: 0.19, coverColor: 0x15803d, hexStr: '#15803d', titleKanji: '志望動機', subtitle: '自己分析とキャリア設計', publisher: 'マイナビ出版', condition: 'used', leanAngle: -14 }
        ];

        const bLean1 = createRealisticBook(leaningBooks[0]);
        bLean1.position.set(curX + 0.028, 0, 0.14);
        group.add(bLean1);

        const bLean2 = createRealisticBook(leaningBooks[1]);
        bLean2.position.set(curX + 0.062, 0, 0.14);
        group.add(bLean2);

        // Bookend logam hitam menjepit kuat di ujung
        const bookendL = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.18, 0.16), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85 }));
        bookendL.position.set(curX + 0.098, 0.09, 0.06);
        group.add(bookendL);

        // SISI KANAN: 4 Buku Etika Wawancara (Berdempetan Rapat) & Tumpukan 4 Buku Horisontal
        const rightBooks = [
            { w: 0.040, h: 0.25, d: 0.20, coverColor: 0x1e40af, hexStr: '#1e40af', titleKanji: '礼儀作法', subtitle: 'Business Manner Guide', publisher: '高橋書店', condition: 'used', hasObi: true, obiColor: 0xffffff, obiText: '採用面接のマナー完全攻略' },
            { w: 0.044, h: 0.25, d: 0.20, coverColor: 0xdc2626, hexStr: '#dc2626', titleKanji: '面接突破', subtitle: '合格を勝ち取る回答例', publisher: '成美堂出版', condition: 'used', hasRibbon: true, ribbonColor: 0xdc2626, emblemType: 'laurel' },
            { w: 0.038, h: 0.24, d: 0.19, coverColor: 0x047857, hexStr: '#047857', titleKanji: '敬語入門', subtitle: '正しい日本語とビジネス敬語', publisher: '新星出版社', condition: 'new', hasObi: true, obiColor: 0xfef08a, obiText: '一目でわかる敬語の使い方' },
            { w: 0.042, h: 0.26, d: 0.21, coverColor: 0x0f172a, hexStr: '#0f172a', titleKanji: '業界地図', subtitle: '業界研究 & 採用動向 2026', publisher: '東洋経済', condition: 'aged', hasGoldStamping: true }
        ];

        let rX = 0.08;
        rightBooks.forEach(b => {
            const bMesh = createRealisticBook(b);
            bMesh.position.set(rX + b.w * 0.5, 0, 0.14);
            group.add(bMesh);
            rX += b.w; // Berdempetan rapat!
        });

        // TUMPUKAN 4 BUKU TEBAL HORISONTAL (DENGAN COVER ATAS BERGAMBAR LENGKAP)
        const stackData = [
            { w: 0.23, h: 0.046, d: 0.26, color: 0x78350f, rotY: 0 },
            { w: 0.22, h: 0.040, d: 0.25, color: 0x1e3a8a, rotY: 0.03 },
            { w: 0.21, h: 0.036, d: 0.24, color: 0x991b1b, rotY: -0.04 },
            { w: 0.20, h: 0.032, d: 0.23, color: 0x166534, rotY: 0.02 }
        ];

        let stackY = 0;
        const stackGroup = new THREE.Group();
        stackGroup.position.set(0.38, 0, 0.02);

        stackData.forEach((sb, sIdx) => {
            const bG = new THREE.Group();
            
            // Bodi buku
            const bCover = new THREE.Mesh(new THREE.BoxGeometry(sb.w, sb.h, sb.d), new THREE.MeshStandardMaterial({ color: sb.color, roughness: 0.6 }));
            bG.add(bCover);

            // Pada buku paling atas: pasang SAMPUL BERGAMBAR LENGKAP MENGHADAP KE ATAS!
            if (sIdx === stackData.length - 1) {
                const topCoverTex = createBookCoverTexture(
                    '企業年鑑 2026',
                    'GLOBAL BUSINESS REPORT',
                    '日本経済新聞社',
                    '#166534',
                    '#fbbf24',
                    true,
                    '全国優良企業 厳選ガイド収録',
                    'laurel'
                );
                const topCoverMesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(sb.w - 0.004, sb.d - 0.004),
                    new THREE.MeshStandardMaterial({ map: topCoverTex, roughness: 0.35 })
                );
                topCoverMesh.rotation.x = -Math.PI * 0.5;
                topCoverMesh.position.set(0, sb.h * 0.5 + 0.001, 0);
                bG.add(topCoverMesh);
            }

            bG.position.set(0, stackY + sb.h * 0.5, 0);
            bG.rotation.y = sb.rotY;
            stackGroup.add(bG);
            stackY += sb.h;
        });

        // Paperweight Kristal Akrilik di atas tumpukan buku
        const pWeight = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.024, 6),
            new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65, roughness: 0.1, metalness: 0.4 })
        );
        pWeight.position.set(0, stackY + 0.012, 0);
        stackGroup.add(pWeight);

        group.add(stackGroup);

        this.el.setObject3D('mesh', group);
    }
});

// =========================================================================
// 3. KOMPONEN TINGKAT 3: ENSIKLOPEDIA & KAMUS (KIRI - ZERO GAP RAPAT!)
// Ini adalah bagian yang dilingkari merah oleh user:
// Seluruh buku saling menempel rapat tanpa celah, menampilkan "cover samping" (spine) elegan!
// =========================================================================
AFRAME.registerComponent('shelf-books-tier3', {
    init: function () {
        const group = new THREE.Group();

        // SISI KIRI: 9 Buku Ensiklopedia & Referensi Mewah (100% MENEMPEL RAPAT ZERO GAP!)
        // Sesuai permintaan spesifik User:
        // - HANYA "COVER SAMPING" (PUNGGUNG BUKU / SPINE) YANG MENGHADAP KE DEPAN (+Z)
        // - SAMA SEKALI TIDAK MEMPERLIHATKAN LEMBAR KERTAS DI DEPAN (kertas ada di dalam -Z)
        // - BUKU SALING BERDEMPETAN MENEMPEL RAPAT TANPA CELAH (ZERO GAP)
        const encyData = [
            { w: 0.052, h: 0.30, d: 0.24, coverColor: 0x0a1128, hexStr: '#0a1128', titleKanji: '日本産業大系', volNumber: 'I', publisher: '丸善出版', condition: 'aged', hasGoldStamping: true, hasRibbon: true, ribbonColor: 0xdc2626 },
            { w: 0.052, h: 0.30, d: 0.24, coverColor: 0x0a1128, hexStr: '#0a1128', titleKanji: '日本産業大系', volNumber: 'II', publisher: '丸善出版', condition: 'aged', hasGoldStamping: true },
            { w: 0.052, h: 0.30, d: 0.24, coverColor: 0x0a1128, hexStr: '#0a1128', titleKanji: '日本産業大系', volNumber: 'III', publisher: '丸善出版', condition: 'aged', hasGoldStamping: true, hasRibbon: true, ribbonColor: 0xdc2626 },
            { w: 0.052, h: 0.30, d: 0.24, coverColor: 0x0a1128, hexStr: '#0a1128', titleKanji: '日本産業大系', volNumber: 'IV', publisher: '丸善出版', condition: 'aged', hasGoldStamping: true },
            { w: 0.052, h: 0.30, d: 0.24, coverColor: 0x0a1128, hexStr: '#0a1128', titleKanji: '日本産業大系', volNumber: 'V', publisher: '丸善出版', condition: 'aged', hasGoldStamping: true },
            // 2 Kamus Besar Jilid Atas & Bawah
            { w: 0.058, h: 0.29, d: 0.23, coverColor: 0x5c1d24, hexStr: '#5c1d24', titleKanji: '国語大辞典', volNumber: '上巻', publisher: '小学館', condition: 'used', hasGoldStamping: true, hasRibbon: true, ribbonColor: 0xfbbf24 },
            { w: 0.058, h: 0.29, d: 0.23, coverColor: 0x5c1d24, hexStr: '#5c1d24', titleKanji: '国語大辞典', volNumber: '下巻', publisher: '小学館', condition: 'used', hasGoldStamping: true },
            // 2 Buku Referensi Internasional & Bisnis Tebal
            { w: 0.060, h: 0.28, d: 0.22, coverColor: 0x064e3b, hexStr: '#064e3b', titleKanji: '和英大辞典', volNumber: '新版', publisher: '研究社', condition: 'used', hasGoldStamping: true, hasRibbon: true, ribbonColor: 0x16a34a },
            { w: 0.054, h: 0.28, d: 0.22, coverColor: 0x1e3a8a, hexStr: '#1e3a8a', titleKanji: '現代用語録', volNumber: '2026', publisher: '自由国民社', condition: 'used', hasGoldStamping: true }
        ];

        // Letakkan seluruh buku dari dinding kiri lemari menempel rapat presisi (zero gap!)
        let curX = -0.615;
        encyData.forEach(b => {
            const bWidth = b.w || b.width || 0.052;
            const bMesh = createRealisticBook(b);
            // Punggung buku ("cover samping") menghadap tepat ke arah depan pengunjung (+Z = 0.14)
            bMesh.position.set(curX + bWidth * 0.5, 0, 0.14);
            group.add(bMesh);
            curX += bWidth; // Saling menempel rapat tanpa celah sedikitpun (zero gap)!
        });

        // Bookend logam hitam menjepit kuat dan kokoh di ujung buku
        const bookendE = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.21, 0.19), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.88, roughness: 0.2 }));
        bookendE.position.set(curX + 0.0025, 0.105, 0.05);
        group.add(bookendE);

        // SISI KANAN: 5 Buku Saku Berwarna (Bunko-bon) Saling Berdempetan Rapat
        const pocketBooks = [
            { w: 0.034, h: 0.22, d: 0.17, coverColor: 0x0284c7, hexStr: '#0284c7', titleKanji: '発想法', publisher: '岩波新書', condition: 'new' },
            { w: 0.034, h: 0.22, d: 0.17, coverColor: 0xea580c, hexStr: '#ea580c', titleKanji: '論理思考', publisher: '中公新書', condition: 'used' },
            { w: 0.036, h: 0.23, d: 0.18, coverColor: 0x16a34a, hexStr: '#16a34a', titleKanji: '自己啓発', publisher: '文春新書', condition: 'new' },
            { w: 0.034, h: 0.22, d: 0.17, coverColor: 0x9333ea, hexStr: '#9333ea', titleKanji: '交渉術', publisher: 'PHP新書', condition: 'used', hasRibbon: true, ribbonColor: 0xfbbf24 },
            { w: 0.036, h: 0.23, d: 0.18, coverColor: 0xca8a04, hexStr: '#ca8a04', titleKanji: '仕事の型', publisher: '日経文庫', condition: 'aged' }
        ];

        let pX = 0.08;
        pocketBooks.forEach(pb => {
            const pMesh = createRealisticBook(pb);
            pMesh.position.set(pX + pb.w * 0.5, 0, 0.14);
            group.add(pMesh);
            pX += pb.w; // Berdempetan rapat!
        });

        // Bookend putih di samping buku saku
        const bookendP = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.16, 0.14), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
        bookendP.position.set(pX + 0.002, 0.08, 0.06);
        group.add(bookendP);

        this.el.setObject3D('mesh', group);
    }
});

// =========================================================================
// 4. KOMPONEN TINGKAT 4: BUKU SEJARAH SLIPCASE & TSE HANDBOOKS (BERDEMPETAN)
// =========================================================================
AFRAME.registerComponent('shelf-books-tier4', {
    init: function () {
        const group = new THREE.Group();

        // 1. KOTAK SLIPCASE SEJARAH PERUSAHAAN (50-YEAR HISTORY)
        const slipGroup = new THREE.Group();
        slipGroup.position.set(-0.10, 0, 0.02);

        // Box Luar Slipcase Putih Satin
        const slipBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.22, 0.24),
            new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.38 })
        );
        slipBox.position.set(0, 0.11, 0);
        slipGroup.add(slipBox);

        // Punggung Buku Mewah di Dalam Slipcase dengan Foil Emas
        const insideBookSpine = new THREE.Mesh(
            new THREE.BoxGeometry(0.13, 0.20, 0.002),
            new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 })
        );
        insideBookSpine.position.set(0, 0.11, 0.121);
        slipGroup.add(insideBookSpine);

        // Aksen Pita Emas di Buku Sejarah
        const goldBand = new THREE.Mesh(
            new THREE.BoxGeometry(0.13, 0.015, 0.0025),
            new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 })
        );
        goldBand.position.set(0, 0.11, 0.122);
        slipGroup.add(goldBand);

        group.add(slipGroup);

        // 2. 5 BUKU TEBAL PROFIL PASAR MODAL (TSE HANDBOOKS BERDEMPETAN RAPAT)
        const tseBooks = [
            { w: 0.044, h: 0.21, d: 0.20, coverColor: 0x15803d, hexStr: '#15803d', titleKanji: '東証一部', publisher: '東京証券取引所', condition: 'new', hasGoldStamping: true },
            { w: 0.044, h: 0.21, d: 0.20, coverColor: 0x166534, hexStr: '#166534', titleKanji: '銘柄分析', publisher: '東洋経済新報社', condition: 'used', hasRibbon: true, ribbonColor: 0xfbbf24 },
            { w: 0.048, h: 0.22, d: 0.21, coverColor: 0x0f172a, hexStr: '#0f172a', titleKanji: '会社四季報', publisher: '東洋経済', condition: 'aged', hasGoldStamping: true },
            { w: 0.048, h: 0.22, d: 0.21, coverColor: 0x1e3a8a, hexStr: '#1e3a8a', titleKanji: '企業年鑑', publisher: '東洋経済', condition: 'used' },
            { w: 0.044, h: 0.21, d: 0.20, coverColor: 0x991b1b, hexStr: '#991b1b', titleKanji: '業界総覧', publisher: '日本経済新聞', condition: 'new' }
        ];

        let curX = 0.16;
        tseBooks.forEach(b => {
            const bMesh = createRealisticBook(b);
            bMesh.position.set(curX + b.w * 0.5, 0, 0.14);
            group.add(bMesh);
            curX += b.w; // Berdempetan rapat!
        });

        // Bookend TSE
        const bookendT = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.15, 0.15), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85 }));
        bookendT.position.set(curX + 0.002, 0.075, 0.06);
        group.add(bookendT);

        this.el.setObject3D('mesh', group);
    }
});

// =========================================================================
// 5. KOMPONEN MEJA TAMU: MAJALAH BISNIS REALISTIS (PRESIDENT & NIKKEI)
// =========================================================================
AFRAME.registerComponent('table-magazines', {
    init: function () {
        const group = new THREE.Group();

        function createMagazine(cfg) {
            const mG = new THREE.Group();
            const w = 0.22;
            const h = 0.012;
            const d = 0.30;

            // Bodi majalah
            const paperGeo = new THREE.BoxGeometry(w, h, d);
            const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
            const paperMesh = new THREE.Mesh(paperGeo, paperMat);
            paperMesh.position.set(0, h * 0.5, 0);
            mG.add(paperMesh);

            // Cover Glossy dengan sudut lecek terangkat bekas dibaca
            const coverGeo = new THREE.BoxGeometry(w, 0.0012, d, 6, 1, 6);
            const pos = coverGeo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const z = pos.getZ(i);
                const x = pos.getX(i);
                if (z > d * 0.35 && x > w * 0.35) {
                    const curl = ((z - d * 0.35) / (d * 0.15)) * ((x - w * 0.35) / (w * 0.15)) * 0.005;
                    pos.setY(i, pos.getY(i) + curl);
                }
            }
            coverGeo.computeVertexNormals();

            // Cover Texture Bergambar Lengkap
            const magTex = createBookCoverTexture(
                cfg.title,
                cfg.subtitle,
                cfg.publisher,
                cfg.color,
                '#ffffff',
                true,
                cfg.badgeText,
                'diamond'
            );

            const coverMat = new THREE.MeshStandardMaterial({
                map: magTex,
                roughness: 0.22,
                metalness: 0.12
            });
            const coverMesh = new THREE.Mesh(coverGeo, coverMat);
            coverMesh.position.set(0, h + 0.0006, 0);
            mG.add(coverMesh);

            return mG;
        }

        // Majalah 1: PRESIDENT (Biru Tua)
        const mag1 = createMagazine({
            title: 'プレジデント',
            subtitle: '特集: 2026年 企業革新と成長戦略',
            publisher: 'PRESIDENT Inc.',
            color: '#1e3a8a',
            badgeText: '今こそ変わるべき日本のリーダーたち'
        });
        mag1.position.set(-0.15, 0.395, -0.36);
        mag1.rotation.y = 0.21;
        group.add(mag1);

        // Majalah 2: NIKKEI BUSINESS (Merah Bata)
        const mag2 = createMagazine({
            title: '日経ビジネス',
            subtitle: '日本企業のグローバル挑戦最前線',
            publisher: '日経BP社',
            color: '#991b1b',
            badgeText: '新時代の世界戦略を総力特集！'
        });
        mag2.position.set(0.12, 0.395, -0.22);
        mag2.rotation.y = -0.12;
        group.add(mag2);

        this.el.setObject3D('mesh', group);
    }
});

// =========================================================================
// KOMPONEN PLAKAT TULISAN "地図" (CHIZU SIGN) DENGAN KANVAS TEXTURE JEPANG
// Menggunakan HTML5 Canvas untuk memastikan huruf Kanji Jepang "地図"
// dirender 100% sempurna tanpa masalah missing character pada font 3D A-Frame
// =========================================================================
AFRAME.registerComponent('chizu-sign', {
    init: function () {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Latar Belakang Plakat Akrilik / Logam Gelap Elegan
        ctx.fillStyle = '#0b1120';
        ctx.fillRect(0, 0, 640, 200);

        // Frame List Emas Halus (Gold Foil Border)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 7;
        ctx.strokeRect(10, 10, 620, 180);
        ctx.lineWidth = 2.5;
        ctx.strokeRect(20, 20, 600, 160);

        // Ornamen Titik Sudut Emas
        ctx.fillStyle = '#fbbf24';
        [[20, 20], [620, 20], [20, 180], [620, 180]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Tulisan Utama: 地 図 (Kanji Lebih Besar & Jelas - 108px)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 108px "Yu Gothic", "Meiryo", "Hiragino Kaku Gothic ProN", "MS Gothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('地  図', 320, 102);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;

        const group = new THREE.Group();
        
        // Papan Dasar Tebal (Solid 3D Block agar tidak ada Z-fighting / glitching)
        const backPlate = new THREE.Mesh(
            new THREE.BoxGeometry(0.52, 0.17, 0.012),
            new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.8, metalness: 0.05 })
        );
        backPlate.position.set(0, 0, 0);
        group.add(backPlate);

        // Muka Plakat dengan Tekstur Gambar "地図" (Matte finish mencegah glitch pantulan cahaya)
        const mat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.85,
            metalness: 0.02
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.50, 0.15), mat);
        mesh.position.set(0, 0, 0.007); // Aman di depan bodi plakat
        group.add(mesh);

        this.el.setObject3D('mesh', group);
    }
});

// =========================================================================
// KOMPONEN PAPAN PETUNJUK RESMI MENSETSU JEPANG (FULL NIHONGO NOTICE BOARD)
// Menampilkan panduan tata krama wawancara formal dalam Bahasa Jepang
// Menggunakan kanvas resolusi tinggi 1024x640 agar teks kanji tajam & rapi
// =========================================================================
AFRAME.registerComponent('interview-notice-board', {
    init: function () {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');

        // 1. Background Papan (Dark Corporate Navy)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 1024, 640);

        // 2. Header Banner (Royal Blue dengan Gradasi Halus)
        const headerGrad = ctx.createLinearGradient(0, 0, 1024, 0);
        headerGrad.addColorStop(0, '#1e3a8a');
        headerGrad.addColorStop(0.5, '#2563eb');
        headerGrad.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = headerGrad;
        ctx.fillRect(0, 0, 1024, 110);

        // List Garis Aksen Emas Bawah Header
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(0, 110, 1024, 4);

        // Header Title Utama
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Yu Gothic", "Meiryo", "Hiragino Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GLOBAL TECH JAPAN  |  第1面接室 入室案内', 512, 52);

        ctx.font = 'bold 22px "Yu Gothic", "Meiryo", "Hiragino Sans", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText('【 面接選考 入室手順および基本マナー 】', 512, 92);

        // 3. Konten Poin-Poin Etika Wawancara (100% Full Bahasa Jepang Rapi)
        const rules = [
            {
                num: '1',
                title: '入室前のノック（ゆっくり3回）',
                desc: 'ドアをゆっくり「コン・コン・コン」と3回ノックしてください（2回はトイレ確認マナー）。'
            },
            {
                num: '2',
                title: '「どうぞ」の声を確認してから入室',
                desc: '「どうぞ」の返事を聞いてからドアを開け、「失礼いたします」と挨拶して一礼します。'
            },
            {
                num: '3',
                title: '携帯電話・スマートフォンの電源OFF',
                desc: '面接中はアラームを含め電源OFF、または完全にマナーモード（消音）に設定してください。'
            },
            {
                num: '4',
                title: '着席マナーと手荷物の配置',
                desc: '「お掛けください」と指示されるまで椅子の左側に立ち、鞄は椅子の横（床）に立てて置きます。'
            },
            {
                num: '5',
                title: '呼び出しまでの待機',
                desc: 'お名前が呼ばれるまで、こちらの待合ロビーにて静粛にお待ちください。'
            }
        ];

        let startY = 145;
        const rowHeight = 90;

        rules.forEach((item, idx) => {
            // Badge nomor lingkaran cyan cerah
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(68, startY + 14, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.num, 68, startY + 22);

            // Judul Poin (Tebal Putih Cerah)
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px "Yu Gothic", "Meiryo", "Hiragino Sans", sans-serif';
            ctx.fillText(item.title, 104, startY + 22);

            // Penjelasan / Detail Aturan (Abu-abu Terang Bersih)
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '19px "Yu Gothic", "Meiryo", "Hiragino Sans", sans-serif';
            ctx.fillText(item.desc, 104, startY + 52);

            // Garis pembatas halus antar poin
            if (idx < rules.length - 1) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(48, startY + 76);
                ctx.lineTo(976, startY + 76);
                ctx.stroke();
            }

            startY += rowHeight;
        });

        // 4. Footer Banner Resmi (採用選考委員会)
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(0, 588, 1024, 52);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 588);
        ctx.lineTo(1024, 588);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px "Yu Gothic", "Meiryo", "Hiragino Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('人事総務部  採用選考委員会  |  GLOBAL TECH JAPAN CORPORATION', 512, 620);

        // 5. Buat Mesh Tiga Dimensi untuk Papan
        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;

        const mat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.35,
            metalness: 0.05
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.84, 1.15), mat);
        mesh.position.set(0, 0, 0.012);
        this.el.setObject3D('mesh', mesh);
    }
});

// =========================================================================
// PLAKAT NAMA KARYA SENI LUKISAN JEPANG (NIHONGA ARTWORK BRASS PLAQUE)
// =========================================================================
AFRAME.registerComponent('nihonga-plaque', {
    init: function () {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 144;
        const ctx = canvas.getContext('2d');

        // 1. Background Kuningan Emas Mewah (Brushed Champagne Brass)
        const bgGrad = ctx.createLinearGradient(0, 0, 512, 144);
        bgGrad.addColorStop(0, '#fef08a');
        bgGrad.addColorStop(0.3, '#ca8a04');
        bgGrad.addColorStop(0.7, '#eab308');
        bgGrad.addColorStop(1, '#a16207');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 512, 144);

        // 2. Bezel Border & Lis Ganda Antik
        ctx.strokeStyle = '#713f12';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 492, 124);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(16, 16, 480, 112);

        // 4 Baut Sudut Kuningan
        ctx.fillStyle = '#451a03';
        [[22, 22], [490, 22], [22, 122], [490, 122]].forEach(([bx, by]) => {
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. Judul Karya Seni Jepang Kanji Tebal
        ctx.fillStyle = '#1c1917';
        ctx.font = 'bold 42px "Yu Mincho", "Hiragino Mincho ProN", "MS Mincho", serif';
        ctx.textAlign = 'center';
        ctx.fillText('霊 峰 富 士', 256, 64);

        // 4. Subtitle / Deskripsi Seni (Nihonga - Classical Pigment & Gold Leaf)
        ctx.fillStyle = '#451a03';
        ctx.font = 'bold 21px "Yu Gothic", "Meiryo", "Hiragino Sans", sans-serif';
        ctx.fillText('現代日本画  ／  岩絵具・金箔砂子', 256, 108);

        const tex = new THREE.CanvasTexture(canvas);
        tex.generateMipmaps = true;

        const mat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.25,
            metalness: 0.75
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.11), mat);
        mesh.position.set(0, 0, 0.005);
        this.el.setObject3D('mesh', mesh);
    }
});


