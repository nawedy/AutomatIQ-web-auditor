/**
 * Image Preloader Script
 * 
 * This script preloads critical images to improve page load performance.
 * Add this script to your HTML with the defer attribute.
 */

(function() {
  // List of critical images to preload
  const criticalImages = [
    '/logo.png',
    '/hero-image.jpg',
    '/feature-1.webp',
    '/feature-2.webp',
    '/feature-3.webp'
  ];

  // Create a hidden container for preloaded images
  const preloadContainer = document.createElement('div');
  preloadContainer.style.position = 'absolute';
  preloadContainer.style.width = '0';
  preloadContainer.style.height = '0';
  preloadContainer.style.overflow = 'hidden';
  preloadContainer.style.visibility = 'hidden';
  document.body.appendChild(preloadContainer);

  // Function to preload an image
  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadContainer.appendChild(img);
        resolve(src);
      };
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        reject(src);
      };
      img.src = src;
    });
  }

  // Preload images after page load
  window.addEventListener('load', () => {
    // Wait a short time to prioritize visible content first
    setTimeout(() => {
      Promise.allSettled(criticalImages.map(preloadImage))
        .then(results => {
          const loaded = results.filter(r => r.status === 'fulfilled').length;
          console.log(`✅ Preloaded ${loaded}/${criticalImages.length} critical images`);
        });
    }, 1000);
  });

  // Add support for native lazy loading
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  } else {
    // Fallback to Intersection Observer for browsers that don't support native lazy loading
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0 && 'IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }
})();
