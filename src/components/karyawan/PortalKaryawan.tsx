import { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function PortalKaryawan() {
  const [idKaryawan, setIdKaryawan] = useState('');
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('Staff');
  const [fotoSelfie, setFotoSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [kameraAktif, setKameraAktif] = useState(false);

  // 1. Nyalakan Kamera untuk Selfie
  const mulaiKamera = async () => {
    setKameraAktif(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Gagal mengakses kamera. Pastikan izin kamera di browser Anda sudah diaktifkan.');
      setKameraAktif(false);
    }
  };

  // 2. Ambil Foto (Snapshot) dari Kamera
  const ambilFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');
        setFotoSelfie(dataURL);

        // Matikan stream kamera setelah foto terambil
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setKameraAktif(false);
      }
    }
  };

  // 3. Absen Masuk
  const handleAbsenMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idKaryawan || !nama) {
      alert('ID Karyawan dan Nama wajib diisi!');
      return;
    }
    if (!fotoSelfie) {
      alert('Harap ambil foto selfie terlebih dahulu sebagai verifikasi kehadiran!');
      return;
    }

    const tanggalHariIni = new Date().toLocaleDateString('id-ID');
    const jamSekarang = new Date().toLocaleTimeString('id-ID');

    setLoading(true);
    const { error } = await supabase.from('absensi').insert([
      {
        id_karyawan: idKaryawan,
        nama: nama,
        jabatan: jabatan,
        tanggal: tanggalHariIni,
        jam_masuk: jamSekarang,
        foto: fotoSelfie,
        status: 'Hadir'
      }
    ]);
    setLoading(false);

    if (error) {
      alert('Gagal absen masuk: ' + error.message);
    } else {
      alert('Absen Masuk Berhasil Tercatat!');
      setFotoSelfie(null);
      setIdKaryawan('');
      setNama('');
    }
  };

  // 4. Absen Pulang
  const handleAbsenPulang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idKaryawan) {
      alert('Masukkan ID Karyawan untuk melakukan absen pulang!');
      return;
    }

    const tanggalHariIni = new Date().toLocaleDateString('id-ID');
    const jamSekarang = new Date().toLocaleTimeString('id-ID');

    setLoading(true);
    // Cari data absensi hari ini berdasarkan ID dan tanggal
    const { data: existing } = await supabase
      .from('absensi')
      .select('*')
      .eq('id_karyawan', idKaryawan)
      .eq('tanggal', tanggalHariIni)
      .single();

    if (!existing) {
      setLoading(false);
      alert('Anda belum melakukan absen masuk hari ini!');
      return;
    }

    const { error } = await supabase
      .from('absensi')
      .update({ jam_pulang: jamSekarang })
      .eq('id', existing.id);

    setLoading(false);

    if (error) {
      alert('Gagal absen pulang: ' + error.message);
    } else {
      alert('Absen Pulang Berhasil Tercatat. Hati-hati di jalan!');
      setIdKaryawan('');
      setNama('');
    }
  };

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '420px', margin: '40px auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>📸 Portal Absensi Selfie</h2>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          type="text" 
          placeholder="ID Karyawan (Contoh: EMP-001)..." 
          value={idKaryawan} 
          onChange={e => setIdKaryawan(e.target.value)} 
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
        />
        <input 
          type="text" 
          placeholder="Nama Lengkap..." 
          value={nama} 
          onChange={e => setNama(e.target.value)} 
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
        />

        {/* Pengganti Vermuk: Kamera Selfie */}
        <div style={{ margin: '10px 0', textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          {kameraAktif ? (
            <div>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px', background: '#000', maxHeight: '220px' }} />
              <button type="button" onClick={ambilFoto} style={{ background: '#0284c7', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', marginTop: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                📸 Ambil Foto Selfie
              </button>
            </div>
          ) : (
            <div>
              {fotoSelfie ? (
                <div>
                  <img src={fotoSelfie} alt="Preview Selfie" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669' }} />
                  <p style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold', margin: '6px 0' }}>Foto Selfie Siap Dikirim</p>
                  <button type="button" onClick={mulaiKamera} style={{ background: '#64748b', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    Ulangi Foto
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Verifikasi kehadiran wajib foto selfie:</p>
                  <button type="button" onClick={mulaiKamera} style={{ background: '#0f172a', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Buka Kamera untuk Selfie
                  </button>
                </div>
              )}
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button 
            type="button" 
            onClick={handleAbsenMasuk} 
            disabled={loading}
            style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Memproses...' : 'Absen Masuk'}
          </button>
          <button 
            type="button" 
            onClick={handleAbsenPulang} 
            disabled={loading}
            style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'Memproses...' : 'Absen Pulang'}
          </button>
        </div>
      </form>
    </div>
  );
}
