/* =========================================================
   Vishal Chavan — Portfolio Script
   Theme toggle, scroll progress, reveal animations,
   typed hero title, animated skill bars, architecture modal
   ========================================================= */

(function () {
  'use strict';

  /* ---------------- Theme Toggle (Dark / Light) ---------------- */
  const THEME_KEY = 'vc-portfolio-theme';
  const root = document.documentElement;
  const themeToggles = [
    document.getElementById('themeToggle'),
    document.getElementById('themeToggleDesktop')
  ].filter(Boolean);

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeToggles.forEach(btn => btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false'));
    localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(getPreferredTheme());

  themeToggles.forEach(btn => {
    btn.addEventListener('click', function () {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  });

  /* ---------------- Scroll Progress Indicator ---------------- */
  const progressBar = document.getElementById('scrollProgress');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = pct + '%';
      progressBar.setAttribute('aria-valuenow', Math.round(pct));
    }
  }

  /* ---------------- Sticky Topbar Shadow + Active Link (both navs) ---------------- */
  const topbar = document.getElementById('mainNavbar');
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function updateNavbarOnScroll() {
    if (topbar) {
      if (window.scrollY > 18) {
        topbar.classList.add('scrolled');
      } else {
        topbar.classList.remove('scrolled');
      }
    }

    let activeSection = null;
    const scrollPos = window.scrollY + window.innerHeight * 0.3;

    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        activeSection = section;
      }
    });

    navLinks.forEach(link => link.classList.remove('active'));
    if (activeSection) {
      navLinks
        .filter(l => l.getAttribute('href') === '#' + activeSection.id)
        .forEach(l => l.classList.add('active'));
    }
  }

  /* ---------------- Back to Top ---------------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Collapse mobile nav on link click ---------------- */
  const navMenu = document.getElementById('navMenu');
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      if (navMenu && navMenu.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
        bsCollapse.hide();
      }
    });
  });

  /* ---------------- Combined scroll listener (throttled via rAF) ---------------- */
  let scrollTicking = false;
  function onScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        updateScrollProgress();
        updateNavbarOnScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Typed Hero Title ---------------- */
  const typedEl = document.getElementById('typedTitle');
  const titles = ['Full Stack Developer','Python Backend Developer', 'Banking Systems Developer', 'REST API Architect'];
  let titleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeLoop() {
    if (!typedEl) return;
    const current = titles[titleIndex];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      typedEl.textContent = titles[0];
      return;
    }

    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(typeLoop, 1800);
        return;
      }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
      }
    }
    setTimeout(typeLoop, deleting ? 35 : 65);
  }
  typeLoop();

  /* ---------------- Scroll Reveal Animations (IntersectionObserver) ---------------- */
  const revealEls = document.querySelectorAll('[data-aos]');
  const skillFills = document.querySelectorAll('.skill-bar-fill');
  const statNums = document.querySelectorAll('.stat-num');

  const revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
        setTimeout(() => el.classList.add('aos-in'), delay);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------- Animated Skill Bars ---------------- */
  const skillObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.getAttribute('data-width') || '0';
        requestAnimationFrame(() => { fill.style.width = width + '%'; });
        obs.unobserve(fill);
      }
    });
  }, { threshold: 0.4 });

  skillFills.forEach(fill => skillObserver.observe(fill));

  /* ---------------- Animated Stat Counters ---------------- */
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const isDecimal = String(target).includes('.');
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : target;
      }
    }
    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statObserver.observe(el));

  /* ---------------- Architecture Modal Content ---------------- */
  const archModal = document.getElementById('archModal');
  const archModalLabel = document.getElementById('archModalLabel');
  const archModalBody = document.getElementById('archModalBody');

  const archContent = {
    monolith: {
      title: 'Current Monolithic Architecture',
      icon: 'fa-cubes',
      body: 'A single deployable Python application handling Customer Management, Account Management, Payment Processing, Reporting, and Authentication within one codebase and one Oracle database. Simple to operate, but scaling, releasing, and isolating failures independently is difficult as the system grows.'
    },
    microservices: {
      title: 'Target Microservices Architecture',
      icon: 'fa-diagram-project',
      body: 'An API Gateway routes incoming traffic to independent services — Auth Service, Account Service, Payment Service, Loan Service, and Notification Service — each owning its own data and deployment lifecycle. Services communicate asynchronously over RabbitMQ for event-driven workflows, with Redis used for shared caching and session state, enabling independent scaling and safer, faster releases.'
    }
  };

  if (archModal) {
    archModal.addEventListener('show.bs.modal', function (event) {
      const trigger = event.relatedTarget;
      if (!trigger) return;
      const key = trigger.getAttribute('data-arch');
      const data = archContent[key];
      if (!data) return;

      archModalLabel.textContent = data.title;
      archModalBody.innerHTML =
        '<div class="modal-arch-visual">' +
          '<i class="fa-solid ' + data.icon + '" aria-hidden="true"></i>' +
          '<span>Diagram placeholder — replace with your exported architecture image in /images/</span>' +
        '</div>' +
        '<p>' + data.body + '</p>';
    });

    /* Keyboard accessibility: allow Enter/Space to open modal on card */
    document.querySelectorAll('.arch-card[role="button"]').forEach(card => {
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

})();
