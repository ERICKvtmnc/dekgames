/* ═══════════════════════════════════════════════
   DEKGAMES — app.js
   Perfil, ranking global, ranking por jogo, 32 jogos
═══════════════════════════════════════════════ */
'use strict';

// ── Storage ──
const S = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ── Estado ──
let perfil  = S.get('dkg_perfil');
let ranking = S.get('dkg_ranking') || [];
let partidas = S.get('dkg_partidas') || 0;
let sexoSel  = '';
let jogoAtual = null;

// ── LISTA DE JOGOS ──
const JOGOS = [
  { id:'flappy',    nome:'Flappy Bird',       emoji:'🐦', cor:'#87CEEB', dif:'facil',   pts:50  },
  { id:'memoria',   nome:'Jogo da Memória',   emoji:'🃏', cor:'#FFD93D', dif:'facil',   pts:60  },
  { id:'snake',     nome:'Cobrinha',          emoji:'🐍', cor:'#6BCB77', dif:'facil',   pts:70  },
  { id:'clicker',   nome:'Clicker Maluco',    emoji:'👆', cor:'#FF6B35', dif:'facil',   pts:40  },
  { id:'pong',      nome:'Pong',              emoji:'🏓', cor:'#4D96FF', dif:'facil',   pts:60  },
  { id:'cores',     nome:'Adivinhe a Cor',    emoji:'🎨', cor:'#C77DFF', dif:'facil',   pts:50  },
  { id:'digitacao', nome:'Digitação Veloz',   emoji:'⌨️', cor:'#FF6EB4', dif:'facil',   pts:55  },
  { id:'baloes',    nome:'Estoura Balões',    emoji:'🎈', cor:'#FF4757', dif:'facil',   pts:45  },
  { id:'gol',       nome:'Chute a Gol',       emoji:'⚽', cor:'#2ECC71', dif:'medio',   pts:120 },
  { id:'quebra',    nome:'Quebra-Cabeça',     emoji:'🧩', cor:'#3498DB', dif:'medio',   pts:130 },
  { id:'corrida',   nome:'Corrida de Carro',  emoji:'🏎️', cor:'#E74C3C', dif:'medio',   pts:140 },
  { id:'dino',      nome:'Dino Jump',         emoji:'🦕', cor:'#7F8C8D', dif:'medio',   pts:115 },
  { id:'math',      nome:'Math Rush',         emoji:'🔢', cor:'#27AE60', dif:'medio',   pts:110 },
  { id:'aim',       nome:'Aim Trainer',       emoji:'🎯', cor:'#CB4335', dif:'medio',   pts:130 },
  { id:'reaction',  nome:'Teste de Reação',   emoji:'⚡', cor:'#F1C40F', dif:'medio',   pts:120 },
  { id:'forca',     nome:'Jogo da Forca',     emoji:'🪤', cor:'#D35400', dif:'medio',   pts:100 },
  { id:'plataforma',nome:'Plataforma Jump',   emoji:'🦘', cor:'#9B59B6', dif:'medio',   pts:110 },
  { id:'minhoca',   nome:'Minhoca Gulosa',    emoji:'🪱', cor:'#8E44AD', dif:'medio',   pts:120 },
  { id:'naveesp',   nome:'Nave Espacial',     emoji:'👾', cor:'#2980B9', dif:'medio',   pts:135 },
  { id:'pingpong',  nome:'Ping Pong',         emoji:'🏸', cor:'#F39C12', dif:'medio',   pts:120 },
  { id:'2048',      nome:'2048',              emoji:'🔢', cor:'#E59866', dif:'dificil', pts:230 },
  { id:'labirinto', nome:'Labirinto',         emoji:'🌀', cor:'#16213E', dif:'dificil', pts:200 },
  { id:'tetris',    nome:'Blocos (Tetris)',   emoji:'🟦', cor:'#E67E22', dif:'dificil', pts:150 },
  { id:'asteroids', nome:'Asteroides',        emoji:'🚀', cor:'#1ABC9C', dif:'dificil', pts:180 },
  { id:'bomber',    nome:'Bomberman',         emoji:'💣', cor:'#922B21', dif:'dificil', pts:220 },
  { id:'wordle',    nome:'Wordle PT',         emoji:'📝', cor:'#1E8449', dif:'dificil', pts:200 },
  { id:'xadrez',    nome:'Xadrez Rápido',     emoji:'♟️', cor:'#2C3E50', dif:'dificil', pts:280 },
  { id:'tower',     nome:'Tower Defense',     emoji:'🏰', cor:'#1F618D', dif:'dificil', pts:250 },
  { id:'darkjump',  nome:'Dark Jump',         emoji:'💀', cor:'#17202A', dif:'extreme', pts:500 },
  { id:'speedmath', nome:'Speed Math',        emoji:'🧮', cor:'#6C3483', dif:'extreme', pts:450 },
  { id:'ninja',     nome:'Ninja Reflex',      emoji:'🥷', cor:'#1B2631', dif:'extreme', pts:480 },
  { id:'piano',     nome:'Piano Tiles',       emoji:'🎹', cor:'#212F3D', dif:'extreme', pts:420 },
];

// ── INICIALIZAÇÃO ──
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  atualizarStats();
  if (!perfil) {
    document.getElementById('modal-cadastro').style.display = 'flex';
  } else {
    atualizarHeader();
  }
});

function atualizarStats() {
  document.getElementById('stat-jogadores').textContent = ranking.length;
  document.getElementById('stat-partidas').textContent  = partidas;
}

// ── CADASTRO ──
window.selecionarSexo = btn => {
  document.querySelectorAll('.sexo-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  sexoSel = btn.dataset.sexo;
};

window.cadastrar = () => {
  const nome = document.getElementById('input-nome').value.trim();
  if (!nome)    { toast('⚠️ Digite seu apelido!'); return; }
  if (!sexoSel) { toast('⚠️ Selecione seu sexo!'); return; }
  perfil = { nome, sexo: sexoSel, pts: 0, jogos: {}, criado: Date.now() };
  S.set('dkg_perfil', perfil);
  const idx = ranking.findIndex(r => r.nome === nome);
  if (idx === -1) ranking.push({ nome, sexo: sexoSel, pts: 0 });
  S.set('dkg_ranking', ranking);
  document.getElementById('modal-cadastro').style.display = 'none';
  atualizarHeader();
  atualizarStats();
  toast('🎮 Bem-vindo, ' + nome + '!');
};

function atualizarHeader() {
  if (!perfil) return;
  document.getElementById('perfil-nome').textContent = perfil.nome;
  document.getElementById('perfil-pts').textContent  = perfil.pts + ' pts';
  const av = { M:'👦', F:'👧', O:'🧑' };
  document.getElementById('perfil-avatar').textContent = av[perfil.sexo] || '🎮';
}

// ── GRID ──
function renderGrid() {
  const grid = document.getElementById('jogos-grid');
  grid.innerHTML = '';
  const difLabel = { facil:'Fácil', medio:'Médio', dificil:'Difícil', extreme:'Extremo' };
  JOGOS.forEach((j, i) => {
    const c = document.createElement('div');
    c.className = 'card-jogo';
    c.style.animationDelay = (i * 0.035) + 's';
    c.onclick = () => abrirJogo(j);
    c.innerHTML =
      '<div class="card-thumb" style="background:' + j.cor + '22">' +
        '<span>' + j.emoji + '</span>' +
        '<span class="card-diff d-' + j.dif + '">' + difLabel[j.dif] + '</span>' +
      '</div>' +
      '<div class="card-info">' +
        '<div class="card-nome">' + j.nome + '</div>' +
        '<div class="card-pts">+<span>' + j.pts + '</span> pts</div>' +
      '</div>';
    grid.appendChild(c);
  });
}

// ── RANKING GLOBAL ──
window.abrirRanking = () => {
  renderRankingGlobal();
  document.getElementById('painel-ranking').style.display = 'flex';
};
window.fecharRanking = () => {
  document.getElementById('painel-ranking').style.display = 'none';
};

function renderRankingGlobal() {
  const lista  = document.getElementById('ranking-lista');
  const sorted = [...ranking].sort((a, b) => b.pts - a.pts);
  if (!sorted.length) {
    lista.innerHTML = '<div class="ranking-vazio">😴 Nenhum jogador ainda.<br>Seja o primeiro!</div>';
    return;
  }
  const av = { M:'👦', F:'👧', O:'🧑' };
  lista.innerHTML = sorted.map((r, i) => {
    const eu  = perfil && r.nome === perfil.nome;
    const pos = i === 0 ? '👑' : (i + 1) + 'º';
    return '<div class="ranking-item' + (eu ? ' eu' : '') + '">' +
      '<span class="rank-pos' + (i === 0 ? ' p1' : '') + '">' + pos + '</span>' +
      '<div class="rank-avatar">' + (av[r.sexo] || '🎮') + '</div>' +
      '<div class="rank-info">' +
        '<div class="rank-nome">' + r.nome + (eu ? ' (você)' : '') + '</div>' +
        '<div class="rank-sexo">' + (r.sexo==='M'?'Masculino':r.sexo==='F'?'Feminino':'Outro') + '</div>' +
      '</div>' +
      '<div class="rank-pts">' + r.pts + ' pts</div>' +
    '</div>';
  }).join('');
}

// ── ABRIR JOGO ──
window.abrirJogo = jogo => {
  if (!perfil) { document.getElementById('modal-cadastro').style.display = 'flex'; return; }
  jogoAtual = jogo;
  document.getElementById('jogo-titulo').textContent = jogo.emoji + ' ' + jogo.nome;
  document.getElementById('jogo-area').innerHTML    = '';
  document.getElementById('modal-jogo').style.display = 'flex';
  iniciarJogo(jogo);
};
window.fecharJogo = () => {
  document.getElementById('modal-jogo').style.display = 'none';
  jogoAtual = null;
};

// ── PONTOS ──
function addPts(jogo, pts) {
  if (!perfil) return;
  perfil.pts += pts;
  if (!perfil.jogos[jogo.id] || pts > perfil.jogos[jogo.id]) perfil.jogos[jogo.id] = pts;
  S.set('dkg_perfil', perfil);
  const idx = ranking.findIndex(r => r.nome === perfil.nome);
  if (idx !== -1) ranking[idx].pts = perfil.pts;
  else ranking.push({ nome: perfil.nome, sexo: perfil.sexo, pts: perfil.pts });
  S.set('dkg_ranking', ranking);
  partidas++;
  S.set('dkg_partidas', partidas);
  atualizarHeader();
  atualizarStats();
  toast('🎉 +' + pts + ' pontos!');
}

// ── RANKING DO JOGO ──
function rkJogo(id) {
  const lista = [];
  ranking.forEach(r => {
    const rp = (perfil && r.nome === perfil.nome) ? perfil : r;
    const pts = (rp.jogos && rp.jogos[id]) || 0;
    if (pts > 0) lista.push({ nome: r.nome, pts });
  });
  lista.sort((a, b) => b.pts - a.pts);
  if (!lista.length) return '<div style="color:var(--muted);font-size:.8rem;text-align:center;padding:8px">Sem placar ainda</div>';
  return lista.slice(0, 10).map((r, i) => {
    const pos = i === 0 ? '👑' : (i + 1) + 'º';
    return '<div class="jr-item">' +
      '<span class="jr-pos' + (i===0?' p1':'') + '">' + pos + '</span>' +
      '<span class="jr-nome">' + r.nome + '</span>' +
      '<span class="jr-pts">' + r.pts + '</span>' +
    '</div>';
  }).join('');
}

// ── TOAST ──
window.toast = msg => {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
};

/* ═══════════════════════════════════════════
   DESPACHANTE DE JOGOS
═══════════════════════════════════════════ */
function iniciarJogo(j) {
  const a = document.getElementById('jogo-area');
  const fn = {
    flappy: jogoFlappy, memoria: jogoMemoria, snake: jogoSnake,
    clicker: jogoClicker, pong: jogoPong, cores: jogoCores,
    digitacao: jogoDigitacao, baloes: jogoBaloes, gol: jogoGol,
    corrida: jogoCorrida, dino: jogoDino, math: jogoMath,
    aim: jogoAim, reaction: jogoReaction, forca: jogoForca,
    '2048': jogo2048,
    tetris: jogoTetris, naveesp: jogoNaveesp, wordle: jogoWordle,
    piano: jogoPiano, asteroids: jogoAsteroids, labirinto: jogoLabirinto,
    plataforma: jogoPlataforma, minhoca: jogoMinhoca, pingpong: jogoPingpong,
    quebra: jogoQuebra, speedmath: jogoSpeedmath, ninja: jogoNinja,
    bomber: jogoBomber, tower: jogoTower, darkjump: jogoDarkjump,
    xadrez: jogoXadrez,
  }[j.id];
  fn ? fn(a, j) : jogoEmBreve(a, j);
}

/* ═══════════════════════════════════════════
   JOGOS
═══════════════════════════════════════════ */

// ── FLAPPY BIRD ──
function jogoFlappy(a, j) {
  const W=320,H=460;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>pontos</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo" onclick="flapStart()">▶ Iniciar</button></div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let bird,pipes,sc,raf,on=false;
  function draw(){
    ctx.fillStyle='#87CEEB';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#90EE90';ctx.fillRect(0,H-50,W,50);
    pipes.forEach(p=>{
      ctx.fillStyle='#2ECC71';
      ctx.fillRect(p.x,0,48,p.t);ctx.fillRect(p.x,p.t+130,48,H);
    });
    ctx.fillStyle='#FFD93D';ctx.beginPath();
    ctx.ellipse(70,bird.y,16,12,bird.v*.05,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#FF6B35';ctx.beginPath();ctx.arc(80,bird.y-2,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 24px Fredoka,sans-serif';
    ctx.textAlign='center';ctx.fillText(sc,W/2,36);
  }
  function loop(){
    if(!on)return;
    bird.v+=.42;bird.y+=bird.v;
    pipes.forEach(p=>p.x-=3);
    if(pipes[0].x<-50){pipes.shift();pipes.push({x:W+40,t:80+Math.random()*180});sc++;document.getElementById('sc').textContent=sc;}
    const p=pipes[0];
    if(bird.y<0||bird.y>H-50||(70+16>p.x&&70-16<p.x+48&&(bird.y-12<p.t||bird.y+12>p.t+130))){
      on=false;const g=Math.max(10,sc*8);addPts(j,g);
      document.getElementById('rk').innerHTML=rkJogo(j.id);
      ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff';ctx.font='bold 32px Fredoka,sans-serif';ctx.textAlign='center';
      ctx.fillText('💀 Game Over!',W/2,H/2-16);
      ctx.font='18px Nunito,sans-serif';ctx.fillText('Score: '+sc+' | +'+g+' pts',W/2,H/2+18);return;
    }
    draw();raf=requestAnimationFrame(loop);
  }
  window.flapStart=()=>{cancelAnimationFrame(raf);bird={y:H/2,v:0};pipes=[{x:W,t:120},{x:W+200,t:140}];sc=0;on=true;loop();};
  const jump=()=>{if(on)bird.v=-8;};
  cv.addEventListener('click',jump);
  cv.addEventListener('touchstart',e=>{e.preventDefault();jump();},{passive:false});
  document.addEventListener('keydown',e=>{if(e.code==='Space')jump();});
  ctx.fillStyle='#87CEEB';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#1A1A2E';ctx.font='bold 26px Fredoka,sans-serif';ctx.textAlign='center';
  ctx.fillText('🐦 Toque para voar!',W/2,H/2);
}

// ── MEMÓRIA ──
function jogoMemoria(a, j) {
  const emjs=['🍎','🍌','🍇','🍓','🎮','🚀','⚽','🎯','🐶','🐱','🦊','🐸'];
  let cards=[],virados=[],acertos=0,bloqueado=false,tentativas=0;
  function novo(){
    const em=[...emjs,...emjs].sort(()=>Math.random()-.5);
    cards=em.map((e,i)=>({id:i,e,v:false,ok:false}));
    virados=[];acertos=0;tentativas=0;render();
  }
  function render(){
    a.innerHTML=
      '<div style="text-align:center;margin-bottom:10px"><button class="btn-jogo" onclick="memNovo()">🔄 Reiniciar</button></div>'+
      '<div class="jogo-score"><strong id="sc">'+tentativas+'</strong><span>tentativas</span></div>'+
      '<div id="mg" style="display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin-bottom:13px"></div>'+
      '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
    renderCards();
  }
  function renderCards(){
    const g=document.getElementById('mg');if(!g)return;
    g.innerHTML=cards.map(c=>
      '<div onclick="memClick('+c.id+')" style="aspect-ratio:1;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:pointer;border:2px solid var(--borda);background:'+(c.ok?'#DCFCE7':c.v?'#EEF4FF':'var(--bg)')+';border-color:'+(c.ok?'#6BCB77':c.v?'var(--az)':'var(--borda)')+';">'+(c.v||c.ok?c.e:'❓')+'</div>'
    ).join('');
  }
  window.memNovo=novo;
  window.memClick=id=>{
    if(bloqueado)return;const c=cards[id];if(c.v||c.ok)return;
    c.v=true;virados.push(c);renderCards();
    if(virados.length===2){
      bloqueado=true;tentativas++;
      const sc=document.getElementById('sc');if(sc)sc.textContent=tentativas;
      setTimeout(()=>{
        if(virados[0].e===virados[1].e){
          virados.forEach(v=>{v.ok=true;v.v=false;});acertos++;
          if(acertos===emjs.length){renderCards();const g=Math.max(60,400-tentativas*8);addPts(j,g);const rk=document.getElementById('rk');if(rk)rk.innerHTML=rkJogo(j.id);}
        }else virados.forEach(v=>v.v=false);
        virados=[];bloqueado=false;renderCards();
      },750);
    }
  };
  novo();
}

// ── SNAKE ──
function jogoSnake(a, j) {
  const W=300,H=300,SZ=20;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>pontos</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,44px);gap:7px;justify-content:center;margin:10px auto">'+
      '<div></div><button class="btn-jogo" style="padding:8px;font-size:1.1rem" onclick="snakeDir(0,-1)">▲</button><div></div>'+
      '<button class="btn-jogo" style="padding:8px;font-size:1.1rem" onclick="snakeDir(-1,0)">◀</button>'+
      '<button class="btn-jogo verde" style="padding:8px;font-size:.8rem" onclick="snakeStart()">GO</button>'+
      '<button class="btn-jogo" style="padding:8px;font-size:1.1rem" onclick="snakeDir(1,0)">▶</button>'+
      '<div></div><button class="btn-jogo" style="padding:8px;font-size:1.1rem" onclick="snakeDir(0,1)">▼</button><div></div>'+
    '</div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let snake,dir,food,sc,iv,on=false;
  function novaComida(){food={x:Math.floor(Math.random()*(W/SZ))*SZ,y:Math.floor(Math.random()*(H/SZ))*SZ};}
  function draw(){
    ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,.05)';
    for(let x=0;x<W;x+=SZ){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=SZ){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#6BCB77':'#4DA85A';ctx.fillRect(s.x+1,s.y+1,SZ-2,SZ-2);});
    ctx.font=SZ+'px serif';ctx.textAlign='center';ctx.fillText('🍎',food.x+SZ/2,food.y+SZ-2);
    ctx.fillStyle='#fff';ctx.font='bold 14px Nunito,sans-serif';ctx.textAlign='left';ctx.fillText(sc,8,18);
  }
  function loop(){
    const h={x:snake[0].x+dir.x*SZ,y:snake[0].y+dir.y*SZ};
    if(h.x<0||h.x>=W||h.y<0||h.y>=H||snake.some(s=>s.x===h.x&&s.y===h.y)){
      clearInterval(iv);on=false;const g=Math.max(10,sc*15);addPts(j,g);
      document.getElementById('rk').innerHTML=rkJogo(j.id);
      ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff';ctx.font='bold 24px Fredoka,sans-serif';ctx.textAlign='center';
      ctx.fillText('💀 '+sc+' pts | +'+g,W/2,H/2);return;
    }
    snake.unshift(h);
    if(h.x===food.x&&h.y===food.y){sc++;document.getElementById('sc').textContent=sc;novaComida();}
    else snake.pop();
    draw();
  }
  window.snakeStart=()=>{clearInterval(iv);snake=[{x:140,y:140},{x:120,y:140},{x:100,y:140}];dir={x:1,y:0};sc=0;on=true;document.getElementById('sc').textContent=0;novaComida();draw();iv=setInterval(loop,140);};
  window.snakeDir=(x,y)=>{if(!on)return;if(x!==0&&dir.x===0)dir={x,y};if(y!==0&&dir.y===0)dir={x,y};};
  document.addEventListener('keydown',e=>{if(e.key==='ArrowUp')snakeDir(0,-1);if(e.key==='ArrowDown')snakeDir(0,1);if(e.key==='ArrowLeft')snakeDir(-1,0);if(e.key==='ArrowRight')snakeDir(1,0);});
  ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);ctx.fillStyle='#6BCB77';ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🐍 Pressione GO',W/2,H/2);
}

