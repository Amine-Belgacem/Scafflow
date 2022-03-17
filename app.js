class App {
	constructor() {
		require("bootstrap")
		this.core = new(require('./lib/core.js'))
		this.datatable = new(require('./lib/datatable.js'))
		this.ui = require('./lib/ui.js')
		if (!this.core.workspace) {
			this.initButtons()
			this.showFirstRun()
		}
		else this.init()
	}

	showFirstRun() {
		this.showView('setting')
		this.ui.disable(['#newBtn', '#mainBtn', '#settingBtn'])
	}

	populateSelects() {
		let countries = require('./assets/country.json')
		this.ui.populate('#country', 'name', 'code', countries)
		this.ui.populate('#struct', 'entry', 'index', this.core.template.entries)
	}

	showView(panel) {
		switch (panel) {
			case "setting":
				this.ui.showThisOnly('#setting', ['#main', '#new', '#loading', '#bottomBar'])
				this.ui.enable(['#newBtn', '#mainBtn', '#settingBtn'])
				break
			case "main":
				this.ui.showThisOnly('#main', ['#setting', '#new', '#loading'])
				this.ui.show('#bottomBar')
				this.ui.enable(['#newBtn', '#mainBtn', '#settingBtn'])
				break
			case "new":
				this.ui.showThisOnly('#new', ['#main', '#loading', '#setting', '#bottomBar'])
				this.ui.enable(['#newBtn', '#mainBtn', '#settingBtn'])
				break
			case "loading":
				this.ui.disable(['#newBtn', '#mainBtn', '#settingBtn'])
				this.ui.showThisOnly('#loading', ['#main', '#new', '#setting', '#bottomBar'])
				break
		}
	}

	init() {
		this.ui.setInput('#path', this.core.workspace)
		this.populateSelects()
		this.initTable()
		this.initButtons()
	}

	showError(error) {
		this.ui.setHtml('#errorMsg', error)
		this.ui.showModal('#error')
	}

	expandBtn() {
		return '<button class="btn button-sm">'
			+ '<i class="fas fa-angle-right d-flex justify-content-center"></i>'
			+ '</button>'
	}

	async populateTable() {
		try {
			await this.core.loadProjects(prj => {
				let row = [this.expandBtn(), prj.id, prj.name, prj.struct, prj.date]
				this.datatable.addRow(row)
			}, () => {
				this.showView('main')
			})
		} catch (error) {
			this.showView('main')
			this.showError(error)
		}
	}

	rePopulateTable() {
		this.datatable.reset()
		this.core.reset()
		this.populateTable()
	}

	async initTable() {
		this.datatable.id = '#list'
		this.datatable.config = {
			"paging": false,
			"dom": '',
			"order": [],
			"columnDefs": [{
					"targets": [1],
					"visible": false,
					"searchable": false
				},{
					"targets": [0],
					"orderable": false
				},
			]
		}
		this.datatable.initRow((index, row) => {
			if (this.core.hasBuild(index)) this.ui.enable('#buildBtn')
			else this.ui.disable('#buildBtn')
			this.ui.enable('#openBtn')
		})
		this.datatable.initExpand((index, row) => {
			if (row.child.isShown()) {
				row.child.hide()
			} else {
				let detail = this.toList(index, ['name', 'struct'])
				row.child(detail, 'childRow').show()
			}
		})
		try {
			this.datatable.initTable()
			await this.populateTable()
		} catch (error) {
			this.showView('main')
			this.showError(error)
		}
	}

	toList(index, ignore) {
		let list = "<ul class='list-group m-2'>"
		let prj = this.core.projects[index]
		for (let i = 0; i < prj.detail.length; i++) {
			const detail = prj.detail[i]
			if (!ignore.includes(detail.id, 0)) {
				list += "<li class='list-group-item'>" + detail.label + " : "
				list += "<span class='text-secondary'>" + detail.value + "</span>"
				list += "</li>"
			}
		}
		list += "</ul>"
		return list
	}

	initButtons() {
		this.ui.onClick('#browse', event => {
			this.ui.showOpenDialog(path => {
				if (!path.canceled)
					this.ui.setInput('#path', path.filePaths[0])
			})
		})

		this.ui.onClick('#settingBtn', event => {
			this.showView('setting')
		})

		this.ui.onClick('#applyBtn', async event => {
			let path = this.ui.getInput('#path')
			if (!this.core.workspace || path != this.core.workspace) {
				this.core.workspace = path
				this.core.config.set('workspace.path', path)
			}
			if (this.datatable.table) this.rePopulateTable()
			else this.init()
		})

		this.ui.onKeyup('#searchFld', event => {
			this.datatable.search(this.ui.getInput('#searchFld'))
		})

		this.ui.onClick('#openBtn', event => {
			let prj = this.core.projects[this.datatable.current]
			if (prj) {
				const { shell } = require('electron')
				shell.openItem(prj.path)
			}
		})

		this.ui.onClick('#buildBtn', async event => {
			this.showView('loading')
			try {
				await this.core.buildProject(this.datatable.current, () => {
					this.showView('main')
					this.ui.showToast('#success')
				})
			} catch (error) {
				this.showView('main')
				this.ui.setHtml('#errorMsg', error)
				this.ui.showModal('#error')
			}
		})

		this.ui.onClick('#refreshBtn', event => {
			this.rePopulateTable()
		})

		this.ui.onClick('#newBtn', event => {
			document.getElementById("newForm").reset()
			this.showView('new')
		})

		this.ui.onClick('#mainBtn', event => {
			this.showView('main')
		})

		this.ui.onSubmit('#newForm', async event => {
			event.preventDefault()
			let struct = this.ui.getSelected('#struct').value
			let name = this.ui.getInput('#name')
			let detail = this.ui.serializeForm('#newForm')
			let info = this.core.getProjectInfo(name, struct, this.core.workspace, detail)
			this.showView('loading')
			try {
				await this.core.deployProject(info, prj => {
					let row = [this.expandBtn(), prj.id, prj.name, prj.struct, prj.date]
					this.datatable.addRow(row)
					this.showView('main')
				})
			} catch (error) {
				this.showView('main')
				this.showError(error)
			}
		})
	}
}

new App