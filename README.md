# Scafflow

Scafflow is a CLI-based project scaffolding and packaging tool for design workflows. It helps you create structured project folders from predefined templates, store them in a workspace, and build release-ready outputs such as images, PDFs, and packaged assets.

## What it does

Scafflow can:
- create a new project from one of the built-in template structures
- save projects inside a configurable workspace folder
- list existing projects from the workspace
- build a project from the workspace by ID or from a project directory
- generate image and PDF exports from source assets using GraphicsMagick and Ghostscript

## Core workflow

1. Create a project using a selected structure.
2. The tool scaffolds a folder hierarchy and copies template assets into it.
3. You can later build the project to generate release files based on the project definition.

## Requirements

- Node.js 14 or newer
- npm
- GraphicsMagick installed on Windows
- Ghostscript installed on Windows

## Installation on Windows

1. Install GraphicsMagick from [SourceForge](https://sourceforge.net/projects/graphicsmagick/files/graphicsmagick-binaries/).
2. Install Ghostscript and keep the default installation directory.
3. Clone this repository.
4. Install dependencies:

    ```bash
    npm install
    ```

5. Start the CLI:

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

Set a custom workspace path:

```bash
node main.js set-workspace C:/path/to/workspace
```

Reset the workspace to the default folder:

```bash
node main.js reset-workspace
```

## Project structure

- `main.js` - CLI entry point
- `src/` - command handling, project deployment, dependency checks, and image processing
- `assets/template.json` - predefined project structures and file-generation rules
- `workspace/` - default workspace folder for created projects
- `deps-to-install/` - helper installer files for required tools

## License

This project is licensed under the CC0-1.0 License.