// ── CLICKER ──
function jogoClicker(a, j) {
  let clicks=0,tempo=15,iv,on=false;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>cliques em <span id="tm">15</span>s</span></div>'+
    '<div style="display:flex;justify-content:center;margin:16px 0">'+
      '<button id="bc" onclick="clickar()" style="width:130px;height:130px;border-radius:50%;font-size:2.8rem;background:linear-gradient(135deg,#4D96FF,#C77DFF);border:none;color:#fff;box-shadow:0 8px 24px rgba(77,150,255,.4);transition:transform .1s">👆</button>'+
    '</div>'+
    '<div style="text-align:center"><button class="btn-jogo" onclick="clickStart()">▶ Iniciar</button></div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  window.clickStart=()=>{clicks=0;tempo=15;on=true;document.getElementById('sc').textContent=0;clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);on=false;const g=Math.floor(clicks/2);addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);toast('⏰ '+clicks+' cliques! +'+g+' pts');}},1000);};
  window.clickar=()=>{if(!on)return;clicks++;document.getElementById('sc').textContent=clicks;const b=document.getElementById('bc');b.style.transform='scale(.88)';setTimeout(()=>b.style.transform='scale(1)',70);};
}

// ── GOL ──
function jogoGol(a, j) {
  const W=320,H=260;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>gols / <span id="ch">5</span> chutes</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo verde" onclick="golStart()">▶ Iniciar</button></div>'+
    '<p style="text-align:center;font-size:.75rem;color:var(--muted);margin-bottom:10px">Toque onde quer chutar</p>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let gols=0,ch=5,gl={x:130,d:1},on=false,ball=null,anim=false;
  function draw(){
    ctx.fillStyle='#27AE60';ctx.fillRect(0,0,W,H);
    for(let i=0;i<W;i+=36){ctx.fillStyle='rgba(0,0,0,.06)';ctx.fillRect(i,0,18,H);}
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(80,15,160,75);
    ctx.strokeStyle='#aaa';ctx.lineWidth=3;ctx.strokeRect(80,15,160,75);
    ctx.strokeStyle='rgba(200,200,200,.4)';ctx.lineWidth=1;
    for(let x=80;x<=240;x+=20){ctx.beginPath();ctx.moveTo(x,15);ctx.lineTo(x,90);ctx.stroke();}
    for(let y=15;y<=90;y+=15){ctx.beginPath();ctx.moveTo(80,y);ctx.lineTo(240,y);ctx.stroke();}
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText('🧤',gl.x+16,55);
    if(ball)ctx.fillText('⚽',ball.x,ball.y);
    else ctx.fillText('⚽',W/2,H-30);
    ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,H-26,W,26);
    ctx.fillStyle='#fff';ctx.font='bold 13px Nunito,sans-serif';
    ctx.textAlign='center';ctx.fillText('Gols: '+gols+' | Chutes: '+ch,W/2,H-8);
  }
  function moveGl(){if(!on)return;gl.x+=gl.d*2.5;if(gl.x>195||gl.x<80)gl.d*=-1;if(!anim)draw();requestAnimationFrame(moveGl);}
  function chute(tx){
    if(!on||anim||ch<=0)return;
    ball={x:W/2,y:H-35,vx:(tx-W/2)/16,vy:-8};anim=true;
    function ab(){
      ball.x+=ball.vx;ball.y+=ball.vy;ball.vy+=.5;
      if(ball.y<95){
        anim=false;
        const hit=ball.x>80&&ball.x<240&&ball.y>15&&ball.y<90&&!(ball.x>gl.x&&ball.x<gl.x+36);
        if(hit){gols++;toast('⚽ GOOOL!');}else toast('🧤 Defendido!');
        ball=null;ch--;
        document.getElementById('sc').textContent=gols;document.getElementById('ch').textContent=ch;
        draw();
        if(ch<=0){on=false;const g=gols*Math.round(j.pts/5);addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);setTimeout(()=>toast('⚽ '+gols+'/5 gols! +'+g+' pts'),400);}
        return;
      }
      draw();requestAnimationFrame(ab);
    }
    requestAnimationFrame(ab);
  }
  cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect();chute((e.clientX-r.left)*(W/r.width));});
  cv.addEventListener('touchstart',e=>{e.preventDefault();const r=cv.getBoundingClientRect();chute((e.touches[0].clientX-r.left)*(W/r.width));},{passive:false});
  window.golStart=()=>{gols=0;ch=5;on=true;ball=null;anim=false;document.getElementById('sc').textContent=0;document.getElementById('ch').textContent=5;moveGl();};
  draw();
}

// ── CORRIDA ──
function jogoCorrida(a, j) {
  const W=280,H=460;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>metros</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:flex;gap:9px;justify-content:center;margin:10px 0">'+
      '<button class="btn-jogo" onpointerdown="sd(-1)" onpointerup="sd(0)" style="flex:1;max-width:90px">◀</button>'+
      '<button class="btn-jogo verde" onclick="corridaStart()">▶ Start</button>'+
      '<button class="btn-jogo" onpointerdown="sd(1)" onpointerup="sd(0)" style="flex:1;max-width:90px">▶</button>'+
    '</div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let car={x:100,y:380},obs=[],dist=0,vel=3.5,raf,on=false,dir=0,lns=[];
  for(let i=0;i<8;i++)lns.push(i*(H/8));
  function draw(){
    ctx.fillStyle='#555';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#666';ctx.fillRect(15,0,W-30,H);
    ctx.fillStyle='#FFD93D';lns.forEach(y=>ctx.fillRect(W/2-4,y,8,36));
    obs.forEach(o=>{ctx.font='44px serif';ctx.textAlign='center';ctx.fillText('🚗',o.x+22,o.y+44);});
    ctx.font='46px serif';ctx.textAlign='center';ctx.fillText('🏎️',car.x+22,car.y+50);
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,28);
    ctx.fillStyle='#fff';ctx.font='bold 13px Nunito,sans-serif';ctx.textAlign='center';
    ctx.fillText(dist+'m',W/2,19);
  }
  function loop(){
    if(!on)return;
    lns=lns.map(y=>{const ny=y+vel;return ny>H?ny-H:ny;});
    car.x+=dir*5;car.x=Math.max(14,Math.min(W-60,car.x));
    obs.forEach(o=>o.y+=vel);obs=obs.filter(o=>o.y<H);
    if(obs.length<3&&Math.random()<.025)obs.push({x:18+Math.random()*(W-60),y:-60});
    if(obs.some(o=>car.x<o.x+44&&car.x+44>o.x&&car.y<o.y+44&&car.y+50>o.y)){
      on=false;const g=Math.floor(dist/4);addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);
      ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff';ctx.font='bold 28px Fredoka,sans-serif';ctx.textAlign='center';
      ctx.fillText('💥 '+dist+'m | +'+g+' pts',W/2,H/2);return;
    }
    dist++;vel=3.5+dist/220;document.getElementById('sc').textContent=dist;
    draw();raf=requestAnimationFrame(loop);
  }
  window.corridaStart=()=>{cancelAnimationFrame(raf);car={x:100,y:380};obs=[];dist=0;vel=3.5;on=true;document.getElementById('sc').textContent=0;loop();};
  window.sd=d=>dir=d;
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')dir=-1;if(e.key==='ArrowRight')dir=1;});
  document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')dir=0;});
  ctx.fillStyle='#555';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🏎️ Pressione Start',W/2,H/2);
}

