# desain.md — Panduan Desain Proyek VR 360

Dokumen ini adalah aturan wajib untuk agen AI yang mengerjakan proyek ini.
Baca SELURUHNYA sebelum menulis kode UI, membuat objek 3D, atau menulis teks apa pun.

Tujuannya satu: hasil akhir harus terlihat dibuat oleh desainer yang paham ruang dan
materialnya, bukan oleh generator. Kalau ada keraguan antara "aman dan generik" dan
"spesifik dan punya alasan", pilih yang spesifik.

\---

## 0\. Brief Proyek: Mensetsu VR Room

1. **Subjek VR:**

**Simulasi Ruang Wawancara Beasiswa S2 / Akademis Jepang (面接シミュレーション)**

**Terdiri dari 2 area terintegrasi:**



**Ruang Tunggu \& Resepsionis (待合室・受付ロビー) — sofa tunggu, TV video pembelajaran etika, dan cermin grooming (身だしなみ).**

**Ruang Wawancara (面接室) — meja formal 3 penguji (mensetsukan) dan kursi kandidat.**

**2. Audiens:**

**Pengguna Utama: Mahasiswa / kandidat pelamar beasiswa S2 atau studi lanjut ke Jepang yang sedang mempersiapkan diri menghadapi wawancara formal (mensetsu).**

**Evaluator (Pihak Penilai): Sensei / dosen pembimbing yang mengevaluasi audio rekaman lisan dan rekap skor etika via Google Spreadsheet terpusat.**


**3.Tugas utama pengguna:**

**Lobi/Ruang Tunggu: Menonton video panduan etika wawancara di TV monitor dan mengecek kerapian jas (recruit suit) di cermin grooming.**

**Transisi Masuk Ruangan: Mengetuk pintu tepat 3 kali, mengucap salam masuk ("Shitsurei shimasu"), membuka pintu, dan melakukan ojigi (membungkuk 30°).**

**Ruang Wawancara: Berdiri di samping kursi kandidat, menunggu dipersilakan oleh ketua penguji (NPC 2), mengucap salam, lalu duduk dengan postur tegap.**

**Sesi Wawancara: Mendengarkan pertanyaan dari NPC, mempertahankan kontak mata (gaze), dan menjawab 2 pertanyaan terstruktur (Alasan Beasiswa \& Kelebihan Diri) dengan merekam suara lisan ke mikrofon.**

**Keluar Ruangan (Taishitsu): Menyampaikan salam penutup, berdiri, ojigi, berjalan ke pintu, salam perpisahan, dan menutup pintu.**


**4. Perangkat:**

**Multi-Device / Cross-Platform (Adaptive Gameplay):**



**Headset VR (Meta Quest / WebXR dengan kontroler 6DoF \& real-time gaze tracking).**

**HP / Smartphone (Mobile Touchscreen dengan Virtual Analog Joystick di kiri \& Floating Action Buttons di kanan).**

**Browser Desktop / PC / Laptop (Keyboard WASD + Mouse look + shortcut F/O/C/Space).**


**5. Engine:**

**A-Frame (v1.5.0) / Three.js berbasis WebXR / HTML5 \& JavaScript Native (dijalankan langsung di browser via HTTPS tanpa perlu instalasi aplikasi tambahan).**



**6. Suasana yang diinginkan (3 kata sifat konkret):**

**Formal/Kaku (Kasikomatte-iru / 格式張った): Karakter ruang kantor/institusi akademis Jepang resmi — dinding krem-putih, lis kayu gelap, karpet kantor abu-abu gelap, jam analog resmi, serta meja panjang formal.**

**Hening/Menegangkan (Kinpaku-kan / 緊迫した): Kesunyian ruang ujian seleksi di hadapan 3 profesor berjas gelap yang menatap dan mencatat evaluasi kandidat.**

**Tertib/Presisi (Kichitto-shita / 几帳面な): Tata letak furnitur yang simetris dan berjarak teratur, mencerminkan protokol tata krama dan etika tubuh (manner) Jepang yang terukur.**


**7. Referensi nyata:**

**Ruang Wawancara Beasiswa Monbukagakusho (MEXT) / Kampus Jepang: Setting ruang wawancara resmi berjarak \~3 meter antara meja penguji (3 orang) dan 1 kursi kandidat tanpa meja.**

**Video Pembelajaran Akane-teki Nihongo Kyoushitsu (YouTube): Referensi tata cara mengetuk pintu 3x, salam masuk/keluar, gestur ojigi, dan posisi duduk formal.**

