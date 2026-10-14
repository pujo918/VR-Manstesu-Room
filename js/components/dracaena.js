// =========================================================================
// KOMPONEN BOTANIK: TANAMAN DRACAENA REALISTIS (3D CURVED BOTANICAL LEAF MESH)
// Dibuat dari kurva geometri Three.js dengan ujung meruncing tajam & tulang daun V
// 100% Mengikuti siluet alami tanaman kantor Jepang di foto referensi user!
// =========================================================================
AFRAME.registerComponent('realistic-dracaena', {
    init: function () {
        const group = new THREE.Group();

        // 1. POT KERAMIK MODERN TAPER (Warna Krem Batu Matte Halus Sesuai Foto)
        const potGeo = new THREE.CylinderGeometry(0.24, 0.17, 0.54, 36);
        const potMat = new THREE.MeshStandardMaterial({
            color: 0xdedcd7,
            roughness: 0.75,
            metalness: 0.05
        });
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.y = 0.27;
        group.add(pot);

        // Bibir Pot Melengkung Halus (Rounded Rim)
        const rimGeo = new THREE.TorusGeometry(0.238, 0.015, 16, 36);
        const rim = new THREE.Mesh(rimGeo, potMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.538;
        group.add(rim);

        // 2. MEDIA TANAM: BATU PEBBLE LECA / AKADAMA COKELAT
        const soilGeo = new THREE.CircleGeometry(0.228, 36);
        const soilMat = new THREE.MeshStandardMaterial({ color: 0x422614, roughness: 0.95 });
        const soil = new THREE.Mesh(soilGeo, soilMat);
        soil.rotation.x = -Math.PI / 2;
        soil.position.y = 0.51;
        group.add(soil);

        const pebbleGeo = new THREE.DodecahedronGeometry(0.017);
        const pebbleMat1 = new THREE.MeshStandardMaterial({ color: 0x6e3c19, roughness: 0.92 });
        const pebbleMat2 = new THREE.MeshStandardMaterial({ color: 0x824921, roughness: 0.90 });
        for (let p = 0; p < 36; p++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 0.04 + Math.random() * 0.165;
            const pebble = new THREE.Mesh(pebbleGeo, (p % 2 === 0) ? pebbleMat1 : pebbleMat2);
            pebble.position.set(Math.cos(angle) * r, 0.525 + Math.random() * 0.012, Math.sin(angle) * r);
            pebble.scale.set(0.75 + Math.random() * 0.5, 0.55 + Math.random() * 0.4, 0.75 + Math.random() * 0.5);
            group.add(pebble);
        }

        // 3. KLUSTER 7 BATANG KAYU RAMPING DENGAN RUAS CINCIN ALAMI (WOOD CANES)
        const caneMat = new THREE.MeshStandardMaterial({ color: 0x7c5836, roughness: 0.85 });
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x5e3f22, roughness: 0.9 });
        const caneOffsets = [
            { x: 0, z: 0, h: 1.15, r: 0.016 },
            { x: -0.045, z: 0.038, h: 1.02, r: 0.014 },
            { x: 0.052, z: 0.032, h: 1.06, r: 0.014 },
            { x: -0.038, z: -0.048, h: 0.92, r: 0.013 },
            { x: 0.048, z: -0.038, h: 0.96, r: 0.013 },
            { x: -0.075, z: -0.012, h: 0.82, r: 0.012 },
            { x: 0.075, z: 0.008, h: 0.86, r: 0.012 }
        ];

        caneOffsets.forEach(c => {
            const caneGeo = new THREE.CylinderGeometry(c.r * 0.82, c.r, c.h, 16);
            const cane = new THREE.Mesh(caneGeo, caneMat);
            cane.position.set(c.x, 0.51 + c.h / 2, c.z);
            group.add(cane);

            // Cincin ruas ruas horizontal alami di sepanjang batang bambu/kayu dracaena
            const numRings = Math.floor(c.h / 0.08);
            for (let r = 1; r < numRings; r++) {
                const ringY = 0.51 + r * 0.08 + (Math.random() - 0.5) * 0.01;
                const ringGeo = new THREE.TorusGeometry(c.r * 0.96, 0.0022, 8, 16);
                const ringMesh = new THREE.Mesh(ringGeo, ringMat);
                ringMesh.rotation.x = Math.PI / 2;
                ringMesh.position.set(c.x, ringY, c.z);
                group.add(ringMesh);
            }
        });

        // 4. PEMBUAT DAUN ALAMI BOTANIK: BILAH LANCET MELENGKUNG DENGAN UJUNG RUNCING & TULANG V
        function createDracaenaLeaf(length, maxWidth, archFactor, droopFactor, leafColor) {
            const geom = new THREE.BufferGeometry();
            const segments = 12; // 12 segmen kurva sangat halus
            const positions = [];
            const indices = [];

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                // Jangkauan memanjang keluar dari batang
                const z = t * length;
                // Kurva lengkung alami: menjulang dulu sedikit di pangkal lalu melengkung menjuntai ke bawah
                const y = Math.sin(t * Math.PI * 0.55) * (length * archFactor) - (Math.pow(t, 2.1) * length * droopFactor);

                // Profil lebar daun: kecil di pangkal, melebar anggun, dan meruncing lancip sempurna di ujung (t=1.0)
                const w = (t === 1.0) ? 0 : Math.sin(Math.pow(t, 0.72) * Math.PI) * (maxWidth * 0.5);
                
                // Lipatan tulang tengah V khas daun Dracaena
                const crease = Math.sin(t * Math.PI) * (maxWidth * 0.22);

                // 3 titik simpul melintang per segmen: Tepi Kiri, Tulang Tengah V, Tepi Kanan
                positions.push(-w, y + crease, z); // Tepi Kiri (terangkat)
                positions.push(0, y, z);          // Tulang Tengah V (di bawah)
                positions.push(w, y + crease, z);  // Tepi Kanan (terangkat)
            }

            for (let i = 0; i < segments; i++) {
                const row1 = i * 3;
                const row2 = (i + 1) * 3;

                // Segitiga separuh kiri daun
                indices.push(row1, row2, row1 + 1);
                indices.push(row1 + 1, row2, row2 + 1);

                // Segitiga separuh kanan daun
                indices.push(row1 + 1, row2 + 1, row1 + 2);
                indices.push(row1 + 2, row2 + 1, row2 + 2);
            }

            geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geom.setIndex(indices);
            geom.computeVertexNormals(); // Shader halus tanpa patahan sudut

            const mat = new THREE.MeshStandardMaterial({
                color: leafColor,
                roughness: 0.26,
                metalness: 0.05,
                side: THREE.DoubleSide
            });

            return new THREE.Mesh(geom, mat);
        }

        // 5. MEMASANG 156 HELAI DAUN LEBAT 5 TINGKAT BERLAPIS (LUSH & BOTANICALLY REALISTIC)
        const leafTiers = [
            // Tingkat 1: Daun bawah menjuntai panjang anggun mengelilingi bawah tanaman (28 helai)
            { count: 28, yMin: 0.68, yMax: 0.90, len: 0.52, width: 0.068, arch: 0.32, droop: 0.78, pitch: -0.42, colors: [0x113620, 0x163e26, 0x1b4332] },
            // Tingkat 2: Daun bawah-tengah menyebar lebat melebar ke samping (36 helai)
            { count: 36, yMin: 0.90, yMax: 1.10, len: 0.54, width: 0.070, arch: 0.44, droop: 0.58, pitch: -0.22, colors: [0x1b4332, 0x225238, 0x286343] },
            // Tingkat 3: Daun tengah inti tajuk rimbun padat mekar (40 helai)
            { count: 40, yMin: 1.10, yMax: 1.28, len: 0.50, width: 0.065, arch: 0.54, droop: 0.44, pitch: -0.05, colors: [0x225238, 0x2d6a4f, 0x367a3f] },
            // Tingkat 4: Daun atas air mancur mekar tinggi (32 helai)
            { count: 32, yMin: 1.28, yMax: 1.44, len: 0.44, width: 0.058, arch: 0.65, droop: 0.28, pitch: 0.22, colors: [0x2d6a4f, 0x388252, 0x40916c] },
            // Tingkat 5: Pucuk mahkota atas (daun muda hijau segar tegak menjulang tajam) (20 helai)
            { count: 20, yMin: 1.44, yMax: 1.58, len: 0.34, width: 0.046, arch: 0.78, droop: 0.12, pitch: 0.52, colors: [0x40916c, 0x52b788, 0x64c99b] }
        ];

        let leafSeed = 0;
        leafTiers.forEach(tier => {
            for (let k = 0; k < tier.count; k++) {
                const angle = (k / tier.count) * Math.PI * 2 + ((k % 2 === 0) ? 0.28 : -0.15) + (leafSeed * 0.12);
                leafSeed++;
                const yPos = tier.yMin + Math.random() * (tier.yMax - tier.yMin);
                const color = tier.colors[Math.floor(Math.random() * tier.colors.length)];

                const len = tier.len * (0.88 + Math.random() * 0.24);
                const w = tier.width * (0.90 + Math.random() * 0.20);

                const leaf = createDracaenaLeaf(len, w, tier.arch, tier.droop, color);

                const cane = caneOffsets[Math.floor(Math.random() * caneOffsets.length)];
                leaf.position.set(cane.x, yPos, cane.z);

                leaf.rotation.y = angle;
                leaf.rotation.x = tier.pitch + (Math.random() - 0.5) * 0.14;
                leaf.rotation.z = (Math.random() - 0.5) * 0.12;

                group.add(leaf);
            }
        });

        this.el.setObject3D('mesh', group);
    }
});

