
class Template {
	constructor() {
		this.is = require('check-types')
		this.fs = require('fs')
		this.util = require('./utility.js')

		this.file = {
			path: "../assets/template.json",
			error: "Corrupted template file. Unable to continue.",
			content: null
		}

		this.project = {
			name: "default",
			path: "."
		}

		this.entries = null;
		this.data = [];

		this.load()
		this.validate()
		this.getEntries()
	}

	get name() {
		return this.project.name
	}

	set name(name) {
		this.project.name = name
	}

	get path() {
		return this.project.path
	}

	set path(path) {
		this.project.path = path
	}

	load() {
		try {
			this.file.content = require(this.file.path)
		} catch (error) {
			throw error
		}
	}

	isEmptyObject(obj) {
		return (!this.is.object(obj) ||
			this.is.emptyObject(obj))
	}

	isEntry(entry) {
		if (this.isEmptyObject(entry) ||
			!this.is.string(entry.entry) ||
			!this.is.string(entry.name) ||
			this.isEmptyObject(entry.content) ||
			!this.isNode(entry.content)) {
			return false
		}
		return true
	}

	isChildNode(child) {
		return !(this.isEmptyObject(child) ||
			!this.is.contains(['file', 'dir', 'auto'], child.type) ||
			(child.hasOwnProperty("on_build") &&
				!this.is.boolean(child.on_build)))
	}

	isAuto(child) {
		if (!child.hasOwnProperty("action") ||
			!this.is.contains(['svg-png', 'svg-jpg', 'pdf-jpg'], child.action))
			return false
		if (child.hasOwnProperty("output_quality")) {
			if (child.action == 'svg-png') return false
			if (!this.is.lessOrEqual(child.output_quality, 100))
				return false
		}
		if (child.hasOwnProperty("output_compression")) {
			if (!child.action == 'svg-png') return false
			if (!this.is.lessOrEqual(child.output_compression, 9))
				return false
		}
		if (child.hasOwnProperty("output_width") &&
			!this.is.array.of.integer(child.output_width))
			return false
		return true
	}

	isNode(node) {
		if (this.isEmptyObject(node)) return false
		for (let prop in node) {
			let child = node[prop]
			if (!this.isChildNode(child)) return false
			if (child.type == "file") {
				if (!this.is.string(child.source) || this.is.emptyString(child.source))
					return false
			}
			if (child.type == "dir") {
				if (!this.isEmptyObject(child.content)) {
					if (!this.isNode(child.content)) return false
				}
			}
			if (child.type == "auto") {
				if (!this.isAuto(child)) return false
			}
		}
		return true
	}

	validate() {
		let entries = this.file.content;
		if (entries.length == 0) throw this.file.error
		for (let i = 0; i < entries.length; i++) {
			if (!this.isEntry(entries[i]) ||
				!this.isNode(entries[i].content)) {
				throw this.file.error
			}
		}
	}

	getEntries() {
		const entries = []
		for (let i = 0; i < this.file.content.length; i++) {
			entries.push({
				entry: this.file.content[i].entry,
				index: i
			})
		}
		this.entries = entries
		return entries
	}

	extract(obj, path, data, isBuild) {
		let node = "deploy"
		let toBuild = false
		for (let prop in obj) {
			let child = obj[prop];
			if (isBuild || child.on_build) {
				node = "build"
				toBuild = true
			}
			if (child.type == "file") {
				let name = this.util.decode(prop, this.project.name)
				data[node].file.push({
					'file': this.util.toPath(path, name),
					'source': child.source
				})
			}
			if (child.type == "dir") {
				let name = this.util.decode(prop, this.project.name)
				data[node].dir.push(this.util.toPath(path, name))
				if (child.hasOwnProperty("content")) {
					this.extract(
						child.content,
						this.util.toPath(path, name),
						data, toBuild
					);
					toBuild = false
					node = "deploy"
				}
			}
			if (child.type == "auto") {
				child.path = path
				data[node].auto.push(child)
			}
		}
		return data
	}

	process(index) {
		let current = this.file.content[index]
		let currentPath = this.util.toPath(
			this.project.path,
			this.util.decode(current.name, this.project.name)
		)
		let data = {
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
		}
		data.deploy.dir.push(currentPath)
		this.data = this.extract(
			current.content,
			currentPath, data, false
		)
		return data
	}

	getFileContent() {
		return this.file.content
	}

	getData() {
		return this.data
	}
}

module.exports = Template