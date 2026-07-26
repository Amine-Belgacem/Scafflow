/**
 * Handles image and PDF processing tasks such as resizing and exporting.
 * @module ImageProcessor
 */
const gm = require('gm');
const sharp = require('sharp');
const getImageDimensions = require('image-size');
const messages = require('./cli-messages.js');

class ImageProcessor {
    /**
     * Initializes the ImageProcessor instance.
     */
    constructor() {
        this.image = {
            path: null,
            sharpInstance: null,
            compression: 9,
            quality: 100
        };

        this.pdf = {
            path: null,
            gmInstance: null,
            density: 300,
            quality: 100
        };
    }

    /**
     * Sets the SVG input file for processing.
     * @param {string} source - Path to the SVG file.
     */
    setSvgInput(source) {
        this.image.path = source;
        this.image.sharpInstance = sharp(source);
    }

    /**
     * Sets the PDF input file for processing.
     * @param {string} source - Path to the PDF file.
     */
    setPdfInput(source) {
        this.pdf.path = source;
        this.pdf.gmInstance = gm(source);
    }

    /**
     * Calculates the scaled height for resizing.
     * @param {number} originalHeight
     * @param {number} originalWidth
     * @param {number} targetWidth
     * @returns {number} The scaled height.
     */
    calculateScaledHeight(originalHeight, originalWidth, targetWidth) {
        if (originalWidth > targetWidth) {
            originalHeight = originalHeight / (originalWidth / targetWidth);
        } else if (originalWidth < targetWidth) {
            originalHeight = originalHeight * (targetWidth / originalWidth);
        }
        return parseInt(originalHeight);
    }

    /**
     * Resizes the SVG image to the target width.
     * @param {number} targetWidth
     */
    resizeSvg(targetWidth) {
        const dimensions = getImageDimensions(this.image.path);
        let targetHeight = this.calculateScaledHeight(
            dimensions.height,
            dimensions.width,
            targetWidth
        );
        this.image.sharpInstance.resize(targetWidth, targetHeight);
    }

    /**
     * Resizes the PDF and writes the output image.
     * @param {string} outputPath
     * @param {number} targetWidth
     * @returns {Promise<void>}
     */
    async resizePdfAndWrite(outputPath, targetWidth) {
        this.pdf.gmInstance.density(this.pdf.density, this.pdf.density);
        await new Promise((resolve, reject) => {
            gm(this.pdf.path).size((error, dimensions) => {
                if (error || !dimensions) {
                    console.error(messages.PDF_DIMENSION_ERROR(this.pdf.path, error));
                    return resolve();
                }
                let targetHeight = this.calculateScaledHeight(
                    dimensions.height,
                    dimensions.width,
                    targetWidth
                );
                this.pdf.gmInstance.resize(targetWidth, targetHeight, '!')
                    .write(outputPath, (error) => {
                        if (error) return reject(error);
                        resolve();
                    });
            });
        });
    }

    /**
     * Exports a PDF to an image file, optionally resizing.
     * @param {string} outputPath
     * @param {number} [targetWidth]
     * @returns {Promise<void>}
     */
    async exportPdfToImage(outputPath, targetWidth) {
        this.pdf.gmInstance.density(this.pdf.density, this.pdf.density);
        this.pdf.gmInstance.quality(this.pdf.quality);

        if (targetWidth) {
            await this.resizePdfAndWrite(outputPath, targetWidth);
        } else {
            await new Promise((resolve, reject) => {
                this.pdf.gmInstance.write(outputPath, (error) => {
                    if (error) return reject(error);
                    resolve();
                });
            });
        }
    }

    /**
     * Exports an SVG to an image file (PNG or JPG), optionally resizing.
     * @param {string} outputPath
     * @param {string} action - The export action, either 'svg-png' or 'svg-jpg'.
     * @param {number} [targetWidth]
     * @returns {Promise<void>}
     */
    async exportSvgToImage(outputPath, action, targetWidth) {
        if (action === 'svg-png') {
            this.image.sharpInstance.png({
                compressionLevel: this.image.compression
            });
        } else if (action === 'svg-jpg') {
            this.image.sharpInstance.flatten({
                background: '#ffffff'
            });
            this.image.sharpInstance.jpeg({
                quality: this.image.quality
            });
        }

        if (targetWidth) this.resizeSvg(targetWidth);
        await this.image.sharpInstance.toFile(outputPath);
    }

    /**
     * Configures the processor options from the given settings object.
     * @param {Object} options - The options object.
     * @param {string} source - The source file path.
     */
    configureFromOptions(options, source) {
        if (options.action === 'pdf-jpg') {
            this.setPdfInput(source);
            if (options.hasOwnProperty('output_quality'))
                this.pdf.quality = options.output_quality;
        } else {
            this.setSvgInput(source);
            if (options.hasOwnProperty('output_quality'))
                this.image.quality = options.output_quality;
            if (options.hasOwnProperty('output_compression')) {
                this.image.compression = options.output_compression;
            }
        }
    }

    /**
     * Processes the image or PDF file and exports it to the specified format.
     * @param {string} outputPath - The output file path.
     * @param {string} action - The action to perform (e.g., 'pdf-jpg', 'svg-png').
     * @param {number} targetWidth - The target width for resizing.
     * @returns {Promise<void>}
     */
    async processImage(outputPath, action, targetWidth) {
        if (action === 'pdf-jpg') {
            await this.exportPdfToImage(outputPath, targetWidth);
        } else {
            await this.exportSvgToImage(outputPath, action, targetWidth);
        }
    }
}

/**
 * Exports the ImageProcessor class.
 */
module.exports = ImageProcessor;