// ── DINO JUMP ──
function jogoDino(a, j) {
  const W=320,H=180;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>metros</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo verde" onclick="dinoPular()">▶ Pular / Iniciar</button></div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let dino={y:120,vy:0},obs=[],dist=0,vel=4,raf,on=false;
  function draw(){
    ctx.fillStyle='#F0F4FF';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#bbb';ctx.fillRect(0,148,W,2);
    ctx.font='34px serif';ctx.textAlign='center';ctx.fillText('🦕',44,dino.y+8);
    obs.forEach(o=>ctx.fillText('🌵',o.x,148));
    ctx.fillStyle='#333';ctx.font='bold 13px Nunito,sans-serif';ctx.textAlign='left';ctx.fillText(dist+'m',7,18);
  }
  function loop(){
    dino.vy+=.75;dino.y+=dino.vy;if(dino.y>=120){dino.y=120;dino.vy=0;}
    obs.forEach(o=>o.x-=vel);obs=obs.filter(o=>o.x>-30);
    if(obs.length<2&&Math.random()<.022)obs.push({x:W+20});
    dist++;vel=4+dist/280;document.getElementById('sc').textContent=dist;
    if(obs.some(o=>Math.abs(o.x-44)<26&&dino.y>115)){
      on=false;const g=Math.floor(dist/3);addPts(j,g);
      document.getElementById('rk').innerHTML=rkJogo(j.id);
      ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#fff';ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';
      ctx.fillText('💀 '+dist+'m | +'+g+' pts',W/2,H/2);return;
    }
    draw();if(on)raf=requestAnimationFrame(loop);
  }
  window.dinoPular=()=>{
    if(!on){cancelAnimationFrame(raf);dino={y:120,vy:0};obs=[];dist=0;vel=4;on=true;loop();return;}
    if(dino.y>=120)dino.vy=-13;
  };
  cv.addEventListener('click',()=>dinoPular());
  cv.addEventListener('touchstart',e=>{e.preventDefault();dinoPular();},{passive:false});
  draw();
}

// ── MATH RUSH ──
function jogoMath(a, j) {
  let sc=0,tempo=30,iv,on=false;
  function novaQ(){
    const ops=['+','-','×'];const op=ops[Math.floor(Math.random()*3)];
    const x=Math.floor(Math.random()*12)+1,y=Math.floor(Math.random()*12)+1;
    const res=op==='+'?x+y:op==='-'?x-y:x*y;
    const err=res+(Math.random()<.5?-(1+Math.floor(Math.random()*5)):(1+Math.floor(Math.random()*5)));
    const opts=Math.random()<.5?[res,err]:[err,res];
    return{q:`${x} ${op} ${y} = ?`,res,opts};
  }
  let q=novaQ();
  function render(){
    a.innerHTML='<div class="jogo-score"><strong id="sc">'+sc+'</strong><span>pontos | <span id="tm">'+tempo+'</span>s</span></div>'+
      '<div style="background:var(--bg);border-radius:14px;padding:22px;text-align:center;margin-bottom:13px">'+
        '<div style="font-family:Fredoka,sans-serif;font-size:2rem;margin-bottom:14px">'+q.q+'</div>'+
        '<div style="display:flex;gap:12px;justify-content:center">'+
          q.opts.map(o=>'<button class="btn-jogo" style="min-width:76px;font-size:1.25rem" onclick="mathResp('+o+')">'+o+'</button>').join('')+
        '</div>'+
      '</div>'+
      '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>'+
      (!on?'<div style="text-align:center"><button class="btn-jogo" onclick="mathStart()">▶ Iniciar</button></div>':'');
  }
  window.mathResp=r=>{if(!on)return;if(r===q.res){sc+=10;toast('✅');}else{sc=Math.max(0,sc-5);toast('❌');}q=novaQ();render();document.getElementById('sc').textContent=sc;};
  window.mathStart=()=>{sc=0;tempo=30;on=true;q=novaQ();clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);on=false;addPts(j,sc);const rk=document.getElementById('rk');if(rk)rk.innerHTML=rkJogo(j.id);toast('⏰ +'+sc+' pts!');render();}},1000);render();};
  render();
}

// ── AIM TRAINER ──
function jogoAim(a, j) {
  const W=320,H=280;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>acertos | <span id="tm">20</span>s</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo" onclick="aimStart()">▶ Iniciar</button></div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let acertos=0,tempo=20,alvo,iv,on=false;
  function novoAlvo(){const r=16+Math.random()*22;alvo={x:r+Math.random()*(W-2*r),y:r+Math.random()*(H-2*r),r};}
  function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);if(!alvo)return;ctx.beginPath();ctx.arc(alvo.x,alvo.y,alvo.r,0,Math.PI*2);ctx.fillStyle='#FF4757';ctx.fill();ctx.beginPath();ctx.arc(alvo.x,alvo.y,alvo.r*.6,0,Math.PI*2);ctx.fillStyle='#FF6B35';ctx.fill();ctx.beginPath();ctx.arc(alvo.x,alvo.y,alvo.r*.3,0,Math.PI*2);ctx.fillStyle='#FFD93D';ctx.fill();}
  function click(e){if(!on)return;const rect=cv.getBoundingClientRect();const x=(e.clientX||e.touches[0].clientX)-rect.left;const y=(e.clientY||e.touches[0].clientY)-rect.top;if(alvo&&Math.hypot(x-alvo.x,y-alvo.y)<alvo.r){acertos++;document.getElementById('sc').textContent=acertos;novoAlvo();draw();}}
  cv.addEventListener('click',click);cv.addEventListener('touchstart',e=>{e.preventDefault();click(e);},{passive:false});
  window.aimStart=()=>{acertos=0;tempo=20;on=true;document.getElementById('sc').textContent=0;clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);on=false;const g=acertos*10;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);toast('🎯 '+acertos+' acertos! +'+g+' pts');}},1000);novoAlvo();draw();};
  draw();
}

// ── REACTION ──
function jogoReaction(a, j) {
  let estado='inicio',t0,iv;
  a.innerHTML='<div class="jogo-score"><strong id="sc">---</strong><span>ms de reação</span></div>'+
    '<div id="rb" onclick="reactClick()" style="width:100%;height:180px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:#EEF4FF;border:3px solid var(--borda);cursor:pointer;transition:background .15s;margin-bottom:13px;font-size:1.1rem;font-weight:700;text-align:center;padding:20px">👆 Toque para começar</div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  window.reactClick=()=>{
    const b=document.getElementById('rb');
    if(estado==='inicio'){estado='wait';b.style.background='#FFF3CD';b.textContent='⏳ Aguarde...';clearTimeout(iv);iv=setTimeout(()=>{if(estado!=='wait')return;estado='go';t0=Date.now();b.style.background='#DCFCE7';b.textContent='💚 AGORA!';},1200+Math.random()*2800);}
    else if(estado==='wait'){estado='inicio';b.style.background='#FEE2E2';b.textContent='😅 Cedo demais! Tente novamente';clearTimeout(iv);setTimeout(()=>{b.style.background='#EEF4FF';b.textContent='👆 Toque para começar';estado='inicio';},1400);}
    else if(estado==='go'){const ms=Date.now()-t0;document.getElementById('sc').textContent=ms;estado='inicio';b.style.background='#EEF4FF';b.textContent='⚡ '+ms+'ms! Toque para jogar de novo';const g=ms<200?200:ms<350?150:ms<500?100:50;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);}
  };
}

// ── PONG ──
function jogoPong(a, j) {
  const W=320,H=240;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>× <span id="scia">0</span> (você × IA)</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo" onclick="pongStart()">▶ Iniciar</button></div>'+
    '<p style="text-align:center;font-size:.72rem;color:var(--muted);margin-bottom:10px">Mova o mouse/dedo para mover sua raquete</p>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let bola,p1,ia,pts,raf,on=false;
  const PH=55,PW=9;
  function draw(){
    ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);
    ctx.setLineDash([6,6]);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#4D96FF';ctx.fillRect(0,p1,PW,PH);
    ctx.fillStyle='#FF4757';ctx.fillRect(W-PW,ia,PW,PH);
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bola.x,bola.y,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';
    ctx.fillText(pts.p+' : '+pts.ia,W/2,22);
  }
  function reset(){bola={x:W/2,y:H/2,vx:(Math.random()<.5?1:-1)*4,vy:(Math.random()-.5)*5};}
  function loop(){
    if(!on)return;bola.x+=bola.vx;bola.y+=bola.vy;
    if(bola.y<7||bola.y>H-7)bola.vy*=-1;
    if(bola.x<PW+7&&bola.y>p1&&bola.y<p1+PH){bola.vx=Math.abs(bola.vx)+.08;}
    if(bola.x>W-PW-7&&bola.y>ia&&bola.y<ia+PH){bola.vx=-(Math.abs(bola.vx)+.08);}
    ia+=(bola.y-ia-PH/2)*.09;ia=Math.max(0,Math.min(H-PH,ia));
    if(bola.x<0){pts.ia++;document.getElementById('scia').textContent=pts.ia;reset();}
    if(bola.x>W){pts.p++;document.getElementById('sc').textContent=pts.p;reset();}
    if(pts.p>=7||pts.ia>=7){on=false;const g=pts.p*18;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 24px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText(pts.p>pts.ia?'🏆 Você venceu!':'😅 IA venceu!',W/2,H/2);return;}
    draw();raf=requestAnimationFrame(loop);
  }
  cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();p1=Math.max(0,Math.min(H-PH,(e.clientY-r.top)*(H/r.height)-PH/2));});
  cv.addEventListener('touchmove',e=>{e.preventDefault();const r=cv.getBoundingClientRect();p1=Math.max(0,Math.min(H-PH,(e.touches[0].clientY-r.top)*(H/r.height)-PH/2));},{passive:false});
  window.pongStart=()=>{cancelAnimationFrame(raf);pts={p:0,ia:0};p1=H/2-PH/2;ia=H/2-PH/2;on=true;reset();document.getElementById('sc').textContent=0;document.getElementById('scia').textContent=0;loop();};
  draw();
}

// ── CORES ──
function jogoCores(a, j) {
  const nms=['Vermelho','Verde','Azul','Amarelo','Roxo','Rosa','Laranja','Ciano'];
  const vals={Vermelho:'#FF4757',Verde:'#6BCB77',Azul:'#4D96FF',Amarelo:'#FFD93D',Roxo:'#C77DFF',Rosa:'#FF6EB4',Laranja:'#FF6B35',Ciano:'#00CEC9'};
  let sc=0,tempo=20,iv,on=false;
  function novaR(){const cor=nms[Math.floor(Math.random()*8)];const txt=nms[Math.floor(Math.random()*8)];const op=[...nms].sort(()=>Math.random()-.5).slice(0,4);if(!op.includes(cor))op[0]=cor;op.sort(()=>Math.random()-.5);return{cor,txt,op};}
  let r=novaR();
  function render(){
    a.innerHTML='<div class="jogo-score"><strong id="sc">'+sc+'</strong><span>pontos | <span id="tm">'+tempo+'</span>s</span></div>'+
      '<div style="text-align:center;margin-bottom:14px"><p style="font-size:.82rem;color:var(--muted);margin-bottom:8px">Qual é a COR do texto? (não a palavra!)</p>'+
        '<div style="font-family:Fredoka,sans-serif;font-size:3rem;color:'+vals[r.cor]+'">'+r.txt+'</div></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:13px">'+
        r.op.map(o=>'<button class="btn-jogo" style="background:'+vals[o]+';color:#fff;padding:13px;font-size:.95rem" onclick="coresResp(\''+o+'\')">'+o+'</button>').join('')+
      '</div>'+
      '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>'+
      (!on?'<div style="text-align:center"><button class="btn-jogo" onclick="coresStart()">▶ Iniciar</button></div>':'');
  }
  window.coresResp=o=>{if(!on)return;if(o===r.cor){sc+=10;toast('✅');}else{sc=Math.max(0,sc-5);toast('❌');}r=novaR();render();document.getElementById('sc').textContent=sc;};
  window.coresStart=()=>{sc=0;tempo=20;on=true;r=novaR();clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);on=false;addPts(j,sc);const rk=document.getElementById('rk');if(rk)rk.innerHTML=rkJogo(j.id);toast('⏰ +'+sc+' pts!');render();}},1000);render();};
  render();
}

