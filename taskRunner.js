#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
const run = require('child_process').exec
const fileSystem = require('fs')
fileSystem.removeDirectoryRecursivelySync = require('rimraf').sync
const path = require('path')
const packageConfiguration = require('../../package.json').webOptimizer || {}
// endregion
// region configuration
const processOptions = {cwd: path.resolve(__dirname + '/../..')}
if(!packageConfiguration.targetPath)
    packageConfiguration.targetPath = 'build'
if(!packageConfiguration.commandLineArguments)
    packageConfiguration.commandLineArguments = {}
if(!packageConfiguration.commandLineArguments.webpack)
    packageConfiguration.commandLineArguments.webpack = ''
if(!packageConfiguration.commandLineArguments.webpackDevServer)
    packageConfiguration.commandLineArguments.webpackDevServer = ''
// endregion
// region controller
let childProcess = null
if(global.process.argv[2] === 'clear') {
    fileSystem.removeDirectoryRecursivelySync(
        packageConfiguration.targetPath, {glob: false})
    process.exit()
}
if(global.process.argv[2] === 'build')
    childProcess = run(
        `webpack --config ${__dirname}/webpack.config.js ` +
        packageConfiguration.commandLineArguments.webpack, processOptions, (
            error
        ) => {
            if(!error)
                fileSystem.access(
                    `${packageConfiguration.targetPath}/manifest.html`,
                    fileSystem.F_OK, (error) => {
                        if(!error)
                            fileSystem.unlink(
                                packageConfiguration.targetPath +
                                '/manifest.html')
                    })
    })
else if(global.process.argv[2] === 'server')
    childProcess = run(
        `webpack-dev-server --config ${__dirname}/webpack.config.js ` +
        packageConfiguration.commandLineArguments.webpackDevServer,
        processOptions)
else {
    console.log(
        'Give one of "clear", "build" or "server" command line argument.')
    process.exit()
}
// endregion
// region handle child process communication
childProcess.stdout.on('data', (data) => { process.stdout.write(data) })
childProcess.stderr.on('data', (data) => { process.stderr.write(data) })
childProcess.on('close', (returnCode) => {
    if(returnCode !== 0)
        console.error(`Task exited with error code ${returnCode}`)
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
