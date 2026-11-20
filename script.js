
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

      if (!mobileQuery.matches) {
        resetScrollControl();
        return;
      }

      if (currentScrollY <= 5) {
        showHeader();
        accumulatedDelta = 0;
        currentDirection = 0;
        lastScrollY = currentScrollY;
        return;
      }

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

      if (accumulatedDelta >= 8) {
        hideHeader();
      }

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

      const list = readRecent(key).filter(
        entry => entry.href !== item.href
      );

      list.unshift(item);

      try {
        localStorage.setItem(key, JSON.stringify(list.slice(0, 10)));
      } catch (error) {
        // Storage unavailable
      }
    }

    function getRecentProducts(key) {
      return readRecent(key).map(item => ({
        ...item,
        searchText: `${item.name} ${item.brand} ${item.price}`
          .toLocaleLowerCase("ja")
      }));
    }

    const recentSearches = getRecentProducts(RECENT_SEARCH_KEY);
    const recentViews = getRecentProducts(RECENT_VIEW_KEY);


    /* SEARCH DISPLAY */

    function createSearchCard(product) {
      const card = document.createElement("a");
      card.className = "search-suggestion";
      card.href = product.href;

      const image = document.createElement("img");
      image.src = product.image || "";
      image.alt = product.imageAlt || product.name;

      const info = document.createElement("div");
      info.className = "search-suggestion-info";

      const brandName = document.createElement("p");
      brandName.className = "search-suggestion-brand";
      brandName.textContent = product.brand || "";

      const productName = document.createElement("p");
      productName.className = "search-suggestion-name";
      productName.textContent = product.name;

      const price = document.createElement("p");
      price.className = "search-suggestion-price";
      price.textContent = product.price || "";

      info.append(brandName, productName, price);
      card.append(image, info);

      card.addEventListener("click", () => {
        saveRecent(RECENT_SEARCH_KEY, product);
        saveRecent(RECENT_VIEW_KEY, product);
      });

      return card;
    }

    function renderSearchResults() {
      const query = searchInput.value.trim().toLocaleLowerCase("ja");
      searchResults.replaceChildren();

      let matches = [];

      if (!query) {
        if (recentSearches.length) {
          matches = recentSearches;
          searchCount.textContent = "最近検索した商品";
        } else {
          matches = recentViews;
          searchCount.textContent = "最近見た商品";
        }

        if (!matches.length) {
          searchCount.textContent = "商品名・ブランド名で検索";
        }
      } else {
        matches = products.filter(product =>
          product.searchText.includes(query)
        );

        searchCount.textContent = `${matches.length}件の商品`;
      }

      matches.forEach(product => {
        searchResults.appendChild(createSearchCard(product));
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

    closeButton.addEventListener("click", event => {
      event.stopPropagation();
      closeMenu();
    });

    mobileSidebar.addEventListener("click", event => {
      event.stopPropagation();
    });

    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", event => {
      if (
        event.key === "Escape" &&
        document.body.classList.contains("mobile-menu-open")
      ) {
        closeMenu();
      }
    });

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


/* =========================================
   09. MAN FILTER
   BRAND / CATEGORY / PRICE / STOCK
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const filterPanel = document.querySelector(".man-filter-panel");

  if (!filterPanel) return;

  const productCards = Array.from(
    document.querySelectorAll(".product-item")
  );

  const brandChecks = filterPanel.querySelectorAll(
    '[data-filter-group="brand"] input[type="checkbox"]'
  );

  const categoryChecks = filterPanel.querySelectorAll(
    '[data-filter-group="category"] input[type="checkbox"]'
  );

  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");
  const stockOnly = document.getElementById("stock-only");
  const clearButton = document.getElementById("filter-clear");
  const resultCount = document.getElementById("result-count");
  const emptyMessage = document.querySelector(".man-filter-result-empty");
  const mobileTrigger = document.querySelector(".man-filter-trigger");
  const sidebar = document.querySelector(".sidebar");


  /* FILTER PROCESS */

  function applyFilters() {

    const selectedBrands = Array.from(brandChecks)
      .filter(check => check.checked)
      .map(check => check.value);

    const selectedCategories = Array.from(categoryChecks)
      .filter(check => check.checked)
      .map(check => check.value);

    const min = minPrice && minPrice.value !== ""
      ? Number(minPrice.value)
      : 0;

    const max = maxPrice && maxPrice.value !== ""
      ? Number(maxPrice.value)
      : Infinity;

    const onlyInStock = Boolean(
      stockOnly && stockOnly.checked
    );

    let hits = 0;

    productCards.forEach(card => {

      const brand = card.dataset.brand || "";
      const category = card.dataset.category || "";
      const price = Number(card.dataset.price);
      const inStock = card.dataset.stock === "true";

      const brandMatch =
        selectedBrands.length === 0 ||
        selectedBrands.includes(brand);

      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(category);

      const priceMatch =
        Number.isFinite(price) &&
        price >= min &&
        price <= max;

      const stockMatch =
        !onlyInStock || inStock;

      const show =
        brandMatch &&
        categoryMatch &&
        priceMatch &&
        stockMatch;

      card.classList.toggle("filter-hidden", !show);

      if (show) hits++;
    });

    if (resultCount) {
      resultCount.textContent = String(hits);
    }

    if (emptyMessage) {
      emptyMessage.hidden = hits !== 0;
    }
  }


  /* EVENT LISTENERS */

  brandChecks.forEach(check => {
    check.addEventListener("change", applyFilters);
  });

  categoryChecks.forEach(check => {
    check.addEventListener("change", applyFilters);
  });

  minPrice?.addEventListener("input", applyFilters);
  maxPrice?.addEventListener("input", applyFilters);

  stockOnly?.addEventListener("change", applyFilters);


  /* CLEAR FILTER */

  clearButton?.addEventListener("click", () => {

    brandChecks.forEach(check => {
      check.checked = false;
    });

    categoryChecks.forEach(check => {
      check.checked = false;
    });

    if (minPrice) minPrice.value = "";
    if (maxPrice) maxPrice.value = "";
    if (stockOnly) stockOnly.checked = false;

    applyFilters();
  });


  /* MOBILE FILTER DRAWER */

  if (mobileTrigger && sidebar) {

    let overlay = document.querySelector(".mobile-menu-overlay");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "mobile-menu-overlay";
      document.body.appendChild(overlay);
    }

    let closeButton = sidebar.querySelector(".mobile-menu-close");

    if (!closeButton) {
      closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "mobile-menu-close";
      closeButton.setAttribute("aria-label", "メニューを閉じる");
      closeButton.textContent = "×";

      sidebar.appendChild(closeButton);
    }

    function closeDrawer() {
      document.body.classList.remove("mobile-menu-open");
    }

    mobileTrigger.addEventListener("click", () => {
      document.body.classList.add("mobile-menu-open");
    });

    closeButton.addEventListener("click", event => {
      event.stopPropagation();
      closeDrawer();
    });

    overlay.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    });
  }


  /* INITIAL FILTER */

  applyFilters();

});
