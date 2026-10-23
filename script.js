/* ====== EASY SETTINGS: add your real links here (leave "" to hide) ====== */
const CONTACT = {
    facebook:  { label:"Nicolie Formentera", url:"https://www.facebook.com/search/top?q=Nicolie%20Formentera" },
    instagram: { label:"@nxxclei",           url:"https://www.instagram.com/nxxclei/" },
    tiktok:    { label:"WEB Lei CLS",        url:"https://www.tiktok.com/search?q=WEB%20Lei%20CLS" }
  };
  
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s,c=document)=>c.querySelector(s), $$ = (s,c=document)=>[...c.querySelectorAll(s)];
  
  /* ---------- Sound (off by default) ---------- */
  let soundOn=false, actx=null;
  function beep(f=660,d=.09,type='square'){
    if(!soundOn) return;
    try{
      actx = actx || new (window.AudioContext||window.webkitAudioContext)();
      const o=actx.createOscillator(), g=actx.createGain();
      o.type=type;o.frequency.value=f;g.gain.value=.05;
      o.connect(g);g.connect(actx.destination);o.start();
      g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+d);o.stop(actx.currentTime+d);
    }catch(e){}
  }
  $('#soundBtn').addEventListener('click',e=>{
    soundOn=!soundOn; e.currentTarget.setAttribute('aria-pressed',soundOn);
    e.currentTarget.textContent=soundOn?'🔊':'🔇'; beep(880);
  });
  
  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg){
    const t=$('#toast'); t.textContent=msg; t.classList.add('show');
    clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2200);
  }
  
  /* ---------- Typewriter ---------- */
  const lines=["CODM Pro Player","Team Captain","Webmaster","Mobile Legends Enjoyer"];
  let typeRun=0;
  function startTyper(){
    const el=$('#typer'); const run=++typeRun;
    if(reduced){el.textContent=lines.slice(0,3).join(' • ');return;}
    let li=0,ci=0,del=false;
    (function tick(){
      if(run!==typeRun) return;
      const w=lines[li];
      el.textContent=w.slice(0,ci);
      if(!del&&ci<w.length){ci++;setTimeout(tick,60);}
      else if(!del){del=true;setTimeout(tick,1100);}
      else if(ci>0){ci--;setTimeout(tick,30);}
      else{del=false;li=(li+1)%lines.length;setTimeout(tick,250);}
    })();
  }
  startTyper();
  
  /* ---------- Scroll reveal, counters, bars ---------- */
  function countUp(el){
    const end=+el.dataset.count, suf=el.dataset.suffix||''; 
    if(reduced){el.textContent=end.toLocaleString()+suf;return;}
    const t0=performance.now(), dur=1400;
    (function f(t){
      const p=Math.min((t-t0)/dur,1);
      el.textContent=Math.round(end*(1-Math.pow(1-p,3))).toLocaleString()+suf;
      if(p<1) requestAnimationFrame(f);
    })(t0);
  }
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]',e.target).forEach(countUp);
      $$('.bar i',e.target).forEach(b=>b.style.width=b.dataset.w+'%');
      io.unobserve(e.target);
    });
  },{threshold:.15});
  $$('.reveal').forEach(el=>io.observe(el));
  
  /* ---------- Progress bar + active nav ---------- */
  const links=$$('nav a.lnk'), secs=links.map(a=>$(a.getAttribute('href')));
  function onScroll(){
    const h=document.documentElement;
    $('#progress').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
    let cur=0; secs.forEach((s,i)=>{ if(s.getBoundingClientRect().top<140) cur=i; });
    links.forEach((a,i)=>a.classList.toggle('active',i===cur));
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();
  
  /* ---------- Hobby cards ---------- */
  $$('.hob').forEach(b=>b.addEventListener('click',()=>{toast(b.dataset.fx);beep(520+Math.random()*400);}));
  $$('.hob').forEach(b=>b.addEventListener('mouseenter',()=>beep(700,.05,'sine')));
  
  /* ---------- Flip cards (tap on touch) ---------- */
  $$('.flip').forEach(f=>f.addEventListener('click',()=>f.classList.toggle('on')));
  
  /* ---------- Mini game ---------- */
  (function(){
    const arena=$('#arena'), target=$('#target'), ov=$('#overlay');
    let score=0,time=10,best=0,timer=null,playing=false;
    function place(){
      const w=arena.clientWidth-70,h=arena.clientHeight-70;
      target.style.left=Math.random()*w+'px';
      target.style.top=Math.random()*h+'px';
      target.style.display='block';
      target.style.animation='none'; void target.offsetWidth; target.style.animation='';
    }
    function end(){
      playing=false; clearInterval(timer); target.style.display='none'; ov.style.display='grid';
      if(score>best){best=score;$('#gBest').textContent=best;}
      let msg = score>=15?'LEGENDARY! You aim like a captain. 👑':score>=10?'Nice aim! Pro-level reflexes. 🎯':score>=5?'Good warm-up! Try again for a higher score. 🔥':'Every pro started somewhere. Run it back! 💪';
      $('#ovTitle').textContent='TIME! SCORE: '+score; $('#ovMsg').textContent=msg; $('#startBtn').textContent='↺ PLAY AGAIN';
      if(score>=15) confettiBurst();
      beep(300,.3,'sawtooth');
    }
    function start(){
      score=0;time=10;playing=true;ov.style.display='none';
      $('#gScore').textContent=0;$('#gTime').textContent=10; place();
      timer=setInterval(()=>{time--;$('#gTime').textContent=time;if(time<=0)end();},1000);
    }
    $('#startBtn').addEventListener('click',start);
    target.addEventListener('click',e=>{
      e.stopPropagation(); if(!playing) return;
      score++;$('#gScore').textContent=score;beep(500+score*25,.06);place();
    });
  })();
  
  /* ---------- Confetti ---------- */
  const cv=$('#confetti'), cx=cv.getContext('2d'); let pieces=[],cAnim=null;
  function sizeC(){cv.width=innerWidth;cv.height=innerHeight;} sizeC(); addEventListener('resize',sizeC);
  function confettiBurst(){
    if(reduced) return;
    const cols=['#00e5ff','#ff2e63','#ffc857','#ffffff','#ff9d2e'];
    for(let i=0;i<140;i++) pieces.push({x:innerWidth/2,y:innerHeight/2,vx:(Math.random()-.5)*16,vy:Math.random()*-14-3,s:Math.random()*8+4,c:cols[i%cols.length],r:Math.random()*6,vr:(Math.random()-.5)*.4,life:140});
    if(!cAnim) cAnim=requestAnimationFrame(drawC);
  }
  function drawC(){
    cx.clearRect(0,0,cv.width,cv.height);
    pieces=pieces.filter(p=>p.life>0);
    pieces.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.r+=p.vr;p.life--;
      cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.globalAlpha=Math.min(1,p.life/40);cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);cx.restore();});
    cAnim = pieces.length?requestAnimationFrame(drawC):null;
    if(!cAnim) cx.clearRect(0,0,cv.width,cv.height);
  }
  
  /* ---------- Lechon power-up ---------- */
  const caps=[
   "🐖 LECHON POWER-UP! +100 HP, +50 Crispiness.",
   "🔥 The skin goes CRACK. Critical hit!",
   "👑 Captain's orders: lechon for the whole squad.",
   "🏆 Achievement unlocked: Cebu Food Champion.",
   "💥 Ultimate ready: Sarsa-Splash!",
   "😋 Sir, the lechon says you should give a high score!"
  ];
  let ci=0;
  function powerUp(){
    const c=caps[ci++%caps.length];
    $('#lechCap').textContent=c; toast('LECHON POWER-UP! 🐖'); confettiBurst(); beep(880,.15,'triangle'); setTimeout(()=>beep(1180,.2,'triangle'),120);
  }
  $('#lechImg').addEventListener('click',powerUp);
  $('#lechImg').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();powerUp();}});
  $('#power').addEventListener('click',powerUp);
  
  /* ---------- Contact / socials ---------- */
  (function(){
    const box=$('#socials');
    const defs=[['facebook','📘','Facebook'],['instagram','📸','Instagram'],['tiktok','🎵','TikTok']];
    defs.forEach(([k,ic,name])=>{
      const c=CONTACT[k]; if(!c||!c.url) return;
      const a=document.createElement('a'); a.className='social'; a.href=c.url; a.target='_blank'; a.rel='noopener';
      a.innerHTML='<span class="ic">'+ic+'</span><span>'+c.label+'<small>'+name+'</small></span>';
      box.appendChild(a);
    });
  })();
  $('#ggBtn').addEventListener('click',()=>{toast('GG! Thanks for visiting 🤝');confettiBurst();beep(660);});
  $('#replayBtn').addEventListener('click',()=>{scrollTo({top:0,behavior:reduced?'auto':'smooth'});startTyper();});
  
  /* ---------- Stat tabs ---------- */
  (function(){
    const tabs=$$('.tab');
    function show(t){
      tabs.forEach(x=>{const on=x===t; x.setAttribute('aria-selected',on); $('#'+x.getAttribute('aria-controls')).hidden=!on;});
      beep(600,.06);
    }
    tabs.forEach((t,i)=>{
      t.addEventListener('click',()=>show(t));
      t.addEventListener('keydown',e=>{
        if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
          const n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length]; n.focus(); show(n);
        }
      });
    });
  })();
  
  /* ---------- Lightbox ---------- */
  (function(){
    const lb=$('#lightbox'), img=$('#lbImg'), cap=$('#lbCap'); let last=null;
    function open(src,c,from){last=from;img.src=src;img.alt=c;cap.textContent=c;lb.classList.add('open');$('#lbClose').focus();beep(740,.07);}
    function close(){lb.classList.remove('open');img.src='';if(last)last.focus();}
    $$('[data-src].gcard,[data-src].proof').forEach(b=>b.addEventListener('click',()=>open(b.dataset.src,b.dataset.cap,b)));
    $('#lbClose').addEventListener('click',close);
    lb.addEventListener('click',e=>{if(e.target===lb)close();});
    addEventListener('keydown',e=>{if(e.key==='Escape'&&lb.classList.contains('open'))close();});
  })();
  
  /* ---------- Lechon thumbnails ---------- */
  $$('.thumbs button').forEach(b=>b.addEventListener('click',()=>{
    const m=$('#lechMain'); m.style.display='block'; $('#lechFb').style.display='none';
    m.src=b.dataset.src; m.alt=b.dataset.alt;
    $$('.thumbs button').forEach(x=>x.setAttribute('aria-pressed',x===b)); beep(520,.06);
  }));
  
  /* ---------- Particles ---------- */
  (function(){
    if(reduced) return;
    const c=$('#particles'),x=c.getContext('2d'); let ps=[];
    function size(){c.width=innerWidth;c.height=innerHeight;ps=Array.from({length:Math.min(60,Math.floor(innerWidth/22))},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*2+.6,v:Math.random()*.5+.15,col:Math.random()>.5?'0,229,255':'255,46,99'}));}
    size(); addEventListener('resize',size);
    (function loop(){
      x.clearRect(0,0,c.width,c.height);
      ps.forEach(p=>{p.y-=p.v;if(p.y<-5){p.y=c.height+5;p.x=Math.random()*c.width;}
        x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fillStyle='rgba('+p.col+',.7)';x.shadowBlur=10;x.shadowColor='rgb('+p.col+')';x.fill();});
      requestAnimationFrame(loop);
    })();
  })();