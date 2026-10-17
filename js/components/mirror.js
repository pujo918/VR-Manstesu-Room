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
// 1. KOMPONEN CERMIN REAL-TIME (PLANAR REFLECTOR - PRESISI TINGGI & RINGAN)
// =========================================================================
AFRAME.registerComponent('realtime-mirror', {
    schema: {
        width: { type: 'number', default: 0.66 },
        height: { type: 'number', default: 1.93 },
        color: { type: 'color', default: '#ffffff' }
    },

    init: function () {
        // Objek matematika refleksi Three.js Reflector (1:1 True-to-life Flat Optical Mirror)
        this.reflectorPlane = new THREE.Plane();
        this.normal = new THREE.Vector3();
        this.reflectorWorldPosition = new THREE.Vector3();
        this.cameraWorldPosition = new THREE.Vector3();
        this.rotationMatrix = new THREE.Matrix4();
        this.cameraRotationMatrix = new THREE.Matrix4();
        this.lookAtPosition = new THREE.Vector3();
        this.clipPlane = new THREE.Vector4();
        this.clipVector = new THREE.Vector4();
        this.view = new THREE.Vector3();
        this.target = new THREE.Vector3();
        this.q = new THREE.Vector4();
        this.textureMatrix = new THREE.Matrix4();
        this.viewportSize = new THREE.Vector2();

        // Frustum culling kamera pemain
        this.frustum = new THREE.Frustum();
        this.projScreenMatrix = new THREE.Matrix4();

        // Kamera virtual refleksi
        this.virtualCamera = new THREE.PerspectiveCamera();

        // Hitung aspek rasio layar agar resolusi render target 1:1 dengan viewport
        const winWidth = window.innerWidth || 1280;
        const winHeight = window.innerHeight || 720;
        const aspect = winWidth / Math.max(winHeight, 1);
        const rtWidth = 1024;
        const rtHeight = Math.max(512, Math.round(1024 / aspect));

        this.renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            generateMipmaps: false,
            depthBuffer: true,
            stencilBuffer: false
        });

        // Shader refleksi planar presisi 1:1 bebas distorsi cembung
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(this.data.color) },
                tDiffuse: { value: this.renderTarget.texture },
                textureMatrix: { value: this.textureMatrix }
            },
            vertexShader: `
                uniform mat4 textureMatrix;
                varying vec4 vUv;
                void main() {
                    vUv = textureMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform sampler2D tDiffuse;
                varying vec4 vUv;

                // Konversi Linear Color Space ke sRGB Display
                vec3 linearToSRGB(vec3 value) {
                    return mix(
                        pow(value, vec3(1.0 / 2.2)),
                        value * 12.92,
                        lessThanEqual(value, vec3(0.0031308))
                    );
                }

                void main() {
                    vec4 base = texture2DProj(tDiffuse, vUv);
                    vec3 col = base.rgb * color;
                    col = linearToSRGB(col);
                    gl_FragColor = vec4(col, 1.0);
                }
            `
        });

        const geometry = new THREE.PlaneGeometry(this.data.width, this.data.height);
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.el.setObject3D('mesh', this.mesh);

        // Penyesuaian saat ukuran jendela peramban berubah
        this.onResize = () => {
            const sceneEl = this.el.sceneEl;
            if (sceneEl && sceneEl.renderer) {
                sceneEl.renderer.getSize(this.viewportSize);
                const curAspect = this.viewportSize.x / Math.max(this.viewportSize.y, 1);
                const w = 1024;
                const h = Math.max(512, Math.round(1024 / curAspect));
                if (this.renderTarget.width !== w || this.renderTarget.height !== h) {
                    this.renderTarget.setSize(w, h);
                }
            }
        };
        window.addEventListener('resize', this.onResize);
    },

    tick: function () {
        if (!this.mesh) return;
        // Di mode VR ganda, lewati rendering cermin untuk menjaga kestabilan 60 FPS tanpa patah-patah
        if (window.MensetsuControls && window.MensetsuControls.activeMode === 'vr') return;

        const sceneEl = this.el.sceneEl;
        if (!sceneEl || !sceneEl.renderer) return;

        const renderer = sceneEl.renderer;
        const camera = sceneEl.camera;
        if (!camera) return;

        // 1. Dapatkan posisi dunia cermin & posisi dunia kamera pemain
        this.mesh.updateMatrixWorld(true);
        camera.updateMatrixWorld();

        this.reflectorWorldPosition.setFromMatrixPosition(this.mesh.matrixWorld);
        this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

        // 2. Optimasi Jarak: Hanya render jika pemain berada dalam radius 3.5m dari cermin
        const distToMirror = this.cameraWorldPosition.distanceTo(this.reflectorWorldPosition);
        if (distToMirror > 3.5) return;

        // 3. Hitung Normal bidang cermin (+Z lokal bidang PlaneGeometry):
        this.rotationMatrix.extractRotation(this.mesh.matrixWorld);
        this.normal.set(0, 0, 1).applyMatrix4(this.rotationMatrix).normalize();

        // 4. Cek apakah pemain berada di DEPAN cermin (bukan di belakang tembok cermin)
        this.view.subVectors(this.reflectorWorldPosition, this.cameraWorldPosition);
        if (this.view.dot(this.normal) > 0) return;

        // 5. Frustum Culling: Cek apakah cermin masuk ke area pandang (FOV) kamera pemain
        this.projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
        if (!this.frustum.intersectsObject(this.mesh)) return;

        // 6. Hitung Posisi Kamera Virtual Refleksi
        this.view.reflect(this.normal).negate();
        this.view.add(this.reflectorWorldPosition);

        // 7. Orientasi arah pandang diekstrak dari KAMERA PEMAIN (bukan cermin)
        this.cameraRotationMatrix.extractRotation(camera.matrixWorld);

        this.lookAtPosition.set(0, 0, -1);
        this.lookAtPosition.applyMatrix4(this.cameraRotationMatrix);
        this.lookAtPosition.add(this.cameraWorldPosition);

        this.target.subVectors(this.reflectorWorldPosition, this.lookAtPosition);
        this.target.reflect(this.normal).negate();
        this.target.add(this.reflectorWorldPosition);

        this.virtualCamera.position.copy(this.view);
        this.virtualCamera.up.set(0, 1, 0);
        this.virtualCamera.up.applyMatrix4(this.cameraRotationMatrix);
        this.virtualCamera.up.reflect(this.normal);
        this.virtualCamera.lookAt(this.target);

        this.virtualCamera.far = camera.far || 35.0;
        this.virtualCamera.updateMatrixWorld();
        this.virtualCamera.matrixWorldInverse.copy(this.virtualCamera.matrixWorld).invert();
        this.virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

        // 8. Matriks Proyeksi Tekstur (Texture Matrix)
        // Dihitung dengan projectionMatrix asli sebelum dipotong clip plane agar bebas distorsi cembung!
        this.textureMatrix.set(
            0.5, 0.0, 0.0, 0.5,
            0.0, 0.5, 0.0, 0.5,
            0.0, 0.0, 0.5, 0.5,
            0.0, 0.0, 0.0, 1.0
        );
        this.textureMatrix.multiply(this.virtualCamera.projectionMatrix);
        this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse);
        this.textureMatrix.multiply(this.mesh.matrixWorld);

        // 9. Oblique Near-Plane Clipping (Eric Lengyel Algorithm)
        this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal, this.reflectorWorldPosition);
        this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse);

        this.clipPlane.set(
            this.reflectorPlane.normal.x,
            this.reflectorPlane.normal.y,
            this.reflectorPlane.normal.z,
            this.reflectorPlane.constant
        );

        const projMat = this.virtualCamera.projectionMatrix;
        this.q.x = (Math.sign(this.clipPlane.x) + projMat.elements[8]) / projMat.elements[0];
        this.q.y = (Math.sign(this.clipPlane.y) + projMat.elements[9]) / projMat.elements[5];
        this.q.z = -1.0;
        this.q.w = (1.0 + projMat.elements[10]) / projMat.elements[14];

        // Skala vektor clipping plane
        const dotClip = this.clipPlane.dot(this.q);
        if (Math.abs(dotClip) > 0.0001) {
            this.clipVector.copy(this.clipPlane).multiplyScalar(2.0 / dotClip);
            projMat.elements[2] = this.clipVector.x;
            projMat.elements[6] = this.clipVector.y;
            projMat.elements[10] = this.clipVector.z + 1.0;
            projMat.elements[14] = this.clipVector.w;
        }

        // 10. RENDER PASS CERMIN
        this.mesh.visible = false;

        // Sembunyikan ruang wawancara selama render pass cermin (menghemat draw calls NPC)
        const interviewRoom = document.getElementById('scene-interview-room');
        const prevInterviewVis = interviewRoom ? interviewRoom.object3D.visible : true;
        if (interviewRoom) interviewRoom.object3D.visible = false;

        // Tampilkan kepala avatar kandidat agar terlihat utuh di cermin
        const avatarEl = document.getElementById('candidate-player-avatar');
        const avatarComp = avatarEl && avatarEl.components ? avatarEl.components['candidate-avatar'] : null;
        if (avatarComp) {
            avatarComp.showHeadForMirror();
        }

        const prevShadowAuto = renderer.shadowMap.autoUpdate;
        renderer.shadowMap.autoUpdate = false;

        const currentRenderTarget = renderer.getRenderTarget();
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(sceneEl.object3D, this.virtualCamera);
        renderer.setRenderTarget(currentRenderTarget);

        renderer.shadowMap.autoUpdate = prevShadowAuto;
        this.mesh.visible = true;
        if (interviewRoom) interviewRoom.object3D.visible = prevInterviewVis;
        if (avatarComp) {
            avatarComp.hideHeadForFirstPerson();
        }
    },

    remove: function () {
        if (this.onResize) window.removeEventListener('resize', this.onResize);
        if (this.renderTarget) this.renderTarget.dispose();
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
