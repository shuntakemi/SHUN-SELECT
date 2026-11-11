
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

    // ページネーション作成
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


    // スライド表示
    function showSlide(index) {

      slides[currentIndex].classList.remove("active");
      buttons[currentIndex].classList.remove("active");

      currentIndex = index;

      slides[currentIndex].classList.add("active");
      buttons[currentIndex].classList.add("active");

      // 現在の番号を更新
      if (currentSlideText) {
        currentSlideText.textContent =
          String(currentIndex + 1).padStart(2, "0");
      }

    }


    // 次のスライド
    function nextSlide() {

      const nextIndex =
        (currentIndex + 1) % slides.length;

      showSlide(nextIndex);

    }


    // 自動再生
    function startTimer() {

      slideTimer = setInterval(nextSlide, 5000);

    }


    // 手動操作後にタイマーをリセット
    function restartTimer() {

      clearInterval(slideTimer);
      startTimer();

    }


    // 初期設定
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


  // INDEXのアクティブ状態を変更
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


  // クリック時
  indexLinks.forEach(link => {

    link.addEventListener("click", () => {

      const targetId =
        link.getAttribute("href").substring(1);

      setActiveLink(targetId);

    });

  });


  // スクロール位置を監視
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
   02.5 INDEX HEADER SCROLL CONTROL
========================================= */

const indexHeader = document.querySelector(".index-header");

if (indexHeader && window.matchMedia("(max-width: 767px)").matches) {

  let lastScrollY = window.scrollY;
  let idleTimer;

  function showIndexHeader() {
    indexHeader.classList.remove("is-hidden");
  }

  function hideIndexHeader() {
    indexHeader.classList.add("is-hidden");
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);

    idleTimer = setTimeout(() => {
      showIndexHeader();
    }, 2000);
  }

  window.addEventListener("scroll", () => {

    const currentScrollY = window.scrollY;
    const difference = currentScrollY - lastScrollY;

    if (currentScrollY < 80) {
      showIndexHeader();
    } else if (difference > 5) {
      // 下方向：ヘッダーを隠す
      hideIndexHeader();
    } else if (difference < -5) {
      // 上方向：ヘッダーを表示
      showIndexHeader();
    }

    lastScrollY = currentScrollY;

    resetIdleTimer();

  }, { passive: true });

  resetIdleTimer();

}

  /* =========================================
     03. CATEGORY IMAGE CURSOR
  ========================================= */

  const categoryItems = document.querySelectorAll(".category-item");
  let categoryCursor = document.querySelector(".category-cursor");

  // カーソル要素がHTMLにない場合も、JS側で自動生成する
  if (!categoryCursor) {
    categoryCursor = document.createElement("div");
    categoryCursor.className = "category-cursor";
    categoryCursor.setAttribute("aria-hidden", "true");
  }

  // fixed要素をbody直下に置き、親要素の重なり順の影響を避ける
  if (categoryCursor.parentElement !== document.body) {
    document.body.appendChild(categoryCursor);
  }

  let currentCategory = null;

  document.addEventListener("pointermove", (event) => {
    // タッチ操作ではカスタムカーソルを使わない
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

    // カテゴリーを移動したときだけ画像を切り替える
    if (item !== currentCategory) {
      const image = item.dataset.image;
      if (image) {
        categoryCursor.style.backgroundImage = `url("${image}")`;
        categoryCursor.classList.add("is-visible");
      } else {
        categoryCursor.classList.remove("is-visible");
      }
      currentCategory = item;
    }

    // マウス位置に追従
    categoryCursor.style.left = `${event.clientX}px`;
    categoryCursor.style.top = `${event.clientY}px`;
  });

  document.addEventListener("pointerleave", () => {
    categoryCursor.classList.remove("is-visible");
    currentCategory = null;
  });

});
