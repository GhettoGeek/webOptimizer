#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons naming
    3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import babel from 'babel-core'
import babiliPreset from 'babel-preset-babili'
import Tools from 'clientnode'
import * as ejs from 'ejs'
import * as fileSystem from 'fs'
import * as loaderUtils from 'loader-utils'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import configuration from './configurator.compiled'
import Helper from './helper.compiled'
// endregion
// region types
type TemplateFunction = (locals:Object) => string
type CompileFunction = (template:string, options:Object) => TemplateFunction
// endregion
module.exports = function(source:string):string {
    if ('cachable' in this && this.cacheable)
        this.cacheable()
    const query:Object = Tools.convertSubstringInPlainObject(
        Tools.extendObject(true, {
            context: './',
            extensions: {
                file: {
                    external: ['.js'],
                    internal: [
                        '.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico',
                        '.html', '.json', '.eot', '.ttf', '.woff'
                    ]
                }, module: []
            },
            module: {
                aliases: {},
                replacements: {}
            },
            compileSteps: 2
        }, this.options || {}, 'query' in this ? loaderUtils.getOptions(
            this
        ) || {} : {}),
        /#%%%#/g, '!')
    const compile:CompileFunction = (
        template:string, options:Object = query.compiler,
        compileSteps:number = 2
    ):TemplateFunction => (locals:Object = {}):string => {
        options = Tools.extendObject(true, {filename: template}, options)
        const require:Function = (
            request:string, nestedLocals:Object = {}
        ):string => {
            const template:string = request.replace(/^(.+)\?[^?]+$/, '$1')
            const queryMatch:?Array<string> = request.match(
                /^[^?]+\?(.+)$/, '$1')
            if (queryMatch) {
                const evaluationFunction = (
                    request:string, template:string, source:string,
                    compile:CompileFunction, locals:Object
                // IgnoreTypeCheck
                ):Object => new Function(
                    'request', 'template', 'source', 'compile', 'locals',
                    `return ${queryMatch[1]}`
                )(request, template, source, compile, locals)
                nestedLocals = Tools.extendObject(
                    true, nestedLocals, evaluationFunction(
                        request, template, source, compile, locals))
            }
            let nestedOptions:Object = Tools.copyLimitedRecursively(options)
            delete nestedOptions.client
            nestedOptions = Tools.extendObject(
                true, {encoding: 'utf-8'}, nestedOptions,
                nestedLocals.options || {})
            if (nestedOptions.isString)
                return compile(template, nestedOptions)(nestedLocals)
            const templateFilePath:?string =
                Helper.determineModuleFilePath(
                    template, query.module.aliases,
                    query.module.replacements, query.extensions,
                    query.context, configuration.path.source.asset.base,
                    configuration.path.ignore,
                    configuration.module.directoryNames,
                    configuration.package.main.fileNames,
                    configuration.package.main.propertyNames,
                    configuration.package.aliasPropertyNames)
            if (templateFilePath) {
                if ('query' in this)
                    this.addDependency(templateFilePath)
                /*
                    NOTE: If there aren't any locals options or variables and
                    file doesn't seem to be an ejs template we simply load
                    included file content.
                */
                if (queryMatch || templateFilePath.endsWith('.ejs'))
                    return compile(templateFilePath, nestedOptions)(
                        nestedLocals)
                // IgnoreTypeCheck
                return fileSystem.readFileSync(templateFilePath, nestedOptions)
            }
            throw new Error(
                `Given template file "${template}" couldn't be resolved.`)
        }
        let remainingSteps:number = compileSteps
        let result:TemplateFunction|string = template
        let isString:boolean = options.isString
        delete options.isString
        while (remainingSteps > 0) {
            if (typeof result === 'string') {
                const filePath:?string =
                    isString && options.filename && options.filename || result
                if (filePath && path.extname(filePath) === '.js')
                    result = eval('require')(filePath)
                else if (isString)
                    result = ejs.compile(result, options)
                else {
                    let encoding:string = 'utf-8'
                    if ('encoding' in options)
                        encoding = options.encoding
                    result = ejs.compile(fileSystem.readFileSync(
                        result, {encoding}
                    ), options)
                }
            } else
                result = result(Tools.extendObject(true, {
                    configuration, Helper, include: require, require, Tools
                }, locals))
            remainingSteps -= 1
        }
        if (Boolean(compileSteps % 2)) {
            result = `module.exports = ${result.toString()};`
            return options.debug ? result : babel.transform(result, {
                presets: [[babiliPreset, {}]],
                sourceMaps: false,
                babelrc: false,
                shouldPrintComment():false {
                    return false
                }
            })
        }
        // IgnoreTypeCheck
        return result
    }
    return compile(source, {
        client: Boolean(query.compileSteps % 2),
        compileDebug: this.debug || false,
        debug: this.debug || false,
        filename: 'query' in this ? loaderUtils.getRemainingRequest(
            this
        ).replace(/^!/, '') : null,
        isString: true
    }, query.compileSteps)(query.locals || {})
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
