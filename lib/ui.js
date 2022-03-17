class ui {
	constructor() {
		this.jQuery = null
	}

	static showThisOnly(showId, hideIds) {
		for (let i = 0; i < hideIds.length; i++) {
			document.querySelector(hideIds[i]).style.display = "none"
		}
		document.querySelector(showId).style.display = "block"
	}

	static show(id) {
		document.querySelector(id).style.display = "block"
	}

	static hide(id) {
		document.querySelector(id).style.display = "none"
	}

	static showOpenDialog(callback) {
		const { dialog } = require('electron').remote
		dialog.showOpenDialog({
				properties: ['openDirectory']
			})
			.then((result) => {
				callback(result)
			})
			.catch((error) => {
				throw error
			})
	}

	static appendSelect(id, text, value) {
		let select = document.querySelector(id)
		select.options[select.options.length] = new Option(text, value)
	}

	static populate(id, textProp, valueProp, values) {
		for (let index = 0; index < values.length; index++) {
			const element = values[index]
			ui.appendSelect(id, element[textProp], element[valueProp])
		}
	}

	static getSelected(id) {
		let select = document.querySelector(id)
		return select.options[select.selectedIndex]
	}

	static getInput(id) {
		return document.querySelector(id).value
	}

	static setInput(id, value) {
		document.querySelector(id).value = value
	}

	static setHtml(id, value) {
		document.querySelector(id).innerHTML = value
	}

	static getHtml(id) {
		return document.querySelector(id).innerHTML
	}

	static enable(id) {
		if (Array.isArray(id))
			for (let i = 0; i < id.length; i++) {
				document.querySelector(id[i]).disabled = false
			}
		else document.querySelector(id).disabled = false
	}

	static disable(id) {
		if (Array.isArray(id))
			for (let i = 0; i < id.length; i++) {
				document.querySelector(id[i]).disabled = true
			}
		else document.querySelector(id).disabled = true
	}

	static onClick(id, callback) {
		document.querySelector(id).addEventListener('click', callback)
	}

	static onSubmit(id, callback) {
		document.querySelector(id).addEventListener('submit', callback)
	}

	static onKeyup(id, callback) {
		document.querySelector(id).addEventListener('keyup', callback)
	}

	static findLabel(element) {
		let id = element.id
		let labels = document.getElementsByTagName('label')
		for (let i = 0; i < labels.length; i++) {
			if (labels[i].htmlFor == id)
				return labels[i].innerHTML
		}
	}

	static showModal(id) {
		if (!this.jQuery) this.jQuery = require("jquery")
		this.jQuery(document).ready(() => {
			this.jQuery(id).modal('show')
		})
	}

	static hideModal(id) {
		if (!this.jQuery) this.jQuery = require("jquery")
		this.jQuery(document).ready(() => {
			this.jQuery(id).modal('hide')
		})
	}

	static showToast(id) {
		if (!this.jQuery) this.jQuery = require("jquery")
		this.jQuery(document).ready(() => {
			this.jQuery(id).toast('show')
		})
	}

	static hideToast(id) {
		if (!this.jQuery) this.jQuery = require("jquery")
		this.jQuery(document).ready(() => {
			this.jQuery(id).toast('hide')
		})
	}

	static serializeForm(id) {
		var form = document.querySelector(id)
		var serialized = []
		for (let i = 0; i < form.elements.length; i++) {
			let field = form.elements[i]

			if (!field.id || field.disabled || field.type === 'file' ||
				field.type === 'reset' || field.type === 'submit' ||
				field.type === 'button') continue

			if (field.type === 'select-multiple')
				for (let i = 0; i < field.options.length; i++) {
					if (!field.options[i].selected) continue
					serialized.push({
						id: field.id,
						value: field.options[i].value,
						label: this.findlabel(field)
					})
				}
			else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked)
				serialized.push({
					id: field.id,
					value: field.value,
					label: this.findLabel(field)
				})
		}
		return serialized
	}
}

module.exports = ui