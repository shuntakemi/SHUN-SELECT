
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

    pagination.replaceChildren();

    slides.forEach((slide, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.setAttribute("aria-label", `スライド ${index + 1} を表示`);

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
      showSlide((currentIndex + 1) % slides.length);
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
     NEW ARRIVALS / FEATURED BRANDS /
     STYLING / BRAND LIST
  ========================================= */

  const indexLinks = document.querySelectorAll(".index-link");

  const sections = [
    document.querySelector("#new-arrivals"),
    document.querySelector("#brands"),
    document.querySelector("#styling"),
    document.querySelector("#brand-list"),
    document.querySelector("#categories")
  ].filter(Boolean);

  function setActiveLink(sectionId) {
    indexLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = href.substring(1);
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
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      setActiveLink(href.substring(1));
    });
  });

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        const visibleSections = entries
          .filter(entry => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleSections.length > 0) {
          setActiveLink(visibleSections[0].target.id);
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
     - ページ最上部では必ず表示
     - 下にスクロールすると非表示
     - 上にスクロールすると表示
  ========================================= */

  const mainHeader = document.querySelector(".header");
  const sidebar = document.querySelector(".sidebar");

  const mobileQuery = window.matchMedia("(max-width: 767px)");

  if (mainHeader) {
    let lastScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let currentDirection = 0;

    function showHeader() {
      mainHeader.classList.remove("is-hidden");
      sidebar?.classList.remove("is-header-hidden");
    }

    function hideHeader() {
      mainHeader.classList.add("is-hidden");
      sidebar?.classList.add("is-header-hidden");
    }

    function resetScrollControl() {
      showHeader();
      accumulatedDelta = 0;
      currentDirection = 0;
      lastScrollY = window.scrollY;
    }

    function handleScroll() {
      const currentScrollY = window.scrollY;

      // PCでは常にヘッダーを表示
      if (!mobileQuery.matches) {
        resetScrollControl();
        return;
      }

      // ページ最上部では必ずヘッダーを表示
      if (currentScrollY <= 5) {
        showHeader();
        accumulatedDelta = 0;
        currentDirection = 0;
        lastScrollY = currentScrollY;
        return;
      }

      // INDEXがヘッダー位置に到達するまでは表示
      if (sidebar) {
        const headerHeight = mainHeader.offsetHeight;
        const sidebarTop = sidebar.getBoundingClientRect().top;
        const isConnected = sidebarTop <= headerHeight + 2;

        if (!isConnected) {
          showHeader();
          accumulatedDelta = 0;
          currentDirection = 0;
          lastScrollY = currentScrollY;
          return;
        }
      }

      const difference = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (difference === 0) return;

      const direction = Math.sign(difference);

      if (direction !== currentDirection) {
        currentDirection = direction;
        accumulatedDelta = 0;
      }

      accumulatedDelta += difference;

      // 下方向に8px以上スクロールしたら隠す
      if (accumulatedDelta >= 8) {
        hideHeader();
      }

      // 上方向に8px以上スクロールしたら表示
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

  const categoryItems = document.querySelectorAll(".category-item");

  let categoryCursor = document.querySelector(".category-cursor");

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
        categoryCursor.style.backgroundImage = `url("${image}")`;
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


  /* =========================================
     05. PC PRODUCT SEARCH
  ========================================= */

  const searchScreen = document.querySelector("#search-screen");
  const searchInput = document.querySelector("#product-search-input");
  const searchResults = document.querySelector("#search-suggestions");
  const searchCount = document.querySelector(".search-result-count");
  const searchClose = document.querySelector(".search-close");
  const searchClear = document.querySelector(".search-clear");
  const searchTriggers = document.querySelectorAll(".search-trigger");
  const desktopSearch = window.matchMedia("(min-width: 768px)");

  if (
    searchScreen &&
    searchInput &&
    searchResults &&
    desktopSearch.matches
  ) {
    const products = Array.from(
      document.querySelectorAll(".product-item")
    ).map(item => {
      const link = item.querySelector("a");
      const image = item.querySelector("img");
      const name = item.querySelector("h3, h4");
      const brand = item.querySelector(".product-brand");
      const price = item.querySelector(".product-price");
      const brandHeading = item.closest(".brand-products")
        ?.querySelector(".brand-heading h3");

      const productName = name?.textContent.trim() || image?.alt || "";
      const brandName =
        brand?.textContent.trim() ||
        brandHeading?.textContent.trim() ||
        "";

      return {
        element: item,
        href: link?.getAttribute("href") || "#",
        image: image?.getAttribute("src") || "",
        imageAlt: image?.getAttribute("alt") || productName,
        name: productName,
        brand: brandName,
        price: price?.textContent.trim() || "",
        searchText: `${productName} ${brandName} ${item.textContent}`
          .toLocaleLowerCase("ja")
      };
    }).filter(product => product.name);


    /* SEARCH HISTORY / VIEW HISTORY */

    const RECENT_SEARCH_KEY = "siteRecentSearchProducts";
    const RECENT_VIEW_KEY = "siteRecentViewedProducts";

    function readRecent(key) {
      try {
        return JSON.parse(localStorage.getItem(key) || "[]");
      } catch (error) {
        return [];
      }
    }

    function saveRecent(key, product) {
      if (
        !product ||
        !product.name ||
        !product.href ||
        product.href === "#"
      ) return;

      const item = {
        href: new URL(product.href, document.baseURI).href,
        image: product.image
          ? new URL(product.image, document.baseURI).href
          : "",
        imageAlt: product.imageAlt || product.name,
        name: product.name,
        brand: product.brand || "",
        price: product.price || ""
      };

      const current = readRecent(key).filter(
        entry => entry.href !== item.href
      );

      current.unshift(item);

      try {
        localStorage.setItem(
          key,
          JSON.stringify(current.slice(0, 8))
        );
      } catch (error) {
        // 保存できない環境では履歴機能のみ停止
      }
    }


    /* PRODUCT CARD */

    function createProductCard(product) {
      const article = document.createElement("article");
      article.className = "search-suggestion";

      const link = document.createElement("a");
      link.href = product.href;

      if (product.image) {
        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.imageAlt || product.name;
        image.loading = "lazy";
        link.appendChild(image);
      }

      if (product.brand) {
        const brand = document.createElement("p");
        brand.className = "search-suggestion-brand";
        brand.textContent = product.brand;
        link.appendChild(brand);
      }

      const name = document.createElement("p");
      name.className = "search-suggestion-name";
      name.textContent = product.name;
      link.appendChild(name);

      if (product.price) {
        const price = document.createElement("p");
        price.className = "search-suggestion-price";
        price.textContent = product.price;
        link.appendChild(price);
      }

      article.appendChild(link);

      return article;
    }


    /* HISTORY SECTION */

    function appendHistorySection(title, key) {
      const history = readRecent(key);

      if (!history.length) return;

      const heading = document.createElement("div");
      heading.className = "search-history-heading";

      const label = document.createElement("p");
      label.className = "search-result-label";
      label.textContent = title;

      heading.appendChild(label);
      searchResults.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "search-history-grid";

      history.slice(0, 4).forEach(product => {
        grid.appendChild(createProductCard(product));
      });

      searchResults.appendChild(grid);
    }


    /* SEARCH RESULT DISPLAY */

    function normalizeSearch(value) {
      return value
        .trim()
        .toLocaleLowerCase("ja")
        .replace(/\s+/g, " ");
    }

    function renderSearchResults() {
      const keyword = normalizeSearch(searchInput.value);

      const matched = keyword
        ? products.filter(product =>
            product.searchText.includes(keyword)
          )
        : [];

      searchResults.replaceChildren();

      if (!keyword) {
        if (searchCount) searchCount.textContent = "";

        appendHistorySection(
          "最近検索した商品",
          RECENT_SEARCH_KEY
        );

        appendHistorySection(
          "最近見た商品",
          RECENT_VIEW_KEY
        );

        if (!searchResults.children.length) {
          const message = document.createElement("p");
          message.className = "search-empty";
          message.textContent =
            "キーワードを入力すると、商品を検索できます。";

          searchResults.appendChild(message);
        }

        return;
      }

      if (searchCount) {
        searchCount.textContent = `${matched.length} ITEMS`;
      }

      if (!matched.length) {
        const message = document.createElement("p");
        message.className = "search-empty";
        message.textContent =
          "該当する商品が見つかりませんでした。別のキーワードでお試しください。";

        searchResults.appendChild(message);
        return;
      }

      matched.slice(0, 12).forEach(product => {
        const card = createProductCard(product);
        card.classList.add("search-suggestion-result");

        card.querySelector("a")?.addEventListener("click", () => {
          saveRecent(RECENT_SEARCH_KEY, product);
          saveRecent(RECENT_VIEW_KEY, product);
        });

        searchResults.appendChild(card);
      });
    }


    /* SAVE RECENTLY VIEWED PRODUCTS */

    document.querySelectorAll(".product-item").forEach(item => {
      const link = item.querySelector("a");

      if (!link) return;

      link.addEventListener("click", () => {
        const product = products.find(entry =>
          entry.href === link.getAttribute("href")
        );

        if (product) {
          saveRecent(RECENT_VIEW_KEY, product);
        }
      });
    });


    /* OPEN / CLOSE SEARCH */

    function openSearch() {
      searchScreen.classList.add("is-open");
      searchScreen.setAttribute("aria-hidden", "false");
      document.body.classList.add("search-is-open");

      renderSearchResults();

      window.setTimeout(() => {
        searchInput.focus();
      }, 100);
    }

    function closeSearch() {
      searchScreen.classList.remove("is-open");
      searchScreen.setAttribute("aria-hidden", "true");
      document.body.classList.remove("search-is-open");
    }

    searchTriggers.forEach(trigger => {
      trigger.addEventListener("click", openSearch);
    });

    searchClose?.addEventListener("click", closeSearch);

    searchInput.addEventListener("input", renderSearchResults);

    searchClear?.addEventListener("click", () => {
      searchInput.value = "";
      renderSearchResults();
      searchInput.focus();
    });

    searchScreen.addEventListener("click", event => {
      if (event.target === searchScreen) {
        closeSearch();
      }
    });

    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        searchScreen.classList.contains("is-open")
      ) {
        closeSearch();
      }
    });

    document.querySelector(".search-form")?.addEventListener(
      "submit",
      event => event.preventDefault()
    );
  }


  /* =========================================
     06. MENU ACCORDION
  ========================================= */

  document.querySelectorAll(".menu-expand").forEach(button => {
    button.addEventListener("click", () => {
      const group = button.closest(".menu-group");

      if (!group) return;

      const isOpen = group.classList.contains("is-open");

      group.classList.toggle("is-open", !isOpen);

      button.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );
    });
  });


  
  /* =========================================
     07. MOBILE MENU OPEN / CLOSE
     - 背景を暗くする
     - メニュー右上に閉じるボタン（×）
     - メニュー内のクリックでは閉じない
     - 背景クリックでも閉じる
  ========================================= */

  const menuButton = document.querySelector(".menu-toggle");
  const mobileSidebar = document.querySelector(".sidebar");

  if (menuButton && mobileSidebar) {

    let overlay = document.querySelector(".mobile-menu-overlay");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "mobile-menu-overlay";
      document.body.appendChild(overlay);
    }

    // 閉じるボタンを作成
    let closeButton = mobileSidebar.querySelector(".mobile-menu-close");

    if (!closeButton) {
      closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "mobile-menu-close";
      closeButton.setAttribute("aria-label", "メニューを閉じる");
      closeButton.textContent = "×";

      mobileSidebar.appendChild(closeButton);
    }

    function openMenu() {
      document.body.classList.add("mobile-menu-open");
      menuButton.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      document.body.classList.remove("mobile-menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    }

    // メニューボタン
    menuButton.addEventListener("click", event => {
      event.stopPropagation();

      const isOpen =
        document.body.classList.contains("mobile-menu-open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // ×ボタンで閉じる
    closeButton.addEventListener("click", event => {
      event.stopPropagation();
      closeMenu();
    });

    // メニュー内のクリックでは閉じない
    mobileSidebar.addEventListener("click", event => {
      event.stopPropagation();
    });

    // 背景クリックで閉じる
    overlay.addEventListener("click", closeMenu);

    // ESCキーで閉じる
    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        document.body.classList.contains("mobile-menu-open")
      ) {
        closeMenu();
      }
    });

    // PC表示に切り替わったら閉じる
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    });
  }
    /* =========================================
     08. PAGE TOP
  ========================================= */

  const pageTopButton = document.querySelector(".page-top");
  const mainVisual = document.querySelector(".main-visual");

  if (pageTopButton && mainVisual) {

    function checkPageTop() {
      const visualBottom = mainVisual.getBoundingClientRect().bottom;

      if (visualBottom <= 0) {
        pageTopButton.classList.add("is-visible");
      } else {
        pageTopButton.classList.remove("is-visible");
      }
    }

    window.addEventListener("scroll", checkPageTop, {
      passive: true
    });

    checkPageTop();

    pageTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});