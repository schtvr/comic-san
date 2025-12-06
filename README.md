# Comic San - Manga Book Reader

A Chrome extension that displays manga pages in a proper book format with right-to-left reading order, designed specifically for TCB Scans and similar manga websites.

## Features

- 📖 **Book-style layout** - View manga pages side-by-side like a real book
- ➡️ **Right-to-left reading** - Proper manga reading direction
- 🔄 **Auto-detection** - Automatically identifies single and double-page spreads
- 🎯 **Smart TCB handling** - Moves TCB credits page to the end of the chapter
- ⌨️ **Keyboard navigation** - Easy controls with arrow keys
- 📱 **Touch support** - Swipe gestures for mobile devices
- 🎨 **Clean interface** - Immersive dark background with smooth transitions

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `comic-san` folder

# Installation Instructions

## Quick Start

1. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/` in your Chrome browser
   - Or click the puzzle icon (⋮) → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to and select the `comic-san` folder
   - Click "Select" (or "Open")

4. **Verify Installation**
   - You should see "Comic San - Manga Book Reader" in your extensions list
   - The extension icon will appear in your toolbar

5. **Visit a Manga Chapter**
   - Go to https://onepiecechapters.com/chapters/
   - Open any chapter
   - Book mode should activate automatically!

## Controls

- **Left Arrow** or **Space** → Next spread (turn page forward)
- **Right Arrow** → Previous spread (turn page backward)
- **Escape** → Exit book view

## Usage

1. Navigate to a manga chapter on TCB Scans (onepiecechapters.com)
2. The extension automatically activates book mode
3. Use keyboard controls to navigate:
   - **Left Arrow** or **Space** - Next spread (advance forward)
   - **Right Arrow** - Previous spread (go back)
   - **Escape** - Exit book view

### Toggle Book Mode

Click the extension icon in Chrome toolbar to:
- Enable/disable book mode
- View keyboard shortcuts
- Check current status

## How It Works

### Special Handling

- **Cover page** - Displayed alone on the right side
- **Double-page spreads** - Shown full-width spanning both pages
- **TCB credits** - Automatically detected and moved to the end
- **Odd pages** - Last page displayed alone if needed

### Detection Logic

The extension analyzes each image's aspect ratio:
- **Single page**: Height > Width (ratio < 1.3)
- **Double page**: Width > Height × 1.3 (ratio ≥ 1.3)

## Supported Sites

Currently configured for:
- onepiecechapters.com/chapters/*
- tcbscans.com/chapters/*
- tcbonepiecechapters.com/chapters/*

## Customization

### Keyboard Shortcuts

Modify in `book-reader.js` `setupKeyboardNavigation()` method.


## Troubleshooting

### Extension not activating
- Refresh the manga page after installing
- Check that you're on a supported site
- Open browser console (F12) for error messages

### Images not loading
- Check internet connection
- Disable ad blockers temporarily
- Some manga sites may block content scripts

### Wrong page detection
- Adjust aspect ratio threshold
- Report issue with specific chapter URL

## Contributing

Contributions welcome! Areas for improvement:
- Support for additional manga sites
- Settings page for customization
- Bookmark/progress tracking
- Zoom controls
- Fullscreen mode

## License

MIT License - Feel free to modify and distribute

## Credits

Created for manga readers who prefer a digital book reading experience.

---

**Note:** This extension is for personal use. Respect manga publishers and support official releases.
