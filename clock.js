const regions = {
  utc: ['UTC', 'Monde', 'UTC'], paris: ['Paris', 'France', 'Europe/Paris'], london: ['Londres', 'Royaume-Uni', 'Europe/London'],
  newyork: ['New York', 'États-Unis', 'America/New_York'], losangeles: ['Los Angeles', 'États-Unis', 'America/Los_Angeles'],
  mexico: ['Mexico', 'Mexique', 'America/Mexico_City'], saopaulo: ['São Paulo', 'Brésil', 'America/Sao_Paulo'],
  cairo: ['Le Caire', 'Égypte', 'Africa/Cairo'], johannesburg: ['Johannesburg', 'Afrique du Sud', 'Africa/Johannesburg'],
  dubai: ['Dubai', 'Émirats', 'Asia/Dubai'], mumbai: ['Mumbai', 'Inde', 'Asia/Kolkata'], singapore: ['Singapore', 'Singapour', 'Asia/Singapore'],
  tokyo: ['Tokyo', 'Japon', 'Asia/Tokyo'], seoul: ['Séoul', 'Corée du Sud', 'Asia/Seoul'], shanghai: ['Shanghai', 'Chine', 'Asia/Shanghai'],
  sydney: ['Sydney', 'Australie', 'Australia/Sydney'], auckland: ['Auckland', 'Nouvelle-Zélande', 'Pacific/Auckland']
};

const zoneKey = new URLSearchParams(location.search).get('zone') || 'utc';
const [name, country, timeZone] = regions[zoneKey] || regions.utc;
const canvas = document.querySelector('#clock');
const ctx = canvas.getContext('2d');
document.querySelector('#name').textContent = name;
document.querySelector('#country').textContent = country;
document.title = `ViA — ${name}`;

function getParts(date) {
  const values = {};
  new Intl.DateTimeFormat('en-US', { timeZone, hour12: false, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', fractionalSecondDigits:3 })
    .formatToParts(date).forEach(part => { values[part.type] = part.value; });
  return { year:+values.year, month:+values.month, day:+values.day, hour:+values.hour, minute:+values.minute, second:+values.second, ms:+(values.fractionalSecond || 0) };
}
function arc(x,y,r,start,end,width,color,alpha=1){ctx.beginPath();ctx.arc(x,y,r,start,end);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.stroke();ctx.globalAlpha=1;}
function label(value,x,y,color,size){ctx.fillStyle=color;ctx.font=`600 ${size}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,x,y);}
function draw(t){
  const box=canvas.getBoundingClientRect(),ratio=devicePixelRatio||1,w=box.width,h=box.height;canvas.width=w*ratio;canvas.height=h*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='lighter';
  const x=w/2,y=h/2,r=Math.min(w,h)*.35, colors={ms:'#ff79c6',s:'#ff5267',m:'#ffd34e',h:'#55e7cf',d:'#70baff',mo:'#a98cff',year:'#fff'};
  const sec=(t.second+t.ms/1000)/60, min=(t.minute+sec)/60, hour=(t.hour%24+min)/24, phase=-Math.PI/2+sec*Math.PI*2, plasma=r*(.18+.75*hour);
  [{q:t.ms/1000,r:r*.18,color:colors.ms},{q:sec,r:r*.38,color:colors.s},{q:min,r:r*.60,color:colors.m},{q:hour,r:r*.80,color:colors.h}].forEach(v=>arc(x,y,v.r,-Math.PI/2,-Math.PI/2+v.q*Math.PI*2,2,v.color,.35));
  arc(x,y,plasma,-Math.PI/2,phase,6,colors.ms,.95);arc(x,y,plasma+9,-Math.PI/2,phase,2,colors.s,.7);
  for(let n=1;n<=60;n++){const a=-Math.PI/2+n*Math.PI*2/60,active=n===t.second+1,r1=r*(.20+n*.006),r2=r*(.62+n*.0035);arc(x,y,r1,active?-Math.PI/2:a-.025,a,active?3:1.1,colors.s,active?.95:.22);arc(x,y,r2, n===t.minute+1?-Math.PI/2:a-.035,a,n===t.minute+1?4:2.2,colors.m,n===t.minute+1?.95:.3);if(n%5===0){label(n,x+Math.cos(a)*r1,y+Math.sin(a)*r1,colors.s,8);label(n,x+Math.cos(a)*r2,y+Math.sin(a)*r2,colors.m,8)}}
  for(let n=1;n<=24;n++){const a=-Math.PI/2+n*Math.PI*2/24,rr=r*1.03;arc(x,y,rr,a-.05,a+.05,3,colors.h,.25+(n<=t.hour?.35:0));label(n,x+Math.cos(a)*rr,y+Math.sin(a)*rr,colors.h,9)}
  arc(x,y,r*1.13,-Math.PI/2,-Math.PI/2+Math.PI*2*t.day/31,3,colors.d,.8);arc(x,y,r*1.22,-Math.PI/2,-Math.PI/2+Math.PI*2*t.month/12,4,colors.mo,.75);arc(x,y,r*1.31,-Math.PI/2,-Math.PI/2+Math.PI*2*(t.year%100)/100,5,colors.year,.7);
  ctx.beginPath();for(let i=0;i<=100;i++){const q=i/100,a=phase-q*2.8,rr=plasma*q*(.35+.65*q),px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.lineWidth=7;ctx.lineCap='round';ctx.strokeStyle=colors.s;ctx.shadowBlur=24;ctx.shadowColor=colors.s;ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=colors.ms;ctx.beginPath();ctx.arc(x+Math.cos(phase)*plasma,y+Math.sin(phase)*plasma,8,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';
}
function update(){const now=new Date(),t=getParts(now);document.querySelector('#time').textContent=`${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')}:${String(t.second).padStart(2,'0')}.${String(t.ms).padStart(3,'0')}`;document.querySelector('#date').textContent=new Intl.DateTimeFormat(document.documentElement.lang||'fr',{timeZone,dateStyle:'full'}).format(now);draw(t)}
document.querySelector('#back').onclick=()=>location.href='index.html';document.querySelector('#coff').onclick=()=>location.href='coff.html';update();setInterval(update,50);addEventListener('resize',update);if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
