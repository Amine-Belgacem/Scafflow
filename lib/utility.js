class Utility {
	static decode (encoded, name, variable) {
		let expanded = ""
		for (let i = 0; i < encoded.length; i++) {
			if ((encoded.charAt(i) == '$') && (name != undefined)) {
				expanded += name
			} else if ((encoded.charAt(i) == '!') && (variable != undefined)) {
				expanded += variable	
			} else {
				expanded += encoded.charAt(i)
			}
		}
		return expanded	
	}

	static toPath (parent, child) {
		return (parent + '\\' + child)
	}

	static decodePath (encoded, path) {
		let expanded = ""
		for (let i = 0; i < encoded.length; i++) {
			if ((encoded.charAt(i) == '%') && (path != undefined)) {
				expanded += path
			} else {
				expanded += encoded.charAt(i)
			}
		}
		return expanded			
	}
}

module.exports =  Utility