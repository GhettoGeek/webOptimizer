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
import * as fileSystem from 'fs'
import * as dom from 'jsdom'
import path from 'path'

import postcssImport from 'postcss-import'
import postcssCSSnext from 'postcss-cssnext'
import postcssFontPath from 'postcss-fontpath'
import {sync as removeDirectoryRecursivelySync} from 'rimraf'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import webpack from 'webpack'
const plugins = require('webpack-load-plugins')()
import {RawSource as WebpackRawSource} from 'webpack-sources'

plugins.HTML = plugins.html
plugins.ExtractText = plugins.extractText
plugins.AddAssetHTMLPlugin = require('add-asset-html-webpack-plugin')
plugins.OpenBrowser = plugins.openBrowser
plugins.Favicon = require('favicons-webpack-plugin')
plugins.Imagemin = require('imagemin-webpack-plugin').default
plugins.Offline = require('offline-plugin')

import type {
    DomNode, HTMLConfiguration, Injection, NormalizedInternalInjection,
    ProcedureFunction, PromiseCallbackFunction, Window
} from './type'
import configuration from './configurator.compiled'
import Helper from './helper.compiled'

// / region monkey patches
// Monkey-Patch html loader to retrieve html loader options since the
// "webpack-html-plugin" doesn't preserve the original loader interface.
import htmlLoaderModuleBackup from 'html-loader'
require.cache[require.resolve('html-loader')].exports = function():any {
    Helper.extendObject(true, this.options, module, this.options)
    return htmlLoaderModuleBackup.apply(this, arguments)
}
// Monkey-Patch loader-utils to define which url is a local request.
import loaderUtilsModuleBackup from 'loader-utils'
const loaderUtilsIsUrlRequestBackup:(url:string) => boolean =
    loaderUtilsModuleBackup.isUrlRequest
require.cache[require.resolve('loader-utils')].exports.isUrlRequest = function(
    url:string
):boolean {
    if (url.match(/^[a-z]+:.+/))
        return false
    return loaderUtilsIsUrlRequestBackup.apply(
        loaderUtilsModuleBackup, arguments)
}
// / endregion
// endregion
// region initialisation
let libraryName:string = configuration.exportFormat.self === 'var' ?
    Helper.convertToValidVariableName(configuration.name) : configuration.name
if ('libraryName' in configuration && configuration.libraryName)
    libraryName = configuration.libraryName
// // region plugins
const pluginInstances:Array<Object> = [
    new webpack.optimize.OccurrenceOrderPlugin(true)]
// /// region define modules to ignore
for (const ignorePattern:string of configuration.injection.ignorePattern)
    pluginInstances.push(new webpack.IgnorePlugin(new RegExp(ignorePattern)))
// /// endregion
// /// region generate html file
let htmlAvailable:boolean = false
if (configuration.givenCommandLineArguments[2] !== 'buildDLL')
    for (let htmlConfiguration:HTMLConfiguration of configuration.files.html)
        if (Helper.isFileSync(htmlConfiguration.template.substring(
            htmlConfiguration.template.lastIndexOf('!') + 1
        ))) {
            if (
                htmlConfiguration.template ===
                configuration.files.defaultHTML.template
            )
                htmlConfiguration.template =
                    htmlConfiguration.template.substring(
                        htmlConfiguration.template.lastIndexOf('!') + 1)
            pluginInstances.push(new plugins.HTML(htmlConfiguration))
            htmlAvailable = true
        }
// /// endregion
// /// region generate favicons
if (htmlAvailable && configuration.favicon && Helper.isFileSync(
    configuration.favicon.logo
))
    pluginInstances.push(new plugins.Favicon(configuration.favicon))
// /// endregion
// /// region provide offline functionality
if (htmlAvailable && configuration.offline) {
    if (!['serve', 'testInBrowser'].includes(
        configuration.givenCommandLineArguments[2]
    )) {
        if (configuration.inPlace.cascadingStyleSheet)
            configuration.offline.excludes.push(
                `${configuration.path.asset.cascadingStyleSheet}*.css?` +
                `${configuration.hashAlgorithm}=*`)
        if (configuration.inPlace.javaScript)
            configuration.offline.excludes.push(
                `${configuration.path.asset.javaScript}*.js?` +
                `${configuration.hashAlgorithm}=*`)
    }
    pluginInstances.push(new plugins.Offline(configuration.offline))
}
// /// endregion
// /// region opens browser automatically
if (configuration.development.openBrowser && (htmlAvailable && [
    'serve', 'testInBrowser'
].includes(configuration.givenCommandLineArguments[2])))
    pluginInstances.push(new plugins.OpenBrowser(
        configuration.development.openBrowser))
