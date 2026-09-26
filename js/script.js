(function(){
  const canvas = document.getElementById('hero-canvas');
  const hero = document.querySelector('.hero');
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(hero.clientWidth, hero.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, hero.clientWidth/hero.clientHeight, 0.1, 1000);
  camera.position.z = 60;

  // Neural network node cloud
  const NODE_COUNT = 140;
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const cyanMat = new THREE.MeshBasicMaterial({color:0x00f5ff});
  const violetMat = new THREE.MeshBasicMaterial({color:0x8b6bff});

  const group = new THREE.Group();
  scene.add(group);

  for(let i=0;i<NODE_COUNT;i++){
    const mat = Math.random() > 0.6 ? violetMat : cyanMat;
    const mesh = new THREE.Mesh(nodeGeo, mat);
    const x = (Math.random()-0.5) * 110;
    const y = (Math.random()-0.5) * 70;
    const z = (Math.random()-0.5) * 80;
    mesh.position.set(x,y,z);
    mesh.userData = {
      base: new THREE.Vector3(x,y,z),
      speed: 0.2 + Math.random()*0.4,
      offset: Math.random()*Math.PI*2
    };
    group.add(mesh);
    nodes.push(mesh);
  }

  // Connections: line segments between nearby nodes
  const lineMat = new THREE.LineBasicMaterial({color:0x2a4a5a, transparent:true, opacity:0.35});
  const lineGeo = new THREE.BufferGeometry();
  const maxDist = 22;
  let linePositions = [];

  function buildLines(){
    linePositions = [];
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a = nodes[i].position, b = nodes[j].position;
        const d = a.distanceTo(b);
        if(d < maxDist){
          linePositions.push(a.x,a.y,a.z, b.x,b.y,b.z);
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  }
  buildLines();
  const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineSegments);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e)=>{
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  });

  let frame = 0;
  let lineRebuildCounter = 0;
  function animate(){
    frame += 0.01;
    lineRebuildCounter++;

    nodes.forEach((n)=>{
      const d = n.userData;
      n.position.x = d.base.x + Math.sin(frame*d.speed + d.offset) * 2;
      n.position.y = d.base.y + Math.cos(frame*d.speed + d.offset) * 2;
    });

    // Rebuild connection lines periodically (perf-friendly)
    if(lineRebuildCounter % 6 === 0){
      buildLines();
    }

    group.rotation.y += 0.0009;
    group.rotation.x = mouseY * 0.15;
    camera.position.x += (mouseX*8 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY*8 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', ()=>{
    camera.aspect = hero.clientWidth / hero.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(hero.clientWidth, hero.clientHeight);
  });

  // Respect reduced motion
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    renderer.render(scene, camera);
  }
})();

// Card mouse-glow tracking
document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  });
});

// ---- ROLE CYCLE ----
(function(){
  const el = document.getElementById('roleCycle');
  if(!el) return;
  const roles = [
    'Data Scientist Intern',
    'Machine Learning Engineer Intern',
    'Data Analyst Intern',
    'AI/ML Intern',
    'Data Engineer Intern',
    'Software Engineer Intern'
  ];
  let i = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;
  setInterval(()=>{
    el.classList.add('switching');
    setTimeout(()=>{
      i = (i + 1) % roles.length;
      el.textContent = roles[i];
      el.classList.remove('switching');
    }, 350);
  }, 2400);
})();

// ---- HERO PHOTO TILT ----
(function(){
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const outer = document.querySelector('.hero-photo-outer');
  const frame = document.getElementById('photoFrame');
  if(!isFinePointer || !outer || !frame) return;
  outer.addEventListener('mousemove', (e)=>{
    const rect = outer.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    frame.style.transform = `scale(1) rotateY(${relX*22}deg) rotateX(${-relY*22}deg)`;
  });
  outer.addEventListener('mouseleave', ()=>{
    frame.style.transform = '';
  });
})();

// ---- PRELOADER ----
window.addEventListener('load', ()=>{
  const pre = document.getElementById('preloader');
  setTimeout(()=>{
    pre.classList.add('hidden');
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    setTimeout(()=>{
      const frame = document.getElementById('photoFrame');
      if(frame) frame.classList.add('tilt-ready');
    }, 1100);
  }, 1500);
});

// ---- MAGNETIC BUTTONS ----
(function(){
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!isFinePointer) return;
  const magnets = document.querySelectorAll('.btn, .contact-link, .filter-btn');
  magnets.forEach(el=>{
    el.addEventListener('mousemove', (e)=>{
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width/2;
      const relY = e.clientY - rect.top - rect.height/2;
      el.style.transform = `translate(${relX*0.25}px, ${relY*0.35}px)`;
    });
    el.addEventListener('mouseleave', ()=>{
      el.style.transform = 'translate(0,0)';
    });
  });
})();

// ---- SCROLL REVEAL ----
(function(){
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.15, rootMargin:'0px 0px -60px 0px'});
  revealEls.forEach(el=>io.observe(el));
})();

