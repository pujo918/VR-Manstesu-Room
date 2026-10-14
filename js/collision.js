// =================================================================
// SISTEM VALIDASI COLLISION (RUANG WAWANCARA + RUANG TUNGGU & RESEPSIONIS)
// =================================================================
function isPositionValid(x, z) {
    // --- A. HALANGAN PADAT DI RUANG WAWANCARA (面接室 - Z < 6.0) ---
    // 1. Meja Pewawancara (Panjang X: -2.3 s/d 2.3, Z: -4.1 s/d -2.9)
    if (x >= -2.3 && x <= 2.3 && z >= -4.1 && z <= -2.9) {
        return false;
    }
    // 1b. Tanaman hias sudut & tempat sampah meja
    if (x >= -3.55 && x <= -2.85 && z >= -5.45 && z <= -4.75) {
        return false;
    }
    if (x >= -2.85 && x <= -2.35 && z >= -3.85 && z <= -3.35) {
        return false;
    }
    // 2. Kursi Kandidat (Kecuali sedang duduk)
    if (!window.isSitting && x >= -0.4 && x <= 0.4 && z >= -1.85 && z <= -1.35) {
        return false;
    }
    // 3. Batas Tembok Ruangan Wawancara (Lebar 8m: X [-3.65, 3.65], Panjang 12m: Z [-5.65, 5.65])
    if (x >= -3.65 && x <= 3.65 && z >= -5.65 && z <= 5.65) {
        return true;
    }

    // --- B. PINTU PENGHUBUNG KEDUA RUANGAN (Z = 6.0) ---
    // Lubang Kusen Pintu (HANYA BISA DILEWATI JIKA PINTU TELAH DIBUKA)
    if (x >= -0.55 && x <= 0.55 && z > 5.65 && z < 6.35) {
        return window.isDoorOpen;
    }

    // --- C. HALANGAN PADAT DI RUANG TUNGGU & RESEPSIONIS (待合室・受付 - Z > 6.0) ---
    // 1. Meja Resepsionis L-Shape & Kursi (X: 1.6 s/d 4.4, Z: 9.0 s/d 11.8)
    if (x >= 1.6 && x <= 4.4 && z >= 9.0 && z <= 11.8) {
        return false;
    }
    // 2. Sofa Tamu Kulit 3-Seater (Fisik X: -3.84 s/d -2.96, Z: 8.8 s/d 11.2)
    // Abaikan jika pemain sedang duduk atau sedang dalam transisi berdiri
    if (!window.isSitting && !window.isTransitioningSeat && x >= -3.95 && x <= -2.95 && z >= 8.75 && z <= 11.25) {
        return false;
    }
    // 3. Meja Kopi Tamu (Fisik X: -2.22 s/d -1.48, Z: 9.32 s/d 10.68)
    if (x >= -2.25 && x <= -1.45 && z >= 9.30 && z <= 10.70) {
        return false;
    }
    // 4. Rak Buku Eksekutif di Samping Kiri Resepsionis (X: 4.45 s/d 4.95, Z: 7.25 s/d 8.75)
    if (x >= 4.45 && x <= 4.95 && z >= 7.25 && z <= 8.75) {
        return false;
    }
    // 5. Dispenser Air Galon Menghadap Ruangan & Tempat Sampah (X: -4.9 s/d -4.2, Z: 13.2 s/d 14.4)
    if (x >= -4.9 && x <= -4.2 && z >= 13.2 && z <= 14.4) {
        return false;
    }
    // 6. Cermin Grooming (Menempel di dinding kiri, pemain bebas berdiri di depannya)
    // 7. Tanaman Hias Sudut Ruang Tunggu (X: -4.7 s/d -3.7, Z: 6.6 s/d 7.8)
    if (x >= -4.7 && x <= -3.7 && z >= 6.6 && z <= 7.8) {
        return false;
    }

    // Batas Tembok Ruang Tunggu & Resepsionis (Lebar 10m: X [-4.65, 4.65], Panjang 10m: Z [6.35, 15.65])
    if (x >= -4.65 && x <= 4.65 && z >= 6.35 && z <= 15.65) {
        return true;
    }

    return false;
}
