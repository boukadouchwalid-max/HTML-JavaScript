// ══════════════════════════════════════════════
//  PROMEUBLE – Main JavaScript
// ══════════════════════════════════════════════

// ── 1. GOLD PARTICLES ──
(function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeParticle() {
    return {
      x: rand(0, W),
      y: rand(0, H),
      r: rand(0.5, 2.2),
      dx: rand(-0.18, 0.18),
      dy: rand(-0.32, -0.08),
      alpha: rand(0.15, 0.7),
      dAlpha: rand(0.002, 0.006) * (Math.random() > 0.5 ? 1 : -1),
    };
  }

  for (let i = 0; i < 90; i++) particles.push(makeParticle());

  const GOLD_COLORS = ['#c9a84c', '#e8cc80', '#f0d88a', '#9a6f28'];

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      const color = GOLD_COLORS[i % GOLD_COLORS.length];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      p.alpha += p.dAlpha;

      if (p.alpha <= 0.05 || p.alpha >= 0.75) p.dAlpha *= -1;
      if (p.y < -10) { p.y = H + 5; p.x = rand(0, W); }
      if (p.x < -10 || p.x > W + 10) { p.x = rand(0, W); p.y = H; }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── 2. HEADER SCROLL EFFECT ──
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── 3. CART STATE ──
let cart = [];
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlayBg = document.getElementById('cartOverlayBg');
const cartItemsEl = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.querySelector('.cart-count');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlayBg.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlayBg.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('btn-cart').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlayBg.addEventListener('click', closeCart);

function formatPrice(n) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
}

function renderCart() {
  const count = cart.reduce((a, i) => a + i.qty, 0);
  cartCountEl.textContent = count;
  if (!cart.length) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Votre panier est vide.</p>';
    cartFooter.style.display = 'none';
    return;
  }
  cartFooter.style.display = 'block';
  let html = '', total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    html += `
      <div class="cart-item">
        <div class="cart-item-thumb"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div style="font-size:.72rem;color:#666;margin-top:5px;">Qté: ${item.qty}</div>
        </div>
        <button class="cart-item-remove" data-idx="${idx}">✕</button>
      </div>`;
  });
  cartItemsEl.innerHTML = html;
  cartTotalEl.textContent = formatPrice(total);
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.splice(+btn.dataset.idx, 1);
      renderCart();
    });
  });
}

document.querySelectorAll('.btn-add-cart').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const name = btn.dataset.name, price = +btn.dataset.price;
    const ex = cart.find(i => i.name === name);
    if (ex) ex.qty++; else cart.push({ name, price, qty: 1 });
    renderCart();
    openCart();
    // ripple feedback
    btn.textContent = '✓ Ajouté';
    btn.style.background = 'linear-gradient(135deg,#c9a84c,#f0d080)';
    btn.style.color = '#0a0a0a';
    setTimeout(() => {
      btn.textContent = 'Ajouter au panier';
      btn.style.background = '';
      btn.style.color = '';
    }, 1600);
  });
});

// ── 4. SEARCH ──
const searchOverlay = document.getElementById('searchOverlay');
document.getElementById('btn-search').addEventListener('click', () => {
  searchOverlay.classList.add('open');
  setTimeout(() => document.getElementById('searchInput').focus(), 120);
});
document.getElementById('searchClose').addEventListener('click', () => searchOverlay.classList.remove('open'));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { searchOverlay.classList.remove('open'); closeCart(); }
});

// ── 5. NEWSLETTER ──
document.getElementById('newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  const inp = document.getElementById('emailInput');
  if (!inp.value) return;
  const btn = e.target.querySelector('button');
  btn.textContent = '✓';
  inp.value = '';
  setTimeout(() => btn.textContent = '→', 2000);
});

// ── 6. ACTIVE NAV on scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => navObs.observe(s));

// ── 7. SCROLL REVEAL ──
const revealEls = document.querySelectorAll(
  '.product-card, .cat-card, .value-item, .stat-item, .designers-grid, .insta-post, .brand-intro-grid'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // stagger delay for children in same parent
      const siblings = [...e.target.parentElement.children];
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = `${idx * 90}ms`;
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObs.observe(el));

