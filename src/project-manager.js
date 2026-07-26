/**
 * Manages projects in the workspace, including loading, configuration, and deployment.
 * @module ProjectManager
 */
const walk = require('walkdir');
const loadJson = require('load-json-file');
const util = require('./utility.js');
const is = require('check-types');
const ProjectDeployer = require('./project-deployer.js');
const ProjectScaffold = require('./project-scaffold.js');
const config = require('./config-manager.js');
const messages = require('./cli-messages.js');

const PROJECT_FILE = 'project.json';
const WORKSPACE_PATH_KEY = 'workspace.path';

class ProjectManager {
    /**
     * Initializes the ProjectManager and loads configuration and template.
     */
    constructor() {
        this.walk = walk;
        this.json = loadJson;
        this.util = util;
        this.is = is;
        this.deploy = new ProjectDeployer();

        this.workspace = null;
        this.config = null;
        this.projectFile = PROJECT_FILE;
        this.projects = [];
        this.template = null;

        this.loadConfigFromFile();
        this.initializeTemplate();
    }

    /**
     * Resets the list of loaded projects.
     */
    resetProjects() {
        this.projects = [];
    }

    /**
     * Checks if a project at the given index has build artifacts.
     * @param {number} index
     * @returns {boolean}
     */
    projectHasBuildArtifacts(index) {
        let build = this.projects[index].build;
        return !(build.file.length === 0 &&
            build.dir.length === 0 &&
            build.auto.length === 0);
    }

    /**
     * Loads configuration from file and sets workspace path.
     */
    loadConfigFromFile() {
        this.config = {
            get: (key) => config.get(key),
            set: (key, value) => config.set(key, value)
        };
        this.workspace = this.config.get(WORKSPACE_PATH_KEY);
    }

    /**
     * Initializes the project template.
     */
    initializeTemplate() {
        this.template = new ProjectScaffold();
    }

    /**
     * Loads all projects in the workspace.
     * @param {function} stepcb - Callback for each project found.
     * @param {function} endcb - Callback when loading is complete.
     * @returns {Promise<void>}
     */
    async loadProjects(stepcb, endcb) {
        this.projects = [];
        let tempProjects = [];
        const emitter = this.walk(this.workspace, { max_depth: 1 });
        emitter.on('directory', (path, stat) => {
            try {
                let prj = this.json.sync(this.util.toPath(path, this.projectFile));
                prj._dir = path;
                tempProjects.push(prj);
            } catch (error) {
                if (!['ENOENT', 'EPERM', 'EACCES'].includes(error.code)) {
                    console.error(messages.ERR_LOADING_PROJECT(error));
                }
            }
        });
        emitter.on('fail', (path, err) => {
            if (!['ENOENT', 'EPERM', 'EACCES', 'EBUSY'].includes(err.code)) {
                console.error(messages.ERR_WALKING_DIRECTORY(err));
            }
        });
        emitter.on('end', () => {
            // Sort by directory name for stable order
            tempProjects.sort((a, b) => a._dir.localeCompare(b._dir));
            tempProjects.forEach((prj, idx) => {
                prj.id = idx;
                delete prj._dir;
                this.projects.push(prj);
                if (this.is.function(stepcb)) stepcb(prj);
            });
            if (this.is.function(endcb)) endcb();
        });
    }

    /**
     * Gets information about a project, including its deployment details.
     * @param {string} name - The name of the project.
     * @param {number} index - The index of the project.
     * @param {string} path - The file system path of the project.
     * @param {object} detail - Additional details for the project.
     * @returns {object} The project information, including deployment details.
     */
    getProjectInfo(name, index, path, detail) {
        this.template.name = name;
        this.template.path = path;
        let data = this.template.processEntry(index);
        return {
            project: {
                name: name,
                path: data.deploy.dir[0],
                entry: this.template.entries[index].entry,
                build: data.build,
                detail: detail
            },
            deploy: data.deploy,
        };
    }

    /**
     * Deploys a project to the target environment.
     * @param {object} info - The project information, including deployment details.
     * @param {function} cb - Callback function to be called after deployment.
     */
    async deployProject(info, cb) {
        this.deploy.project = info.project;
        try {
            await this.deploy.makeDir(info.deploy.dir);
            await this.deploy.cloneFile(info.deploy.file);
            await this.deploy.generateAuto(info.deploy.auto);
            let project = await this.deploy.makeProjectFile();
            project.id = this.projects.length;
            this.projects.push(project);
            if (this.is.function(cb)) cb(project);
        } catch (error) {
            console.error(messages.ERR_DEPLOYING_PROJECT(error));
            if (this.is.function(cb)) cb(null, error);
        }
    }

    /**
     * Builds a project by copying and generating necessary files.
     * @param {number} id - The ID of the project to be built.
     * @param {function} cb - Callback function to be called after building.
     */
    async buildProject(id, cb) {
        let prj = this.projects[id];
        this.deploy.project = prj;
        try {
            await this.deploy.makeDir(prj.build.dir);
            await this.deploy.cloneFile(prj.build.file);
            await this.deploy.generateAuto(prj.build.auto);
            if (this.is.function(cb)) cb();
        } catch (error) {
            console.error(messages.ERR_BUILDING_PROJECT(error));
            if (this.is.function(cb)) cb(error);
        }
    }
}

/**
 * Exports the ProjectManager class.
 */
module.exports = ProjectManager;
