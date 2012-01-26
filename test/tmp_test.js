#! /usr/bin/env node
var util = require('util'),
	exec = require('child_process').exec,
	child;

var t = Date.parse(new Date());
var pathName = '/tmp/espresso_test_' + t;
var testAppPath = pathName + '/test';


child = exec('mkdir ' + pathName , function (error, stdout, stderr) {
	child = exec('/tmp/Espresso/bin/espresso.js init -p test -e -d ' + pathName , function (error, stdout, stderr) {
		console.log(stdout);
		console.log('generated test project');		
			child = exec('ls -al ' + testAppPath , function (error, stdout, stderr) {
				console.log(stdout);
				child = exec('/tmp/Espresso/bin/espresso.js version' , function (error, stdout, stderr) {
					console.log(stdout);
					console.log('test is running under: http://127.0.0.1:8000/test/index.html');
					child = exec('/tmp/Espresso/bin/espresso.js server --directory ' + testAppPath , function (error, stdout, stderr) {
						console.log(stdout);
					});
				});
			});	
 	});
 });