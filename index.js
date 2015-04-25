'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var execSync = require('child_process').execSync;
var fs = require('fs');

var cacheResults = {};

function gitFilter(options) {
	var hashFile = options.hashFile || 'hash-file';
	var filesChanged = [];
	var fileExists = false;

	if (!options.src) {
		throw new gutil.PluginError('gulp-git-changed', '`src` required');
	}

	// Read hash file and get files changed between that commit and HEAD in
	// the specified directory
	var t = cacheResults[options.src];
	if(t)
		filesChanged = t;
	else if(fs.existsSync(hashFile)) {
		fileExists = true;
		var lastHash = fs.readFileSync(hashFile, {encoding: 'utf8'});
		var t=lastHash.indexOf("\n");
		if(t != -1)
			lastHash = lastHash.substring(0, t);
		var command = 'git diff --name-only ' + lastHash + '..HEAD ' + options.src;
		filesChanged = execSync(command, {encoding: 'utf8'});
		filesChanged = filesChanged.split("\n");
		filesChanged.pop();
		cacheResults[options.src] = filesChanged;
	}

	return through.obj(
		function (file, enc, cb) {
			// Add file to the stream only if its in the array of changed files
			// or there was no hash to begin with
			if (!fileExists || filesChanged.indexOf(file.path.substr(process.cwd().length+1)) != -1)
				this.push(file);

			cb();
		}
	);
};

function updateHash(file) {
	// Updating hash file to match HEAD
	execSync('git rev-parse HEAD > ' + file);
}

module.exports = gitFilter;
module.exports.update = updateHash;
