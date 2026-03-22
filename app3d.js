'use strict';
/* ═══════════════════════════════════════════════
   DEKGames 3D — app3d.js
   Firebase Realtime DB + Three.js + 32 jogos
═══════════════════════════════════════════════ */

// ── Storage local ──
const LS = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ── Estado ──
let perfil = LS.get('dkg3_perfil');
let sexoSel = '';
let jogoAtual = null;

// ── Lista de jogos ──
const JOGOS = [
  // 3D (destaque)
  { id:'corrida3d',  nome:'Corrida 3D',      emoji:'🏎️', cor:'#E74C3C', dif:'medio',   pts:200, is3d:true  },
  { id:'futebol3d',  nome:'Futebol 3D',       emoji:'⚽', cor:'#2ECC71', dif:'medio',   pts:180, is3d:true  },
  { id:'basquete3d', nome:'Basquete 3D',      emoji:'🏀', cor:'#E67E22', dif:'medio',   pts:160, is3d:true  },
  { id:'boliche3d',  nome:'Boliche 3D',       emoji:'🎳', cor:'#3498DB', dif:'facil',   pts:120, is3d:true  },
  { id:'nave3d',     nome:'Nave Espacial 3D', emoji:'🚀', cor:'#9B59B6', dif:'dificil', pts:280, is3d:true  },
  // 2D clássicos
  { id:'flappy',    nome:'Flappy Bird',      emoji:'🐦', cor:'#87CEEB', dif:'facil',   pts:50   },
  { id:'memoria',   nome:'Jogo da Memória',  emoji:'🃏', cor:'#FFD93D', dif:'facil',   pts:60   },
  { id:'snake',     nome:'Cobrinha',         emoji:'🐍', cor:'#6BCB77', dif:'facil',   pts:70   },
  { id:'clicker',   nome:'Clicker Maluco',   emoji:'👆', cor:'#FF6B35', dif:'facil',   pts:40   },
  { id:'pong',      nome:'Pong',             emoji:'🏓', cor:'#4D96FF', dif:'facil',   pts:60   },
  { id:'cores',     nome:'Adivinhe a Cor',   emoji:'🎨', cor:'#C77DFF', dif:'facil',   pts:50   },
  { id:'digitacao', nome:'Digitação Veloz',  emoji:'⌨️', cor:'#FF6EB4', dif:'facil',   pts:55   },
  { id:'baloes',    nome:'Estoura Balões',   emoji:'🎈', cor:'#FF4757', dif:'facil',   pts:45   },
  { id:'gol',       nome:'Chute a Gol',      emoji:'⚽', cor:'#2ECC71', dif:'medio',   pts:100  },
  { id:'corrida',   nome:'Corrida 2D',       emoji:'🚗', cor:'#E74C3C', dif:'medio',   pts:100  },
  { id:'dino',      nome:'Dino Jump',        emoji:'🦕', cor:'#7F8C8D', dif:'medio',   pts:90   },
  { id:'math',      nome:'Math Rush',        emoji:'🔢', cor:'#27AE60', dif:'medio',   pts:100  },
  { id:'aim',       nome:'Aim Trainer',      emoji:'🎯', cor:'#CB4335', dif:'medio',   pts:110  },
  { id:'reaction',  nome:'Teste de Reação',  emoji:'⚡', cor:'#F1C40F', dif:'medio',   pts:100  },
  { id:'forca',     nome:'Jogo da Forca',    emoji:'🪤', cor:'#D35400', dif:'medio',   pts:90   },
  { id:'plataforma',nome:'Plataforma Jump',  emoji:'🦘', cor:'#9B59B6', dif:'medio',   pts:100  },
  { id:'minhoca',   nome:'Minhoca Gulosa',   emoji:'🪱', cor:'#8E44AD', dif:'medio',   pts:100  },
  { id:'naveesp',   nome:'Nave Espacial 2D', emoji:'👾', cor:'#2980B9', dif:'medio',   pts:110  },
  { id:'2048',      nome:'2048',             emoji:'🟦', cor:'#E59866', dif:'dificil', pts:200  },
  { id:'labirinto', nome:'Labirinto',        emoji:'🌀', cor:'#16213E', dif:'dificil', pts:160  },
  { id:'tetris',    nome:'Tetris',           emoji:'🟩', cor:'#E67E22', dif:'dificil', pts:140  },
  { id:'asteroids', nome:'Asteroides',       emoji:'☄️', cor:'#1ABC9C', dif:'dificil', pts:160  },
  { id:'wordle',    nome:'Wordle PT',        emoji:'📝', cor:'#1E8449', dif:'dificil', pts:180  },
  { id:'piano',     nome:'Piano Tiles',      emoji:'🎹', cor:'#212F3D', dif:'extreme', pts:380  },
  { id:'ninja',     nome:'Ninja Reflex',     emoji:'🥷', cor:'#1B2631', dif:'extreme', pts:400  },
  { id:'speedmath', nome:'Speed Math',       emoji:'🧮', cor:'#6C3483', dif:'extreme', pts:380  },
  { id:'darkjump',  nome:'Dark Jump',        emoji:'💀', cor:'#17202A', dif:'extreme', pts:500  },
];

