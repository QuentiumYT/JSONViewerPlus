var fs = require('fs-extra');
var path = require('path');
var BuildPaths = require('../build-paths');

function copyTheme(darkness, list) {
  var paths = [];
  list.forEach(function (theme) {
    var themeCSSPath = 'themes/' + darkness + '/' + theme + '.css';
    var themePath = path.join(BuildPaths.EXTENSION, 'assets/' + theme);

    if (fs.existsSync(themePath + '.js') && fs.existsSync(themePath + '.css')) {
      fs.removeSync(themePath + '.js');
      fs.copySync(themePath + '.css', path.join(BuildPaths.EXTENSION, themeCSSPath));
      console.log('  copied: ' + themeCSSPath);
      paths.push(themeCSSPath);

    } else {
      console.error('  fail to copy: ' + (themePath + '.css'));
    }
  });

  return paths;
}

function findThemes(darkness) {
  return fs
    .readdirSync(path.join('extension', 'themes', darkness))
    .filter(function (filename) {
      return /\.js$/.test(filename);
    })
    .map(function (theme) {
      return theme.replace(/\.js$/, '');
    });
}

var lightThemes = findThemes('light');
var darkThemes = findThemes('dark');
var themes = { light: lightThemes, dark: darkThemes };

function BuildExtension() { }
BuildExtension.prototype.apply = function (compiler) {
  compiler.hooks.done.tap('done', function () {
    console.log('\n');
    console.log('-> copying files');
    fs.copySync(path.join(BuildPaths.SRC_ROOT, 'icons'), path.join(BuildPaths.EXTENSION, 'icons'));
    fs.copySync(path.join(BuildPaths.SRC_ROOT, 'pages'), path.join(BuildPaths.EXTENSION, 'pages'));

    console.log('-> copying themes');

    var lightThemes = copyTheme('light', themes.light);
    var darkThemes = copyTheme('dark', themes.dark);
    var themesCSSPaths = lightThemes.concat(darkThemes);

    var manifest = fs.readJSONSync(path.join(BuildPaths.SRC_ROOT, 'manifest.json'));
    manifest.web_accessible_resources[0].resources = manifest.web_accessible_resources[0].resources.concat(themesCSSPaths);

    console.log('-> copying manifest.json');
    fs.outputJSONSync(path.join(BuildPaths.EXTENSION, 'manifest.json'), manifest);
  });
};

module.exports = BuildExtension;
