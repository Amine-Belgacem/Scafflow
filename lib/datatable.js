class DataTable {
	constructor() {
		this.jQuery = require('jquery')
		this.is = require('check-types')

		this.id = null
		this.table = null
		this.config = null
		this.current = null,
			this.rows = []

		this.select = {
			enable: true,
			class: "select",
			column: 1
		}
	}

	getConfig(cb) {
		let config = this.config
		config.data = this.rows
		if (this.is.function(cb))
			config.initComplete = (settings, json) => {
				cb(settings, json)
			}
		return config
	}

	selectRow(row) {
		let selClass = this.select.class
		if (this.jQuery(row).hasClass(selClass))
			this.jQuery(row).removeClass(selClass)
		else {
			this.jQuery('tr.' + selClass).removeClass(selClass)
			this.jQuery(row).addClass(selClass)
		}
	}

	initRow(cb) {
		let that = this
		this.jQuery(this.id + ' tbody').on('click', 'tr', function () {
			that.selectRow(this)
			let row = that.table.row(that.jQuery(this).closest('tr'))
			that.current = that.table.row(this).data()[that.select.column]
			if (that.is.function(cb)) cb(that.current, row)

		})
	}

	initExpand(cb) {
		let that = this
		this.jQuery(this.id + ' tbody').on('click', 'button', function () {
			that.selectRow(this)
			let row = that.table.row(that.jQuery(this).closest('tr'))
			that.current = that.table.row(row).data()[that.select.column]
			that.jQuery(this).find('i:first').toggleClass('fa-angle-right fa-angle-down')
			if (that.is.function(cb)) cb(that.current, row)
		})
	}

	initTable(cb) {
		require('datatables.net-bs4')(window, this.jQuery)
		let config = this.getConfig(cb)
		this.jQuery(document).ready(() => {
			this.table = this.jQuery(this.id).DataTable(config)
		})
	}

	addRow(row) {
		this.rows.push(row)
		this.table.row.add(row).draw()
	}

	reset() {
		this.rows = []
		this.table.clear().draw()
	}

	search(value) {
		this.table.search(value).draw()
	}

	hideChild(index) {
		this.table.rows().eq(0).each(index => {
			this.table.row(index).child.hide()
		})
	}
}

module.exports = DataTable