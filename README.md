# Scafflow

Scafflow is a CLI tool that helps designers and developers organize, package, and export project files into a clear, structured output.

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
List projects in the workspace:
```bash
node main.js list
```

Create a new project:
```bash
node main.js create --name my-project --struct 1
```

Build a project from the workspace by ID:
```bash
node main.js build --id 1
```

Build a project from a directory:
```bash
node main.js build --path ./my-project
```

## Project Structure
- `main.js` - application entry point
- `src/` - CLI and project handling logic
- `workspace/` - example workspace data
- `assets/` - templates and sample assets

## License
This project is licensed under the CC0-1.0 License.
