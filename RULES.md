# RULES — Mensetsu VR Room

Aturan wajib saat mengembangkan dan memodifikasi proyek ini. Konteks lengkap mengacu pada `ARCHITECTURE.md`.

---

## 1. Sudut Pandang & Filosofi Penilaian
1. Kita adalah **developer, builder, sekaligus Sensei**. Setiap fitur harus menjawab: *apakah membantu mahasiswa berlatih etika nyata?* dan *apakah memudahkan Sensei mengevaluasi hasil rekaman?*
2. **Sistem Sandbox / Non-Linear Manner Test:** Sistem **tidak boleh memaksa atau mengunci** alur mahasiswa. Mahasiswa harus memiliki kebebasan untuk melakukan kesalahan (misal: langsung masuk tanpa mengetuk, langsung duduk tanpa menunggu dipersilakan, atau lupa Ojigi). Kesalahan-kesalahan ini menjadi variabel pengurang poin pada skor Etika otomatis.

---

## 2. Multi-Device & Kontrol
3. **Pilihan Perangkat di Layar Awal (Gate Screen):** Mahasiswa wajib memilih mode perangkat saat awal membuka web:
   - **VR Headset (WebXR):** Kontroler 6DoF, ayunan tangan, dan Gaze Tracking ke wajah NPC.
   - **Mobile (Smartphone):** Virtual Analog Joystick di kiri bawah, Touch Swipe Camera di kanan, tombol aksi virtual (Ketuk, Ojigi, Duduk, Mic), serta tombol toggle Layar Penuh.
   - **Laptop / PC:** Keyboard WASD untuk berjalan, Mouse look untuk kamera, dan tombol shortcut (F = Interaksi/Ketuk, O = Ojigi, C = Duduk/Berdiri, Space = Mic).
4. **Wajib HTTPS:** Diperlukan untuk akses mikrofon, sensor gerak, dan Fullscreen API.

---

## 3. Karakter & Visual 3D
5. Avatar kandidat dan ketiga NPC pewawancara harus berupa **model 3D rigged utuh dengan animasi natural**, bukan sprite 2D PNG / billboard.
6. **Formasi 3 NPC Pewawancara di Balik Meja:**
   - NPC 1 (Kiri - Pria): Pewawancara aktif (Pertanyaan 1 - Alasan Beasiswa / Ouboryuu).
   - NPC 2 (Tengah - Pria): Ketua & Pencatat / Observer (Mempersilakan duduk, mengamati, dan menutup sesi).
   - NPC 3 (Kanan - Wanita): Pewawancara aktif (Pertanyaan 2 - Kelebihan & Pengalaman / Chousho).
7. Standar pakaian formal wawancara Jepang (*Recruit Suit*): Jas gelap, kemeja putih, dasi rapi, tanpa aksesoris non-formal, wajah bersih dan sopan.

---

## 4. Penilaian & Integrasi Cloud (Google Drive 5TB + Spreadsheet)
8. **Pembagian Rubrik (Total 100 Poin):**
   - **Etika & Postur (Maks 30 Poin):** Dihitung secara **otomatis oleh sistem web** (Ketuk 3x, Salam Masuk, Ojigi, Etika Duduk, Gaze Kontak Mata, Salam Keluar).
   - **Bahasa & Kelancaran (Maks 35 Poin):** Kolom di Spreadsheet diisi **manual oleh Sensei** setelah mendengarkan rekaman audio.
   - **Struktur Jawaban Quartet II (Maks 35 Poin):** Kolom di Spreadsheet diisi **manual oleh Sensei** setelah mendengarkan rekaman audio.
9. **Penyimpanan Rekaman:**
   - Rekaman berupa **file audio murni** (tanpa transkrip otomatis untuk saat ini) yang diunggah ke Google Drive 5TB milik Sensei melalui Google Apps Script.
   - Spreadsheet mencatat metadata, Session ID, Nama mahasiswa, rincian skor etika otomatis, link audio Drive, dan kolom penilaian Sensei.
10. Transkripsi suara otomatis ditunda hingga tahap integrasi layanan Transkripsi Pro.

---

## 5. Alur Edukasi & Konten
11. **Video Pembelajaran di Waiting Room:** Disediakan monitor/TV interaktif di ruang tunggu dengan materi etika wawancara (*Akane-teki Nihongo Kyoushitsu*).
12. **Voice Generation NPC:** Suara dialog NPC menggunakan audio bahasa Jepang sintetis berkualitas alami (*natural Japanese voice audio*).
13. **Kebebasan Jawaban:** Mahasiswa dibebaskan menjawab dengan data profil/penelitian asli mereka asalkan mengikuti struktur 4 tahap Quartet II.
14. Setiap perubahan berkas skrip JavaScript wajib menaikkan versi cache-buster (`?v=`) di `index.html`.
