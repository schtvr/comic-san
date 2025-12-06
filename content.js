// content.js - Main content script that initializes the book reader

let bookReader = null;
let isBookMode = false;

// Initialize when page loads
async function init() {
  // Check if book mode is enabled
  const result = await chrome.storage.sync.get(['bookModeEnabled']);
  isBookMode = result.bookModeEnabled !== false; // Default to true
  
  if (isBookMode) {
    activateBookMode();
  }
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleBookMode') {
      if (message.enabled) {
        activateBookMode();
      } else {
        deactivateBookMode();
      }
      isBookMode = message.enabled;
    }
  });
}

async function activateBookMode() {
  // Find all manga page images
  const images = findMangaImages();
  
  if (images.length === 0) {
    console.log('Comic San: No manga images found');
    return;
  }
  
  console.log(`Comic San: Found ${images.length} manga pages`);
  
  try {
    // Analyze images
    const analyzer = new ImageAnalyzer();
    const analyzedPages = await analyzer.analyzePages(images);
    
    console.log('Comic San: Pages analyzed:', analyzedPages);
    
    // Extract TCB credits page
    const { pages, creditsPage } = analyzer.extractTCBCredits(analyzedPages);
    
    if (creditsPage) {
      console.log('Comic San: TCB credits page detected and moved to end');
    }
    
    // Create and activate book reader
    bookReader = new BookReader(pages, creditsPage);
    bookReader.activate();
    
    console.log('Comic San: Book mode activated');
  } catch (error) {
    console.error('Comic San: Error activating book mode:', error);
  }
}

function deactivateBookMode() {
  if (bookReader) {
    bookReader.deactivate();
    bookReader = null;
    console.log('Comic San: Book mode deactivated');
  }
}

function findMangaImages() {
  // Find all images in the manga container
  const container = document.querySelector('.flex.flex-col.items-center.justify-center');
  
  if (!container) {
    console.log('Comic San: Manga container not found');
    return [];
  }
  
  // Get all picture elements with images
  const pictures = container.querySelectorAll('picture.fixed-ratio');
  const images = [];
  
  pictures.forEach(picture => {
    const img = picture.querySelector('img.fixed-ratio-content');
    if (img && img.src) {
      images.push(img);
    }
  });
  
  return images;
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
