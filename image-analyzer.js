// image-analyzer.js - Detects single vs double-page spreads

class ImageAnalyzer {
  constructor(aspectRatioThreshold = 1.3) {
    this.aspectRatioThreshold = aspectRatioThreshold;
  }

  async analyzePages(images) {
    const pages = [];
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      
      // Wait for image to load
      await this.ensureImageLoaded(img);
      
      const ratio = img.naturalWidth / img.naturalHeight;
      const isDouble = ratio > this.aspectRatioThreshold;
      
      pages.push({
        index: i,
        element: img,
        url: img.src,
        alt: img.alt || '',
        isDouble: isDouble,
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: ratio
      });
    }
    
    return pages;
  }

  ensureImageLoaded(img) {
    return new Promise((resolve, reject) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
      }
    });
  }

  // Detect TCB credits page (usually second page, double spread)
  detectTCBCreditsPage(pages) {
    if (pages.length < 2) return null;
    
    const secondPage = pages[1];
    
    // Check if second page is double and likely credits
    if (secondPage.isDouble) {
      // Additional checks: filename or alt text contains indicators
      const indicators = ['tcb', 'credit', 'scan'];
      const searchText = (secondPage.url + secondPage.alt).toLowerCase();
      
      if (indicators.some(indicator => searchText.includes(indicator))) {
        return 1; // Index of credits page
      }
      
      // If it's just the second page and it's double, assume it's credits
      return 1;
    }
    
    return null;
  }

  // Remove TCB credits from pages array and return it separately
  extractTCBCredits(pages) {
    const creditsIndex = this.detectTCBCreditsPage(pages);
    
    if (creditsIndex !== null) {
      const creditsPage = pages.splice(creditsIndex, 1)[0];
      return { pages, creditsPage };
    }
    
    return { pages, creditsPage: null };
  }
}
