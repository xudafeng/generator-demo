'use strict';

var fs = require('fs');
var path = require('path');
var dirutil = require('dirutil');
var exec = require('child_process').exec;
var render = require('microtemplate').render;

//global data

var data = {};
//get time
var time = data.time = new Date();
data.year = time.getFullYear();

//get user path
var cwd = process.cwd();

/**
 * get arguments
 * first is name
 * second is extra option
 */
var args = process.argv.slice(2);
var name = data.name = args[0];

//get current dirname
var dir = path.dirname(__dirname);

//get template
var template = path.join(dir, 'template');

//get current path
var currentPath = path.join(cwd, name);

//exec
if (name) {

  //detect path
  if (dirutil.exists(currentPath)) {
    console.error('Error : this project maybe existed,please checkout it.')
    process.exit();
  }

  var shell = exec('cp -rf ' + template + ' ' + currentPath, function(error) {
    if (error) {
      throw error;
    }
    dirutil.traversal(currentPath, function(error, result) {
      if (error) throw error;
      result.forEach(function(i) {
        var basename = path.basename(i);
        var dirname = path.dirname(i);
        var extname = path.extname(i);

        if (extname === '.png') return;
        var tpl = fs.readFileSync(i, 'utf8');
        var content = render(tpl, data);
        basename = render(basename, data);
        var p = path.join(dirname, basename);
        fs.writeFileSync(p, content);

        if (i !== p || basename[0] === '.') {
          fs.unlinkSync(i);
        }
      });
    });
  });

  shell.on('exit', function() {
    console.log('genetate success!\n');
    console.log('your demo\'s path : '+currentPath);
  });
} else {
  console.error('Error : input your demo\'s name.');
  process.exit();
}

