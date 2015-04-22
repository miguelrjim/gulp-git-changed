'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var execSync = require('child_process').execSync;
var fs = require('fs');

function gitFilter(options) {
	var hashFile = options.hashFile || 'hash-file';
	var filesChanged = [];

	if (!options.src) {
		throw new gutil.PluginError('gulp-<%= pluginName %>', '`src` required');
	}

	// Read hash file and get files changed between that commit and HEAD in
	// the specified directory
	if(fs.existsSync(hashFile)) {
		var lastHash = fs.readFileSync(hashFile, {encoding: 'utf8'});
		var t=lastHash.indexOf("\n");
		if(t != -1)
			lastHash = lastHash.substring(0, t);
		var command = 'git diff --name-only ' + lastHash + '..HEAD ' + options.src;
		filesChanged = execSync(command, {encoding: 'utf8'});
		filesChanged = filesChanged.split("\n");
		filesChanged.pop();
	}

	return through.obj(
		function (file, enc, cb) {
			if (file.isNull()) {
				cb(null, file);
				return;
			}

			if (file.isStream()) {
				cb(new gutil.PluginError('gulp-<%= pluginName %>', 'Streaming not supported'));
				return;
			}

			// Add file to the stream only if its in the array of changed files
			// or there was no hash to begin with
			if (filesChanged.length == 0 || filesChanged.indexOf(file.relative) != -1)
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