// ── DIGITAÇÃO ──
function jogoDigitacao(a, j) {
  const pals=['futebol','gol','arena','campeão','jogador','torcida','bola','partida','vitória','defesa','ataque','campo','goleiro','esporte','placar','torneio','liga','copa','time','clube'];
  let sc=0,tempo=30,iv,on=false,atual='';
  function novaP(){atual=pals[Math.floor(Math.random()*pals.length)];const el=document.getElementById('dpal');if(el)el.textContent=atual;}
  function render(){
    a.innerHTML='<div class="jogo-score"><strong id="sc">'+sc+'</strong><span>palavras | <span id="tm">'+tempo+'</span>s</span></div>'+
      '<div style="background:var(--bg);border-radius:14px;padding:18px;text-align:center;margin-bottom:13px">'+
        '<p style="font-size:.78rem;color:var(--muted);margin-bottom:7px">Digite a palavra:</p>'+
        '<div id="dpal" style="font-family:Fredoka,sans-serif;font-size:2rem;color:var(--az);margin-bottom:10px">'+atual+'</div>'+
        '<input id="dinp" type="text" style="width:100%;padding:11px;border:2px solid var(--borda);border-radius:11px;font-size:1.05rem;text-align:center;outline:none" placeholder="Digite aqui..."/>'+
      '</div>'+
      '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>'+
      (!on?'<div style="text-align:center"><button class="btn-jogo" onclick="digStart()">▶ Iniciar</button></div>':'');
    const inp=document.getElementById('dinp');
    if(inp)inp.addEventListener('input',e=>{if(!on)return;if(e.target.value.toLowerCase()===atual){sc++;document.getElementById('sc').textContent=sc;e.target.value='';novaP();toast('✅ +1!');}});
  }
  window.digStart=()=>{sc=0;tempo=30;on=true;novaP();clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);on=false;const g=sc*12;addPts(j,g);toast('⌨️ '+sc+' palavras! +'+g+' pts');render();}},1000);render();document.getElementById('dinp')?.focus();};
  render();
}

// ── BALÕES ──
function jogoBaloes(a, j) {
  const W=320,H=340;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>balões | <span id="tm">20</span>s</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo" onclick="baloesStart()">▶ Iniciar</button></div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  const cores=['#FF4757','#FF6B35','#FFD93D','#6BCB77','#4D96FF','#C77DFF'];
  let bals=[],sc=0,tempo=20,iv,on=false;
  function novoBal(){return{x:20+Math.random()*(W-40),y:H+40,r:18+Math.random()*18,vel:1+Math.random()*2,c:cores[Math.floor(Math.random()*6)]};}
  function draw(){
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#E8F4FD';ctx.fillRect(0,0,W,H);
    bals.forEach(b=>{ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle=b.c;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(b.x-b.r*.28,b.y-b.r*.28,b.r*.22,0,Math.PI*2);ctx.fill();});
  }
  function loop(){if(!on)return;bals.forEach(b=>b.y-=b.vel);bals=bals.filter(b=>b.y+b.r>0);if(bals.length<7&&Math.random()<.1)bals.push(novoBal());draw();requestAnimationFrame(loop);}
  function click(e){if(!on)return;const rect=cv.getBoundingClientRect();const x=((e.clientX||e.touches[0].clientX)-rect.left)*(W/rect.width);const y=((e.clientY||e.touches[0].clientY)-rect.top)*(H/rect.height);const idx=bals.findIndex(b=>Math.hypot(x-b.x,y-b.y)<b.r);if(idx!==-1){bals.splice(idx,1);sc++;document.getElementById('sc').textContent=sc;}}
  cv.addEventListener('click',click);cv.addEventListener('touchstart',e=>{e.preventDefault();click(e);},{passive:false});
  window.baloesStart=()=>{bals=[];sc=0;tempo=20;on=true;document.getElementById('sc').textContent=0;clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);on=false;const g=sc*5;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);toast('🎈 '+sc+' balões! +'+g+' pts');}},1000);loop();};
  draw();
}

// ── FORCA ──
function jogoForca(a, j) {
  const pals=['FUTEBOL','GOLEIRO','CAMPEÃO','DEFENSOR','TORCEDOR','DRIBLAR','MARCADOR','ESCANTEIO','PÊNALTI','IMPEDIMENTO','COBRANÇA','TRINCO','LATERAL','TRAVESSÃO','BANDEIRA'];
  let pal='',tent=0,max=6,err=[],ok=[];
  function novo(){pal=pals[Math.floor(Math.random()*pals.length)];tent=0;err=[];ok=[];render();}
  function render(){
    const ex=pal.split('').map(l=>ok.includes(l)?l:'_').join(' ');
    const gan=pal.split('').every(l=>ok.includes(l));
    const per=tent>=max;
    a.innerHTML='<div class="jogo-score"><strong>'+(max-tent)+'</strong><span>tentativas restantes</span></div>'+
      '<div style="text-align:center;margin-bottom:13px">'+
        '<div style="font-family:Fredoka,sans-serif;font-size:1.8rem;letter-spacing:.12em;margin-bottom:7px">'+ex+'</div>'+
        '<div style="color:var(--r);font-size:.82rem;min-height:20px">Erradas: '+err.join(' ')+'</div>'+
      '</div>'+
      (gan?'<div style="text-align:center;font-size:1.3rem;margin-bottom:11px">🎉 Você ganhou! +150 pts</div>':'')+
      (per?'<div style="text-align:center;color:var(--r);margin-bottom:11px">💀 Era: <strong>'+pal+'</strong></div>':'')+
      (!gan&&!per?
        '<div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-bottom:13px">'+
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>'<button onclick="forcaTentar(\''+l+'\')" style="width:33px;height:33px;border-radius:7px;font-weight:700;font-size:.8rem;border:none;cursor:pointer;background:'+(err.includes(l)?'#FEE2E2':ok.includes(l)?'#DCFCE7':'var(--bg)')+';color:'+(err.includes(l)?'var(--r)':ok.includes(l)?'#16A34A':'var(--texto)')+'">'+l+'</button>').join('')+
        '</div>':
        '<div style="text-align:center"><button class="btn-jogo" onclick="forcaNovo()">🔄 Nova palavra</button></div>')+
      '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
    if(gan){addPts(j,150);const rk=document.getElementById('rk');if(rk)rk.innerHTML=rkJogo(j.id);}
  }
  window.forcaTentar=l=>{if(err.includes(l)||ok.includes(l))return;if(pal.includes(l))ok.push(l);else{err.push(l);tent++;}render();};
  window.forcaNovo=novo;
  novo();
}

// ── 2048 ──
function jogo2048(a, j) {
  let board,sc;
  const cores={'2':'#EEE4DA','4':'#EDE0C8','8':'#F2B179','16':'#F59563','32':'#F67C5F','64':'#F65E3B','128':'#EDCF72','256':'#EDCC61','512':'#EDC850','1024':'#EDC53F','2048':'#EDC22E'};
  function addTile(){const v=[];board.forEach((r,i)=>r.forEach((x,k)=>{if(!x)v.push([i,k]);}));if(!v.length)return;const[i,k]=v[Math.floor(Math.random()*v.length)];board[i][k]=Math.random()<.9?2:4;}
  function render(){
    a.innerHTML='<div class="jogo-score"><strong id="sc">'+sc+'</strong><span>pontos</span></div>'+
      '<div style="background:#BBADA0;border-radius:12px;padding:9px;display:grid;grid-template-columns:repeat(4,1fr);gap:7px;max-width:300px;margin:0 auto 13px">'+
        board.map(r=>r.map(v=>'<div style="aspect-ratio:1;border-radius:7px;display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:'+(v>999?'.95rem':v>99?'1.1rem':'1.3rem')+';font-weight:700;background:'+(v?cores[v]||'#3C3A32':'#CDC1B4')+';color:'+(v>4?'#f9f6f2':'#776E65')+'">'+(v||'')+'</div>').join('')).join('')+
      '</div>'+
      '<div style="text-align:center;margin-bottom:13px"><button class="btn-jogo" onclick="re2048()">🔄 Reiniciar</button></div>'+
      '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  }
  function mover(d){
    let mv=false;
    const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]));
    const rev=m=>m.map(r=>[...r].reverse());
    let b=board.map(r=>[...r]);
    if(d==='up')b=rot(b);if(d==='down')b=rev(rot(b));if(d==='right')b=b.map(r=>[...r].reverse());
    b=b.map(row=>{const f=row.filter(v=>v);for(let i=0;i<f.length-1;i++){if(f[i]===f[i+1]){f[i]*=2;sc+=f[i];f.splice(i+1,1);mv=true;}}const n=[...f,...Array(4-f.length).fill(0)];if(JSON.stringify(n)!==JSON.stringify(row))mv=true;return n;});
    if(d==='up')b=rot(rot(rot(b)));if(d==='down')b=rot(rev(b));if(d==='right')b=b.map(r=>[...r].reverse());
    if(mv){board=b;addTile();render();document.getElementById('sc').textContent=sc;if(board.some(r=>r.some(v=>v===2048))){addPts(j,500);toast('🏆 2048! +500 pts!');}}
  }
  function init(){board=Array(4).fill(null).map(()=>Array(4).fill(0));sc=0;addTile();addTile();render();}
  window.re2048=init;
  document.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();mover('up');}if(e.key==='ArrowDown'){e.preventDefault();mover('down');}if(e.key==='ArrowLeft'){e.preventDefault();mover('left');}if(e.key==='ArrowRight'){e.preventDefault();mover('right');}});
  let tx=0,ty=0;
  document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;});
  document.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy))mover(dx>0?'right':'left');else mover(dy>0?'down':'up');});
  init();
}

// ── EM BREVE ──
function jogoEmBreve(a, j) {
  a.innerHTML='<div style="text-align:center;padding:36px 16px">'+
    '<div style="font-size:3.5rem;margin-bottom:14px">'+j.emoji+'</div>'+
    '<h3 style="font-family:Fredoka,sans-serif;font-size:1.5rem;margin-bottom:7px">'+j.nome+'</h3>'+
    '<p style="color:var(--muted);margin-bottom:20px;font-size:.88rem">Este jogo está em desenvolvimento!</p>'+
    '<div style="background:var(--bg);border-radius:14px;padding:16px;margin-bottom:13px">'+
      '<p style="font-weight:800;color:var(--az);font-size:.95rem">Recompensa futura: +'+j.pts+' pts</p>'+
    '</div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div>'+rkJogo(j.id)+'</div></div>'+
  '</div>';
}

// ── TETRIS ──
function jogoTetris(a, j) {
  const W=200,H=400,SZ=20,C=10,R=20;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>pontos</span></div>'+
    '<div style="display:flex;gap:10px;align-items:flex-start;justify-content:center">'+
    '<div class="jogo-canvas-wrap" style="margin:0"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:flex;flex-direction:column;gap:7px">'+
      '<button class="btn-jogo" onclick="tStart()" style="padding:7px 12px;font-size:.78rem">▶ Start</button>'+
      '<button class="btn-jogo" onclick="tRot()" style="padding:7px 12px;font-size:.78rem">🔄 Girar</button>'+
      '<button class="btn-jogo" onclick="tDir(-1)" style="padding:7px 12px;font-size:.78rem">◀ Esq</button>'+
      '<button class="btn-jogo" onclick="tDir(1)" style="padding:7px 12px;font-size:.78rem">Dir ▶</button>'+
      '<button class="btn-jogo peri" onclick="tDrop()" style="padding:7px 12px;font-size:.78rem">▼ Drop</button>'+
    '</div></div>'+
    '<div class="jogo-rank" style="margin-top:11px"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  const PS=[[[1,1,1,1]],[[1,1],[1,1]],[[1,1,1],[0,1,0]],[[1,1,1],[1,0,0]],[[1,1,1],[0,0,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
  const CS=['#FF4757','#FFD93D','#C77DFF','#FF6B35','#4D96FF','#6BCB77','#FF6EB4'];
  let board,p,px,py,sc,iv,on=false;
  const nb=()=>Array(R).fill(null).map(()=>Array(C).fill(0));
  const np=()=>{const i=Math.floor(Math.random()*7);return{s:PS[i].map(r=>[...r]),c:CS[i]};};
  const ok=(pp,x,y)=>pp.s.every((r,dy)=>r.every((v,dx)=>!v||(y+dy<R&&x+dx>=0&&x+dx<C&&!board[y+dy][x+dx])));
  function draw(){
    ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,.04)';ctx.lineWidth=1;
    for(let x=0;x<=W;x+=SZ){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<=H;y+=SZ){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    board.forEach((r,y)=>r.forEach((v,x)=>{if(v){ctx.fillStyle=v;ctx.fillRect(x*SZ+1,y*SZ+1,SZ-2,SZ-2);}}));
    if(p)p.s.forEach((r,dy)=>r.forEach((v,dx)=>{if(v){ctx.fillStyle=p.c;ctx.fillRect((px+dx)*SZ+1,(py+dy)*SZ+1,SZ-2,SZ-2);}}));
  }
  function fix(){p.s.forEach((r,dy)=>r.forEach((v,dx)=>{if(v)board[py+dy][px+dx]=p.c;}));}
  function clear(){for(let y=R-1;y>=0;y--){if(board[y].every(v=>v)){board.splice(y,1);board.unshift(Array(C).fill(0));sc+=100;y++;}}}
  function loop(){
    if(!on)return;
    if(ok(p,px,py+1)){py++;}else{fix();clear();p=np();px=Math.floor(C/2)-1;py=0;
      if(!ok(p,px,py)){on=false;clearInterval(iv);addPts(j,sc);document.getElementById('rk').innerHTML=rkJogo(j.id);
        ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';
        ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('Game Over! +'+sc,W/2,H/2);return;}}
    document.getElementById('sc').textContent=sc;draw();
  }
  window.tStart=()=>{clearInterval(iv);board=nb();p=np();px=4;py=0;sc=0;on=true;document.getElementById('sc').textContent=0;iv=setInterval(loop,480);draw();};
  window.tDir=d=>{if(on&&ok(p,px+d,py)){px+=d;draw();}};
  window.tRot=()=>{if(!on)return;const r=p.s[0].map((_,i)=>p.s.map(row=>row[i]).reverse());const o=p.s;p.s=r;if(!ok(p,px,py))p.s=o;draw();};
  window.tDrop=()=>{if(!on)return;while(ok(p,px,py+1))py++;loop();};
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')tDir(-1);if(e.key==='ArrowRight')tDir(1);if(e.key==='ArrowUp')tRot();if(e.key==='ArrowDown'){e.preventDefault();tDrop();}});
  ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);ctx.fillStyle='#4D96FF';ctx.font='bold 19px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🟦 Pressione Start',W/2,H/2);
}

