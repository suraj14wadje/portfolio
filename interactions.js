// Card tilt, parallax orbs, scroll reveal — vanilla JS
(function() {

  // ===== 3D Tilt on cards ==================================
  const tilts = document.querySelectorAll(".tilt");
  tilts.forEach((el) => {
    let raf = null;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--mx", (x * 100) + "%");
      el.style.setProperty("--my", (y * 100) + "%");
      const rx = (y - 0.5) * -6;
      const ry = (x - 0.5) * 8;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });
    };
    const onLeave = () => {
      el.style.transform = "";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
  });

  // ===== Orb parallax on mouse move ========================
  const orbA = document.getElementById("orb-a");
  const orbB = document.getElementById("orb-b");
  const orbC = document.getElementById("orb-c");
  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener("mousemove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  let scrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
  }, { passive: true });

  const animOrbs = () => {
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    if (orbA) orbA.style.transform = `translate3d(${mx * 30}px, ${my * 20 - scrollY * 0.15}px, 0)`;
    if (orbB) orbB.style.transform = `translate3d(${-mx * 40}px, ${-my * 25 - scrollY * 0.1}px, 0)`;
    if (orbC) orbC.style.transform = `translate3d(${mx * 20}px, ${-scrollY * 0.05}px, 0)`;
    requestAnimationFrame(animOrbs);
  };
  animOrbs();

  // ===== Scroll reveal =====================================
  const revealable = document.querySelectorAll(
    ".hero-text > *, .sec-head, .exp-card, .skill-card, .project-card, .edu-card, .about-lede, .about-detail"
  );
  revealable.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity .8s cubic-bezier(.2,.7,.2,1) ${(i % 6) * 0.04}s, transform .8s cubic-bezier(.2,.7,.2,1) ${(i % 6) * 0.04}s`;
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  revealable.forEach((el) => io.observe(el));

  // ===== Email copy on click ===============================
  const emailLink = document.querySelector(".contact-email");
  if (emailLink) {
    emailLink.addEventListener("click", (e) => {
      e.preventDefault();
      const email = "suraj14wadje@gmail.com";
      navigator.clipboard?.writeText(email);
      const copy = emailLink.querySelector(".copy");
      if (copy) {
        const orig = copy.textContent;
        copy.textContent = "Copied!";
        copy.style.color = "#4ade80";
        setTimeout(() => {
          copy.textContent = orig;
          copy.style.color = "";
        }, 1600);
      }
      window.location.href = "mailto:" + email;
    });
  }
})();
