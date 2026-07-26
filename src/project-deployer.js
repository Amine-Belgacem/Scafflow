/**
 * Handles deployment of projects, including directory creation, file cloning, and image generation.
 * @module ProjectDeployer
 */
const fs = require('fs');
const util = require('./utility.js');
const ImageProcessor = require('./image-processor.js');
const messages = require('./cli-messages.js');

class ProjectDeployer {
    /**
     * The name of the project file.
     * @type {string}
     */
    static PROJECT_FILE = "project.json";

    /**
     * Initializes the ProjectDeployer instance.
     */
    constructor() {
        this.fs = fs;
        this.util = util;
        this.pw = new ImageProcessor();

        this.current = {
            name: "default",
            path: ".",
            entry: "",
            build: null,
            guide: null
        };

        this.projectFile = ProjectDeployer.PROJECT_FILE;
    }

    /**
     * Sets the current project object.
     * @param {Object} obj
     */
    set project(obj) {
        this.current = obj;
    }

    /**
     * Gets the current project object.
     * @returns {Object}
     */
    get project() {
        return this.current;
    }

    /**
     * Creates directories as needed.
     * @param {string[]} dir - Array of directory paths to create.
     * @returns {Promise<void>}
     */
    async makeDir(dir) {
        for (const dirPath of dir) {
            try {
                await fs.promises.access(dirPath);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    await fs.promises.mkdir(dirPath, { recursive: true });
                } else {
                    console.error(messages.ERR_ACCESSING_DIRECTORY(error));
                    throw error;
                }
            }
        }
    }

    /**
     * Clones files from source to destination.
     * @param {Object[]} file - Array of file objects with source and destination.
     * @returns {Promise<void>}
     */
    async cloneFile(file) {
        for (const f of file) {
            let source = this.util.decodePath(f.source, this.current.path);
            let rd, wr;
            try {
                if (!fs.existsSync(source)) {
                    throw new Error(messages.ERR_SOURCE_FILE_NOT_FOUND(source));
                }
                rd = fs.createReadStream(source);
                wr = fs.createWriteStream(f.file);
                await new Promise((resolve, reject) => {
                    rd.on('error', reject);
                    wr.on('error', reject);
                    wr.on('finish', resolve);
                    rd.pipe(wr);
                });
            } catch (error) {
                if (rd) rd.destroy();
                if (wr) wr.end();
                if (error.code === 'ENOENT' || /not found/i.test(error.message)) {
                    console.error(messages.ERR_REQUIRED_SOURCE_FILE_MISSING(source));
                } else {
                    console.error(messages.ERR_CLONING_FILE(error));
                }
                throw error;
            }
        }
    }

    /**
     * Generates images or files for auto actions.
     * @param {Object[]} auto - Array of auto action items.
     * @returns {Promise<void>}
     */
    async generateAuto(auto) {
        for (const item of auto) {
            await this.generateImage(item);
        }
    }

    /**
     * Gets the decoded source path for an auto action item.
     * @param {Object} auto - The auto action item.
     * @returns {string} The decoded source path.
     */
    getSourcePath(auto) {
        return this.util.decodePath(auto.source, this.current.path);
    }

    /**
     * Generates an image or file for a given auto action item.
     * @param {Object} auto - The auto action item.
     * @returns {Promise<void>}
     */
    async generateImage(auto) {
        this.pw.configureFromOptions(auto, this.getSourcePath(auto));
        if (auto.hasOwnProperty('output_width')) {
            for (const width of auto.output_width) {
                let path = this.util.toPath(auto.path, this.util.decode(
                    auto.output_name,
                    this.current.name,
                    width
                ));
                await this.pw.processImage(path, auto.action, width);
            }
        } else {
            let path = this.util.toPath(auto.path, this.util.decode(
                auto.output_name, this.current.name
            ));
            await this.pw.processImage(path, auto.action);
        }
    }

    /**
     * Creates and writes the project file to disk.
     * @returns {Promise<Object>} The project data written to file.
     */
    async makeProjectFile() {
        let file = this.util.toPath(this.current.path, this.projectFile);
        let data = {
            'name': this.current.name,
            'struct': this.current.entry,
            'path': this.current.path,
            'date': new Date().toISOString().slice(0, 10),
            'detail': this.current.detail
        };
        if (this.current.build) data.build = this.current.build;
        if (this.current.guide) data.guide = this.current.guide;
        await fs.promises.writeFile(file, JSON.stringify(data), 'utf8');
        return data;
    }

    /**
     * Builds a project from a project object and directory path.
     * @param {Object} project - The project object.
     * @param {string} dirPath - The directory path.
     * @returns {Promise<void>}
     */
    async buildProjectFromObject(project, dirPath) {
        this.project = Object.assign({}, project, { path: dirPath });
        try {
            await this.makeDir(project.build.dir);
            await this.cloneFile(project.build.file);
            await this.generateAuto(project.build.auto);
        } catch (error) {
            if (error.code === 'ENOENT' || /not found/i.test(error.message)) {
                console.error(messages.ERR_BUILD_MISSING_SOURCE_FILES);
            } else {
                console.error(messages.ERR_BUILD_PROJECT_FROM_OBJECT(error));
            }
            throw error;
        }
    }
}

/**
 * Exports the ProjectDeployer class.
 */
module.exports = ProjectDeployer;
