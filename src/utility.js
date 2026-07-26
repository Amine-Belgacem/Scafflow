/**
 * Utility functions for string manipulation, path handling, argument parsing, and table formatting.
 * @module Utility
 */
class Utility {
    /**
     * Decodes a string by replacing special characters with provided values.
     * Throws a TypeError if 'encoded' is not a string.
     * @param {string} encoded - The encoded string.
     * @param {string} [name] - The name to substitute for '$'.
     * @param {string} [variable] - The variable to substitute for '!'.

     * @returns {string} The decoded string.
     */
    static decode(encoded, name, variable) {
        if (typeof encoded !== 'string') {
            throw new TypeError("Utility.decode: 'encoded' must be a string");
        }
        let expanded = '';
        for (let i = 0; i < encoded.length; i++) {
            if ((encoded.charAt(i) === '$') && (name !== undefined)) {
                expanded += name;
            } else if ((encoded.charAt(i) === '!') && (variable !== undefined)) {
                expanded += variable;
            } else {
                expanded += encoded.charAt(i);
            }
        }
        return expanded;
    }

    /**
     * Joins two path segments with a backslash.
     * Throws a TypeError if either argument is not a string.
     * @param {string} parent - The parent path.
     * @param {string} child - The child path.
     * @returns {string} The combined path.
     */
    static toPath(parent, child) {
        if (typeof parent !== 'string' || typeof child !== 'string') {
            throw new TypeError("Utility.toPath: both 'parent' and 'child' must be strings");
        }
        return parent + '\\' + child;
    }

    /**
     * Decodes a path string by replacing '%' with the provided path.
     * Throws a TypeError if 'encoded' is not a string or 'path' is not a string.
     * @param {string} encoded - The encoded path string.
     * @param {string} path - The path to substitute for '%'.

     * @returns {string} The decoded path string.
     */
    static decodePath(encoded, path) {
        if (typeof encoded !== 'string' || (path !== undefined && typeof path !== 'string')) {
            throw new TypeError("Utility.decodePath: 'encoded' must be a string and 'path' must be a string if provided");
        }
        let expanded = '';
        for (let i = 0; i < encoded.length; i++) {
            if ((encoded.charAt(i) === '%') && (path !== undefined)) {
                expanded += path;
            } else {
                expanded += encoded.charAt(i);
            }
        }
        return expanded;
    }

    /**
     * Capitalizes the first character of a string.
     * Throws a TypeError if 'str' is not a string.
     * @param {string} str - The string to capitalize.
     * @returns {string} The capitalized string.
     */
    static capitalizeFirst(str) {
        if (typeof str !== 'string') {
            throw new TypeError("Utility.capitalizeFirst: 'str' must be a string");
        }
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
    }

    /**
     * Retrieves the value for a given CLI flag from arguments.
     * Throws a TypeError if 'args' is not an array or 'flag' is not a string.
     * @param {string[]} args - The CLI arguments array.
     * @param {string} flag - The flag to search for.
     * @returns {string|undefined} The value of the flag if present, otherwise undefined.
     */
    static getArg(args, flag) {
        if (!Array.isArray(args) || typeof flag !== 'string') {
            throw new TypeError("Utility.getArg: 'args' must be an array and 'flag' must be a string");
        }
        const idx = args.indexOf(flag);
        if (idx !== -1 && idx + 1 < args.length) {
            return args[idx + 1];
        }
        return undefined;
    }

    /**
     * Formats a table row for display.
     * Throws a TypeError if arguments are not of expected types.
     * @param {string[]} headers - The table headers.
     * @param {Object} row - The row data.
     * @param {number[]} colWidths - The column widths.
     * @returns {string} The formatted table row.
     */
    static formatTableRow(headers, row, colWidths) {
        if (!Array.isArray(headers) || typeof row !== 'object' || !Array.isArray(colWidths)) {
            throw new TypeError("Utility.formatTableRow: 'headers' and 'colWidths' must be arrays, 'row' must be an object");
        }
        return headers.map((h, i) => String(row[h] ?? '').padEnd(colWidths[i] ?? 0)).join('   ');
    }

    /**
     * Formats the table header for display.
     * Throws a TypeError if arguments are not of expected types.
     * @param {string[]} headers - The table headers.
     * @param {number[]} colWidths - The column widths.
     * @returns {string} The formatted table header.
     */
    static formatTableHeader(headers, colWidths) {
        if (!Array.isArray(headers) || !Array.isArray(colWidths)) {
            throw new TypeError("Utility.formatTableHeader: 'headers' and 'colWidths' must be arrays");
        }
        return headers.map((h, i) => h.padEnd(colWidths[i] ?? 0)).join('   ');
    }

    /**
     * Prints a formatted table to the console.
     * Throws an error if cli-table3 is not installed or arguments are invalid.
     * @param {string[]} headers - The table headers.
     * @param {Object[]} rows - The table rows.
     */
    static printTable(headers, rows) {
        if (!Array.isArray(headers) || !Array.isArray(rows)) {
            throw new TypeError("Utility.printTable: 'headers' and 'rows' must be arrays");
        }
        let Table;
        try {
            Table = require('cli-table3');
        } catch (err) {
            throw new Error("cli-table3 is required for Utility.printTable but is not installed.");
        }
        const table = new Table({
            head: headers,
            style: { head: ['white'], border: ['grey'] },
            wordWrap: true
        });
        rows.forEach(row => {
            table.push(headers.map(h => row[h] ?? ''));
        });
        console.log(table.toString());
    }
}

/**
 * Exports the Utility class.
 */
module.exports = Utility;