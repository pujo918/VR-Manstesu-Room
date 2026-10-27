// =========================================================================
// REAL-TIME PLANAR MIRROR & 3D HUMANOID CANDIDATE AVATAR SYSTEM (v6.0)
// High-Performance & Crystal-Clear Reflection (Zero Distortion, Solid 60 FPS)
// =========================================================================

// Objek matematika reusable di luar loop tick untuk mencegah Garbage Collection (Zero GC Allocations)
const _axisX = new THREE.Vector3(1, 0, 0);
const _axisY = new THREE.Vector3(0, 1, 0);
const _axisZ = new THREE.Vector3(0, 0, 1);
const _qTemp1 = new THREE.Quaternion();
const _qTemp2 = new THREE.Quaternion();
const _qTemp3 = new THREE.Quaternion();
const _qTemp4 = new THREE.Quaternion();
const _qStand = new THREE.Quaternion().setFromAxisAngle(_axisX, 0.49); // Postur Kiotsuke 28 derajat
const _handWorldQuat = new THREE.Quaternion();
const _charWorldQuat = new THREE.Quaternion();
const _localBriefcaseQuat = new THREE.Quaternion();

// =========================================================================
// =========================================================================
// 1. KOMPONEN CERMIN OPTIMAL (ZERO-HITCH STUDIO REFLECTION - SOLID 60 FPS)
// Dinonaktifkan dari render-pass sekunder untuk menghilangkan frame drop
// =========================================================================
AFRAME.registerComponent('realtime-mirror', {
    schema: {
        width: { type: 'number', default: 0.66 },
        height: { type: 'number', default: 1.93 },
        color: { type: 'color', default: '#ffffff' }
    },

    init: function () {
        const geometry = new THREE.PlaneGeometry(this.data.width, this.data.height);
        this.material = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.12,
            metalness: 0.88
        });
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.el.setObject3D('mesh', this.mesh);
    },

    tick: function () {
        // Dinonaktifkan: Mencegah render pass sekunder yang menyebabkan frame drop
    },

    remove: function () {
        if (this.material) this.material.dispose();
    }
});