// ── NAVE ESPACIAL ──
function jogoNaveesp(a, j) {
  const W=300,H=420;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>inimigos destruídos</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:flex;gap:8px;justify-content:center;margin:8px 0">'+
      '<button class="btn-jogo" onpointerdown="nvDir(-1)" onpointerup="nvDir(0)" style="flex:1;max-width:75px;padding:10px">◀</button>'+
      '<button class="btn-jogo verde" onclick="nvStart()">▶ Start</button>'+
      '<button class="btn-jogo peri" onclick="nvFire()">🔫 Atirar</button>'+
      '<button class="btn-jogo" onpointerdown="nvDir(1)" onpointerup="nvDir(0)" style="flex:1;max-width:75px;padding:10px">▶</button>'+
    '</div>'+
    '<p style="text-align:center;font-size:.72rem;color:var(--muted);margin-bottom:10px">Toque na tela para atirar</p>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let nave,balas,inimigos,sc,vidas,raf,on=false,dir=0,tick=0,stars=[];
  for(let i=0;i<40;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2});
  function draw(){
    ctx.fillStyle='#060B14';ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{ctx.fillStyle='rgba(255,255,255,'+(0.3+s.s/4)+')';ctx.fillRect(s.x,(s.y+tick)%H,s.s<1?1:2,s.s<1?1:2);});
    ctx.font='28px serif';ctx.textAlign='center';
    inimigos.forEach(e=>ctx.fillText('👾',e.x,e.y));
    ctx.fillStyle='#FFD93D';
    balas.forEach(b=>{ctx.fillRect(b.x-2,b.y,4,10);});
    ctx.font='36px serif';ctx.fillText('🚀',nave.x,H-20);
    ctx.fillStyle='#FF4757';ctx.font='bold 13px Nunito,sans-serif';ctx.textAlign='left';
    ctx.fillText('❤️'.repeat(Math.max(0,vidas))+' '+sc+' kills',7,18);
  }
  function loop(){
    if(!on)return;tick++;
    nave.x=Math.max(20,Math.min(W-20,nave.x+dir*5));
    balas.forEach(b=>b.y-=9);balas=balas.filter(b=>b.y>-10);
    inimigos.forEach(e=>{e.y+=e.vel;e.x+=Math.sin(tick/20+e.fase)*1.5;});
    if(tick%55===0)inimigos.push({x:20+Math.random()*(W-40),y:-30,vel:.8+Math.random()*1.2,fase:Math.random()*6});
    // colisões
    for(let bi=balas.length-1;bi>=0;bi--){
      for(let ei=inimigos.length-1;ei>=0;ei--){
        if(Math.abs(balas[bi].x-inimigos[ei].x)<22&&Math.abs(balas[bi].y-inimigos[ei].y)<22){
          balas.splice(bi,1);inimigos.splice(ei,1);sc++;document.getElementById('sc').textContent=sc;break;
        }
      }
    }
    for(let ei=inimigos.length-1;ei>=0;ei--){
      if(inimigos[ei].y>H){inimigos.splice(ei,1);vidas--;
        if(vidas<=0){on=false;const g=sc*10;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);
          ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';
          ctx.font='bold 24px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 '+sc+' kills | +'+g+' pts',W/2,H/2);return;}
      }
    }
    draw();if(on)raf=requestAnimationFrame(loop);
  }
  window.nvStart=()=>{cancelAnimationFrame(raf);nave={x:W/2};balas=[];inimigos=[];sc=0;vidas=3;on=true;tick=0;document.getElementById('sc').textContent=0;loop();};
  window.nvDir=d=>dir=d;
  window.nvFire=()=>{if(on)balas.push({x:nave.x,y:H-50});};
  cv.addEventListener('click',()=>nvFire());
  cv.addEventListener('touchstart',e=>{e.preventDefault();nvFire();},{passive:false});
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')dir=-1;if(e.key==='ArrowRight')dir=1;if(e.key===' '){e.preventDefault();nvFire();}});
  document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')dir=0;});
  ctx.fillStyle='#060B14';ctx.fillRect(0,0,W,H);ctx.fillStyle='#4D96FF';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('👾 Pressione Start',W/2,H/2);
}

// ── WORDLE PT ──
function jogoWordle(a, j) {
  const PALS=['GRATO','PEDRA','CHUVA','BRISA','CAMPO','PRAIA','CLUBE','PORTA','LIVRO','FUNDO','CLARO','MARCA','FESTA','MUNDO','PLANO','BANCO','LENHA','TORTA','VENTO','PRETO','FILHO','PODER','REINO','GANHA','SALVO','FLOCO','TOQUE','MILHO','NOBRE','CURSO'];
  let alvo,tent,cur,ganhou,perdeu;
  function novo(){alvo=PALS[Math.floor(Math.random()*PALS.length)];tent=[];cur='';ganhou=false;perdeu=false;render();}
  function cor(t,i){const l=t[i];if(alvo[i]===l)return'#6BCB77';if(alvo.includes(l))return'#FFD93D';return'#555';}
  function render(){
    const rows=tent.map(t=>'<div style="display:flex;gap:4px;justify-content:center;margin-bottom:4px">'+t.split('').map((l,i)=>'<div style="width:40px;height:40px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:1.2rem;font-weight:700;background:'+cor(t,i)+';color:#fff">'+l+'</div>').join('')+'</div>').join('');
    const cur_row=!ganhou&&!perdeu?'<div style="display:flex;gap:4px;justify-content:center;margin-bottom:4px">'+Array(5).fill(0).map((_,i)=>{const l=cur[i]||'';return'<div style="width:40px;height:40px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:1.2rem;font-weight:700;background:'+(l?'var(--az)':'var(--bg)')+';border:2px solid '+(l?'var(--az)':'var(--borda)')+';color:#fff">'+l+'</div>';}).join('')+'</div>':'';
    const vazias=!ganhou&&!perdeu?Array(Math.max(0,5-tent.length)).fill('<div style="display:flex;gap:4px;justify-content:center;margin-bottom:4px">'+Array(5).fill('<div style="width:40px;height:40px;border-radius:7px;background:var(--bg);border:2px solid var(--borda)"></div>').join('')+'</div>').join(''):'';
    // teclado
    const lUsadas={};tent.forEach(t=>t.split('').forEach((l,i)=>{if(alvo[i]===l)lUsadas[l]='ok';else if(alvo.includes(l)&&lUsadas[l]!=='ok')lUsadas[l]='meio';else if(!lUsadas[l])lUsadas[l]='nao';}));
    const tecBg={ok:'#6BCB77',meio:'#FFD93D',nao:'#555'};
    const tec=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map(row=>'<div style="display:flex;gap:4px;justify-content:center;margin-bottom:4px">'+row.split('').map(l=>'<button onclick="wTec(\''+l+'\')" style="width:28px;height:36px;border-radius:6px;font-weight:700;font-size:.72rem;border:none;cursor:pointer;background:'+(lUsadas[l]?tecBg[lUsadas[l]]:'var(--bg)')+';color:'+(lUsadas[l]&&lUsadas[l]!=='nao'?'#fff':'var(--texto)')+'">'+l+'</button>').join('')+'</div>').join('');
    a.innerHTML='<div class="jogo-score"><strong>'+(6-tent.length)+'</strong><span>tentativas restantes</span></div>'+
      '<div style="margin-bottom:10px">'+rows+cur_row+vazias+'</div>'+
      (ganhou?'<div style="text-align:center;color:var(--v);font-weight:800;margin-bottom:10px">🎉 Acertou em '+(tent.length)+'! +'+Math.max(50,200-tent.length*30)+' pts</div>':'')+
      (perdeu?'<div style="text-align:center;color:var(--r);font-weight:800;margin-bottom:10px">😢 Era: <strong>'+alvo+'</strong></div>':'')+
      (ganhou||perdeu?'<div style="text-align:center;margin-bottom:10px"><button class="btn-jogo" onclick="wNovo()">🔄 Nova palavra</button></div>':
        tec+'<div style="display:flex;gap:6px;justify-content:center;margin-top:6px"><button class="btn-jogo peri" onclick="wDel()" style="padding:8px 16px">⌫</button><button class="btn-jogo verde" onclick="wEnter()" style="padding:8px 16px">ENTER</button></div>')+
      '<div class="jogo-rank" style="margin-top:11px"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  }
  window.wTec=l=>{if(cur.length<5&&!ganhou&&!perdeu){cur+=l;render();}};
  window.wDel=()=>{if(!ganhou&&!perdeu){cur=cur.slice(0,-1);render();}};
  window.wEnter=()=>{
    if(cur.length<5){toast('⚠️ Digite 5 letras!');return;}
    tent.push(cur);
    if(cur===alvo){ganhou=true;const g=Math.max(50,200-tent.length*30);addPts(j,g);render();const rk=document.getElementById('rk');if(rk)rk.innerHTML=rkJogo(j.id);}
    else if(tent.length>=6){perdeu=true;render();}
    else{cur='';render();}
  };
  window.wNovo=novo;
  document.addEventListener('keydown',e=>{
    if(e.key==='Enter')wEnter();
    else if(e.key==='Backspace')wDel();
    else if(/^[a-zA-Z]$/.test(e.key))wTec(e.key.toUpperCase());
  });
  novo();
}

// ── PIANO TILES ──
function jogoPiano(a, j) {
  const W=280,H=400,COLS=4;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>notas | <span id="tm">60</span>s</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo" onclick="pianoStart()">▶ Iniciar</button></div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  const CW=W/COLS,TH=90;
  let tiles,sc,vidas,tempo,iv,raf,on=false,speed=3;
  function novoTile(){return{col:Math.floor(Math.random()*COLS),y:-TH,hit:false};}
  function draw(){
    ctx.fillStyle='#F8F9FA';ctx.fillRect(0,0,W,H);
    for(let i=1;i<COLS;i++){ctx.fillStyle='#ddd';ctx.fillRect(i*CW,0,1,H);}
    tiles.forEach(t=>{
      if(t.hit)return;
      ctx.fillStyle='#1A1A2E';ctx.fillRect(t.col*CW+2,t.y,CW-4,TH-4);
      ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(t.col*CW+2,t.y,CW-4,20);
    });
    ctx.fillStyle='rgba(255,180,0,.15)';ctx.fillRect(0,H-TH,W,TH);
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,28);
    ctx.fillStyle='#fff';ctx.font='bold 13px Nunito,sans-serif';ctx.textAlign='center';
    ctx.fillText('❤️'.repeat(Math.max(0,vidas))+' Score: '+sc,W/2,18);
  }
  function loop(){
    if(!on)return;
    tiles.forEach(t=>t.y+=speed);
    // tile passou sem clicar
    tiles.forEach((t,i)=>{if(!t.hit&&t.y>H){tiles.splice(i,1);vidas--;if(vidas<=0){fim();return;}}});
    if(tiles.length<4&&Math.random()<.04)tiles.push(novoTile());
    draw();raf=requestAnimationFrame(loop);
  }
  function fim(){on=false;const g=sc*8;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 24px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🎹 '+sc+' notas! +'+g+' pts',W/2,H/2);}
  function click(e){
    if(!on)return;
    const rect=cv.getBoundingClientRect();
    const cx=(e.clientX||e.touches[0].clientX)-rect.left;
    const cy=(e.clientY||e.touches[0].clientY)-rect.top;
    const col=Math.floor(cx/(rect.width/COLS));
    let acertou=false;
    tiles.forEach(t=>{if(!t.hit&&t.col===col&&cy>t.y&&cy<t.y+TH){t.hit=true;acertou=true;}});
    if(acertou){sc++;document.getElementById('sc').textContent=sc;speed=3+sc/30;}
    else{vidas--;if(vidas<=0)fim();}
  }
  cv.addEventListener('click',click);
  cv.addEventListener('touchstart',e=>{e.preventDefault();click(e);},{passive:false});
  window.pianoStart=()=>{cancelAnimationFrame(raf);tiles=[];sc=0;vidas=3;tempo=60;speed=3;on=true;document.getElementById('sc').textContent=0;
    clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);fim();}},1000);
    loop();};
  draw();
}

