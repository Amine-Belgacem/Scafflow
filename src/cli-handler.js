/**
 * Handles CLI command parsing, user interaction, and project management operations.
 * @module CliHandler
 */ 
const readline = require('readline');
const Manager = require('./project-manager.js');
const messages = require('./cli-messages.js');
const chalk = require('chalk');
const Utility = require('./utility.js');
const config = require('./config-manager.js');

class CliHandler {
    /**
     * Initializes the CLI handler and project manager.
     * @param {string[]} args - CLI arguments.
     */
    constructor(args) {
        this.manager = new Manager();
        this.rl = null;
    }

    /**
     * Handles CLI commands as a static entry point.
     * @param {string[]} args - CLI arguments.
     * @returns {Promise<void>}
     */
    static async handleCli(args) {
        const handler = new CliHandler([]);
        await handler.handleCliCommand(args);
    }

    /**
     * Handles a specific CLI command.
     * @param {string[]} args - CLI arguments.
     * @returns {Promise<void>}
     */
    async handleCliCommand(args) {
        if (!args || args.length === 0) {
            this.print(messages.HELP_TEXT, 'info');
            return;
        }

        const command = args[0];

        switch (command) {
            case 'list':
                return await this.fetchAndDisplayProjects();
            case 'create': {
                const name = Utility.getArg(args, '--name');
                let structIdx = Utility.getArg(args, '--struct');
                let output = Utility.getArg(args, '--output');
                let workspace = output || this.getDefaultWorkspace();

                if (!name) {
                    this.print(messages.ERR_MISSING_NAME_STRUCT, 'error');
                    process.exit(1);
                }

                if (!structIdx) {
                    structIdx = await this.promptForStructure();
                }
                return await this.createProjectWithStruct(name, structIdx, workspace);
            }
            case 'build': {
                const id = Utility.getArg(args, '--id');
                const buildPath = Utility.getArg(args, '--path');
                if (id && buildPath) {
                    return this.exitWithError(messages.ERR_BUILD_ID_PATH_EXCLUSIVE);
                }
                if (id) {
                    return await this.buildProjectById(id);
                } else if (buildPath) {
                    return await this.buildProjectByPath(buildPath);
                } else {
                    return this.exitWithError(messages.ERR_MISSING_PATH_OR_ID);
                }
            }
            case 'set-workspace': {
                const newPath = args[1];
                if (!newPath) {
                    this.print(messages.ERR_SET_WORKSPACE_MISSING_PATH, 'error');
                    process.exit(1);
                }
                this.setDefaultWorkspace(newPath);
                this.print(messages.STATUS_WORKSPACE_UPDATED(newPath), 'success');
                break;
            }
            case 'reset-workspace':
                return this.handleResetWorkspaceCommand();
            default:
                this.print(messages.HELP_TEXT, 'info');
        }
    }

    /**
     * Gets the default workspace path from config or fallback.
     * @returns {string} The default workspace path.
     */
    getDefaultWorkspace() {
        return config.get('workspace.path') || require('path').resolve('./workspace');
    }

    /**
     * Sets the default workspace path and updates config.
     * @param {string} newPath - The new workspace path.
     */
    setDefaultWorkspace(newPath) {
        if (!require('fs').existsSync(newPath)) {
            require('fs').mkdirSync(newPath, { recursive: true });
        }
        this.manager.workspace = newPath;
        config.set('workspace.path', newPath);
    }

    /**
     * Fetches and displays all projects in the workspace.
     * @returns {Promise<void>}
     */
    async fetchAndDisplayProjects() {
        let title = messages.PROJECT_LIST_TITLE;
        if (title.startsWith('\n')) title = title.slice(1);
        this.print(title, 'info');
        let rows = [];

        await new Promise(resolve => {
            this.manager.loadProjects(prj => {
                rows.push({
                    ID: prj.id,
                    Name: prj.name,
                    Struct: prj.struct,
                    Date: prj.date
                });
            }, resolve);
        });

        if (rows.length === 0) {
            this.print(messages.PROJECT_LIST_EMPTY, 'info');
        } else {
            this.printTable(['ID', 'Name', 'Struct', 'Date'], rows);
        }
    }

    /**
     * Checks if the structure index is invalid.
     * @param {number} idx - The structure index.
     * @returns {boolean}
     */
    isInvalidStructureIndex(idx) {
        return isNaN(idx) || idx < 0 || idx >= this.manager.template.entries.length;
    }

    /**
     * Creates a new project with the specified structure.
     * @param {string} name - Project name.
     * @param {number|string} structIdx - Structure index.
     * @param {string} workspace - Workspace path.
     * @returns {Promise<void>}
     */
    async createProjectWithStruct(name, structIdx, workspace) {
        if (!name || !structIdx) {
            return this.exitWithError(messages.ERR_MISSING_NAME_STRUCT);
        }

        const idx = parseInt(structIdx) - 1;
        if (this.isInvalidStructureIndex(idx)) {
            return this.exitWithError(messages.INVALID_STRUCTURE_NUMBER);
        }

        const struct = this.manager.template.entries[idx].index;
        let detail = {};
        let info = this.manager.getProjectInfo(name, struct, workspace, detail);

        this.print(messages.STATUS_CREATING_PROJECT(name), 'info');
        try {
            await this.manager.deployProject(info, () => {
                this.print(messages.STATUS_PROJECT_CREATED_AT(info.project.path), 'info');
                this.print(messages.STATUS_PROJECT_CREATED, 'success');
                if (this.rl) {
                    this.rl.close();
                }
                process.exit(0);
            });
        } catch (error) {
            return this.exitWithError(messages.STATUS_ERROR_CREATING_PROJECT(error));
        }
    }

