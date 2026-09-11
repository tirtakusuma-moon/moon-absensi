import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

interface Karyawan {
  id: string;
  nama: string;
  jabatan: string;
  email?: string;
  pin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  bulan?: string;
  tahun_lahir?: string;
  nik_ktp?: string;
  nama_ibu_kandung?: string;
  no_telp?: string;
  alamat_rumah?: string;
  nama_rekening?: string;
  no_rekening?: string;
}

export default function DashboardAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);
  const [daftarAbsensi, setDaftarAbsensi] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchKaryawan();
      fetchAbsensi();
    }
  }, [isLoggedIn]);

  const fetchKaryawan = async () => {
    const { data } = await supabase.from('karyawan').select('*').order('nama');
    if (data) setDaftarKaryawan(data);
  };

  const fetchAbsensi = async () => {
    const { data } = await supabase.from('absensi').select('*').order('created_at', { ascending: false });
    if (data) setDaftarAbsensi(data);
  };

  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === 'admin' && adminPass === 'admin123') {
      setIsLoggedIn(true);
      return;
    }

    const { data: foundAdmin, error } = await supabase
      .from('karyawan')
      .select('*')
      .eq('email', adminUser)
      .eq('pin', adminPass)
      .single();

    if (foundAdmin && !error) {
      setIsLoggedIn(true);
    } else {
      alert('Login Admin gagal! Pastikan menggunakan Email Admin terdaftar dan PIN yang benar.');
    }
  };

  const handleHapusKaryawan = async (id: string, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus akun "${nama}" dari database secara permanen?`)) {
      const { error } = await supabase.from('karyawan').delete().eq('id', id);
      if (error) alert('Gagal menghapus: ' + error.message);
      else {
        alert(`Akun ${nama} berhasil dihapus.`);
        fetchKaryawan();
      }
    }
  };

  const handleExportExcel = () => {
    let csv = "Nama;Jabatan;NIK KTP;Nama Ibu Kandung;No Telepon;Alamat;Nama Rekening;No Rekening;Email;Tempat/Tgl Lahir\n";
    daftarKaryawan.forEach(k => {
      csv += `"${k.nama}";"${k.jabatan}";"${k.nik_ktp || '-'}";"${k.nama_ibu_kandung || '-'}";"${k.no_telp || '-'}";"${k.alamat_rumah || '-'}";"${k.nama_rekening || '-'}";"${k.no_rekening || '-'}";"${k.email || '-'}";"${k.tempat_lahir || '-'}, ${k.tanggal_lahir || ''} ${k.bulan || ''} ${k.tahun_lahir || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Database_Lengkap_Karyawan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAbsensiExcel = () => {
    if (daftarAbsensi.length === 0) {
      alert("Belum ada data absensi untuk diexport.");
      return;
    }
    let csv = "ID Karyawan;Nama;Tanggal;Jam Masuk;Jam Pulang;Status\n";
    daftarAbsensi.forEach((a: any) => {
      csv += `"${a.id_karyawan || '-'}";"${a.nama}";"${a.tanggal}";"${a.jam_masuk || '-'}";"${a.jam_pulang || '-'}";"${a.status || 'Hadir'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Laporan_Absensi_Moonlight.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoutAdmin = () => {
    setIsLoggedIn(false);
    setAdminUser('');
    setAdminPass('');
  };

  if (!isLoggedIn) {
    return (
      <div style={{ background: 'rgba(20, 15, 30, 0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255, 183, 197, 0.25)', padding: '30px', borderRadius: '16px', maxWidth: '380px', margin: '40px auto', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ color: '#fff', marginBottom: '16px' }}>🔐 Login Admin (Email & PIN)</h2>
        <form onSubmit={handleLoginAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="email" placeholder="Email Admin Terdaftar..." value={adminUser} onChange={e => setAdminUser(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(15,23,42,0.8)', color: '#fff' }} />
          <input type="password" placeholder="PIN / Password Admin..." value={adminPass} onChange={e => setAdminPass(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(15,23,42,0.8)', color: '#fff' }} />
          <button type="submit" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Masuk Dashboard Admin</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: 'rgba(20, 15, 30, 0.85)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255, 183, 197, 0.25)', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>📊 Database Pendaftaran Pegawai & Admin</h2>
        <button onClick={handleLogoutAdmin} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Keluar (Logout)</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={handleExportExcel} style={{ background: '#34d399', color: '#0f172a', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
          Export Database ke Excel (.csv)
        </button>
        <button onClick={handleExportAbsensiExcel} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
          📥 Export Laporan Absensi ke Excel (.csv)
        </button>
      </div>

      <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px', fontWeight: 'bold' }}>Daftar Seluruh Akun yang Mendaftar di Sistem</h3>
      <div style={{ overflowX: 'auto', maxHeight: '350px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', marginBottom: '24px', background: 'rgba(15,23,42,0.6)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#fff' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '2px solid rgba(255,255,255,0.2)', color: '#cbd5e1' }}>
              <th style={{ padding: '10px' }}>Nama</th>
              <th style={{ padding: '10px' }}>Jabatan</th>
              <th style={{ padding: '10px' }}>NIK / No. Telp</th>
              <th style={{ padding: '10px' }}>Ibu Kandung & Alamat</th>
              <th style={{ padding: '10px' }}>Rekening Bank</th>
              <th style={{ padding: '10px' }}>Email Gmail</th>
              <th style={{ padding: '10px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftarKaryawan.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Belum ada data pendaftar.</td></tr>
            ) : (
              daftarKaryawan.map(k => (
                <tr key={k.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#fff' }}>{k.nama}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{k.jabatan}</td>
                  <td style={{ padding: '10px', color: '#e2e8f0' }}>NIK: {k.nik_ktp || '-'}<br/>Telp: {k.no_telp || '-'}</td>
                  <td style={{ padding: '10px', color: '#e2e8f0' }}>Ibu: {k.nama_ibu_kandung || '-'}<br/>Alamat: {k.alamat_rumah || '-'}</td>
                  <td style={{ padding: '10px', color: '#e2e8f0' }}>{k.nama_rekening || '-'}<br/>{k.no_rekening || '-'}</td>
                  <td style={{ padding: '10px', color: '#38bdf8' }}>{k.email || '-'}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleHapusKaryawan(k.id, k.nama)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px', fontWeight: 'bold' }}>📸 Live Monitoring Absensi & Selfie Karyawan</h3>
      <div style={{ overflowX: 'auto', maxHeight: '350px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(15,23,42,0.6)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#fff' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '2px solid rgba(255,255,255,0.2)', color: '#cbd5e1' }}>
              <th style={{ padding: '10px' }}>Foto Selfie</th>
              <th style={{ padding: '10px' }}>ID Karyawan</th>
              <th style={{ padding: '10px' }}>Nama Pegawai</th>
              <th style={{ padding: '10px' }}>Tanggal</th>
              <th style={{ padding: '10px' }}>Jam Masuk</th>
              <th style={{ padding: '10px' }}>Jam Pulang</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {daftarAbsensi.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Belum ada data absensi hari ini.</td></tr>
            ) : (
              daftarAbsensi.map((absen: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '10px' }}>
                    {absen.foto ? (
                      <img src={absen.foto} alt="Selfie" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.3)' }} />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>Tanpa Foto</span>
                    )}
                  </td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{absen.id_karyawan || '-'}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#fff' }}>{absen.nama}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{absen.tanggal}</td>
                  <td style={{ padding: '10px', color: '#34d399', fontWeight: 'bold' }}>{absen.jam_masuk || '-'}</td>
                  <td style={{ padding: '10px', color: '#f87171', fontWeight: 'bold' }}>{absen.jam_pulang || 'Belum Pulang'}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                      {absen.status || 'Hadir'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
