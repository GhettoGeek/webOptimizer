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
import path from 'path'
// endregion
// region exports
// / region generic
export type GetterFunction = (keyOrValue:any) => any
export type ProcedureFunction = () => void
export type PlainObject = {[key:string]:any}
export type SetterFunction = (key:any, value:any) => any
// // region browser
export type DomNode = any
export type Storage = {
    getItem(key:string):any;
    setItem(key:string, value:any):void;
    removeItem(key:string, value:any):void;
}
export type Location = {
    hash:string;
    search:string;
    pathname:string;
    port:string;
    hostname:string;
    host:string;
    protocol:string;
    origin:string;
    href:string;
    username:string;
    password:string;
    assign:Function;
    reload:Function;
    replace:Function;
    toString:() => string
}
export type Window = {
    addEventListener:(type:string, callback:Function) => void;
    document:Object;
    location:Location;
    localStorage:Storage;
    sessionStorage:Storage;
    close:() => void;
}
export type BrowserAPI = {
    debug:boolean;
    domContentLoaded:boolean;
    metaDOM:?Object;
    window:Window;
    windowLoaded:boolean;
}
// // endregion
// / endregion
// / region injection
export type NormalizedInternalInjection = {[key:string]:Array<string>}
export type InternalInjection =
    string|Array<string>|{[key:string]:string|Array<string>}
export type ExternalInjection = string|((
    context:string, request:string, callback:ProcedureFunction
) => void)|RegExp|Array<ExternalInjection>
export type Injection = {
    commonChunkIDs:Array<string>;
    dllChunkIDs:Array<string>;
    external:ExternalInjection;
    externalAliases:PlainObject;
    ignorePattern:Array<string>;
    implicitExternalExcludePattern:Array<RegExp|string>;
    implicitExternalIncludePattern:Array<RegExp|string>;
    internal:InternalInjection;
}
// / endregion
// / region configuration
export type BuildConfigurationItem = {
    extension:string;
    outputExtension:string;
    fileNamePattern:string
}
export type ExportFormat = 'var'|'this'|'commonjs'|'commonjs2'|'amd'|'umd';
export type ResolvedBuildConfigurationItem = {
    filePaths:Array<string>;
    extension:string;
    outputExtension:string;
    fileNamePattern:string
}
export type BuildConfiguration = {[key:string]:BuildConfigurationItem}
export type ResolvedBuildConfiguration = Array<ResolvedBuildConfigurationItem>
export type Paths = {
    apiDocumentation:string;
    asset:{
        cascadingStyleSheet:string;
        coffeeScript:string;
        data:string;
        font:string;
        image:string;
        javaScript:string;
        less:string;
        publicTarget:string;
        sass:string;
        scss:string;
        source:string;
        target:string;
        template:string;
    };
    context:string;
    ignore:Array<string>;
    manifest:string;
    source:string;
    target:string;
    tidyUp:Array<string>
}
export type DefaultConfiguration = {
    contextType:string;
    debug:boolean;
    dllManifestFilePaths:Array<any>;
    document:Object;
    path:{
        asset:{[key:string]:string};
        context:string;
        target:string;
        [key:string]:string
    };
    test:Object;
    testInBrowser:Object
}
export type MetaConfiguration = {
    default:DefaultConfiguration;
    debug:PlainObject;
    library:PlainObject
}
export type HTMLConfiguration = {
    template:string|String;
    filename:string
}
export type Command = {
    command:string;
    arguments:Array<string>
}
export type ResolvedConfiguration = {
    contextType:string;
    name:string;
    givenCommandLineArguments:Array<string>;
    dllManifestFilePaths:Array<string>;

    debug:boolean;
    library:boolean;

    exportFormat:{
        external:ExportFormat;
        self:ExportFormat;
    };
    favicon:{
        logo:string;
        [key:string]:any
    };
    files:{
        compose:{
            cascadingStyleSheet:string;
            javaScript:string;
        };
        additionalPaths:Array<string>;
        defaultHTML:HTMLConfiguration;
        html:Array<HTMLConfiguration>;
    };
    injection:Injection;
    inPlace:{
        cascadingStyleSheet:boolean;
        externalLibrary:{
            normal:boolean;
            shimmed:boolean;
        };
        javaScript:boolean;
        otherMaximumFileSizeLimitInByte:number
    };
    knownExtensions:Array<string>;
    libraryName:string;
    module:{
        aliases:PlainObject;
        cascadingStyleSheet:PlainObject;
        html:PlainObject;
        optimizer:{
            data:PlainObject;
            font:{
                eot:PlainObject;
                woff:PlainObject;
                ttf:PlainObject;
                svg:PlainObject
            };
            htmlMinifier:PlainObject;
            image:{
                content:PlainObject;
                file:PlainObject
            };
            uglifyJS:PlainObject
        };
        preprocessor:{
            cascadingStyleSheet:string;
            pug:PlainObject;
            less:PlainObject;
            modernJavaScript:PlainObject;
            sass:PlainObject;
            scss:PlainObject
        };
        style:PlainObject;
        skipParseRegularExpression:RegExp|Array<RegExp>;
    };
    offline:{excludes:Array<string>};
    path:Paths;
    /* eslint-disable max-len */
    targetTechnology:'web'|'webworker'|'node'|'async-node'|'node-webkit'|'electron'|'electron-renderer';
    /* eslint-enable max-len */

    assetPattern:{[key:string]:{
        excludeFilePathRegularExpression:string;
        pattern:string
    }};
    build:PlainObject;
    buildDefinition:PlainObject;
    commandLine:{
        build:Command;
        document:Command;
        lint:Command;
        serve:Command;
        test:Command;
        testInBrowser:Command,
        typeCheck:Command
    };
    development:{
        openBrowser:PlainObject;
        server:PlainObject;
        tool:PlainObject
    };
    hashAlgorithm:string;
    loader:{
        aliases:PlainObject;
        extensions:Array<string>;
        moduleDirectories:Array<string>;
    };

    document:PlainObject;

    test:PlainObject;

    testInBrowser:{injection:Injection}
}
// / endregion
// / region specific callbacks
export type EvaluationFunction = (
    self:?PlainObject, webOptimizerPath:string, currentPath:string,
    path:typeof path
) => any
export type TraverseFilesCallbackFunction = (
    filePath:string, stat:Object
) => ?boolean
export type PromiseCallbackFunction = (reason:any) => ?Promise<any>
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion