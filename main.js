  document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerBtn && navMenu) {
      hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('open');
        navMenu.classList.toggle('open');
      });

      // Menü bezárása, ha a felhasználó rákattint egy navigációs linkre
      document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
          hamburgerBtn.classList.remove('open');
          navMenu.classList.remove('open');
        });
      });
    }
  });

// BETÖLTÉSI ANIMÁCIÓ KEZELÉSE (Garantált elrejtéssel)
(function() {
  const minDisplayTime = 500; // 0.5 másodperc
  const startTime = Date.now();

  function hideLoader() {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

    setTimeout(function() {
      const loader = document.getElementById('page-loader');
      if (loader) {
        loader.classList.add('fade-out');
        // Eltávolítjuk a DOM-ból is, hogy semmiképp se takarjon el semmit
        setTimeout(() => {
          loader.style.display = 'none';
        }, 500);
      }
    }, remainingTime);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
    // Biztonsági időzítő: Ha 3 másodpercig nem fut le a load esemény (pl. egy lassú kép miatt), akkor is elrejti!
    setTimeout(hideLoader, 3000);
  }
})();