**Buku Quartet II Bab 10 (Hal. 120–125): Standar struktur jawaban akademis Jepang (Ouboryuu \& Chousho).**

**Standar Busana Recruit Suit (リクルートスーツ): Jas hitam formal, kemeja putih berkerah rapi, dasi konservatif, tas kerja hitam tegak di samping kaki kursi.**

**Lobi Kantor / Resepsionis Tradisional Korporasi Jepang: Lantai ubin porselen, tanaman hias Dracaena/Pachira di sudut, dan sofa tamu berkarpet gelap.**1. Prinsip utama

1. **Spesifik, bukan generik.** Setiap pilihan (warna, bentuk, teks) harus bisa dijelaskan
dengan "karena subjeknya adalah ...". Kalau alasannya cuma "biar kelihatan bagus", ganti.
2. **Satu hal yang memorable.** Pilih satu elemen yang jadi ciri khas. Sisanya tenang dan rapi.
3. **Dunia nyata dulu.** Ukuran, bahan, cahaya, dan keausan harus meniru dunia nyata.
4. **Kurangi, jangan tambah.** Sebelum selesai, hapus satu hiasan. Dekorasi yang tidak
melayani fungsi harus dibuang.
5. **Tidak ada default.** Jangan pakai warna, font, radius, atau bayangan bawaan hanya
karena itu yang pertama muncul.

\---

## 2\. Larangan keras (tanda-tanda khas hasil AI)

Agen DILARANG melakukan hal berikut kecuali pemilik proyek secara eksplisit memintanya.

### Teks dan ikon

* **Dilarang memakai emoji** sebagai ikon, bullet, judul, label tombol, atau hiasan teks.
Tidak ada 🚀 ✨ 🎯 📍 🔥 👆 di UI, kode, komentar, log, maupun commit.
* Dilarang memakai teks promosi kosong: "Jelajahi pengalaman imersif", "Rasakan keajaiban",
"Revolusi", "Seamless", "Next-level", "Dunia baru menantimu".
* Dilarang memakai label huruf kapital semua dengan jarak huruf lebar di atas setiap judul.
* Dilarang memakai nomor urut (01 / 02 / 03) kalau kontennya bukan urutan sungguhan.
* Dilarang menambahkan panah "→" di setiap tombol dan link.
* Dilarang meng-highlight satu kata di judul dengan warna/miring berbeda sebagai gaya.
* Dilarang menggabung info dengan titik tengah berulang ("A · B · C") sebagai pola.

### Warna dan tampilan

* Dilarang gradien ungu-biru, gradien neon, atau gradien sebagai hiasan latar.
* Dilarang efek kaca buram (glassmorphism) di setiap panel.
* Dilarang glow/neon di tepi tombol dan teks.
* Dilarang hitam pekat-biru tua + satu aksen terang (hijau neon, cyan) sebagai tema default.
* Dilarang palet krem + serif + aksen terakota kecuali brief memintanya.
* Dilarang satu radius sudut yang sama untuk semua elemen, dan bayangan abu lembut
yang sama di bawah semuanya.
* Dilarang memecah konten jadi kartu identik yang berjajar.

### Gerak

* Dilarang animasi masuk "fade + geser naik" pada tiap elemen.
* Dilarang hover membesar/berkilau di setiap tombol.
* Dilarang hotspot berdenyut (pulsing circle) generik sebagai satu-satunya bahasa interaksi.

### Objek 3D

* Dilarang objek yang hanya kotak, silinder, dan bola ditumpuk tanpa detail.
* Dilarang tepi 90 derajat yang tajam sempurna pada benda buatan manusia.
* Dilarang satu warna rata (flat color) tanpa variasi permukaan.
* Dilarang simetri sempurna di benda yang di dunia nyata tidak sempurna.
* Dilarang objek yang melayang tanpa bayangan kontak.

\---

## 3\. Objek 3D (kursi, meja, dekorasi, dll.)

Ini sumber utama kesan "AI banget". Aturannya:

### 3.1 Prioritas sumber

1. **Pakai aset nyata yang sudah jadi** (glTF/GLB) daripada membangun dari primitif.
Sumber yang layak dicek lisensinya: Poly Haven, Sketchfab (filter CC0/CC-BY),
Kenney, Quaternius, ambientCG (tekstur).
2. Kalau harus membuat sendiri, buat di Blender dengan referensi foto, bukan dari
kode primitif. Agen coding TIDAK boleh membuat furnitur lewat kode `BoxGeometry` /
`<a-box>` lalu menganggapnya selesai.
3. Kalau agen terpaksa memakai placeholder, tandai jelas dengan nama `PLACEHOLDER\_\*`
dan warna magenta polos agar tidak lolos jadi hasil akhir.

