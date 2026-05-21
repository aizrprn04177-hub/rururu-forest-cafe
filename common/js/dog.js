const heroSlides = document.querySelectorAll('.hero-slideshow img');
let heroCurrent = 0;

function showNextSlide() {
    heroSlides[heroCurrent].classList.remove('active');
    heroCurrent = (heroCurrent + 1) % heroSlides.length;
    heroSlides[heroCurrent].classList.add('active');
}

// 最初のスライドを表示
heroSlides[heroCurrent].classList.add('active');

// 2秒ごとに切り替え
setInterval(showNextSlide, 2000);


  