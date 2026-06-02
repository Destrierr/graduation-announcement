<script src="https://cdnjs.cloudflare.com/ajax/libs/supabase/2.39.2/supabase.js"></script>

// ISI DENGAN DATA DARI SETTINGS > API SUPABASE KAMU
const SUPABASE_URL = 'https://ntxyytdxpiqgirqywbcj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eHl5dGR4cGlxZ2lycXl3YmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTA5MTIsImV4cCI6MjA5NTkyNjkxMn0.IoK21qwVRZ2nAdxoYBDo3rM4nLlCtQmkKBLqilM_YUk';

// Inisialisasi koneksi Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function cariSiswa() {
  const namaInput = document.getElementById('nama').value.trim().toUpperCase();
  const nisInput = document.getElementById('nis').value.trim();
  const result = document.getElementById('result');

  if (!namaInput || !nisInput) {
    alert("Mohon isi Nama dan NIS/NIM terlebih dahulu!");
    return;
  }

  result.style.display = 'block';
  result.innerHTML = '<p>Sedang mencari data...</p>';

  try {
    // Mencari data langsung ke tabel 'siswa' di Supabase
    // Menggunakan .ilike agar pencarian nama bersifat 'case-insensitive' (tidak sensitif huruf besar/kecil)
    const { data: siswa, error } = await supabase
      .from('siswa')
      .select('*')
      .eq('nis', nisInput)
      .ilike('nama', namaInput)
      .single(); // Kita hanya mengambil 1 data yang cocok

    if (error || !siswa) {
      result.innerHTML = '<p style="color:red; font-weight:bold;">Data siswa tidak ditemukan. Periksa kembali Nama dan NIS Anda.</p>';
      return;
    }

    // Menentukan status lulus dinamis
    const nilaiRata = parseFloat(siswa.rata) || 0;
    const statusLulus = nilaiRata >= 75;
    const statusText = statusLulus ? "LULUS" : "TIDAK LULUS";
    const statusColor = statusLulus ? "green" : "red";

    // Enkripsi data untuk tombol cetak PDF
    const stringData = JSON.stringify(siswa);
    const encodedData = btoa(unescape(encodeURIComponent(stringData)));

    let nilaiHTML = `
      <h3>KETERANGAN HASIL KELULUSAN</h3>
      <p><b>Nama :</b> ${siswa.nama}</p>
      <p><b>NIS/NIM :</b> ${siswa.nis}</p>
      <p><b>NISN :</b> ${siswa.nisn || '-'}</p>
      <p><b>Tempat Tanggal Lahir :</b> ${siswa.tempat || '-'}, ${siswa.tanggal_lahir || '-'}</p>
      
      <h4>Rincian Nilai:</h4>
      <table>
        <tr><th>Mata Pelajaran</th><th>Nilai</th></tr>
        <tr><td>Bahasa Indonesia</td><td>${siswa.bindo || 0}</td></tr>
        <tr><td>Matematika</td><td>${siswa.mtk || 0}</td></tr>
        <tr><td>IPA</td><td>${siswa.ipa || 0}</td></tr>
        <tr><td>PKN</td><td>${siswa.pkn || 0}</td></tr>
        <tr><td>PAI</td><td>${siswa.pai || 0}</td></tr>
        <tr><td>Bahasa Inggris</td><td>${siswa.bing || 0}</td></tr>
        <tr><td>Seni Budaya</td><td>${siswa.sbk || 0}</td></tr>
        <tr><td>PJOK</td><td>${siswa.pjok || 0}</td></tr>
        <tr><td>IPS</td><td>${siswa.ips || 0}</td></tr>
        <tr><td>Prakarya</td><td>${siswa.pky || 0}</td></tr>
        <tr><td>Bahasa Palembang</td><td>${siswa.bp || 0}</td></tr>
        <tr><td>Kemuhammadiyaan</td><td>${siswa.kmd || 0}</td></tr>
        <tr><td>Bahasa Arab</td><td>${siswa.barab || 0}</td></tr>
        <tr><td>Baca Tulis Al-Quran</td><td>${siswa.bta || 0}</td></tr>
        <tr><td><strong>Rata-rata</strong></td><td><strong>${siswa.rata || 0}</strong></td></tr>
      </table>
      
      <p>Siswa dengan nama <strong>${siswa.nama}</strong> dengan NIS/NIM <strong>${siswa.nis}</strong> dinyatakan <span style="color:${statusColor}"><strong>${statusText}</strong></span></p>
      <h5>*) Surat keterangan kelulusan resmi dapat diambil di sekolah.</h5>  
      
      <button onclick="cetakPDF('${encodedData}')" style="background-color: #2196F3; margin-top: 15px;">Cetak Bukti Lulus (PDF)</button>
    `;

    result.innerHTML = nilaiHTML;

  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat mengambil data.");
  }
}

// Fungsi cetakPDF() tetap sama dengan kode sebelumnya, 
// pastikan saja variabel propertinya menggunakan huruf kecil (siswa.nama, siswa.nis, siswa.bindo, dst.) 
// agar sesuai dengan kolom database PostgreSQL yang kita buat.

  function cetakPDF(encodedData) {
    const siswa = JSON.parse(atob(encodedData));
    const doc = new jsPDF();

    const logo = document.getElementById('logo').src;
    if (logo && logo.startsWith("data:image")) {
      doc.addImage(logo, 'PNG', 15, 10, 30, 30);
    }

    doc.setFontSize(16);
    doc.text("SMP MUHAMMADIYAH 6 PALEMBANG", 105, 20, null, null, "center");
    doc.setFontSize(14);
    doc.text("Bukti Pengumuman Kelulusan", 105, 30, null, null, "center");

    doc.setFontSize(12);
    let y = 50;
    doc.text(`Nama: ${siswa.NAMA}`, 20, y); y += 10;
    doc.text(`NISN: ${siswa.NISN}`, 20, y); y += 10;
    doc.text(`TTL: ${siswa.TEMPAT}, ${siswa.TANGGAL_LAHIR}`, 20, y); y += 15;

    doc.text("Rincian Nilai:", 20, y); y += 10;

    const mapel = [
      ["Bahasa Indonesia", siswa.INDO],
      ["Matematika", siswa.MTK],
      ["IPA", siswa.IPA],
      ["PKN", siswa.PKN],
      ["PAI", siswa.PAI],
      ["Bahasa Inggris", siswa.BING],
      ["Seni Budaya", siswa.SBK],
      ["PJOK", siswa.PJOK],
      ["IPS", siswa.IPS],
      ["Prakarya", siswa.PKY],
      ["Bahasa Palembang", siswa.BP],
      ["Kemuhammadiyaan", siswa.KMD],
      ["Bahasa Arab", siswa.BARAB],
      ["Baca TuliS Al-Quran", siswa.BTA],
      ["Rata-rata", siswa.RATA]
    ];

    mapel.forEach(([mp, nilai]) => {
      doc.text(`${mp}: ${String(nilai ?? '-')}`, 25, y);
      y += 8;
    });

    const status = parseFloat(siswa.RATA) >= 75 ? 'LULUS' : 'TIDAK LULUS';
    doc.text(`Status Kelulusan: ${status}`, 20, y); y += 20;

    doc.text("Kepala Sekolah,", 140, y); y += 30;
    doc.text("Drs. H. Rachman Rasyid, M.Pd", 140, y); y += 10;
    doc.text("NIP. 196309011988031001", 140, y);

    doc.save(`Bukti_Kelulusan_${siswa.NAMA.replace(/\s/g, "_")}.pdf`);
  }