### 3.2 Bentuk dan proporsi

* Gunakan ukuran dunia nyata (meter). Kursi makan: tinggi dudukan sekitar 45 cm,
tinggi total sekitar 80-90 cm, lebar sekitar 40-45 cm. Meja makan: tinggi sekitar 75 cm.
Pintu: sekitar 200 cm. Kalau ukuran terlihat "main-main", itu tandanya salah.
* Beri **bevel/chamfer kecil** pada setiap tepi. Di dunia nyata tidak ada tepi yang
setajam piksel. Cahaya yang menangkap tepi inilah yang membuat objek terasa nyata.
* Hindari simetri sempurna. Kaki meja, bantal, dan lipatan kain harus punya variasi kecil.
* Benda lunak (sofa, bantal, kain) butuh lengkungan, lipatan, dan lekukan, bukan balok.

### 3.3 Material dan tekstur

* Pakai PBR: albedo, roughness, normal (dan metalness jika perlu).
* Permukaan nyata punya variasi: roughness tidak seragam, ada noda tipis, goresan,
serat kayu yang searah, pudar di area yang sering disentuh.
* Skala tekstur harus masuk akal. Serat kayu tidak boleh sebesar jari di atas meja.
* Jangan pakai satu material untuk seluruh objek. Kursi kayu dengan dudukan anyaman
punya minimal dua material.

### 3.4 Pencahayaan dan membumi

* Objek harus menempel ke lantai: pakai **ambient occlusion** atau contact shadow.
* Bake lighting untuk elemen statis (lightmap/AO baked) agar performa VR tetap lancar
dan tampilannya lebih natural dibanding lampu realtime yang banyak.
* Pakai satu sumber cahaya utama yang jelas arahnya, ditambah cahaya isian lemah.
Jangan menaruh banyak lampu titik acak.
* Cocokkan cahaya objek 3D dengan cahaya di foto/skybox 360 (arah, warna, kekerasan bayangan).
Ketidakcocokan ini adalah penyebab utama objek terlihat "tempelan".

### 3.5 Performa (headset perlu stabil)

* Jaga poligon objek kecil di kisaran ribuan, objek utama puluhan ribu paling banyak.
* Gabungkan tekstur (atlas), kompres (KTX2/basis), dan pakai instancing untuk objek berulang.
* Target frame rate headset (72/90 fps) lebih penting daripada detail yang tidak terlihat.

\---

## 4\. Konten 360 (panorama / skybox)

* Utamakan **foto panorama sungguhan** (kamera 360 atau stitching) dibanding gambar
hasil generator. Tampilan lokasi nyata adalah nilai jual utama proyek ini.
* Tinggi kamera sekitar 1,5-1,6 m (tinggi mata) agar skala terasa benar.
* Tutup bagian bawah (nadir) dengan benar: tripod diretas/ditutup, atau diberi
logo kecil/lantai yang menyatu. Jangan dibiarkan terlihat sambungan.
* Samakan eksposur dan white balance antar panorama dalam satu tur supaya perpindahan
tidak terasa melompat.
* Gunakan format equirectangular 2:1. Untuk web, 4096x2048 sudah cukup; 8192x4096
untuk headset jika perangkat kuat. Kompres dengan hati-hati agar tidak muncul banding.
* Objek 3D yang ditaruh di atas panorama harus punya perspektif dan cahaya yang cocok
dengan foto (lihat 3.4).

\---

## 5\. Antarmuka VR (tombol, menu, hotspot, info)

VR bukan layar datar. UI web biasa yang ditempel ke ruang 3D hampir selalu terasa asing.

### 5.1 Penempatan dan ukuran

* Panel di ruang dunia (world-space), bukan menempel di wajah (head-locked) kecuali
penunjuk kecil yang sangat singkat.
* Jarak nyaman panel: sekitar 1,5-2,5 m dari mata. Jangan terlalu dekat.
* Teks: ukuran sudut (bukan piksel) yang terbaca. Tinggi huruf kecil minimal sekitar
1 derajat sudut pandang; judul lebih besar. Uji di headset sungguhan.
* Target interaksi cukup besar: minimal sekitar 2-3 derajat, dengan jarak antar target
yang cukup. Ray/gaze tidak setepat mouse.
* Hindari menaruh UI di pinggir lapang pandang atau di atas/bawah ekstrem.

