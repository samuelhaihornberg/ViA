const regions = {
  utc: { name: 'UTC', country: 'Monde', tz: 'UTC' },
  paris: { name: 'Paris', country: 'France', tz: 'Europe/Paris' },
  london: { name: 'Londres', country: 'Royaume-Uni', tz: 'Europe/London' },
  newyork: { name: 'New York', country: 'États-Unis', tz: 'America/New_York' },
  losangeles: { name: 'Los Angeles', country: 'États-Unis', tz: 'America/Los_Angeles' },
  mexico: { name: 'Mexico', country: 'Mexique', tz: 'America/Mexico_City' },
  saopaulo: { name: 'São Paulo', country: 'Brésil', tz: 'America/Sao_Paulo' },
  cairo: { name: 'Le Caire', country: 'Égypte', tz: 'Africa/Cairo' },
  johannesburg: { name: 'Johannesburg', country: 'Afrique du Sud', tz: 'Africa/Johannesburg' },
  dubai: { name: 'Dubai', country: 'Émirats', tz: 'Asia/Dubai' },
  mumbai: { name: 'Mumbai', country: 'Inde', tz: 'Asia/Kolkata' },
  singapore: { name: 'Singapore', country: 'Singapour', tz: 'Asia/Singapore' },
  tokyo: { name: 'Tokyo', country: 'Japon', tz: 'Asia/Tokyo' },
  seoul: { name: 'Séoul', country: 'Corée du Sud', tz: 'Asia/Seoul' },
  shanghai: { name: 'Shanghai', country: 'Chine', tz: 'Asia/Shanghai' },
  sydney: { name: 'Sydney', country: 'Australie', tz: 'Australia/Sydney' },
  auckland: { name: 'Auckland', country: 'Nouvelle-Zélande', tz: 'Pacific/Auckland' }
};

const key = document.body.dataset.clock || 'utc';
const region = regions[key] || regions.utc;
const canvas = document.querySelector('#clock');
const ctx = canvas.getContext('2d');

document.querySelector('#name').textContent = region.name;
document.querySelector('#country').textContent = region.country;
document.title = `ViA — ${region.name}`;

function parts(date) {
  const values = {};
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: region.tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });

  formatter.formatToParts(date).forEach((part) => {
    values[part.type] = part.value;
  });

  return {
    y: Number(values.year),
    mo: Number(values.month),
    d: Number(values.day),
    h: Number(values.hour),
    mi: Number(values.minute),
    s: Number(values.second),
    ms: Number(values.fractionalSecond || 0)
  };
}

function text(value, x, y, color, size) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), x, y);
}

