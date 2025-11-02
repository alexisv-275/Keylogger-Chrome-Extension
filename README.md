# Educational Keylogger Browser Extension

A browser extension designed for educational and security research purposes that captures keyboard input on web pages.

## ⚠️ Legal Disclaimer

This tool is intended **ONLY** for educational purposes and authorized security research. Unauthorized monitoring of user input may violate privacy laws and ethical guidelines. Use responsibly and only on systems you own or have explicit permission to test.

## Features

- **Keystroke Capture**: Records text input from web forms and text fields
- **Privacy Protection**: Automatically excludes sensitive fields (passwords, CVV, credit cards)
- **Interactive Dashboard**: View captured logs with statistics and filtering
- **Export Functionality**: Export logs as JSON 
- **Field Type Detection**: Identifies email, username, search, and general text fields

## Installation

### Chrome/Edge (Developer Mode)

1. Download or clone this repository
2. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the project folder 

The extension icon will appear in your browser toolbar.

## Usage

1. **Start Capturing**: The extension automatically captures keystrokes on all websites once installed
2. **View Dashboard**: Click the extension icon to open the dashboard
3. **Filter Logs**: Use the search bar to filter by website hostname
4. **Export Data**: Click "Export JSON" or "Export CSV" to download captured logs
5. **Clear Data**: Click "Clear All" to delete all stored logs


## Technical Details

- **Manifest Version**: 3
- **Storage**: Chrome Storage API (local)
- **Permissions**: `storage` only
- **Content Script**: Runs on all URLs (`<all_urls>`)

## Security Features

The extension includes built-in protections:

- ✅ **General text, emails, usernames**: Captured for analysis

## Statistics Display

The dashboard provides:
- Total number of captured entries
- Total characters recorded
- Number of unique websites visited
- Timestamps and field metadata