### 5.2 Bahasa visual UI

* UI harus terasa **bagian dari dunia** tempat itu: terbuat dari bahan yang mungkin
ada di lokasi (papan kayu, logam sikat, kain, kertas, kaca bertepi), bukan tombol
neon melayang.
* Tentukan **satu** gaya tombol dan pakai konsisten: bentuk, tebal garis, warna aktif,
warna nonaktif, warna fokus. Jangan campur tiga gaya.
* Variasikan hierarki: tombol utama beda jelas dari tombol sekunder lewat bobot visual,
bukan hanya warna. Tidak semua elemen punya radius dan bayangan yang sama.
* Kontras tinggi dan terbaca di atas panorama yang ramai. Beri latar solid/semi-solid
yang jelas di belakang teks, bukan teks mengambang di atas foto.

### 5.3 Ikon

* Tanpa emoji. Pakai satu set ikon garis atau isi yang konsisten (misalnya Phosphor atau
Lucide), ukuran dan tebal garis seragam, atau gambar ikon sendiri.
* Ikon dipakai bersama label teks untuk aksi penting. Jangan ikon samar tanpa arti.

### 5.4 Hotspot dan navigasi antar ruangan

* Bentuk hotspot harus **menjelaskan fungsinya**:

  * pindah ruangan: penanda di lantai/arah (jejak kaki, panah di lantai, bingkai pintu)
  * info objek: penanda kecil yang menempel pada objek itu, dengan garis tipis ke label
  * media: ikon yang menjelaskan jenis (foto, audio, video)
* Jangan pakai lingkaran berdenyut yang sama untuk semuanya.
* Beri respons saat diarahkan/dipilih: perubahan jelas (ukuran, kecerahan, label muncul),
singkat dan fungsional. Gerakan yang menjawab aksi pengguna itu boleh.
* Transisi antar panorama: fade pendek atau teleport cepat. Hindari efek zoom/ledakan
yang bisa membuat mual.

### 5.5 Kenyamanan

* Jangan menggerakkan kamera pengguna tanpa kendali mereka.
* Jangan ada animasi besar yang terus berjalan di pinggir pandangan.
* Sediakan cara keluar/kembali yang selalu mudah ditemukan.
* Hormati pengaturan "kurangi gerakan" bila platform menyediakannya.

\---

## 6\. Warna dan tipografi

### 6.1 Warna

* Turunkan palet dari **lokasi/subjek nyata**: ambil warna dari foto referensi
(kayu, kain, cat dinding, langit). Tulis 4-6 warna bernama lengkap dengan hex di
`tokens` proyek.
* Satu warna aksen saja, dipakai hemat untuk hal yang benar-benar penting.
* Hindari hitam murni dan putih murni untuk latar UI; pakai nada yang diambil dari
palet lokasi.
* Cek kontras teks terhadap latarnya (minimal rasio 4.5:1 untuk teks biasa).

### 6.2 Tipografi

* Maksimal dua keluarga font, dan kalau dua, harus jelas berbeda perannya.
* Jangan pakai font bawaan sistem atau font yang paling sering muncul di proyek AI
(Inter, Roboto, Poppins, Space Grotesk) tanpa alasan. Pilih sesuai karakter subjek
dan pastikan mendukung huruf yang dibutuhkan (termasuk aksara daerah bila ada).
* Di VR, pilih font yang tebalnya cukup dan huruf-hurufnya terbedakan jelas (misalnya
"I" dan "l"). Hindari font tipis dan hairline.
* Tetapkan skala tipe (misalnya judul, subjudul, isi, keterangan) dan patuhi.
* Panjang baris isi tidak lebih dari sekitar 45-60 karakter di panel VR.

\---

## 7\. Penulisan teks (copywriting)