// =========================================================================
// KOMPONEN BOTANIK 2: TANAMAN HIAS RAK ATAS (LUSH SHELF POTHOS / CASCADING IVY)
// Daun rimbun 64 helai berbentuk ovate berlekuk dengan tangkai melengkung & menjuntai
// =========================================================================
AFRAME.registerComponent('shelf-pothos', {
    init: function () {
        const group = new THREE.Group();

        // 1. Pot Keramik Matte Putih Minimalis
        const potGeo = new THREE.CylinderGeometry(0.052, 0.038, 0.075, 24);
        const potMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.05 });
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.y = 0.0375;
        group.add(pot);

        // Bibir Pot
        const rimGeo = new THREE.TorusGeometry(0.051, 0.005, 12, 24);
        const rim = new THREE.Mesh(rimGeo, potMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.075;
        group.add(rim);

        // Piringan Tatakan Pot di Bawah
        const saucerGeo = new THREE.CylinderGeometry(0.058, 0.054, 0.01, 24);
        const saucerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
        const saucer = new THREE.Mesh(saucerGeo, saucerMat);
        saucer.position.y = 0.005;
        group.add(saucer);

        // Tanah Akadama
        const soilGeo = new THREE.CircleGeometry(0.048, 24);
        const soilMat = new THREE.MeshStandardMaterial({ color: 0x382314, roughness: 0.95 });
        const soil = new THREE.Mesh(soilGeo, soilMat);
        soil.rotation.x = -Math.PI / 2;
        soil.position.y = 0.07;
        group.add(soil);

        // Kerikil hias di atas tanah
        const pebbleGeo = new THREE.DodecahedronGeometry(0.006);
        const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
        for (let p = 0; p < 14; p++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 0.01 + Math.random() * 0.032;
            const pebble = new THREE.Mesh(pebbleGeo, pebbleMat);
            pebble.position.set(Math.cos(angle) * r, 0.072, Math.sin(angle) * r);
            group.add(pebble);
        }

        // Fungsi Pembuat Daun Pothos Tegak / Bibir Pot
        function createPothosLeaf(length, width, curl, leafColor) {
            const geom = new THREE.BufferGeometry();
            const segments = 8;
            const positions = [];
            const indices = [];

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const z = t * length;
                const y = Math.sin(t * Math.PI * 0.7) * (length * 0.22) - (Math.pow(t, 1.8) * length * curl);
                const w = (t === 1.0) ? 0 : Math.sin(Math.pow(t, 0.55) * Math.PI) * (width * 0.5);
                const crease = Math.sin(t * Math.PI) * (width * 0.16);

                positions.push(-w, y + crease, z);
                positions.push(0, y, z);
                positions.push(w, y + crease, z);
            }

            for (let i = 0; i < segments; i++) {
                const r1 = i * 3;
                const r2 = (i + 1) * 3;
                indices.push(r1, r2, r1 + 1);
                indices.push(r1 + 1, r2, r2 + 1);
                indices.push(r1 + 1, r2, r1 + 2);
                indices.push(r1 + 2, r2, r2 + 2);
            }

            geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geom.setIndex(indices);
            geom.computeVertexNormals();

            const mat = new THREE.MeshStandardMaterial({
                color: leafColor,
                roughness: 0.22,
                metalness: 0.04,
                side: THREE.DoubleSide
            });

            return new THREE.Mesh(geom, mat);
        }

        // Fungsi Pembuat Daun Tercecer Mendatar di Atas Lantai Rak (Dijamin Y >= 0, Tidak Tembus)
        function createSprawlingLeaf(length, width, leafColor) {
            const geom = new THREE.BufferGeometry();
            const segments = 8;
            const positions = [];
            const indices = [];

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const z = t * length;
                // Daun rebah mendatar di atas rak dengan sedikit lekukan lembut ke atas (tidak pernah menukik ke bawah)
                const y = Math.sin(t * Math.PI) * (length * 0.08) + (t * 0.003);
                const w = (t === 1.0) ? 0 : Math.sin(Math.pow(t, 0.55) * Math.PI) * (width * 0.5);
                const crease = Math.sin(t * Math.PI) * (width * 0.12);

                positions.push(-w, Math.max(0, y + crease), z);
                positions.push(0, Math.max(0, y), z);
                positions.push(w, Math.max(0, y + crease), z);
            }

            for (let i = 0; i < segments; i++) {
                const r1 = i * 3;
                const r2 = (i + 1) * 3;
                indices.push(r1, r2, r1 + 1);
                indices.push(r1 + 1, r2, r2 + 1);
                indices.push(r1 + 1, r2, r1 + 2);
                indices.push(r1 + 2, r2, r2 + 2);
            }

            geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geom.setIndex(indices);
            geom.computeVertexNormals();

            const mat = new THREE.MeshStandardMaterial({
                color: leafColor,
                roughness: 0.22,
                metalness: 0.04,
                side: THREE.DoubleSide
            });

            return new THREE.Mesh(geom, mat);
        }

        // TANGKAI SULUR TERCECER DI LANTAI RAK ATAS (SPREADING VINES - Y SELALU >= 0.008m)
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8 });
        const vineCurves = [
            // Sulur 1: Menjalar ke sisi kiri rak di depan pot
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.02, 0.075, 0.02),
                new THREE.Vector3(-0.05, 0.045, 0.035),
                new THREE.Vector3(-0.08, 0.016, 0.05),
                new THREE.Vector3(-0.11, 0.010, 0.06),
                new THREE.Vector3(-0.14, 0.008, 0.055)
            ]),
            // Sulur 2: Menjalar ke arah depan tengah rak
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(0.01, 0.075, 0.03),
                new THREE.Vector3(0.02, 0.048, 0.06),
                new THREE.Vector3(0.015, 0.018, 0.09),
                new THREE.Vector3(0.005, 0.010, 0.12),
                new THREE.Vector3(-0.015, 0.008, 0.14)
            ]),
            // Sulur 3: Menjalar ke sisi kanan depan rak
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(0.03, 0.075, 0.02),
                new THREE.Vector3(0.06, 0.045, 0.035),
                new THREE.Vector3(0.09, 0.018, 0.045),
                new THREE.Vector3(0.12, 0.010, 0.04),
                new THREE.Vector3(0.14, 0.008, 0.03)
            ]),
            // Sulur 4: Menjalar ke samping kiri samping pot
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.03, 0.075, -0.01),
                new THREE.Vector3(-0.06, 0.045, -0.02),
                new THREE.Vector3(-0.09, 0.016, -0.015),
                new THREE.Vector3(-0.12, 0.009, 0.005)
            ])
        ];

        vineCurves.forEach(curve => {
            const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.002, 8, false);
            const tube = new THREE.Mesh(tubeGeo, stemMat);
            group.add(tube);
        });

        // 68 HELAI DAUN MULTI-LAYER (Mahkota Tegak, Bibir Pot, dan Sulur Tercecer di Rak)
        const colors = [0x15803d, 0x166534, 0x22c55e, 0x14532d, 0x2e7d32, 0x4ade80];

        // 1. Mahkota Tegak Rimbun di Atas Pot (24 helai)
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.2;
            const r = 0.012 + Math.random() * 0.026;
            const y = 0.072 + Math.random() * 0.025;
            const len = 0.045 + Math.random() * 0.020;
            const w = 0.028 + Math.random() * 0.012;
            const col = colors[Math.floor(Math.random() * colors.length)];
            const leaf = createPothosLeaf(len, w, 0.25, col);
            leaf.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
            leaf.rotation.y = angle;
            leaf.rotation.x = 0.2 + Math.random() * 0.35;
            leaf.rotation.z = (Math.random() - 0.5) * 0.25;
            group.add(leaf);
        }

        // 2. Lapisan Tengah Mekar Mengelilingi Bibir Pot (20 helai)
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.25;
            const r = 0.038 + Math.random() * 0.015;
            const y = 0.062 + Math.random() * 0.015;
            const len = 0.046 + Math.random() * 0.015;
            const w = 0.028 + Math.random() * 0.010;
            const col = colors[Math.floor(Math.random() * colors.length)];
            const leaf = createPothosLeaf(len, w, 0.20, col);
            leaf.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
            leaf.rotation.y = angle;
            leaf.rotation.x = 0.05 + Math.random() * 0.2; // Sedikit mendongak ke atas
            leaf.rotation.z = (Math.random() - 0.5) * 0.2;
            group.add(leaf);
        }

        // 3. Daun pada Sulur yang Tercecer di Lantai Rak (24 helai)
        vineCurves.forEach((curve, cIdx) => {
            const leafCount = (cIdx === 3) ? 5 : 7;
            for (let v = 1; v <= leafCount; v++) {
                const t = v / leafCount;
                const pt = curve.getPoint(t);
                const len = 0.042 - t * 0.008;
                const w = 0.026 - t * 0.005;
                const col = colors[Math.floor(Math.random() * colors.length)];
                
                const leaf = createSprawlingLeaf(len, w, col);
                leaf.position.set(pt.x, Math.max(0.009, pt.y), pt.z);
                leaf.rotation.y = (cIdx * 1.57) + (v * 0.8) + (v % 2 === 0 ? 0.35 : -0.35);
                leaf.rotation.x = Math.max(0.02, (1 - t) * 0.12);
                leaf.rotation.z = (v % 2 === 0 ? 0.08 : -0.08);
                group.add(leaf);
            }
        });

        this.el.setObject3D('mesh', group);
    }
});

