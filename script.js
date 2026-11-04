'use strict';
const canvas=document.getElementById('bloom'),ctx=canvas.getContext('2d');
const pauseBtn=document.getElementById('pause'),statusText=document.getElementById('status');
let W=0,H=0,dpr=1,scale=1,elapsed=0,last=0,paused=false,yaw=.3,targetYaw=.3;
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
let seed=47;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
const petals=[],leaves=[],stem=[],dust=[],orbits=[];
// Each petal is sampled as a curved surface, then opened from a closed bud.
for(let layer=0;layer<2;layer++)for(let k=0;k<3;k++){
 const angle=k*TAU/3+layer*Math.PI/3+.23;
 for(let i=0;i<1900;i++){
  const u=random(),v=random()*2-1,L=layer?140:165;
  const width=Math.pow(Math.sin(Math.PI*u),.8)*(layer?29:36);
  const r=u*L,z=-v*width;
  petals.push({u,v,angle,r,z,layer,noise:random(),a:.25+random()*.65});
 }
}
for(let side of [-1,1])for(let level=0;level<2;level++)for(let i=0;i<1100;i++){
 const u=random(),v=random()*2-1;leaves.push({u,v,side,level,n:random()});
}
for(let i=0;i<3600;i++)stem.push({t:random(),a:random()*TAU,n:random()});
for(let i=0;i<150;i++)dust.push({x:random(),y:random(),a:random(),r:random(),speed:random()});
for(let j=0;j<4;j++)for(let i=0;i<650;i++)orbits.push({j,t:i/650*TAU,n:random()});
function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(W/550,H/770);}
window.addEventListener('resize',resize);resize();
function project(x,y,z){const c=Math.cos(yaw),s=Math.sin(yaw),xx=x*c+z*s,zz=z*c-x*s;const p=800/(800+zz);return {x:W/2+xx*scale*p,y:H*.76-y*scale*p,z:zz,p};}
function dot(x,y,z,color,alpha,size=1){const p=project(x,y,z);ctx.globalAlpha=clamp(alpha);ctx.fillStyle=color;ctx.fillRect(p.x,p.y,Math.max(.5,size*scale*p.p),Math.max(.5,size*scale*p.p));}
function render(now){requestAnimationFrame(render);if(!last)last=now;const dt=Math.min((now-last)/1000,.05);last=now;if(!paused&&!document.hidden)elapsed+=dt;yaw+=(targetYaw-yaw)*.025;
 const t=elapsed,grow=smooth(t/4),open=smooth((t-3)/7),sway=Math.sin(t*.65)*2;
 ctx.globalAlpha=1;const bg=ctx.createRadialGradient(W*.5,H*.62,0,W*.5,H*.62,Math.max(W,H)*.7);bg.addColorStop(0,'#18102b');bg.addColorStop(.5,'#0a0b19');bg.addColorStop(1,'#04060c');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 for(const p of dust){ctx.globalAlpha=(.13+.25*Math.sin(t*.7+p.a*10)**2);ctx.fillStyle=p.a>.5?'#d9a6da':'#a9b9e3';ctx.fillRect(p.x*W,(p.y*H-t*(2+p.speed*5)%H+H)%H,1+p.r,1+p.r)}
 const orbitAlpha=smooth((t-3)/6)*.18;
 for(const p of orbits){let a=p.t+t*.055*(p.j%2?1:-1),r=240;let x=Math.cos(a)*r,y=190+Math.sin(a)*r,z=Math.sin(a)*35;if(p.j===1){z=Math.sin(a)*r;x*=.55}if(p.j===2){x=Math.cos(a)*r*.65;z=Math.cos(a)*r*.7;y=190+Math.sin(a)*r}if(p.j===3){y=190+Math.sin(a)*90;z=Math.sin(a)*r}dot(x,y,z,'#b4a1ea',orbitAlpha*(.3+p.n),.65)}
 const glow=project(0,310,0);ctx.globalAlpha=.12*open;let halo=ctx.createRadialGradient(glow.x,glow.y,0,glow.x,glow.y,155*scale);halo.addColorStop(0,'#e16aaf');halo.addColorStop(1,'transparent');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
 for(const p of stem){const y=p.t*300*grow,x=Math.sin(p.t*2)*5+sway*p.t;dot(x+Math.cos(p.a)*3,y,Math.sin(p.a)*3,'#96edb0',(.28+p.n*.65)*smooth((grow-p.t)*15),.8)}
 for(const p of leaves){const reveal=smooth((t-1.3-p.level*.45)/2);const width=Math.sin(p.u*Math.PI)*18;const x=p.side*(p.u*(82-p.level*10))*reveal;const y=65+p.level*73+Math.sin(p.u*Math.PI*.85)*32+p.v*width*.5;dot(x+sway*.4,y*grow,p.v*width,'#a7e5bd',reveal*(.22+p.n*.6),.85)}
 const points=[];
 for(const p of petals){const o=open*(p.layer?.86:1);const r=p.r*(.1+.9*o);const height=310+(1-p.u)*3+Math.sin(p.u*Math.PI)*24*o+p.u*(110*(1-o)+23*o)-p.v*p.v*18*o;
 const x=Math.cos(p.angle)*r-Math.sin(p.angle)*p.z*(.15+.85*o)+sway;const z=Math.sin(p.angle)*r+Math.cos(p.angle)*p.z*(.15+.85*o);
 const tip=smooth((p.u-.65)/.35),edge=Math.abs(p.v);let color=tip>.1?`rgb(${Math.round(234+tip*20)},${Math.round(124+tip*111)},${Math.round(190+tip*36)})`:`rgb(${Math.round(175+edge*62)},${Math.round(57+edge*63)},${Math.round(155+edge*45)})`;
 points.push({x,y:height*grow,z,color,a:p.a*smooth((t-2.5)/1.5),size:p.noise>.985?1.9:.85});
 }
 points.sort((a,b)=>b.z-a.z);for(const p of points)dot(p.x,p.y,p.z,p.color,p.a,p.size);
 for(let k=0;k<6;k++){const a=k*TAU/6,r=20*open;const x=Math.cos(a)*r+sway,z=Math.sin(a)*r;for(let i=0;i<35;i++)dot(x*i/35,310*grow+i*1.4,z*i/35,'#d8b3a5',open*.5,.65);for(let i=0;i<26;i++)dot(x+Math.sin(i*3)*3,(360+Math.cos(i*2)*3)*grow,z+Math.cos(i)*3,'#ffc674',open*.8,1)}
 ctx.globalAlpha=1;
}
requestAnimationFrame(render);
pauseBtn.onclick=()=>{paused=!paused;pauseBtn.textContent=paused?'Play':'Pause';pauseBtn.setAttribute('aria-label',paused?'Play animation':'Pause animation')};
document.getElementById('replay').onclick=()=>{elapsed=0;paused=false;pauseBtn.textContent='Pause';pauseBtn.setAttribute('aria-label','Pause animation');statusText.textContent='Every beautiful thing takes time.'};
canvas.addEventListener('pointermove',e=>{targetYaw=.3+(e.clientX/W-.5)*.7});canvas.addEventListener('pointerleave',()=>{targetYaw=.3});
const fullscreenBtn=document.getElementById('fullscreen');if(!document.fullscreenEnabled)fullscreenBtn.hidden=true;fullscreenBtn.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{statusText.textContent='Fullscreen is unavailable in this browser.'}};
document.addEventListener('fullscreenchange',()=>fullscreenBtn.setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen'));
if(matchMedia('(prefers-reduced-motion: reduce)').matches){elapsed=11;paused=true;pauseBtn.textContent='Play';pauseBtn.setAttribute('aria-label','Play animation')}
