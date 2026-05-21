document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".swiper"); // 画面幅を取る親
  const wrapper = document.querySelector(".swiper-wrapper"); // translate をかける要素
  let slides = Array.from(document.querySelectorAll(".swiper-slide")); // 実スライド

  if (!slides.length) return;

  // gap の取得（margin-right）
  const getGap = () => parseFloat(getComputedStyle(slides[0]).marginRight) || 0;

  // --- クローン追加（最初に slides を取得した後に） ---
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.classList.add("clone");
  lastClone.classList.add("clone");
  wrapper.appendChild(firstClone);
  wrapper.insertBefore(lastClone, slides[0]);

  // クローン込みの配列
  let allSlides = Array.from(document.querySelectorAll(".swiper-slide"));

  // index: allSlides ベース。1 が最初の “本物” スライド
  let index = 1;
  let isTransitioning = false;
  const AUTOPLAY_DELAY = 2000;
  let autoplayId = null;

  // 再計算（幅・配列の再取得など）
  function recalc() {
    slides = Array.from(document.querySelectorAll(".swiper-slide")).filter(s => !s.classList.contains('clone'));
    allSlides = Array.from(document.querySelectorAll(".swiper-slide"));
    // 位置を即座に合わせる（トランジションなし）
    wrapper.style.transition = "none";
    moveToCenter(); // position を合わせる
    // 次フレームで transition 復帰
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrapper.style.transition = "transform 0.4s ease";
      });
    });
  }

  // ---- 中央にくるように translate を計算してセットする ----
  function moveToCenter(withTransition = false) {
    // 安全チェック
    if (!allSlides[index]) return;
    const containerCenter = container.clientWidth / 2;
    const slideLeft = allSlides[index].offsetLeft;
    const slideCenter = slideLeft + allSlides[index].clientWidth / 2;
    const offset = containerCenter - slideCenter;

    if (withTransition) wrapper.style.transition = "transform 0.4s ease";
    else wrapper.style.transition = "none";

    wrapper.style.transform = `translateX(${offset}px)`;
  }

  // ---- active 更新（クローンは除外して本物の slides[] に付ける） ----
  function updateActive() {
    allSlides.forEach(s => s.classList.remove("active"));
    let realIndex = index - 1; // index==1 -> slides[0]
    if (realIndex < 0) realIndex = slides.length - 1;
    if (realIndex >= slides.length) realIndex = 0;
    slides[realIndex].classList.add("active");
  }

  // ---- 自動再生の次へ関数 ----
  function moveNext() {
    if (isTransitioning) return;
    isTransitioning = true;
    index++;
    moveToCenter(true);
    // updateActive は transitionend のタイミングで行う（重要）
  }

  // ---- transitionend でのつなぎ目処理と active 更新 ----
  wrapper.addEventListener("transitionend", () => {
    isTransitioning = false;

    // 右端のクローンに来たら本物1へ瞬間移動
    if (index === allSlides.length - 1) {
      wrapper.style.transition = "none";
      index = 1;
      moveToCenter(false);
      // 次フレームでトランジションを戻す（安全）
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrapper.style.transition = "transform 0.4s ease";
        });
      });
    }

    // 左端のクローン（index===0）に来たら本物の最後へ瞬間移動
    if (index === 0) {
      wrapper.style.transition = "none";
      index = slides.length;
      moveToCenter(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrapper.style.transition = "transform 0.4s ease";
        });
      });
    }

    // ここで一度だけ active を更新（移動完了後）
    updateActive();
  });

  // ---- autoplay コントロール ----
  function startAutoplay() {
    if (autoplayId) return;
    autoplayId = setInterval(() => {
      moveNext();
    }, AUTOPLAY_DELAY);
  }
  function stopAutoplay() {
    if (!autoplayId) return;
    clearInterval(autoplayId);
    autoplayId = null;
  }

  // 初期位置合わせ（画像ロードを待つのが確実）
  function waitImagesLoaded() {
    const imgs = Array.from(document.querySelectorAll(".swiper-slide img"));
    const promises = imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(res => {
        img.addEventListener('load', res);
        img.addEventListener('error', res);
      });
    });
    return Promise.all(promises);
  }

  waitImagesLoaded().then(() => {
    // 初期位置を合わせて active をつける
    moveToCenter(false);
    updateActive();
    // 少し遅らせて transition を復帰してから autoplay 開始
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrapper.style.transition = "transform 0.4s ease";
        startAutoplay();
      });
    });
  });

  
  
  observer.observe(container);




  // ホバー停止（PC）
  wrapper.addEventListener("mouseenter", stopAutoplay);
  wrapper.addEventListener("mouseleave", startAutoplay);

  // タブ非表示で停止
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // リサイズ対応（デバウンス）
  let rTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(() => {
      recalc();
    }, 120);
  });

  // API（必要なら外部から操作）
  window.myCarousel = { moveNext, startAutoplay, stopAutoplay, recalc };
});