// /// endregion
// /// region provide build environment
pluginInstances.push(new webpack.DefinePlugin(configuration.buildDefinition))
// /// endregion
// /// region modules/assets
const moduleLocations:{[key:string]:Array<string>} =
    Helper.determineModuleLocations(
        configuration.injection.internal, configuration.module.aliases,
        configuration.knownExtensions, configuration.path.context,
        configuration.path.ignore)
// //// region perform javaScript minification/optimisation
if (configuration.module.optimizer.uglifyJS)
    pluginInstances.push(new webpack.optimize.UglifyJsPlugin(
        configuration.module.optimizer.uglifyJS))
// //// endregion
// //// region apply module pattern
pluginInstances.push({apply: (compiler:Object):void => {
    compiler.plugin('emit', (
        compilation:Object, callback:ProcedureFunction
    ):void => {
        for (const request:string in compilation.assets)
            if (compilation.assets.hasOwnProperty(request)) {
                const filePath:string = request.replace(/\?[^?]+$/, '')
                const type:?string = Helper.determineAssetType(
                    filePath, configuration.build, configuration.path)
                if (type && configuration.assetPattern[type] && !(new RegExp(
                    configuration.assetPattern[type]
                        .excludeFilePathRegularExpression
                )).test(filePath)) {
                    const source:?string = compilation.assets[request].source()
                    if (typeof source === 'string')
                        compilation.assets[request] = new WebpackRawSource(
                            configuration.assetPattern[type].pattern.replace(
                                /\{1\}/g, source.replace(/\$/g, '$$$')))
                }
            }
        callback()
    })
}})
// //// endregion
// //// region in-place configured assets in the main html file
if (htmlAvailable && !['serve', 'testInBrowser'].includes(
    configuration.givenCommandLineArguments[2]
))
    pluginInstances.push({apply: (compiler:Object):void => {
        compiler.plugin('emit', (
            compilation:Object, callback:ProcedureFunction
        ):void => {
            if (configuration.files.html[0].filename in compilation.assets && (
                configuration.inPlace.cascadingStyleSheet ||
                configuration.inPlace.javaScript
            ))
                dom.env(compilation.assets[configuration.files.html[
                    0
                ].filename].source(), (error:?Error, window:Object):void => {
                    if (configuration.inPlace.cascadingStyleSheet) {
                        const urlPrefix:string = configuration.files.compose
                            .cascadingStyleSheet.replace(
                                '[contenthash]', '')
                        const domNode:DomNode = window.document.querySelector(
                            `link[href^="${urlPrefix}"]`)
                        if (domNode) {
                            let asset:string
                            for (asset in compilation.assets)
                                if (asset.startsWith(urlPrefix))
                                    break
                            const inPlaceDomNode:DomNode =
                                window.document.createElement('style')
                            inPlaceDomNode.textContent =
                                compilation.assets[asset].source()
                            domNode.parentNode.insertBefore(
                                inPlaceDomNode, domNode)
                            domNode.parentNode.removeChild(domNode)
                            /*
                                NOTE: This doesn't prevent webpack from
                                creating this file if present in another chunk
                                so removing it (and a potential source map
                                file) later in the "done" hook.
                            */
                            delete compilation.assets[asset]
                        } else
                            console.warn(
                                'No referenced cascading style sheet file in' +
                                ' resulting markup found with ' +
                                `selector: link[href^="${urlPrefix}"]`)
                    }
                    if (configuration.inPlace.javaScript) {
                        const urlPrefix:string =
                            configuration.files.compose.javaScript.replace(
                                '[hash]', '')
                        const domNode:DomNode = window.document.querySelector(
                            `script[src^="${urlPrefix}"]`)
                        if (domNode) {
                            let asset:string
                            for (asset in compilation.assets)
                                if (asset.startsWith(urlPrefix))
                                    break
                            domNode.textContent = compilation.assets[
                                asset
                            ].source()
                            domNode.removeAttribute('src')
                            /*
                                NOTE: This doesn't prevent webpack from
                                creating this file if present in another chunk
                                so removing it (and a potential source map
                                file) later in the "done" hook.
                            */
                            delete compilation.assets[asset]
                        } else
                            console.warn(
                                'No referenced javaScript file in resulting ' +
                                'markup found with selector: ' +
                                `script[src^="${urlPrefix}"]`)
                    }
                    compilation.assets[configuration.files.html[
                        0
                    ].filename] = new WebpackRawSource(
                        compilation.assets[configuration.files.html[
                            0
                        ].filename].source().replace(
                            /^(\s*<!doctype[^>]+?>\s*)[\s\S]*$/i, '$1'
                        ) + window.document.documentElement.outerHTML)
                    callback()
                })
            else
                callback()
        })
        compiler.plugin('after-emit', (
            compilation:Object, callback:ProcedureFunction
        ):void => {
            if (configuration.files.html[0].filename in compilation.assets) {
                if (configuration.inPlace.cascadingStyleSheet)
                    removeDirectoryRecursivelySync(path.join(
                        configuration.path.asset.target,
                        configuration.path.asset.cascadingStyleSheet
                    ), {glob: false})
                if (configuration.inPlace.javaScript) {
                    const assetFilePath = path.join(
                        configuration.path.asset.target,
                        configuration.files.compose.javaScript.replace(
                            `?${configuration.hashAlgorithm}=[hash]`, ''))
                    for (const filePath:string of [
                        assetFilePath, `${assetFilePath}.map`
                    ])
                        if (Helper.isFileSync(filePath))
                            fileSystem.unlinkSync(filePath)
                    const javaScriptPath:string = path.join(
                        configuration.path.asset.target,
                        configuration.path.asset.javaScript)
                    if (fileSystem.readdirSync(javaScriptPath).length === 0)
                        fileSystem.rmdirSync(javaScriptPath)
                }
            }
            callback()
        })
    }})
