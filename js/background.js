(function () {
    const config = {
        particleCount: window.innerWidth < 768 ? 40 : 80,
        connectionDistance: 140,
        mouseDistance: 200,
        zIndex: -1,
        saturation: 75,   // 色彩饱和度 0-100，越大越艳丽
        lightness: 60     // 亮度 0-100
    };

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:${config.zIndex};pointer-events:none;`;
    document.body.appendChild(canvas);

    let particles = [];
    const mouse = { x: null, y: null };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.r = Math.random() * 2 + 1;
            this.hue = Math.random() * 360;          // 随机色相 0-360°
            this.hueSpeed = (Math.random() - 0.5) * 0.5; // 色相流转速度
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.hue = (this.hue + this.hueSpeed + 360) % 360; // 颜色缓慢流动
            if (mouse.x !== null) {
                const dx = this.x - mouse.x, dy = this.y - mouse.y;
                const d = Math.hypot(dx, dy);
                if (d < config.mouseDistance && d > 0.1) {
                    const force = (config.mouseDistance - d) / config.mouseDistance * 0.02;
                    this.x += dx / d * force * 60;
                    this.y += dy / d * force * 60;
                }
            }
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, ${config.saturation}%, ${config.lightness}%, 0.7)`;
            ctx.fill();
        }
    }

    for (let i = 0; i < config.particleCount; i++) particles.push(new Particle());

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    (function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d = Math.hypot(dx, dy);
                if (d < config.connectionDistance) {
                    // 连线颜色 = 两端粒子色相的平均值
                    let dh = Math.abs(particles[i].hue - particles[j].hue);
                    const hue = dh > 180
                        ? (particles[i].hue + particles[j].hue + 360) / 2 % 360
                        : (particles[i].hue + particles[j].hue) / 2;
                    ctx.strokeStyle = `hsla(${hue}, ${config.saturation}%, ${config.lightness}%, ${(1 - d / config.connectionDistance) * 0.35})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    })();
})();