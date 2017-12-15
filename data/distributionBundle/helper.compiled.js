#!/usr/bin/env node


// -*- coding: utf-8 -*-
'use strict';
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

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Helper = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _jsdom = require('jsdom');

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path3 = require('path');

var _path4 = _interopRequireDefault(_path3);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}

// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
var Helper = exports.Helper = function () {
    function Helper() {
        (0, _classCallCheck3.default)(this, Helper);
    }

    (0, _createClass3.default)(Helper, null, [{
        key: 'isFilePathInLocation',

        // region boolean
        /**
         * Determines whether given file path is within given list of file
         * locations.
         * @param filePath - Path to file to check.
         * @param locationsToCheck - Locations to take into account.
         * @returns Value "true" if given file path is within one of given
         * locations or "false" otherwise.
         */
        value: function isFilePathInLocation(filePath, locationsToCheck) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(locationsToCheck), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var pathToCheck = _step.value;

                    if (_path4.default.resolve(filePath).startsWith(_path4.default.resolve(pathToCheck))) return true;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return false;
        }
        // endregion
        // region string
        /**
         * In places each matching cascading style sheet or javaScript file
         * reference.
         * @param content - Markup content to process.
         * @param cascadingStyleSheetPattern - Pattern to match cascading style
         * sheet asset references again.
         * @param javaScriptPattern - Pattern to match javaScript asset references
         * again.
         * @param basePath - Base path to use as prefix for file references.
         * @param cascadingStyleSheetChunkNameTemplate - Cascading style sheet
         * chunk name template to use for asset matching.
         * @param javaScriptChunkNameTemplate - JavaScript chunk name template to
         * use for asset matching.
         * @param assets - Mapping of asset file paths to their content.
         * @returns Given an transformed markup.
         */

    }, {
        key: 'inPlaceCSSAndJavaScriptAssetReferences',
        value: function inPlaceCSSAndJavaScriptAssetReferences(content, cascadingStyleSheetPattern, javaScriptPattern, basePath, cascadingStyleSheetChunkNameTemplate, javaScriptChunkNameTemplate, assets) {
            /*
                NOTE: We have to translate template delimiter to html compatible
                sequences and translate it back later to avoid unexpected escape
                sequences in resulting html.
            */
            return new _promise2.default(function (resolve, reject) {
                var window = void 0;
                try {
                    window = new _jsdom.JSDOM(content.replace(/<%/g, '##+#+#+##').replace(/%>/g, '##-#-#-##')).window;
                } catch (error) {
                    return reject(error);
                }
                var filePathsToRemove = [];
                if (cascadingStyleSheetPattern) for (var pattern in cascadingStyleSheetPattern) {
                    if (!cascadingStyleSheetPattern.hasOwnProperty(pattern)) continue;
                    var selector = '[href*=".css"]';
                    if (pattern !== '*') selector = '[href="' + _path4.default.relative(basePath, Helper.renderFilePathTemplate(cascadingStyleSheetChunkNameTemplate, {
                        '[contenthash]': '',
                        '[id]': pattern,
                        '[name]': pattern
                    })) + '"]';
                    var domNodes = window.document.querySelectorAll('link' + selector);
                    if (domNodes.length) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = (0, _getIterator3.default)(domNodes), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var domNode = _step2.value;

                                var inPlaceDomNode = window.document.createElement('style');
                                var _path = domNode.attributes.href.value.replace(/&.*/g, '');
                                if (!assets.hasOwnProperty(_path)) continue;
                                inPlaceDomNode.textContent = assets[_path].source();
                                if (cascadingStyleSheetPattern[pattern] === 'body') window.document.body.appendChild(inPlaceDomNode);else if (cascadingStyleSheetPattern[pattern] === 'in') domNode.parentNode.insertBefore(inPlaceDomNode, domNode);else if (cascadingStyleSheetPattern[pattern] === 'head') window.document.head.appendChild(inPlaceDomNode);
                                domNode.parentNode.removeChild(domNode);
                                /*
                                    NOTE: This doesn't prevent webpack from
                                    creating this file if present in another chunk
                                    so removing it (and a potential source map
                                    file) later in the "done" hook.
                                */
                                filePathsToRemove.push(Helper.stripLoader(_path));
                                delete assets[_path];
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    } else console.warn('No referenced cascading style sheet file in ' + 'resulting markup found with selector: link' + selector);
                }
                if (javaScriptPattern) for (var _pattern in javaScriptPattern) {
                    if (!javaScriptPattern.hasOwnProperty(_pattern)) continue;
                    var _selector = '[href*=".js"]';
                    if (_pattern !== '*') _selector = '[src^="' + _path4.default.relative(basePath, Helper.renderFilePathTemplate(javaScriptChunkNameTemplate, {
                        '[hash]': '',
                        '[id]': _pattern,
                        '[name]': _pattern
                    }) + '"]');
                    var _domNodes = window.document.querySelectorAll('script' + _selector);
                    if (_domNodes.length) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = (0, _getIterator3.default)(_domNodes), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var _domNode = _step3.value;

                                var _inPlaceDomNode = window.document.createElement('script');
                                var _path2 = _domNode.attributes.src.value.replace(/&.*/g, '');
                                if (!assets.hasOwnProperty(_path2)) continue;
                                _inPlaceDomNode.textContent = assets[_path2].source();
                                if (javaScriptPattern[_pattern] === 'body') window.document.body.appendChild(_inPlaceDomNode);else if (javaScriptPattern[_pattern] === 'in') _domNode.parentNode.insertBefore(_inPlaceDomNode, _domNode);else if (javaScriptPattern[_pattern] === 'head') window.document.head.appendChild(_inPlaceDomNode);
                                _domNode.parentNode.removeChild(_domNode);
                                /*
                                    NOTE: This doesn't prevent webpack from
                                    creating this file if present in another chunk
                                    so removing it (and a potential source map
                                    file) later in the "done" hook.
                                */
                                filePathsToRemove.push(Helper.stripLoader(_path2));
                                delete assets[_path2];
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }
                    } else console.warn('No referenced javaScript file in resulting ' + ('markup found with selector: script' + _selector));
                }
                resolve({
                    content: content.replace(/^(\s*<!doctype [^>]+?>\s*)[\s\S]*$/i, '$1') + window.document.documentElement.outerHTML.replace(/##\+#\+#\+##/g, '<%').replace(/##-#-#-##/g, '%>'),
                    filePathsToRemove: filePathsToRemove
                });
            });
        }
        /**
         * Strips loader informations form given module request including loader
         * prefix and query parameter.
         * @param moduleID - Module request to strip.
         * @returns Given module id stripped.
         */

    }, {
        key: 'stripLoader',
        value: function stripLoader(moduleID) {
            moduleID = moduleID.toString();
            var moduleIDWithoutLoader = moduleID.substring(moduleID.lastIndexOf('!') + 1);
            return moduleIDWithoutLoader.includes('?') ? moduleIDWithoutLoader.substring(0, moduleIDWithoutLoader.indexOf('?')) : moduleIDWithoutLoader;
        }
        // endregion
        // region array
        /**
         * Converts given list of path to a normalized list with unique values.
         * @param paths - File paths.
         * @returns The given file path list with normalized unique values.
         */

    }, {
        key: 'normalizePaths',
        value: function normalizePaths(paths) {
            return (0, _from2.default)(new _set2.default(paths.map(function (givenPath) {
                givenPath = _path4.default.normalize(givenPath);
                if (givenPath.endsWith('/')) return givenPath.substring(0, givenPath.length - 1);
                return givenPath;
            })));
        }
        // endregion
        // region file handler
        /**
         * Applies file path/name placeholder replacements with given bundle
         * associated informations.
         * @param filePathTemplate - File path to process placeholder in.
         * @param informations - Scope to use for processing.
         * @returns Processed file path.
         */

    }, {
        key: 'renderFilePathTemplate',
        value: function renderFilePathTemplate(filePathTemplate) {
            var informations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
                '[name]': '.__dummy__', '[id]': '.__dummy__',
                '[hash]': '.__dummy__'
            };

            var filePath = filePathTemplate;
            for (var placeholderName in informations) {
                if (informations.hasOwnProperty(placeholderName)) filePath = filePath.replace(new RegExp(_clientnode2.default.stringEscapeRegularExpressions(placeholderName), 'g'), informations[placeholderName]);
            }return filePath;
        }
        /**
         * Converts given request to a resolved request with given context
         * embedded.
         * @param request - Request to determine.
         * @param context - Context of given request to resolve relative to.
         * @param referencePath - Path to resolve local modules relative to.
         * @param aliases - Mapping of aliases to take into account.
         * @param moduleReplacements - Mapping of replacements to take into
         * account.
         * @param relativeModuleFilePaths - List of relative file path to search
         * for modules in.
         * @returns A new resolved request.
         */

    }, {
        key: 'applyContext',
        value: function applyContext(request) {
            var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
            var referencePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : './';
            var aliases = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var moduleReplacements = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
            var relativeModuleFilePaths = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : ['node_modules'];

            referencePath = _path4.default.resolve(referencePath);
            if (request.startsWith('./') && _path4.default.resolve(context) !== referencePath) {
                request = _path4.default.resolve(context, request);
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = (0, _getIterator3.default)(relativeModuleFilePaths), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var modulePath = _step4.value;

                        var pathPrefix = _path4.default.resolve(referencePath, modulePath);
                        if (request.startsWith(pathPrefix)) {
                            request = request.substring(pathPrefix.length);
                            if (request.startsWith('/')) request = request.substring(1);
                            return Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
                        }
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                if (request.startsWith(referencePath)) {
                    request = request.substring(referencePath.length);
                    if (request.startsWith('/')) request = request.substring(1);
                    return Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
                }
            }
            return request;
        }
        /**
         * Check if given request points to an external dependency not maintained
         * by current package context.
         * @param request - Request to determine.
         * @param context - Context of current project.
         * @param requestContext - Context of given request to resolve relative to.
         * @param normalizedInternalInjection - Mapping of chunk names to modules
         * which should be injected.
         * @param externalModuleLocations - Array if paths where external modules
         * take place.
         * @param aliases - Mapping of aliases to take into account.
         * @param moduleReplacements - Mapping of replacements to take into
         * account.
         * @param extensions - List of file and module extensions to take into
         * account.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param relativeModuleFilePaths - List of relative file path to search
         * for modules in.
         * @param packageEntryFileNames - List of package entry file names to
         * search for. The magic name "__package__" will search for an appreciate
         * entry in a "package.json" file.
         * @param packageMainPropertyNames - List of package file main property
         * names to search for package representing entry module definitions.
         * @param packageAliasPropertyNames - List of package file alias property
         * names to search for package specific module aliases.
         * @param includePattern - Array of regular expressions to explicitly mark
         * as external dependency.
         * @param excludePattern - Array of regular expressions to explicitly mark
         * as internal dependency.
         * @param inPlaceNormalLibrary - Indicates whether normal libraries should
         * be external or not.
         * @param inPlaceDynamicLibrary - Indicates whether requests with
         * integrated loader configurations should be marked as external or not.
         * @param encoding - Encoding for file names to use during file traversing.
         * @returns A new resolved request indicating whether given request is an
         * external one.
         */

    }, {
        key: 'determineExternalRequest',
        value: function determineExternalRequest(request) {
            var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
            var requestContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : './';
            var normalizedInternalInjection = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var externalModuleLocations = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ['node_modules'];
            var aliases = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
            var moduleReplacements = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
            var extensions = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : {
                file: {
                    external: ['.js'],
                    internal: ['.js', '.json', '.css', '.eot', '.gif', '.html', '.ico', '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2']
                }, module: []
            };
            var referencePath = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : './';
            var pathsToIgnore = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['.git'];
            var relativeModuleFilePaths = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : ['node_modules'];
            var packageEntryFileNames = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : ['index', 'main'];
            var packageMainPropertyNames = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : ['main', 'module'];
            var packageAliasPropertyNames = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : [];
            var includePattern = arguments.length > 14 && arguments[14] !== undefined ? arguments[14] : [];
            var excludePattern = arguments.length > 15 && arguments[15] !== undefined ? arguments[15] : [];
            var inPlaceNormalLibrary = arguments.length > 16 && arguments[16] !== undefined ? arguments[16] : false;
            var inPlaceDynamicLibrary = arguments.length > 17 && arguments[17] !== undefined ? arguments[17] : true;
            var encoding = arguments.length > 18 && arguments[18] !== undefined ? arguments[18] : 'utf-8';

            context = _path4.default.resolve(context);
            requestContext = _path4.default.resolve(requestContext);
            referencePath = _path4.default.resolve(referencePath);
            // NOTE: We apply alias on externals additionally.
            var resolvedRequest = Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
            /*
                NOTE: Aliases and module replacements doesn't have to be forwarded
                since we pass an already resolved request.
            */
            var filePath = Helper.determineModuleFilePath(resolvedRequest, {}, {}, extensions, context, requestContext, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
            /*
                NOTE: We mark dependencies as external if there file couldn't be
                resolved or are specified to be external explicitly.
            */
            if (!(filePath || inPlaceNormalLibrary) || _clientnode2.default.isAnyMatching(resolvedRequest, includePattern)) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleFilePaths);
            if (_clientnode2.default.isAnyMatching(resolvedRequest, excludePattern)) return null;
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = (0, _getIterator3.default)(normalizedInternalInjection[chunkName]), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var moduleID = _step5.value;

                            if (Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, extensions, context, requestContext, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding) === filePath) return null;
                        }
                    } catch (err) {
                        _didIteratorError5 = true;
                        _iteratorError5 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                _iterator5.return();
                            }
                        } finally {
                            if (_didIteratorError5) {
                                throw _iteratorError5;
                            }
                        }
                    }
                }
            } /*
                  NOTE: We mark dependencies as external if they does not contain a
                  loader in their request and aren't part of the current main package
                  or have a file extension other than javaScript aware.
              */
            if (!inPlaceNormalLibrary && (extensions.file.external.length === 0 || filePath && extensions.file.external.includes(_path4.default.extname(filePath)) || !filePath && extensions.file.external.includes('')) && !(inPlaceDynamicLibrary && request.includes('!')) && (!filePath && inPlaceDynamicLibrary || filePath && (!filePath.startsWith(context) || Helper.isFilePathInLocation(filePath, externalModuleLocations)))) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleFilePaths);
            return null;
        }
        /**
         * Determines asset type of given file.
         * @param filePath - Path to file to analyse.
         * @param buildConfiguration - Meta informations for available asset
         * types.
         * @param paths - List of paths to search if given path doesn't reference
         * a file directly.
         * @returns Determined file type or "null" of given file couldn't be
         * determined.
         */

    }, {
        key: 'determineAssetType',
        value: function determineAssetType(filePath, buildConfiguration, paths) {
            var result = null;
            for (var type in buildConfiguration) {
                if (_path4.default.extname(filePath) === '.' + buildConfiguration[type].extension) {
                    result = type;
                    break;
                }
            }if (!result) {
                var _arr = ['source', 'target'];

                for (var _i = 0; _i < _arr.length; _i++) {
                    var _type = _arr[_i];
                    for (var assetType in paths[_type].asset) {
                        if (paths[_type].asset.hasOwnProperty(assetType) && assetType !== 'base' && paths[_type].asset[assetType] && filePath.startsWith(paths[_type].asset[assetType])) return assetType;
                    }
                }
            }return result;
        }
        /**
         * Adds a property with a stored array of all matching file paths, which
         * matches each build configuration in given entry path and converts given
         * build configuration into a sorted array were javaScript files takes
         * precedence.
         * @param configuration - Given build configurations.
         * @param entryPath - Path to analyse nested structure.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param mainFileBasenames - File basenames to sort into the front.
         * @returns Converted build configuration.
         */

    }, {
        key: 'resolveBuildConfigurationFilePaths',
        value: function resolveBuildConfigurationFilePaths(configuration) {
            var entryPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
            var pathsToIgnore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['.git'];
            var mainFileBasenames = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ['index', 'main'];

            var buildConfiguration = [];
            for (var type in configuration) {
                if (configuration.hasOwnProperty(type)) {
                    var newItem = _clientnode2.default.extendObject(true, { filePaths: [] }, configuration[type]);
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = (0, _getIterator3.default)(_clientnode2.default.walkDirectoryRecursivelySync(entryPath, function (file) {
                            if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
                        })), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var file = _step6.value;

                            if (file.stats && file.stats.isFile() && _path4.default.extname(file.path).substring(1) === newItem.extension && !new RegExp(newItem.filePathPattern).test(file.path)) newItem.filePaths.push(file.path);
                        }
                    } catch (err) {
                        _didIteratorError6 = true;
                        _iteratorError6 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                _iterator6.return();
                            }
                        } finally {
                            if (_didIteratorError6) {
                                throw _iteratorError6;
                            }
                        }
                    }

                    newItem.filePaths.sort(function (firstFilePath, secondFilePath) {
                        if (mainFileBasenames.includes(_path4.default.basename(firstFilePath, _path4.default.extname(firstFilePath)))) {
                            if (mainFileBasenames.includes(_path4.default.basename(secondFilePath, _path4.default.extname(secondFilePath)))) return 0;
                        } else if (mainFileBasenames.includes(_path4.default.basename(secondFilePath, _path4.default.extname(secondFilePath)))) return 1;
                        return 0;
                    });
                    buildConfiguration.push(newItem);
                }
            }return buildConfiguration.sort(function (first, second) {
                if (first.outputExtension !== second.outputExtension) {
                    if (first.outputExtension === 'js') return -1;
                    if (second.outputExtension === 'js') return 1;
                    return first.outputExtension < second.outputExtension ? -1 : 1;
                }
                return 0;
            });
        }
        /**
         * Determines all file and directory paths related to given internal
         * modules as array.
         * @param internalInjection - List of module ids or module file paths.
         * @param aliases - Mapping of aliases to take into account.
         * @param moduleReplacements - Mapping of module replacements to take into
         * account.
         * @param extensions - List of file and module extensions to take into
         * account.
         * @param context - File path to resolve relative to.
         * @param referencePath - Path to search for local modules.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param relativeModuleFilePaths - List of relative file path to search
         * for modules in.
         * @param packageEntryFileNames - List of package entry file names to
         * search for. The magic name "__package__" will search for an appreciate
         * entry in a "package.json" file.
         * @param packageMainPropertyNames - List of package file main property
         * names to search for package representing entry module definitions.
         * @param packageAliasPropertyNames - List of package file alias property
         * names to search for package specific module aliases.
         * @param encoding - File name encoding to use during file traversing.
         * @returns Object with a file path and directory path key mapping to
         * corresponding list of paths.
         */

    }, {
        key: 'determineModuleLocations',
        value: function determineModuleLocations(internalInjection) {
            var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var extensions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
                file: {
                    external: ['.js'],
                    internal: ['.js', '.json', '.css', '.eot', '.gif', '.html', '.ico', '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2']
                }, module: []
            };
            var context = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : './';
            var referencePath = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
            var pathsToIgnore = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : ['.git'];
            var relativeModuleFilePaths = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : ['', 'node_modules', '../'];
            var packageEntryFileNames = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['__package__', '', 'index', 'main'];
            var packageMainPropertyNames = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['main', 'module'];
            var packageAliasPropertyNames = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : [];
            var encoding = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 'utf-8';

            var filePaths = [];
            var directoryPaths = [];
            var normalizedInternalInjection = Helper.resolveModulesInFolders(Helper.normalizeInternalInjection(internalInjection), aliases, moduleReplacements, context, referencePath, pathsToIgnore);
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = (0, _getIterator3.default)(normalizedInternalInjection[chunkName]), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var moduleID = _step7.value;

                            var filePath = Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, extensions, context, referencePath, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
                            if (filePath) {
                                filePaths.push(filePath);
                                var directoryPath = _path4.default.dirname(filePath);
                                if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
                            }
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                _iterator7.return();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }
                }
            }return { filePaths: filePaths, directoryPaths: directoryPaths };
        }
        /**
         * Determines a list of concrete file paths for given module id pointing to
         * a folder which isn't a package.
         * @param normalizedInternalInjection - Injection data structure of
         * modules with folder references to resolve.
         * @param aliases - Mapping of aliases to take into account.
         * @param moduleReplacements - Mapping of replacements to take into
         * account.
         * @param context - File path to determine relative to.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @returns Given injections with resolved folder pointing modules.
         */

    }, {
        key: 'resolveModulesInFolders',
        value: function resolveModulesInFolders(normalizedInternalInjection) {
            var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : './';
            var referencePath = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
            var pathsToIgnore = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : ['.git'];

            if (referencePath.startsWith('/')) referencePath = _path4.default.relative(context, referencePath);
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var index = 0;
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = (0, _getIterator3.default)(normalizedInternalInjection[chunkName]), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var moduleID = _step8.value;

                            moduleID = Helper.applyModuleReplacements(Helper.applyAliases(Helper.stripLoader(moduleID), aliases), moduleReplacements);
                            var resolvedPath = _path4.default.resolve(referencePath, moduleID);
                            if (_clientnode2.default.isDirectorySync(resolvedPath)) {
                                normalizedInternalInjection[chunkName].splice(index, 1);
                                var _iteratorNormalCompletion9 = true;
                                var _didIteratorError9 = false;
                                var _iteratorError9 = undefined;

                                try {
                                    for (var _iterator9 = (0, _getIterator3.default)(_clientnode2.default.walkDirectoryRecursivelySync(resolvedPath, function (file) {
                                        if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
                                    })), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                        var file = _step9.value;

                                        if (file.stats && file.stats.isFile()) normalizedInternalInjection[chunkName].push('./' + _path4.default.relative(referencePath, _path4.default.resolve(resolvedPath, file.path)));
                                    }
                                } catch (err) {
                                    _didIteratorError9 = true;
                                    _iteratorError9 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                            _iterator9.return();
                                        }
                                    } finally {
                                        if (_didIteratorError9) {
                                            throw _iteratorError9;
                                        }
                                    }
                                }
                            } else if (moduleID.startsWith('./') && !moduleID.startsWith('./' + _path4.default.relative(context, referencePath))) normalizedInternalInjection[chunkName][index] = './' + _path4.default.relative(context, resolvedPath);
                            index += 1;
                        }
                    } catch (err) {
                        _didIteratorError8 = true;
                        _iteratorError8 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                _iterator8.return();
                            }
                        } finally {
                            if (_didIteratorError8) {
                                throw _iteratorError8;
                            }
                        }
                    }
                }
            }return normalizedInternalInjection;
        }
        /**
         * Every injection definition type can be represented as plain object
         * (mapping from chunk name to array of module ids). This method converts
         * each representation into the normalized plain object notation.
         * @param internalInjection - Given internal injection to normalize.
         * @returns Normalized representation of given internal injection.
         */

    }, {
        key: 'normalizeInternalInjection',
        value: function normalizeInternalInjection(internalInjection) {
            var result = {};
            if (internalInjection instanceof Object && _clientnode2.default.isPlainObject(internalInjection)) {
                var hasContent = false;
                var chunkNamesToDelete = [];
                for (var chunkName in internalInjection) {
                    if (internalInjection.hasOwnProperty(chunkName)) if (Array.isArray(internalInjection[chunkName])) {
                        if (internalInjection[chunkName].length > 0) {
                            hasContent = true;
                            result[chunkName] = internalInjection[chunkName];
                        } else chunkNamesToDelete.push(chunkName);
                    } else {
                        hasContent = true;
                        result[chunkName] = [internalInjection[chunkName]];
                    }
                }if (hasContent) {
                    var _iteratorNormalCompletion10 = true;
                    var _didIteratorError10 = false;
                    var _iteratorError10 = undefined;

                    try {
                        for (var _iterator10 = (0, _getIterator3.default)(chunkNamesToDelete), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                            var _chunkName = _step10.value;

                            delete result[_chunkName];
                        }
                    } catch (err) {
                        _didIteratorError10 = true;
                        _iteratorError10 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                _iterator10.return();
                            }
                        } finally {
                            if (_didIteratorError10) {
                                throw _iteratorError10;
                            }
                        }
                    }
                } else result = { index: [] };
            } else if (typeof internalInjection === 'string') result = { index: [internalInjection] };else if (Array.isArray(internalInjection)) result = { index: internalInjection };
            return result;
        }
        /**
         * Determines all concrete file paths for given injection which are marked
         * with the "__auto__" indicator.
         * @param givenInjection - Given internal and external injection to take
         * into account.
         * @param buildConfigurations - Resolved build configuration.
         * @param modulesToExclude - A list of modules to exclude (specified by
         * path or id) or a mapping from chunk names to module ids.
         * @param aliases - Mapping of aliases to take into account.
         * @param moduleReplacements - Mapping of replacements to take into
         * account.
         * @param extensions - List of file and module extensions to take into
         * account.
         * @param context - File path to use as starting point.
         * @param referencePath - Reference path from where local files should be
         * resolved.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @returns Given injection with resolved marked indicators.
         */

    }, {
        key: 'resolveInjection',
        value: function resolveInjection(givenInjection, buildConfigurations, modulesToExclude) {
            var aliases = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var moduleReplacements = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
            var extensions = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
                file: {
                    external: ['.js'],
                    internal: ['.js', '.json', '.css', '.eot', '.gif', '.html', '.ico', '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2']
                }, module: []
            };
            var context = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : './';
            var referencePath = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '';
            var pathsToIgnore = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['.git'];

            var injection = _clientnode2.default.extendObject(true, {}, givenInjection);
            var moduleFilePathsToExclude = Helper.determineModuleLocations(modulesToExclude, aliases, moduleReplacements, extensions, context, referencePath, pathsToIgnore).filePaths;
            var _arr2 = ['internal', 'external'];
            for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
                var type = _arr2[_i2];
                /* eslint-disable curly */
                if ((0, _typeof3.default)(injection[type]) === 'object') {
                    for (var chunkName in injection[type]) {
                        if (injection[type][chunkName] === '__auto__') {
                            injection[type][chunkName] = [];
                            var modules = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, referencePath);
                            for (var subChunkName in modules) {
                                if (modules.hasOwnProperty(subChunkName)) injection[type][chunkName].push(modules[subChunkName]);
                            } /*
                                  Reverse array to let javaScript and main files be
                                  the last ones to export them rather.
                              */
                            injection[type][chunkName].reverse();
                        }
                    }
                } else if (injection[type] === '__auto__')
                    /* eslint-enable curly */
                    injection[type] = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context);
            }return injection;
        }
        /**
         * Determines all module file paths.
         * @param buildConfigurations - Resolved build configuration.
         * @param moduleFilePathsToExclude - A list of modules file paths to
         * exclude (specified by path or id) or a mapping from chunk names to
         * module ids.
         * @param context - File path to use as starting point.
         * @returns All determined module file paths.
         */

    }, {
        key: 'getAutoChunk',
        value: function getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context) {
            var result = {};
            var injectedModuleIDs = {};
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = (0, _getIterator3.default)(buildConfigurations), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var buildConfiguration = _step11.value;

                    if (!injectedModuleIDs[buildConfiguration.outputExtension]) injectedModuleIDs[buildConfiguration.outputExtension] = [];
                    var _iteratorNormalCompletion12 = true;
                    var _didIteratorError12 = false;
                    var _iteratorError12 = undefined;

                    try {
                        for (var _iterator12 = (0, _getIterator3.default)(buildConfiguration.filePaths), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                            var moduleFilePath = _step12.value;

                            if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                                var relativeModuleFilePath = './' + _path4.default.relative(context, moduleFilePath);
                                var directoryPath = _path4.default.dirname(relativeModuleFilePath);
                                var baseName = _path4.default.basename(relativeModuleFilePath, '.' + buildConfiguration.extension);
                                var moduleID = baseName;
                                if (directoryPath !== '.') moduleID = _path4.default.join(directoryPath, baseName);
                                /*
                                    Ensure that each output type has only one source
                                    representation.
                                */
                                if (!injectedModuleIDs[buildConfiguration.outputExtension].includes(moduleID)) {
                                    /*
                                        Ensure that same module ids and different output
                                        types can be distinguished by their extension
                                        (JavaScript-Modules remains without extension since
                                        they will be handled first because the build
                                        configurations are expected to be sorted in this
                                        context).
                                    */
                                    if (result.hasOwnProperty(moduleID)) result[relativeModuleFilePath] = relativeModuleFilePath;else result[moduleID] = relativeModuleFilePath;
                                    injectedModuleIDs[buildConfiguration.outputExtension].push(moduleID);
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError12 = true;
                        _iteratorError12 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion12 && _iterator12.return) {
                                _iterator12.return();
                            }
                        } finally {
                            if (_didIteratorError12) {
                                throw _iteratorError12;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }

            return result;
        }
        /**
         * Determines a concrete file path for given module id.
         * @param moduleID - Module id to determine.
         * @param aliases - Mapping of aliases to take into account.
         * @param moduleReplacements - Mapping of replacements to take into
         * account.
         * @param extensions - List of file and module extensions to take into
         * account.
         * @param context - File path to determine relative to.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param relativeModuleFilePaths - List of relative file path to search
         * for modules in.
         * @param packageEntryFileNames - List of package entry file names to
         * search for. The magic name "__package__" will search for an appreciate
         * entry in a "package.json" file.
         * @param packageMainPropertyNames - List of package file main property
         * names to search for package representing entry module definitions.
         * @param packageAliasPropertyNames - List of package file alias property
         * names to search for package specific module aliases.
         * @param encoding - Encoding to use for file names during file traversing.
         * @returns File path or given module id if determinations has failed or
         * wasn't necessary.
         */

    }, {
        key: 'determineModuleFilePath',
        value: function determineModuleFilePath(moduleID) {
            var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var extensions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
                file: {
                    external: ['.js'],
                    internal: ['.js', '.json', '.css', '.eot', '.gif', '.html', '.ico', '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2']
                }, module: []
            };
            var context = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : './';
            var referencePath = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
            var pathsToIgnore = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : ['.git'];
            var relativeModuleFilePaths = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : ['node_modules'];
            var packageEntryFileNames = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['index'];
            var packageMainPropertyNames = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['main'];
            var packageAliasPropertyNames = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : [];
            var encoding = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 'utf-8';

            moduleID = Helper.applyModuleReplacements(Helper.applyAliases(Helper.stripLoader(moduleID), aliases), moduleReplacements);
            if (!moduleID) return null;
            var moduleFilePath = moduleID;
            if (moduleFilePath.startsWith('./')) moduleFilePath = _path4.default.join(referencePath, moduleFilePath);
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = (0, _getIterator3.default)([referencePath].concat(relativeModuleFilePaths.map(function (filePath) {
                    return _path4.default.resolve(context, filePath);
                }))), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var moduleLocation = _step13.value;
                    var _iteratorNormalCompletion14 = true;
                    var _didIteratorError14 = false;
                    var _iteratorError14 = undefined;

                    try {
                        for (var _iterator14 = (0, _getIterator3.default)(['', '__package__'].concat(packageEntryFileNames)), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                            var fileName = _step14.value;
                            var _iteratorNormalCompletion15 = true;
                            var _didIteratorError15 = false;
                            var _iteratorError15 = undefined;

                            try {
                                for (var _iterator15 = (0, _getIterator3.default)(extensions.module.concat([''])), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                                    var moduleExtension = _step15.value;
                                    var _iteratorNormalCompletion16 = true;
                                    var _didIteratorError16 = false;
                                    var _iteratorError16 = undefined;

                                    try {
                                        for (var _iterator16 = (0, _getIterator3.default)([''].concat(extensions.file.internal)), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                                            var fileExtension = _step16.value;

                                            var currentModuleFilePath = void 0;
                                            if (moduleFilePath.startsWith('/')) currentModuleFilePath = _path4.default.resolve(moduleFilePath);else currentModuleFilePath = _path4.default.resolve(moduleLocation, moduleFilePath);
                                            var packageAliases = {};
                                            if (fileName === '__package__') {
                                                if (_clientnode2.default.isDirectorySync(currentModuleFilePath)) {
                                                    var pathToPackageJSON = _path4.default.resolve(currentModuleFilePath, 'package.json');
                                                    if (_clientnode2.default.isFileSync(pathToPackageJSON)) {
                                                        var localConfiguration = {};
                                                        try {
                                                            localConfiguration = JSON.parse(fileSystem.readFileSync(pathToPackageJSON, { encoding: encoding }));
                                                        } catch (error) {}
                                                        var _iteratorNormalCompletion17 = true;
                                                        var _didIteratorError17 = false;
                                                        var _iteratorError17 = undefined;

                                                        try {
                                                            for (var _iterator17 = (0, _getIterator3.default)(packageMainPropertyNames), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                                                                var propertyName = _step17.value;

                                                                if (localConfiguration.hasOwnProperty(propertyName) && typeof localConfiguration[propertyName] === 'string' && localConfiguration[propertyName]) {
                                                                    fileName = localConfiguration[propertyName];
                                                                    break;
                                                                }
                                                            }
                                                        } catch (err) {
                                                            _didIteratorError17 = true;
                                                            _iteratorError17 = err;
                                                        } finally {
                                                            try {
                                                                if (!_iteratorNormalCompletion17 && _iterator17.return) {
                                                                    _iterator17.return();
                                                                }
                                                            } finally {
                                                                if (_didIteratorError17) {
                                                                    throw _iteratorError17;
                                                                }
                                                            }
                                                        }

                                                        var _iteratorNormalCompletion18 = true;
                                                        var _didIteratorError18 = false;
                                                        var _iteratorError18 = undefined;

                                                        try {
                                                            for (var _iterator18 = (0, _getIterator3.default)(packageAliasPropertyNames), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                                                                var _propertyName = _step18.value;

                                                                if (localConfiguration.hasOwnProperty(_propertyName) && (0, _typeof3.default)(localConfiguration[_propertyName]) === 'object') {
                                                                    packageAliases = localConfiguration[_propertyName];
                                                                    break;
                                                                }
                                                            }
                                                        } catch (err) {
                                                            _didIteratorError18 = true;
                                                            _iteratorError18 = err;
                                                        } finally {
                                                            try {
                                                                if (!_iteratorNormalCompletion18 && _iterator18.return) {
                                                                    _iterator18.return();
                                                                }
                                                            } finally {
                                                                if (_didIteratorError18) {
                                                                    throw _iteratorError18;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                if (fileName === '__package__') continue;
                                            }
                                            fileName = Helper.applyModuleReplacements(Helper.applyAliases(fileName, packageAliases), moduleReplacements);
                                            if (fileName) currentModuleFilePath = _path4.default.resolve(currentModuleFilePath, '' + fileName + moduleExtension + fileExtension);else currentModuleFilePath += '' + fileName + moduleExtension + fileExtension;
                                            if (Helper.isFilePathInLocation(currentModuleFilePath, pathsToIgnore)) continue;
                                            if (_clientnode2.default.isFileSync(currentModuleFilePath)) return currentModuleFilePath;
                                        }
                                    } catch (err) {
                                        _didIteratorError16 = true;
                                        _iteratorError16 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion16 && _iterator16.return) {
                                                _iterator16.return();
                                            }
                                        } finally {
                                            if (_didIteratorError16) {
                                                throw _iteratorError16;
                                            }
                                        }
                                    }
                                }
                            } catch (err) {
                                _didIteratorError15 = true;
                                _iteratorError15 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion15 && _iterator15.return) {
                                        _iterator15.return();
                                    }
                                } finally {
                                    if (_didIteratorError15) {
                                        throw _iteratorError15;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError14 = true;
                        _iteratorError14 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion14 && _iterator14.return) {
                                _iterator14.return();
                            }
                        } finally {
                            if (_didIteratorError14) {
                                throw _iteratorError14;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13.return) {
                        _iterator13.return();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }

            return null;
        }
        // endregion
        /**
         * Determines a concrete file path for given module id.
         * @param moduleID - Module id to determine.
         * @param aliases - Mapping of aliases to take into account.
         * @returns The alias applied given module id.
         */

    }, {
        key: 'applyAliases',
        value: function applyAliases(moduleID, aliases) {
            for (var alias in aliases) {
                if (alias.endsWith('$')) {
                    if (moduleID === alias.substring(0, alias.length - 1)) moduleID = aliases[alias];
                } else moduleID = moduleID.replace(alias, aliases[alias]);
            }return moduleID;
        }
        /**
         * Determines a concrete file path for given module id.
         * @param moduleID - Module id to determine.
         * @param replacements - Mapping of regular expressions to their
         * corresponding replacements.
         * @returns The replacement applied given module id.
         */

    }, {
        key: 'applyModuleReplacements',
        value: function applyModuleReplacements(moduleID, replacements) {
            for (var replacement in replacements) {
                if (replacements.hasOwnProperty(replacement)) moduleID = moduleID.replace(new RegExp(replacement), replacements[replacement]);
            }return moduleID;
        }
    }]);
    return Helper;
}();

exports.default = Helper;
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QWYsQ0FBSixFQUF5QjtBQUNyQix3QkFBSSxhQUFhLE1BQU0sU0FBTixDQUFnQixDQUFoQixFQUFtQixNQUFNLE1BQU4sR0FBZSxDQUFsQyxDQUFqQixFQUNJLFdBQVcsUUFBUSxLQUFSLENBQVg7QUFDUCxpQkFIRCxNQUlJLFdBQVcsU0FBUyxPQUFULENBQWlCLEtBQWpCLEVBQXdCLFFBQVEsS0FBUixDQUF4QixDQUFYO0FBTFIsYUFNQSxPQUFPLFFBQVA7QUFDSDtBQUNEOzs7Ozs7Ozs7O2dEQVFJLFEsRUFBaUIsWSxFQUNaO0FBQ0wsaUJBQUssSUFBTSxXQUFYLElBQWlDLFlBQWpDO0FBQ0ksb0JBQUksYUFBYSxjQUFiLENBQTRCLFdBQTVCLENBQUosRUFDSSxXQUFXLFNBQVMsT0FBVCxDQUNQLElBQUksTUFBSixDQUFXLFdBQVgsQ0FETyxFQUNrQixhQUFhLFdBQWIsQ0FEbEIsQ0FBWDtBQUZSLGFBSUEsT0FBTyxRQUFQO0FBQ0g7Ozs7O2tCQUVVLE07QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImhlbHBlci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB0eXBlIHtEb21Ob2RlfSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgdHlwZSB7RmlsZSwgUGxhaW5PYmplY3QsIFdpbmRvd30gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB7SlNET00gYXMgRE9NfSBmcm9tICdqc2RvbSdcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IHR5cGUge1xuICAgIEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBFeHRlbnNpb25zLFxuICAgIEluamVjdGlvbixcbiAgICBJbnRlcm5hbEluamVjdGlvbixcbiAgICBOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24sXG4gICAgUGF0aCxcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbn0gZnJvbSAnLi90eXBlJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbWV0aG9kc1xuLyoqXG4gKiBQcm92aWRlcyBhIGNsYXNzIG9mIHN0YXRpYyBtZXRob2RzIHdpdGggZ2VuZXJpYyB1c2UgY2FzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWxwZXIge1xuICAgIC8vIHJlZ2lvbiBib29sZWFuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGdpdmVuIGZpbGUgcGF0aCBpcyB3aXRoaW4gZ2l2ZW4gbGlzdCBvZiBmaWxlXG4gICAgICogbG9jYXRpb25zLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBjaGVjay5cbiAgICAgKiBAcGFyYW0gbG9jYXRpb25zVG9DaGVjayAtIExvY2F0aW9ucyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBWYWx1ZSBcInRydWVcIiBpZiBnaXZlbiBmaWxlIHBhdGggaXMgd2l0aGluIG9uZSBvZiBnaXZlblxuICAgICAqIGxvY2F0aW9ucyBvciBcImZhbHNlXCIgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBsb2NhdGlvbnNUb0NoZWNrOkFycmF5PHN0cmluZz5cbiAgICApOmJvb2xlYW4ge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGhUb0NoZWNrOnN0cmluZyBvZiBsb2NhdGlvbnNUb0NoZWNrKVxuICAgICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShmaWxlUGF0aCkuc3RhcnRzV2l0aChwYXRoLnJlc29sdmUocGF0aFRvQ2hlY2spKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHN0cmluZ1xuICAgIC8qKlxuICAgICAqIEluIHBsYWNlcyBlYWNoIG1hdGNoaW5nIGNhc2NhZGluZyBzdHlsZSBzaGVldCBvciBqYXZhU2NyaXB0IGZpbGVcbiAgICAgKiByZWZlcmVuY2UuXG4gICAgICogQHBhcmFtIGNvbnRlbnQgLSBNYXJrdXAgY29udGVudCB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybiAtIFBhdHRlcm4gdG8gbWF0Y2ggY2FzY2FkaW5nIHN0eWxlXG4gICAgICogc2hlZXQgYXNzZXQgcmVmZXJlbmNlcyBhZ2Fpbi5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdFBhdHRlcm4gLSBQYXR0ZXJuIHRvIG1hdGNoIGphdmFTY3JpcHQgYXNzZXQgcmVmZXJlbmNlc1xuICAgICAqIGFnYWluLlxuICAgICAqIEBwYXJhbSBiYXNlUGF0aCAtIEJhc2UgcGF0aCB0byB1c2UgYXMgcHJlZml4IGZvciBmaWxlIHJlZmVyZW5jZXMuXG4gICAgICogQHBhcmFtIGNhc2NhZGluZ1N0eWxlU2hlZXRDaHVua05hbWVUZW1wbGF0ZSAtIENhc2NhZGluZyBzdHlsZSBzaGVldFxuICAgICAqIGNodW5rIG5hbWUgdGVtcGxhdGUgdG8gdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlIC0gSmF2YVNjcmlwdCBjaHVuayBuYW1lIHRlbXBsYXRlIHRvXG4gICAgICogdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gYXNzZXRzIC0gTWFwcGluZyBvZiBhc3NldCBmaWxlIHBhdGhzIHRvIHRoZWlyIGNvbnRlbnQuXG4gICAgICogQHJldHVybnMgR2l2ZW4gYW4gdHJhbnNmb3JtZWQgbWFya3VwLlxuICAgICAqL1xuICAgIHN0YXRpYyBpblBsYWNlQ1NTQW5kSmF2YVNjcmlwdEFzc2V0UmVmZXJlbmNlcyhcbiAgICAgICAgY29udGVudDpzdHJpbmcsXG4gICAgICAgIGNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuOj97W2tleTpzdHJpbmddOidib2R5J3wnaGVhZCd8J2luJ30sXG4gICAgICAgIGphdmFTY3JpcHRQYXR0ZXJuOj97W2tleTpzdHJpbmddOidib2R5J3wnaGVhZCd8J2luJ30sIGJhc2VQYXRoOnN0cmluZyxcbiAgICAgICAgY2FzY2FkaW5nU3R5bGVTaGVldENodW5rTmFtZVRlbXBsYXRlOnN0cmluZyxcbiAgICAgICAgamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlOnN0cmluZywgYXNzZXRzOntba2V5OnN0cmluZ106T2JqZWN0fVxuICAgICk6UHJvbWlzZTx7Y29udGVudDpzdHJpbmc7ZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPjt9PiB7XG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBoYXZlIHRvIHRyYW5zbGF0ZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgdG8gaHRtbCBjb21wYXRpYmxlXG4gICAgICAgICAgICBzZXF1ZW5jZXMgYW5kIHRyYW5zbGF0ZSBpdCBiYWNrIGxhdGVyIHRvIGF2b2lkIHVuZXhwZWN0ZWQgZXNjYXBlXG4gICAgICAgICAgICBzZXF1ZW5jZXMgaW4gcmVzdWx0aW5nIGh0bWwuXG4gICAgICAgICovXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGxldCB3aW5kb3c6V2luZG93XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdyA9IChuZXcgRE9NKGNvbnRlbnQucmVwbGFjZSgvPCUvZywgJyMjKyMrIysjIycpLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIC8lPi9nLCAnIyMtIy0jLSMjJ1xuICAgICAgICAgICAgICAgICkpKS53aW5kb3dcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoc1RvUmVtb3ZlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICAgICAgaWYgKGNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGF0dGVybjpzdHJpbmcgaW4gY2FzY2FkaW5nU3R5bGVTaGVldFBhdHRlcm4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybi5oYXNPd25Qcm9wZXJ0eShwYXR0ZXJuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RvcjpzdHJpbmcgPSAnW2hyZWYqPVwiLmNzc1wiXSdcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhdHRlcm4gIT09ICcqJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJ1tocmVmPVwiJyArIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGgsIEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNjYWRpbmdTdHlsZVNoZWV0Q2h1bmtOYW1lVGVtcGxhdGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbY29udGVudGhhc2hdJzogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW2lkXSc6IHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW25hbWVdJzogcGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkgKyAnXCJdJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21Ob2RlczpBcnJheTxEb21Ob2RlPiA9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgbGluayR7c2VsZWN0b3J9YClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbU5vZGVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZG9tTm9kZTpEb21Ob2RlIG9mIGRvbU5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5QbGFjZURvbU5vZGU6RG9tTm9kZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aDpzdHJpbmcgPSBkb21Ob2RlLmF0dHJpYnV0ZXMuaHJlZi52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJi4qL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXNzZXRzLmhhc093blByb3BlcnR5KHBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlLnRleHRDb250ZW50ID0gYXNzZXRzW3BhdGhdLnNvdXJjZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuW3BhdHRlcm5dID09PSAnYm9keScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY2FzY2FkaW5nU3R5bGVTaGVldFBhdHRlcm5bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdID09PSAnaW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUsIGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY2FzY2FkaW5nU3R5bGVTaGVldFBhdHRlcm5bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdID09PSAnaGVhZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogVGhpcyBkb2Vzbid0IHByZXZlbnQgd2VicGFjayBmcm9tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aW5nIHRoaXMgZmlsZSBpZiBwcmVzZW50IGluIGFub3RoZXIgY2h1bmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc28gcmVtb3ZpbmcgaXQgKGFuZCBhIHBvdGVudGlhbCBzb3VyY2UgbWFwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUpIGxhdGVyIGluIHRoZSBcImRvbmVcIiBob29rLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmUucHVzaChIZWxwZXIuc3RyaXBMb2FkZXIocGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFzc2V0c1twYXRoXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vIHJlZmVyZW5jZWQgY2FzY2FkaW5nIHN0eWxlIHNoZWV0IGZpbGUgaW4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Jlc3VsdGluZyBtYXJrdXAgZm91bmQgd2l0aCBzZWxlY3RvcjogbGluaycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqYXZhU2NyaXB0UGF0dGVybilcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm46c3RyaW5nIGluIGphdmFTY3JpcHRQYXR0ZXJuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghamF2YVNjcmlwdFBhdHRlcm4uaGFzT3duUHJvcGVydHkocGF0dGVybikpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3I6c3RyaW5nID0gJ1tocmVmKj1cIi5qc1wiXSdcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhdHRlcm4gIT09ICcqJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gJ1tzcmNePVwiJyArIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGgsIEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqYXZhU2NyaXB0Q2h1bmtOYW1lVGVtcGxhdGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbaGFzaF0nOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbaWRdJzogcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbbmFtZV0nOiBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGVzOkFycmF5PERvbU5vZGU+ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBzY3JpcHQke3NlbGVjdG9yfWApXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21Ob2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRvbU5vZGU6RG9tTm9kZSBvZiBkb21Ob2Rlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluUGxhY2VEb21Ob2RlOkRvbU5vZGUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoOnN0cmluZyA9IGRvbU5vZGUuYXR0cmlidXRlcy5zcmMudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyYuKi9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2V0cy5oYXNPd25Qcm9wZXJ0eShwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZS50ZXh0Q29udGVudCA9IGFzc2V0c1twYXRoXS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqYXZhU2NyaXB0UGF0dGVybltwYXR0ZXJuXSA9PT0gJ2JvZHknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGphdmFTY3JpcHRQYXR0ZXJuW3BhdHRlcm5dID09PSAnaW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUsIGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoamF2YVNjcmlwdFBhdHRlcm5bcGF0dGVybl0gPT09ICdoZWFkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBUaGlzIGRvZXNuJ3QgcHJldmVudCB3ZWJwYWNrIGZyb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpbmcgdGhpcyBmaWxlIGlmIHByZXNlbnQgaW4gYW5vdGhlciBjaHVua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbyByZW1vdmluZyBpdCAoYW5kIGEgcG90ZW50aWFsIHNvdXJjZSBtYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSkgbGF0ZXIgaW4gdGhlIFwiZG9uZVwiIGhvb2suXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZS5wdXNoKEhlbHBlci5zdHJpcExvYWRlcihwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXNzZXRzW3BhdGhdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTm8gcmVmZXJlbmNlZCBqYXZhU2NyaXB0IGZpbGUgaW4gcmVzdWx0aW5nICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBtYXJrdXAgZm91bmQgd2l0aCBzZWxlY3Rvcjogc2NyaXB0JHtzZWxlY3Rvcn1gKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgL14oXFxzKjwhZG9jdHlwZSBbXj5dKz8+XFxzKilbXFxzXFxTXSokL2ksICckMSdcbiAgICAgICAgICAgICAgICApICsgd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUwucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLyMjXFwrI1xcKyNcXCsjIy9nLCAnPCUnXG4gICAgICAgICAgICAgICAgKS5yZXBsYWNlKC8jIy0jLSMtIyMvZywgJyU+JyksXG4gICAgICAgICAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0cmlwcyBsb2FkZXIgaW5mb3JtYXRpb25zIGZvcm0gZ2l2ZW4gbW9kdWxlIHJlcXVlc3QgaW5jbHVkaW5nIGxvYWRlclxuICAgICAqIHByZWZpeCBhbmQgcXVlcnkgcGFyYW1ldGVyLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSByZXF1ZXN0IHRvIHN0cmlwLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIG1vZHVsZSBpZCBzdHJpcHBlZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc3RyaXBMb2FkZXIobW9kdWxlSUQ6c3RyaW5nfFN0cmluZyk6c3RyaW5nIHtcbiAgICAgICAgbW9kdWxlSUQgPSBtb2R1bGVJRC50b1N0cmluZygpXG4gICAgICAgIGNvbnN0IG1vZHVsZUlEV2l0aG91dExvYWRlcjpzdHJpbmcgPSBtb2R1bGVJRC5zdWJzdHJpbmcoXG4gICAgICAgICAgICBtb2R1bGVJRC5sYXN0SW5kZXhPZignIScpICsgMSlcbiAgICAgICAgcmV0dXJuIG1vZHVsZUlEV2l0aG91dExvYWRlci5pbmNsdWRlcyhcbiAgICAgICAgICAgICc/J1xuICAgICAgICApID8gbW9kdWxlSURXaXRob3V0TG9hZGVyLnN1YnN0cmluZygwLCBtb2R1bGVJRFdpdGhvdXRMb2FkZXIuaW5kZXhPZihcbiAgICAgICAgICAgICAgICAnPydcbiAgICAgICAgICAgICkpIDogbW9kdWxlSURXaXRob3V0TG9hZGVyXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBhcnJheVxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGdpdmVuIGxpc3Qgb2YgcGF0aCB0byBhIG5vcm1hbGl6ZWQgbGlzdCB3aXRoIHVuaXF1ZSB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHBhdGhzIC0gRmlsZSBwYXRocy5cbiAgICAgKiBAcmV0dXJucyBUaGUgZ2l2ZW4gZmlsZSBwYXRoIGxpc3Qgd2l0aCBub3JtYWxpemVkIHVuaXF1ZSB2YWx1ZXMuXG4gICAgICovXG4gICAgc3RhdGljIG5vcm1hbGl6ZVBhdGhzKHBhdGhzOkFycmF5PHN0cmluZz4pOkFycmF5PHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KHBhdGhzLm1hcCgoZ2l2ZW5QYXRoOnN0cmluZyk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgIGdpdmVuUGF0aCA9IHBhdGgubm9ybWFsaXplKGdpdmVuUGF0aClcbiAgICAgICAgICAgIGlmIChnaXZlblBhdGguZW5kc1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2l2ZW5QYXRoLnN1YnN0cmluZygwLCBnaXZlblBhdGgubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgIHJldHVybiBnaXZlblBhdGhcbiAgICAgICAgfSkpKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZmlsZSBoYW5kbGVyXG4gICAgLyoqXG4gICAgICogQXBwbGllcyBmaWxlIHBhdGgvbmFtZSBwbGFjZWhvbGRlciByZXBsYWNlbWVudHMgd2l0aCBnaXZlbiBidW5kbGVcbiAgICAgKiBhc3NvY2lhdGVkIGluZm9ybWF0aW9ucy5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhUZW1wbGF0ZSAtIEZpbGUgcGF0aCB0byBwcm9jZXNzIHBsYWNlaG9sZGVyIGluLlxuICAgICAqIEBwYXJhbSBpbmZvcm1hdGlvbnMgLSBTY29wZSB0byB1c2UgZm9yIHByb2Nlc3NpbmcuXG4gICAgICogQHJldHVybnMgUHJvY2Vzc2VkIGZpbGUgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgZmlsZVBhdGhUZW1wbGF0ZTpzdHJpbmcsIGluZm9ybWF0aW9uczp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7XG4gICAgICAgICAgICAnW25hbWVdJzogJy5fX2R1bW15X18nLCAnW2lkXSc6ICcuX19kdW1teV9fJyxcbiAgICAgICAgICAgICdbaGFzaF0nOiAnLl9fZHVtbXlfXydcbiAgICAgICAgfVxuICAgICk6c3RyaW5nIHtcbiAgICAgICAgbGV0IGZpbGVQYXRoOnN0cmluZyA9IGZpbGVQYXRoVGVtcGxhdGVcbiAgICAgICAgZm9yIChjb25zdCBwbGFjZWhvbGRlck5hbWU6c3RyaW5nIGluIGluZm9ybWF0aW9ucylcbiAgICAgICAgICAgIGlmIChpbmZvcm1hdGlvbnMuaGFzT3duUHJvcGVydHkocGxhY2Vob2xkZXJOYW1lKSlcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKHBsYWNlaG9sZGVyTmFtZSksICdnJ1xuICAgICAgICAgICAgICAgICksIGluZm9ybWF0aW9uc1twbGFjZWhvbGRlck5hbWVdKVxuICAgICAgICByZXR1cm4gZmlsZVBhdGhcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZ2l2ZW4gcmVxdWVzdCB0byBhIHJlc29sdmVkIHJlcXVlc3Qgd2l0aCBnaXZlbiBjb250ZXh0XG4gICAgICogZW1iZWRkZWQuXG4gICAgICogQHBhcmFtIHJlcXVlc3QgLSBSZXF1ZXN0IHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIENvbnRleHQgb2YgZ2l2ZW4gcmVxdWVzdCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHJldHVybnMgQSBuZXcgcmVzb2x2ZWQgcmVxdWVzdC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlDb250ZXh0KFxuICAgICAgICByZXF1ZXN0OnN0cmluZywgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcuLycsXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSwgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddXG4gICAgKTpzdHJpbmcge1xuICAgICAgICByZWZlcmVuY2VQYXRoID0gcGF0aC5yZXNvbHZlKHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoJy4vJykgJiYgcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29udGV4dFxuICAgICAgICApICE9PSByZWZlcmVuY2VQYXRoKSB7XG4gICAgICAgICAgICByZXF1ZXN0ID0gcGF0aC5yZXNvbHZlKGNvbnRleHQsIHJlcXVlc3QpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZVBhdGg6c3RyaW5nIG9mIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aFByZWZpeDpzdHJpbmcgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsIG1vZHVsZVBhdGgpXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aChwYXRoUHJlZml4KSkge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcocGF0aFByZWZpeC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LnN1YnN0cmluZyhyZXF1ZXN0Lmxhc3RJbmRleE9mKCchJykgKyAxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgKSwgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgocmVmZXJlbmNlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcocmVmZXJlbmNlUGF0aC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3Quc3Vic3RyaW5nKHJlcXVlc3QubGFzdEluZGV4T2YoJyEnKSArIDEpLCBhbGlhc2VzXG4gICAgICAgICAgICAgICAgKSwgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXF1ZXN0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGdpdmVuIHJlcXVlc3QgcG9pbnRzIHRvIGFuIGV4dGVybmFsIGRlcGVuZGVuY3kgbm90IG1haW50YWluZWRcbiAgICAgKiBieSBjdXJyZW50IHBhY2thZ2UgY29udGV4dC5cbiAgICAgKiBAcGFyYW0gcmVxdWVzdCAtIFJlcXVlc3QgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gQ29udGV4dCBvZiBjdXJyZW50IHByb2plY3QuXG4gICAgICogQHBhcmFtIHJlcXVlc3RDb250ZXh0IC0gQ29udGV4dCBvZiBnaXZlbiByZXF1ZXN0IHRvIHJlc29sdmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiAtIE1hcHBpbmcgb2YgY2h1bmsgbmFtZXMgdG8gbW9kdWxlc1xuICAgICAqIHdoaWNoIHNob3VsZCBiZSBpbmplY3RlZC5cbiAgICAgKiBAcGFyYW0gZXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnMgLSBBcnJheSBpZiBwYXRocyB3aGVyZSBleHRlcm5hbCBtb2R1bGVzXG4gICAgICogdGFrZSBwbGFjZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gcmVzb2x2ZSBsb2NhbCBtb2R1bGVzIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocyAtIExpc3Qgb2YgcmVsYXRpdmUgZmlsZSBwYXRoIHRvIHNlYXJjaFxuICAgICAqIGZvciBtb2R1bGVzIGluLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlRW50cnlGaWxlTmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZW50cnkgZmlsZSBuYW1lcyB0b1xuICAgICAqIHNlYXJjaCBmb3IuIFRoZSBtYWdpYyBuYW1lIFwiX19wYWNrYWdlX19cIiB3aWxsIHNlYXJjaCBmb3IgYW4gYXBwcmVjaWF0ZVxuICAgICAqIGVudHJ5IGluIGEgXCJwYWNrYWdlLmpzb25cIiBmaWxlLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBtYWluIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHJlcHJlc2VudGluZyBlbnRyeSBtb2R1bGUgZGVmaW5pdGlvbnMuXG4gICAgICogQHBhcmFtIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBhbGlhcyBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSBzcGVjaWZpYyBtb2R1bGUgYWxpYXNlcy5cbiAgICAgKiBAcGFyYW0gaW5jbHVkZVBhdHRlcm4gLSBBcnJheSBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIGV4cGxpY2l0bHkgbWFya1xuICAgICAqIGFzIGV4dGVybmFsIGRlcGVuZGVuY3kuXG4gICAgICogQHBhcmFtIGV4Y2x1ZGVQYXR0ZXJuIC0gQXJyYXkgb2YgcmVndWxhciBleHByZXNzaW9ucyB0byBleHBsaWNpdGx5IG1hcmtcbiAgICAgKiBhcyBpbnRlcm5hbCBkZXBlbmRlbmN5LlxuICAgICAqIEBwYXJhbSBpblBsYWNlTm9ybWFsTGlicmFyeSAtIEluZGljYXRlcyB3aGV0aGVyIG5vcm1hbCBsaWJyYXJpZXMgc2hvdWxkXG4gICAgICogYmUgZXh0ZXJuYWwgb3Igbm90LlxuICAgICAqIEBwYXJhbSBpblBsYWNlRHluYW1pY0xpYnJhcnkgLSBJbmRpY2F0ZXMgd2hldGhlciByZXF1ZXN0cyB3aXRoXG4gICAgICogaW50ZWdyYXRlZCBsb2FkZXIgY29uZmlndXJhdGlvbnMgc2hvdWxkIGJlIG1hcmtlZCBhcyBleHRlcm5hbCBvciBub3QuXG4gICAgICogQHBhcmFtIGVuY29kaW5nIC0gRW5jb2RpbmcgZm9yIGZpbGUgbmFtZXMgdG8gdXNlIGR1cmluZyBmaWxlIHRyYXZlcnNpbmcuXG4gICAgICogQHJldHVybnMgQSBuZXcgcmVzb2x2ZWQgcmVxdWVzdCBpbmRpY2F0aW5nIHdoZXRoZXIgZ2l2ZW4gcmVxdWVzdCBpcyBhblxuICAgICAqIGV4dGVybmFsIG9uZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lRXh0ZXJuYWxSZXF1ZXN0KFxuICAgICAgICByZXF1ZXN0OnN0cmluZywgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZXF1ZXN0Q29udGV4dDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb246Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uID0ge30sXG4gICAgICAgIGV4dGVybmFsTW9kdWxlTG9jYXRpb25zOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddLFxuICAgICAgICBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBleHRlbnNpb25zOkV4dGVuc2lvbnMgPSB7XG4gICAgICAgICAgICBmaWxlOiB7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnLmpzJ10sXG4gICAgICAgICAgICAgICAgaW50ZXJuYWw6IFtcbiAgICAgICAgICAgICAgICAgICAgJy5qcycsICcuanNvbicsICcuY3NzJywgJy5lb3QnLCAnLmdpZicsICcuaHRtbCcsICcuaWNvJyxcbiAgICAgICAgICAgICAgICAgICAgJy5qcGcnLCAnLnBuZycsICcuZWpzJywgJy5zdmcnLCAnLnR0ZicsICcud29mZicsICcud29mZjInXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwgbW9kdWxlOiBbXVxuICAgICAgICB9LCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcuLycsIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ2luZGV4JywgJ21haW4nXSxcbiAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ21haW4nLCAnbW9kdWxlJ10sXG4gICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtdLFxuICAgICAgICBpbmNsdWRlUGF0dGVybjpBcnJheTxzdHJpbmd8UmVnRXhwPiA9IFtdLFxuICAgICAgICBleGNsdWRlUGF0dGVybjpBcnJheTxzdHJpbmd8UmVnRXhwPiA9IFtdLFxuICAgICAgICBpblBsYWNlTm9ybWFsTGlicmFyeTpib29sZWFuID0gZmFsc2UsXG4gICAgICAgIGluUGxhY2VEeW5hbWljTGlicmFyeTpib29sZWFuID0gdHJ1ZSxcbiAgICAgICAgZW5jb2Rpbmc6c3RyaW5nID0gJ3V0Zi04J1xuICAgICk6P3N0cmluZyB7XG4gICAgICAgIGNvbnRleHQgPSBwYXRoLnJlc29sdmUoY29udGV4dClcbiAgICAgICAgcmVxdWVzdENvbnRleHQgPSBwYXRoLnJlc29sdmUocmVxdWVzdENvbnRleHQpXG4gICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlc29sdmUocmVmZXJlbmNlUGF0aClcbiAgICAgICAgLy8gTk9URTogV2UgYXBwbHkgYWxpYXMgb24gZXh0ZXJuYWxzIGFkZGl0aW9uYWxseS5cbiAgICAgICAgbGV0IHJlc29sdmVkUmVxdWVzdDpzdHJpbmcgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKHJlcXVlc3Quc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgIHJlcXVlc3QubGFzdEluZGV4T2YoJyEnKSArIDFcbiAgICAgICAgICAgICksIGFsaWFzZXMpLCBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBBbGlhc2VzIGFuZCBtb2R1bGUgcmVwbGFjZW1lbnRzIGRvZXNuJ3QgaGF2ZSB0byBiZSBmb3J3YXJkZWRcbiAgICAgICAgICAgIHNpbmNlIHdlIHBhc3MgYW4gYWxyZWFkeSByZXNvbHZlZCByZXF1ZXN0LlxuICAgICAgICAqL1xuICAgICAgICBsZXQgZmlsZVBhdGg6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCwge30sIHt9LCBleHRlbnNpb25zLCBjb250ZXh0LCByZXF1ZXN0Q29udGV4dCxcbiAgICAgICAgICAgIHBhdGhzVG9JZ25vcmUsIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzLCBwYWNrYWdlRW50cnlGaWxlTmFtZXMsXG4gICAgICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMsIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMsIGVuY29kaW5nKVxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgbWFyayBkZXBlbmRlbmNpZXMgYXMgZXh0ZXJuYWwgaWYgdGhlcmUgZmlsZSBjb3VsZG4ndCBiZVxuICAgICAgICAgICAgcmVzb2x2ZWQgb3IgYXJlIHNwZWNpZmllZCB0byBiZSBleHRlcm5hbCBleHBsaWNpdGx5LlxuICAgICAgICAqL1xuICAgICAgICBpZiAoIShmaWxlUGF0aCB8fCBpblBsYWNlTm9ybWFsTGlicmFyeSkgfHwgVG9vbHMuaXNBbnlNYXRjaGluZyhcbiAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCwgaW5jbHVkZVBhdHRlcm5cbiAgICAgICAgKSlcbiAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlDb250ZXh0KFxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCwgcmVxdWVzdENvbnRleHQsIHJlZmVyZW5jZVBhdGgsXG4gICAgICAgICAgICAgICAgYWxpYXNlcywgbW9kdWxlUmVwbGFjZW1lbnRzLCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocylcbiAgICAgICAgaWYgKFRvb2xzLmlzQW55TWF0Y2hpbmcocmVzb2x2ZWRSZXF1ZXN0LCBleGNsdWRlUGF0dGVybikpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELCBhbGlhc2VzLCBtb2R1bGVSZXBsYWNlbWVudHMsIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCByZXF1ZXN0Q29udGV4dCwgcGF0aHNUb0lnbm9yZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzLCBwYWNrYWdlRW50cnlGaWxlTmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMsIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZ1xuICAgICAgICAgICAgICAgICAgICApID09PSBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBtYXJrIGRlcGVuZGVuY2llcyBhcyBleHRlcm5hbCBpZiB0aGV5IGRvZXMgbm90IGNvbnRhaW4gYVxuICAgICAgICAgICAgbG9hZGVyIGluIHRoZWlyIHJlcXVlc3QgYW5kIGFyZW4ndCBwYXJ0IG9mIHRoZSBjdXJyZW50IG1haW4gcGFja2FnZVxuICAgICAgICAgICAgb3IgaGF2ZSBhIGZpbGUgZXh0ZW5zaW9uIG90aGVyIHRoYW4gamF2YVNjcmlwdCBhd2FyZS5cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKCFpblBsYWNlTm9ybWFsTGlicmFyeSAmJiAoXG4gICAgICAgICAgICBleHRlbnNpb25zLmZpbGUuZXh0ZXJuYWwubGVuZ3RoID09PSAwIHx8IGZpbGVQYXRoICYmXG4gICAgICAgICAgICBleHRlbnNpb25zLmZpbGUuZXh0ZXJuYWwuaW5jbHVkZXMocGF0aC5leHRuYW1lKGZpbGVQYXRoKSkgfHxcbiAgICAgICAgICAgICFmaWxlUGF0aCAmJiBleHRlbnNpb25zLmZpbGUuZXh0ZXJuYWwuaW5jbHVkZXMoJycpXG4gICAgICAgICkgJiYgIShpblBsYWNlRHluYW1pY0xpYnJhcnkgJiYgcmVxdWVzdC5pbmNsdWRlcygnIScpKSAmJiAoXG4gICAgICAgICAgICAgICAgIWZpbGVQYXRoICYmIGluUGxhY2VEeW5hbWljTGlicmFyeSB8fCBmaWxlUGF0aCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICFmaWxlUGF0aC5zdGFydHNXaXRoKGNvbnRleHQpIHx8XG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCBleHRlcm5hbE1vZHVsZUxvY2F0aW9ucykpXG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlDb250ZXh0KFxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCwgcmVxdWVzdENvbnRleHQsIHJlZmVyZW5jZVBhdGgsIGFsaWFzZXMsXG4gICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzLCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocylcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhc3NldCB0eXBlIG9mIGdpdmVuIGZpbGUuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIC0gUGF0aCB0byBmaWxlIHRvIGFuYWx5c2UuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbiAtIE1ldGEgaW5mb3JtYXRpb25zIGZvciBhdmFpbGFibGUgYXNzZXRcbiAgICAgKiB0eXBlcy5cbiAgICAgKiBAcGFyYW0gcGF0aHMgLSBMaXN0IG9mIHBhdGhzIHRvIHNlYXJjaCBpZiBnaXZlbiBwYXRoIGRvZXNuJ3QgcmVmZXJlbmNlXG4gICAgICogYSBmaWxlIGRpcmVjdGx5LlxuICAgICAqIEByZXR1cm5zIERldGVybWluZWQgZmlsZSB0eXBlIG9yIFwibnVsbFwiIG9mIGdpdmVuIGZpbGUgY291bGRuJ3QgYmVcbiAgICAgKiBkZXRlcm1pbmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgIGZpbGVQYXRoOnN0cmluZywgYnVpbGRDb25maWd1cmF0aW9uOkJ1aWxkQ29uZmlndXJhdGlvbiwgcGF0aHM6UGF0aFxuICAgICk6P3N0cmluZyB7XG4gICAgICAgIGxldCByZXN1bHQ6P3N0cmluZyA9IG51bGxcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiBidWlsZENvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoXG4gICAgICAgICAgICApID09PSBgLiR7YnVpbGRDb25maWd1cmF0aW9uW3R5cGVdLmV4dGVuc2lvbn1gKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHlwZVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIGlmICghcmVzdWx0KVxuICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ3NvdXJjZScsICd0YXJnZXQnXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0VHlwZTpzdHJpbmcgaW4gcGF0aHNbdHlwZV0uYXNzZXQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzW3R5cGVdLmFzc2V0Lmhhc093blByb3BlcnR5KGFzc2V0VHlwZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZSAhPT0gJ2Jhc2UnICYmIHBhdGhzW3R5cGVdLmFzc2V0W2Fzc2V0VHlwZV0gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLnN0YXJ0c1dpdGgocGF0aHNbdHlwZV0uYXNzZXRbYXNzZXRUeXBlXSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0VHlwZVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBwcm9wZXJ0eSB3aXRoIGEgc3RvcmVkIGFycmF5IG9mIGFsbCBtYXRjaGluZyBmaWxlIHBhdGhzLCB3aGljaFxuICAgICAqIG1hdGNoZXMgZWFjaCBidWlsZCBjb25maWd1cmF0aW9uIGluIGdpdmVuIGVudHJ5IHBhdGggYW5kIGNvbnZlcnRzIGdpdmVuXG4gICAgICogYnVpbGQgY29uZmlndXJhdGlvbiBpbnRvIGEgc29ydGVkIGFycmF5IHdlcmUgamF2YVNjcmlwdCBmaWxlcyB0YWtlc1xuICAgICAqIHByZWNlZGVuY2UuXG4gICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb24gLSBHaXZlbiBidWlsZCBjb25maWd1cmF0aW9ucy5cbiAgICAgKiBAcGFyYW0gZW50cnlQYXRoIC0gUGF0aCB0byBhbmFseXNlIG5lc3RlZCBzdHJ1Y3R1cmUuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIG1haW5GaWxlQmFzZW5hbWVzIC0gRmlsZSBiYXNlbmFtZXMgdG8gc29ydCBpbnRvIHRoZSBmcm9udC5cbiAgICAgKiBAcmV0dXJucyBDb252ZXJ0ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZUJ1aWxkQ29uZmlndXJhdGlvbkZpbGVQYXRocyhcbiAgICAgICAgY29uZmlndXJhdGlvbjpCdWlsZENvbmZpZ3VyYXRpb24sIGVudHJ5UGF0aDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgbWFpbkZpbGVCYXNlbmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnaW5kZXgnLCAnbWFpbiddXG4gICAgKTpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiB7XG4gICAgICAgIGNvbnN0IGJ1aWxkQ29uZmlndXJhdGlvbjpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiA9IFtdXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbilcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbTpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0gPVxuICAgICAgICAgICAgICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge2ZpbGVQYXRoczogW119LCBjb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZV0pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlOkZpbGUgb2YgVG9vbHMud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhcbiAgICAgICAgICAgICAgICAgICAgZW50cnlQYXRoLCAoZmlsZTpGaWxlKTo/ZmFsc2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnBhdGgsIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXRzICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXRzLmlzRmlsZSgpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmV4dG5hbWUoZmlsZS5wYXRoKS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICAgICAgKSA9PT0gbmV3SXRlbS5leHRlbnNpb24gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICEobmV3IFJlZ0V4cChuZXdJdGVtLmZpbGVQYXRoUGF0dGVybikpLnRlc3QoZmlsZS5wYXRoKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtLmZpbGVQYXRocy5wdXNoKGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICBuZXdJdGVtLmZpbGVQYXRocy5zb3J0KChcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RGaWxlUGF0aDpzdHJpbmcsIHNlY29uZEZpbGVQYXRoOnN0cmluZ1xuICAgICAgICAgICAgICAgICk6bnVtYmVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1haW5GaWxlQmFzZW5hbWVzLmluY2x1ZGVzKHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdEZpbGVQYXRoLCBwYXRoLmV4dG5hbWUoZmlyc3RGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYWluRmlsZUJhc2VuYW1lcy5pbmNsdWRlcyhwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZEZpbGVQYXRoLCBwYXRoLmV4dG5hbWUoc2Vjb25kRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1haW5GaWxlQmFzZW5hbWVzLmluY2x1ZGVzKHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRGaWxlUGF0aCwgcGF0aC5leHRuYW1lKHNlY29uZEZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ucHVzaChuZXdJdGVtKVxuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnVpbGRDb25maWd1cmF0aW9uLnNvcnQoKFxuICAgICAgICAgICAgZmlyc3Q6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtLFxuICAgICAgICAgICAgc2Vjb25kOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbVxuICAgICAgICApOm51bWJlciA9PiB7XG4gICAgICAgICAgICBpZiAoZmlyc3Qub3V0cHV0RXh0ZW5zaW9uICE9PSBzZWNvbmQub3V0cHV0RXh0ZW5zaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Lm91dHB1dEV4dGVuc2lvbiA9PT0gJ2pzJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgaWYgKHNlY29uZC5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpcnN0Lm91dHB1dEV4dGVuc2lvbiA8IHNlY29uZC5vdXRwdXRFeHRlbnNpb24gPyAtMSA6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIGZpbGUgYW5kIGRpcmVjdG9yeSBwYXRocyByZWxhdGVkIHRvIGdpdmVuIGludGVybmFsXG4gICAgICogbW9kdWxlcyBhcyBhcnJheS5cbiAgICAgKiBAcGFyYW0gaW50ZXJuYWxJbmplY3Rpb24gLSBMaXN0IG9mIG1vZHVsZSBpZHMgb3IgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgbW9kdWxlIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHJlc29sdmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHNlYXJjaCBmb3IgbG9jYWwgbW9kdWxlcy5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMgLSBMaXN0IG9mIHJlbGF0aXZlIGZpbGUgcGF0aCB0byBzZWFyY2hcbiAgICAgKiBmb3IgbW9kdWxlcyBpbi5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUVudHJ5RmlsZU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGVudHJ5IGZpbGUgbmFtZXMgdG9cbiAgICAgKiBzZWFyY2ggZm9yLiBUaGUgbWFnaWMgbmFtZSBcIl9fcGFja2FnZV9fXCIgd2lsbCBzZWFyY2ggZm9yIGFuIGFwcHJlY2lhdGVcbiAgICAgKiBlbnRyeSBpbiBhIFwicGFja2FnZS5qc29uXCIgZmlsZS5cbiAgICAgKiBAcGFyYW0gcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgbWFpbiBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSByZXByZXNlbnRpbmcgZW50cnkgbW9kdWxlIGRlZmluaXRpb25zLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgYWxpYXMgcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2Ugc3BlY2lmaWMgbW9kdWxlIGFsaWFzZXMuXG4gICAgICogQHBhcmFtIGVuY29kaW5nIC0gRmlsZSBuYW1lIGVuY29kaW5nIHRvIHVzZSBkdXJpbmcgZmlsZSB0cmF2ZXJzaW5nLlxuICAgICAqIEByZXR1cm5zIE9iamVjdCB3aXRoIGEgZmlsZSBwYXRoIGFuZCBkaXJlY3RvcnkgcGF0aCBrZXkgbWFwcGluZyB0b1xuICAgICAqIGNvcnJlc3BvbmRpbmcgbGlzdCBvZiBwYXRocy5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICBpbnRlcm5hbEluamVjdGlvbjpJbnRlcm5hbEluamVjdGlvbiwgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSwgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5qcyddLFxuICAgICAgICAgICAgICAgIGludGVybmFsOiBbXG4gICAgICAgICAgICAgICAgICAgICcuanMnLCAnLmpzb24nLCAnLmNzcycsICcuZW90JywgJy5naWYnLCAnLmh0bWwnLCAnLmljbycsXG4gICAgICAgICAgICAgICAgICAgICcuanBnJywgJy5wbmcnLCAnLmVqcycsICcuc3ZnJywgJy50dGYnLCAnLndvZmYnLCAnLndvZmYyJ1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIG1vZHVsZTogW11cbiAgICAgICAgfSwgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFsnJywgJ25vZGVfbW9kdWxlcycsICcuLi8nXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnX19wYWNrYWdlX18nLCAnJywgJ2luZGV4JywgJ21haW4nXSxcbiAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ21haW4nLCAnbW9kdWxlJ10sXG4gICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtdLFxuICAgICAgICBlbmNvZGluZzpzdHJpbmcgPSAndXRmLTgnXG4gICAgKTp7ZmlsZVBhdGhzOkFycmF5PHN0cmluZz47ZGlyZWN0b3J5UGF0aHM6QXJyYXk8c3RyaW5nPn0ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGhzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb25zdCBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb246Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uID1cbiAgICAgICAgICAgIEhlbHBlci5yZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgICAgICAgICBIZWxwZXIubm9ybWFsaXplSW50ZXJuYWxJbmplY3Rpb24oaW50ZXJuYWxJbmplY3Rpb24pLFxuICAgICAgICAgICAgICAgIGFsaWFzZXMsIG1vZHVsZVJlcGxhY2VtZW50cywgY29udGV4dCwgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICBwYXRoc1RvSWdub3JlKVxuICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgXSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQsIGFsaWFzZXMsIG1vZHVsZVJlcGxhY2VtZW50cywgZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIHJlZmVyZW5jZVBhdGgsIHBhdGhzVG9JZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocywgcGFja2FnZUVudHJ5RmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzLCBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RpbmcpXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoOnN0cmluZyA9IHBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGlyZWN0b3J5UGF0aHMuaW5jbHVkZXMoZGlyZWN0b3J5UGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5UGF0aHMucHVzaChkaXJlY3RvcnlQYXRoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2ZpbGVQYXRocywgZGlyZWN0b3J5UGF0aHN9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBsaXN0IG9mIGNvbmNyZXRlIGZpbGUgcGF0aHMgZm9yIGdpdmVuIG1vZHVsZSBpZCBwb2ludGluZyB0b1xuICAgICAqIGEgZm9sZGVyIHdoaWNoIGlzbid0IGEgcGFja2FnZS5cbiAgICAgKiBAcGFyYW0gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uIC0gSW5qZWN0aW9uIGRhdGEgc3RydWN0dXJlIG9mXG4gICAgICogbW9kdWxlcyB3aXRoIGZvbGRlciByZWZlcmVuY2VzIHRvIHJlc29sdmUuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gZGV0ZXJtaW5lIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9ucyB3aXRoIHJlc29sdmVkIGZvbGRlciBwb2ludGluZyBtb2R1bGVzLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbixcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LCBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXVxuICAgICk6Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uIHtcbiAgICAgICAgaWYgKHJlZmVyZW5jZVBhdGguc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCA9IHBhdGgucmVsYXRpdmUoY29udGV4dCwgcmVmZXJlbmNlUGF0aClcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSkge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbW9kdWxlSUQ6c3RyaW5nIG9mIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgXSkge1xuICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMoSGVscGVyLnN0cmlwTG9hZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlEXG4gICAgICAgICAgICAgICAgICAgICAgICApLCBhbGlhc2VzKSwgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNvbHZlZFBhdGg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgbW9kdWxlSUQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMocmVzb2x2ZWRQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV0uc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlOkZpbGUgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKHJlc29sdmVkUGF0aCwgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOkZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOj9mYWxzZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnBhdGgsIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuc3RhdHMgJiYgZmlsZS5zdGF0cy5pc0ZpbGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV0ucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcuLycgKyBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsIHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRQYXRoLCBmaWxlLnBhdGgpKSlcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELnN0YXJ0c1dpdGgoJy4vJykgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFtb2R1bGVJRC5zdGFydHNXaXRoKCcuLycgKyBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIHJlZmVyZW5jZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdW2luZGV4XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYC4vJHtwYXRoLnJlbGF0aXZlKGNvbnRleHQsIHJlc29sdmVkUGF0aCl9YFxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uXG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV2ZXJ5IGluamVjdGlvbiBkZWZpbml0aW9uIHR5cGUgY2FuIGJlIHJlcHJlc2VudGVkIGFzIHBsYWluIG9iamVjdFxuICAgICAqIChtYXBwaW5nIGZyb20gY2h1bmsgbmFtZSB0byBhcnJheSBvZiBtb2R1bGUgaWRzKS4gVGhpcyBtZXRob2QgY29udmVydHNcbiAgICAgKiBlYWNoIHJlcHJlc2VudGF0aW9uIGludG8gdGhlIG5vcm1hbGl6ZWQgcGxhaW4gb2JqZWN0IG5vdGF0aW9uLlxuICAgICAqIEBwYXJhbSBpbnRlcm5hbEluamVjdGlvbiAtIEdpdmVuIGludGVybmFsIGluamVjdGlvbiB0byBub3JtYWxpemUuXG4gICAgICogQHJldHVybnMgTm9ybWFsaXplZCByZXByZXNlbnRhdGlvbiBvZiBnaXZlbiBpbnRlcm5hbCBpbmplY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIG5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKFxuICAgICAgICBpbnRlcm5hbEluamVjdGlvbjpJbnRlcm5hbEluamVjdGlvblxuICAgICk6Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uIHtcbiAgICAgICAgbGV0IHJlc3VsdDpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gPSB7fVxuICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb24gaW5zdGFuY2VvZiBPYmplY3QgJiYgVG9vbHMuaXNQbGFpbk9iamVjdChcbiAgICAgICAgICAgIGludGVybmFsSW5qZWN0aW9uXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIGxldCBoYXNDb250ZW50OmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICAgICAgY29uc3QgY2h1bmtOYW1lc1RvRGVsZXRlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbEluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjaHVua05hbWVdID0gaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lc1RvRGVsZXRlLnB1c2goY2h1bmtOYW1lKVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY2h1bmtOYW1lXSA9IFtpbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGFzQ29udGVudClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgb2YgY2h1bmtOYW1lc1RvRGVsZXRlKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0W2NodW5rTmFtZV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IFtdfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnRlcm5hbEluamVjdGlvbiA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IFtpbnRlcm5hbEluamVjdGlvbl19XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaW50ZXJuYWxJbmplY3Rpb24pKVxuICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBpbnRlcm5hbEluamVjdGlvbn1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBjb25jcmV0ZSBmaWxlIHBhdGhzIGZvciBnaXZlbiBpbmplY3Rpb24gd2hpY2ggYXJlIG1hcmtlZFxuICAgICAqIHdpdGggdGhlIFwiX19hdXRvX19cIiBpbmRpY2F0b3IuXG4gICAgICogQHBhcmFtIGdpdmVuSW5qZWN0aW9uIC0gR2l2ZW4gaW50ZXJuYWwgYW5kIGV4dGVybmFsIGluamVjdGlvbiB0byB0YWtlXG4gICAgICogaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb25zIC0gUmVzb2x2ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gbW9kdWxlc1RvRXhjbHVkZSAtIEEgbGlzdCBvZiBtb2R1bGVzIHRvIGV4Y2x1ZGUgKHNwZWNpZmllZCBieVxuICAgICAqIHBhdGggb3IgaWQpIG9yIGEgbWFwcGluZyBmcm9tIGNodW5rIG5hbWVzIHRvIG1vZHVsZSBpZHMuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbnMgLSBMaXN0IG9mIGZpbGUgYW5kIG1vZHVsZSBleHRlbnNpb25zIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gdXNlIGFzIHN0YXJ0aW5nIHBvaW50LlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUmVmZXJlbmNlIHBhdGggZnJvbSB3aGVyZSBsb2NhbCBmaWxlcyBzaG91bGQgYmVcbiAgICAgKiByZXNvbHZlZC5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBpbmplY3Rpb24gd2l0aCByZXNvbHZlZCBtYXJrZWQgaW5kaWNhdG9ycy5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZUluamVjdGlvbihcbiAgICAgICAgZ2l2ZW5JbmplY3Rpb246SW5qZWN0aW9uLFxuICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uLFxuICAgICAgICBtb2R1bGVzVG9FeGNsdWRlOkludGVybmFsSW5qZWN0aW9uLFxuICAgICAgICBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBleHRlbnNpb25zOkV4dGVuc2lvbnMgPSB7XG4gICAgICAgICAgICBmaWxlOiB7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnLmpzJ10sXG4gICAgICAgICAgICAgICAgaW50ZXJuYWw6IFtcbiAgICAgICAgICAgICAgICAgICAgJy5qcycsICcuanNvbicsICcuY3NzJywgJy5lb3QnLCAnLmdpZicsICcuaHRtbCcsICcuaWNvJyxcbiAgICAgICAgICAgICAgICAgICAgJy5qcGcnLCAnLnBuZycsICcuZWpzJywgJy5zdmcnLCAnLnR0ZicsICcud29mZicsICcud29mZjInXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwgbW9kdWxlOiBbXVxuICAgICAgICB9LCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddXG4gICAgKTpJbmplY3Rpb24ge1xuICAgICAgICBjb25zdCBpbmplY3Rpb246SW5qZWN0aW9uID0gVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgdHJ1ZSwge30sIGdpdmVuSW5qZWN0aW9uKVxuICAgICAgICBjb25zdCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGU6QXJyYXk8c3RyaW5nPiA9XG4gICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICAgICAgICAgIG1vZHVsZXNUb0V4Y2x1ZGUsIGFsaWFzZXMsIG1vZHVsZVJlcGxhY2VtZW50cywgZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICBjb250ZXh0LCByZWZlcmVuY2VQYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICApLmZpbGVQYXRoc1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnaW50ZXJuYWwnLCAnZXh0ZXJuYWwnXSlcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGN1cmx5ICovXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluamVjdGlvblt0eXBlXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gaW5qZWN0aW9uW3R5cGVdKVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0gPT09ICdfX2F1dG9fXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZXM6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtrZXk6c3RyaW5nXTpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnMsIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJDaHVua05hbWU6c3RyaW5nIGluIG1vZHVsZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZHVsZXMuaGFzT3duUHJvcGVydHkoc3ViQ2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0ucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZXNbc3ViQ2h1bmtOYW1lXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmV2ZXJzZSBhcnJheSB0byBsZXQgamF2YVNjcmlwdCBhbmQgbWFpbiBmaWxlcyBiZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBsYXN0IG9uZXMgdG8gZXhwb3J0IHRoZW0gcmF0aGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnJldmVyc2UoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluamVjdGlvblt0eXBlXSA9PT0gJ19fYXV0b19fJylcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgY3VybHkgKi9cbiAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV0gPSBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zLCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsIGNvbnRleHQpXG4gICAgICAgIHJldHVybiBpbmplY3Rpb25cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbnMgLSBSZXNvbHZlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqIEBwYXJhbSBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyBmaWxlIHBhdGhzIHRvXG4gICAgICogZXhjbHVkZSAoc3BlY2lmaWVkIGJ5IHBhdGggb3IgaWQpIG9yIGEgbWFwcGluZyBmcm9tIGNodW5rIG5hbWVzIHRvXG4gICAgICogbW9kdWxlIGlkcy5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byB1c2UgYXMgc3RhcnRpbmcgcG9pbnQuXG4gICAgICogQHJldHVybnMgQWxsIGRldGVybWluZWQgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGdldEF1dG9DaHVuayhcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlOkFycmF5PHN0cmluZz4sIGNvbnRleHQ6c3RyaW5nXG4gICAgKTp7W2tleTpzdHJpbmddOnN0cmluZ30ge1xuICAgICAgICBjb25zdCByZXN1bHQ6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge31cbiAgICAgICAgY29uc3QgaW5qZWN0ZWRNb2R1bGVJRHM6e1trZXk6c3RyaW5nXTpBcnJheTxzdHJpbmc+fSA9IHt9XG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtIG9mXG4gICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zXG4gICAgICAgICkge1xuICAgICAgICAgICAgaWYgKCFpbmplY3RlZE1vZHVsZUlEc1tidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXSlcbiAgICAgICAgICAgICAgICBpbmplY3RlZE1vZHVsZUlEc1tidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXSA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUZpbGVQYXRoOnN0cmluZyBvZiBidWlsZENvbmZpZ3VyYXRpb24uZmlsZVBhdGhzKVxuICAgICAgICAgICAgICAgIGlmICghbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLmluY2x1ZGVzKG1vZHVsZUZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoOnN0cmluZyA9ICcuLycgKyBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGg6c3RyaW5nID0gcGF0aC5kaXJuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFzZU5hbWU6c3RyaW5nID0gcGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBgLiR7YnVpbGRDb25maWd1cmF0aW9uLmV4dGVuc2lvbn1gKVxuICAgICAgICAgICAgICAgICAgICBsZXQgbW9kdWxlSUQ6c3RyaW5nID0gYmFzZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpcmVjdG9yeVBhdGggIT09ICcuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gcGF0aC5qb2luKGRpcmVjdG9yeVBhdGgsIGJhc2VOYW1lKVxuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgRW5zdXJlIHRoYXQgZWFjaCBvdXRwdXQgdHlwZSBoYXMgb25seSBvbmUgc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmplY3RlZE1vZHVsZUlEc1tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgXS5pbmNsdWRlcyhtb2R1bGVJRCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRW5zdXJlIHRoYXQgc2FtZSBtb2R1bGUgaWRzIGFuZCBkaWZmZXJlbnQgb3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZXMgY2FuIGJlIGRpc3Rpbmd1aXNoZWQgYnkgdGhlaXIgZXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKEphdmFTY3JpcHQtTW9kdWxlcyByZW1haW5zIHdpdGhvdXQgZXh0ZW5zaW9uIHNpbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhleSB3aWxsIGJlIGhhbmRsZWQgZmlyc3QgYmVjYXVzZSB0aGUgYnVpbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyBhcmUgZXhwZWN0ZWQgdG8gYmUgc29ydGVkIGluIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0KS5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmhhc093blByb3BlcnR5KG1vZHVsZUlEKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcmVsYXRpdmVNb2R1bGVGaWxlUGF0aF0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W21vZHVsZUlEXSA9IHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGVkTW9kdWxlSURzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIF0ucHVzaChtb2R1bGVJRClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBjb25jcmV0ZSBmaWxlIHBhdGggZm9yIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgaWQgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIGRldGVybWluZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gcmVzb2x2ZSBsb2NhbCBtb2R1bGVzIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocyAtIExpc3Qgb2YgcmVsYXRpdmUgZmlsZSBwYXRoIHRvIHNlYXJjaFxuICAgICAqIGZvciBtb2R1bGVzIGluLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlRW50cnlGaWxlTmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZW50cnkgZmlsZSBuYW1lcyB0b1xuICAgICAqIHNlYXJjaCBmb3IuIFRoZSBtYWdpYyBuYW1lIFwiX19wYWNrYWdlX19cIiB3aWxsIHNlYXJjaCBmb3IgYW4gYXBwcmVjaWF0ZVxuICAgICAqIGVudHJ5IGluIGEgXCJwYWNrYWdlLmpzb25cIiBmaWxlLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBtYWluIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHJlcHJlc2VudGluZyBlbnRyeSBtb2R1bGUgZGVmaW5pdGlvbnMuXG4gICAgICogQHBhcmFtIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBhbGlhcyBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSBzcGVjaWZpYyBtb2R1bGUgYWxpYXNlcy5cbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgLSBFbmNvZGluZyB0byB1c2UgZm9yIGZpbGUgbmFtZXMgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBGaWxlIHBhdGggb3IgZ2l2ZW4gbW9kdWxlIGlkIGlmIGRldGVybWluYXRpb25zIGhhcyBmYWlsZWQgb3JcbiAgICAgKiB3YXNuJ3QgbmVjZXNzYXJ5LlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgbW9kdWxlSUQ6c3RyaW5nLCBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LCBleHRlbnNpb25zOkV4dGVuc2lvbnMgPSB7XG4gICAgICAgICAgICBmaWxlOiB7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnLmpzJ10sXG4gICAgICAgICAgICAgICAgaW50ZXJuYWw6IFtcbiAgICAgICAgICAgICAgICAgICAgJy5qcycsICcuanNvbicsICcuY3NzJywgJy5lb3QnLCAnLmdpZicsICcuaHRtbCcsICcuaWNvJyxcbiAgICAgICAgICAgICAgICAgICAgJy5qcGcnLCAnLnBuZycsICcuZWpzJywgJy5zdmcnLCAnLnR0ZicsICcud29mZicsICcud29mZjInXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwgbW9kdWxlOiBbXVxuICAgICAgICB9LCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ2luZGV4J10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJ10sXG4gICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtdLFxuICAgICAgICBlbmNvZGluZzpzdHJpbmcgPSAndXRmLTgnXG4gICAgKTo/c3RyaW5nIHtcbiAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgIEhlbHBlci5zdHJpcExvYWRlcihtb2R1bGVJRCksIGFsaWFzZXNcbiAgICAgICAgKSwgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICBpZiAoIW1vZHVsZUlEKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgbGV0IG1vZHVsZUZpbGVQYXRoOnN0cmluZyA9IG1vZHVsZUlEXG4gICAgICAgIGlmIChtb2R1bGVGaWxlUGF0aC5zdGFydHNXaXRoKCcuLycpKVxuICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGggPSBwYXRoLmpvaW4ocmVmZXJlbmNlUGF0aCwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgIGZvciAoY29uc3QgbW9kdWxlTG9jYXRpb246c3RyaW5nIG9mIFtyZWZlcmVuY2VQYXRoXS5jb25jYXQoXG4gICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocy5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQsIGZpbGVQYXRoKSlcbiAgICAgICAgKSlcbiAgICAgICAgICAgIGZvciAobGV0IGZpbGVOYW1lOnN0cmluZyBvZiBbJycsICdfX3BhY2thZ2VfXyddLmNvbmNhdChcbiAgICAgICAgICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXNcbiAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVFeHRlbnNpb246c3RyaW5nIG9mIGV4dGVuc2lvbnMubW9kdWxlLmNvbmNhdChbXG4gICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZUV4dGVuc2lvbjpzdHJpbmcgb2YgWycnXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLmZpbGUuaW50ZXJuYWxcbiAgICAgICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRNb2R1bGVGaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGVGaWxlUGF0aC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUxvY2F0aW9uLCBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWNrYWdlQWxpYXNlczpQbGFpbk9iamVjdCA9IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUgPT09ICdfX3BhY2thZ2VfXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhUb1BhY2thZ2VKU09OOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCwgJ3BhY2thZ2UuanNvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKHBhdGhUb1BhY2thZ2VKU09OKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvY2FsQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFRvUGFja2FnZUpTT04sIHtlbmNvZGluZ30pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5TmFtZTpzdHJpbmcgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICYmIHR5cGVvZiBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uW3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWU6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdID09PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlQWxpYXNlcyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUgPT09ICdfX3BhY2thZ2VfXycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKGZpbGVOYW1lLCBwYWNrYWdlQWxpYXNlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtmaWxlTmFtZX0ke21vZHVsZUV4dGVuc2lvbn0ke2ZpbGVFeHRlbnNpb259YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGggKz1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7ZmlsZU5hbWV9JHttb2R1bGVFeHRlbnNpb259JHtmaWxlRXh0ZW5zaW9ufWBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhjdXJyZW50TW9kdWxlRmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50TW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBUaGUgYWxpYXMgYXBwbGllZCBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICovXG4gICAgc3RhdGljIGFwcGx5QWxpYXNlcyhtb2R1bGVJRDpzdHJpbmcsIGFsaWFzZXM6UGxhaW5PYmplY3QpOnN0cmluZyB7XG4gICAgICAgIGZvciAoY29uc3QgYWxpYXM6c3RyaW5nIGluIGFsaWFzZXMpXG4gICAgICAgICAgICBpZiAoYWxpYXMuZW5kc1dpdGgoJyQnKSkge1xuICAgICAgICAgICAgICAgIGlmIChtb2R1bGVJRCA9PT0gYWxpYXMuc3Vic3RyaW5nKDAsIGFsaWFzLmxlbmd0aCAtIDEpKVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IGFsaWFzZXNbYWxpYXNdXG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnJlcGxhY2UoYWxpYXMsIGFsaWFzZXNbYWxpYXNdKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIHJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVndWxhciBleHByZXNzaW9ucyB0byB0aGVpclxuICAgICAqIGNvcnJlc3BvbmRpbmcgcmVwbGFjZW1lbnRzLlxuICAgICAqIEByZXR1cm5zIFRoZSByZXBsYWNlbWVudCBhcHBsaWVkIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgIG1vZHVsZUlEOnN0cmluZywgcmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0XG4gICAgKTpzdHJpbmcge1xuICAgICAgICBmb3IgKGNvbnN0IHJlcGxhY2VtZW50OnN0cmluZyBpbiByZXBsYWNlbWVudHMpXG4gICAgICAgICAgICBpZiAocmVwbGFjZW1lbnRzLmhhc093blByb3BlcnR5KHJlcGxhY2VtZW50KSlcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAocmVwbGFjZW1lbnQpLCByZXBsYWNlbWVudHNbcmVwbGFjZW1lbnRdKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBIZWxwZXJcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=