// ── ASTEROIDES ──
function jogoAsteroids(a, j) {
  const W=320,H=380;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>asteroides destruídos</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:flex;gap:7px;justify-content:center;margin:8px 0;flex-wrap:wrap">'+
      '<button class="btn-jogo" onpointerdown="astDir(-1)" onpointerup="astDir(0)" style="padding:9px 14px">◀</button>'+
      '<button class="btn-jogo verde" onclick="astStart()">▶ Start</button>'+
      '<button class="btn-jogo peri" onclick="astFire()">🔫</button>'+
      '<button class="btn-jogo" onpointerdown="astDir(1)" onpointerup="astDir(0)" style="padding:9px 14px">▶</button>'+
    '</div>'+
    '<p style="text-align:center;font-size:.72rem;color:var(--muted);margin-bottom:10px">Toque na tela para atirar</p>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let nave,balas,asts,sc,raf,on=false,dir=0,tick=0;
  function novoAst(){return{x:Math.random()<.5?-30:W+30,y:Math.random()*H,vx:(Math.random()-.5)*2.5,vy:(Math.random()-.5)*2.5,r:15+Math.random()*20};}
  function draw(){
    ctx.fillStyle='#0D1117';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,.3)';
    for(let i=0;i<20;i++)ctx.fillRect((i*97)%W,(i*61+tick/3)%H,1,1);
    balas.forEach(b=>{ctx.fillStyle='#FFD93D';ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();});
    asts.forEach(a=>{ctx.strokeStyle='#aaa';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(150,150,150,.2)';ctx.fill();});
    ctx.font='28px serif';ctx.textAlign='center';ctx.fillText('🚀',nave.x,nave.y);
    ctx.fillStyle='#fff';ctx.font='bold 13px Nunito,sans-serif';ctx.textAlign='left';ctx.fillText('Score: '+sc,7,18);
  }
  function loop(){
    if(!on)return;tick++;
    nave.x=Math.max(20,Math.min(W-20,nave.x+dir*5));
    balas.forEach(b=>{b.x+=b.vx;b.y+=b.vy;});
    balas=balas.filter(b=>b.x>-10&&b.x<W+10&&b.y>-10&&b.y<H+10);
    asts.forEach(a=>{a.x+=a.vx;a.y+=a.vy;if(a.x<-50)a.x=W+50;if(a.x>W+50)a.x=-50;if(a.y<-50)a.y=H+50;if(a.y>H+50)a.y=-50;});
    if(tick%80===0)asts.push(novoAst());
    // bala-ast
    for(let bi=balas.length-1;bi>=0;bi--){
      for(let ai=asts.length-1;ai>=0;ai--){
        if(Math.hypot(balas[bi].x-asts[ai].x,balas[bi].y-asts[ai].y)<asts[ai].r){
          balas.splice(bi,1);sc++;document.getElementById('sc').textContent=sc;
          if(asts[ai].r>20)asts.push({x:asts[ai].x,y:asts[ai].y,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,r:asts[ai].r/2});
          asts.splice(ai,1);break;
        }
      }
    }
    // colisão nave-ast
    if(asts.some(a=>Math.hypot(nave.x-a.x,nave.y-a.y)<a.r+14)){
      on=false;const g=sc*12;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);
      ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';
      ctx.font='bold 24px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💥 '+sc+' destruídos! +'+g,W/2,H/2);return;
    }
    draw();if(on)raf=requestAnimationFrame(loop);
  }
  window.astStart=()=>{cancelAnimationFrame(raf);nave={x:W/2,y:H/2};balas=[];asts=[novoAst(),novoAst(),novoAst()];sc=0;on=true;tick=0;document.getElementById('sc').textContent=0;loop();};
  window.astDir=d=>dir=d;
  window.astFire=()=>{if(on)balas.push({x:nave.x,y:nave.y-16,vx:0,vy:-9});};
  cv.addEventListener('click',()=>astFire());
  cv.addEventListener('touchstart',e=>{e.preventDefault();astFire();},{passive:false});
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')dir=-1;if(e.key==='ArrowRight')dir=1;if(e.key===' '){e.preventDefault();astFire();}});
  document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')dir=0;});
  ctx.fillStyle='#0D1117';ctx.fillRect(0,0,W,H);ctx.fillStyle='#4D96FF';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🚀 Pressione Start',W/2,H/2);
}

// ── LABIRINTO ──
function jogoLabirinto(a, j) {
  const SZ=24,COLS=13,ROWS=13,W=COLS*SZ,H=ROWS*SZ;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>labirintos completados</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,44px);gap:6px;justify-content:center;margin:10px auto">'+
      '<div></div><button class="btn-jogo" onclick="lbMove(0,-1)" style="padding:8px">▲</button><div></div>'+
      '<button class="btn-jogo" onclick="lbMove(-1,0)" style="padding:8px">◀</button>'+
      '<button class="btn-jogo verde" onclick="lbNovo()">GO</button>'+
      '<button class="btn-jogo" onclick="lbMove(1,0)" style="padding:8px">▶</button>'+
      '<div></div><button class="btn-jogo" onclick="lbMove(0,1)" style="padding:8px">▼</button><div></div>'+
    '</div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let grid,px,py,sc=0,on=false;
  function gerarLabirinto(){
    // DFS maze generation
    const g=Array(ROWS).fill(null).map(()=>Array(COLS).fill(1));
    const visita=(x,y)=>{
      g[y][x]=0;
      const dirs=[[0,-2],[0,2],[-2,0],[2,0]].sort(()=>Math.random()-.5);
      dirs.forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx>0&&nx<COLS-1&&ny>0&&ny<ROWS-1&&g[ny][nx]===1){g[y+dy/2][x+dx/2]=0;visita(nx,ny);}});
    };
    visita(1,1);g[1][1]=0;g[ROWS-2][COLS-2]=0;return g;
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    grid.forEach((row,y)=>row.forEach((v,x)=>{ctx.fillStyle=v?'#1A1A2E':'#F0F4FF';ctx.fillRect(x*SZ,y*SZ,SZ,SZ);}));
    // saída
    ctx.fillStyle='#6BCB77';ctx.fillRect((COLS-2)*SZ+4,(ROWS-2)*SZ+4,SZ-8,SZ-8);
    ctx.font='18px serif';ctx.textAlign='center';ctx.fillText('🚩',(COLS-2)*SZ+SZ/2,(ROWS-2)*SZ+SZ-2);
    // jogador
    ctx.fillText('🔵',px*SZ+SZ/2,py*SZ+SZ-2);
  }
  window.lbNovo=()=>{grid=gerarLabirinto();px=1;py=1;on=true;draw();};
  window.lbMove=(dx,dy)=>{
    if(!on)return;const nx=px+dx,ny=py+dy;
    if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&grid[ny][nx]===0){px=nx;py=ny;}
    if(px===COLS-2&&py===ROWS-2){sc++;document.getElementById('sc').textContent=sc;addPts(j,50);document.getElementById('rk').innerHTML=rkJogo(j.id);toast('🏁 Saída! +50 pts!');setTimeout(lbNovo,600);}
    draw();
  };
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')lbMove(-1,0);if(e.key==='ArrowRight')lbMove(1,0);if(e.key==='ArrowUp')lbMove(0,-1);if(e.key==='ArrowDown')lbMove(0,1);});
  // swipe
  let tx=0,ty=0;
  cv.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;});
  cv.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy))lbMove(dx>0?1:-1,0);else lbMove(0,dy>0?1:-1);});
  lbNovo();
}

// ── PLATAFORMA JUMP ──
function jogoPlataforma(a, j) {
  const W=320,H=420;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>altura (m)</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:flex;gap:10px;justify-content:center;margin:8px 0">'+
      '<button class="btn-jogo" onpointerdown="plDir(-1)" onpointerup="plDir(0)" style="flex:1;max-width:100px;padding:12px">◀</button>'+
      '<button class="btn-jogo verde" onclick="plStart()">▶ Start</button>'+
      '<button class="btn-jogo" onpointerdown="plDir(1)" onpointerup="plDir(0)" style="flex:1;max-width:100px;padding:12px">▶</button>'+
    '</div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let player,plats,sc,camY,raf,on=false,dir=0;
  function novasPlats(yBase){
    const ps=[];for(let i=0;i<8;i++)ps.push({x:20+Math.random()*(W-80),y:yBase-i*70,w:70+Math.random()*50});
    return ps;
  }
  function draw(){
    ctx.fillStyle='#E8F4FD';ctx.fillRect(0,0,W,H);
    plats.forEach(p=>{ctx.fillStyle='#6BCB77';ctx.fillRect(p.x,p.y-camY,p.w,14);ctx.fillStyle='#4DA85A';ctx.fillRect(p.x,p.y-camY,p.w,5);});
    ctx.font='28px serif';ctx.textAlign='center';ctx.fillText('🦘',player.x,player.y-camY+10);
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,26);
    ctx.fillStyle='#fff';ctx.font='bold 13px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText(sc+'m',W/2,18);
  }
  function loop(){
    if(!on)return;
    player.x+=dir*5;player.x=((player.x%W)+W)%W;
    player.vy+=.5;player.y+=player.vy;
    // plataformas
    if(player.vy>0){
      plats.forEach(p=>{if(player.x+10>p.x&&player.x-10<p.x+p.w&&Math.abs((player.y+10)-(p.y))<12){player.vy=-13;}});
    }
    // câmera
    const mid=camY+H/2;if(player.y<mid){camY-=(mid-player.y)*.08;const altura=Math.floor(-camY/10);if(altura>sc){sc=altura;document.getElementById('sc').textContent=sc;}}
    // mais plataformas
    if(plats[0].y-camY>100)plats.shift();
    if(plats[plats.length-1].y>camY-H)plats.push({x:20+Math.random()*(W-80),y:plats[plats.length-1].y-70,w:70+Math.random()*50});
    // morte
    if(player.y-camY>H+50){on=false;const g=Math.floor(sc*2);addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 24px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 '+sc+'m | +'+g+' pts',W/2,H/2);return;}
    draw();if(on)raf=requestAnimationFrame(loop);
  }
  window.plStart=()=>{cancelAnimationFrame(raf);camY=0;plats=novasPlats(H);player={x:W/2,y:H-80,vy:-13};sc=0;on=true;document.getElementById('sc').textContent=0;loop();};
  window.plDir=d=>dir=d;
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')dir=-1;if(e.key==='ArrowRight')dir=1;});
  document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')dir=0;});
  ctx.fillStyle='#E8F4FD';ctx.fillRect(0,0,W,H);ctx.fillStyle='#333';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🦘 Pressione Start',W/2,H/2);
}

// ── MINHOCA GULOSA ──
function jogoMinhoca(a, j) {
  // Extended snake with growing faster and stars
  const W=300,H=300,SZ=20;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>comidas</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,44px);gap:6px;justify-content:center;margin:10px auto">'+
      '<div></div><button class="btn-jogo" onclick="mDir(0,-1)" style="padding:8px">▲</button><div></div>'+
      '<button class="btn-jogo" onclick="mDir(-1,0)" style="padding:8px">◀</button>'+
      '<button class="btn-jogo verde" onclick="mStart()">GO</button>'+
      '<button class="btn-jogo" onclick="mDir(1,0)" style="padding:8px">▶</button>'+
      '<div></div><button class="btn-jogo" onclick="mDir(0,1)" style="padding:8px">▼</button><div></div>'+
    '</div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  const COMIDAS=['🍎','🍌','⭐','🍇','🍓'];
  let snake,dir,food,ftype,sc,iv,on=false;
  const C=W/SZ,R=H/SZ;
  function novaComida(){food={x:Math.floor(Math.random()*C)*SZ,y:Math.floor(Math.random()*R)*SZ};ftype=COMIDAS[Math.floor(Math.random()*COMIDAS.length)];}
  function draw(){
    ctx.fillStyle='#1A2634';ctx.fillRect(0,0,W,H);
    snake.forEach((s,i)=>{
      const t=1-i/snake.length;ctx.fillStyle=`hsl(${120+i*5},70%,${40+t*20}%)`;
      ctx.beginPath();ctx.arc(s.x+SZ/2,s.y+SZ/2,SZ/2-1,0,Math.PI*2);ctx.fill();
    });
    ctx.font=SZ+'px serif';ctx.textAlign='center';ctx.fillText(ftype,food.x+SZ/2,food.y+SZ-2);
    ctx.fillStyle='#fff';ctx.font='bold 13px Nunito,sans-serif';ctx.textAlign='left';ctx.fillText(sc,7,18);
  }
  function loop(){
    const h={x:snake[0].x+dir.x*SZ,y:snake[0].y+dir.y*SZ};
    if(h.x<0||h.x>=W||h.y<0||h.y>=H||snake.some(s=>s.x===h.x&&s.y===h.y)){
      clearInterval(iv);on=false;const g=sc*20;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);
      ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';
      ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 '+sc+' comidas | +'+g,W/2,H/2);return;
    }
    snake.unshift(h);
    if(h.x===food.x&&h.y===food.y){sc++;document.getElementById('sc').textContent=sc;novaComida();clearInterval(iv);iv=setInterval(loop,Math.max(80,150-sc*4));}
    else snake.pop();
    draw();
  }
  window.mStart=()=>{clearInterval(iv);snake=[{x:140,y:140},{x:120,y:140}];dir={x:1,y:0};sc=0;on=true;document.getElementById('sc').textContent=0;novaComida();draw();iv=setInterval(loop,150);};
  window.mDir=(x,y)=>{if(!on)return;if(x!==0&&dir.x===0)dir={x,y};if(y!==0&&dir.y===0)dir={x,y};};
  document.addEventListener('keydown',e=>{if(e.key==='ArrowUp')mDir(0,-1);if(e.key==='ArrowDown')mDir(0,1);if(e.key==='ArrowLeft')mDir(-1,0);if(e.key==='ArrowRight')mDir(1,0);});
  ctx.fillStyle='#1A2634';ctx.fillRect(0,0,W,H);ctx.fillStyle='#6BCB77';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🪱 Pressione GO',W/2,H/2);
}