// =========================================================================
// KOMPONEN BOTANIK 3: SUKULEN ROSETTE MEWAH (LUSH MULTI-TIER SUCCULENT)
// 68 Helai Daun 3D Tebal Melengkung Bersusun Spiral Fibonacci (Phyllotaxis)
// Sesuai syarat mutlak user: layering daun sangat banyak, tebal & realistis!
// =========================================================================
AFRAME.registerComponent('shelf-succulent', {
    init: function () {
        const group = new THREE.Group();

        // 1. Pot Keramik Segienam Geometris Mewah (Scandinavian White)
        const potGeo = new THREE.CylinderGeometry(0.054, 0.040, 0.08, 6);
        const potMat = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.25,
            metalness: 0.08
        });
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.y = 0.04;
        group.add(pot);

        // Aksen Garis Emas Geometris di Pot
        const goldBandGeo = new THREE.CylinderGeometry(0.0542, 0.0542, 0.005, 6);
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xd97706,
            roughness: 0.2,
            metalness: 0.85
        });
        const goldBand = new THREE.Mesh(goldBandGeo, goldMat);
        goldBand.position.y = 0.065;
        group.add(goldBand);

        // Tanah Akadama Subur
        const soilGeo = new THREE.CircleGeometry(0.050, 24);
        const soilMat = new THREE.MeshStandardMaterial({ color: 0x2e1a0f, roughness: 0.95 });
        const soil = new THREE.Mesh(soilGeo, soilMat);
        soil.rotation.x = -Math.PI / 2;
        soil.position.y = 0.076;
        group.add(soil);

        // Kerikil Putih & Cokelat di Sekeliling Tanaman
        const stoneGeo = new THREE.DodecahedronGeometry(0.005);
        const stoneMat1 = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
        const stoneMat2 = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
        for (let s = 0; s < 18; s++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 0.025 + Math.random() * 0.022;
            const stone = new THREE.Mesh(stoneGeo, (s % 2 === 0) ? stoneMat1 : stoneMat2);
            stone.position.set(Math.cos(angle) * r, 0.078, Math.sin(angle) * r);
            group.add(stone);
        }

        // FUNGSI MEMBUAT HELAI DAUN SUKULEN 3D BERVOLUME TEBAL (FLESHY SUCCULENT LEAF)
        function createSucculentLeaf(length, width, thickness, arch, color, tipColor) {
            const geom = new THREE.BufferGeometry();
            const segments = 6;
            const positions = [];
            const indices = [];
            const colors = [];

            const cBase = new THREE.Color(color);
            const cTip = new THREE.Color(tipColor || color);

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const z = t * length;
                const y = Math.sin(t * Math.PI * 0.5) * (length * arch) - (Math.pow(t, 2.2) * length * 0.15);
                const w = (t === 1.0) ? 0 : Math.sin(Math.pow(t, 0.65) * Math.PI) * (width * 0.5);
                const th = (t === 1.0) ? 0 : Math.sin(Math.pow(t, 0.6) * Math.PI) * (thickness * 0.5);

                const cNode = cBase.clone().lerp(cTip, Math.pow(t, 1.5));

                positions.push(0, y + th, z);     // 0: Puncak atas cembung
                positions.push(-w, y, z);         // 1: Tepi kiri
                positions.push(0, y - th * 0.6, z); // 2: Lunas bawah
                positions.push(w, y, z);          // 3: Tepi kanan

                for (let k = 0; k < 4; k++) {
                    colors.push(cNode.r, cNode.g, cNode.b);
                }
            }

            for (let i = 0; i < segments; i++) {
                const b1 = i * 4;
                const b2 = (i + 1) * 4;

                // Muka Atas-Kiri
                indices.push(b1, b2, b1 + 1);
                indices.push(b1 + 1, b2, b2 + 1);

                // Muka Atas-Kanan
                indices.push(b1, b1 + 3, b2);
                indices.push(b2, b1 + 3, b2 + 3);

                // Muka Bawah-Kiri
                indices.push(b1 + 2, b1 + 1, b2 + 2);
                indices.push(b2 + 2, b1 + 1, b2 + 1);

                // Muka Bawah-Kanan
                indices.push(b1 + 2, b2 + 2, b1 + 3);
                indices.push(b2 + 2, b2 + 3, b1 + 3);
            }

            geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geom.setIndex(indices);
            geom.computeVertexNormals();

            const mat = new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.32,
                metalness: 0.08
            });

            return new THREE.Mesh(geom, mat);
        }

        // MEMBANGUN 6 TINGKAT LAPISAN DAUN (TOTAL 68 HELAI DAUN DENGAN SPIRAL FIBONACCI)
        const tiers = [
            { count: 16, len: 0.046, w: 0.022, th: 0.009, arch: 0.15, pitch: -0.15, y: 0.078, baseColor: 0x14532d, tipColor: 0x15803d },
            { count: 14, len: 0.042, w: 0.020, th: 0.0085, arch: 0.28, pitch: 0.05, y: 0.082, baseColor: 0x15803d, tipColor: 0x16a34a },
            { count: 12, len: 0.036, w: 0.017, th: 0.0075, arch: 0.40, pitch: 0.25, y: 0.087, baseColor: 0x16a34a, tipColor: 0x22c55e },
            { count: 10, len: 0.030, w: 0.014, th: 0.0065, arch: 0.50, pitch: 0.45, y: 0.093, baseColor: 0x22c55e, tipColor: 0x4ade80 },
            { count: 9, len: 0.024, w: 0.011, th: 0.0055, arch: 0.60, pitch: 0.65, y: 0.100, baseColor: 0x4ade80, tipColor: 0x86efac },
            { count: 7, len: 0.018, w: 0.008, th: 0.0045, arch: 0.70, pitch: 0.85, y: 0.106, baseColor: 0x86efac, tipColor: 0xbbf7d0 }
        ];

        let totalLeafIndex = 0;
        const goldenAngle = 2.39996;

        tiers.forEach((tier) => {
            for (let i = 0; i < tier.count; i++) {
                const angle = totalLeafIndex * goldenAngle + (i / tier.count) * 0.1;
                totalLeafIndex++;

                const leaf = createSucculentLeaf(tier.len, tier.w, tier.th, tier.arch, tier.baseColor, tier.tipColor);
                const radiusOffset = 0.006 * (6 - tiers.indexOf(tier));
                leaf.position.set(Math.cos(angle) * radiusOffset, tier.y, Math.sin(angle) * radiusOffset);

                leaf.rotation.y = angle;
                leaf.rotation.x = tier.pitch;
                leaf.rotation.z = (Math.random() - 0.5) * 0.05;

                group.add(leaf);
            }
        });

        this.el.setObject3D('mesh', group);
    }
});