// //// endregion
const injection:Injection = Helper.resolveInjection(
    configuration.injection, Helper.resolveBuildConfigurationFilePaths(
        configuration.build, configuration.path.asset.source,
        configuration.path.context, configuration.path.ignore
    ), configuration.testInBrowser.injection.internal,
    configuration.module.aliases, configuration.knownExtensions,
    configuration.path.context, configuration.path.ignore)
const normalizedInternalInjection:NormalizedInternalInjection =
    Helper.normalizeInternalInjection(injection.internal)
// //// region remove chunks if a corresponding dll package exists
if (configuration.givenCommandLineArguments[2] !== 'buildDLL')
    for (const chunkID:string in normalizedInternalInjection)
        if (
            normalizedInternalInjection.hasOwnProperty(chunkID) &&
            configuration.dllManifestFilePaths.includes(
                `${configuration.path.target}${chunkID}.dll-manifest.json`)
        ) {
            delete normalizedInternalInjection[chunkID]
            // TODO replace all placeholder like "[id]", "[ext]", "[hash]" and
            // everywhere else
            const filePath:string =
                configuration.files.compose.javaScript.replace(
                    /^(.+)(?:\?[^?]*)$/, '$1'
                ).replace(/\[name\]/g, chunkID)
            pluginInstances.push(new plugins.AddAssetHTMLPlugin({
                filepath: filePath,
                hash: true,
                includeSourcemap: Helper.isFileSync(`${filePath}.map`)
            }))
            pluginInstances.push(new webpack.DllReferencePlugin({
                context: configuration.path.context, manifest: require(
                    `${configuration.path.target}${chunkID}.dll-manifest.json`)
            }))
        }
// //// endregion
// //// region generate common chunks
if (configuration.givenCommandLineArguments[2] !== 'buildDLL')
    for (const chunkID:string of configuration.injection.commonChunkIDs)
        if (normalizedInternalInjection.hasOwnProperty(chunkID))
            pluginInstances.push(new webpack.optimize.CommonsChunkPlugin({
                async: false,
                children: false,
                filename: configuration.files.compose.javaScript,
                minChunks: Infinity,
                name: chunkID,
                minSize: 0
            }))