// ── PING PONG (2 raquetes no celular) ──
function jogoPingpong(a, j) {
  const W=320,H=240;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>× <span id="scia">0</span> (você × IA)</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="text-align:center;margin-bottom:8px"><button class="btn-jogo verde" onclick="ppStart()">▶ Iniciar</button></div>'+
    '<p style="text-align:center;font-size:.72rem;color:var(--muted);margin-bottom:10px">Deslize o dedo/mouse para mover</p>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let bola,p1,ia,pts,raf,on=false;
  const PH=50,PW=10;
  function draw(){
    ctx.fillStyle='#0A2342';ctx.fillRect(0,0,W,H);
    ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
    // p1 azul
    const grad1=ctx.createLinearGradient(0,p1,PW,p1+PH);grad1.addColorStop(0,'#4D96FF');grad1.addColorStop(1,'#7EC8E3');
    ctx.fillStyle=grad1;ctx.beginPath();ctx.roundRect(0,p1,PW,PH,5);ctx.fill();
    // ia vermelha
    const grad2=ctx.createLinearGradient(W-PW,ia,W,ia+PH);grad2.addColorStop(0,'#FF6EB4');grad2.addColorStop(1,'#FF4757');
    ctx.fillStyle=grad2;ctx.beginPath();ctx.roundRect(W-PW,ia,PW,PH,5);ctx.fill();
    // bola com brilho
    const gBola=ctx.createRadialGradient(bola.x-2,bola.y-2,1,bola.x,bola.y,8);gBola.addColorStop(0,'#fff');gBola.addColorStop(1,'#FFD93D');
    ctx.fillStyle=gBola;ctx.beginPath();ctx.arc(bola.x,bola.y,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText(pts.p+' : '+pts.ia,W/2,20);
  }
  function reset(){bola={x:W/2,y:H/2,vx:(Math.random()<.5?1:-1)*4.5,vy:(Math.random()-.5)*5};}
  function loop(){
    if(!on)return;bola.x+=bola.vx;bola.y+=bola.vy;
    if(bola.y<8||bola.y>H-8)bola.vy*=-1;
    if(bola.x<PW+8&&bola.y>p1&&bola.y<p1+PH){bola.vx=Math.abs(bola.vx)+.1;bola.vy+=(Math.random()-.5)*2;}
    if(bola.x>W-PW-8&&bola.y>ia&&bola.y<ia+PH){bola.vx=-(Math.abs(bola.vx)+.1);}
    ia+=(bola.y-ia-PH/2)*.09;ia=Math.max(0,Math.min(H-PH,ia));
    if(bola.x<0){pts.ia++;document.getElementById('scia').textContent=pts.ia;reset();}
    if(bola.x>W){pts.p++;document.getElementById('sc').textContent=pts.p;reset();}
    if(pts.p>=7||pts.ia>=7){on=false;const g=pts.p*20;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText(pts.p>pts.ia?'🏆 Você venceu!':'😅 IA venceu!',W/2,H/2);return;}
    draw();raf=requestAnimationFrame(loop);
  }
  cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();p1=Math.max(0,Math.min(H-PH,(e.clientY-r.top)*(H/r.height)-PH/2));});
  cv.addEventListener('touchmove',e=>{e.preventDefault();const r=cv.getBoundingClientRect();p1=Math.max(0,Math.min(H-PH,(e.touches[0].clientY-r.top)*(H/r.height)-PH/2));},{passive:false});
  window.ppStart=()=>{cancelAnimationFrame(raf);pts={p:0,ia:0};p1=H/2-PH/2;ia=H/2-PH/2;on=true;reset();document.getElementById('sc').textContent=0;document.getElementById('scia').textContent=0;loop();};
  ctx.fillStyle='#0A2342';ctx.fillRect(0,0,W,H);ctx.fillStyle='#4D96FF';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🏸 Pressione Iniciar',W/2,H/2);
}

// ── QUEBRA-CABEÇA ──
function jogoQuebra(a, j) {
  const N=3,SZ=90,W=N*SZ,H=N*SZ;
  const EMOJIS=['🌈','🦁','🚀','🌸','⚽','🎮'];
  let board,vazio,sc=0,moves,on=false;
  function novoQuebra(){
    const em=EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
    board=Array(N*N).fill(0).map((_,i)=>i);board[N*N-1]=-1;
    for(let i=0;i<200;i++){const ns=vizinhos(board.indexOf(-1));const r=ns[Math.floor(Math.random()*ns.length)];const vi=board.indexOf(-1);board[vi]=board[r];board[r]=-1;}
    vazio=board.indexOf(-1);moves=0;on=true;render(em);
  }
  function vizinhos(i){const ns=[];const r=Math.floor(i/N),c=i%N;if(r>0)ns.push(i-N);if(r<N-1)ns.push(i+N);if(c>0)ns.push(i-1);if(c<N-1)ns.push(i+1);return ns;}
  const CORES=['#FF4757','#FF6B35','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF6EB4','#00CEC9','#E17055'];
  function render(em){
    a.innerHTML='<div class="jogo-score"><strong id="mv">'+moves+'</strong><span>movimentos</span></div>'+
      '<div style="display:grid;grid-template-columns:repeat('+N+','+SZ+'px);gap:4px;justify-content:center;margin:0 auto 13px;width:'+(N*SZ+(N-1)*4)+'px">'+
        board.map((v,i)=>{
          if(v===-1)return'<div style="width:'+SZ+'px;height:'+SZ+'px;border-radius:12px;background:var(--bg)"></div>';
          return'<div onclick="qClick('+i+')" style="width:'+SZ+'px;height:'+SZ+'px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:1.5rem;font-weight:700;background:'+CORES[v%CORES.length]+';color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:.15s">'+(v+1)+'</div>';
        }).join('')+
      '</div>'+
      '<div style="text-align:center;margin-bottom:11px"><button class="btn-jogo" onclick="qNovo()">🔄 Novo</button></div>'+
      '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  }
  window.qClick=idx=>{
    if(!on)return;
    if(vizinhos(vazio).includes(idx)){board[vazio]=board[idx];board[idx]=-1;vazio=idx;moves++;document.getElementById('mv').textContent=moves;
      // checar se ganhou
      if(board.every((v,i)=>i===N*N-1?v===-1:v===i)){on=false;const g=Math.max(50,300-moves*5);addPts(j,g);const rk=document.getElementById('rk');if(rk)rk.innerHTML=rkJogo(j.id);toast('🧩 Parabéns! +'+g+' pts!');}
      else render();
    }
  };
  window.qNovo=novoQuebra;
  novoQuebra();
}

// ── SPEED MATH (extreme) ──
function jogoSpeedmath(a, j) {
  let sc=0,tempo=20,iv,on=false,streak=0;
  function novaQ(){
    const ops=['+','-','×','÷'];const op=ops[Math.floor(Math.random()*4)];
    let x=Math.floor(Math.random()*15)+2,y=Math.floor(Math.random()*10)+2,res;
    if(op==='+')res=x+y;else if(op==='-')res=x>y?x-y:y-x,x=Math.max(x,y),y=Math.min(x,y);
    else if(op==='×')res=x*y;
    else{res=x;x=res*y;}
    const err=res+(Math.random()<.5?-(1+Math.floor(Math.random()*9)):(1+Math.floor(Math.random()*9)));
    const opts=Math.random()<.5?[res,err]:[err,res];
    return{q:`${x} ${op} ${y} = ?`,res,opts};
  }
  let q=novaQ();
  function render(){
    a.innerHTML='<div class="jogo-score"><strong id="sc">'+sc+'</strong><span>pontos | <span id="tm">'+tempo+'</span>s | combo: <span id="str">'+streak+'</span>x</span></div>'+
      '<div style="background:linear-gradient(135deg,#6C3483,#9B59B6);border-radius:14px;padding:24px;text-align:center;margin-bottom:13px">'+
        '<div style="font-family:Fredoka,sans-serif;font-size:2.2rem;color:#fff;margin-bottom:16px">'+q.q+'</div>'+
        '<div style="display:flex;gap:14px;justify-content:center">'+
          q.opts.map(o=>'<button class="btn-jogo" style="min-width:80px;font-size:1.3rem;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.4)" onclick="smResp('+o+')">'+o+'</button>').join('')+
        '</div>'+
      '</div>'+
      '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>'+
      (!on?'<div style="text-align:center"><button class="btn-jogo" onclick="smStart()">▶ Iniciar</button></div>':'');
  }
  window.smResp=r=>{if(!on)return;if(r===q.res){streak++;const bonus=10+streak*5;sc+=bonus;toast('✅ +'+bonus+'!');}else{streak=0;sc=Math.max(0,sc-15);toast('❌ -15');}q=novaQ();render();document.getElementById('sc').textContent=sc;document.getElementById('str').textContent=streak;};
  window.smStart=()=>{sc=0;tempo=20;on=true;streak=0;q=novaQ();clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);on=false;addPts(j,sc);const rk=document.getElementById('rk');if(rk)rk.innerHTML=rkJogo(j.id);toast('🧮 +'+sc+' pts!');render();}},1000);render();};
  render();
}

// ── NINJA REFLEX (extreme) ──
function jogoNinja(a, j) {
  const W=300,H=340;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>cortes | <span id="tm">30</span>s</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo" onclick="ninjaStart()">▶ Iniciar</button></div>'+
    '<p style="text-align:center;font-size:.72rem;color:var(--muted);margin-bottom:10px">Deslize rápido sobre as frutas!</p>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  const FRUTS=['🍎','🍊','🍋','🍇','🍓','🍑','🍍','🥭'];
  const BOMBS=['💣'];
  let frutas,sc,vidas,tempo,iv,raf,on=false,trail=[];
  function novaFruta(){return{x:30+Math.random()*(W-60),y:H+30,vx:(Math.random()-.5)*4,vy:-(6+Math.random()*5),emoji:Math.random()<.15?'💣':FRUTS[Math.floor(Math.random()*FRUTS.length)],r:24,cortada:false};}
  function draw(){
    ctx.fillStyle='#1B2631';ctx.fillRect(0,0,W,H);
    // trail
    if(trail.length>1){ctx.strokeStyle='rgba(255,220,0,.6)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);trail.forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();}
    frutas.forEach(f=>{if(!f.cortada){ctx.font='40px serif';ctx.textAlign='center';ctx.fillText(f.emoji,f.x,f.y);}});
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,26);ctx.fillStyle='#fff';ctx.font='bold 13px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText('❤️'.repeat(Math.max(0,vidas))+' '+sc+' cortes',W/2,18);
  }
  function sliceAt(x,y){
    frutas.forEach(f=>{if(!f.cortada&&Math.hypot(x-f.x,y-f.y)<f.r){f.cortada=true;if(f.emoji==='💣'){vidas--;toast('💣 Bomba!');}else{sc++;document.getElementById('sc').textContent=sc;}}});
    if(vidas<=0)fim();
  }
  function fim(){on=false;const g=sc*16;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 24px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🥷 '+sc+' cortes! +'+g+' pts',W/2,H/2);}
  function loop(){
    if(!on)return;
    frutas.forEach(f=>{f.x+=f.vx;f.y+=f.vy;f.vy+=.35;});
    frutas=frutas.filter(f=>f.y<H+60);
    if(frutas.length<4&&Math.random()<.05)frutas.push(novaFruta());
    trail=trail.slice(-12);draw();if(on)raf=requestAnimationFrame(loop);
  }
  let dragging=false;
  const getPos=(e,r)=>({x:((e.clientX||e.touches[0].clientX)-r.left)*(W/r.width),y:((e.clientY||e.touches[0].clientY)-r.top)*(H/r.height)});
  cv.addEventListener('mousedown',e=>{dragging=true;const r=cv.getBoundingClientRect();const p=getPos(e,r);trail=[p];sliceAt(p.x,p.y);});
  cv.addEventListener('mousemove',e=>{if(!dragging)return;const r=cv.getBoundingClientRect();const p=getPos(e,r);trail.push(p);sliceAt(p.x,p.y);});
  cv.addEventListener('mouseup',()=>{dragging=false;trail=[];});
  cv.addEventListener('touchstart',e=>{e.preventDefault();const r=cv.getBoundingClientRect();const p=getPos(e,r);trail=[p];sliceAt(p.x,p.y);},{passive:false});
  cv.addEventListener('touchmove',e=>{e.preventDefault();const r=cv.getBoundingClientRect();const p=getPos(e,r);trail.push(p);sliceAt(p.x,p.y);},{passive:false});
  cv.addEventListener('touchend',()=>{trail=[];});
  window.ninjaStart=()=>{cancelAnimationFrame(raf);frutas=[];sc=0;vidas=3;tempo=30;on=true;document.getElementById('sc').textContent=0;clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);fim();}},1000);loop();};
  ctx.fillStyle='#1B2631';ctx.fillRect(0,0,W,H);ctx.fillStyle='#FFD93D';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🥷 Deslize para cortar!',W/2,H/2);
}

// ── DARK JUMP (extreme) ──
function jogoDarkjump(a, j) {
  const W=300,H=420;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>metros</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo peri" onclick="djPular()">💀 Pular / Iniciar</button></div>'+
    '<p style="text-align:center;font-size:.72rem;color:var(--muted);margin-bottom:10px">Modo extremo: obstáculos duplos e invisíveis!</p>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let player,obs,dist,vel,raf,on=false,tick=0;
  function draw(){
    ctx.fillStyle='#0D0D0D';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#222';ctx.fillRect(0,H-40,W,40);
    // obstáculos (alguns piscam!)
    obs.forEach(o=>{const vis=o.inv?(tick%40<20):true;if(vis){ctx.fillStyle=o.inv?'rgba(255,0,0,.5)':'#FF4757';ctx.fillRect(o.x,H-40-o.h,22,o.h);}});
    ctx.font='32px serif';ctx.textAlign='center';ctx.fillText('💀',player.x,player.y+10);
    ctx.fillStyle='#FF4757';ctx.font='bold 14px Nunito,sans-serif';ctx.textAlign='left';ctx.fillText(dist+'m',7,20);
  }
  function loop(){
    tick++;player.vy+=.8;player.y+=player.vy;if(player.y>=H-80){player.y=H-80;player.vy=0;}
    obs.forEach(o=>o.x-=vel);obs=obs.filter(o=>o.x>-30);
    if(obs.length<4&&Math.random()<.03)obs.push({x:W+20,h:20+Math.random()*60,inv:Math.random()<.3});
    dist++;vel=5+dist/150;document.getElementById('sc').textContent=dist;
    const col=obs.some(o=>{const vis=o.inv?(tick%40<20):true;return vis&&Math.abs(o.x-player.x)<22&&player.y>H-40-o.h-30;});
    if(col){on=false;const g=Math.floor(dist/2);addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);
      ctx.fillStyle='rgba(255,0,0,.3)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';
      ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 MORREU! '+dist+'m | +'+g,W/2,H/2);return;}
    draw();if(on)raf=requestAnimationFrame(loop);
  }
  window.djPular=()=>{
    if(!on){cancelAnimationFrame(raf);player={x:60,y:H-80,vy:0};obs=[];dist=0;vel=5;tick=0;on=true;loop();return;}
    if(player.y>=H-82)player.vy=-15;
  };
  cv.addEventListener('click',()=>djPular());
  cv.addEventListener('touchstart',e=>{e.preventDefault();djPular();},{passive:false});
  ctx.fillStyle='#0D0D0D';ctx.fillRect(0,0,W,H);ctx.fillStyle='#FF4757';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 MODO EXTREMO',W/2,H/2-10);ctx.fillStyle='#aaa';ctx.font='14px Nunito,sans-serif';ctx.fillText('Obstáculos invisíveis!',W/2,H/2+16);
}