// ── 8. COUNTER ANIMATION ──
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(ease * target).toLocaleString('fr-FR');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('fr-FR');
  };
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target = +e.target.dataset.target;
      animateCounter(e.target, target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.stat-number').forEach(el => counterObs.observe(el));

// ── 9. CATEGORY FILTERING ──
const products = document.querySelectorAll('.product-card');
const catCards = document.querySelectorAll('.cat-card');

catCards.forEach(card => {
  card.addEventListener('click', () => {
    // Toggle active state on category
    const isActive = card.classList.contains('active-filter');
    catCards.forEach(c => c.classList.remove('active-filter'));

    if (isActive) {
      // Remove filter if clicking active category again
      products.forEach(p => p.classList.remove('hide'));
    } else {
      card.classList.add('active-filter');
      const targetCat = card.dataset.cat.toLowerCase();
      
      products.forEach(p => {
        const pCatText = p.querySelector('.product-cat').textContent.toLowerCase();
        if (pCatText.includes(targetCat)) {
          p.classList.remove('hide');
        } else {
          p.classList.add('hide');
        }
      });
    }

    // Scroll to products
    const diff = document.querySelector('.latest-creations').offsetTop - 100;
    window.scrollTo({ top: diff, behavior: 'smooth' });
  });
});

// ── 10. PRODUCT QUICK VIEW MODAL ──
const productModal = document.getElementById('productModal');
const productModalClose = document.getElementById('productModalClose');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalAddToCart = document.getElementById('modalAddToCart');

products.forEach(card => {
  card.addEventListener('click', (e) => {
    // Ignore if clicking the add to cart button directly
    if (e.target.closest('.btn-add-cart')) return;

    const imgEl = card.querySelector('.product-img img');
    const nameEl = card.querySelector('.product-name');
    const priceEl = card.querySelector('.product-price');
    const btnData = card.querySelector('.btn-add-cart'); // for data-price/name

    modalImg.src = imgEl.src;
    modalTitle.textContent = nameEl.textContent;
    modalPrice.textContent = priceEl.textContent;
    
    modalAddToCart.dataset.name = btnData.dataset.name;
    modalAddToCart.dataset.price = btnData.dataset.price;

    productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

productModalClose.addEventListener('click', () => {
  productModal.classList.remove('open');
  document.body.style.overflow = '';
});

// modal addToCart click handling
modalAddToCart.addEventListener('click', (e) => {
  const name = e.target.dataset.name, price = +e.target.dataset.price;
  const ex = cart.find(i => i.name === name);
  if (ex) ex.qty++; else cart.push({ name, price, qty: 1 });
  renderCart();
  
  // Close product modal and open cart sidebar
  productModal.classList.remove('open');
  openCart();
});

// ── 11. USER AUTH MODAL ──
const userModal = document.getElementById('userModal');
const userModalClose = document.getElementById('userModalClose');
const btnUser = document.getElementById('btn-user');

btnUser.addEventListener('click', () => {
  userModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});

userModalClose.addEventListener('click', () => {
  userModal.classList.remove('open');
  document.body.style.overflow = '';
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orgText = btn.textContent;
  btn.textContent = 'Connexion...';
  setTimeout(() => {
    btn.textContent = '✓ Connecté';
    setTimeout(() => {
      userModal.classList.remove('open');
      document.body.style.overflow = '';
      btn.textContent = orgText;
      e.target.reset();
    }, 800);
  }, 1200);
});

// Global modal close on click outside
window.addEventListener('click', (e) => {
  if (e.target === productModal) {
    productModal.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (e.target === userModal) {
    userModal.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── 12. CURSOR GLOW (subtle gold trail) ──
const glow = document.createElement('div');
Object.assign(glow.style, {
  position: 'fixed', width: '320px', height: '320px',
  borderRadius: '50%', pointerEvents: 'none', zIndex: '0',
  background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
  transform: 'translate(-50%,-50%)',
  transition: 'left .18s ease, top .18s ease',
});
document.body.appendChild(glow);
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});
