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
