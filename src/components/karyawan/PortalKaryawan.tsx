import { useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';

export default function PortalKaryawan() {
  const [nama, setNama] = useState('');
  const [idKaryawan, setIdKaryawan] = useState('');
  const [fotoSelfie, setFotoSelfie] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [kameraAktif, setKameraAktif] = useState(false);

  // 1. Nyalakan Kamera
  const mulaiKamera = async () => {
    setKameraAktif(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Gagal mengakses kamera. Pastikan izin kamera di browser sudah diaktifkan.');
      setKameraAktif(false);
    }
  };

  // 2. Ambil Foto (Snapshot) dari Video
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
        
        // Matikan stream kamera setelah foto diambil
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setKameraAktif(false);
      }
    }
  };

  // 3. Kirim Absen Masuk ke Supabase
  const handleAbsenMasuk = async () => {
    if (!nama || !idKaryawan) {
      alert('Nama dan ID Karyawan wajib diisi!');
      return;
    }
    if (!fotoSelfie) {
      alert('Harap ambil foto selfie terlebih dahulu!');
      return;
    }

    const tanggalHariIni = new Date().toLocaleDateString('id-ID');
    const jamSekarang = new Date().toLocaleTimeString('id-ID');

    const { error } = await supabase.from('absensi').insert([
      {
        id_karyawan: idKaryawan,
        nama: nama,
        tanggal: tanggalHariIni,
        jam_masuk: jamSekarang,
        foto: fotoSelfie,
        status: 'Hadir'
      }
    ]);

    if (error) {
      alert('Gagal absen masuk: ' + error.message);
    } else {
      alert('Absen Masuk Berhasil Tercatat!');
      setFotoSelfie(null);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '30px auto', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2>Portal Absensi Karyawan</h2>
      <input type="text" placeholder="Nama Lengkap..." value={nama} onChange={e => setNama(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
      <input type="text" placeholder="ID Karyawan (Contoh: EMP-001)..." value={idKaryawan} onChange={e => setIdKaryawan(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

      {/* Area Kamera */}
      <div style={{ margin: '15px 0', textAlign: 'center' }}>
        {kameraAktif ? (
          <div>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px', background: '#000' }} />
            <button onClick={ambilFoto} style={{ background: '#0284c7', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', marginTop: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📸 Ambil Foto Selfie</button>
          </div>
        ) : (
          <div>
            {fotoSelfie ? (
              <div>
                <img src={fotoSelfie} alt="Preview Selfie" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                <p style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold' }}>Foto Selfie Berhasil Diambil</p>
                <button onClick={mulaiKamera} style={{ background: '#475569', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Ulangi Foto</button>
              </div>
            ) : (
              <button onClick={mulaiKamera} style={{ background: '#0f172a', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Buka Kamera untuk Selfie</button>
            )}
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <button onClick={handleAbsenMasuk} style={{ width: '100%', background: '#059669', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Kirim Absen Masuk</button>
    </div>
  );
}
