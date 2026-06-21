const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('celebrateBtn');
const song = document.getElementById('bdaySong');
const songHint = document.getElementById('songHint');
const songHintText = document.getElementById('songHintText');
const btnLabel = btn.querySelector('.btn-label');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const palette = ['#F3D9D6', '#E8B9C2', '#A8B89A', '#CBA26B', '#FBF6F0'];
let particles = [];
let animating = false;

function makeParticle() {
  const isBalloon = Math.random() < 0.18;
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + 20 + Math.random() * 200,
    size: isBalloon ? 14 + Math.random() * 10 : 6 + Math.random() * 6,
    color: palette[Math.floor(Math.random() * palette.length)],
    speedY: isBalloon ? 1.4 + Math.random() * 1.2 : 2.5 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 1.6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 6,
    isBalloon,
    sway: Math.random() * Math.PI * 2,
    opacity: 1,
    life: 0
  };
}

function drawConfetti(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
  ctx.restore();
}

function drawBalloon(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = p.opacity;

  ctx.strokeStyle = p.color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, p.size * 1.1);
  ctx.lineTo(2, p.size * 1.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.78, p.size, 0, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-p.size * 0.25, p.size * 0.95);
  ctx.lineTo(0, p.size * 1.15);
  ctx.lineTo(p.size * 0.25, p.size * 0.95);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

let continuousMode = false;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (continuousMode && particles.length < 90 && Math.random() < 0.3) {
    particles.push(makeParticle());
  }

  particles.forEach((p) => {
    p.life += 1;
    p.y -= p.speedY;
    p.sway += 0.02;
    p.x += p.isBalloon ? Math.sin(p.sway) * 0.8 : p.speedX;
    p.rotation += p.rotationSpeed;

    if (p.y < canvas.height * 0.15) {
      p.opacity = Math.max(0, p.opacity - 0.02);
    }

    if (p.isBalloon) {
      drawBalloon(p);
    } else {
      drawConfetti(p);
    }
  });

  particles = particles.filter((p) => p.opacity > 0 && p.y > -100);

  if (continuousMode || particles.length > 0) {
    requestAnimationFrame(animate);
  } else {
    animating = false;
  }
}

function celebrate() {
  const count = 70;
  for (let i = 0; i < count; i++) {
    particles.push(makeParticle());
  }
  if (!animating) {
    animating = true;
    requestAnimationFrame(animate);
  }
}

song.loop = true;

function setPlayingUI(isPlaying) {
  btn.classList.toggle('is-playing', isPlaying);
  btn.setAttribute('aria-pressed', String(isPlaying));
  btnLabel.textContent = isPlaying ? 'playing for you' : 'make it rain';
  songHint.classList.toggle('is-live', isPlaying);
  songHintText.textContent = isPlaying ? 'playing on repeat for you' : 'tap to play your song';
}

btn.addEventListener('click', () => {
  continuousMode = true;
  celebrate();

  if (song.paused) {
    song.play().catch(() => {
      songHintText.textContent = 'tap again to start the song';
    });
  }
});

song.addEventListener('play', () => setPlayingUI(true));
song.addEventListener('pause', () => setPlayingUI(false));

// Greet her with a gentle confetti burst on load (audio autoplay is blocked by
// browsers until she interacts, so the song waits for her first tap)
window.addEventListener('load', () => {
  setTimeout(celebrate, 600);
});