function ring(x, y, radius, start, end, width, color, alpha = 1) {
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function draw(time) {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const width = bounds.width;
  const height = bounds.height;

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.36;

  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';

  const colors = {
    ms: '#ff79c6',
    seconds: '#ff5267',
    minutes: '#ffd34e',
    hours: '#55e7cf',
    days: '#70baff',
    months: '#a98cff',
    year: '#ffffff'
  };

  const secondProgress = (time.s + time.ms / 1000) / 60;
  const minuteProgress = (time.mi + secondProgress) / 60;
  const hourProgress = (time.h % 24 + minuteProgress) / 24;
  const phase = -Math.PI / 2 + secondProgress * Math.PI * 2;
  const plasmaRadius = radius * (0.2 + 0.72 * hourProgress);

  const bubbles = [
    { radius: radius * (0.18 + 0.18 * (time.ms / 1000)), color: colors.ms },
    { radius: radius * (0.34 + 0.16 * secondProgress), color: colors.seconds },
    { radius: radius * (0.52 + 0.15 * minuteProgress), color: colors.minutes },
    { radius: radius * (0.7 + 0.13 * hourProgress), color: colors.hours },
    { radius: radius * (0.86 + 0.1 * (time.d / 31)), color: colors.days }
  ];

  bubbles.forEach((bubble) => {
    ctx.beginPath();
    ctx.arc(centerX, centerY, bubble.radius, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = bubble.color;
    ctx.globalAlpha = 0.18;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Vague photoplasma milliseconde/seconde.
  ring(centerX, centerY, plasmaRadius, -Math.PI / 2, phase, 5, colors.ms, 0.9);
  ring(centerX, centerY, plasmaRadius + 8, -Math.PI / 2, phase, 2, colors.seconds, 0.55);

  // 60 anneaux fins de secondes.
  for (let number = 1; number <= 60; number += 1) {
    const current = number === time.s + 1;
    const angle = -Math.PI / 2 + number * Math.PI * 2 / 60;
    const ringRadius = radius * (0.22 + number * 0.008);

    ring(
      centerX,
      centerY,
      ringRadius,
      current ? -Math.PI / 2 : angle - 0.025,
      angle,
      current ? 2.5 : 1.1,
      colors.seconds,
      current ? 0.95 : 0.22
    );

    if (number % 5 === 0) {
      text(
        number,
        centerX + Math.cos(angle) * ringRadius,
        centerY + Math.sin(angle) * ringRadius,
        colors.seconds,
        9
      );
    }
  }

  // 60 anneaux plus épais de minutes.
  for (let number = 1; number <= 60; number += 1) {
    const current = number === time.mi + 1;
    const angle = -Math.PI / 2 + number * Math.PI * 2 / 60;
    const ringRadius = radius * (0.62 + number * 0.004);

    ring(
      centerX,
      centerY,
      ringRadius,
      current ? -Math.PI / 2 : angle - 0.035,
      angle,
      current ? 4 : 2.2,
      colors.minutes,
      current ? 0.95 : 0.3
    );

    if (number % 5 === 0) {
      text(
        number,
        centerX + Math.cos(angle) * ringRadius,
        centerY + Math.sin(angle) * ringRadius,
        colors.minutes,
        9
      );
    }
  }

  // 24 anneaux verts d'heures.
  for (let number = 1; number <= 24; number += 1) {
    const angle = -Math.PI / 2 + number * Math.PI * 2 / 24;
    const ringRadius = radius * 1.02;
    const alpha = 0.25 + (number <= time.h ? 0.35 : 0);

    ring(
      centerX,
      centerY,
      ringRadius,
      angle - 0.045,
      angle + 0.045,
      3,
      colors.hours,
      alpha
    );

    text(
      number,
      centerX + Math.cos(angle) * ringRadius,
      centerY + Math.sin(angle) * ringRadius,
      colors.hours,
      10
    );
  }

  // Progression du jour, du mois et de l'année.
  ring(
    centerX,
    centerY,
    radius * 1.13,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * (time.d / 31),
    3,
    colors.days,
    0.8
  );
  ring(
    centerX,
    centerY,
    radius * 1.22,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * (time.mo / 12),
    4,
    colors.months,
    0.75
  );
  ring(
    centerX,
    centerY,
    radius * 1.31,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * ((time.y % 100) / 100),
    5,
    colors.year,
    0.7
  );

  // Pointeur photoplasma en forme de vague.
  ctx.beginPath();
  for (let index = 0; index <= 100; index += 1) {
    const progress = index / 100;
    const angle = phase - progress * 2.8;
    const distance = plasmaRadius * progress * (0.35 + 0.65 * progress);
    const pointX = centerX + Math.cos(angle) * distance;
    const pointY = centerY + Math.sin(angle) * distance;

    if (index === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }

  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.strokeStyle = colors.seconds;
  ctx.shadowBlur = 24;
  ctx.shadowColor = colors.seconds;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = colors.ms;
  ctx.beginPath();
  ctx.arc(
    centerX + Math.cos(phase) * plasmaRadius,
    centerY + Math.sin(phase) * plasmaRadius,
    8,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.globalCompositeOperation = 'source-over';
}

function update() {
  const now = new Date();
  const time = parts(now);

  document.querySelector('#time').textContent = [
    String(time.h).padStart(2, '0'),
    String(time.mi).padStart(2, '0'),
    String(time.s).padStart(2, '0')
  ].join(':') + `.${String(time.ms).padStart(3, '0')}`;

  document.querySelector('#date').textContent = new Intl.DateTimeFormat(
    document.documentElement.lang || 'fr',
    { timeZone: region.tz, dateStyle: 'full' }
  ).format(now);

  draw(time);
}

document.querySelector('#back').onclick = () => {
  window.location.href = 'index.html';
};

document.querySelector('#coff').onclick = () => {
  window.location.href = 'coff.html';
};

update();
setInterval(update, 50);
window.addEventListener('resize', update);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
