/**
 * Checks for required external dependencies such as GraphicsMagick and Ghostscript.
 * @module DependencyChecker
 */
const { exec } = require('child_process');
const messages = require('./cli-messages.js');

class DependencyChecker {
    /**
     * Checks if GraphicsMagick is installed.
     * @returns {Promise<boolean>} Resolves to true if installed, false otherwise.
     */
    static checkGraphicsMagickInstalled() {
        return new Promise(resolve => {
            exec('gm.exe -version', error => resolve(!error));
        });
    }

    /**
     * Checks if Ghostscript is installed.
     * @returns {Promise<boolean>} Resolves to true if installed, false otherwise.
     */
    static checkGhostscriptInstalled() {
        return new Promise(resolve => {
            exec('gswin64c.exe -version', error => {
                if (!error) return resolve(true);
                exec('gswin32c.exe -version', error2 => resolve(!error2));
            });
        });
    }

    /**
     * Checks all required dependencies and throws if any are missing.
     * @returns {Promise<void>}
     */
    static async checkAll() {
        if (!await this.checkGraphicsMagickInstalled()) {
            throw new Error(messages.ERR_GM_NOT_INSTALLED);
        }
        if (!await this.checkGhostscriptInstalled()) {
            throw new Error(messages.ERR_GS_NOT_INSTALLED);
        }
    }
}

/**
 * Exports the dependency checker class.
 */
module.exports = DependencyChecker;