// =========================================================================
// 2. MODEL AVATAR KANDIDAT WAWANCARA 3D HUMANOID GLTF DENGAN SKELETAL RIGGING
// =========================================================================
AFRAME.registerComponent('candidate-avatar', {
    init: function () {
        this.camera = document.getElementById('player-camera');
        this.lastCamPos = new THREE.Vector3();
        this.currentCamPos = new THREE.Vector3();
        this.isMoving = false;
        this.movingFactor = 0;
        this.walkCycle = 0;
        this.walkSpeed = 8.5;
        this.bones = {};
        this.headMeshes = [];
        this.modelLoaded = false;
        this.initialHipsY = 1.0;

        // Container grup utama avatar
        this.avatarRoot = new THREE.Group();
        this.avatarRoot.visible = true;
        this.el.setObject3D('mesh', this.avatarRoot);

        // Muat tekstur jas formal recruit, celana bahan, dan sepatu kulit
        const texLoader = new THREE.TextureLoader();
        const topTex = texLoader.load('assets/suit-formal-top.jpg?v=5.0');
        topTex.encoding = THREE.sRGBEncoding;
        const botTex = texLoader.load('assets/suit-formal-bottom.jpg?v=5.0');
        botTex.encoding = THREE.sRGBEncoding;
        const shoeTex = texLoader.load('assets/suit-formal-shoes.jpg?v=5.0');
        shoeTex.encoding = THREE.sRGBEncoding;

        // Muat model 3D GLTF Humanoid Resmi
        const loader = new THREE.GLTFLoader();
        loader.load('assets/candidate.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(0.93, 0.93, 0.93);

            const isHeadMeshNode = (node) => {
                const name = (node.name || '').toLowerCase();
                const parentName = (node.parent && node.parent.name ? node.parent.name : '').toLowerCase();
                return name.includes('head') || name.includes('eye') || name.includes('teeth') || 
                       name.includes('beard') || parentName.includes('head') || parentName.includes('beard');
            };

            this.model.traverse((node) => {
                if (node.isBone) {
                    this.bones[node.name] = node;
                    node.userData.restQuat = node.quaternion.clone();
                }
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;

                    if (node.name === 'Wolf3D_Beard' || node.name === 'Wolf3D_Headwear') {
                        node.visible = false;
                        return;
                    }

                    if (node.name === 'Wolf3D_Outfit_Top') {
                        node.material.map = topTex;
                        node.material.color.setHex(0xffffff);
                        node.material.normalMap = null;
                        node.material.roughness = 0.55;
                        node.material.metalness = 0.05;
                        node.material.needsUpdate = true;

                        // Ratakan relief bunga korsase pada jas
                        const pos = node.geometry.attributes.position;
                        for (let i = 0; i < pos.count; i++) {
                            const x = pos.getX(i);
                            const y = pos.getY(i);
                            const z = pos.getZ(i);
                            if (x >= -0.15 && x <= -0.05 && y >= 1.24 && y <= 1.42 && z > 0.08) {
                                pos.setZ(i, 0.075);
                            }
                        }
                        pos.needsUpdate = true;
                        node.geometry.computeVertexNormals();
                    }

                    if (node.name === 'Wolf3D_Outfit_Bottom') {
                        node.material.map = botTex;
                        node.material.color.setHex(0xffffff);
                        node.material.roughness = 0.60;
                        node.material.metalness = 0.05;
                        node.material.needsUpdate = true;
                    }

                    if (node.name === 'Wolf3D_Outfit_Footwear') {
                        node.material.map = shoeTex;
                        node.material.color.setHex(0xffffff);
                        node.material.roughness = 0.35;
                        node.material.metalness = 0.15;
                        node.material.needsUpdate = true;
                    }

                    if (isHeadMeshNode(node)) {
                        this.headMeshes.push(node);
                        node.visible = false; // Sembunyikan kepala dari first-person
                    } else {
                        node.visible = true; // Badan selalu tampak
                    }
                }
            });

            if (this.bones['Hips']) {
                this.initialHipsY = this.bones['Hips'].position.y;
            }

            // 1. Rambut Formal Kandidat Jepang (黒髪・爽やかな就活ショート 7:3分け)
            if (this.bones['Head']) {
                const hairGroup = new THREE.Group();
                const hairMat = new THREE.MeshStandardMaterial({
                    color: 0x0a0b0e,
                    roughness: 0.36,
                    metalness: 0.14
                });

                const capGeo = new THREE.SphereGeometry(0.086, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62);
                const cap = new THREE.Mesh(capGeo, hairMat);
                cap.scale.set(0.96, 1.05, 1.06);
                cap.position.set(0, 0.136, 0.002);
                hairGroup.add(cap);

                const crownGeo = new THREE.SphereGeometry(0.084, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.48);
                const crown = new THREE.Mesh(crownGeo, hairMat);
                crown.scale.set(0.96, 0.72, 1.05);
                crown.position.set(-0.005, 0.165, 0.008);
                hairGroup.add(crown);

                function makeStrand(points, radius = 0.010) {
                    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
                    const geo = new THREE.TubeGeometry(curve, 12, radius, 6, false);
                    return new THREE.Mesh(geo, hairMat);
                }

                hairGroup.add(makeStrand([
                    [-0.076, 0.130, 0.015],
                    [-0.082, 0.100, 0.018],
                    [-0.081, 0.065, 0.016]
                ], 0.007));

                hairGroup.add(makeStrand([
                    [0.076, 0.130, 0.015],
                    [0.082, 0.100, 0.018],
                    [0.081, 0.065, 0.016]
                ], 0.007));

                const napeGeo = new THREE.CylinderGeometry(0.056, 0.046, 0.055, 12, 1, false, 0, Math.PI);
                const nape = new THREE.Mesh(napeGeo, hairMat);
                nape.rotation.set(0.22, Math.PI, 0);
                nape.position.set(0, 0.078, -0.062);
                hairGroup.add(nape);

                hairGroup.add(makeStrand([
                    [0.015, 0.185, 0.060],
                    [-0.015, 0.170, 0.078],
                    [-0.045, 0.150, 0.076],
                    [-0.065, 0.135, 0.055]
                ], 0.009));

                hairGroup.add(makeStrand([
                    [0.010, 0.188, 0.055],
                    [-0.010, 0.165, 0.080],
                    [-0.035, 0.145, 0.078],
                    [-0.055, 0.130, 0.065]
                ], 0.008));

                hairGroup.add(makeStrand([
                    [0.020, 0.185, 0.060],
                    [0.005, 0.162, 0.082],
                    [-0.015, 0.146, 0.080]
                ], 0.007));

                hairGroup.add(makeStrand([
                    [0.025, 0.185, 0.060],
                    [0.048, 0.165, 0.072],
                    [0.065, 0.145, 0.050]
                ], 0.008));

                hairGroup.traverse((child) => {
                    if (child.isMesh) {
                        this.headMeshes.push(child);
                        child.visible = false;
                    }
                });

                this.bones['Head'].add(hairGroup);
            }

            // 2. Dasi & Kerah Kemeja Putih Formal 3D (Attached to Spine2)
            if (this.bones['Spine2']) {
                const tieRig = new THREE.Group();

                const collarMat = new THREE.MeshStandardMaterial({
                    color: 0xf8fafc,
                    roughness: 0.75,
                    metalness: 0.02
                });
                const collarL = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.046, 0.010), collarMat);
                collarL.rotation.set(0.28, 0.32, -0.38);
                collarL.position.set(-0.029, 0.182, 0.125);
                tieRig.add(collarL);

                const collarR = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.046, 0.010), collarMat);
                collarR.rotation.set(0.28, -0.32, 0.38);
                collarR.position.set(0.029, 0.182, 0.125);
                tieRig.add(collarR);

                const tieMat = new THREE.MeshStandardMaterial({
                    color: 0x1d3557,
                    roughness: 0.32,
                    metalness: 0.18
                });

                const knot = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.015, 0.038, 8), tieMat);
                knot.position.set(0, 0.166, 0.135);
                knot.rotation.x = 0.22;
                tieRig.add(knot);

                const upperBlade = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.14, 0.007), tieMat);
                upperBlade.position.set(0, 0.088, 0.136);
                upperBlade.rotation.x = 0.06;
                tieRig.add(upperBlade);

                const lowerBlade = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.16, 0.007), tieMat);
                lowerBlade.position.set(0, -0.052, 0.130);
                lowerBlade.rotation.x = 0.02;
                tieRig.add(lowerBlade);

                const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.048, 4), tieMat);
                tip.rotation.y = Math.PI / 4;
                tip.rotation.z = Math.PI;
                tip.position.set(0, -0.152, 0.128);
                tieRig.add(tip);

                const clip = new THREE.Mesh(
                    new THREE.BoxGeometry(0.042, 0.007, 0.012),
                    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.12 })
                );
                clip.position.set(0.006, 0.045, 0.142);
                tieRig.add(clip);

                this.bones['Spine2'].add(tieRig);
            }

            // 3. Tas Kerja Dokumen Formal Jepang (Mensetsu Briefcase) di Tangan Kiri
            if (this.bones['LeftHand']) {
                this.briefcaseGroup = new THREE.Group();
                const bagBody = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.28, 0.38),
                    new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.35, metalness: 0.1 })
                );
                bagBody.position.set(0, -0.14, 0);
                this.briefcaseGroup.add(bagBody);

                const bagHandle = new THREE.Mesh(
                    new THREE.TorusGeometry(0.045, 0.008, 6, 12, Math.PI),
                    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
                );
                bagHandle.rotation.y = Math.PI / 2;
                this.briefcaseGroup.add(bagHandle);

                this.briefcaseGroup.position.set(0.01, 0.02, 0.0);
                this.bones['LeftHand'].add(this.briefcaseGroup);
            }

            this.avatarRoot.add(this.model);
            this.modelLoaded = true;
        });
    },

    showHeadForMirror: function () {
        for (let i = 0; i < this.headMeshes.length; i++) {
            this.headMeshes[i].visible = true;
        }
    },

    hideHeadForFirstPerson: function () {
        for (let i = 0; i < this.headMeshes.length; i++) {
            this.headMeshes[i].visible = false;
        }
    },

    tick: function (time, deltaTime) {
        if (!this.modelLoaded || !this.camera) return;

        const dt = Math.min(deltaTime / 1000, 0.1);

        // Posisi & arah kamera pemain
        const camObj = this.camera.object3D;
        camObj.getWorldPosition(this.currentCamPos);

        let yawRad = 0;
        let pitchRad = 0;
        const lookControls = this.camera.components ? this.camera.components['look-controls'] : null;
        if (lookControls && lookControls.yawObject) {
            yawRad = lookControls.yawObject.rotation.y;
            if (lookControls.pitchObject) {
                pitchRad = lookControls.pitchObject.rotation.x;
            }
        } else {
            const camRot = this.camera.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
            yawRad = ((camRot.y || 0) * Math.PI) / 180;
            pitchRad = ((camRot.x || 0) * Math.PI) / 180;
        }

        // Deteksi pergerakan pemain (W, A, S, D)
        const moveDist = this.currentCamPos.distanceTo(this.lastCamPos);
        const speed = moveDist / Math.max(dt, 0.001);
        this.isMoving = speed > 0.08;
        this.lastCamPos.copy(this.currentCamPos);

        const targetFactor = this.isMoving ? 1.0 : 0.0;
        this.movingFactor = THREE.MathUtils.lerp(this.movingFactor, targetFactor, dt * 8.0);

        if (this.isMoving) {
            this.walkCycle += dt * this.walkSpeed;
        }

        const legSin = Math.sin(this.walkCycle);

        // 1. Animasi Kaki (Legs) - Reusable Quaternions (Zero GC)
        if (this.bones['LeftUpLeg'] && this.bones['RightUpLeg']) {
            const leftAngle = legSin * 0.42 * this.movingFactor;
            const rightAngle = -legSin * 0.42 * this.movingFactor;

            _qTemp1.setFromAxisAngle(_axisX, leftAngle);
            _qTemp2.setFromAxisAngle(_axisX, rightAngle);

            this.bones['LeftUpLeg'].quaternion.copy(this.bones['LeftUpLeg'].userData.restQuat).multiply(_qTemp1);
            this.bones['RightUpLeg'].quaternion.copy(this.bones['RightUpLeg'].userData.restQuat).multiply(_qTemp2);

            if (this.bones['LeftLeg'] && this.bones['RightLeg']) {
                const kLeft = Math.max(0, -legSin) * 0.60 * this.movingFactor;
                const kRight = Math.max(0, legSin) * 0.60 * this.movingFactor;
                _qTemp3.setFromAxisAngle(_axisX, kLeft);
                _qTemp4.setFromAxisAngle(_axisX, kRight);

                this.bones['LeftLeg'].quaternion.copy(this.bones['LeftLeg'].userData.restQuat).multiply(_qTemp3);
                this.bones['RightLeg'].quaternion.copy(this.bones['RightLeg'].userData.restQuat).multiply(_qTemp4);
            }

            if (this.bones['LeftFoot'] && this.bones['RightFoot']) {
                const fLeft = -leftAngle * 0.30;
                const fRight = -rightAngle * 0.30;
                _qTemp1.setFromAxisAngle(_axisX, fLeft);
                _qTemp2.setFromAxisAngle(_axisX, fRight);
                this.bones['LeftFoot'].quaternion.copy(this.bones['LeftFoot'].userData.restQuat).multiply(_qTemp1);
                this.bones['RightFoot'].quaternion.copy(this.bones['RightFoot'].userData.restQuat).multiply(_qTemp2);
            }
        }

        // 2. Postur Tangan Alami Siap Wawancara (Kiotsuke)
        if (this.bones['LeftArm'] && this.bones['RightArm']) {
            const armSwing = legSin * 0.22 * this.movingFactor;
            _qTemp1.setFromAxisAngle(_axisZ, armSwing);
            _qTemp2.setFromAxisAngle(_axisZ, -armSwing * 0.35);

            this.bones['RightArm'].quaternion.copy(this.bones['RightArm'].userData.restQuat).multiply(_qStand).multiply(_qTemp1);
            this.bones['LeftArm'].quaternion.copy(this.bones['LeftArm'].userData.restQuat).multiply(_qStand).multiply(_qTemp2);
        }

        // 3. Orientasi Tas Koper Dokumen (Tegak Lurus Sejajar Badan)
        if (this.briefcaseGroup && this.bones['LeftHand']) {
            this.bones['LeftHand'].getWorldQuaternion(_handWorldQuat);
            this.model.getWorldQuaternion(_charWorldQuat);
            _localBriefcaseQuat.copy(_handWorldQuat).invert().multiply(_charWorldQuat);
            this.briefcaseGroup.quaternion.copy(_localBriefcaseQuat);
        }

        // 4. Bobbing Pinggul & Nafas Halus
        if (this.bones['Hips']) {
            const bobY = Math.abs(Math.sin(this.walkCycle * 2)) * 0.02 * this.movingFactor;
            this.bones['Hips'].position.y = this.initialHipsY + bobY;
        }

        if (this.bones['Spine1']) {
            const breathe = Math.sin(time * 0.002) * 0.012;
            _qTemp1.setFromAxisAngle(_axisX, breathe);
            this.bones['Spine1'].quaternion.copy(this.bones['Spine1'].userData.restQuat).multiply(_qTemp1);
        }

        // 5. Posisi & Orientasi Tubuh
        const forwardX = -Math.sin(yawRad);
        const forwardZ = -Math.cos(yawRad);
        const eyeOffset = 0.14;

        this.el.object3D.position.set(
            this.currentCamPos.x - forwardX * eyeOffset,
            0,
            this.currentCamPos.z - forwardZ * eyeOffset
        );
        this.el.object3D.rotation.y = yawRad + Math.PI;
        
        // 6. Gerakan Menunduk / Mengangkat Kepala Alami (Head Pitch Tracking)
        if (this.bones['Head'] && this.bones['Head'].userData.restQuat) {
            _qTemp1.setFromAxisAngle(_axisX, -pitchRad * 0.75);
            this.bones['Head'].quaternion.copy(this.bones['Head'].userData.restQuat).multiply(_qTemp1);
        }
    }
});
