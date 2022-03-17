class Core {
	constructor() {
		this.walk = require('walkdir')
		this.json = require('load-json-file')
		this.util = require('./utility.js')
		this.is = require('check-types')
		this.deploy = new(require('./deploy.js'))

		this.workspace = null
		this.config = null
		this.projectFile = "project.json"
		this.projects = []
		this.template = null

		this.loadConfig()
		this.loadTemplate()
	}

	reset() {
		this.projects = []
	}

	hasBuild(index) {
		let build = this.projects[index].build
		return !(build.file.length == 0 &&
			build.dir.length == 0 &&
			build.auto.length == 0)
	}

	loadConfig() {
		const Store = require('electron-store')
		this.config = new Store("Deploy")
		this.workspace = this.config.get('workspace.path')
	}

	loadTemplate() {
		const Template = require('./template.js')
		this.template = new Template
	}

	async loadProjects(stepcb, endcb) {
		let count = 0
		await this.walk.async(
			this.workspace, {
				"max_depth": 1
			}, (path, stat) => {
				try {
					let prj = this.json.sync(this.util.toPath(path, this.projectFile))
					prj.id = count
					this.projects.push(prj)
					if (this.is.function(stepcb)) stepcb(prj)
					count++
				} catch (error) {
					if (!error.code === 'ENOENT') throw error
				}
			})
		if (this.is.function(endcb)) endcb()
	}

	getProjectInfo(name, index, path, detail) {
		this.template.name = name
		this.template.path = path
		let data = this.template.process(index)
		return {
			project: {
				name: name,
				path: data.deploy.dir[0],
				entry: this.template.entries[index].entry,
				build: data.build,
				detail: detail
			},
			deploy: data.deploy,
		}
	}

	async deployProject(info, cb) {
		this.deploy.project = info.project

		await this.deploy.makeDir(info.deploy.dir)
		await this.deploy.cloneFile(info.deploy.file)
		await this.deploy.generateAuto(info.deploy.auto)

		let project = await this.deploy.makeProjectFile()
		project.id = this.projects.length
		this.projects.push(project)

		if (this.is.function(cb)) cb(project)
	}

	async buildProject(id, cb) {
		let prj = this.projects[id]
		this.deploy.project = prj

		await this.deploy.makeDir(prj.build.dir)
		await this.deploy.cloneFile(prj.build.file)
		await this.deploy.generateAuto(prj.build.auto)

		if (this.is.function(cb)) cb()
	}
}

module.exports = Core