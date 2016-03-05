var fs = require('fs');

module.exports = {
	readFile : function(filePath) {
		return fs.readFileSync(filePath, 'utf8');
	}
};
