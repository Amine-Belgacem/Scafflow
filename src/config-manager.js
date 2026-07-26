/**
 * Handles reading and writing configuration settings from a JSON file.
 * @module Config
 */
const fs = require('fs');

class Config {
    /**
     * Initializes the Config instance with the given config file path.
     * @param {string} [configFile='./config.json'] - Path to the config file.
     */
    constructor(configFile = './config.json') {
        this.configFile = configFile;
    }

    /**
     * Reads the configuration file.
     * @returns {Object} The configuration object.
     */
    readConfig() {
        if (fs.existsSync(this.configFile)) {
            return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        }
        return {};
    }

    /**
     * Gets a configuration value by key.
     * @param {string} key - The configuration key.
     * @returns {*} The value for the key, or undefined if not found.
     */
    get(key) {
        return this.readConfig()[key];
    }

    /**
     * Sets a configuration value by key.
     * @param {string} key - The configuration key.
     * @param {*} value - The value to set.
     */
    set(key, value) {
        const config = this.readConfig();
        config[key] = value;
        fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    }
}

/**
 * Exports a singleton Config instance.
 */
module.exports = new Config();
