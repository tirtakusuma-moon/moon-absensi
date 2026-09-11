import { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import PortalKaryawan from './components/karyawan/PortalKaryawan';
import DashboardAdmin from './components/admin/DashboardAdmin';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'portal' | 'admin'>('landing');
  const [namaPerusahaan] = useState('Moonjustfine by Tirta');

  // Animasi Kelopak Sakura Berguguran (Gambar 2)
  useEffect(() => {
    const canvas = document.getElementById('sakuraCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const petals: { x: number; y: number; r: number; d: number; color: string; tilt: number; tiltAngle: number }[] = [];
    const numPetals = 45;

    for (let i = 0; i < numPetals; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 7 + 4,
        d: Math.random() * numPetals,
        color: Math.random() > 0.4 ? 'rgba(255, 183, 197, 0.85)' : 'rgba(255, 228, 235, 0.95)',
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: Math.random() * Math.PI
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.ellipse(p.x, p.y, p.r, p.r / 2, p.tilt, 0, Math.PI * 2);
        ctx.fill();
      });

      petals.forEach(p => {
        p.y += Math.cos(p.d) + 1.2 + p.r / 4;
        p.x += Math.sin(p.tiltAngle);
        p.tiltAngle += 0.05;
        p.tilt = Math.sin(p.tiltAngle) * 15;

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      width: '100%',
      backgroundImage: `linear-gradient(rgba(30, 10, 40, 0.4), rgba(15, 20, 35, 0.6)), url('/sakura-moon.jpg')`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: 'Arial, sans-serif', 
      color: '#f8fafc', 
      overflowX: 'hidden',
      margin: 0,
      padding: 0
    }}>
      
      {/* Canvas Efek Daun/Kelopak Sakura Berguguran (Gambar 2) */}
      <canvas id="sakuraCanvas" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />

      {/* Konten Utama Terapan di Setiap Halaman */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar 
          namaPerusahaan={namaPerusahaan} 
          onNavClick={(view: any) => setCurrentView(view)} 
        />

        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          {currentView === 'landing' && (
            <div style={{ background: 'rgba(20, 15, 30, 0.8)', backdropFilter: 'blur(12px)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255, 183, 197, 0.3)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <span style={{ background: '#db2777', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Platform HRIS Enterprise Berstandar Tinggi</span>
              <h1 style={{ fontSize: '28px', color: '#fff', margin: '20px 0 10px 0' }}>Sistem Manajemen {namaPerusahaan}</h1>
              <p style={{ color: '#fbcfe8', fontSize: '14px', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto 30px auto' }}>
                Solusi enterprise mutakhir dengan geofencing GPS, verifikasi foto selfie, perhitungan jam kerja real-time, manajemen gaji proaktif, hingga unduh laporan resmi.
              </p>
              <button onClick={() => setCurrentView('portal')} style={{ background: '#f472b6', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                Masuk Portal Eksekutif →
              </button>
            </div>
          )}

          {currentView === 'portal' && <PortalKaryawan />}
          {currentView === 'admin' && <DashboardAdmin />}
        </div>
      </div>
    </div>
  );
}