// //// endregion
let javaScriptNeeded:boolean = configuration.debug && [
    'serve', 'testInBrowser'
].includes(configuration.givenCommandLineArguments[2])
if (!javaScriptNeeded)
    for (const chunkName:string in normalizedInternalInjection)
        if (normalizedInternalInjection.hasOwnProperty(chunkName))
            for (const moduleID:string of normalizedInternalInjection[
                chunkName
            ]) {
                const type:?string = Helper.determineAssetType(
                    Helper.determineModuleFilePath(
                        moduleID, configuration.module.aliases,
                        configuration.knownExtensions,
                        configuration.path.context),
                    configuration.build, configuration.path)
                if (type && configuration.build[type] && configuration.build[
                    type
                ].outputExtension === 'js') {
                    javaScriptNeeded = true
                    break
                }
            }
// //// region mark empty javaScript modules as dummy
if (!javaScriptNeeded)
    configuration.files.compose.javaScript = path.join(
        configuration.path.asset.javaScript, '.__dummy__.compiled.js')
// //// endregion
// //// region extract cascading style sheets
pluginInstances.push(new plugins.ExtractText(
    configuration.files.compose.cascadingStyleSheet, {allChunks: true, disable:
        !configuration.files.compose.cascadingStyleSheet}))
// //// endregion
// //// region performs implicit external logic
if (injection.external === '__implicit__')
    /*
        We only want to process modules from local context in library mode,
        since a concrete project using this library should combine all assets
        (and deduplicate them) for optimal bundling results. NOTE: Only native
        javaScript and json modules will be marked as external dependency.
    */
    injection.external = (
        context:string, request:string, callback:ProcedureFunction
    ):void => {
        const filePath:string = Helper.determineModuleFilePath(
            request.substring(request.lastIndexOf('!') + 1),
            configuration.module.aliases, configuration.knownExtensions,
            context)
        if (filePath.endsWith('.js') || filePath.endsWith('.json')) {
            const originalRequest:string = request
            // NOTE: We apply alias on externals additionally.
            request = Helper.applyAliases(
                request.substring(request.lastIndexOf('!') + 1),
                configuration.module.aliases)
            const applyExternalRequest:Function = ():void => {
                if (['var', 'umd'].includes(
                    configuration.exportFormat.external
                ) &&
                originalRequest in configuration.injection.externalAliases)
                    request = configuration.injection.externalAliases[
                        originalRequest]
                if (configuration.exportFormat.external === 'var')
                    request = Helper.convertToValidVariableName(
                        request, '0-9a-zA-Z_$\\.')
                return callback(
                    null, request, configuration.exportFormat.external)
            }
            if (Helper.isAnyMatching(
                request, configuration.injection.implicitExternalIncludePattern
            ))
                return applyExternalRequest()
            if (Helper.isAnyMatching(
                request, configuration.injection.implicitExternalExcludePattern
            ))
                return callback()
            for (const chunkName:string in normalizedInternalInjection)
                if (normalizedInternalInjection.hasOwnProperty(chunkName))
                    for (
                        const moduleID:string of
                        normalizedInternalInjection[chunkName]
                    )
                        if (Helper.determineModuleFilePath(
                            moduleID, configuration.module.aliases,
                            configuration.knownExtensions, context
                        ) === filePath)
                            return callback()
            /*
                NOTE: We mark dependencies as external if they does not contain
                a loader in their request and aren't part of the current node
                package.
            */
            if (!configuration.inPlace.externalLibrary.normal && !(
                configuration.inPlace.externalLibrary.shimmed &&
                originalRequest.includes('!')
            ) && (!path.resolve(filePath).startsWith(
                configuration.path.context
            ) || Helper.isFilePathInLocation(
                filePath, configuration.path.ignore
            )))
                return applyExternalRequest()
        }
        return callback()
    }
