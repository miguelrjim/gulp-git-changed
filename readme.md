## Install

```
$ npm install --save-dev gulp-git-changed
```


## Usage

```js
var gulp = require('gulp');
var gitChanged = require('gulp-git-changed');

gulp.task('default', function () {
	return gulp.src('src/file.ext')
		.pipe(gitChanged({
      file: 'hash-file',
      src: 'src/'
    }))
		.pipe(gulp.dest('dist'));
});
```

## License

MIT © [Miguel Jimenez](https://github.com/miguelrjim)
