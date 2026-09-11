import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PortalKaryawan from './components/karyawan/PortalKaryawan';
import DashboardAdmin from './components/admin/DashboardAdmin';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'portal' | 'admin'>('landing');
  const [namaPerusahaan] = useState('Moonjustfine by Tirta');

  // Efek Animasi Bunga Sakura Berguguran
  useEffect(() => {
    const canvas = document.getElementById('sakuraCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const petals: { x: number; y: number; r: number; d: number; color: string; tilt: number; tiltAngle: number }[] = [];
    const numPetals = 35;

    for (let i = 0; i < numPetals; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * numPetals,
        color: Math.random() > 0.5 ? 'rgba(255, 183, 197, 0.7)' : 'rgba(255, 228, 235, 0.8)',
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
        p.y += Math.cos(p.d) + 1 + p.r / 4;
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
    <div style={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', fontFamily: 'Arial, sans-serif', color: '#f8fafc', overflowX: 'hidden' }}>
      
      {/* Canvas Latar Belakang Bunga Sakura Berguguran */}
      <canvas id="sakuraCanvas" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />

      {/* Konten Utama di atas Background */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar 
          namaPerusahaan={namaPerusahaan} 
          onNavClick={(view: any) => setCurrentView(view)} 
        />

        <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
          {currentView === 'landing' && (
            <div style={{ background: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(8px)', padding: '40px', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
              <span style={{ background: '#0284c7', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Platform HRIS Enterprise Berstandar Tinggi</span>
              <h1 style={{ fontSize: '28px', color: '#fff', margin: '20px 0 10px 0' }}>Sistem Manajemen {namaPerusahaan}</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto 30px auto' }}>
                Solusi enterprise mutakhir dengan geofencing GPS, verifikasi foto selfie, perhitungan jam kerja real-time, manajemen gaji proaktif, hingga unduh laporan resmi.
              </p>
              <button onClick={() => setCurrentView('portal')} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
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
