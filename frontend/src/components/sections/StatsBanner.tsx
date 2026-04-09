'use client';
import React, { useEffect, useRef } from 'react';

export const StatsBanner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bannerRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let W: number, H: number, raf: number;

    const resize = () => {
      const banner = bannerRef.current;
      if (!banner) return;
      W = canvas.width = banner.offsetWidth;
      H = canvas.height = banner.offsetHeight;
    };

    function Particle(this: any) {
      this.reset();
    }

    Particle.prototype.reset = function () {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.a = Math.random() * 0.45 + 0.05;
    };

    const initParticles = (n: number) => {
      particles = [];
      for (let i = 0; i < n; i++) particles.push(new (Particle as any)());
    };

    const drawConnections = () => {
      const maxDist = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.strokeStyle = `rgba(18,179,175,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      const grd = ctx.createRadialGradient(W * 0.8, H * 0.5, 0, W * 0.8, H * 0.5, W * 0.45);
      grd.addColorStop(0, 'rgba(18,179,175,0.06)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      drawConnections();

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(18,179,175,${p.a})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resize();
      initParticles(70);
    };

    window.addEventListener('resize', handleResize);
    resize();
    initParticles(70);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animateCounter = (el: HTMLSpanElement) => {
      const target = parseFloat(el.dataset.target || '0');
      const suffix = el.dataset.suffix || '';
      const fmt = el.dataset.format;
      const duration = 1800;
      let start: number | null = null;

      const format = (val: number) => {
        if (fmt === 'thousands') return val >= 1000 ? '1.000' : Math.round(val).toString();
        return Math.round(val).toString();
      };

      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutExpo(progress);
        el.textContent = format(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    let counted = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            itemsRef.current.forEach((el) => el?.classList.add('visible'));
            if (!counted) {
              counted = true;
              numRefs.current.forEach((el) => {
                if (el) animateCounter(el);
              });
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    if (bannerRef.current) observer.observe(bannerRef.current);

    return () => observer.disconnect();
  }, []);

  const stats = [
    { target: '100', suffix: '+', label: 'Consultores em todo o Brasil', format: '' },
    { target: '200', suffix: 'M', label: 'Em linhas de crédito para nossos clientes', format: '' },
    { target: '12', suffix: 'M+', label: 'Acessos estimados em nossa página', format: '' },
    { target: '1000', suffix: '', label: 'Empresas auxiliadas em nossa jornada', format: 'thousands' },
    { target: '98', suffix: '%', label: 'Clientes satisfeitos', format: '' },
    { target: '500', suffix: '+', label: 'Empresas cadastradas', format: '' },
  ];

  return (
    <section className="fh-stats-banner" id="fhStatsBanner" ref={bannerRef}>
      <canvas id="fhCanvas" ref={canvasRef}></canvas>
      <div className="fh-stats-inner">
        <div className="fh-stats-label-top">FINANHUB EM NÚMEROS</div>
        <div className="fh-stats-grid">
          {stats.map((stat, i) => (
            <React.Fragment key={i}>
              <div 
                className="fh-stat-item" 
                ref={(el) => { itemsRef.current[i] = el; }}
              >
                <span 
                  className="fh-num" 
                  data-target={stat.target} 
                  data-suffix={stat.suffix}
                  data-format={stat.format}
                  ref={(el) => { numRefs.current[i] = el; }}
                >
                  0
                </span>
                <span className="fh-desc">{stat.label}</span>
              </div>
              {i < stats.length - 1 && <div className="fh-divider"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
