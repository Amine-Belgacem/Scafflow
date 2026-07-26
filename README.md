# Scafflow

Scafflow is a CLI tool for organizing, packaging, and exporting design project files into a structured output.

## Features
- Organizes project assets and workspace folders
- Supports build workflows for packaged exports
- Uses a simple command-line interface for fast project setup

## Requirements
- Node.js 14 or newer
- npm
- GraphicsMagick installed on Windows

## Installation on Windows
1. Install GraphicsMagick from [SourceForge](https://sourceforge.net/projects/graphicsmagick/files/graphicsmagick-binaries/)
2. Clone this repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the CLI:
   ```bash
   npm start
   ```

## Usage
Show the help menu:
```bash
node main.js --help
```

Build a project to an output folder:
```bash
node main.js build --output ./dist
```

## Project Structure
- `main.js` - application entry point
- `src/` - CLI and project handling logic
- `workspace/` - example workspace data
- `assets/` - templates and sample assets

## License
This project is licensed under the CC0-1.0 License.
