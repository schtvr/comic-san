// book-reader.js - Main book view rendering and navigation

class BookReader {
  constructor(pages, creditsPage = null) {
    this.allPages = pages;
    this.creditsPage = creditsPage;
    this.spreads = [];
    this.currentSpreadIndex = 0;
    this.container = null;
    this.isActive = false;
    
    this.generateSpreads();
  }

  generateSpreads() {
    this.spreads = [];
    const pages = [...this.allPages];
    
    // First spread: [empty, page1] - first page alone on right
    if (pages.length > 0) {
      const firstPage = pages.shift();
      if (firstPage.isDouble) {
        // If first page is double, show it alone
        this.spreads.push({ left: null, right: null, double: firstPage });
      } else {
        // First single page on right side
        this.spreads.push({ left: null, right: firstPage, double: null });
      }
    }
    
    // Process remaining pages
    let i = 0;
    while (i < pages.length) {
      const currentPage = pages[i];
      
      if (currentPage.isDouble) {
        // Double page gets its own spread
        this.spreads.push({ left: null, right: null, double: currentPage });
        i++;
      } else if (i + 1 < pages.length && !pages[i + 1].isDouble) {
        // Two single pages: [page(i+1), page(i)]
        // Right-to-left order: next page on left, current page on right
        this.spreads.push({ 
          left: pages[i + 1], 
          right: currentPage, 
          double: null 
        });
        i += 2;
      } else {
        // Last single page alone on right
        this.spreads.push({ left: null, right: currentPage, double: null });
        i++;
      }
    }
    
    // Add TCB credits at the end if exists
    if (this.creditsPage) {
      this.spreads.push({ 
        left: null, 
        right: null, 
        double: this.creditsPage 
      });
    }
  }

  activate() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.hideOriginalContent();
    this.createBookContainer();
    this.renderCurrentSpread();
    this.setupKeyboardNavigation();
    this.setupTouchNavigation();
    
