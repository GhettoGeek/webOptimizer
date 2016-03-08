#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
module.exports = require('./package').configuration
import path from 'path'
const specificConfiguration = require('../../package').webOptimizer || {}
// endregion
// NOTE: Given node command line arguments results in "npm_config_*"
// environment variables.
var debug = module.exports.default.debug
if(typeof specificConfiguration.debug !== undefined)
    debug = specificConfiguration.debug
if(global.process.env.npm_config_production)
    debug = false
else if(global.process.env.npm_config_debug)
    debug = true
if(debug)
    module.exports = extend(true, module.exports.default, module.exports.debug)
else
    module.exports = module.exports.default
/*
    NOTE: Provides a workaround to handle a bug with changed loader
    configurations (which we need here). Simple solution would be:

    template: `html?${JSON.stringify(module.exports.html)}!jade-html?` +
        `${JSON.stringify(module.exports.jade)}!` +
        `${module.exports.sourcePath}index.jade`

    NOTE: We can't use this since placing in-place would be impossible so.
    favicon: `${module.exports.sourceAssetPath}image/favicon.ico`,
    NOTE: We can't use this since the file would have to be available before
    building.
    manifest: module.exports.jade.includeManifest
*/
module.exports.files.html[0].template = (() => {
    const string = new global.String('html?' + JSON.stringify(
        module.exports.html
    ) + `!jade-html?${JSON.stringify(module.exports.jade)}!` +
    `${module.exports.sourcePath}index.jade`)
    const nativeReplaceFunction = string.replace
    string.replace = (search, replacement) => {
        string.replace = nativeReplaceFunction
        return string
    }
    return string
})()
module.exports = extend(true, module.exports, specificConfiguration)
const resolveConfiguration = (object) => {
    for(let key in object) {
        if(key === '__execute__') {
            let value = (new global.Function(
                'self', 'webOptimizerPath', `return ${object[key]}`
            ))(module.exports, __dirname)
            if(typeof value === 'object')
                return resolveConfiguration(value)
            return value
        }
        if(typeof object[key] === 'object')
            object[key] = resolveConfiguration(object[key])
    }
    return object
}
module.exports = resolveConfiguration(module.exports)
for (let key of [
    'sourcePath', 'targetPath', 'sourceAssetPath', 'targetAssetPath'
])
    if(module.exports[key])
        module.exports[key] = path.resolve(
            __dirname, '../../', module.exports[key]
        ) + '/'
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
