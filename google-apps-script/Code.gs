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

    // Jika sheet belum ada, buat dan buatkan header resmi
    if (!sheet) {
      sheet = ss.insertSheet("Nilai_Wawancara");
      var headers = [
        "Timestamp",
        "Session ID",
        "Nama Mahasiswa",
        "Perangkat",
        "Status Video",
        "Nilai Etika Otomatis (0-30)",
        "Rincian Etika",
        "Nilai Bahasa & Kelancaran (0-35)",
        "Nilai Struktur Quartet II (0-35)",
        "Total Skor (0-100)",
        "Link Audio Jawaban 1 (Alasan Riset)",
        "Link Audio Jawaban 2 (Kelebihan & JLPT)"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

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

    // 3. Simpan File Audio Jawaban 1
    var audioUrl1 = "-";
    if (data.audioQ1 && data.audioQ1.indexOf("base64,") !== -1) {
      var base64Part1 = data.audioQ1.split("base64,")[1];
      var decoded1 = Utilities.base64Decode(base64Part1);
      var blob1 = Utilities.newBlob(decoded1, "audio/webm", "Jawaban_1_Alasan_Riset.webm");
      var file1 = sessionFolder.createFile(blob1);
      file1.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      audioUrl1 = file1.getUrl();
    }

    // 4. Simpan File Audio Jawaban 2
    var audioUrl2 = "-";
    if (data.audioQ2 && data.audioQ2.indexOf("base64,") !== -1) {
      var base64Part2 = data.audioQ2.split("base64,")[1];
      var decoded2 = Utilities.base64Decode(base64Part2);
      var blob2 = Utilities.newBlob(decoded2, "audio/webm", "Jawaban_2_Kelebihan_JLPT.webm");
      var file2 = sessionFolder.createFile(blob2);
      file2.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      audioUrl2 = file2.getUrl();
    }

    // 5. Masukkan Baris Nilai Baru ke Google Spreadsheet
    var nextRow = sheet.getLastRow() + 1;
    var formulaTotal = "=F" + nextRow + "+H" + nextRow + "+I" + nextRow;

    sheet.appendRow([
      data.timestamp || new Date(),
      data.sessionId || "-",
      data.studentName || "Kandidat",
      data.deviceMode || "PC",
      data.hasWatchedVideo || "Belum Ditonton",
      data.totalMannerScore || 0,
      data.mannerDetails || "-",
      "", // Kolom kosong untuk nilai Bahasa oleh Sensei (0-35)
      "", // Kolom kosong untuk nilai Struktur Quartet II oleh Sensei (0-35)
      formulaTotal, // Total skor otomatis saat Sensei mengisi kolom H dan I
      audioUrl1,
      audioUrl2
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data wawancara dan rekaman audio berhasil disimpan!",
      audio1: audioUrl1,
      audio2: audioUrl2
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
