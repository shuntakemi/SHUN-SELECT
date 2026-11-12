
document.addEventListener("DOMContentLoaded", () => {
  
  /* =========================================
     01. BRAND SLIDESHOW
  ========================================= */

  const slides = document.querySelectorAll(".slide");
  const pagination = document.querySelector(".slide-pagination");
  const currentSlideText = document.querySelector(".current-slide");

  if (slides.length && pagination) {

    let currentIndex = 0;
    let slideTimer;

    slides.forEach((slide, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.setAttribute(
        "aria-label",
        `スライド ${index + 1} を表示`
      );

      button.addEventListener("click", () => {
        showSlide(index);
        restartTimer();
      });

      pagination.appendChild(button);
    });

    const buttons = pagination.querySelectorAll("button");

    function showSlide(index) {
      slides[currentIndex].classList.remove("active");
      buttons[currentIndex].classList.remove("active");

      currentIndex = index;

      slides[currentIndex].classList.add("active");
      buttons[currentIndex].classList.add("active");

      if (currentSlideText) {
        currentSlideText.textContent =
          String(currentIndex + 1).padStart(2, "0");
      }
    }

    function nextSlide() {
      const nextIndex =
        (currentIndex + 1) % slides.length;

      showSlide(nextIndex);
    }

    function startTimer() {
      slideTimer = setInterval(nextSlide, 5000);
    }

    function restartTimer() {
      clearInterval(slideTimer);
      startTimer();
    }

    showSlide(0);
    startTimer();
  }


  /* =========================================
     02. INDEX NAVIGATION
  ========================================= */

  const indexLinks =
    document.querySelectorAll(".index-link");

  const sections = [
    document.querySelector("#new-arrivals"),
    document.querySelector("#brands"),
    document.querySelector("#styling"),
    document.querySelector("#categories")
  ].filter(Boolean);

  function setActiveLink(sectionId) {
    indexLinks.forEach(link => {
      const target =
        link.getAttribute("href").substring(1);

      const isActive = target === sectionId;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  indexLinks.forEach(link => {
    link.addEventListener("click", () => {
      const targetId =
        link.getAttribute("href").substring(1);

      setActiveLink(targetId);
    });
  });

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        const visibleSections = entries
          .filter(entry => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top -
              b.boundingClientRect.top
          );

        if (visibleSections.length > 0) {
          setActiveLink(
            visibleSections[0].target.id
          );
        }
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: 0
      }
    );

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }


  /* =========================================
     03. MOBILE HEADER SCROLL CONTROL
     MOBILE ONLY
  ========================================= */

  const mainHeader = document.querySelector(".header");
  const sidebar = document.querySelector(".sidebar");

  const mobileQuery = window.matchMedia(
    "(max-width: 767px)"
  );

  if (mainHeader && sidebar) {

    let lastScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let currentDirection = 0;

    function showHeader() {
      mainHeader.classList.remove("is-hidden");
      sidebar.classList.remove("is-header-hidden");
    }

    function hideHeader() {
      mainHeader.classList.add("is-hidden");
      sidebar.classList.add("is-header-hidden");
    }

    function resetScrollControl() {
      showHeader();

      accumulatedDelta = 0;
      currentDirection = 0;
      lastScrollY = window.scrollY;
    }

    function handleScroll() {

      // PC版では制御しない
      if (!mobileQuery.matches) {
        resetScrollControl();
        return;
      }

      const currentScrollY = window.scrollY;
      const headerHeight = mainHeader.offsetHeight;
      const sidebarTop = sidebar.getBoundingClientRect().top;

      // INDEXがヘッダーの直下に到達したか判定
      const isConnected =
        sidebarTop <= headerHeight + 2;

      // INDEXと連結するまではヘッダーを表示
      if (!isConnected) {
        showHeader();

        accumulatedDelta = 0;
        currentDirection = 0;
        lastScrollY = currentScrollY;

        return;
      }

      const difference = currentScrollY - lastScrollY;

      lastScrollY = currentScrollY;

      // スクロールしていない場合は何もしない
      if (difference === 0) {
        return;
      }

      const direction = Math.sign(difference);

      // スクロール方向が変わったら蓄積量をリセット
      if (direction !== currentDirection) {
        currentDirection = direction;
        accumulatedDelta = 0;
      }

      accumulatedDelta += difference;

      // 下方向に一定量スクロールしたらヘッダーを隠す
      if (accumulatedDelta >= 8) {
        hideHeader();
      }

      // 上方向に一定量スクロールしたらヘッダーを表示
      if (accumulatedDelta <= -8) {
        showHeader();
      }
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });

    window.addEventListener("resize", () => {
      resetScrollControl();
      handleScroll();
    });

    handleScroll();
  }


  /* =========================================
     04. CATEGORY IMAGE CURSOR
  ========================================= */

  const categoryItems =
    document.querySelectorAll(".category-item");

  let categoryCursor =
    document.querySelector(".category-cursor");

  if (!categoryCursor) {
    categoryCursor = document.createElement("div");
    categoryCursor.className = "category-cursor";
    categoryCursor.setAttribute("aria-hidden", "true");
  }

  if (categoryCursor.parentElement !== document.body) {
    document.body.appendChild(categoryCursor);
  }

  let currentCategory = null;

  document.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") {
      categoryCursor.classList.remove("is-visible");
      currentCategory = null;
      return;
    }

    const item = event.target.closest?.(".category-item");

    if (!item) {
      categoryCursor.classList.remove("is-visible");
      currentCategory = null;
      return;
    }

    if (item !== currentCategory) {
      const image = item.dataset.image;

      if (image) {
        categoryCursor.style.backgroundImage =
          `url("${image}")`;

        categoryCursor.classList.add("is-visible");
      } else {
        categoryCursor.classList.remove("is-visible");
      }

      currentCategory = item;
    }

    categoryCursor.style.left = `${event.clientX}px`;
    categoryCursor.style.top = `${event.clientY}px`;
  });

  document.addEventListener("pointerleave", () => {
    categoryCursor.classList.remove("is-visible");
    currentCategory = null;
  });

});

/* =========================================
   MENU ACCORDION
========================================= */

document.querySelectorAll(".menu-expand").forEach(button => {

  button.addEventListener("click", () => {

    const group = button.closest(".menu-group");
    const isOpen = group.classList.contains("is-open");

    group.classList.toggle("is-open", !isOpen);

    button.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );

  });

});