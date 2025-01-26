document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slider .list .item");
  const thumbnails = document.querySelectorAll(".thumbnail .item");
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");
  let currentIndex = 0;
  const interval = 5000; // Auto-slide interval in ms
  let autoSlideInterval;

  // Function to update active slide and thumbnail
  function updateActiveSlide(index) {
    // Remove active class from current slide and thumbnail
    slides[currentIndex].classList.remove("active", "popup-animation");
    thumbnails[currentIndex].classList.remove("active");

    // Set new active slide and thumbnail
    currentIndex = index;
    slides[currentIndex].classList.add("active", "popup-animation");
    thumbnails[currentIndex].classList.add("active");
  }

  function autoSlide() {
    autoSlideInterval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      updateActiveSlide(nextIndex);
    }, interval);
  }

  // Event listeners for thumbnails
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("mouseenter", () => {
      clearInterval(autoSlideInterval); // Stop auto-slide on hover
      updateActiveSlide(index);
    });
    thumbnail.addEventListener("click", () => {
      updateActiveSlide(index);
    });
  });

  // Event listeners for next and prev buttons
  nextButton.addEventListener("click", () => {
    clearInterval(autoSlideInterval); // Stop auto-slide on manual navigation
    const nextIndex = (currentIndex + 1) % slides.length;
    updateActiveSlide(nextIndex);
  });

  prevButton.addEventListener("click", () => {
    clearInterval(autoSlideInterval); // Stop auto-slide on manual navigation
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateActiveSlide(prevIndex);
  });

  // Start auto-slide on page load
  autoSlide();

  // Restart auto-slide when mouse leaves thumbnail area
  const thumbnailContainer = document.querySelector(".thumbnail");
  thumbnailContainer.addEventListener("mouseleave", autoSlide);
});

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".review-slider");
  const cards = Array.from(slider.children);

  // Duplicate cards for seamless looping
  cards.forEach((card) => {
    const clone = card.cloneNode(true);
    slider.appendChild(clone);
  });

  // Ensure infinite loop
  let sliderWidth = slider.scrollWidth / 2; // Half due to duplicates
  let scrollAmount = 0;

  function loopSlider() {
    scrollAmount += 1; // Move slider to the left
    if (scrollAmount >= sliderWidth) {
      scrollAmount = 0; // Reset when end of first loop is reached
    }
    slider.style.transform = `translateX(-${scrollAmount}px)`;
    requestAnimationFrame(loopSlider); // Keep the loop going
  }

  // Start the loop
  loopSlider();
});
// Function to show popup details
function showDetails(item) {
  const details = {
    Tractor: {
      title: "Tractors",
      description:
        "Our tractors are reliable and perfect for plowing, tilling, and more. Rent them for efficient farming!",
    },
    Harvester: {
      title: "Harvesters",
      description:
        "Get the best harvesters for your farm to improve efficiency and cut down harvest time.",
    },
    "Irrigation System": {
      title: "Irrigation Systems",
      description:
        "Ensure water efficiency with our smart irrigation systems tailored for your farm needs.",
    },
  };

  const detailsSection = document.getElementById("ad-details");
  const title = document.getElementById("ad-details-title");
  const description = document.getElementById("ad-details-description");

  title.textContent = details[item].title;
  description.textContent = details[item].description;

  detailsSection.classList.remove("hidden");
  detailsSection.style.display = "block"; // Show the popup
}

// Function to hide popup
function hideDetails() {
  const detailsSection = document.getElementById("ad-details");
  detailsSection.classList.add("hidden");
  detailsSection.style.display = "none"; // Hide the popup
}

// Scroll-triggered animation using IntersectionObserver
const advertisementSection = document.getElementById("advertisement");
const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        advertisementSection.classList.add("show");
        observer.disconnect(); // Disconnect after triggering once
      }
    });
  },
  {
    threshold: 0.5, // Trigger when 50% of the section is in view
  }
);

observer.observe(advertisementSection);

/*image slider*/
const slider = document.querySelector(".slider");
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener("mousedown", (e) => {
  isDown = true;
  slider.classList.add("active");
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener("mouseleave", () => {
  isDown = false;
  slider.classList.remove("active");
});

slider.addEventListener("mouseup", () => {
  isDown = false;
  slider.classList.remove("active");
});

slider.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 3; // Scroll speed
  slider.scrollLeft = scrollLeft - walk;
});