// ---- PARALLAX SCROLL ----
(function(){
  const blobs = document.querySelectorAll('.blob');
  const heroInner = document.querySelector('.hero-inner');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion || blobs.length === 0) return;
  let ticking = false;

  function update(){
    const y = window.scrollY;
    blobs.forEach(b=>{
      const speed = parseFloat(b.dataset.speed) || 0.2;
      b.style.transform = (b.style.transform.includes('translateX(-50%)') ? 'translateX(-50%) ' : '') + `translateY(${y*speed*0.15}px)`;
    });
    if(heroInner){
      const fade = Math.max(0, 1 - y/600);
      heroInner.style.transform = `translateY(${Math.min(y*0.25,120)}px)`;
      heroInner.style.opacity = fade;
    }
    ticking = false;
  }
  window.addEventListener('scroll', ()=>{
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, {passive:true});
  update();
})();

// ---- AUTO-COUNT PROJECTS ----
(function(){
  const statEl = document.getElementById('projectsStat');
  if(!statEl) return;
  const count = document.querySelectorAll('#models .projects-grid > .card').length;
  if(count > 0) statEl.dataset.count = String(count);
})();

// ---- COUNT-UP STATS ----
(function(){
  const nums = document.querySelectorAll('.stat-num[data-count]');
  if(nums.length === 0) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.decimal ? parseInt(el.dataset.decimal) : 0;
      const duration = 1200;
      const startTime = performance.now();
      function tick(now){
        const progress = Math.min((now - startTime)/duration, 1);
        const eased = 1 - Math.pow(1-progress, 3);
        const value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if(progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals) + suffix;
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, {threshold:0.5});
  nums.forEach(n=>io.observe(n));
})();

// ---- BUTTON RIPPLE (micro-interaction) ----
document.querySelectorAll('.btn, .filter-btn').forEach(btn=>{
  btn.addEventListener('click', function(e){
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(()=>ripple.remove(), 650);
  });
});

// ---- 3D FLOATING OBJECT (About section) ----
(function(){
  const wrap = document.getElementById('float3dWrap');
  const canvas = document.getElementById('about-canvas');
  if(!wrap || !canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(220, 220);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 5.5;

  const geo = new THREE.IcosahedronGeometry(1.6, 0);
  const wireMat = new THREE.MeshBasicMaterial({color:0x00f5ff, wireframe:true, transparent:true, opacity:0.85});
  const shape = new THREE.Mesh(geo, wireMat);
  scene.add(shape);

  const innerGeo = new THREE.IcosahedronGeometry(0.9, 0);
  const innerMat = new THREE.MeshBasicMaterial({color:0x8b6bff, wireframe:true, transparent:true, opacity:0.5});
  const innerShape = new THREE.Mesh(innerGeo, innerMat);
  scene.add(innerShape);

  let dragging = false;
  let lastX = 0, lastY = 0;
  let velX = 0.004, velY = 0.006;
  let manualVelX = 0, manualVelY = 0;

  wrap.addEventListener('pointerdown', (e)=>{
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    manualVelX = dy * 0.008;
    manualVelY = dx * 0.008;
    shape.rotation.x += manualVelX;
    shape.rotation.y += manualVelY;
    innerShape.rotation.x += manualVelX * 1.3;
    innerShape.rotation.y += manualVelY * 1.3;
    lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('pointerup', ()=>{ dragging = false; });

  // Scroll-linked extra spin (motion-driven layout)
  let scrollSpin = 0;
  window.addEventListener('scroll', ()=>{
    scrollSpin = window.scrollY * 0.0003;
  }, {passive:true});

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(){
    if(!dragging && !reduceMotion){
      shape.rotation.x += velX + scrollSpin*0.2;
      shape.rotation.y += velY;
      innerShape.rotation.x -= velX*1.2;
      innerShape.rotation.y -= velY*1.2;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) wrap.classList.add('in');
    });
  }, {threshold:0.2});
  io.observe(wrap);
})();

// ---- TIMELINE SCROLL ANIMATION ----
(function(){
  const timelineEl = document.getElementById('timelineEl');
  const progressEl = document.getElementById('timelineProgress');
  const items = document.querySelectorAll('#log .t-item');
  if(!timelineEl || !items.length) return;

  // Individual item reveal, staggered as each crosses into view
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry, i)=>{
      if(entry.isIntersecting){
        const idx = Array.from(items).indexOf(entry.target);
        setTimeout(()=>entry.target.classList.add('in'), idx * 90);
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.3, rootMargin:'0px 0px -60px 0px'});
  items.forEach(item=>io.observe(item));

  // Progress line fills as the timeline scrolls through the viewport
  function updateProgress(){
    const rect = timelineEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    if(total <= 0) return;
    const scrolled = Math.min(Math.max(vh * 0.75 - rect.top, 0), total);
    const pct = (scrolled / total) * 100;
    if(progressEl) progressEl.style.height = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, {passive:true});
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();

// ---- CONTACT FORM (mailto — no backend needed) ----
(function(){
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— From: ${name} (${email})`);
    window.location.href = `mailto:sarasiperera25@gmail.com?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email app…';
    status.classList.add('success');
  });
})();

// ---- PROJECT FILTER ----
(function(){
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('#models .card');
  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      buttons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card=>{
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hide-card', !show);
      });
    });
  });
})();