    // Add active class to body
    document.body.classList.add('comic-san-active');
  }

  deactivate() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.showOriginalContent();
    
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    
    this.removeKeyboardNavigation();
    this.removeTouchNavigation();
    
    document.body.classList.remove('comic-san-active');
  }

  hideOriginalContent() {
    const mainContent = document.querySelector('.flex.flex-col.items-center.justify-center');
    if (mainContent) {
      mainContent.style.display = 'none';
      mainContent.dataset.comicSanHidden = 'true';
    }
  }

  showOriginalContent() {
    const mainContent = document.querySelector('[data-comic-san-hidden]');
    if (mainContent) {
      mainContent.style.display = '';
      delete mainContent.dataset.comicSanHidden;
    }
  }

  createBookContainer() {
    this.container = document.createElement('div');
    this.container.id = 'comic-san-reader';
    this.container.innerHTML = `
      <div class="comic-san-spread-container">
        <div class="comic-san-page comic-san-page-left"></div>
        <div class="comic-san-page comic-san-page-right"></div>
      </div>
      <div class="comic-san-controls">
        <button class="comic-san-btn comic-san-prev" title="Previous spread (Right Arrow)">←</button>
        <div class="comic-san-counter">
          <span class="comic-san-current">1</span> / <span class="comic-san-total">${this.spreads.length}</span>
        </div>
        <button class="comic-san-btn comic-san-next" title="Next spread (Left Arrow)">→</button>
      </div>
      <button class="comic-san-close" title="Exit book view (Escape)">✕</button>
    `;
    
    document.body.appendChild(this.container);
    
    // Setup button handlers
    this.container.querySelector('.comic-san-prev').addEventListener('click', () => this.previousSpread());
    this.container.querySelector('.comic-san-next').addEventListener('click', () => this.nextSpread());
    this.container.querySelector('.comic-san-close').addEventListener('click', () => this.deactivate());
  }

  renderCurrentSpread() {
    if (!this.container) return;
    
    const spread = this.spreads[this.currentSpreadIndex];
    const leftContainer = this.container.querySelector('.comic-san-page-left');
    const rightContainer = this.container.querySelector('.comic-san-page-right');
    const spreadContainer = this.container.querySelector('.comic-san-spread-container');
    
    // Clear containers
    leftContainer.innerHTML = '';
    rightContainer.innerHTML = '';
    spreadContainer.classList.remove('comic-san-double-page');
    
    if (spread.double) {
      // Double page spread
      spreadContainer.classList.add('comic-san-double-page');
      const img = this.createImageElement(spread.double);
      leftContainer.appendChild(img);
    } else {
      // Single pages or empty slots
      if (spread.left) {
        const img = this.createImageElement(spread.left);
        leftContainer.appendChild(img);
      }
      
      if (spread.right) {
        const img = this.createImageElement(spread.right);
        rightContainer.appendChild(img);
      }
    }
    
    // Update counter
    this.updateCounter();
    
    // Update button states
    this.updateButtonStates();
    
    // Preload adjacent spreads
    this.preloadAdjacentSpreads();
  }

  createImageElement(page) {
    const img = document.createElement('img');
    img.src = page.url;
    img.alt = page.alt;
    img.loading = 'eager';
    return img;
  }

  updateCounter() {
    const currentEl = this.container.querySelector('.comic-san-current');
    const totalEl = this.container.querySelector('.comic-san-total');
    
    if (currentEl) currentEl.textContent = this.currentSpreadIndex + 1;
    if (totalEl) totalEl.textContent = this.spreads.length;
  }

  updateButtonStates() {
    const prevBtn = this.container.querySelector('.comic-san-prev');
    const nextBtn = this.container.querySelector('.comic-san-next');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentSpreadIndex === 0;
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentSpreadIndex === this.spreads.length - 1;
    }
  }

  preloadAdjacentSpreads() {
    // Preload next spread
    if (this.currentSpreadIndex + 1 < this.spreads.length) {
      this.preloadSpread(this.currentSpreadIndex + 1);
    }
    
    // Preload previous spread
    if (this.currentSpreadIndex - 1 >= 0) {
      this.preloadSpread(this.currentSpreadIndex - 1);
    }
  }

  preloadSpread(index) {
    const spread = this.spreads[index];
    if (!spread) return;
    
    const imagesToPreload = [];
    if (spread.double) imagesToPreload.push(spread.double);
    if (spread.left) imagesToPreload.push(spread.left);
    if (spread.right) imagesToPreload.push(spread.right);
    
    imagesToPreload.forEach(page => {
      const img = new Image();
      img.src = page.url;
    });
  }

  nextSpread() {
    if (this.currentSpreadIndex < this.spreads.length - 1) {
      this.currentSpreadIndex++;
      this.renderCurrentSpread();
    }
  }

  previousSpread() {
    if (this.currentSpreadIndex > 0) {
      this.currentSpreadIndex--;
      this.renderCurrentSpread();
    }
  }

  setupKeyboardNavigation() {
    this.keyHandler = (e) => {
      if (!this.isActive) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.nextSpread(); // Left arrow = advance forward
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.previousSpread(); // Right arrow = go back
          break;
        case 'Escape':
          e.preventDefault();
          this.deactivate();
          break;
        case ' ':
          e.preventDefault();
          this.nextSpread(); // Space = advance forward
          break;
      }
    };
    
    document.addEventListener('keydown', this.keyHandler);
  }

  removeKeyboardNavigation() {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  setupTouchNavigation() {
    if (!this.container) return;
    
    let touchStartX = 0;
    
    this.touchStartHandler = (e) => {
      touchStartX = e.touches[0].clientX;
    };
    
    this.touchEndHandler = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      // Swipe threshold
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left = advance forward
          this.nextSpread();
        } else {
          // Swipe right = go back
          this.previousSpread();
        }
      }
    };
    
    this.container.addEventListener('touchstart', this.touchStartHandler);
    this.container.addEventListener('touchend', this.touchEndHandler);
  }

  removeTouchNavigation() {
    if (this.container && this.touchStartHandler && this.touchEndHandler) {
      this.container.removeEventListener('touchstart', this.touchStartHandler);
      this.container.removeEventListener('touchend', this.touchEndHandler);
      this.touchStartHandler = null;
      this.touchEndHandler = null;
    }
  }
}