* Tulis dari sudut pandang pengunjung, dengan kata sehari-hari.
* Bahasa utama: Bahasa Indonesia yang natural dan hangat, bukan terjemahan kaku
atau gaya brosur.
* Sebutkan hal yang sebenarnya: nama ruangan, fungsi, ukuran, bahan, tahun, cerita singkat.
Ganti kalimat promosi dengan fakta menarik yang spesifik.
* Tombol memakai kata kerja yang jelas dan konsisten di seluruh alur:
"Masuk ruang tamu", "Lihat detail kursi", "Kembali ke denah", "Putar audio".
Bukan "Klik di sini", "Submit", "Jelajahi sekarang".
* Huruf kapital: gaya kalimat (hanya awal kalimat dan nama diri).
* Pesan error menjelaskan apa yang terjadi dan apa yang harus dilakukan, tanpa minta
maaf berlebihan dan tanpa emoji.
* Kondisi kosong/memuat memberi petunjuk tindakan ("Arahkan ke penanda untuk melihat
info"), bukan kalimat lucu.
* Setiap teks punya satu tugas. Kalau teks tidak membantu pengguna, hapus.

\---

## 8\. Gerak dan suara

* Gerak hanya untuk: menarik perhatian pada hal penting, atau menjawab aksi pengguna.
* Satu momen pembuka yang dirancang (misalnya transisi masuk pertama), selebihnya tenang.
* Durasi singkat dan easing yang natural (hindari linear kaku dan pantulan berlebihan).
* Suara: ambien lokasi nyata (rekaman asli ruangan/luar) lebih baik dari musik latar
generik. Suara 3D/spasial untuk sumber di ruang. Beri tombol bisukan yang jelas.
Jangan ada suara klik yang berlebihan di setiap interaksi.

\---

## 9\. Alur kerja agen (wajib diikuti)

1. **Baca brief** (bagian 0). Jika kosong, tanya dulu.
2. **Tulis rencana desain singkat** sebelum kode:

   * Palet: 4-6 warna bernama + hex
   * Tipografi: font dan perannya
   * Gaya UI: bentuk tombol, hotspot, panel (satu kalimat tiap item)
   * Daftar objek 3D dan sumber asetnya (aset jadi / buat sendiri / placeholder)
3. **Tinjau rencana terhadap larangan di bagian 2.** Jika ada bagian yang akan
menghasilkan hasil generik, ubah dan jelaskan perubahannya.
4. **Bangun** mengikuti rencana. Jangan menambah elemen di luar rencana.
5. **Kritik hasil sendiri** (checklist di bawah). Ambil screenshot/preview jika bisa.
6. **Laporkan** hal yang masih placeholder atau butuh keputusan manusia.

\---

## 10\. Checklist sebelum menyerahkan hasil

Centang semua. Jika ada yang gagal, perbaiki dulu.

**Umum**

* \[ ] Tidak ada emoji di UI, kode, komentar, atau log.
* \[ ] Tidak ada kalimat promosi kosong; semua teks spesifik dan berguna.
* \[ ] Tidak ada gradien dekoratif, glow, atau glassmorphism massal.
* \[ ] Palet berasal dari subjek dan tercatat sebagai token.
* \[ ] Maksimal dua font, dengan alasan jelas.
* \[ ] Ada satu elemen yang menjadi ciri khas; sisanya tenang.

**Objek 3D**

* \[ ] Tidak ada objek utama yang cuma primitif tanpa detail.
* \[ ] Ukuran sesuai dunia nyata.
* \[ ] Tepi diberi bevel, material PBR dengan variasi permukaan.
* \[ ] Ada bayangan kontak/AO; objek menempel ke lantai.
* \[ ] Arah dan warna cahaya cocok dengan panorama.
* \[ ] Performa headset stabil.

**UI VR**

* \[ ] Panel di world-space dengan jarak dan ukuran sudut yang nyaman.
* \[ ] Target interaksi cukup besar; teks terbaca di atas panorama.
* \[ ] Satu gaya tombol konsisten; hierarki jelas.
* \[ ] Hotspot berbeda bentuk sesuai fungsi, bukan satu lingkaran berdenyut.
* \[ ] Tidak ada gerakan kamera paksa atau animasi besar yang mengganggu.
* \[ ] Ikon dari satu set konsisten, bukan emoji.

**Teks**

* \[ ] Kata kerja tombol jelas dan konsisten sepanjang alur.
* \[ ] Gaya huruf kalimat (bukan kapital semua).
* \[ ] Pesan error dan kondisi kosong memberi tindakan nyata.

\---

## 11\. Jika pemilik proyek memberi instruksi berbeda

Instruksi eksplisit dari pemilik proyek selalu menang atas dokumen ini, termasuk bila
ia meminta salah satu hal yang dilarang. Jika instruksi bertentangan dengan keamanan
atau kenyamanan pengguna VR (misalnya gerakan kamera paksa), sampaikan risikonya,
lalu ikuti keputusan pemilik.

