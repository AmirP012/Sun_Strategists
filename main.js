/* =========================================
   راهکاران آفتاب - JavaScript
   الزامات پروژه:
   - بدون بک‌اند، فقط JS خام
   - اسلایدر هیرو (حداقل ۲ اسلاید)
   - اعتبارسنجی سرچ
   - شمارنده‌های انیمیشنی آمار
   - کاروسل نظرات مشتریان
   - اعتبارسنجی فرم تماس + preventDefault + پیام موفقیت + (اختیاری) localStorage
   - (اختیاری) اسکرول نرم + منوی موبایل
   ========================================= */

(function () {
  "use strict";

  // =========================
  // Helpers
  // =========================
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  function setText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  function isOnlySpaces(str) {
    return str.trim().length === 0;
  }

  // =========================
  // Year in footer
  // =========================
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // =========================
  // Mobile nav toggle (optional)
  // =========================
  const navToggle = $("#navToggle");
  const nav = $("#nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // بستن منو با کلیک روی لینک‌ها (برای تجربه بهتر در موبایل)
    $$(".nav__link", nav).forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // =========================
  // Hero slider
  // - Minimum 2 slides
  // - Dots/Arrows + JS
  // =========================
  const heroSlider = $("#heroSlider");
  if (heroSlider) {
    const slides = $$(".hero__slide", heroSlider);
    const dotsWrap = $("#heroDots");
    const btnPrev = $("#heroPrev");
    const btnNext = $("#heroNext");
    let index = 0;
    let timer = null;

    // Set background from data-bg (academic-safe: HTML attribute -> JS apply)
    slides.forEach((slide) => {
      const bg = slide.getAttribute("data-bg");
      if (bg) {
        // Note: اگر تصویر نبود، CSS گرادیان همچنان پس‌زمینه را پوشش می‌دهد.
        slide.style.backgroundImage =
          `linear-gradient(135deg, rgba(255,209,102,.12), rgba(93,214,255,.10)), url("${bg}")`;
      }
    });

    // Create dots
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `رفتن به اسلاید ${i + 1}`);
        b.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(b);
      });
    }

    function render() {
      slides.forEach((s, i) => {
        const active = i === index;
        s.classList.toggle("is-active", active);
        s.setAttribute("aria-hidden", active ? "false" : "true");
      });

      const dots = dotsWrap ? $$("button", dotsWrap) : [];
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
      restart();
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 6000);
    }

    btnNext && btnNext.addEventListener("click", next);
    btnPrev && btnPrev.addEventListener("click", prev);

    render();
    restart();

    // Stop autoplay on hover (optional UX)
    heroSlider.addEventListener("mouseenter", () => timer && clearInterval(timer));
    heroSlider.addEventListener("mouseleave", restart);
  }

  // =========================
  // Search validation (IMPORTANT)
  // Rules:
  // - not empty
  // - not only spaces
  // - min length (academic-safe default = 3)
  // On valid -> alert/message/console log
  // =========================
  const searchForm = $("#searchForm");
  if (searchForm) {
    const searchInput = $("#searchInput");
    const searchMsg = $("#searchMsg");
    const MIN_SEARCH = 3;

    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const value = (searchInput?.value || "");
      if (!value || isOnlySpaces(value)) {
        setText(searchMsg, "لطفاً یک عبارت معتبر وارد کنید (خالی یا فقط فاصله نباشد).");
        searchMsg.classList.remove("ok");
        return;
      }
      if (value.trim().length < MIN_SEARCH) {
        setText(searchMsg, `حداقل ${MIN_SEARCH} کاراکتر وارد کنید.`);
        searchMsg.classList.remove("ok");
        return;
      }

      // Valid input
      setText(searchMsg, `عبارت «${value.trim()}» ثبت شد.`);
      searchMsg.classList.add("ok");
      console.log("Search:", value.trim());
      alert(`جستجو انجام شد: ${value.trim()}`);
      searchInput.value = "";
    });
  }

  // =========================
  // Animated counters for stats
  // Requirement: JS animated counters
  // We'll trigger when stats section enters viewport (IntersectionObserver)
  // =========================
  const statsWrap = $("#stats");
  if (statsWrap) {
    const nums = $$(".stat__num", statsWrap);
    let started = false;

    function animateCount(el, target, duration = 1200) {
      const start = 0;
      const startTime = performance.now();

      function tick(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(start + (target - start) * p);
        el.textContent = value.toLocaleString("fa-IR");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function startCounters() {
      if (started) return;
      started = true;
      nums.forEach((el) => {
        const target = Number(el.getAttribute("data-count") || "0");
        animateCount(el, target);
      });
    }

    // If supported: use IntersectionObserver, else start immediately
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounters();
            obs.disconnect();
          }
        });
      }, { threshold: 0.35 });
      obs.observe(statsWrap);
    } else {
      startCounters();
    }
  }

  // =========================
  // Testimonials carousel (JS)
  // - slider / carousel
  // =========================
  const tCarousel = $("#tCarousel");
  if (tCarousel) {
    const track = $("#tTrack");
    const items = track ? $$(".tItem", track) : [];
    const dotsWrap = $("#tDots");
    const btnPrev = $("#tPrev");
    const btnNext = $("#tNext");
    let i = 0;
    let tTimer = null;

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      items.forEach((_, idx) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `رفتن به نظر ${idx + 1}`);
        b.addEventListener("click", () => go(idx));
        dotsWrap.appendChild(b);
      });
    }

    function render() {
      if (!track) return;
      track.style.transform = `translateX(${i * 100}%)`; // RTL: چون track flex است، با X کار می‌کند
      items.forEach((it, idx) => it.setAttribute("aria-hidden", idx === i ? "false" : "true"));

      const dots = dotsWrap ? $$("button", dotsWrap) : [];
      dots.forEach((d, idx) => d.classList.toggle("is-active", idx === i));
    }

    function go(idx) {
      i = (idx + items.length) % items.length;
      render();
      restart();
    }

    function next() { go(i + 1); }
    function prev() { go(i - 1); }

    function restart() {
      if (tTimer) clearInterval(tTimer);
      tTimer = setInterval(next, 6500);
    }

    buildDots();
    btnPrev && btnPrev.addEventListener("click", prev);
    btnNext && btnNext.addEventListener("click", next);

    render();
    restart();

    tCarousel.addEventListener("mouseenter", () => tTimer && clearInterval(tTimer));
    tCarousel.addEventListener("mouseleave", restart);
  }

  // =========================
  // Contact / Request form validation (VERY IMPORTANT)
  // Fields:
  // - name, last name, mobile, email, company, request type, message
  // Validations:
  // - required fields
  // - email format
  // - phone format
  // - min text length
  // On valid:
  // - prevent default
  // - show success modal
  // - optionally store in localStorage
  // =========================
  const requestForm = $("#requestForm");
  if (requestForm) {
    const firstName = $("#firstName");
    const lastName = $("#lastName");
    const mobile = $("#mobile");
    const email = $("#email");
    const company = $("#company");
    const type = $("#type");
    const message = $("#message");
    const formMsg = $("#formMsg");

    const modal = $("#successModal");
    const closeModalBtn = $("#closeModal");

    // Academic-safe patterns:
    // - Iran mobile: 09xxxxxxxxx (11 digits)
    const phoneRegex = /^09\d{9}$/;
    // Basic email regex: acceptable for academic project
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const MIN_MESSAGE = 10;

    function showError(id, msg) {
      const el = document.querySelector(`.error[data-for="${id}"]`);
      if (el) el.textContent = msg || "";
    }

    function clearErrors() {
      ["firstName", "lastName", "mobile", "email", "company", "type", "message"].forEach((k) => showError(k, ""));
      if (formMsg) formMsg.textContent = "";
    }

    function openModal() {
      if (!modal) return;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    // Close modal handlers
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        const t = e.target;
        if (t && t.getAttribute && t.getAttribute("data-close") === "true") closeModal();
      });
    }

    requestForm.addEventListener("submit", (e) => {
      e.preventDefault(); // requirement: prevent default submit
      clearErrors();

      let ok = true;

      const fn = (firstName?.value || "").trim();
      const ln = (lastName?.value || "").trim();
      const ph = (mobile?.value || "").trim();
      const em = (email?.value || "").trim();
      const co = (company?.value || "").trim();
      const ty = (type?.value || "").trim();
      const msg = (message?.value || "").trim();

      // Required fields
      if (!fn) { showError("firstName", "نام الزامی است."); ok = false; }
      if (!ln) { showError("lastName", "نام خانوادگی الزامی است."); ok = false; }
      if (!ph) { showError("mobile", "شماره موبایل الزامی است."); ok = false; }
      if (!em) { showError("email", "ایمیل الزامی است."); ok = false; }
      if (!ty) { showError("type", "نوع درخواست را انتخاب کنید."); ok = false; }
      if (!msg) { showError("message", "متن پیام الزامی است."); ok = false; }

      // Format validations
      if (ph && !phoneRegex.test(ph)) {
        showError("mobile", "فرمت موبایل صحیح نیست (مثال: 09123456789).");
        ok = false;
      }
      if (em && !emailRegex.test(em)) {
        showError("email", "فرمت ایمیل صحیح نیست.");
        ok = false;
      }
      if (msg && msg.length < MIN_MESSAGE) {
        showError("message", `متن پیام باید حداقل ${MIN_MESSAGE} کاراکتر باشد.`);
        ok = false;
      }

      if (!ok) {
        if (formMsg) formMsg.textContent = "لطفاً خطاهای فرم را بررسی کنید.";
        return;
      }

      // If valid: show success message + store in localStorage (optional but useful)
      const payload = {
        firstName: fn,
        lastName: ln,
        mobile: ph,
        email: em,
        company: co,
        type: ty,
        message: msg,
        createdAt: new Date().toISOString()
      };

      try {
        const key = "requests";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        existing.push(payload);
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (err) {
        // اگر localStorage غیرفعال بود، پروژه همچنان باید کار کند
        console.warn("LocalStorage error:", err);
      }

      if (formMsg) {
        formMsg.textContent = "✅ درخواست با موفقیت ثبت شد.";
        formMsg.classList.add("ok");
      }

      openModal();
      requestForm.reset();
    });
  }

  // =========================
  // Newsletter (optional validation)
  // =========================
  const newsletterForm = $("#newsletterForm");
  if (newsletterForm) {
    const emailInput = $("#newsletterEmail");
    const msg = $("#newsletterMsg");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = (emailInput?.value || "").trim();

      if (!v) {
        setText(msg, "لطفاً ایمیل را وارد کنید.");
        msg.classList.remove("ok");
        return;
      }
      if (!emailRegex.test(v)) {
        setText(msg, "فرمت ایمیل صحیح نیست.");
        msg.classList.remove("ok");
        return;
      }

      setText(msg, "عضویت شما انجام شد (نمونه آفلاین).");
      msg.classList.add("ok");
      alert("عضویت در خبرنامه انجام شد.");
      emailInput.value = "";
    });
  }

  // =========================
  // Small UX: show ok color
  // =========================
  // NOTE: کلاس ok در CSS تعریف نشده بود؛ اینجا با style ساده اعمال می‌کنیم (کم‌هزینه و خوانا).
  // اگر خواستید می‌توانید در CSS کلاس .ok بسازید.
  const style = document.createElement("style");
  style.textContent = `.ok{ color: var(--ok) !important; }`;
  document.head.appendChild(style);

  // ===== Back to Top (fix) =====
// این روش مستقل از #top است و همیشه کار می‌کند.
document.querySelectorAll(".toTop").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    // اگر مرورگر قدیمی بود:
    // window.scrollTo(0, 0);
  });
});
})();
