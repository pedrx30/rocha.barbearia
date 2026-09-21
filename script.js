(() => {
  const carousel = document.querySelector(".carousel");

  if (!carousel) return;

  const track = carousel.querySelector(".carousel-track");
  const previousButton = document.querySelector(".carousel-button.previous");
  const nextButton = document.querySelector(".carousel-button.next");
  const count = document.querySelector(".current-slide");
  const progress = document.querySelector(".progress-fill");
  const totalSlides = 12;
  const autoplayDelay = 3000;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let trackIndex = 1;
  let autoplayTimer = null;
  let isAnimating = false;
  let pointerStart = 0;
  let pointerOffset = 0;
  let pointerActive = false;

  const realIndex = () => {
    if (trackIndex === 0) return totalSlides - 1;
    if (trackIndex === totalSlides + 1) return 0;
    return trackIndex - 1;
  };

  const updateStatus = () => {
    const index = realIndex();
    count.textContent = String(index + 1).padStart(2, "0");
    progress.style.transform = `translateX(${index * 100}%)`;
  };

  const render = (animate = true, dragOffset = 0) => {
    track.classList.toggle("is-animating", animate);
    track.style.transform = `translate3d(calc(${-trackIndex * 100}% + ${dragOffset}px), 0, 0)`;
    updateStatus();
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (reducedMotion || document.hidden) return;
    autoplayTimer = window.setInterval(() => move(1), autoplayDelay);
  };

  const move = (direction) => {
    if (isAnimating) return;
    isAnimating = true;
    trackIndex += direction;
    render(true);
  };

  const interact = (direction) => {
    move(direction);
    startAutoplay();
  };

  track.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "transform") return;

    if (trackIndex === 0) {
      trackIndex = totalSlides;
      render(false);
    } else if (trackIndex === totalSlides + 1) {
      trackIndex = 1;
      render(false);
    }

    isAnimating = false;
  });

  previousButton.addEventListener("click", () => interact(-1));
  nextButton.addEventListener("click", () => interact(1));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      interact(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      interact(1);
    }
  });

  carousel.addEventListener("pointerdown", (event) => {
    if (isAnimating) return;
    pointerActive = true;
    pointerStart = event.clientX;
    pointerOffset = 0;
    stopAutoplay();
    carousel.setPointerCapture(event.pointerId);
    track.classList.remove("is-animating");
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!pointerActive) return;
    pointerOffset = event.clientX - pointerStart;
    render(false, pointerOffset);
  });

  const finishSwipe = (event) => {
    if (!pointerActive) return;
    pointerActive = false;

    if (carousel.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }

    const distance = Math.abs(pointerOffset);

    if (distance >= Math.min(60, carousel.clientWidth * 0.14)) {
      move(pointerOffset < 0 ? 1 : -1);
    } else if (distance > 2) {
      isAnimating = true;
      render(true);
    } else {
      isAnimating = false;
      render(false);
    }

    pointerOffset = 0;
    startAutoplay();
  };

  carousel.addEventListener("pointerup", finishSwipe);
  carousel.addEventListener("pointercancel", finishSwipe);
  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  render(false);
  startAutoplay();
})();
