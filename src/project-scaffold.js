/**
 * Handles project scaffolding, template validation, and entry management.
 * @module ProjectScaffold
 */
const is = require('check-types');
const utility = require('./utility.js');
const messages = require('./cli-messages.js');

const TEMPLATE_PATH = '../assets/template.json';

class ProjectScaffold {
    /**
     * Initializes the ProjectScaffold instance and loads the template.
     */
    constructor() {
        this.file = {
            path: TEMPLATE_PATH,
            error: null,
            content: null
        };

        this.project = {
            name: 'default',
            path: '.'
        };

        this.entries = null;
        this.data = [];

        this.loadFileContent();
        this.validateTemplate();
        this.initializeEntries();
    }

    /**
     * Gets the project name.
     * @returns {string}
     */
    get name() {
        return this.project.name;
    }

    /**
     * Sets the project name.
     * @param {string} name
     */
    set name(name) {
        this.project.name = name;
    }

    /**
     * Gets the project path.
     * @returns {string}
     */
    get path() {
        return this.project.path;
    }

    /**
     * Sets the project path.
     * @param {string} path
     */
    set path(path) {
        this.project.path = path;
    }

    /**
     * Loads the template file content.
     */
    loadFileContent() {
        try {
            this.file.content = require(this.file.path);
        } catch (error) {
            console.error(messages.TEMPLATE_ERROR(error));
            throw error;
        }
    }

    /**
     * Checks if an object is empty or not an object.
     * @param {Object} obj
     * @returns {boolean}
     */
    isEmptyObject(obj) {
        return (!is.object(obj) || is.emptyObject(obj));
    }

    /**
     * Validates if the entry is a valid project entry.
     * @param {Object} entry
     * @returns {boolean}
     */
    isEntry(entry) {
        return !this.isEmptyObject(entry) &&
            is.string(entry.entry) &&
            is.string(entry.name) &&
            !this.isEmptyObject(entry.content) &&
            this.isNode(entry.content);
    }

    /**
     * Validates if the child is a valid node.
     * @param {Object} child
     * @returns {boolean}
     */
    isChildNode(child) {
        return !this.isEmptyObject(child) &&
            is.contains(['file', 'dir', 'auto'], child.type) &&
            (!child.hasOwnProperty('on_build') || is.boolean(child.on_build));
    }

    /**
     * Checks if the child node is an auto action node.
     * @param {Object} child
     * @returns {boolean}
     */
    isAuto(child) {
        if (!child.hasOwnProperty('action') ||
            !is.contains(['svg-png', 'svg-jpg', 'pdf-jpg'], child.action)) {
            return false;
        }
        if (child.hasOwnProperty('output_quality')) {
            if (child.action === 'svg-png') return false;
            if (!is.lessOrEqual(child.output_quality, 100)) return false;
        }
        if (child.hasOwnProperty('output_compression')) {
            if (child.action !== 'svg-png') return false;
            if (!is.lessOrEqual(child.output_compression, 9)) return false;
        }
        if (child.hasOwnProperty('output_width') &&
            !is.array.of.integer(child.output_width)) {
            return false;
        }
        return true;
    }

    isNode(node) {
        if (this.isEmptyObject(node)) return false;
        for (const prop in node) {
            const child = node[prop];
            if (!this.isChildNode(child)) return false;
            if (child.type === 'file') {
                if (!is.string(child.source) || is.emptyString(child.source)) return false;
            }
            if (child.type === 'dir') {
                if (!this.isEmptyObject(child.content)) {
                    if (!this.isNode(child.content)) return false;
                }
            }
            if (child.type === 'auto') {
                if (!this.isAuto(child)) return false;
            }
        }
        return true;
    }

    /**
     * Validates the template structure against the defined rules.
     * @throws Will throw an error if the template is invalid.
     */
    validateTemplate() {
        const entries = this.file.content;
        if (entries.length === 0) throw this.file.error;
        for (let i = 0; i < entries.length; i++) {
            if (!this.isEntry(entries[i]) || !this.isNode(entries[i].content)) {
                throw this.file.error;
            }
        }
    }

    /**
     * Initializes the entries array from the template content.
     * @returns {Array} The initialized entries array.
     */
    initializeEntries() {
        const entries = [];
        for (let i = 0; i < this.file.content.length; i++) {
            entries.push({
                entry: this.file.content[i].entry,
                index: i
            });
        }
        this.entries = entries;
        return entries;
    }

    /**
     * Extracts the node structure from the template content for processing.
     * @param {Object} obj - The current object to process.
     * @param {string} path - The current path in the project.
     * @param {Object} data - The data object to populate.
     * @param {boolean} isBuild - Flag indicating if it's a build process.
     * @returns {Object} The updated data object.
     */
    extractNode(obj, path, data, isBuild) {
        let node = 'deploy';
        let toBuild = false;

        for (const prop in obj) {
            const child = obj[prop];

            if (isBuild || child.on_build) {
                node = 'build';
                toBuild = true;
            }

            if (child.type === 'file') {
                const name = utility.decode(prop, this.project.name);
                data[node].file.push({
                    file: utility.toPath(path, name),
                    source: child.source
                });
            }

            if (child.type === 'dir') {
                const name = utility.decode(prop, this.project.name);
                data[node].dir.push(utility.toPath(path, name));

                if (child.hasOwnProperty('content')) {
                    this.extractNode(
                        child.content,
                        utility.toPath(path, name),
                        data, toBuild
                    );
                    toBuild = false;
                    node = 'deploy';
                }
            }

            if (child.type === 'auto') {
                child.path = path;
                data[node].auto.push(child);
            }
        }

        return data;
    }

    /**
     * Processes a specific entry by its index, extracting its data and structure.
     * @param {number} index - The index of the entry to process.
     * @returns {Object} The processed data for the entry.
     */
    processEntry(index) {
        const current = this.file.content[index];
        const currentPath = utility.toPath(
            this.project.path,
            utility.decode(current.name, this.project.name)
        );
        const data = {
            deploy: {
                file: [],
                dir: [],
                auto: []
            },
            build: {
                file: [],
                dir: [],
                auto: []
            }
        };
        data.deploy.dir.push(currentPath);
        this.data = this.extractNode(
            current.content,
            currentPath, data, false
        );
        return data;
    }

    /**
     * Gets the raw template content.
     * @returns {Object} The template content.
     */
    getFileContent() {
        return this.file.content;
    }

    /**
     * Gets the processed data for the project.
     * @returns {Object} The processed data.
     */
    getData() {
        return this.data;
    }
}

/**
 * Exports the ProjectScaffold class.
 */
module.exports = ProjectScaffold;
