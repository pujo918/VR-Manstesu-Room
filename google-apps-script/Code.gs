// =========================================================================
// GOOGLE APPS SCRIPT: INTEGRASI GOOGLE DRIVE (5TB) & SPREADSHEET TERPUSAT
// Proyek: Simulasi Wawancara Beasiswa S2 Jepang (VR Mensetsu Room)
// Penulis: Sensei & Developer Tim
// =========================================================================
// PETUNJUK DEPLOY:
// 1. Buka Google Spreadsheet baru di akun Google Sensei (5TB).
// 2. Beri nama Spreadsheet: "Master Nilai Simulasi Wawancara Beasiswa S2"
// 3. Klik menu "Extensions" (Ekstensi) > "Apps Script".
// 4. Salin seluruh isi file ini dan gantikan ke file Code.gs.
// 5. Klik "Deploy" (Terapkan) > "New deployment" (Penerapan baru).
// 6. Pilih type: "Web app" (Aplikasi Web).
// 7. Konfigurasi:
//    - Execute as: "Me" (Email Sensei)
//    - Who has access: "Anyone" (Siapa saja, bahkan anonim)
// 8. Salin URL Web App yang dihasilkan (contoh: https://script.google.com/macros/s/.../exec).
// 9. Masukkan URL tersebut ke aplikasi web VR atau simpan di browser!
// =========================================================================

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // 1. Akses Spreadsheet Aktif
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Nilai_Wawancara");

    var headers = [
      "Timestamp",
      "Session ID",
      "Nama Mahasiswa",
      "Perangkat",
      "Status Video",
      "Nilai Etika Otomatis (0-30)",
      "Rincian Etika",
      "Nilai Bahasa Otomatis (0-35)",
      "Nilai Struktur Otomatis (0-35)",
      "Total Skor (0-100)",
      "Link Folder Drive Mahasiswa",
      "Audio Intro (Perkenalan Diri / Jikoshoukai)",
      "Audio Q1 (Alasan Studi ke Jepang)",
      "Audio Q2 (Alasan Memilih Kampus)",
      "Audio Q3 (Sumber Informasi Kampus)",
      "Audio Q4 (Kelebihan Diri / Chousho)",
      "Audio Q5 (Kekurangan & Solusi / Tansho)",
      "Grade / Status Kelulusan",
      "Transkrip Intro (ja-JP)",
      "Transkrip Q1 (ja-JP)",
      "Transkrip Q2 (ja-JP)",
      "Transkrip Q3 (ja-JP)",
      "Transkrip Q4 (ja-JP)",
      "Transkrip Q5 (ja-JP)",
      "Rincian Evaluasi Bahasa",
      "Rincian Evaluasi Struktur"
    ];

    // Jika sheet belum ada, buat baru; jika sudah ada, pastikan header ter-update lengkap
    if (!sheet) {
      sheet = ss.insertSheet("Nilai_Wawancara");
      sheet.appendRow(headers);
    } else {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
    sheet.setFrozenRows(1);

    // 2. Akses Folder Penyimpanan Audio Resmi di Google Drive Sensei
    var targetFolderId = "1DJneZ0RNYYFVDi6YVTW7rLFn-evZa_J-";
    var rootFolder;
    try {
      rootFolder = DriveApp.getFolderById(targetFolderId);
    } catch (err) {
      // Fallback jika folder ID Sensei belum memiliki izin edit
      var rootFolderName = "Mensetsu_Recordings";
      var rootFolders = DriveApp.getFoldersByName(rootFolderName);
      rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(rootFolderName);
    }

    // Subfolder per Mahasiswa: [Nama]_[SessionID]
    var safeName = (data.studentName || "Kandidat").replace(/[^a-zA-Z0-9_-]/g, "_");
    var sessionFolder = rootFolder.createFolder(safeName + "_" + data.sessionId);
    sessionFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var folderUrl = sessionFolder.getUrl();

    // Helper untuk menyimpan base64 audio ke Google Drive (Mendukung format standar WAV agar langsung bisa diputar di Google Drive)
    function saveAudioFile(base64Data, baseFileName) {
      if (!base64Data || base64Data.indexOf("base64,") === -1) {
        return "-";
      }
      var isWav = base64Data.indexOf("audio/wav") !== -1;
      var mimeType = isWav ? "audio/wav" : "audio/webm";
      var ext = isWav ? ".wav" : ".webm";
      var cleanName = baseFileName.replace(/\.(wav|webm|mp3|ogg)$/i, "") + ext;

      var base64Part = base64Data.split("base64,")[1];
      var decoded = Utilities.base64Decode(base64Part);
      var blob = Utilities.newBlob(decoded, mimeType, cleanName);
      var file = sessionFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return file.getUrl();
    }

    // 3. Simpan Keenam File Audio Jawaban Wawancara (Format .wav Jernih)
    var audioUrlIntro = saveAudioFile(data.audioIntro, "00_Perkenalan_Diri_Jikoshoukai.wav");
    var audioUrl1     = saveAudioFile(data.audioQ1,    "01_Alasan_Studi_ke_Jepang.wav");
    var audioUrl2     = saveAudioFile(data.audioQ2,    "02_Alasan_Memilih_Kampus.wav");
    var audioUrl3     = saveAudioFile(data.audioQ3,    "03_Sumber_Informasi_Kampus.wav");
    var audioUrl4     = saveAudioFile(data.audioQ4,    "04_Kelebihan_Diri_Chousho.wav");
    var audioUrl5     = saveAudioFile(data.audioQ5,    "05_Kekurangan_dan_Solusi_Tansho.wav");

    // 4. Masukkan Baris Nilai Baru ke Google Spreadsheet
    var nextRow = sheet.getLastRow() + 1;
    // Formula otomatis Total Skor (Kolom F + Kolom H + Kolom I):
    var formulaTotal = "=F" + nextRow + "+H" + nextRow + "+I" + nextRow;

    // Nilai Kategori dari Sistem (Otomatis terisi, namun Sensei dapat mengganti secara manual):
    var mannerVal = Number(data.mannerScore !== undefined ? data.mannerScore : (data.totalMannerScore || 0));
    var languageVal = Number(data.languageScore !== undefined ? data.languageScore : 0);
    var contentVal = Number(data.contentScore !== undefined ? data.contentScore : 0);

    sheet.appendRow([
      data.timestamp || new Date(),
      data.sessionId || "-",
      data.studentName || "Kandidat",
      data.deviceMode || "PC",
      data.hasWatchedVideo || "Belum Ditonton",
      mannerVal,                                        // Kolom F: Nilai Etika (0-30)
      data.mannerDetails || "-",                        // Kolom G: Rincian Etika
      languageVal,                                      // Kolom H: Nilai Bahasa (0-35) - Auto terisi & Bisa diedit manual!
      contentVal,                                       // Kolom I: Nilai Struktur (0-35) - Auto terisi & Bisa diedit manual!
      formulaTotal,                                     // Kolom J: Total Skor (=F+H+I) otomatis update saat F, H, I diedit!
      folderUrl,                                        // Kolom K: Link Folder Drive
      audioUrlIntro,                                    // Kolom L: Audio Intro
      audioUrl1,                                        // Kolom M: Audio Q1
      audioUrl2,                                        // Kolom N: Audio Q2
      audioUrl3,                                        // Kolom O: Audio Q3
      audioUrl4,                                        // Kolom P: Audio Q4
      audioUrl5,                                        // Kolom Q: Audio Q5
      data.gradeTitle || "-",                           // Kolom R: Grade / Status
      data.transcriptIntro || "-",                      // Kolom S: Transkrip Intro
      data.transcriptQ1 || "-",                         // Kolom T: Transkrip Q1
      data.transcriptQ2 || "-",                         // Kolom U: Transkrip Q2
      data.transcriptQ3 || "-",                         // Kolom V: Transkrip Q3
      data.transcriptQ4 || "-",                         // Kolom W: Transkrip Q4
      data.transcriptQ5 || "-",                         // Kolom X: Transkrip Q5
      data.languageDetails || "-",                      // Kolom Y: Rincian Bahasa
      data.contentDetails || "-"                        // Kolom Z: Rincian Struktur
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Seluruh data wawancara dan 6 rekaman audio berhasil disimpan!",
      folder: folderUrl,
      audioIntro: audioUrlIntro,
      audio1: audioUrl1,
      audio2: audioUrl2,
      audio3: audioUrl3,
      audio4: audioUrl4,
      audio5: audioUrl5
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Endpoint Web App Google Apps Script Mensetsu VR Room Aktif."
  })).setMimeType(ContentService.MimeType.JSON);
}
