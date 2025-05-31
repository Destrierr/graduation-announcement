const API_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxgifCmEQftGFaWrsZcyp0RjRTE91zgCDlT7q-uT_BQrgoXZs_8Tkocp8DkzjZEBF9GobuC0cJeDp9/pub?output=csv';

  let siswaData = [];

  fetch(API_URL)
    .then(res => res.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true });
      siswaData = parsed.data;
      console.log("Data siswa berhasil dimuat:", siswaData);
    })
    .catch(err => alert("Gagal memuat data siswa."));

  function cariSiswa() {
    const nama = document.getElementById('nama').value.trim().toUpperCase();
    const nisn = document.getElementById('nisn').value.trim();

    const siswa = siswaData.find(s =>
      s.NAMA.toUpperCase() === nama && s.NISN === nisn
    );

    const result = document.getElementById('result');
    if (!siswa) {
      result.style.display = 'block';
      result.innerHTML = '<p style="color:red;">Data siswa tidak ditemukan.</p>';
      return;
    }

    const status = parseFloat(siswa.RATA) >= 75 ? "Lulus" : "Tidak Lulus";

    let nilaiHTML = `
      <h3>BIODATA SISWA</h3>
      <p><b>Nama      :</b> ${siswa.NAMA}</p>
      <p><b>NIS       :</b> ${siswa.NIS}</p>
      <p><b>NISN      :</b> ${siswa.NISN}</p>
      <p><b>Tempat Tanggal Lahir:</b> ${siswa.TEMPAT}, ${siswa.TANGGAL_LAHIR}</p>
      <h4>Rincian Nilai:</h4>
      <table>
        <tr><th>Mata Pelajaran</th><th>Nilai</th></tr>
        <tr><td>Bahasa Indonesia</td><td>${siswa.BINDO}</td></tr>
        <tr><td>Matematika</td><td>${siswa.MTK}</td></tr>
        <tr><td>IPA</td><td>${siswa.IPA}</td></tr>
        <tr><td>PKN</td><td>${siswa.PKN}</td></tr>
        <tr><td>PAI</td><td>${siswa.PAI}</td></tr>
        <tr><td>Bahasa Inggris</td><td>${siswa.BING}</td></tr>
        <tr><td>Seni Budaya</td><td>${siswa.SBK}</td></tr>
        <tr><td>PJOK</td><td>${siswa.PJOK}</td></tr>
        <tr><td><strong>Rata-rata</strong></td><td><strong>${siswa.RATA}</strong></td></tr>
      </table>
      <p>Siswa dengan nama <strong>${siswa.NAMA}</strong> dengan NISN <strong>${nisn}</strong> dinyatakan <span style="color:green"><strong>LULUS</strong></p>
      <h5>*) Surat keterangan kelulusan dapat diambil disekolah </h5>
      
    `;

    result.innerHTML = nilaiHTML;
    result.style.display = 'block';
  }

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