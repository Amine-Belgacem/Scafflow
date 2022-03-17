class Pixelwork {
	constructor() {
		this.gm = require('gm')
		this.sharp = require('sharp')
		this.getDimension = require('image-size')

		this.image = {
			path: null,
			sharp: null,
			compression: 9,
			quality: 100
		}

		this.pdf = {
			path: null,
			gm: null,
			density: 300,
			quality: 100
		}
	}

	inputSvg(source) {
		this.image.path = source;
		this.image.sharp = this.sharp(source)
	}

	inputPdf(source) {
		this.pdf.path = source
		this.pdf.gm = this.gm(source)
	}

	calcHeight(height, width, scaleWidth) {
		if (width > scaleWidth)
			height = height / (width / scaleWidth)
		else if (width < scaleWidth)
			height = height * (scaleWidth / width)
		return parseInt(height)
	}

	scaleSvg(width) {
		const dimensions = this.getDimension(this.image.path)
		let height = this.calcHeight(
			dimensions.height,
			dimensions.width,
			width
		)
		this.image.sharp.resize(width, height)
	}

	async scalePdf(output, width) {
		this.pdf.gm.density(this.pdf.density, this.pdf.density)
		await new Promise(resolve => {
			this.gm(this.pdf.path).size((error, dimensions) => {
				let height = this.calcHeight(
					dimensions.height,
					dimensions.width,
					width
				)
				this.pdf.gm.resize(width, height, "!")
					.write(output, (error) => {
						if (error) throw error
						resolve()
					});
			})
		})
	}

	async convertPdf(output, width) {
		this.pdf.gm.density(this.pdf.density, this.pdf.density)
		this.pdf.gm.quality(this.pdf.quality)
		if (width) await this.scalePdf(output, width)
		else {
			await new Promise(resolve => {
				this.pdf.gm.write(output, (error) => {
					if (error) throw error
					resolve()
				})
			})
		}
	}

	async convertSvg(output, action, width) {
		if (action == 'svg-png') {
			this.image.sharp.png({
				compressionLevel: this.image.compression
			})
		} else if (action == 'svg-jpg') {
			this.image.sharp.flatten({
				background: '#ffffff'
			})
			this.image.sharp.jpeg({
				quality: this.quality
			})
		}
		if (width) this.scaleSvg(width)
		await this.image.sharp.toFile(output)
	}

	init(auto, source) {
		if (auto.action == 'pdf-jpg') {
			this.inputPdf(source)
			if (auto.hasOwnProperty('output_quality'))
				this.pdf.quality = auto.output_quality
		} else {
			this.inputSvg(source)
			if (auto.hasOwnProperty('output_quality'))
				this.image.quality = auto.output_quality
			if (auto.hasOwnProperty('output_compression')) {
				this.image.compression = auto.output_compression
			}
		}
	}

	async makeImage(output, action, width) {
		if (action == 'pdf-jpg') await this.convertPdf(output, width)
		else await this.convertSvg(output, action, width)
	}
}

module.exports = Pixelwork