// //// endregion
// //// region build dll packages
if (configuration.givenCommandLineArguments[2] === 'buildDLL') {
    let dllChunkIDExists:boolean = false
    for (const chunkID:string in normalizedInternalInjection)
        if (normalizedInternalInjection.hasOwnProperty(chunkID))
            if (configuration.injection.dllChunkIDs.includes(chunkID))
                dllChunkIDExists = true
            else
                delete normalizedInternalInjection[chunkID]
    if (dllChunkIDExists) {
        libraryName = '[name]DLLPackage'
        pluginInstances.push(new webpack.DllPlugin({
            path: `${configuration.path.target}[name].dll-manifest.json`,
            name: libraryName
        }))
    } else
        console.warn('No dll chunk id found.')
}
// //// endregion
// /// endregion
// /// region apply final dom/javaScript modifications/fixes
pluginInstances.push({apply: (compiler:Object):void => {
    compiler.plugin('emit', (
        compilation:Object, callback:ProcedureFunction
    ):void => {
        const promises:Array<Promise<string>> = []
        /*
            NOTE: Removing symbols after a "&" in hash string is necessary to
            match the generated request strings in offline plugin.
        */
        for (const htmlConfiguration of configuration.files.html)
            if (htmlConfiguration.filename in compilation.assets)
                promises.push(new Promise((
                    resolve:PromiseCallbackFunction,
                    reject:PromiseCallbackFunction
                ):Window => dom.env(compilation.assets[
                    htmlConfiguration.filename
                ].source(), (error:?Error, window:Window):?Promise<string> => {
                    if (error)
                        return reject(error)
                    const linkables:{[key:string]:string} = {
                        script: 'src', link: 'href'}
                    for (const tagName:string in linkables)
                        if (linkables.hasOwnProperty(tagName))
                            for (
                                const domNode:DomNode of
                                window.document.querySelectorAll(
                                    `${tagName}[${linkables[tagName]}*="?` +
                                    `${configuration.hashAlgorithm}="]`)
                            )
                                domNode.setAttribute(
                                    linkables[tagName],
                                    domNode.getAttribute(
                                        linkables[tagName]
                                    ).replace(new RegExp(
                                        `(\\?${configuration.hashAlgorithm}=` +
                                        '[^&]+).*$'
                                    ), '$1'))
                    compilation.assets[htmlConfiguration.filename] =
                        new WebpackRawSource(compilation.assets[
                            htmlConfiguration.filename
                        ].source().replace(
                            /^(\s*<!doctype[^>]+?>\s*)[\s\S]*$/i, '$1'
                        ) + window.document.documentElement.outerHTML)
                    return resolve(
                        compilation.assets[htmlConfiguration.filename])
                })))
        if (!configuration.exportFormat.external.startsWith('umd')) {
            Promise.all(promises).then(():void => callback())
            return
        }
        const bundleName:string = (
            typeof libraryName === 'string'
        ) ? libraryName : libraryName[0]
        /*
            NOTE: The umd module export doesn't handle cases where the package
            name doesn't match exported library name. This post processing
            fixes this issue.
        */
        for (const assetRequest:string in compilation.assets)
            if (assetRequest.replace(/([^?]+)\?.*$/, '$1').endsWith(
                configuration.build.javaScript.outputExtension
            )) {
                let source:string = compilation.assets[assetRequest].source()
                if (typeof source === 'string') {
                    for (
                        const replacement:string in
                        configuration.injection.externalAliases
                    )
                        if (configuration.injection.externalAliases
                            .hasOwnProperty(replacement)
                        )
                            source = source.replace(new RegExp(
                                '(require\\()"' +
                                Helper.convertToValidRegularExpressionString(
                                    configuration.injection.externalAliases[
                                        replacement]
                                ) + '"(\\))', 'g'
                            ), `$1'${replacement}'$2`).replace(new RegExp(
                                '(define\\("' +
                                Helper.convertToValidRegularExpressionString(
                                    bundleName
                                ) + '", \\[.*)"' +
                                Helper.convertToValidRegularExpressionString(
                                    configuration.injection.externalAliases[
                                        replacement]
                                ) + '"(.*\\], factory\\);)'
                            ), `$1'${replacement}'$2`)
                    source = source.replace(new RegExp(
                        '(root\\[)"' +
                        Helper.convertToValidRegularExpressionString(
                            bundleName
                        ) + '"(\\] = )'
                    ), `$1'${Helper.convertToValidVariableName(bundleName)}'$2`
                    )
                    compilation.assets[assetRequest] = new WebpackRawSource(
                        source)
                }
            }
        Promise.all(promises).then(():void => callback())
    })
}})
// /// endregion
// /// region add automatic image compression
// NOTE: This plugin should be loaded at last to ensure that all emitted images
// ran through.
pluginInstances.push(new plugins.Imagemin(
    configuration.module.optimizer.image.content))
