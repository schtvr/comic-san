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
    
    if (pages.length === 0) return;
    
    // Strategy: Work through sections between double pages
    // Each section should have proper pairing based on count
    
    // Split pages into sections (separated by double pages)
    const sections = [];
    let currentSection = [];
    
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].isDouble) {
        if (currentSection.length > 0) {
          sections.push({ type: 'singles', pages: currentSection });
          currentSection = [];
        }
        sections.push({ type: 'double', pages: [pages[i]] });
      } else {
        currentSection.push(pages[i]);
      }
    }
    if (currentSection.length > 0) {
      sections.push({ type: 'singles', pages: currentSection });
    }
    
    // Process first section specially (first page always alone on left)
    if (sections.length > 0 && sections[0].type === 'singles') {
      const firstSection = sections.shift();
      const firstPage = firstSection.pages.shift();
      
      // First page alone on left
      this.spreads.push({ left: firstPage, right: null, double: null, soloPage: true });
      
      // If there are remaining pages in first section, add them back
      if (firstSection.pages.length > 0) {
        sections.unshift({ type: 'singles', pages: firstSection.pages });
      }
    } else if (sections.length > 0 && sections[0].type === 'double') {
      // First page is a double
      const firstDouble = sections.shift();
      this.spreads.push({ left: null, right: null, double: firstDouble.pages[0] });
    }
    
    // Process remaining sections
    for (const section of sections) {
      if (section.type === 'double') {
        // Add double page spread
        this.spreads.push({ left: null, right: null, double: section.pages[0] });
      } else {
        // Process singles section
        const singles = section.pages;
        
        // Count singles to determine if we need to start with an orphan
        const count = singles.length;
        
        // If odd count, first page goes alone on right
        let startIdx = 0;
        if (count % 2 === 1) {
          this.spreads.push({ left: null, right: singles[0], double: null });
          startIdx = 1;
        }
        
        // Pair the remaining singles: [i+1, i]
        for (let i = startIdx; i < singles.length; i += 2) {
          if (i + 1 < singles.length) {
            this.spreads.push({ 
              left: singles[i + 1], 
              right: singles[i], 
              double: null 
            });
          }
        }
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
    spreadContainer.classList.remove('comic-san-solo-page');
    
    if (spread.double) {
      // Double page spread
      spreadContainer.classList.add('comic-san-double-page');
      const img = this.createImageElement(spread.double);
      leftContainer.appendChild(img);
    } else {
      // Single pages or empty slots
      if (spread.soloPage) {
        // Solo page (like first page) - center it
        spreadContainer.classList.add('comic-san-solo-page');
      }
      
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
