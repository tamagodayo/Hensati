document.addEventListener('DOMContentLoaded', () => {
    const inputs = {
        score: document.getElementById('score'),
        mean: document.getElementById('mean'),
        stdDev: document.getElementById('stdDev'),
        deviation: document.getElementById('deviation')
    };
    const resetBtn = document.getElementById('resetBtn');
    let lastCalculatedTargetId = null;

    Object.values(inputs).forEach(input => {
        input.addEventListener('input', calculate);
    });

    resetBtn.addEventListener('click', resetFields);

    function calculate() {
        const val = {
            score: parseFloat(inputs.score.value),
            mean: parseFloat(inputs.mean.value),
            stdDev: parseFloat(inputs.stdDev.value),
            deviation: parseFloat(inputs.deviation.value)
        };

        let filledIds = [];
        for (let key in val) {
            if (!isNaN(val[key])) filledIds.push(key);
        }

        for (let key in inputs) {
            if (key !== lastCalculatedTargetId) {
                 inputs[key].classList.remove('calculated-result');
            }
        }

        if (filledIds.length < 3) {
            clearCalculatedField();
            return;
        }
        
        if (filledIds.length === 4 && !lastCalculatedTargetId) return;

        let targetId = lastCalculatedTargetId;
        if (!targetId && filledIds.length === 3) {
             if (isNaN(val.score)) targetId = 'score';
             else if (isNaN(val.mean)) targetId = 'mean';
             else if (isNaN(val.stdDev)) targetId = 'stdDev';
             else if (isNaN(val.deviation)) targetId = 'deviation';
        }

        if (!targetId) return;

        let result = 0;
        try {
            if (targetId === 'deviation') {
                if (val.stdDev === 0) throw new Error();
                result = ((val.score - val.mean) / val.stdDev) * 10 + 50;
            } else if (targetId === 'score') {
                result = ((val.deviation - 50) * val.stdDev) / 10 + val.mean;
            } else if (targetId === 'mean') {
                result = val.score - ((val.deviation - 50) * val.stdDev) / 10;
            } else if (targetId === 'stdDev') {
                if (val.deviation === 50) throw new Error();
                result = Math.abs(((val.score - val.mean) * 10) / (val.deviation - 50));
            }

            if (!isFinite(result) || isNaN(result)) throw new Error();

            const finalValue = Math.round(result * 100) / 100;
            const targetInput = inputs[targetId];

            if (parseFloat(targetInput.value) !== finalValue) {
                 animateValue(targetInput, parseFloat(targetInput.value) || 0, finalValue, 600);
            }
            
            targetInput.classList.add('calculated-result');
            lastCalculatedTargetId = targetId;

        } catch (e) {
            clearCalculatedField();
        }
    }

    function clearCalculatedField() {
        if (lastCalculatedTargetId) {
            inputs[lastCalculatedTargetId].value = "";
            inputs[lastCalculatedTargetId].classList.remove('calculated-result');
            lastCalculatedTargetId = null;
        }
    }

    function resetFields() {
        for (let key in inputs) {
            inputs[key].value = "";
            inputs[key].classList.remove('calculated-result');
        }
        lastCalculatedTargetId = null;
    }

    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = start + (end - start) * easing;
            
            element.value = (Math.round(currentVal * 100) / 100).toFixed(2);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                 element.value = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.fadeDir = Math.random() > 0.5 ? 0.005 : -0.005;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.opacity += this.fadeDir;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            if (this.opacity > 0.8 || this.opacity < 0.1) {
                this.fadeDir = -this.fadeDir;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 242, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
});
