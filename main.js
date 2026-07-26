/**
 * Main entry point for the Scafflow CLI application.
 * Handles argument parsing, dependency checks, and command execution.
 */

const path = require('path');
const chalk = require('chalk');
const messages = require('./src/cli-messages.js');
const CliHandler = require('./src/cli-handler.js');
const pkg = require('./package.json');
const utility = require('./src/utility.js');
const config = require('./src/config-manager.js');
const DependencyChecker = require('./src/deps-checker.js');

class Scafflow {
    /**
     * Initializes the CLI arguments and starts the application.
     */
    constructor() {
        this.args = process.argv.slice(2);
        this.run();
    }

    /**
     * Retrieves the value for a given CLI flag.
     * @param {string} flag - The flag to search for (e.g., '--output').
     * @returns {string|undefined} The value of the flag if present, otherwise undefined.
     */
    getArg(flag) {
        return utility.getArg(this.args, flag);
    }

    /**
     * Prints the CLI version and active workspace path.
     * @param {string} outputPath - The output path provided by the user.
     * @param {boolean} isBuild - Whether the current command is a build operation.
     */
    printVersionAndWorkspace(outputPath, isBuild) {
        const appName = utility.capitalizeFirst(pkg.name);
        // Print app name in cyan and version in magenta
        const versionStr = `${chalk.cyan(appName)} CLI v${chalk.magenta(pkg.version)}`;
        console.log(versionStr);
        if (!outputPath) {
            let workspacePath = config.get('workspace.path');
            if (!workspacePath) {
                workspacePath = path.resolve('./workspace');
            }
            console.log('Active workspace: ' + workspacePath);
        }
    }

    /**
     * Prints the help text to the console.
     */
    printHelp() {
        console.log(messages.HELP_TEXT);
    }

    /**
     * Checks for required external dependencies.
     * @returns {Promise<void>} Resolves when all dependencies are checked.
     */
    async checkDependencies() {
        await DependencyChecker.checkAll(messages);
    }

    /**
     * Main execution method for the CLI application.
     * Handles argument parsing, dependency checks, and command dispatch.
     * @returns {Promise<void>}
     */
    async run() {
        const outputPath = this.getArg('--output') || this.getArg('--path');
        const isBuild = this.args[0] === 'build';
        this.printVersionAndWorkspace(outputPath, isBuild);
        const hasArgs = this.args.length > 0;
        try {
            await this.checkDependencies();
            if (hasArgs) {
                await CliHandler.handleCli(this.args);
            } else {
                this.printHelp();
                process.exit(0);
            }
        } catch (err) {
            console.error(chalk.red(err.message || err));
            process.exit(1);
        }
    }
}

/**
 * Instantiates and runs the Scafflow CLI.
 */
new Scafflow();
