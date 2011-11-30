/*jshint node:true, globalstrict:true,  sub:true */

"use strict";

/**
 * roughly based on code from: https://github.com/brianc/node-auto-deploy/blob/master/serve.js
 */

var log = require('nlogger').logger(module),
    command = 'git pull production master && npm install',
    deployPath = '/var/www/mydvds.com.au/app',
    options = {
        cwd: deployPath
    };


//execute a git pull within the deployPath
//and then execute an npm install
//this assumes the deploye folder has a `production` branch


exec(command, options, function(error, stdout, stderr) {
    if (error) {
        return log.error(command, {
            error: error,
            stdout: stdout,
            stderr: stderr
        });
    }

    log.debug(command, {
        stdout: stdout,
        stderr: stderr
    });

    //restart upstart process with the same name
    var cmd = 'initctl restart ' + repo;
    log.info('restarting upstart process', cmd);

    exec(cmd, function(err, stdout, stderr) {
        log.debug('restarted', {
            error: err,
            stdout: stdout,
            stderr: stderr
        });
    });

});