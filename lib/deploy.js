class Deploy {
	constructor() {
		this.fs = require('fs')
		this.util = require('./utility.js')
		this.pw = new(require('./pixelwork.js'))

		this.current = {
			name: "default",
			path: ".",
			entry: "",
			build: null,
			guide: null
		}

		this.projectFile = "project.json"
	}

	set project(obj) {
		this.current = obj
	}

	get project() {
		return this.current
	}

	async makeDir(dir) {
		for (let i = 0; i < dir.length; i++) {
			let exist = await new Promise(resolve => {
				this.fs.stat(dir[i], error => {
					if (error == null) resolve(true)
					else if (error.code === 'ENOENT') resolve(false)
					else throw error
				})
			})
			if (!exist) {
				await new Promise(resolve => {
					this.fs.mkdir(dir[i], (error) => {
						if (error) throw error
						resolve()
					})
				})
			}
		}
	}

	async cloneFile(file) {
		for (let i = 0; i < file.length; i++) {
			let source = this.util.decodePath(file[i].source, this.current.path)
			let rd = this.fs.createReadStream(source)
			let wr = this.fs.createWriteStream(file[i].file)
			try {
				await new Promise((resolve, reject) => {
					rd.on('error', reject)
					wr.on('error', reject)
					wr.on('finish', resolve)
					rd.pipe(wr)
				})
			} catch (error) {
				rd.destroy()
				wr.end()
				throw error
			}
		}
	}

	async generateAuto(auto) {
		for (let i = 0; i < auto.length; i++) {
			await this.generateImage(auto[i])
		}
	}

	async generateImage(auto) {
		this.pw.init(auto, this.util.decodePath(auto.source, this.current.path))
		if (auto.hasOwnProperty('output_width')) {
			for (let i = 0; i < auto.output_width.length; i++) {
				let path = this.util.toPath(auto.path, this.util.decode(
					auto.output_name,
					this.current.name,
					auto.output_width[i]
				))
				await this.pw.makeImage(path, auto.action, auto.output_width[i])
			}
		} else {
			let path = this.util.toPath(auto.path, this.util.decode(
				auto.output_name, this.current.name
			))
			await this.pw.makeImage(path, auto.action)
		}
	}

	async makeProjectFile() {
		let file = this.util.toPath(this.current.path, this.projectFile)
		let data = {
			'name': this.current.name,
			'struct': this.current.entry,
			'path': this.current.path,
			'date': new Date().toISOString().slice(0, 10),
			'detail': this.current.detail
		}
		if (this.current.build) data.build = this.current.build
		if (this.current.guide) data.guide = this.current.guide
		return await new Promise(resolve => {
			this.fs.writeFile(file, JSON.stringify(data), 'utf8', (error) => {
				if (error) throw error
				else resolve(data)
			})
		})
	}
}

module.exports = Deploy