// /// endregion
// // endregion
// / region loader
let imageLoader:string = 'url?' + Helper.convertCircularObjectToJSON(
    configuration.module.optimizer.image.file)
const loader:{
    preprocessor:{
        cascadingStyleSheet:string;
        less:string;
        sass:string;
        scss:string;
        javaScript:string;
        coffee:string;
        pug:string;
        literateCoffee:string
    };
    html:string;
    cascadingStyleSheet:string;
    style:string;
    postprocessor:{
        image:string;
        font:{
            eot:string;
            woff:string;
            ttf:string;
            svg:string
        };
        data:string
    }
} = {
    preprocessor: {
        cascadingStyleSheet: 'postcss' +
            configuration.module.preprocessor.cascadingStyleSheet,
        javaScript: 'babel?' + Helper.convertCircularObjectToJSON(
            configuration.module.preprocessor.modernJavaScript),
        pug: 'pug?' + Helper.convertCircularObjectToJSON(
            configuration.module.preprocessor.pug),
        // TODO deprecated
        coffee: 'coffee',
        literateCoffee: 'coffee?literate',
        less: 'less?' + Helper.convertCircularObjectToJSON(
            configuration.module.preprocessor.less),
        sass: 'sass?' + Helper.convertCircularObjectToJSON(
            configuration.module.preprocessor.sass),
        scss: 'sass?' + Helper.convertCircularObjectToJSON(
            configuration.module.preprocessor.scss)
        //
    },
    html: 'html?' + Helper.convertCircularObjectToJSON(
        configuration.module.html),
    cascadingStyleSheet: 'css?' + Helper.convertCircularObjectToJSON(
        configuration.module.cascadingStyleSheet),
    style: 'style?' + Helper.convertCircularObjectToJSON(
        configuration.module.style),
    postprocessor: {
        image: imageLoader,
        font: {
            eot: 'url?' + Helper.convertCircularObjectToJSON(
                configuration.module.optimizer.font.eot),
            woff: 'url?' + Helper.convertCircularObjectToJSON(
                configuration.module.optimizer.font.woff),
            ttf: 'url?' + Helper.convertCircularObjectToJSON(
                configuration.module.optimizer.font.ttf),
            svg: 'url?' + Helper.convertCircularObjectToJSON(
                configuration.module.optimizer.font.svg)
        },
        data: 'url?' + Helper.convertCircularObjectToJSON(
            configuration.module.optimizer.data)
    }
}
// / endregion
// endregion
// region configuration
export default {
    context: configuration.path.context,
    debug: configuration.debug,
    devtool: configuration.development.tool,
    devServer: configuration.development.server,
    // region input
    entry: normalizedInternalInjection, externals: injection.external,
    resolveLoader: {
        alias: configuration.loader.aliases,
        extensions: configuration.loader.extensions,
        modulesDirectories: configuration.loader.moduleDirectories
    },
    resolve: {
        alias: configuration.module.aliases,
        extensions: configuration.knownExtensions,
        root: [(configuration.path.asset.source:string)]
    },
    // endregion
    // region output
    output: {
        filename: path.relative(
            configuration.path.asset.target,
            configuration.files.compose.javaScript),
        hashFunction: configuration.hashAlgorithm,
        library: libraryName,
        libraryTarget: (
            configuration.givenCommandLineArguments[2] === 'buildDLL'
        ) ? 'var' : configuration.exportFormat.self,
        path: configuration.path.asset.target,
        publicPath: configuration.path.asset.publicTarget,
        pathinfo: configuration.debug,
        umdNamedDefine: true
    },
    target: configuration.targetTechnology,
    // endregion
    module: {
        noParse: configuration.module.skipParseRegularExpression,
        preLoaders: [
            // Convert to native web types.
            // region script
            {
                test: /\.js$/,
                loader: loader.preprocessor.javaScript,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.javaScript
                )].concat(moduleLocations.directoryPaths),
                exclude: (filePath:string):boolean =>
                    Helper.isFilePathInLocation(filePath.replace(
                        /^(.+)(?:\?[^?]*)$/, '$1'
                    ), configuration.path.ignore)
            }, {
                test: /\.coffee$/,
                loader: loader.preprocessor.coffee,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript
                )].concat(moduleLocations.directoryPaths)
            }, {
                test: /\.(?:coffee\.md|litcoffee)$/,
                loader: loader.preprocessor.literateCoffee,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript
                )].concat(moduleLocations.directoryPaths)
            },
            // endregion
            // region html (templates)
            // NOTE: This ensures that will be used as a special loader alias.
            {
                test: new RegExp(Helper.convertToValidRegularExpressionString(
                    configuration.files.defaultHTML.template.substring(
                        configuration.files.defaultHTML.template.lastIndexOf(
                            '!'
                        ) + 1))),
                loader: configuration.files.defaultHTML.template.substring(
                    0, configuration.files.defaultHTML.template.lastIndexOf(
                        '!'))
            },
            {
                test: /\.pug$/,
                loader:
                    `file?name=${configuration.path.asset.template}` +
                    `[name].html?${configuration.hashAlgorithm}=[hash]!` +
                    `extract!${loader.html}!${loader.preprocessor.pug}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.template),
                exclude: configuration.files.html.concat(
                    configuration.files.defaultHTML
                ).map((
                    htmlConfiguration:HTMLConfiguration
                ):string => htmlConfiguration.template.substring(
                    htmlConfiguration.template.lastIndexOf('!') + 1))
            }
            // endregion
        ],
        loaders: [
            // Loads dependencies.
            // region style
            // TODO deprecated
            {
                test: /\.less$/,
                loader: plugins.ExtractText.extract(
                    loader.style,
                    `${loader.cascadingStyleSheet}!${loader.preprocessor.less}`
                )
            }, {
                test: /\.sass$/,
                loader: plugins.ExtractText.extract(
                    loader.style,
                    `${loader.cascadingStyleSheet}!${loader.preprocessor.sass}`
                )
            }, {
                test: /\.scss$/,
                loader: plugins.ExtractText.extract(
                    loader.style,
                    `${loader.cascadingStyleSheet}!${loader.preprocessor.scss}`
                )
            },
            //
            {
                test: /\.css$/,
                loader: plugins.ExtractText.extract(
                    loader.style,
                    `${loader.cascadingStyleSheet}!` +
                    loader.preprocessor.cascadingStyleSheet),
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.cascadingStyleSheet
                )].concat(moduleLocations.directoryPaths),
                exclude: (filePath:string):boolean =>
                    Helper.isFilePathInLocation(filePath.replace(
                        /^(.+)(?:\?[^?]*)$/, '$1'
                    ), configuration.path.ignore)
            },
            // endregion
            // region html (templates)
            {
                test: /\.html$/,
                loader:
                    `file?name=${configuration.path.asset.template}` +
                    `[name].[ext]?${configuration.hashAlgorithm}=[hash]!` +
                    `extract!${loader.html}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.template),
                exclude: configuration.files.html.map((
                    htmlConfiguration:HTMLConfiguration
                ):string => htmlConfiguration.template.substring(
                    htmlConfiguration.template.lastIndexOf('!') + 1))
            }
            // endregion
        ],
        postLoaders: [
            // Optimize loaded assets.
            // region font
            {
                test: /\.eot(?:\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.eot
            }, {test: /\.woff2?$/, loader: loader.postprocessor.font.woff}, {
                test: /\.ttf(?:\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.ttf
            }, {
                test: /\.svg(?:\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.svg
            },
            // endregion
            // region image
            {
                test: /\.(?:png|jpg|ico|gif)$/,
                loader: loader.postprocessor.image
            },
            // endregion
            // region data
            {
                test: /.+/,
                loader: loader.postprocessor.data,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.data),
                exclude: (filePath:string):boolean =>
                    configuration.knownExtensions.includes(
                        path.extname(filePath.replace(
                            /^(.+)(?:\?[^?]*)$/, '$1')))
            }
            // endregion
        ]
    },
    postcss: ():Array<Object> => [
        postcssImport({addDependencyTo: webpack}),
        postcssFontPath({checkPath: true}),
        postcssCSSnext({browsers: '> 0%'})
    ],
    html: configuration.module.optimizer.htmlMinifier,
    // Let the "html-loader" access full html minifier processing
    // configuration.
    pug: configuration.module.preprocessor.pug,
    plugins: pluginInstances
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion