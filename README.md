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

### Icon Setup (Optional)

The extension includes an SVG icon. For best results, convert it to PNG:
- See `icons/README.md` for instructions
- Extension works with default Chrome icon if PNG files are missing

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

### Page Layout

The extension transforms vertical manga pages into book spreads:

**Example flow:**
1. Spread 1: `[_, Cover]` - Cover alone on right
2. Spread 2: `[Page 3, Page 2]` - Pages paired right-to-left
3. Spread 3: `[Page 5, Page 4]`
4. Continue...
5. Final spread: `[TCB Credits]` - Credits moved to end

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

### Add More Sites

Edit `manifest.json` content_scripts matches:
```json
"matches": [
  "*://yoursite.com/chapters/*"
]
```

## Development

### File Structure

```
comic-san/
├── manifest.json          # Extension configuration
├── content.js            # Main initialization script
├── book-reader.js        # Core book view engine
├── image-analyzer.js     # Page detection logic
├── styles.css            # Book view styles
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── icons/                # Extension icons
│   ├── icon.svg         # Source SVG
│   └── README.md        # Icon instructions
└── README.md            # This file
```

### Key Components

**ImageAnalyzer** (`image-analyzer.js`)
- Analyzes image dimensions
- Detects single vs double pages
- Identifies TCB credits page

**BookReader** (`book-reader.js`)
- Generates spreads from pages
- Renders book layout
- Handles navigation and controls
- Manages preloading

**Content Script** (`content.js`)
- Finds manga images on page
- Initializes book reader
- Listens for toggle messages

## Customization

### Aspect Ratio Threshold

Adjust double-page detection in `content.js`:
```javascript
const analyzer = new ImageAnalyzer(1.3); // Change threshold
```

### Keyboard Shortcuts

Modify in `book-reader.js` `setupKeyboardNavigation()` method.

### Styling

Edit `styles.css` to customize:
- Background color
- Page spacing
- Control buttons
- Transitions

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

Created for manga readers who prefer the traditional book reading experience.

---

**Note:** This extension is for personal use. Respect manga publishers and support official releases.