// ── PARTÍCULAS BG ──
function criarParticulas() {
  const c = document.getElementById('particles');
  const cores = ['#4D96FF','#C77DFF','#FF6B35','#FFD93D','#6BCB77'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'p';
    const s = 4 + Math.random() * 8;
    p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;background:${cores[i%5]};animation-duration:${8+Math.random()*12}s;animation-delay:${Math.random()*8}s`;
    c.appendChild(p);
  }
}

// ── INICIALIZAÇÃO ──
window._initApp = function() {
  criarParticulas();
  renderGrid();
  if (!perfil) {
    document.getElementById('modal-cadastro').style.display = 'flex';
  } else {
    atualizarHeader();
    carregarStats();
  }
};

if (window._fbReady) window._initApp();

// ── CADASTRO ──
window.selSexo = btn => {
  document.querySelectorAll('.sexo-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  sexoSel = btn.dataset.s;
};

window.cadastrar = async () => {
  const nome = document.getElementById('inp-nome').value.trim();
  if (!nome) { toast('⚠️ Digite seu apelido!'); return; }
  if (!sexoSel) { toast('⚠️ Selecione seu sexo!'); return; }

  const status = document.getElementById('status-login');
  status.textContent = '⏳ Salvando...';

  perfil = { nome, sexo: sexoSel, pts: 0, jogos: {}, criado: Date.now() };
  LS.set('dkg3_perfil', perfil);

  // Salvar no Firebase
  try {
    const db = window._db;
    const ref = window._ref;
    const set = window._set;
    const get = window._get;

    await set(ref(db, 'jogadores/' + nome), {
      nome, sexo: sexoSel, pts: 0, criado: Date.now()
    });

    // Atualizar contador
    const snap = await get(ref(db, 'stats/jogadores'));
    const atual = snap.val() || 0;
    await set(ref(db, 'stats/jogadores'), atual + 1);
  } catch(e) { console.log('Firebase erro:', e); }

  document.getElementById('modal-cadastro').style.display = 'none';
  atualizarHeader();
  toast('🎮 Bem-vindo, ' + nome + '!');
};

function atualizarHeader() {
  if (!perfil) return;
  document.getElementById('hdr-nome').textContent = perfil.nome;
  document.getElementById('hdr-pts').textContent = perfil.pts + ' pts';
  const av = { M:'👦', F:'👧', O:'🧑' };
  document.getElementById('hdr-av').textContent = av[perfil.sexo] || '🎮';
}

async function carregarStats() {
  // Firebase já atualiza via onValue no index.html
}

// ── GRID ──
function renderGrid() {
  const grid = document.getElementById('games-grid');
  grid.innerHTML = '';
  const difLabel = { facil:'Fácil', medio:'Médio', dificil:'Difícil', extreme:'Extremo' };
  JOGOS.forEach((j, i) => {
    const c = document.createElement('div');
    c.className = 'game-card' + (j.is3d ? ' is3d' : '');
    c.style.animationDelay = (i * 0.03) + 's';
    c.onclick = () => abrirJogo(j);
    c.innerHTML =
      '<div class="card-thumb" style="background:' + j.cor + '22">' +
        '<span>' + j.emoji + '</span>' +
        (j.is3d ? '<span class="badge-3d">3D</span>' : '') +
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
window.abrirRk = async () => {
  document.getElementById('painel-rk').style.display = 'flex';
  document.getElementById('rk-lista').innerHTML = '<div class="rk-vazio">Carregando...</div>';
  try {
    const db = window._db;
    const ref = window._ref;
    const get = window._get;
    const snap = await get(ref(db, 'jogadores'));
    const data = snap.val() || {};
    const lista = Object.values(data).sort((a, b) => b.pts - a.pts);
    renderRkGlobal(lista);
  } catch(e) {
    document.getElementById('rk-lista').innerHTML = '<div class="rk-vazio">Erro ao carregar 😕</div>';
  }
};

window.fecharRk = () => {
  document.getElementById('painel-rk').style.display = 'none';
};

function renderRkGlobal(lista) {
  const el = document.getElementById('rk-lista');
  if (!lista.length) { el.innerHTML = '<div class="rk-vazio">😴 Nenhum jogador ainda</div>'; return; }
  const av = { M:'👦', F:'👧', O:'🧑' };
  el.innerHTML = lista.map((r, i) => {
    const eu = perfil && r.nome === perfil.nome;
    const pos = i === 0 ? '👑' : (i + 1) + 'º';
    return '<div class="rk-item' + (eu ? ' eu' : '') + '">' +
      '<span class="rk-pos' + (i===0?' p1':'') + '">' + pos + '</span>' +
      '<div class="rk-av">' + (av[r.sexo]||'🎮') + '</div>' +
      '<div class="rk-info">' +
        '<div class="rk-nome">' + r.nome + (eu?' (você)':'') + '</div>' +
        '<div class="rk-sexo">' + (r.sexo==='M'?'Masculino':r.sexo==='F'?'Feminino':'Outro') + '</div>' +
      '</div>' +
      '<div class="rk-pts">' + (r.pts||0) + ' pts</div>' +
    '</div>';
  }).join('');
}

// ── RANKING DO JOGO (Firebase) ──
async function carregarRkJogo(id) {
  const el = document.getElementById('jr-jogo');
  el.innerHTML = '<span style="color:var(--muted);font-size:.75rem">Carregando...</span>';
  try {
    const db = window._db;
    const ref = window._ref;
    const get = window._get;
    const snap = await get(ref(db, 'jogadores'));
    const data = snap.val() || {};
    const lista = Object.values(data)
      .filter(r => r.jogos && r.jogos[id])
      .sort((a, b) => b.jogos[id] - a.jogos[id])
      .slice(0, 10);
    if (!lista.length) { el.innerHTML = '<span style="color:var(--muted);font-size:.75rem">Sem placar ainda</span>'; return; }
    const pos = ['👑','2º','3º','4º','5º','6º','7º','8º','9º','10º'];
    el.innerHTML = lista.map((r, i) =>
      '<div class="jr-item">' +
        '<div class="jr-pos">' + pos[i] + '</div>' +
        '<div class="jr-nome">' + r.nome + '</div>' +
        '<div class="jr-pts">' + r.jogos[id] + '</div>' +
      '</div>'
    ).join('');
  } catch(e) { el.innerHTML = '<span style="color:var(--muted);font-size:.75rem">—</span>'; }
}

// ── ABRIR JOGO ──
window.abrirJogo = jogo => {
  if (!perfil) { document.getElementById('modal-cadastro').style.display = 'flex'; return; }
  jogoAtual = jogo;
  document.getElementById('jogo-titulo').textContent = jogo.emoji + ' ' + jogo.nome;
  document.getElementById('jogo-area').innerHTML = '';
  document.getElementById('ctrl-mobile').className = 'controles-mobile';
  document.getElementById('ctrl-mobile').innerHTML = '';
  document.getElementById('modal-jogo').className = 'aberto';
  carregarRkJogo(jogo.id);
  iniciarJogo(jogo);
};

window.fecharJogo = () => {
  document.getElementById('modal-jogo').className = '';
  jogoAtual = null;
  // Para qualquer animação em curso
  if (window._gameRAF) cancelAnimationFrame(window._gameRAF);
};

window.toggleFS = () => {
  const el = document.getElementById('modal-jogo');
  if (!document.fullscreenElement) {
    el.requestFullscreen && el.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
};

// ── SALVAR PONTOS ──
async function addPts(jogo, pts) {
  if (!perfil || pts <= 0) return;
  perfil.pts += pts;
  if (!perfil.jogos[jogo.id] || pts > perfil.jogos[jogo.id]) {
    perfil.jogos[jogo.id] = pts;
  }
  LS.set('dkg3_perfil', perfil);
  atualizarHeader();
  toast('🎉 +' + pts + ' pontos!');

  try {
    const db = window._db;
    const ref = window._ref;
    const set = window._set;
    const get = window._get;
    await set(ref(db, 'jogadores/' + perfil.nome), {
      nome: perfil.nome, sexo: perfil.sexo, pts: perfil.pts,
      jogos: perfil.jogos, criado: perfil.criado
    });
    // Atualizar partidas
    const snap = await get(ref(db, 'stats/partidas'));
    await set(ref(db, 'stats/partidas'), (snap.val()||0) + 1);
  } catch(e) { console.log('Firebase sync erro:', e); }

  carregarRkJogo(jogo.id);
}

// ── TOAST ──
window.toast = msg => {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
};

// ── DESPACHANTE ──
function iniciarJogo(j) {
  const a = document.getElementById('jogo-area');
  const fn = {
    corrida3d: jogoCorrida3D,
    futebol3d: jogoFutebol3D,
    basquete3d: jogoBasquete3D,
    boliche3d: jogoBoliche3D,
    nave3d: jogoNave3D,
    flappy: jogoFlappy,
    memoria: jogoMemoria,
    snake: jogoSnake,
    clicker: jogoClicker,
    pong: jogoPong,
    cores: jogoCores,
    digitacao: jogoDigitacao,
    baloes: jogoBaloes,
    gol: jogoGol,
    corrida: jogoCorrida2D,
    dino: jogoDino,
    math: jogoMath,
    aim: jogoAim,
    reaction: jogoReaction,
    forca: jogoForca,
    '2048': jogo2048,
    plataforma: jogoPlataforma,
    minhoca: jogoMinhoca,
    naveesp: jogoNaveesp,
    labirinto: jogoLabirinto,
    tetris: jogoTetris,
    asteroids: jogoAsteroids,
    wordle: jogoWordle,
    piano: jogoPiano,
    ninja: jogoNinja,
    speedmath: jogoSpeedmath,
    darkjump: jogoDarkjump,
  }[j.id];
  fn ? fn(a, j) : jogoEmBreve(a, j);
}

/* ═══════════════════════════════════════════
   JOGOS 3D — Three.js
═══════════════════════════════════════════ */
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

function loadThree(cb) {
  if (window.THREE) { cb(); return; }
  const s = document.createElement('script');
  s.src = THREE_URL;
  s.onload = cb;
  document.head.appendChild(s);
}

function make3DContainer(a) {
  a.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;background:#000';
  const cv = document.createElement('canvas');
  cv.style.cssText = 'width:100%;height:100%;display:block';
  a.appendChild(cv);
  return cv;
}

function scoreHUD(txt) {
  const d = document.createElement('div');
  d.className = 'score-hud';
  d.id = 'score-hud';
  d.textContent = txt;
  return d;
}

// ── CORRIDA 3D ──
function jogoCorrida3D(a, j) {
  loadThree(() => {
    const cv = make3DContainer(a);
    const hud = scoreHUD('0 m');
    a.appendChild(hud);

    // Controles mobile
    const cm = document.getElementById('ctrl-mobile');
    cm.className = 'controles-mobile show';
    cm.innerHTML = '<div class="ctrl-grid">' +
      '<button class="ctrl-btn" id="cb-l">◀</button>' +
      '<div></div>' +
      '<button class="ctrl-btn" id="cb-r">▶</button>' +
      '</div>';

    const W = a.offsetWidth, H = a.offsetHeight;
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 30, 120);

    const cam = new THREE.PerspectiveCamera(75, W / H, 0.1, 200);
    cam.position.set(0, 3, -6);
    cam.lookAt(0, 1, 10);

    // Luzes
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Pista
    const pistaGeo = new THREE.PlaneGeometry(12, 400);
    const pistaMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const pista = new THREE.Mesh(pistaGeo, pistaMat);
    pista.rotation.x = -Math.PI / 2;
    pista.receiveShadow = true;
    scene.add(pista);

    // Linhas da pista
    for (let i = -180; i < 200; i += 20) {
      const lg = new THREE.PlaneGeometry(0.3, 8);
      const lm = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const l = new THREE.Mesh(lg, lm);
      l.rotation.x = -Math.PI / 2;
      l.position.set(0, 0.01, i);
      scene.add(l);
    }

    // Grama
    const gramaL = new THREE.Mesh(new THREE.PlaneGeometry(40, 400), new THREE.MeshLambertMaterial({ color: 0x2ECC71 }));
    gramaL.rotation.x = -Math.PI / 2;
    gramaL.position.set(-26, -0.01, 0);
    scene.add(gramaL);
    const gramaR = gramaL.clone();
    gramaR.position.set(26, -0.01, 0);
    scene.add(gramaR);

    // Carro do jogador
    const carGroup = new THREE.Group();
    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.8, 4),
      new THREE.MeshLambertMaterial({ color: 0xFF4757 })
    );
    carBody.position.y = 0.5;
    carBody.castShadow = true;
    const carTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.7, 2.2),
      new THREE.MeshLambertMaterial({ color: 0xCC2233 })
    );
    carTop.position.set(0, 1.15, -0.2);
    carTop.castShadow = true;
    carGroup.add(carBody, carTop);
    // Rodas
    const rodaGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12);
    const rodaMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    [[-0.95, 0.35, 1.3],[0.95, 0.35, 1.3],[-0.95, 0.35, -1.3],[0.95, 0.35, -1.3]].forEach(([x,y,z]) => {
      const r = new THREE.Mesh(rodaGeo, rodaMat);
      r.rotation.z = Math.PI / 2;
      r.position.set(x, y, z);
      carGroup.add(r);
    });
    carGroup.position.set(0, 0, -5);
    scene.add(carGroup);

    // Obstáculos
    const obsMats = [0x3498DB, 0xE67E22, 0x9B59B6, 0x1ABC9C];
    let obstaculos = [];
    function criarObs(z) {
      const g = new THREE.Group();
      const bGeo = new THREE.BoxGeometry(2, 1.2, 3.5);
      const bMat = new THREE.MeshLambertMaterial({ color: obsMats[Math.floor(Math.random()*4)] });
      const b = new THREE.Mesh(bGeo, bMat);
      b.position.y = 0.6;
      b.castShadow = true;
      g.add(b);
      const x = (Math.random() - 0.5) * 8;
      g.position.set(x, 0, z);
      scene.add(g);
      obstaculos.push(g);
      return g;
    }
    for (let i = 0; i < 8; i++) criarObs(20 + i * 25);

    let dist = 0, vel = 0.3, carX = 0, direcao = 0, on = true, tick = 0;

    // Input
    const keys = {};
    document.addEventListener('keydown', e => keys[e.key] = true);
    document.addEventListener('keyup', e => keys[e.key] = false);
    const bl = document.getElementById('cb-l');
    const br = document.getElementById('cb-r');
    if (bl) { bl.addEventListener('pointerdown', () => direcao = -1); bl.addEventListener('pointerup', () => direcao = 0); }
    if (br) { br.addEventListener('pointerdown', () => direcao = 1); br.addEventListener('pointerup', () => direcao = 0); }

    function loop() {
      if (!on) return;
      window._gameRAF = requestAnimationFrame(loop);
      tick++;

      if (keys['ArrowLeft']) direcao = -1;
      else if (keys['ArrowRight']) direcao = 1;
      else if (!bl?.matches(':active') && !br?.matches(':active')) direcao = 0;

      carX += direcao * 0.12;
      carX = Math.max(-4.5, Math.min(4.5, carX));
      carGroup.position.x += (carX - carGroup.position.x) * 0.15;
      carGroup.rotation.z = -direcao * 0.08;

      // Move obstáculos
      obstaculos.forEach(o => {
        o.position.z -= vel;
        if (o.position.z < -15) {
          o.position.z = 100 + Math.random() * 40;
          o.position.x = (Math.random() - 0.5) * 8;
        }
        // Colisão
        if (Math.abs(o.position.z - carGroup.position.z) < 2.5 &&
            Math.abs(o.position.x - carGroup.position.x) < 2) {
          on = false;
          const g = Math.floor(dist * 2);
          addPts(j, g);
          hud.textContent = '💥 +' + g + ' pts!';
          hud.style.color = '#FF4757';
          return;
        }
      });

      // Move linhas da pista
      scene.children.forEach(c => {
        if (c.geometry && c.geometry.parameters && c.geometry.parameters.width === 0.3) {
          c.position.z -= vel;
          if (c.position.z < -15) c.position.z += 200;
        }
      });

      dist++;
      vel = 0.3 + dist / 600;
      hud.textContent = Math.floor(dist / 3) + ' m';

      cam.position.x += (carGroup.position.x * 0.3 - cam.position.x) * 0.08;
      renderer.render(scene, cam);
    }
    loop();
  });
}

// ── FUTEBOL 3D ──
function jogoFutebol3D(a, j) {
  loadThree(() => {
    const cv = make3DContainer(a);
    const hud = scoreHUD('Gols: 0 / 5 chutes');
    a.appendChild(hud);

    const W = a.offsetWidth, H = a.offsetHeight;
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    const cam = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    cam.position.set(0, 3, 12);
    cam.lookAt(0, 2, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(5, 15, 5);
    sun.castShadow = true;
    scene.add(sun);

    // Campo
    const campo = new THREE.Mesh(new THREE.PlaneGeometry(20, 30), new THREE.MeshLambertMaterial({ color: 0x2ECC71 }));
    campo.rotation.x = -Math.PI / 2;
    campo.receiveShadow = true;
    scene.add(campo);

    // Goleiras
    const posteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    function criarGoleira(z) {
      const g = new THREE.Group();
      const posteGeo = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
      [-3, 3].forEach(x => {
        const p = new THREE.Mesh(posteGeo, posteMat);
        p.position.set(x, 1.5, 0);
        g.add(p);
      });
      const traGeo = new THREE.CylinderGeometry(0.08, 0.08, 6.16, 8);
      const tra = new THREE.Mesh(traGeo, posteMat);
      tra.rotation.z = Math.PI / 2;
      tra.position.set(0, 3, 0);
      g.add(tra);
      g.position.z = z;
      scene.add(g);
      return g;
    }
    criarGoleira(-12);

    // Goleiro
    const golMat = new THREE.MeshLambertMaterial({ color: 0xFF4757 });
    const goleiro = new THREE.Group();
    const golCorpo = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 0.6), golMat);
    golCorpo.position.y = 1;
    const golCab = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshLambertMaterial({ color: 0xFFDBAC }));
    golCab.position.y = 2.5;
    goleiro.add(golCorpo, golCab);
    goleiro.position.set(0, 0, -10);
    scene.add(goleiro);

    // Bola
    const bolaGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const bolaMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const bola = new THREE.Mesh(bolaGeo, bolaMat);
    bola.position.set(0, 0.4, 8);
    bola.castShadow = true;
    scene.add(bola);

    // Mirar
    const miraMat = new THREE.MeshBasicMaterial({ color: 0xFFD93D, transparent: true, opacity: 0.6 });
    const mira = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), miraMat);
    mira.position.set(0, 2, -11.5);
    scene.add(mira);

    let gols = 0, chutes = 5, animando = false, golDir = 1, tick = 0;
    let bolaV = null;

    // Mover mira com toque/mouse
    cv.addEventListener('mousemove', e => {
      const rect = cv.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
      const ny = ((1 - (e.clientY - rect.top) / rect.height) - 0.3) * 4;
      mira.position.set(Math.max(-2.8, Math.min(2.8, nx)), Math.max(0.5, Math.min(3.5, ny + 2)), -11.5);
    });
    cv.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const nx = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 6;
      const ny = ((1 - (e.touches[0].clientY - rect.top) / rect.height) - 0.3) * 4;
      mira.position.set(Math.max(-2.8, Math.min(2.8, nx)), Math.max(0.5, Math.min(3.5, ny + 2)), -11.5);
    }, { passive: false });

    // Chutar
    function chutar() {
      if (animando || chutes <= 0) return;
      animando = true;
      const tx = mira.position.x, ty = mira.position.y;
      bolaV = { x: (tx - bola.position.x) / 18, y: (ty - 0.4) / 18, z: -1.2 };
    }
    cv.addEventListener('click', chutar);
    cv.addEventListener('touchstart', e => { e.preventDefault(); chutar(); }, { passive: false });

    // Controle mobile
    const cm = document.getElementById('ctrl-mobile');
    cm.className = 'controles-mobile show';
    cm.innerHTML = '<div style="text-align:center"><button class="btn-jogo" onclick="chutarBola()" style="font-size:1rem;padding:12px 30px">⚽ CHUTAR</button></div>';
    window.chutarBola = chutar;

    function loop() {
      window._gameRAF = requestAnimationFrame(loop);
      tick++;

      // Goleiro se move
      goleiro.position.x = Math.sin(tick * 0.04) * 2.5;

      if (bolaV && animando) {
        bola.position.x += bolaV.x;
        bola.position.y += bolaV.y;
        bola.position.z += bolaV.z;
        bolaV.y -= 0.008;
        bola.rotation.x += 0.15;

        if (bola.position.z < -11) {
          // Chegou na área do gol
          const golGol = Math.abs(bola.position.x) < 2.8 && bola.position.y > 0.3 && bola.position.y < 3 &&
            !(Math.abs(bola.position.x - goleiro.position.x) < 1 && bola.position.y < 2.2);
          if (golGol) { gols++; toast('⚽ GOOOL!'); }
          else toast('🧤 Defendido!');
          chutes--;
          hud.textContent = 'Gols: ' + gols + ' / ' + chutes + ' chutes restantes';
          bola.position.set(0, 0.4, 8);
          bolaV = null;
          animando = false;
          if (chutes <= 0) {
            const g = gols * Math.floor(j.pts / 5);
            addPts(j, g);
            hud.textContent = '⚽ ' + gols + '/5 gols! +' + g + ' pts';
          }
        }
      }

      // Mira pulsa
      mira.scale.setScalar(0.9 + Math.sin(tick * 0.1) * 0.1);

      renderer.render(scene, cam);
    }
    loop();
  });
}

// ── BASQUETE 3D ──
function jogoBasquete3D(a, j) {
  loadThree(() => {
    const cv = make3DContainer(a);
    const hud = scoreHUD('0 pontos | 30s');
    a.appendChild(hud);

    const W = a.offsetWidth, H = a.offsetHeight;
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const cam = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    cam.position.set(0, 4, 10);
    cam.lookAt(0, 3, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const spot = new THREE.SpotLight(0xffffff, 1.5, 30, Math.PI / 4);
    spot.position.set(0, 15, 5);
    spot.castShadow = true;
    scene.add(spot);

    // Quadra
    const quadra = new THREE.Mesh(new THREE.PlaneGeometry(15, 20), new THREE.MeshLambertMaterial({ color: 0xC8860A }));
    quadra.rotation.x = -Math.PI / 2;
    quadra.receiveShadow = true;
    scene.add(quadra);

    // Tabela e aro
    const tabela = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.1), new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
    tabela.position.set(0, 5, -8);
    scene.add(tabela);

    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6, 8), new THREE.MeshLambertMaterial({ color: 0x888888 }));
    poste.position.set(0, 3, -8.5);
    scene.add(poste);

    // Aro
    const aroGeo = new THREE.TorusGeometry(0.6, 0.06, 8, 24);
    const aro = new THREE.Mesh(aroGeo, new THREE.MeshLambertMaterial({ color: 0xFF6B35 }));
    aro.rotation.x = Math.PI / 2;
    aro.position.set(0, 4.2, -7.5);
    scene.add(aro);

    // Bola
    const bola = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), new THREE.MeshLambertMaterial({ color: 0xFF6B35 }));
    bola.position.set(0, 1, 6);
    bola.castShadow = true;
    scene.add(bola);

    // Mira
    const mira = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.04, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xFFD93D })
    );
    mira.rotation.x = Math.PI / 2;
    mira.position.set(0, 4.2, -7.5);
    scene.add(mira);

    let sc = 0, tempo = 30, animando = false, bolaV = null, tick = 0;
    let miraX = 0;

    cv.addEventListener('mousemove', e => {
      const rect = cv.getBoundingClientRect();
      miraX = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
      mira.position.x = Math.max(-1.5, Math.min(1.5, miraX));
    });
    cv.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      miraX = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 4;
      mira.position.x = Math.max(-1.5, Math.min(1.5, miraX));
    }, { passive: false });

    function arremessar() {
      if (animando) return;
      animando = true;
      bolaV = {
        x: (mira.position.x - bola.position.x) / 20,
        y: 0.35,
        z: -0.65
      };
    }
    cv.addEventListener('click', arremessar);
    cv.addEventListener('touchstart', e => { e.preventDefault(); arremessar(); }, { passive: false });

    const cm = document.getElementById('ctrl-mobile');
    cm.className = 'controles-mobile show';
    cm.innerHTML = '<div style="text-align:center"><button class="btn-jogo" onclick="arremessarBola()" style="font-size:1rem;padding:12px 30px">🏀 ARREMESSAR</button></div>';
    window.arremessarBola = arremessar;

    const iv = setInterval(() => {
      tempo--;
      hud.textContent = sc + ' pts | ' + tempo + 's';
      if (tempo <= 0) {
        clearInterval(iv);
        addPts(j, sc);
        hud.textContent = '🏀 Fim! +' + sc + ' pts!';
      }
    }, 1000);

    function loop() {
      window._gameRAF = requestAnimationFrame(loop);
      tick++;
      mira.rotation.z = tick * 0.03;

      if (bolaV && animando) {
        bola.position.x += bolaV.x;
        bola.position.y += bolaV.y;
        bola.position.z += bolaV.z;
        bolaV.y -= 0.018;
        bola.rotation.x += 0.1;

        if (bola.position.y < 0 || bola.position.z < -9) {
          const cesta = Math.abs(bola.position.x - aro.position.x) < 0.7 &&
            Math.abs(bola.position.y - aro.position.y) < 0.8 &&
            bola.position.z < -7;
          if (cesta) { sc += 3; toast('🏀 CESTA!'); }
          else toast('😅 Errou!');
          hud.textContent = sc + ' pts | ' + tempo + 's';
          bola.position.set(0, 1, 6);
          bolaV = null;
          animando = false;
        }
      }

      renderer.render(scene, cam);
    }
    loop();
  });
}

// ── BOLICHE 3D ──
function jogoBoliche3D(a, j) {
  loadThree(() => {
    const cv = make3DContainer(a);
    const hud = scoreHUD('Rodada 1 | Score: 0');
    a.appendChild(hud);

    const W = a.offsetWidth, H = a.offsetHeight;
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 20, 60);

    const cam = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    cam.position.set(0, 2, 10);
    cam.lookAt(0, 1, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const spot = new THREE.SpotLight(0xffffff, 2, 40, Math.PI / 5);
    spot.position.set(0, 12, 5);
    spot.castShadow = true;
    scene.add(spot);

    // Pista
    const pista = new THREE.Mesh(new THREE.PlaneGeometry(4, 30), new THREE.MeshLambertMaterial({ color: 0xC8860A }));
    pista.rotation.x = -Math.PI / 2;
    pista.receiveShadow = true;
    scene.add(pista);

    // Pinos
    const pinoGeo = new THREE.CylinderGeometry(0.15, 0.18, 1, 10);
    const pinoMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    let pinos = [];
    const pinoPos = [
      [0, -12], [-0.4, -13], [0.4, -13],
      [-0.8, -14], [0, -14], [0.8, -14],
      [-1.2, -15], [-0.4, -15], [0.4, -15], [1.2, -15]
    ];
    pinoPos.forEach(([px, pz]) => {
      const p = new THREE.Mesh(pinoGeo, pinoMat);
      p.position.set(px, 0.5, pz);
      p.castShadow = true;
      scene.add(p);
      pinos.push({ mesh: p, caiu: false });
    });

    // Bola
    const bolaGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const bolaMat = new THREE.MeshLambertMaterial({ color: 0x4D96FF });
    const bola = new THREE.Mesh(bolaGeo, bolaMat);
    bola.position.set(0, 0.4, 8);
    bola.castShadow = true;
    scene.add(bola);

    let sc = 0, rodada = 0, animando = false, bolaX = 0, tick = 0, bolaZ = 8;
    const maxRodadas = 5;

    cv.addEventListener('touchstart', e => {
      const rect = cv.getBoundingClientRect();
      bolaX = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 3;
    });
    cv.addEventListener('mousemove', e => {
      const rect = cv.getBoundingClientRect();
      bolaX = ((e.clientX - rect.left) / rect.width - 0.5) * 3;
      bola.position.x += (bolaX - bola.position.x) * 0.1;
    });

    function lancar() {
      if (animando) return;
      animando = true;
      rodada++;
    }
    cv.addEventListener('click', lancar);
    cv.addEventListener('touchend', lancar);

    const cm = document.getElementById('ctrl-mobile');
    cm.className = 'controles-mobile show';
    cm.innerHTML =
      '<div style="display:flex;gap:10px;justify-content:center">' +
      '<button class="ctrl-btn" id="bl-e">◀</button>' +
      '<button class="btn-jogo" onclick="lancarBola()">🎳 Lançar</button>' +
      '<button class="ctrl-btn" id="bl-d">▶</button>' +
      '</div>';
    window.lancarBola = lancar;
    const ble = document.getElementById('bl-e');
    const bld = document.getElementById('bl-d');
    if (ble) { ble.addEventListener('pointerdown', () => bolaX -= 0.5); }
    if (bld) { bld.addEventListener('pointerdown', () => bolaX += 0.5); }

    function resetPinos() {
      pinos.forEach(p => { p.caiu = false; p.mesh.visible = true; p.mesh.position.y = 0.5; p.mesh.rotation.set(0,0,0); });
    }

    function loop() {
      window._gameRAF = requestAnimationFrame(loop);
      tick++;

      bola.position.x += (bolaX - bola.position.x) * 0.08;

      if (animando) {
        bolaZ -= 0.35;
        bola.position.z = bolaZ;
        bola.rotation.x -= 0.12;

        // Colisão com pinos
        pinos.forEach(p => {
          if (!p.caiu && bola.position.z < p.mesh.position.z + 0.5 &&
              bola.position.z > p.mesh.position.z - 0.5 &&
              Math.abs(bola.position.x - p.mesh.position.x) < 0.8) {
            p.caiu = true;
            p.mesh.rotation.z = Math.PI / 2;
            p.mesh.position.y = 0.15;
            sc += 10;
            hud.textContent = 'Rodada ' + rodada + ' | Score: ' + sc;
          }
        });

        if (bolaZ < -17) {
          const caidos = pinos.filter(p => p.caiu).length;
          if (caidos === 10) toast('🎳 STRIKE! +100!'), sc += 100;
          else if (caidos > 0) toast('🎳 ' + caidos + ' pinos!');
          hud.textContent = 'Rodada ' + rodada + ' | Score: ' + sc;

          if (rodada >= maxRodadas) {
            addPts(j, sc);
            hud.textContent = '🎳 Fim! +' + sc + ' pts!';
            animando = false;
          } else {
            bolaZ = 8;
            bola.position.set(0, 0.4, 8);
            animando = false;
            setTimeout(resetPinos, 500);
          }
        }
      }

      renderer.render(scene, cam);
    }
    loop();
  });
}

// ── NAVE ESPACIAL 3D ──
function jogoNave3D(a, j) {
  loadThree(() => {
    const cv = make3DContainer(a);
    const hud = scoreHUD('0 kills | ❤️❤️❤️');
    a.appendChild(hud);

    const W = a.offsetWidth, H = a.offsetHeight;
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    renderer.setSize(W, H);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);

    const cam = new THREE.PerspectiveCamera(70, W / H, 0.1, 200);
    cam.position.set(0, 4, 14);
    cam.lookAt(0, 0, -10);

    scene.add(new THREE.AmbientLight(0x334466, 0.8));
    scene.add(new THREE.PointLight(0x4D96FF, 2, 30));

    // Estrelas
    const starsGeo = new THREE.BufferGeometry();
    const starsPos = new Float32Array(1800);
    for (let i = 0; i < 1800; i++) starsPos[i] = (Math.random() - 0.5) * 200;
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.4 })));

    // Nave do jogador
    const naveGroup = new THREE.Group();
    const naveMat = new THREE.MeshLambertMaterial({ color: 0x4D96FF });
    const naveCorpo = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.5, 8), naveMat);
    naveCorpo.rotation.x = Math.PI / 2;
    const asaGeo = new THREE.BoxGeometry(3, 0.1, 1.2);
    const asa = new THREE.Mesh(asaGeo, new THREE.MeshLambertMaterial({ color: 0x2255AA }));
    asa.position.z = 0.5;
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.15, 0.8, 8), new THREE.MeshLambertMaterial({ color: 0xFF6B35 }));
    motor.position.z = 1.4;
    naveGroup.add(naveCorpo, asa, motor);
    naveGroup.position.set(0, 0, 8);
    scene.add(naveGroup);

    // Motor brilha
    const motorLight = new THREE.PointLight(0xFF6B35, 2, 4);
    motorLight.position.set(0, 0, 9.5);
    scene.add(motorLight);

    // Inimigos
    const iniMats = [0xFF4757, 0xFF6B35, 0xC77DFF, 0xFFD93D].map(c => new THREE.MeshLambertMaterial({ color: c }));
    let inimigos = [], balas = [], sc = 0, vidas = 3, tick = 0, on = true;
    let naveX = 0, naveY = 0, direcaoX = 0, direcaoY = 0;

    function criarInimigo() {
      const g = new THREE.Group();
      const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), iniMats[Math.floor(Math.random() * 4)]);
      g.add(corpo);
      g.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 6, -40 - Math.random() * 20);
      g.userData = { vel: 0.08 + Math.random() * 0.06 };
      scene.add(g);
      inimigos.push(g);
    }
    for (let i = 0; i < 5; i++) criarInimigo();

    function atirar() {
      if (!on) return;
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xFFD93D })
      );
      b.position.copy(naveGroup.position);
      b.position.z -= 1;
      const light = new THREE.PointLight(0xFFD93D, 1.5, 3);
      b.add(light);
      scene.add(b);
      balas.push(b);
    }

    // Input
    const keys = {};
    document.addEventListener('keydown', e => { keys[e.key] = true; if (e.code === 'Space') { e.preventDefault(); atirar(); } });
    document.addEventListener('keyup', e => keys[e.key] = false);

    const cm = document.getElementById('ctrl-mobile');
    cm.className = 'controles-mobile show';
    cm.innerHTML =
      '<div class="ctrl-grid">' +
      '<button class="ctrl-btn" id="cn-ul">↖</button>' +
      '<button class="ctrl-btn" id="cn-u">▲</button>' +
      '<button class="ctrl-btn" id="cn-ur">↗</button>' +
      '<button class="ctrl-btn" id="cn-l">◀</button>' +
      '<button class="btn-jogo" onclick="atirarNave()" style="width:52px;height:52px;padding:0;border-radius:12px;font-size:1rem">🔫</button>' +
      '<button class="ctrl-btn" id="cn-r">▶</button>' +
      '<button class="ctrl-btn" id="cn-dl">↙</button>' +
      '<button class="ctrl-btn" id="cn-d">▼</button>' +
      '<button class="ctrl-btn" id="cn-dr">↘</button>' +
      '</div>';
    window.atirarNave = atirar;
    const ctrlMap = { 'cn-u':[0,1],'cn-d':[0,-1],'cn-l':[-1,0],'cn-r':[1,0],'cn-ul':[-1,1],'cn-ur':[1,1],'cn-dl':[-1,-1],'cn-dr':[1,-1] };
    Object.entries(ctrlMap).forEach(([id,[dx,dy]]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('pointerdown', () => { direcaoX = dx; direcaoY = dy; });
      btn.addEventListener('pointerup', () => { direcaoX = 0; direcaoY = 0; });
    });

    // Auto-atirar
    setInterval(() => { if (on) atirar(); }, 600);

    function loop() {
      if (!on) return;
      window._gameRAF = requestAnimationFrame(loop);
      tick++;

      if (keys['ArrowLeft']) direcaoX = -1;
      else if (keys['ArrowRight']) direcaoX = 1;
      if (keys['ArrowUp']) direcaoY = 1;
      else if (keys['ArrowDown']) direcaoY = -1;

      naveX += direcaoX * 0.12;
      naveY += direcaoY * 0.09;
      naveX = Math.max(-7, Math.min(7, naveX));
      naveY = Math.max(-4, Math.min(4, naveY));
      naveGroup.position.x += (naveX - naveGroup.position.x) * 0.12;
      naveGroup.position.y += (naveY - naveGroup.position.y) * 0.12;
      naveGroup.rotation.z = -direcaoX * 0.15;
      motorLight.position.copy(naveGroup.position).z += 1.4;

      // Balas
      balas.forEach(b => b.position.z -= 0.8);
      balas = balas.filter(b => b.position.z > -50);

      // Inimigos
      inimigos.forEach(e => {
        e.position.z += e.userData.vel;
        e.rotation.y += 0.03;
        // Colisão bala
        balas.forEach((b, bi) => {
          if (b.position.distanceTo(e.position) < 1.2) {
            scene.remove(b); balas.splice(bi, 1);
            scene.remove(e); inimigos.splice(inimigos.indexOf(e), 1);
            sc++; hud.textContent = sc + ' kills | ' + '❤️'.repeat(vidas);
            criarInimigo();
          }
        });
        // Inimigo passa pela nave
        if (e.position.z > 12) {
          scene.remove(e); inimigos.splice(inimigos.indexOf(e), 1);
          vidas--;
          hud.textContent = sc + ' kills | ' + '❤️'.repeat(Math.max(0, vidas));
          criarInimigo();
          if (vidas <= 0) {
            on = false;
            const g = sc * 12;
            addPts(j, g);
            hud.textContent = '💀 ' + sc + ' kills! +' + g + ' pts';
          }
        }
      });

      // Spawn extra
      if (tick % 200 === 0) criarInimigo();

      renderer.render(scene, cam);
    }
    loop();
  });
}

/* ═══════════════════════════════════════════
   JOGOS 2D
═══════════════════════════════════════════ */
function canvas2D(a, w, h) {
  a.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:12px';
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  cv.style.cssText = 'border-radius:12px;border:1px solid #2a2a4a;max-width:100%;margin:0 auto';
  return cv;
}

function jogoFlappy(a, j) {
  const W=300,H=420;
  a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';
  const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1.2rem;color:#FFD93D;margin-bottom:8px';sc_el.textContent='0 pontos';
  const cv=canvas2D(a,W,H);a.appendChild(sc_el);a.appendChild(cv);
  const btn=document.createElement('button');btn.className='btn-jogo';btn.textContent='▶ Iniciar';btn.style.cssText='margin:10px auto;display:block';
  a.appendChild(btn);
  const ctx=cv.getContext('2d');
  let bird,pipes,sc,raf,on=false;
  function draw(){ctx.fillStyle='#87CEEB';ctx.fillRect(0,0,W,H);ctx.fillStyle='#90EE90';ctx.fillRect(0,H-50,W,50);pipes.forEach(p=>{ctx.fillStyle='#2ECC71';ctx.fillRect(p.x,0,44,p.t);ctx.fillRect(p.x,p.t+130,44,H);});ctx.fillStyle='#FFD93D';ctx.beginPath();ctx.ellipse(65,bird.y,15,11,bird.v*.05,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText(sc,W/2,32);}
  function loop(){if(!on)return;bird.v+=.42;bird.y+=bird.v;pipes.forEach(p=>p.x-=3);if(pipes[0].x<-46){pipes.shift();pipes.push({x:W+40,t:80+Math.random()*180});sc++;sc_el.textContent=sc+' pontos';}const p=pipes[0];if(bird.y<0||bird.y>H-50||(65+15>p.x&&65-15<p.x+44&&(bird.y-11<p.t||bird.y+11>p.t+130))){on=false;const g=Math.max(10,sc*8);addPts(j,g);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 28px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 +'+g+' pts',W/2,H/2);return;}draw();raf=requestAnimationFrame(loop);}
  btn.onclick=()=>{cancelAnimationFrame(raf);bird={y:H/2,v:0};pipes=[{x:W,t:100},{x:W+180,t:130}];sc=0;on=true;sc_el.textContent='0 pontos';loop();};
  const jump=()=>{if(on)bird.v=-8;};cv.addEventListener('click',jump);cv.addEventListener('touchstart',e=>{e.preventDefault();jump();},{passive:false});document.addEventListener('keydown',e=>{if(e.code==='Space')jump();});
  ctx.fillStyle='#87CEEB';ctx.fillRect(0,0,W,H);ctx.fillStyle='#1a1a2e';ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🐦 Toque para voar!',W/2,H/2);
}

function jogoMemoria(a, j) {
  const emjs=['🍎','🍌','🍇','🍓','🎮','🚀','⚽','🎯','🐶','🐱','🦊','🐸'];
  let cards=[],virados=[],acertos=0,bloqueado=false,tentativas=0;
  function novo(){const em=[...emjs,...emjs].sort(()=>Math.random()-.5);cards=em.map((e,i)=>({id:i,e,v:false,ok:false}));virados=[];acertos=0;tentativas=0;render();}
  function render(){
    a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:12px';
    const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#FFD93D;margin-bottom:10px';sc_el.textContent='Tentativas: '+tentativas;
    const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(6,1fr);gap:6px;max-width:340px;margin:0 auto';
    cards.forEach(c=>{const d=document.createElement('div');d.style.cssText='aspect-ratio:1;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;cursor:pointer;border:2px solid '+(c.ok?'#6BCB77':c.v?'#4D96FF':'#2a2a4a')+';background:'+(c.ok?'rgba(107,203,119,.15)':c.v?'rgba(77,150,255,.15)':'#1a1a2e');d.textContent=c.v||c.ok?c.e:'';d.onclick=()=>clickCard(c.id);grid.appendChild(d);});
    const btn=document.createElement('button');btn.className='btn-jogo';btn.textContent='🔄 Reiniciar';btn.style='margin:12px auto;display:block';btn.onclick=novo;
    a.innerHTML='';a.appendChild(sc_el);a.appendChild(grid);a.appendChild(btn);
  }
  window.clickCard=id=>{if(bloqueado)return;const c=cards[id];if(c.v||c.ok)return;c.v=true;virados.push(c);render();if(virados.length===2){bloqueado=true;tentativas++;setTimeout(()=>{if(virados[0].e===virados[1].e){virados.forEach(v=>{v.ok=true;v.v=false;});acertos++;if(acertos===emjs.length){const g=Math.max(60,400-tentativas*8);addPts(j,g);toast('🎉 +'+g+' pts!');}}else virados.forEach(v=>v.v=false);virados=[];bloqueado=false;render();},750);}};
  novo();
}

function jogoSnake(a, j) {
  const W=280,H=280,SZ=20;
  a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';
  const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1.1rem;color:#6BCB77;margin-bottom:8px';sc_el.textContent='Score: 0';
  const cv=canvas2D(a,W,H);a.appendChild(sc_el);a.appendChild(cv);
  const ctrlDiv=document.createElement('div');
  ctrlDiv.innerHTML='<div class="ctrl-grid" style="margin:10px auto"><div></div><button class="ctrl-btn" onclick="snDir(0,-1)">▲</button><div></div><button class="ctrl-btn" onclick="snDir(-1,0)">◀</button><button class="btn-jogo vd" onclick="snStart()" style="width:52px;height:52px;padding:0;border-radius:12px">GO</button><button class="ctrl-btn" onclick="snDir(1,0)">▶</button><div></div><button class="ctrl-btn" onclick="snDir(0,1)">▼</button><div></div></div>';
  a.appendChild(ctrlDiv);
  const ctx=cv.getContext('2d');
  const C=W/SZ,R=H/SZ;
  let snake,dir,food,sc,iv,on=false;
  function draw(){ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#6BCB77':'#4DA85A';ctx.fillRect(s.x+1,s.y+1,SZ-2,SZ-2);});ctx.font=SZ+'px serif';ctx.textAlign='center';ctx.fillText('🍎',food.x+SZ/2,food.y+SZ-2);}
  function loop(){const h={x:snake[0].x+dir.x*SZ,y:snake[0].y+dir.y*SZ};if(h.x<0||h.x>=W||h.y<0||h.y>=H||snake.some(s=>s.x===h.x&&s.y===h.y)){clearInterval(iv);on=false;const g=Math.max(10,sc*15);addPts(j,g);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 +'+g+' pts',W/2,H/2);return;}snake.unshift(h);if(h.x===food.x&&h.y===food.y){sc++;sc_el.textContent='Score: '+sc;food={x:Math.floor(Math.random()*C)*SZ,y:Math.floor(Math.random()*R)*SZ};}else snake.pop();draw();}
  window.snStart=()=>{clearInterval(iv);snake=[{x:120,y:120},{x:100,y:120}];dir={x:1,y:0};sc=0;on=true;sc_el.textContent='Score: 0';food={x:Math.floor(Math.random()*C)*SZ,y:Math.floor(Math.random()*R)*SZ};draw();iv=setInterval(loop,140);};
  window.snDir=(x,y)=>{if(!on)return;if(x!==0&&dir.x===0)dir={x,y};if(y!==0&&dir.y===0)dir={x,y};};
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')snDir(-1,0);if(e.key==='ArrowRight')snDir(1,0);if(e.key==='ArrowUp')snDir(0,-1);if(e.key==='ArrowDown')snDir(0,1);});
  ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);ctx.fillStyle='#6BCB77';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🐍 Pressione GO',W/2,H/2);
}

function jogoClicker(a,j){let cl=0,t=15,iv,on=false;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f0f1a;padding:20px';a.innerHTML='<div style="font-family:Fredoka,sans-serif;font-size:2rem;color:#FFD93D;margin-bottom:8px" id="sc-cl">0</div><div style="color:var(--muted);margin-bottom:20px" id="tm-cl">15s</div><button id="bc" style="width:140px;height:140px;border-radius:50%;font-size:2.8rem;background:linear-gradient(135deg,#4D96FF,#C77DFF);border:none;color:#fff;box-shadow:0 8px 30px rgba(77,150,255,.4);transition:transform .1s;cursor:pointer">👆</button><button class="btn-jogo" onclick="clStart()" style="margin-top:20px">▶ Iniciar</button>';window.clStart=()=>{cl=0;t=15;on=true;document.getElementById('sc-cl').textContent=0;clearInterval(iv);iv=setInterval(()=>{t--;document.getElementById('tm-cl').textContent=t+'s';if(t<=0){clearInterval(iv);on=false;const g=Math.floor(cl/2);addPts(j,g);toast('⏰ '+cl+' cliques! +'+g+' pts');}},1000);};document.getElementById('bc').onclick=()=>{if(!on)return;cl++;document.getElementById('sc-cl').textContent=cl;const b=document.getElementById('bc');b.style.transform='scale(.88)';setTimeout(()=>b.style.transform='',70);};}

function jogoPong(a,j){const W=300,H=220;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const cv=canvas2D(a,W,H);a.appendChild(cv);const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:.9rem;color:var(--muted);margin:6px 0';sc_el.textContent='0 × 0 (você × IA)';a.appendChild(sc_el);const btn=document.createElement('button');btn.className='btn-jogo';btn.textContent='▶ Iniciar';btn.style='margin:6px auto;display:block';a.appendChild(btn);const ctx=cv.getContext('2d');let bola,p1,ia,pts,raf,on=false;const PH=50,PW=9;function draw(){ctx.fillStyle='#0A2342';ctx.fillRect(0,0,W,H);ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#4D96FF';ctx.fillRect(0,p1,PW,PH);ctx.fillStyle='#FF4757';ctx.fillRect(W-PW,ia,PW,PH);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bola.x,bola.y,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText(pts.p+' : '+pts.ia,W/2,20);}function reset(){bola={x:W/2,y:H/2,vx:(Math.random()<.5?1:-1)*4,vy:(Math.random()-.5)*5};}function loop(){if(!on)return;bola.x+=bola.vx;bola.y+=bola.vy;if(bola.y<7||bola.y>H-7)bola.vy*=-1;if(bola.x<PW+7&&bola.y>p1&&bola.y<p1+PH)bola.vx=Math.abs(bola.vx)+.08;if(bola.x>W-PW-7&&bola.y>ia&&bola.y<ia+PH)bola.vx=-(Math.abs(bola.vx)+.08);ia+=(bola.y-ia-PH/2)*.07;ia=Math.max(0,Math.min(H-PH,ia));if(bola.x<0){pts.ia++;sc_el.textContent=pts.p+' × '+pts.ia;reset();}if(bola.x>W){pts.p++;sc_el.textContent=pts.p+' × '+pts.ia;reset();}if(pts.p>=7||pts.ia>=7){on=false;const g=pts.p*18;addPts(j,g);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText(pts.p>pts.ia?'🏆 Venceu!':'😅 IA venceu!',W/2,H/2);return;}draw();raf=requestAnimationFrame(loop);}cv.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();p1=Math.max(0,Math.min(H-PH,(e.clientY-r.top)*(H/r.height)-PH/2));});cv.addEventListener('touchmove',e=>{e.preventDefault();const r=cv.getBoundingClientRect();p1=Math.max(0,Math.min(H-PH,(e.touches[0].clientY-r.top)*(H/r.height)-PH/2));},{passive:false});btn.onclick=()=>{cancelAnimationFrame(raf);pts={p:0,ia:0};p1=H/2-PH/2;ia=H/2-PH/2;on=true;reset();sc_el.textContent='0 × 0';loop();};}

function jogoCores(a,j){const nms=['Vermelho','Verde','Azul','Amarelo','Roxo','Rosa','Laranja','Ciano'];const vals={Vermelho:'#FF4757',Verde:'#6BCB77',Azul:'#4D96FF',Amarelo:'#FFD93D',Roxo:'#C77DFF',Rosa:'#FF6EB4',Laranja:'#FF6B35',Ciano:'#00CEC9'};let sc=0,t=20,iv,on=false;function novaR(){const cor=nms[Math.floor(Math.random()*8)];const txt=nms[Math.floor(Math.random()*8)];const op=[...nms].sort(()=>Math.random()-.5).slice(0,4);if(!op.includes(cor))op[0]=cor;op.sort(()=>Math.random()-.5);return{cor,txt,op};}let r=novaR();function render(){a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:16px';a.innerHTML='<div style="font-family:Fredoka,sans-serif;font-size:1.1rem;color:#FFD93D;text-align:center;margin-bottom:8px" id="sc-c">'+sc+' pts | '+t+'s</div><p style="color:var(--muted);font-size:.82rem;text-align:center;margin-bottom:10px">Qual é a COR do texto?</p><div style="font-family:Fredoka,sans-serif;font-size:3rem;color:'+vals[r.cor]+';text-align:center;margin-bottom:18px">'+r.txt+'</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:280px;margin:0 auto 14px">'+r.op.map(o=>'<button class="btn-jogo" style="background:'+vals[o]+';color:#fff;padding:13px;font-size:.9rem" onclick="cResp(\''+o+'\')">'+o+'</button>').join('')+'</div>'+(!on?'<div style="text-align:center"><button class="btn-jogo" onclick="cStart()">▶ Iniciar</button></div>':'');}window.cResp=o=>{if(!on)return;if(o===r.cor){sc+=10;toast('✅');}else{sc=Math.max(0,sc-5);toast('❌');}r=novaR();render();document.getElementById('sc-c').textContent=sc+' pts | '+t+'s';};window.cStart=()=>{sc=0;t=20;on=true;r=novaR();clearInterval(iv);iv=setInterval(()=>{t--;const el=document.getElementById('sc-c');if(el)el.textContent=sc+' pts | '+t+'s';if(t<=0){clearInterval(iv);on=false;addPts(j,sc);toast('⏰ +'+sc+' pts!');render();}},1000);render();};render();}

function jogoDigitacao(a,j){const pals=['futebol','gol','arena','campeão','jogador','torcida','bola','partida','vitória','defesa','ataque','campo','goleiro','esporte','placar'];let sc=0,t=30,iv,on=false,atual='';function novaP(){atual=pals[Math.floor(Math.random()*pals.length)];const el=document.getElementById('dpal');if(el)el.textContent=atual;}function render(){a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:16px';a.innerHTML='<div style="font-family:Fredoka,sans-serif;font-size:1.1rem;color:#FFD93D;text-align:center;margin-bottom:12px" id="sc-d">'+sc+' palavras | '+t+'s</div><div style="background:#1a1a2e;border-radius:14px;padding:18px;text-align:center;margin-bottom:13px;border:1px solid #2a2a4a"><p style="color:var(--muted);font-size:.78rem;margin-bottom:8px">Digite:</p><div id="dpal" style="font-family:Fredoka,sans-serif;font-size:2rem;color:#4D96FF;margin-bottom:12px">'+atual+'</div><input id="dinp" type="text" style="width:100%;padding:12px;background:#0f0f1a;border:2px solid #2a2a4a;border-radius:11px;font-size:1.05rem;text-align:center;outline:none;color:#fff" placeholder="Digite aqui..."/></div>'+(!on?'<div style="text-align:center"><button class="btn-jogo" onclick="dStart()">▶ Iniciar</button></div>':'');const inp=document.getElementById('dinp');if(inp)inp.addEventListener('input',e=>{if(!on)return;if(e.target.value.toLowerCase()===atual){sc++;const el=document.getElementById('sc-d');if(el)el.textContent=sc+' palavras | '+t+'s';e.target.value='';novaP();toast('✅ +1!');}});}window.dStart=()=>{sc=0;t=30;on=true;novaP();clearInterval(iv);iv=setInterval(()=>{t--;const el=document.getElementById('sc-d');if(el)el.textContent=sc+' palavras | '+t+'s';if(t<=0){clearInterval(iv);on=false;const g=sc*12;addPts(j,g);toast('⌨️ '+sc+' palavras! +'+g+' pts');render();}},1000);render();document.getElementById('dinp')?.focus();};render();}

function jogoBaloes(a,j){const W=300,H=320;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1.1rem;color:#FFD93D;margin-bottom:6px';sc_el.textContent='0 balões | 20s';const cv=canvas2D(a,W,H);a.appendChild(sc_el);a.appendChild(cv);const btn=document.createElement('button');btn.className='btn-jogo';btn.textContent='▶ Iniciar';btn.style='margin:8px auto;display:block';a.appendChild(btn);const ctx=cv.getContext('2d');const cores=['#FF4757','#FF6B35','#FFD93D','#6BCB77','#4D96FF','#C77DFF'];let bals=[],sc=0,t=20,iv,on=false;function draw(){ctx.fillStyle='#0f0f1a';ctx.fillRect(0,0,W,H);bals.forEach(b=>{ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle=b.c;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=2;ctx.stroke();});}function loop(){if(!on)return;bals.forEach(b=>b.y-=b.vel);bals=bals.filter(b=>b.y+b.r>0);if(bals.length<7&&Math.random()<.1)bals.push({x:20+Math.random()*(W-40),y:H+30,r:18+Math.random()*16,vel:1+Math.random()*2,c:cores[Math.floor(Math.random()*6)]});draw();requestAnimationFrame(loop);}function click(e){if(!on)return;const rect=cv.getBoundingClientRect();const x=((e.clientX||e.touches[0].clientX)-rect.left)*(W/rect.width);const y=((e.clientY||e.touches[0].clientY)-rect.top)*(H/rect.height);const idx=bals.findIndex(b=>Math.hypot(x-b.x,y-b.y)<b.r);if(idx!==-1){bals.splice(idx,1);sc++;sc_el.textContent=sc+' balões | '+t+'s';}}cv.addEventListener('click',click);cv.addEventListener('touchstart',e=>{e.preventDefault();click(e);},{passive:false});btn.onclick=()=>{bals=[];sc=0;t=20;on=true;sc_el.textContent='0 balões | 20s';clearInterval(iv);iv=setInterval(()=>{t--;sc_el.textContent=sc+' balões | '+t+'s';if(t<=0){clearInterval(iv);on=false;const g=sc*5;addPts(j,g);toast('🎈 '+sc+' balões! +'+g+' pts');}},1000);loop();};}

function jogoGol(a,j){const W=300,H=240;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#6BCB77;margin-bottom:6px';sc_el.textContent='0 gols / 5 chutes';const cv=canvas2D(a,W,H);a.appendChild(sc_el);a.appendChild(cv);const btn=document.createElement('button');btn.className='btn-jogo vd';btn.textContent='▶ Iniciar';btn.style='margin:8px auto;display:block';a.appendChild(btn);const ctx=cv.getContext('2d');let gols=0,ch=5,gl={x:120,d:1},on=false,ball=null,anim=false,tick=0;function draw(){ctx.fillStyle='#27AE60';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(75,15,150,70);ctx.strokeStyle='#aaa';ctx.lineWidth=2;ctx.strokeRect(75,15,150,70);ctx.font='28px serif';ctx.textAlign='center';ctx.fillText('🧤',gl.x+14,52);if(ball)ctx.fillText('⚽',ball.x,ball.y);else ctx.fillText('⚽',W/2,H-30);ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,H-24,W,24);ctx.fillStyle='#fff';ctx.font='bold 12px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText('Gols: '+gols+' | Chutes: '+ch,W/2,H-8);}function moveGl(){if(!on)return;gl.x+=gl.d*2.5;if(gl.x>185||gl.x<75)gl.d*=-1;if(!anim)draw();requestAnimationFrame(moveGl);}function chute(tx){if(!on||anim||ch<=0)return;ball={x:W/2,y:H-35,vx:(tx-W/2)/16,vy:-8};anim=true;function ab(){ball.x+=ball.vx;ball.y+=ball.vy;ball.vy+=.5;if(ball.y<90){anim=false;const hit=ball.x>75&&ball.x<225&&ball.y>15&&ball.y<85&&!(ball.x>gl.x&&ball.x<gl.x+32);if(hit){gols++;toast('⚽ GOOOL!');}else toast('🧤 Defendido!');ball=null;ch--;sc_el.textContent=gols+' gols / '+ch+' chutes';if(ch<=0){on=false;const g=gols*Math.round(j.pts/5);addPts(j,g);}return;}draw();requestAnimationFrame(ab);}requestAnimationFrame(ab);}cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect();chute((e.clientX-r.left)*(W/r.width));});cv.addEventListener('touchstart',e=>{e.preventDefault();const r=cv.getBoundingClientRect();chute((e.touches[0].clientX-r.left)*(W/r.width));},{passive:false});btn.onclick=()=>{gols=0;ch=5;on=true;ball=null;anim=false;sc_el.textContent='0 gols / 5 chutes';moveGl();};draw();}

function jogoCorrida2D(a,j){const W=260,H=420;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#FF6B35;margin-bottom:6px';sc_el.textContent='0 m';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const ctrl=document.createElement('div');ctrl.innerHTML='<div style="display:flex;gap:8px;justify-content:center;margin:8px 0"><button class="ctrl-btn" onpointerdown="c2d(-1)" onpointerup="c2d(0)">◀</button><button class="btn-jogo vd" onclick="c2dStart()">▶ Start</button><button class="ctrl-btn" onpointerdown="c2d(1)" onpointerup="c2d(0)">▶</button></div>';a.appendChild(ctrl);const ctx=cv.getContext('2d');let car={x:100,y:360},obs=[],dist=0,vel=3.5,raf,on=false,dir=0,lns=[];for(let i=0;i<8;i++)lns.push(i*(H/8));function draw(){ctx.fillStyle='#555';ctx.fillRect(0,0,W,H);ctx.fillStyle='#666';ctx.fillRect(12,0,W-24,H);ctx.fillStyle='#FFD93D';lns.forEach(y=>ctx.fillRect(W/2-3,y,6,30));obs.forEach(o=>{ctx.font='40px serif';ctx.textAlign='center';ctx.fillText('🚗',o.x+18,o.y+40);});ctx.font='42px serif';ctx.textAlign='center';ctx.fillText('🏎️',car.x+18,car.y+44);}function loop(){if(!on)return;lns=lns.map(y=>{const ny=y+vel;return ny>H?ny-H:ny;});car.x+=dir*5;car.x=Math.max(12,Math.min(W-50,car.x));obs.forEach(o=>o.y+=vel);obs=obs.filter(o=>o.y<H);if(obs.length<3&&Math.random()<.025)obs.push({x:14+Math.random()*(W-48),y:-50});if(obs.some(o=>car.x<o.x+38&&car.x+38>o.x&&car.y<o.y+38&&car.y+44>o.y)){on=false;const g=Math.floor(dist/4);addPts(j,g);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 22px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💥 '+dist+'m | +'+g+' pts',W/2,H/2);return;}dist++;vel=3.5+dist/220;sc_el.textContent=dist+'m';draw();raf=requestAnimationFrame(loop);}window.c2dStart=()=>{cancelAnimationFrame(raf);car={x:100,y:360};obs=[];dist=0;vel=3.5;on=true;sc_el.textContent='0m';loop();};window.c2d=d=>dir=d;document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')dir=-1;if(e.key==='ArrowRight')dir=1;});document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')dir=0;});}

function jogoDino(a,j){const W=300,H=160;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#7F8C8D;margin-bottom:6px';sc_el.textContent='0 m';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const btn=document.createElement('button');btn.className='btn-jogo';btn.textContent='▶ Pular / Iniciar';btn.style='margin:8px auto;display:block';a.appendChild(btn);const ctx=cv.getContext('2d');let dino={y:108,vy:0},obs=[],dist=0,vel=4,raf,on=false;function draw(){ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);ctx.fillStyle='#2a2a4a';ctx.fillRect(0,136,W,2);ctx.font='30px serif';ctx.textAlign='center';ctx.fillText('🦕',38,dino.y+8);obs.forEach(o=>ctx.fillText('🌵',o.x,136));}function loop(){dino.vy+=.75;dino.y+=dino.vy;if(dino.y>=108){dino.y=108;dino.vy=0;}obs.forEach(o=>o.x-=vel);obs=obs.filter(o=>o.x>-20);if(obs.length<2&&Math.random()<.022)obs.push({x:W+20});dist++;vel=4+dist/280;sc_el.textContent=dist+'m';if(obs.some(o=>Math.abs(o.x-38)<22&&dino.y>103)){on=false;const g=Math.floor(dist/3);addPts(j,g);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 '+dist+'m | +'+g+' pts',W/2,H/2);return;}draw();if(on)raf=requestAnimationFrame(loop);}function pular(){if(!on){cancelAnimationFrame(raf);dino={y:108,vy:0};obs=[];dist=0;vel=4;on=true;loop();return;}if(dino.y>=108)dino.vy=-13;}btn.onclick=pular;cv.addEventListener('click',pular);cv.addEventListener('touchstart',e=>{e.preventDefault();pular();},{passive:false});}

function jogoMath(a,j){let sc=0,t=30,iv,on=false;function novaQ(){const ops=['+','-','×'];const op=ops[Math.floor(Math.random()*3)];const x=Math.floor(Math.random()*12)+1,y=Math.floor(Math.random()*12)+1;const res=op==='+'?x+y:op==='-'?x-y:x*y;const err=res+(Math.random()<.5?-(1+Math.floor(Math.random()*5)):(1+Math.floor(Math.random()*5)));const opts=Math.random()<.5?[res,err]:[err,res];return{q:x+' '+op+' '+y+' = ?',res,opts};}let q=novaQ();function render(){a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:16px';a.innerHTML='<div style="font-family:Fredoka,sans-serif;font-size:1.1rem;color:#FFD93D;text-align:center;margin-bottom:12px" id="sc-m">'+sc+' pts | '+t+'s</div><div style="background:#1a1a2e;border-radius:14px;padding:22px;text-align:center;margin-bottom:13px;border:1px solid #2a2a4a"><div style="font-family:Fredoka,sans-serif;font-size:2.2rem;color:#fff;margin-bottom:16px">'+q.q+'</div><div style="display:flex;gap:14px;justify-content:center">'+q.opts.map(o=>'<button class="btn-jogo" style="min-width:76px;font-size:1.2rem" onclick="mResp('+o+')">'+o+'</button>').join('')+'</div></div>'+(!on?'<div style="text-align:center"><button class="btn-jogo" onclick="mStart()">▶ Iniciar</button></div>':'');}window.mResp=r=>{if(!on)return;if(r===q.res){sc+=10;toast('✅');}else{sc=Math.max(0,sc-5);toast('❌');}q=novaQ();render();const el=document.getElementById('sc-m');if(el)el.textContent=sc+' pts | '+t+'s';};window.mStart=()=>{sc=0;t=30;on=true;q=novaQ();clearInterval(iv);iv=setInterval(()=>{t--;const el=document.getElementById('sc-m');if(el)el.textContent=sc+' pts | '+t+'s';if(t<=0){clearInterval(iv);on=false;addPts(j,sc);toast('⏰ +'+sc+' pts!');render();}},1000);render();};render();}

function jogoAim(a,j){const W=300,H=260;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#CB4335;margin-bottom:6px';sc_el.textContent='0 acertos | 20s';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const btn=document.createElement('button');btn.className='btn-jogo';btn.textContent='▶ Iniciar';btn.style='margin:8px auto;display:block';a.appendChild(btn);const ctx=cv.getContext('2d');let ac=0,t=20,alvo,iv,on=false;function novoAlvo(){const r=16+Math.random()*22;alvo={x:r+Math.random()*(W-2*r),y:r+Math.random()*(H-2*r),r};}function draw(){ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,W,H);if(!alvo)return;ctx.beginPath();ctx.arc(alvo.x,alvo.y,alvo.r,0,Math.PI*2);ctx.fillStyle='#FF4757';ctx.fill();ctx.beginPath();ctx.arc(alvo.x,alvo.y,alvo.r*.6,0,Math.PI*2);ctx.fillStyle='#FF6B35';ctx.fill();ctx.beginPath();ctx.arc(alvo.x,alvo.y,alvo.r*.3,0,Math.PI*2);ctx.fillStyle='#FFD93D';ctx.fill();}function click(e){if(!on)return;const rect=cv.getBoundingClientRect();const x=(e.clientX||e.touches[0].clientX)-rect.left;const y=(e.clientY||e.touches[0].clientY)-rect.top;if(alvo&&Math.hypot(x-alvo.x,y-alvo.y)<alvo.r){ac++;sc_el.textContent=ac+' acertos | '+t+'s';novoAlvo();draw();}}cv.addEventListener('click',click);cv.addEventListener('touchstart',e=>{e.preventDefault();click(e);},{passive:false});btn.onclick=()=>{ac=0;t=20;on=true;sc_el.textContent='0 acertos | 20s';clearInterval(iv);iv=setInterval(()=>{t--;sc_el.textContent=ac+' acertos | '+t+'s';if(t<=0){clearInterval(iv);on=false;const g=ac*10;addPts(j,g);toast('🎯 '+ac+' acertos! +'+g+' pts');}},1000);novoAlvo();draw();};}

function jogoReaction(a,j){let estado='inicio',t0,iv;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f0f1a;padding:20px';a.innerHTML='<div style="font-family:Fredoka,sans-serif;font-size:1.5rem;color:#FFD93D;margin-bottom:16px" id="sc-r">---ms</div><div id="rb" style="width:100%;max-width:280px;height:180px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border:2px solid #2a2a4a;cursor:pointer;font-size:1rem;font-weight:700;text-align:center;padding:16px;color:#fff;transition:background .15s">👆 Toque para começar</div>';document.getElementById('rb').onclick=()=>{const b=document.getElementById('rb');if(estado==='inicio'){estado='wait';b.style.background='#3D2B00';b.textContent='⏳ Aguarde...';clearTimeout(iv);iv=setTimeout(()=>{if(estado!=='wait')return;estado='go';t0=Date.now();b.style.background='#0A3D0A';b.textContent='💚 AGORA!';;},1200+Math.random()*2800);}else if(estado==='wait'){estado='inicio';b.style.background='#3D0A0A';b.textContent='😅 Cedo demais!';clearTimeout(iv);setTimeout(()=>{b.style.background='#1a1a2e';b.textContent='👆 Toque para começar';estado='inicio';},1400);}else if(estado==='go'){const ms=Date.now()-t0;document.getElementById('sc-r').textContent=ms+'ms';estado='inicio';b.style.background='#1a1a2e';b.textContent='⚡ '+ms+'ms! Toque para repetir';const g=ms<200?200:ms<350?150:ms<500?100:50;addPts(j,g);}};}

function jogoForca(a,j){const pals=['FUTEBOL','GOLEIRO','CAMPEÃO','DEFENSOR','TORCEDOR','DRIBLAR','MARCADOR','ESCANTEIO','PÊNALTI','TRAVESSÃO'];let pal='',tent=0,max=6,err=[],ok=[];function novo(){pal=pals[Math.floor(Math.random()*pals.length)];tent=0;err=[];ok=[];render();}function render(){const ex=pal.split('').map(l=>ok.includes(l)?l:'_').join(' ');const gan=pal.split('').every(l=>ok.includes(l));const per=tent>=max;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:14px';a.innerHTML='<div style="text-align:center;margin-bottom:10px"><div style="font-family:Fredoka,sans-serif;font-size:1.5rem;letter-spacing:.12em;color:#fff;margin-bottom:6px">'+ex+'</div><div style="color:#FF4757;font-size:.82rem">Erradas: '+err.join(' ')+' | Restam: '+(max-tent)+'</div></div>'+(gan?'<div style="text-align:center;color:#6BCB77;font-weight:800;margin-bottom:10px">🎉 Ganhou! +150 pts</div>':'')+(per?'<div style="text-align:center;color:#FF4757;font-weight:800;margin-bottom:10px">💀 Era: <strong>'+pal+'</strong></div>':'')+(!gan&&!per?'<div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-bottom:12px">'+'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>'<button onclick="fTentar(\''+l+'\')" style="width:32px;height:32px;border-radius:7px;font-weight:700;font-size:.78rem;border:none;cursor:pointer;background:'+(err.includes(l)?'#3D0A0A':ok.includes(l)?'#0A3D0A':'#2a2a4a')+';color:'+(err.includes(l)?'#FF4757':ok.includes(l)?'#6BCB77':'#fff')+'">'+l+'</button>').join('')+'</div>':'<div style="text-align:center"><button class="btn-jogo" onclick="fNovo()">🔄 Nova palavra</button></div>');if(gan){addPts(j,150);};}window.fTentar=l=>{if(err.includes(l)||ok.includes(l))return;if(pal.includes(l))ok.push(l);else{err.push(l);tent++;}render();};window.fNovo=novo;novo();}

function jogo2048(a,j){let board,sc;const cores={'2':'#EEE4DA','4':'#EDE0C8','8':'#F2B179','16':'#F59563','32':'#F67C5F','64':'#F65E3B','128':'#EDCF72','256':'#EDCC61','512':'#EDC850','1024':'#EDC53F','2048':'#EDC22E'};function addTile(){const v=[];board.forEach((r,i)=>r.forEach((x,k)=>{if(!x)v.push([i,k]);}));if(!v.length)return;const[i,k]=v[Math.floor(Math.random()*v.length)];board[i][k]=Math.random()<.9?2:4;}function render(){a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:14px';a.innerHTML='<div style="font-family:Fredoka,sans-serif;font-size:1.1rem;color:#E59866;text-align:center;margin-bottom:10px" id="sc-48">'+sc+' pts</div><div style="background:#BBADA0;border-radius:12px;padding:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:280px;margin:0 auto 12px">'+board.map(r=>r.map(v=>'<div style="aspect-ratio:1;border-radius:7px;display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:'+(v>999?'.9rem':v>99?'1.1rem':'1.3rem')+';font-weight:700;background:'+(v?cores[v]||'#3C3A32':'#CDC1B4')+';color:'+(v>4?'#f9f6f2':'#776E65')+'">'+(v||'')+'</div>').join('')).join('')+'</div><div style="text-align:center"><button class="btn-jogo" onclick="re48()">🔄 Reiniciar</button></div>';}function mover(d){let mv=false;const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]));const rev=m=>m.map(r=>[...r].reverse());let b=board.map(r=>[...r]);if(d==='up')b=rot(b);if(d==='down')b=rev(rot(b));if(d==='right')b=b.map(r=>[...r].reverse());b=b.map(row=>{const f=row.filter(v=>v);for(let i=0;i<f.length-1;i++){if(f[i]===f[i+1]){f[i]*=2;sc+=f[i];f.splice(i+1,1);mv=true;}}const n=[...f,...Array(4-f.length).fill(0)];if(JSON.stringify(n)!==JSON.stringify(row))mv=true;return n;});if(d==='up')b=rot(rot(rot(b)));if(d==='down')b=rot(rev(b));if(d==='right')b=b.map(r=>[...r].reverse());if(mv){board=b;addTile();render();if(board.some(r=>r.some(v=>v===2048))){addPts(j,500);toast('🏆 2048! +500 pts!');}}}function init(){board=Array(4).fill(null).map(()=>Array(4).fill(0));sc=0;addTile();addTile();render();}window.re48=init;document.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();mover('up');}if(e.key==='ArrowDown'){e.preventDefault();mover('down');}if(e.key==='ArrowLeft'){e.preventDefault();mover('left');}if(e.key==='ArrowRight'){e.preventDefault();mover('right');}});let tx=0,ty=0;document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;});document.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy))mover(dx>0?'right':'left');else mover(dy>0?'down':'up');});init();}

function jogoPlataforma(a,j){const W=300,H=380;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#9B59B6;margin-bottom:6px';sc_el.textContent='0 m';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const ctrl=document.createElement('div');ctrl.innerHTML='<div style="display:flex;gap:8px;justify-content:center;margin:8px 0"><button class="ctrl-btn" onpointerdown="plD(-1)" onpointerup="plD(0)">◀</button><button class="btn-jogo" onclick="plStart()">▶ Start</button><button class="ctrl-btn" onpointerdown="plD(1)" onpointerup="plD(0)">▶</button></div>';a.appendChild(ctrl);const ctx=cv.getContext('2d');let player,plats,sc,camY,raf,on=false,dir=0;function novasPlats(yBase){const ps=[];for(let i=0;i<8;i++)ps.push({x:20+Math.random()*(W-80),y:yBase-i*70,w:65+Math.random()*50});return ps;}function draw(){ctx.fillStyle='#0f0f1a';ctx.fillRect(0,0,W,H);plats.forEach(p=>{ctx.fillStyle='#6BCB77';ctx.fillRect(p.x,p.y-camY,p.w,12);ctx.fillStyle='#4DA85A';ctx.fillRect(p.x,p.y-camY,p.w,4);});ctx.font='26px serif';ctx.textAlign='center';ctx.fillText('🦘',player.x,player.y-camY+8);}function loop(){if(!on)return;player.x+=dir*5;player.x=((player.x%W)+W)%W;player.vy+=.5;player.y+=player.vy;if(player.vy>0)plats.forEach(p=>{if(player.x+10>p.x&&player.x-10<p.x+p.w&&Math.abs((player.y+10)-(p.y))<10)player.vy=-13;});const mid=camY+H/2;if(player.y<mid){camY-=(mid-player.y)*.08;const alt=Math.floor(-camY/10);if(alt>sc){sc=alt;sc_el.textContent=sc+'m';}}while(plats[plats.length-1].y>camY-H)plats.push({x:20+Math.random()*(W-80),y:plats[plats.length-1].y-70,w:65+Math.random()*50});if(player.y-camY>H+40){on=false;const g=Math.floor(sc*2);addPts(j,g);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 20px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 '+sc+'m | +'+g+' pts',W/2,H/2);return;}draw();if(on)raf=requestAnimationFrame(loop);}window.plStart=()=>{cancelAnimationFrame(raf);camY=0;plats=novasPlats(H);player={x:W/2,y:H-80,vy:-13};sc=0;on=true;sc_el.textContent='0m';loop();};window.plD=d=>dir=d;document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')dir=-1;if(e.key==='ArrowRight')dir=1;});document.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')dir=0;});}

function jogoMinhoca(a,j){const W=280,H=280,SZ=20;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#8E44AD;margin-bottom:6px';sc_el.textContent='0 comidas';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const ctrl=document.createElement('div');ctrl.innerHTML='<div class="ctrl-grid" style="margin:8px auto"><div></div><button class="ctrl-btn" onclick="miDir(0,-1)">▲</button><div></div><button class="ctrl-btn" onclick="miDir(-1,0)">◀</button><button class="btn-jogo vd" onclick="miStart()" style="width:52px;height:52px;padding:0;border-radius:12px">GO</button><button class="ctrl-btn" onclick="miDir(1,0)">▶</button><div></div><button class="ctrl-btn" onclick="miDir(0,1)">▼</button><div></div></div>';a.appendChild(ctrl);const ctx=cv.getContext('2d');const FOOD=['🍎','🍌','⭐','🍇','🍓'];const C=W/SZ,R=H/SZ;let snake,dir,food,ftype,sc,iv,on=false;window.miStart=()=>{clearInterval(iv);snake=[{x:120,y:120},{x:100,y:120}];dir={x:1,y:0};sc=0;on=true;sc_el.textContent='0 comidas';food={x:Math.floor(Math.random()*C)*SZ,y:Math.floor(Math.random()*R)*SZ};ftype=FOOD[Math.floor(Math.random()*5)];function draw(){ctx.fillStyle='#1A2634';ctx.fillRect(0,0,W,H);snake.forEach((s,i)=>{ctx.fillStyle=`hsl(${270+i*5},70%,${50-i}%)`;ctx.beginPath();ctx.arc(s.x+SZ/2,s.y+SZ/2,SZ/2-1,0,Math.PI*2);ctx.fill();});ctx.font=SZ+'px serif';ctx.textAlign='center';ctx.fillText(ftype,food.x+SZ/2,food.y+SZ-2);}function loop(){const h={x:snake[0].x+dir.x*SZ,y:snake[0].y+dir.y*SZ};if(h.x<0||h.x>=W||h.y<0||h.y>=H||snake.some(s=>s.x===h.x&&s.y===h.y)){clearInterval(iv);on=false;const g=sc*20;addPts(j,g);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 '+sc+' | +'+g+' pts',W/2,H/2);return;}snake.unshift(h);if(h.x===food.x&&h.y===food.y){sc++;sc_el.textContent=sc+' comidas';food={x:Math.floor(Math.random()*C)*SZ,y:Math.floor(Math.random()*R)*SZ};ftype=FOOD[Math.floor(Math.random()*5)];clearInterval(iv);iv=setInterval(loop,Math.max(80,150-sc*4));}else snake.pop();draw();}draw();iv=setInterval(loop,150);};window.miDir=(x,y)=>{if(!on)return;if(x!==0&&dir.x===0)dir={x,y};if(y!==0&&dir.y===0)dir={x,y};};ctx.fillStyle='#1A2634';ctx.fillRect(0,0,W,H);ctx.fillStyle='#8E44AD';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🪱 Pressione GO',W/2,H/2);}

function jogoNaveesp(a,j){const W=280,H=380;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#2980B9;margin-bottom:6px';sc_el.textContent='0 kills | ❤️❤️❤️';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const ctrl=document.createElement('div');ctrl.innerHTML='<div style="display:flex;gap:6px;justify-content:center;margin:8px 0"><button class="ctrl-btn" onpointerdown="nvD(-1)" onpointerup="nvD(0)">◀</button><button class="btn-jogo" onclick="nvStart()">▶ Start</button><button class="btn-jogo vm" onclick="nvFire()">🔫</button><button class="ctrl-btn" onpointerdown="nvD(1)" onpointerup="nvD(0)">▶</button></div>';a.appendChild(ctrl);const ctx=cv.getContext('2d');let nave,balas,inim,sc,vidas,raf,on=false,dir=0,tick=0;window.nvStart=()=>{cancelAnimationFrame(raf);nave={x:W/2};balas=[];inim=[];sc=0;vidas=3;on=true;tick=0;sc_el.textContent='0 kills | ❤️❤️❤️';loop();};window.nvD=d=>dir=d;window.nvFire=()=>{if(on)balas.push({x:nave.x,y:H-50});};cv.addEventListener('click',()=>nvFire());cv.addEventListener('touchstart',e=>{e.preventDefault();nvFire();},{passive:false});function draw(){ctx.fillStyle='#060B14';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,.3)';for(let i=0;i<20;i++)ctx.fillRect((i*97)%W,(i*61+tick/3)%H,1,1);ctx.font='24px serif';ctx.textAlign='center';inim.forEach(e=>ctx.fillText('👾',e.x,e.y));ctx.fillStyle='#FFD93D';balas.forEach(b=>{ctx.fillRect(b.x-2,b.y,4,8);});ctx.font='30px serif';ctx.fillText('🚀',nave.x,H-20);}function loop(){if(!on)return;tick++;nave.x=Math.max(16,Math.min(W-16,nave.x+dir*5));balas.forEach(b=>b.y-=8);balas=balas.filter(b=>b.y>-10);inim.forEach(e=>{e.y+=e.vel;e.x+=Math.sin(tick/18+e.f)*1.5;});if(tick%55===0)inim.push({x:16+Math.random()*(W-32),y:-25,vel:.7+Math.random()*1.1,f:Math.random()*6});for(let bi=balas.length-1;bi>=0;bi--){for(let ei=inim.length-1;ei>=0;ei--){if(Math.abs(balas[bi].x-inim[ei].x)<18&&Math.abs(balas[bi].y-inim[ei].y)<18){balas.splice(bi,1);inim.splice(ei,1);sc++;sc_el.textContent=sc+' kills | '+'❤️'.repeat(vidas);break;}}}for(let ei=inim.length-1;ei>=0;ei--){if(inim[ei].y>H){inim.splice(ei,1);vidas--;sc_el.textContent=sc+' kills | '+'❤️'.repeat(Math.max(0,vidas));if(vidas<=0){on=false;const g=sc*10;addPts(j,g);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 '+sc+' kills | +'+g+' pts',W/2,H/2);return;}}}draw();if(on)raf=requestAnimationFrame(loop);}ctx.fillStyle='#060B14';ctx.fillRect(0,0,W,H);ctx.fillStyle='#4D96FF';ctx.font='bold 17px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('👾 Pressione Start',W/2,H/2);}

function jogoLabirinto(a,j){const SZ=24,C=13,R=13,W=C*SZ,H=R*SZ;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:.9rem;color:#16213E;color:#4D96FF;margin-bottom:6px';sc_el.textContent='0 labirintos';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const ctrl=document.createElement('div');ctrl.innerHTML='<div class="ctrl-grid" style="margin:8px auto"><div></div><button class="ctrl-btn" onclick="lbM(0,-1)">▲</button><div></div><button class="ctrl-btn" onclick="lbM(-1,0)">◀</button><button class="btn-jogo vd" onclick="lbNovo()" style="width:52px;height:52px;padding:0;border-radius:12px;font-size:.7rem">Novo</button><button class="ctrl-btn" onclick="lbM(1,0)">▶</button><div></div><button class="ctrl-btn" onclick="lbM(0,1)">▼</button><div></div></div>';a.appendChild(ctrl);const ctx=cv.getContext('2d');let grid,px,py,sc=0;function gerar(){const g=Array(R).fill(null).map(()=>Array(C).fill(1));const visita=(x,y)=>{g[y][x]=0;const dirs=[[0,-2],[0,2],[-2,0],[2,0]].sort(()=>Math.random()-.5);dirs.forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx>0&&nx<C-1&&ny>0&&ny<R-1&&g[ny][nx]===1){g[y+dy/2][x+dx/2]=0;visita(nx,ny);}});};visita(1,1);return g;}function draw(){ctx.clearRect(0,0,W,H);grid.forEach((row,y)=>row.forEach((v,x)=>{ctx.fillStyle=v?'#1a1a2e':'#2a2a4a';ctx.fillRect(x*SZ,y*SZ,SZ,SZ);}));ctx.font='18px serif';ctx.textAlign='center';ctx.fillText('🚩',(C-2)*SZ+SZ/2,(R-2)*SZ+SZ-2);ctx.fillText('🔵',px*SZ+SZ/2,py*SZ+SZ-2);}window.lbNovo=()=>{grid=gerar();px=1;py=1;draw();};window.lbM=(dx,dy)=>{const nx=px+dx,ny=py+dy;if(nx>=0&&nx<C&&ny>=0&&ny<R&&grid[ny][nx]===0){px=nx;py=ny;}if(px===C-2&&py===R-2){sc++;sc_el.textContent=sc+' labirintos';addPts(j,50);toast('🏁 +50 pts!');setTimeout(()=>window.lbNovo(),500);}draw();};document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')lbM(-1,0);if(e.key==='ArrowRight')lbM(1,0);if(e.key==='ArrowUp')lbM(0,-1);if(e.key==='ArrowDown')lbM(0,1);});let tx=0,ty=0;cv.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;});cv.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>Math.abs(dy))lbM(dx>0?1:-1,0);else lbM(0,dy>0?1:-1);});window.lbNovo();}

function jogoTetris(a,j){const W=180,H=360,SZ=18,C=10,R=20;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#E67E22;margin-bottom:6px';sc_el.textContent='0 pts';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const ctrl=document.createElement('div');ctrl.innerHTML='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:8px 0"><button class="btn-jogo" onclick="tStart()" style="font-size:.78rem;padding:7px 12px">▶ Start</button><button class="btn-jogo" onclick="tRot()" style="font-size:.78rem;padding:7px 12px">🔄</button><button class="ctrl-btn" onclick="tDir(-1)">◀</button><button class="ctrl-btn" onclick="tDir(1)">▶</button><button class="btn-jogo vm" onclick="tDrop()" style="font-size:.78rem;padding:7px 12px">▼</button></div>';a.appendChild(ctrl);const ctx=cv.getContext('2d');const PS=[[[1,1,1,1]],[[1,1],[1,1]],[[1,1,1],[0,1,0]],[[1,1,1],[1,0,0]],[[1,1,1],[0,0,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];const CS=['#FF4757','#FFD93D','#C77DFF','#FF6B35','#4D96FF','#6BCB77','#FF6EB4'];let board,p,px,py,sc,iv,on=false;const nb=()=>Array(R).fill(null).map(()=>Array(C).fill(0));const np=()=>{const i=Math.floor(Math.random()*7);return{s:PS[i].map(r=>[...r]),c:CS[i]};};const ok=(pp,x,y)=>pp.s.every((r,dy)=>r.every((v,dx)=>!v||(y+dy<R&&x+dx>=0&&x+dx<C&&!board[y+dy][x+dx])));function draw(){ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);board.forEach((r,y)=>r.forEach((v,x)=>{if(v){ctx.fillStyle=v;ctx.fillRect(x*SZ+1,y*SZ+1,SZ-2,SZ-2);}}));if(p)p.s.forEach((r,dy)=>r.forEach((v,dx)=>{if(v){ctx.fillStyle=p.c;ctx.fillRect((px+dx)*SZ+1,(py+dy)*SZ+1,SZ-2,SZ-2);}}));}function fix(){p.s.forEach((r,dy)=>r.forEach((v,dx)=>{if(v)board[py+dy][px+dx]=p.c;}));}function clr(){for(let y=R-1;y>=0;y--){if(board[y].every(v=>v)){board.splice(y,1);board.unshift(Array(C).fill(0));sc+=100;y++;}}}function loop(){if(!on)return;if(ok(p,px,py+1)){py++;}else{fix();clr();p=np();px=Math.floor(C/2)-1;py=0;if(!ok(p,px,py)){on=false;clearInterval(iv);addPts(j,sc);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('Game Over! +'+sc,W/2,H/2);return;}}sc_el.textContent=sc+' pts';draw();}window.tStart=()=>{clearInterval(iv);board=nb();p=np();px=4;py=0;sc=0;on=true;sc_el.textContent='0 pts';iv=setInterval(loop,480);draw();};window.tDir=d=>{if(on&&ok(p,px+d,py)){px+=d;draw();}};window.tRot=()=>{if(!on)return;const r=p.s[0].map((_,i)=>p.s.map(row=>row[i]).reverse());const o=p.s;p.s=r;if(!ok(p,px,py))p.s=o;draw();};window.tDrop=()=>{if(!on)return;while(ok(p,px,py+1))py++;loop();};document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')tDir(-1);if(e.key==='ArrowRight')tDir(1);if(e.key==='ArrowUp')tRot();if(e.key==='ArrowDown'){e.preventDefault();tDrop();}});ctx.fillStyle='#1A1A2E';ctx.fillRect(0,0,W,H);ctx.fillStyle='#4D96FF';ctx.font='bold 17px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🟩 Pressione Start',W/2,H/2);}

function jogoAsteroids(a,j){const W=280,H=340;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#1ABC9C;margin-bottom:6px';sc_el.textContent='0 destruídos';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const ctrl=document.createElement('div');ctrl.innerHTML='<div style="display:flex;gap:6px;justify-content:center;margin:8px 0"><button class="ctrl-btn" onpointerdown="asD(-1)" onpointerup="asD(0)">◀</button><button class="btn-jogo" onclick="asStart()">▶ Start</button><button class="btn-jogo vm" onclick="asFire()">🔫</button><button class="ctrl-btn" onpointerdown="asD(1)" onpointerup="asD(0)">▶</button></div>';a.appendChild(ctrl);const ctx=cv.getContext('2d');let nave,balas,asts,sc,raf,on=false,dir=0,tick=0;window.asStart=()=>{cancelAnimationFrame(raf);nave={x:W/2,y:H/2};balas=[];asts=[novoAst(),novoAst(),novoAst()];sc=0;on=true;tick=0;sc_el.textContent='0 destruídos';loop();};window.asD=d=>dir=d;window.asFire=()=>{if(on)balas.push({x:nave.x,y:nave.y-14,vx:0,vy:-8});};cv.addEventListener('click',()=>asFire());cv.addEventListener('touchstart',e=>{e.preventDefault();asFire();},{passive:false});function novoAst(){return{x:Math.random()<.5?-25:W+25,y:Math.random()*H,vx:(Math.random()-.5)*2.2,vy:(Math.random()-.5)*2.2,r:14+Math.random()*18};}function draw(){ctx.fillStyle='#0D1117';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,.3)';for(let i=0;i<18;i++)ctx.fillRect((i*97)%W,(i*61)%H,1,1);balas.forEach(b=>{ctx.fillStyle='#FFD93D';ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();});asts.forEach(a=>{ctx.strokeStyle='#aaa';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.stroke();});ctx.font='26px serif';ctx.textAlign='center';ctx.fillText('🚀',nave.x,nave.y);}function loop(){if(!on)return;tick++;nave.x=Math.max(14,Math.min(W-14,nave.x+dir*5));balas.forEach(b=>{b.x+=b.vx;b.y+=b.vy;});balas=balas.filter(b=>b.x>-10&&b.x<W+10&&b.y>-10&&b.y<H+10);asts.forEach(a=>{a.x+=a.vx;a.y+=a.vy;if(a.x<-40)a.x=W+40;if(a.x>W+40)a.x=-40;if(a.y<-40)a.y=H+40;if(a.y>H+40)a.y=-40;});for(let bi=balas.length-1;bi>=0;bi--){for(let ai=asts.length-1;ai>=0;ai--){if(Math.hypot(balas[bi].x-asts[ai].x,balas[bi].y-asts[ai].y)<asts[ai].r){balas.splice(bi,1);sc++;sc_el.textContent=sc+' destruídos';if(asts[ai].r>20)asts.push({x:asts[ai].x,y:asts[ai].y,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,r:asts[ai].r/2});asts.splice(ai,1);break;}}}if(asts.some(a=>Math.hypot(nave.x-a.x,nave.y-a.y)<a.r+12)){on=false;const g=sc*12;addPts(j,g);ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💥 '+sc+' | +'+g+' pts',W/2,H/2);return;}if(tick%80===0)asts.push(novoAst());draw();if(on)raf=requestAnimationFrame(loop);}ctx.fillStyle='#0D1117';ctx.fillRect(0,0,W,H);ctx.fillStyle='#1ABC9C';ctx.font='bold 17px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('☄️ Pressione Start',W/2,H/2);}

function jogoWordle(a,j){const PALS=['GRATO','PEDRA','CHUVA','BRISA','CAMPO','PRAIA','CLUBE','PORTA','LIVRO','FUNDO','CLARO','MARCA','FESTA','MUNDO','PLANO','BANCO','VENTO','PRETO','FILHO','PODER'];let alvo,tent,cur,gan,per;function novo(){alvo=PALS[Math.floor(Math.random()*PALS.length)];tent=[];cur='';gan=false;per=false;render();}function cor(t,i){const l=t[i];if(alvo[i]===l)return'#6BCB77';if(alvo.includes(l))return'#FFD93D';return'#555';}function render(){a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:14px';const rows=tent.map(t=>'<div style="display:flex;gap:4px;justify-content:center;margin-bottom:4px">'+t.split('').map((l,i)=>'<div style="width:38px;height:38px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:1.1rem;font-weight:700;background:'+cor(t,i)+';color:#fff">'+l+'</div>').join('')+'</div>').join('');const cur_row=!gan&&!per?'<div style="display:flex;gap:4px;justify-content:center;margin-bottom:4px">'+Array(5).fill(0).map((_,i)=>{const l=cur[i]||'';return'<div style="width:38px;height:38px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:Fredoka,sans-serif;font-size:1.1rem;font-weight:700;background:'+(l?'#4D96FF':'#2a2a4a')+';border:1px solid '+(l?'#4D96FF':'#3a3a5a')+';color:#fff">'+l+'</div>';}).join('')+'</div>':'';const vaz=!gan&&!per?Array(Math.max(0,5-tent.length)).fill('<div style="display:flex;gap:4px;justify-content:center;margin-bottom:4px">'+Array(5).fill('<div style="width:38px;height:38px;border-radius:6px;background:#1a1a2e;border:1px solid #2a2a4a"></div>').join('')+'</div>').join(''):'';const lU={};tent.forEach(t=>t.split('').forEach((l,i)=>{if(alvo[i]===l)lU[l]='ok';else if(alvo.includes(l)&&lU[l]!=='ok')lU[l]='meio';else if(!lU[l])lU[l]='nao';}));const tc={ok:'#6BCB77',meio:'#FFD93D',nao:'#555'};const tec=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map(row=>'<div style="display:flex;gap:3px;justify-content:center;margin-bottom:3px">'+row.split('').map(l=>'<button onclick="wTc(\''+l+'\')" style="width:26px;height:34px;border-radius:5px;font-weight:700;font-size:.68rem;border:none;cursor:pointer;background:'+(lU[l]?tc[lU[l]]:'#2a2a4a')+';color:#fff">'+l+'</button>').join('')+'</div>').join('');a.innerHTML='<div style="font-family:Fredoka,sans-serif;font-size:.9rem;color:#1E8449;text-align:center;margin-bottom:8px">'+(6-tent.length)+' tentativas | '+alvo.length+' letras</div>'+rows+cur_row+vaz+(gan?'<div style="text-align:center;color:#6BCB77;font-weight:800;font-family:Fredoka,sans-serif;margin:8px 0">🎉 +'+Math.max(50,200-tent.length*30)+' pts!</div>':'')+(per?'<div style="text-align:center;color:#FF4757;font-weight:800;margin:8px 0">Era: <strong>'+alvo+'</strong></div>':'')+(!gan&&!per?tec+'<div style="display:flex;gap:6px;justify-content:center;margin-top:6px"><button class="btn-jogo vm" onclick="wDel()" style="padding:8px 14px">⌫</button><button class="btn-jogo vd" onclick="wEnter()" style="padding:8px 14px">✓</button></div>':'<div style="text-align:center;margin-top:8px"><button class="btn-jogo" onclick="wNovo()">🔄 Nova</button></div>');}window.wTc=l=>{if(cur.length<5&&!gan&&!per){cur+=l;render();}};window.wDel=()=>{if(!gan&&!per){cur=cur.slice(0,-1);render();}};window.wEnter=()=>{if(cur.length<5){toast('⚠️ 5 letras!');return;}tent.push(cur);if(cur===alvo){gan=true;const g=Math.max(50,200-tent.length*30);addPts(j,g);}else if(tent.length>=6)per=true;else cur='';render();};window.wNovo=novo;document.addEventListener('keydown',e=>{if(e.key==='Enter')wEnter();else if(e.key==='Backspace')wDel();else if(/^[a-zA-Z]$/.test(e.key))wTc(e.key.toUpperCase());});novo();}

function jogoPiano(a,j){const W=260,H=360,COLS=4;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#212F3D;color:#C77DFF;margin-bottom:6px';sc_el.textContent='0 notas | 30s';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const btn=document.createElement('button');btn.className='btn-jogo';btn.textContent='▶ Iniciar';btn.style='margin:8px auto;display:block';a.appendChild(btn);const ctx=cv.getContext('2d');const CW=W/COLS,TH=80;let tiles=[],sc=0,vidas=3,t=30,iv,raf,on=false,spd=3;function draw(){ctx.fillStyle='#F8F9FA';ctx.fillRect(0,0,W,H);for(let i=1;i<COLS;i++){ctx.fillStyle='#ddd';ctx.fillRect(i*CW,0,1,H);}tiles.forEach(t=>{if(!t.hit){ctx.fillStyle='#1A1A2E';ctx.fillRect(t.col*CW+2,t.y,CW-4,TH-4);}});ctx.fillStyle='rgba(255,180,0,.1)';ctx.fillRect(0,H-TH,W,TH);}function loop(){if(!on)return;tiles.forEach(t=>t.y+=spd);tiles.forEach((t,i)=>{if(!t.hit&&t.y>H){tiles.splice(i,1);vidas--;sc_el.textContent=sc+' notas | '+t+'s | '+'❤️'.repeat(Math.max(0,vidas));if(vidas<=0)fim();}});if(tiles.length<5&&Math.random()<.05)tiles.push({col:Math.floor(Math.random()*COLS),y:-TH,hit:false});draw();if(on)raf=requestAnimationFrame(loop);}function fim(){on=false;clearInterval(iv);const g=sc*8;addPts(j,g);ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('🎹 '+sc+' notas! +'+g+' pts',W/2,H/2);}function click(e){if(!on)return;const rect=cv.getBoundingClientRect();const cx=((e.clientX||e.touches[0].clientX)-rect.left)*(W/rect.width);const cy=((e.clientY||e.touches[0].clientY)-rect.top)*(H/rect.height);const col=Math.floor(cx/(W/COLS));let ok=false;tiles.forEach(t=>{if(!t.hit&&t.col===col&&cy>t.y&&cy<t.y+TH){t.hit=true;ok=true;}});if(ok){sc++;spd=3+sc/30;sc_el.textContent=sc+' notas | '+t+'s';}else{vidas--;if(vidas<=0)fim();}}cv.addEventListener('click',click);cv.addEventListener('touchstart',e=>{e.preventDefault();click(e);},{passive:false});btn.onclick=()=>{tiles=[];sc=0;vidas=3;t=30;spd=3;on=true;clearInterval(iv);iv=setInterval(()=>{t--;sc_el.textContent=sc+' notas | '+t+'s';if(t<=0){clearInterval(iv);fim();}},1000);loop();};}

function jogoNinja(a,j){const W=280,H=300;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#1B2631;color:#FFD93D;margin-bottom:6px';sc_el.textContent='0 cortes | 30s';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const btn=document.createElement('button');btn.className='btn-jogo vm';btn.textContent='▶ Iniciar';btn.style='margin:8px auto;display:block';a.appendChild(btn);const ctx=cv.getContext('2d');const FRUTS=['🍎','🍊','🍋','🍇','🍓','🍑'];let frutas=[],sc=0,vidas=3,t=30,iv,raf,on=false,trail=[];function draw(){ctx.fillStyle='#1B2631';ctx.fillRect(0,0,W,H);if(trail.length>1){ctx.strokeStyle='rgba(255,220,0,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);trail.forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();}frutas.forEach(f=>{if(!f.ok){ctx.font='36px serif';ctx.textAlign='center';ctx.fillText(f.emoji,f.x,f.y);}});}function loop(){if(!on)return;frutas.forEach(f=>{f.x+=f.vx;f.y+=f.vy;f.vy+=.3;});frutas=frutas.filter(f=>f.y<H+40);if(frutas.length<5&&Math.random()<.05)frutas.push({x:20+Math.random()*(W-40),y:H+20,vx:(Math.random()-.5)*3,vy:-(5+Math.random()*4),emoji:Math.random()<.15?'💣':FRUTS[Math.floor(Math.random()*6)],r:20,ok:false});trail=trail.slice(-10);draw();if(on)raf=requestAnimationFrame(loop);}function slice(x,y){frutas.forEach(f=>{if(!f.ok&&Math.hypot(x-f.x,y-f.y)<f.r){f.ok=true;if(f.emoji==='💣'){vidas--;toast('💣 Bomba!');}else{sc++;sc_el.textContent=sc+' cortes | '+t+'s';}}});}let drag=false;const getP=(e,r)=>({x:((e.clientX||e.touches[0].clientX)-r.left)*(W/r.width),y:((e.clientY||e.touches[0].clientY)-r.top)*(H/r.height)});cv.addEventListener('mousedown',e=>{drag=true;const r=cv.getBoundingClientRect();const p=getP(e,r);trail=[p];slice(p.x,p.y);});cv.addEventListener('mousemove',e=>{if(!drag)return;const r=cv.getBoundingClientRect();const p=getP(e,r);trail.push(p);slice(p.x,p.y);});cv.addEventListener('mouseup',()=>{drag=false;trail=[];});cv.addEventListener('touchstart',e=>{e.preventDefault();const r=cv.getBoundingClientRect();const p=getP(e,r);trail=[p];slice(p.x,p.y);},{passive:false});cv.addEventListener('touchmove',e=>{e.preventDefault();const r=cv.getBoundingClientRect();const p=getP(e,r);trail.push(p);slice(p.x,p.y);},{passive:false});cv.addEventListener('touchend',()=>{trail=[];});btn.onclick=()=>{frutas=[];sc=0;vidas=3;t=30;on=true;clearInterval(iv);iv=setInterval(()=>{t--;sc_el.textContent=sc+' cortes | '+t+'s';if(vidas<=0||t<=0){clearInterval(iv);on=false;const g=sc*16;addPts(j,g);toast('🥷 +'+g+' pts!');cancelAnimationFrame(raf);}},1000);loop();};}

function jogoSpeedmath(a,j){let sc=0,t=20,iv,on=false,str=0;function novaQ(){const ops=['+','-','×','÷'];const op=ops[Math.floor(Math.random()*4)];let x=Math.floor(Math.random()*15)+2,y=Math.floor(Math.random()*10)+2,res;if(op==='+')res=x+y;else if(op==='-'){res=Math.abs(x-y);x=Math.max(x,y);y=Math.abs(x-y);}else if(op==='×')res=x*y;else{res=x;x=res*y;}const err=res+(Math.random()<.5?-(1+Math.floor(Math.random()*9)):(1+Math.floor(Math.random()*9)));const opts=Math.random()<.5?[res,err]:[err,res];return{q:x+' '+op+' '+y+' = ?',res,opts};}let q=novaQ();function render(){a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:16px';a.innerHTML='<div style="font-family:Fredoka,sans-serif;font-size:1rem;text-align:center;margin-bottom:10px;color:#6C3483;color:#C77DFF" id="sc-sm">'+sc+' pts | '+t+'s | combo: '+str+'x</div><div style="background:linear-gradient(135deg,#1a0a2e,#2a1a4e);border-radius:14px;padding:22px;text-align:center;margin-bottom:12px;border:1px solid #3a2a5e"><div style="font-family:Fredoka,sans-serif;font-size:2rem;color:#fff;margin-bottom:14px">'+q.q+'</div><div style="display:flex;gap:12px;justify-content:center">'+q.opts.map(o=>'<button class="btn-jogo" style="min-width:76px;font-size:1.2rem;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2)" onclick="smR('+o+')">'+o+'</button>').join('')+'</div></div>'+(!on?'<div style="text-align:center"><button class="btn-jogo" onclick="smS()">▶ Iniciar</button></div>':'');}window.smR=r=>{if(!on)return;if(r===q.res){str++;const b=10+str*5;sc+=b;toast('✅ +'+b+'!');}else{str=0;sc=Math.max(0,sc-15);toast('❌ -15');}q=novaQ();render();const el=document.getElementById('sc-sm');if(el)el.textContent=sc+' pts | '+t+'s | combo: '+str+'x';};window.smS=()=>{sc=0;t=20;on=true;str=0;q=novaQ();clearInterval(iv);iv=setInterval(()=>{t--;const el=document.getElementById('sc-sm');if(el)el.textContent=sc+' pts | '+t+'s | combo: '+str+'x';if(t<=0){clearInterval(iv);on=false;addPts(j,sc);toast('🧮 +'+sc+' pts!');render();}},1000);render();};render();}

function jogoDarkjump(a,j){const W=280,H=380;a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;background:#0f0f1a;overflow-y:auto;padding:10px';const sc_el=document.createElement('div');sc_el.style.cssText='text-align:center;font-family:Fredoka,sans-serif;font-size:1rem;color:#FF4757;margin-bottom:6px';sc_el.textContent='0 m — MODO EXTREMO';const cv=canvas2D(a,W,H);a.appendChild(sc_el);const btn=document.createElement('button');btn.className='btn-jogo vm';btn.textContent='💀 Pular / Iniciar';btn.style='margin:8px auto;display:block';a.appendChild(btn);const ctx=cv.getContext('2d');let player,obs,dist,vel,raf,on=false,tick=0;function draw(){ctx.fillStyle='#0D0D0D';ctx.fillRect(0,0,W,H);ctx.fillStyle='#222';ctx.fillRect(0,H-38,W,38);obs.forEach(o=>{const vis=o.inv?(tick%40<20):true;if(vis){ctx.fillStyle=o.inv?'rgba(255,0,0,.4)':'#FF4757';ctx.fillRect(o.x,H-38-o.h,20,o.h);}});ctx.font='28px serif';ctx.textAlign='center';ctx.fillText('💀',player.x,player.y+8);}function loop(){tick++;player.vy+=.8;player.y+=player.vy;if(player.y>=H-68){player.y=H-68;player.vy=0;}obs.forEach(o=>o.x-=vel);obs=obs.filter(o=>o.x>-25);if(obs.length<5&&Math.random()<.03)obs.push({x:W+20,h:18+Math.random()*55,inv:Math.random()<.35});dist++;vel=5+dist/140;sc_el.textContent=dist+'m — MODO EXTREMO';const col=obs.some(o=>{const vis=o.inv?(tick%40<20):true;return vis&&Math.abs(o.x-player.x)<20&&player.y>H-38-o.h-28;});if(col){on=false;const g=Math.floor(dist/2);addPts(j,g);ctx.fillStyle='rgba(255,0,0,.25)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 18px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillText('💀 MORREU! '+dist+'m | +'+g+' pts',W/2,H/2);return;}draw();if(on)raf=requestAnimationFrame(loop);}function pular(){if(!on){cancelAnimationFrame(raf);player={x:55,y:H-68,vy:0};obs=[];dist=0;vel=5;tick=0;on=true;loop();return;}if(player.y>=H-70)player.vy=-15;}btn.onclick=pular;cv.addEventListener('click',pular);cv.addEventListener('touchstart',e=>{e.preventDefault();pular();},{passive:false});}

function jogoEmBreve(a,j){a.style.cssText='width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f0f1a;padding:20px;text-align:center';a.innerHTML='<div style="font-size:3.5rem;margin-bottom:14px">'+j.emoji+'</div><h3 style="font-family:Fredoka,sans-serif;font-size:1.5rem;margin-bottom:8px;background:linear-gradient(135deg,#4D96FF,#C77DFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent">'+j.nome+'</h3><div style="background:#1a1a2e;border-radius:14px;padding:16px;border:1px solid #2a2a4a"><p style="font-weight:800;color:#FF6B35;font-size:.95rem">+'+j.pts+' pts quando disponível</p></div>';}