// ── BOMBERMAN ──
function jogoBomber(a, j) {
  const SZ=36,C=9,R=7,W=C*SZ,H=R*SZ;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>inimigos destruídos</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,44px);gap:6px;justify-content:center;margin:10px auto">'+
      '<div></div><button class="btn-jogo" onclick="bmMove(0,-1)" style="padding:8px">▲</button><div></div>'+
      '<button class="btn-jogo" onclick="bmMove(-1,0)" style="padding:8px">◀</button>'+
      '<button class="btn-jogo peri" onclick="bmBomba()" style="padding:8px;font-size:.8rem">💣</button>'+
      '<button class="btn-jogo" onclick="bmMove(1,0)" style="padding:8px">▶</button>'+
      '<div></div><button class="btn-jogo" onclick="bmMove(0,1)" style="padding:8px">▼</button><div></div>'+
    '</div>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  let grid,player,inimigos,bombas,sc;
  function iniciar(){
    grid=Array(R).fill(null).map((_,r)=>Array(C).fill(null).map((_,c)=>{if(r===0||r===R-1||c===0||c===C-1)return'W';if(r%2===0&&c%2===0)return'W';if(r<=1&&c<=2)return'';return Math.random()<.5?'B':'';}) );
    player={x:1,y:1};sc=0;bombas=[];
    inimigos=[{x:C-2,y:R-2},{x:C-2,y:1},{x:1,y:R-2}];
    document.getElementById('sc').textContent=0;
    draw();
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    grid.forEach((row,r)=>row.forEach((v,c)=>{
      ctx.fillStyle=v==='W'?'#555':v==='B'?'#8B6914':'#90EE90';
      ctx.fillRect(c*SZ,r*SZ,SZ,SZ);
      if(v==='W'||v==='B'){ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1;ctx.strokeRect(c*SZ,r*SZ,SZ,SZ);}
    }));
    bombas.forEach(b=>{ctx.font='28px serif';ctx.textAlign='center';ctx.fillText('💣',b.x*SZ+SZ/2,b.y*SZ+SZ-4);});
    inimigos.forEach(e=>{ ctx.font='28px serif';ctx.textAlign='center';ctx.fillText('👿',e.x*SZ+SZ/2,e.y*SZ+SZ-4);});
    ctx.font='28px serif';ctx.textAlign='center';ctx.fillText('🧑',player.x*SZ+SZ/2,player.y*SZ+SZ-4);
  }
  window.bmMove=(dx,dy)=>{
    const nx=player.x+dx,ny=player.y+dy;
    if(nx>=0&&nx<C&&ny>=0&&ny<R&&grid[ny][nx]===''){player.x=nx;player.y=ny;draw();}
  };
  window.bmBomba=()=>{
    bombas.push({x:player.x,y:player.y});draw();
    setTimeout(()=>{
      const b=bombas[0];if(!b)return;bombas.shift();
      // explosão
      const exp=[[b.x,b.y],[b.x-1,b.y],[b.x+1,b.y],[b.x,b.y-1],[b.x,b.y+1],[b.x-2,b.y],[b.x+2,b.y],[b.x,b.y-2],[b.x,b.y+2]];
      exp.forEach(([ex,ey])=>{if(ex>=0&&ex<C&&ey>=0&&ey<R){if(grid[ey][ex]==='B')grid[ey][ex]='';
        inimigos.forEach((e,i)=>{if(e.x===ex&&e.y===ey){inimigos.splice(i,1);sc++;document.getElementById('sc').textContent=sc;}});
        if(player.x===ex&&player.y===ey){ctx.fillStyle='rgba(255,0,0,.5)';ctx.fillRect(0,0,W,H);toast('💥 Você morreu!');const g=sc*25;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);return;}
      }});
      if(!inimigos.length){const g=sc*25+100;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);toast('🏆 Venceu! +'+g+' pts!');setTimeout(iniciar,1500);}
      draw();
    },2000);
  };
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')bmMove(-1,0);if(e.key==='ArrowRight')bmMove(1,0);if(e.key==='ArrowUp')bmMove(0,-1);if(e.key==='ArrowDown')bmMove(0,1);if(e.key===' ')bmBomba();});
  iniciar();
}

// ── TOWER DEFENSE ──
function jogoTower(a, j) {
  const W=300,H=380;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>pontos | Vidas: <span id="vd">10</span> | Gold: <span id="gd">100</span></span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div style="display:flex;gap:8px;justify-content:center;margin:8px 0;flex-wrap:wrap">'+
      '<button class="btn-jogo" onclick="twComprar()" style="font-size:.78rem;padding:8px 12px">🏹 Torre (50g)</button>'+
      '<button class="btn-jogo verde" onclick="twStart()" style="font-size:.78rem;padding:8px 12px">▶ Onda!</button>'+
    '</div>'+
    '<p style="text-align:center;font-size:.72rem;color:var(--muted);margin-bottom:10px">Toque no campo para colocar torres</p>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  const PATH=[{x:0,y:40},{x:60,y:40},{x:60,y:120},{x:200,y:120},{x:200,y:200},{x:80,y:200},{x:80,y:300},{x:300,y:300}];
  let torres,inimigos,projeteis,sc,vidas,gold,onda,raf,on=false;
  function draw(){
    ctx.fillStyle='#4a7c59';ctx.fillRect(0,0,W,H);
    // caminho
    ctx.strokeStyle='#c8a96e';ctx.lineWidth=28;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(PATH[0].x,PATH[0].y);PATH.forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();
    ctx.strokeStyle='#dbb97e';ctx.lineWidth=24;ctx.beginPath();ctx.moveTo(PATH[0].x,PATH[0].y);PATH.forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();
    // torres
    torres.forEach(t=>{ctx.fillStyle='#2C3E50';ctx.beginPath();ctx.arc(t.x,t.y,14,0,Math.PI*2);ctx.fill();ctx.font='20px serif';ctx.textAlign='center';ctx.fillText('🏹',t.x,t.y+6);ctx.strokeStyle='rgba(77,150,255,.3)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(t.x,t.y,t.range,0,Math.PI*2);ctx.stroke();});
    // inimigos
    inimigos.forEach(e=>{ctx.font='22px serif';ctx.fillText('👿',e.x-10,e.y+6);ctx.fillStyle='#FF4757';ctx.fillRect(e.x-14,e.y-22,28,5);ctx.fillStyle='#6BCB77';ctx.fillRect(e.x-14,e.y-22,(28*e.hp/e.maxHp),5);});
    // projeteis
    ctx.fillStyle='#FFD93D';projeteis.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();});
    // HUD
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,22);ctx.fillStyle='#fff';ctx.font='bold 12px Nunito,sans-serif';ctx.textAlign='left';ctx.fillText('Onda '+onda+' | Score: '+sc,7,15);
  }
  function posNaCaminho(t,dist){let d=0;for(let i=1;i<PATH.length;i++){const dx=PATH[i].x-PATH[i-1].x,dy=PATH[i].y-PATH[i-1].y,seg=Math.hypot(dx,dy);if(d+seg>=dist){const f=(dist-d)/seg;return{x:PATH[i-1].x+dx*f,y:PATH[i-1].y+dy*f};}d+=seg;}return PATH[PATH.length-1];}
  function loop(){
    if(!on)return;
    inimigos.forEach(e=>{e.dist+=e.vel;const p=posNaCaminho(e,e.dist);if(p){e.x=p.x;e.y=p.y;}else{vidas--;document.getElementById('vd').textContent=vidas;inimigos.splice(inimigos.indexOf(e),1);if(vidas<=0){on=false;const g=sc*5;addPts(j,g);document.getElementById('rk').innerHTML=rkJogo(j.id);toast('💀 Game Over! +'+g+' pts!');return;}}});
    // torres atiram
    torres.forEach(t=>{t.cd=(t.cd||0)-1;if(t.cd>0)return;const alvo=inimigos.find(e=>Math.hypot(e.x-t.x,e.y-t.y)<t.range);if(alvo){projeteis.push({x:t.x,y:t.y,tx:alvo,dmg:t.dmg});t.cd=30;}});
    // projeteis
    projeteis.forEach(p=>{const dx=p.tx.x-p.x,dy=p.tx.y-p.y,d=Math.hypot(dx,dy);if(d<8){p.tx.hp-=p.dmg;if(p.tx.hp<=0){sc+=10;document.getElementById('sc').textContent=sc;gold+=20;document.getElementById('gd').textContent=gold;inimigos.splice(inimigos.indexOf(p.tx),1);}projeteis.splice(projeteis.indexOf(p),1);}else{p.x+=dx/d*5;p.y+=dy/d*5;}});
    if(!inimigos.length&&on){on=false;gold+=50;document.getElementById('gd').textContent=gold;toast('🏆 Onda '+onda+' completa! +50 gold');}
    draw();if(on)raf=requestAnimationFrame(loop);
  }
  window.twStart=()=>{if(on)return;onda++;const hp=40+onda*20;inimigos=Array(3+onda*2).fill(0).map((_,i)=>({x:0,y:40,dist:-i*60,vel:1+onda*.2,hp,maxHp:hp}));projeteis=[];on=true;loop();};
  window.twComprar=()=>{if(gold>=50){toast('🏹 Clique no campo para colocar a torre!');cv.onclick=(e)=>{const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)*(W/r.width),y=(e.clientY-r.top)*(H/r.height);torres.push({x,y,range:80,dmg:10,cd:0});gold-=50;document.getElementById('gd').textContent=gold;cv.onclick=null;};}else toast('💰 Gold insuficiente!');};
  function init(){torres=[];inimigos=[];projeteis=[];sc=0;vidas=10;gold=100;onda=0;document.getElementById('sc').textContent=0;document.getElementById('vd').textContent=10;document.getElementById('gd').textContent=100;draw();}
  window.twInit=init;init();
}

// ── XADREZ RÁPIDO ──
function jogoXadrez(a, j) {
  // Simplified chess: capture pieces to score, timed
  const SZ=36,N=8,W=N*SZ,H=N*SZ;
  a.innerHTML='<div class="jogo-score"><strong id="sc">0</strong><span>pontos | <span id="tm">120</span>s</span></div>'+
    '<div class="jogo-canvas-wrap"><canvas id="cv" width="'+W+'" height="'+H+'"></canvas></div>'+
    '<div class="jogo-controles"><button class="btn-jogo" onclick="xStart()">▶ Iniciar</button></div>'+
    '<p style="text-align:center;font-size:.72rem;color:var(--muted);margin-bottom:10px">Clique numa peça branca, depois no destino. Capture peças pretas!</p>'+
    '<div class="jogo-rank"><h4>🏆 Ranking</h4><div id="rk">'+rkJogo(j.id)+'</div></div>';
  const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
  // Simplified: random capture mini-game
  let board,sel,sc,tempo,iv,on=false;
  const PECAS_B=['♟','♞','♝','♜','♛'];const PECAS_W=['♙','♘','♗','♖','♕'];
  const VALS={'♟':1,'♞':3,'♝':3,'♜':5,'♛':9,'':0};
  function initBoard(){
    board=Array(N).fill(null).map((_,r)=>Array(N).fill(null).map((_,c)=>{
      if(r<2)return{p:PECAS_B[Math.floor(Math.random()*5)],cor:'b'};
      if(r>5)return{p:PECAS_W[Math.floor(Math.random()*5)],cor:'w'};
      return null;
    }));
  }
  function draw(){
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){
      ctx.fillStyle=(r+c)%2===0?'#F0D9B5':'#B58863';ctx.fillRect(c*SZ,r*SZ,SZ,SZ);
      if(sel&&sel[0]===r&&sel[1]===c){ctx.fillStyle='rgba(255,255,0,.4)';ctx.fillRect(c*SZ,r*SZ,SZ,SZ);}
      const cell=board[r][c];
      if(cell){ctx.fillStyle=cell.cor==='w'?'#fff':'#111';ctx.font='bold '+(SZ-8)+'px serif';ctx.textAlign='center';ctx.fillText(cell.p,c*SZ+SZ/2,r*SZ+SZ-4);}
    }
  }
  cv.addEventListener('click',e=>{
    if(!on)return;const rect=cv.getBoundingClientRect();
    const c=Math.floor((e.clientX-rect.left)*(W/rect.width)/SZ);
    const r=Math.floor((e.clientY-rect.top)*(H/rect.height)/SZ);
    if(!sel){if(board[r][c]&&board[r][c].cor==='w')sel=[r,c];}
    else{const[sr,sc2]=sel;
      if(r===sr&&c===sc2){sel=null;}
      else if(board[r][c]&&board[r][c].cor==='b'){const pts=VALS[board[r][c].p]||1;sc+=pts*10;document.getElementById('sc').textContent=sc;board[r][c]=board[sr][sc2];board[sr][sc2]=null;sel=null;toast('+'+pts*10+' pts!');}
      else if(!board[r][c]){board[r][c]=board[sr][sc2];board[sr][sc2]=null;sel=null;}
      else sel=null;
    }
    draw();
  });
  window.xStart=()=>{initBoard();sc=0;tempo=120;sel=null;on=true;document.getElementById('sc').textContent=0;clearInterval(iv);iv=setInterval(()=>{tempo--;const el=document.getElementById('tm');if(el)el.textContent=tempo;if(tempo<=0){clearInterval(iv);on=false;addPts(j,sc);document.getElementById('rk').innerHTML=rkJogo(j.id);toast('♟ +'+sc+' pts!');draw();}},1000);draw();};
  initBoard();draw();
}
