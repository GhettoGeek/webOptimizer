#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
import * as jade from 'jade'
import * as loaderUtils from 'loader-utils'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
// endregion
module.exports = function(source) {
    if (this.cacheable)
        this.cacheable()
    const query = extend(true, this.options.jade || {}, loaderUtils.parseQuery(
        this.query))
    const locals = query.locals || {}
    delete query.locals
    const compile = (template, options = query) => {
        return locals => {
            options = extend(true, {
                filename: template, doctype: 'html',
                compileDebug: this.debug || false,
                cache: true
            }, options)
            let templateFunction
            if (options.isString)
                templateFunction = jade.compile(template, options)
            else
                templateFunction = jade.compileFile(template, options)
            return templateFunction(extend(true, {require: request => {
                console.log()
                console.log(request, request.replace(
                    /^.+(\?[^?]+)$/, '$1'
                ), new global.Function('return ' + (request.replace(
                    /^.+\?([^?]+)$/, '$1'))))
                console.log()
                const locals = {} // TODO global.JSON.parse(request)
                const options = locals.options || {}
                // TODO
                const result = '/home/torben/cloud/data/repository/website/node_modules/legalNotes/index.jade'
                this.addDependency(result)
                return compile(result, options)(locals)
            }}, locals))
        }
    }
    return compile(source, {
        isString: true,
        filename: loaderUtils.getRemainingRequest(this).replace(/^!/, '')
    })(locals)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