    /**
     * Prompts the user to select a project structure.
     * @returns {Promise<string>} The selected structure index.
     */
    async promptForStructure() {
        this.print(messages.AVAILABLE_STRUCTURES, 'info');
        const structRows = this.manager.template.entries.map((entry, idx) => ({
            Index: idx + 1,
            Name: entry.entry
        }));
        Utility.printTable(['Index', 'Name'], structRows);

        return await new Promise(resolve => {
            if (!this.rl) {
                this.rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
            }
            this.rl.question(messages.SELECT_STRUCTURE_NUMBER, (structIdx) => {
                resolve(structIdx);
            });
        });
    }

    /**
     * Finds the index of a project by its ID.
     * @param {string|number} id - Project ID.
     * @returns {number} The project index, or -1 if not found.
     */
    findProjectIndexById(id) {
        const projects = this.manager.projects;
        return projects.findIndex(prj => prj.id.toString() === id);
    }

    /**
     * Builds a project by its ID.
     * @param {string|number} id - Project ID.
     * @returns {Promise<void>}
     */
    async buildProjectById(id) {
        if (!id) {
            return this.exitWithError(messages.ERR_MISSING_ID);
        }

        await new Promise(resolve => this.manager.loadProjects(() => {}, resolve));
        const projectIndex = this.findProjectIndexById(id);

        if (projectIndex === -1) {
            return this.exitWithError(messages.ERR_PROJECT_NOT_FOUND);
        }

        const project = this.manager.projects[projectIndex];
        this.print(messages.STATUS_BUILDING_PROJECT(project.name), 'info');
        try {
            await this.manager.buildProject(projectIndex, () => {
                this.print(messages.STATUS_PROJECT_BUILT, 'success');
            });
        } catch (error) {
            return this.exitWithError(messages.STATUS_ERROR_BUILDING_PROJECT(error));
        }
    }

    /**
     * Builds a project by its directory path.
     * @param {string} dirPath - Directory path.
     * @returns {Promise<void>}
     */
    async buildProjectByPath(dirPath) {
        const projectFile = require('path').join(dirPath, 'project.json');
        if (!require('fs').existsSync(projectFile)) {
            return this.exitWithError(messages.ERR_PROJECT_NOT_FOUND);
        }
        let project;
        try {
            project = require(projectFile);
        } catch (error) {
            return this.exitWithError(messages.STATUS_ERROR_BUILDING_PROJECT(error));
        }
        this.print(messages.STATUS_BUILDING_PROJECT_FROM_PATH(dirPath), 'info');
        try {
            await this.manager.deploy.buildProjectFromObject(project, dirPath);
            this.print(messages.STATUS_PROJECT_BUILT, 'success');
        } catch (error) {
            return this.exitWithError(messages.STATUS_ERROR_BUILDING_PROJECT(error));
        }
    }

    /**
     * Handles the reset workspace command.
     */
    handleResetWorkspaceCommand() {
        const defaultWorkspace = require('path').resolve('./workspace');

        if (!require('fs').existsSync(defaultWorkspace)) {
            require('fs').mkdirSync(defaultWorkspace, { recursive: true });
        }

        this.manager.workspace = defaultWorkspace;
        config.set('workspace.path', defaultWorkspace);
        this.print(messages.STATUS_WORKSPACE_RESET(defaultWorkspace), 'success');
    }

    /**
     * Prints a message to the console with optional type coloring.
     * @param {string|string[]} msg - The message to print.
     * @param {string} [type='info'] - Message type: 'info', 'error', or 'success'.
     */
    print(msg, type = 'info') {
        switch (type) {
            case 'error':
                console.log(chalk.red(msg));
                break;
            case 'success':
                console.log(chalk.green(msg));
                break;
            default:
                console.log(msg);
        }
    }

    /**
     * Prints an error message and exits.
     * @param {string} msg - The error message.
     */
    exitWithError(msg) {
        this.print(msg, 'error');
    }

    /**
     * Prints a formatted table to the console.
     * @param {string[]} headers - Table headers.
     * @param {Object[]} rows - Table rows.
     */
    printTable(headers, rows) {
        Utility.printTable(headers, rows);
    }

    /**
     * Formats a table row for display.
     * @param {string[]} headers - Table headers.
     * @param {Object} row - Row data.
     * @param {number[]} colWidths - Column widths.
     * @returns {string} The formatted row.
     */
    formatTableRow(headers, row, colWidths) {
        return Utility.formatTableRow(headers, row, colWidths);
    }

    /**
     * Formats the table header for display.
     * @param {string[]} headers - Table headers.
     * @param {number[]} colWidths - Column widths.
     * @returns {string} The formatted header.
     */
    formatTableHeader(headers, colWidths) {
        return Utility.formatTableHeader(headers, colWidths);
    }
}

/**
 * Exports the CliHandler class.
 */
module.exports = CliHandler;
