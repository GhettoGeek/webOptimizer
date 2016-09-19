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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _child_process = require('child_process');

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}

// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
var Helper = function () {
    function Helper() {
        _classCallCheck(this, Helper);
    }

    _createClass(Helper, null, [{
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
                for (var _iterator = locationsToCheck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var pathToCheck = _step.value;

                    if (_path2.default.resolve(filePath).startsWith(_path2.default.resolve(pathToCheck))) return true;
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
            return Array.from(new Set(paths.map(function (givenPath) {
                givenPath = _path2.default.normalize(givenPath);
                if (givenPath.endsWith('/')) return givenPath.substring(0, givenPath.length - 1);
                return givenPath;
            })));
        }
        // endregion
        // region data
        /**
         * Converts given serialized, base64 encoded or file path given object into
         * a native javaScript one if possible.
         * @param serializedObject - Object as string.
         * @param scope - An optional scope which will be used to evaluate given
         * object in.
         * @param name - The name under given scope will be available.
         * @returns The parsed object if possible and null otherwise.
         */

    }, {
        key: 'parseEncodedObject',
        value: function parseEncodedObject(serializedObject) {
            var scope = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var name = arguments.length <= 2 || arguments[2] === undefined ? 'scope' : arguments[2];

            if (serializedObject.endsWith('.json') && Helper.isFileSync(serializedObject)) serializedObject = fileSystem.readFileSync(serializedObject, {
                encoding: 'utf-8' });
            if (!serializedObject.startsWith('{')) serializedObject = Buffer.from(serializedObject, 'base64').toString('utf8');
            try {
                // IgnoreTypeCheck
                return new Function(name, 'return ' + serializedObject)(scope);
            } catch (error) {}
            return null;
        }
        // endregion
        // region process handler
        /**
         * Generates a one shot close handler which triggers given promise methods.
         * If a reason is provided it will be given as resolve target. An Error
         * will be generated if return code is not zero. The generated Error has
         * a property "returnCode" which provides corresponding process return
         * code.
         * @param resolve - Promise's resolve function.
         * @param reject - Promise's reject function.
         * @param reason - Promise target if process has a zero return code.
         * @param callback - Optional function to call of process has successfully
         * finished.
         * @returns Process close handler function.
         */

    }, {
        key: 'getProcessCloseHandler',
        value: function getProcessCloseHandler(resolve, reject) {
            var reason = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var callback = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];

            var finished = false;
            return function (returnCode) {
                if (!finished) if (typeof returnCode !== 'number' || returnCode === 0) {
                    callback();
                    resolve(reason);
                } else {
                    var error = new Error('Task exited with error code ' + returnCode);
                    // IgnoreTypeCheck
                    error.returnCode = returnCode;
                    reject(error);
                }
                finished = true;
            };
        }
        /**
         * Forwards given child process communication channels to corresponding
         * current process communication channels.
         * @param childProcess - Child process meta data.
         * @returns Given child process meta data.
         */

    }, {
        key: 'handleChildProcess',
        value: function handleChildProcess(childProcess) {
            childProcess.stdout.pipe(process.stdout);
            childProcess.stderr.pipe(process.stderr);
            childProcess.on('close', function (returnCode) {
                if (returnCode !== 0) console.error('Task exited with error code ' + returnCode);
            });
            return childProcess;
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
            var informations = arguments.length <= 1 || arguments[1] === undefined ? {
                '[name]': '.__dummy__', '[id]': '.__dummy__',
                '[hash]': '.__dummy__'
            } : arguments[1];

            var filePath = filePathTemplate;
            for (var placeholderName in informations) {
                if (informations.hasOwnProperty(placeholderName)) filePath = filePath.replace(new RegExp(_clientnode2.default.stringConvertToValidRegularExpression(placeholderName), 'g'), informations[placeholderName]);
            }return filePath;
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
         * @param moduleAliases - Mapping of aliases to take into account.
         * @param knownExtensions - List of file extensions to take into account.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param includePattern - Array of regular expressions to explicitly mark
         * as external dependency.
         * @param excludePattern - Array of regular expressions to explicitly mark
         * as internal dependency.
         * @param inPlaceNormalLibrary - Indicates whether normal libraries should
         * be external or not.
         * @param inPlaceDynamicLibrary - Indicates whether requests with
         * integrated loader configurations should be marked as external or not.
         * @param externalHandableFileExtensions - File extensions which should be
         * able to be handled by the external module bundler. If array is empty
         * every extension will be assumed to be supported.
         * @returns A new resolved request indicating whether given request is an
         * external one.
         */

    }, {
        key: 'determineExternalRequest',
        value: function determineExternalRequest(request) {
            var context = arguments.length <= 1 || arguments[1] === undefined ? './' : arguments[1];
            var requestContext = arguments.length <= 2 || arguments[2] === undefined ? './' : arguments[2];
            var normalizedInternalInjection = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
            var externalModuleLocations = arguments.length <= 4 || arguments[4] === undefined ? [_path2.default.resolve(__dirname, 'node_modules')] : arguments[4];
            var moduleAliases = arguments.length <= 5 || arguments[5] === undefined ? {} : arguments[5];
            var knownExtensions = arguments.length <= 6 || arguments[6] === undefined ? ['', '.js', '.css', '.svg', '.html', 'json'] : arguments[6];
            var referencePath = arguments.length <= 7 || arguments[7] === undefined ? './' : arguments[7];
            var pathsToIgnore = arguments.length <= 8 || arguments[8] === undefined ? ['.git'] : arguments[8];
            var includePattern = arguments.length <= 9 || arguments[9] === undefined ? [] : arguments[9];
            var excludePattern = arguments.length <= 10 || arguments[10] === undefined ? [] : arguments[10];
            var inPlaceNormalLibrary = arguments.length <= 11 || arguments[11] === undefined ? false : arguments[11];
            var inPlaceDynamicLibrary = arguments.length <= 12 || arguments[12] === undefined ? true : arguments[12];
            var externalHandableFileExtensions = arguments.length <= 13 || arguments[13] === undefined ? ['', '.js', '.node', '.json'] : arguments[13];

            context = _path2.default.resolve(context);
            requestContext = _path2.default.resolve(requestContext);
            referencePath = _path2.default.resolve(referencePath);
            // NOTE: We apply alias on externals additionally.
            var resolvedRequest = Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), moduleAliases);
            /*
                NOTE: Aliases doesn't have to be forwarded since we pass an already
                resolved request.
            */
            var filePath = Helper.determineModuleFilePath(resolvedRequest, {}, knownExtensions, requestContext, referencePath, pathsToIgnore);
            if (!(filePath || inPlaceNormalLibrary) || _clientnode2.default.isAnyMatching(resolvedRequest, includePattern)) return resolvedRequest;
            if (_clientnode2.default.isAnyMatching(resolvedRequest, excludePattern)) return null;
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = normalizedInternalInjection[chunkName][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _moduleID = _step2.value;

                            if (Helper.determineModuleFilePath(_moduleID, moduleAliases, knownExtensions, context, referencePath, pathsToIgnore) === filePath) return null;
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
                }
            } /*
                  NOTE: We mark dependencies as external if they does not contain a
                  loader in their request and aren't part of the current main package
                  or have a file extension other than javaScript aware.
              */
            if (!inPlaceNormalLibrary && (externalHandableFileExtensions.length === 0 || filePath && externalHandableFileExtensions.includes(_path2.default.extname(filePath)) || !filePath && externalHandableFileExtensions.includes('')) && !(inPlaceDynamicLibrary && request.includes('!')) && (!filePath && inPlaceDynamicLibrary || filePath && (!filePath.startsWith(context) || Helper.isFilePathInLocation(filePath, externalModuleLocations)))) return resolvedRequest;
            return null;
        }
        /**
         * Checks if given path points to a valid file.
         * @param filePath - Path to file.
         * @returns A boolean which indicates file existents.
         */

    }, {
        key: 'isFileSync',
        value: function isFileSync(filePath) {
            try {
                fileSystem.accessSync(filePath, fileSystem.F_OK);
                return true;
            } catch (error) {
                return false;
            }
        }
        /**
         * Iterates through given directory structure recursively and calls given
         * callback for each found file. Callback gets file path and corresponding
         * stat object as argument.
         * @param directoryPath - Path to directory structure to traverse.
         * @param callback - Function to invoke for each traversed file.
         * @returns Given callback function.
         */

    }, {
        key: 'walkDirectoryRecursivelySync',
        value: function walkDirectoryRecursivelySync(directoryPath) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function (_filePath, _stat) {
                return true;
            } : arguments[1];

            fileSystem.readdirSync(directoryPath).forEach(function (fileName) {
                var filePath = _path2.default.resolve(directoryPath, fileName);
                var stat = fileSystem.statSync(filePath);
                if (callback(filePath, stat) !== false && stat && stat.isDirectory()) Helper.walkDirectoryRecursivelySync(filePath, callback);
            });
            return callback;
        }
        /**
         * Copies given source file via path to given target directory location
         * with same target name as source file has or copy to given complete
         * target file path.
         * @param sourcePath - Path to file to copy.
         * @param targetPath - Target directory or complete file location to copy
         * to.
         * @returns Determined target file path.
         */

    }, {
        key: 'copyFileSync',
        value: function copyFileSync(sourcePath, targetPath) {
            /*
                NOTE: If target path references a directory a new file with the
                same name will be created.
            */
            try {
                if (fileSystem.lstatSync(targetPath).isDirectory()) targetPath = _path2.default.resolve(targetPath, _path2.default.basename(sourcePath));
            } catch (error) {}
            fileSystem.writeFileSync(targetPath, fileSystem.readFileSync(sourcePath));
            return targetPath;
        }
        /**
         * Copies given source directory via path to given target directory
         * location with same target name as source file has or copy to given
         * complete target directory path.
         * @param sourcePath - Path to directory to copy.
         * @param targetPath - Target directory or complete directory location to
         * copy in.
         * @returns Determined target directory path.
         */

    }, {
        key: 'copyDirectoryRecursiveSync',
        value: function copyDirectoryRecursiveSync(sourcePath, targetPath) {
            try {
                // Check if folder needs to be created or integrated.
                if (fileSystem.lstatSync(targetPath).isDirectory()) targetPath = _path2.default.resolve(targetPath, _path2.default.basename(sourcePath));
            } catch (error) {}
            fileSystem.mkdirSync(targetPath);
            Helper.walkDirectoryRecursivelySync(sourcePath, function (currentSourcePath, stat) {
                var currentTargetPath = _path2.default.join(targetPath, currentSourcePath.substring(sourcePath.length));
                if (stat.isDirectory()) fileSystem.mkdirSync(currentTargetPath);else Helper.copyFileSync(currentSourcePath, currentTargetPath);
            });
            return targetPath;
        }
        /**
         * Determines a asset type if given file.
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
                if (_path2.default.extname(filePath) === '.' + buildConfiguration[type].extension) {
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
         * @returns Converted build configuration.
         */

    }, {
        key: 'resolveBuildConfigurationFilePaths',
        value: function resolveBuildConfigurationFilePaths(configuration) {
            var entryPath = arguments.length <= 1 || arguments[1] === undefined ? './' : arguments[1];
            var pathsToIgnore = arguments.length <= 2 || arguments[2] === undefined ? ['.git'] : arguments[2];

            var buildConfiguration = [];
            var index = 0;
            for (var type in configuration) {
                if (configuration.hasOwnProperty(type)) {
                    var newItem = _clientnode2.default.extendObject(true, { filePaths: [] }, configuration[type]);
                    Helper.walkDirectoryRecursivelySync(entryPath, function (index, buildConfigurationItem) {
                        return function (filePath, stat) {
                            if (Helper.isFilePathInLocation(filePath, pathsToIgnore)) return false;
                            if (stat.isFile() && _path2.default.extname(filePath).substring(1) === buildConfigurationItem.extension && !new RegExp(buildConfigurationItem.fileNamePattern).test(filePath)) buildConfigurationItem.filePaths.push(filePath);
                        };
                    }(index, newItem));
                    buildConfiguration.push(newItem);
                    index += 1;
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
         * @param moduleAliases - Mapping of aliases to take into account.
         * @param knownExtensions - List of file extensions to take into account.
         * @param context - File path to resolve relative to.
         * @param referencePath - Path to search for local modules.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param relativeModuleFilePaths - Module file paths relatively to given
         * context.
         * @param packageEntryFileNames - Names of possible package entry files.
         * @returns Object with a file path and directory path key mapping to
         * corresponding list of paths.
         */

    }, {
        key: 'determineModuleLocations',
        value: function determineModuleLocations(internalInjection) {
            var moduleAliases = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var knownExtensions = arguments.length <= 2 || arguments[2] === undefined ? ['', '.js', '.css', '.svg', '.html', 'json'] : arguments[2];
            var context = arguments.length <= 3 || arguments[3] === undefined ? './' : arguments[3];
            var referencePath = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
            var pathsToIgnore = arguments.length <= 5 || arguments[5] === undefined ? ['.git'] : arguments[5];
            var relativeModuleFilePaths = arguments.length <= 6 || arguments[6] === undefined ? ['', 'node_modules', '../'] : arguments[6];
            var packageEntryFileNames = arguments.length <= 7 || arguments[7] === undefined ? ['__package__', '', 'index', 'main'] : arguments[7];

            var filePaths = [];
            var directoryPaths = [];
            var normalizedInternalInjection = Helper.normalizeInternalInjection(internalInjection);
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = normalizedInternalInjection[chunkName][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var _moduleID2 = _step3.value;

                            var filePath = Helper.determineModuleFilePath(_moduleID2, moduleAliases, knownExtensions, context, referencePath, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames);
                            if (filePath) {
                                filePaths.push(filePath);
                                var directoryPath = _path2.default.dirname(filePath);
                                if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
                            }
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
                }
            }return { filePaths: filePaths, directoryPaths: directoryPaths };
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
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = chunkNamesToDelete[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var _chunkName = _step4.value;

                            delete result[_chunkName];
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
         * @param moduleAliases - Mapping of aliases to take into account.
         * @param knownExtensions - File extensions to take into account.
         * @param context - File path to use as starting point.
         * @param referencePath - Reference path from where local files should be
         * resolved.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @returns Given injection with resolved marked indicators.
         */

    }, {
        key: 'resolveInjection',
        value: function resolveInjection(givenInjection, buildConfigurations, modulesToExclude) {
            var moduleAliases = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
            var knownExtensions = arguments.length <= 4 || arguments[4] === undefined ? ['', '.js', '.css', '.svg', '.html', 'json'] : arguments[4];
            var context = arguments.length <= 5 || arguments[5] === undefined ? './' : arguments[5];
            var referencePath = arguments.length <= 6 || arguments[6] === undefined ? '' : arguments[6];
            var pathsToIgnore = arguments.length <= 7 || arguments[7] === undefined ? ['.git'] : arguments[7];

            var injection = _clientnode2.default.extendObject(true, {}, givenInjection);
            var moduleFilePathsToExclude = Helper.determineModuleLocations(modulesToExclude, moduleAliases, knownExtensions, context, referencePath, pathsToIgnore).filePaths;
            var _arr2 = ['internal', 'external'];
            for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
                var type = _arr2[_i2];
                /* eslint-disable curly */
                if (_typeof(injection[type]) === 'object') {
                    for (var chunkName in injection[type]) {
                        if (injection[type][chunkName] === '__auto__') {
                            injection[type][chunkName] = [];
                            var modules = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context);
                            for (var subChunkName in modules) {
                                if (modules.hasOwnProperty(subChunkName)) injection[type][chunkName].push(modules[subChunkName]);
                            } /*
                                  Reverse array to let javaScript files be the last
                                  ones to export them rather.
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
            var injectedBaseNames = {};
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = buildConfigurations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var buildConfiguration = _step5.value;

                    if (!injectedBaseNames[buildConfiguration.outputExtension]) injectedBaseNames[buildConfiguration.outputExtension] = [];
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = buildConfiguration.filePaths[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var moduleFilePath = _step6.value;

                            if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                                var relativeModuleFilePath = _path2.default.relative(context, moduleFilePath);
                                var baseName = _path2.default.basename(relativeModuleFilePath, '.' + buildConfiguration.extension);
                                /*
                                    Ensure that each output type has only one source
                                    representation.
                                */
                                if (!injectedBaseNames[buildConfiguration.outputExtension].includes(baseName)) {
                                    /*
                                        Ensure that same basenames and different output
                                        types can be distinguished by their extension
                                        (JavaScript-Modules remains without extension since
                                        they will be handled first because the build
                                        configurations are expected to be sorted in this
                                        context).
                                    */
                                    if (result[baseName]) result[relativeModuleFilePath] = relativeModuleFilePath;else result[baseName] = relativeModuleFilePath;
                                    injectedBaseNames[buildConfiguration.outputExtension].push(baseName);
                                }
                            }
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

            return result;
        }
        /**
         * Determines a concrete file path for given module id.
         * @param moduleID - Module id to determine.
         * @param moduleAliases - Mapping of aliases to take into account.
         * @param knownExtensions - List of known extensions.
         * @param context - File path to determine relative to.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param relativeModuleFilePaths - List of relative file path to search
         * for modules in.
         * @param packageEntryFileNames - List of package entry file names to
         * search for. The magic name "__package__" will search for an appreciate
         * entry in a "package.json" file.
         * @returns File path or given module id if determinations has failed or
         * wasn't necessary.
         */

    }, {
        key: 'determineModuleFilePath',
        value: function determineModuleFilePath(moduleID) {
            var moduleAliases = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var knownExtensions = arguments.length <= 2 || arguments[2] === undefined ? ['', '.js', '.css', '.svg', '.html', 'json'] : arguments[2];
            var context = arguments.length <= 3 || arguments[3] === undefined ? './' : arguments[3];
            var referencePath = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
            var pathsToIgnore = arguments.length <= 5 || arguments[5] === undefined ? ['.git'] : arguments[5];
            var relativeModuleFilePaths = arguments.length <= 6 || arguments[6] === undefined ? ['node_modules', '../'] : arguments[6];
            var packageEntryFileNames = arguments.length <= 7 || arguments[7] === undefined ? ['__package__', '', 'index', 'main'] : arguments[7];

            moduleID = Helper.applyAliases(Helper.stripLoader(moduleID), moduleAliases);
            if (!moduleID) return null;
            if (referencePath.startsWith('/')) referencePath = _path2.default.relative(context, referencePath);
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = [referencePath].concat(relativeModuleFilePaths)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var moduleLocation = _step7.value;
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = packageEntryFileNames[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var fileName = _step8.value;
                            var _iteratorNormalCompletion9 = true;
                            var _didIteratorError9 = false;
                            var _iteratorError9 = undefined;

                            try {
                                for (var _iterator9 = knownExtensions[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                    var extension = _step9.value;

                                    var moduleFilePath = moduleID;
                                    if (!moduleFilePath.startsWith('/')) moduleFilePath = _path2.default.resolve(context, moduleLocation, moduleFilePath);
                                    if (fileName === '__package__') {
                                        try {
                                            if (fileSystem.statSync(moduleFilePath).isDirectory()) {
                                                var pathToPackageJSON = _path2.default.resolve(moduleFilePath, 'package.json');
                                                if (fileSystem.statSync(pathToPackageJSON).isFile()) {
                                                    var localConfiguration = JSON.parse(fileSystem.readFileSync(pathToPackageJSON, {
                                                        encoding: 'utf-8' }));
                                                    if (localConfiguration.main) fileName = localConfiguration.main;
                                                }
                                            }
                                        } catch (error) {}
                                        if (fileName === '__package__') continue;
                                    }
                                    moduleFilePath = _path2.default.resolve(moduleFilePath, fileName);
                                    moduleFilePath += extension;
                                    if (Helper.isFilePathInLocation(moduleFilePath, pathsToIgnore)) continue;
                                    if (Helper.isFileSync(moduleFilePath)) return moduleFilePath;
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
    }]);

    return Helper;
}();
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion


exports.default = Helper;

//# sourceMappingURL=data:application/json;base64,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LEtBQWpCLEVBQXdCLFFBQVEsS0FBUixDQUF4QixDQUFYO0FBTFIsYUFNQSxPQUFPLFFBQVA7QUFDSDs7Ozs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7a0JBN3NCcUIsTSIsImZpbGUiOiJoZWxwZXIuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHtDaGlsZFByb2Nlc3N9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgVG9vbHMgZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IHR5cGUge1xuICAgIEJ1aWxkQ29uZmlndXJhdGlvbiwgSW5qZWN0aW9uLCBJbnRlcm5hbEluamVjdGlvbixcbiAgICBOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24sIFBhdGgsIFBsYWluT2JqZWN0LCBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0sIFRyYXZlcnNlRmlsZXNDYWxsYmFja0Z1bmN0aW9uXG59IGZyb20gJy4vdHlwZSdcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIG1ldGhvZHNcbi8qKlxuICogUHJvdmlkZXMgYSBjbGFzcyBvZiBzdGF0aWMgbWV0aG9kcyB3aXRoIGdlbmVyaWMgdXNlIGNhc2VzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZWxwZXIge1xuICAgIC8vIHJlZ2lvbiBib29sZWFuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGdpdmVuIGZpbGUgcGF0aCBpcyB3aXRoaW4gZ2l2ZW4gbGlzdCBvZiBmaWxlXG4gICAgICogbG9jYXRpb25zLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBjaGVjay5cbiAgICAgKiBAcGFyYW0gbG9jYXRpb25zVG9DaGVjayAtIExvY2F0aW9ucyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBWYWx1ZSBcInRydWVcIiBpZiBnaXZlbiBmaWxlIHBhdGggaXMgd2l0aGluIG9uZSBvZiBnaXZlblxuICAgICAqIGxvY2F0aW9ucyBvciBcImZhbHNlXCIgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBsb2NhdGlvbnNUb0NoZWNrOkFycmF5PHN0cmluZz5cbiAgICApOmJvb2xlYW4ge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGhUb0NoZWNrOnN0cmluZyBvZiBsb2NhdGlvbnNUb0NoZWNrKVxuICAgICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShmaWxlUGF0aCkuc3RhcnRzV2l0aChwYXRoLnJlc29sdmUocGF0aFRvQ2hlY2spKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHN0cmluZ1xuICAgIC8qKlxuICAgICAqIFN0cmlwcyBsb2FkZXIgaW5mb3JtYXRpb25zIGZvcm0gZ2l2ZW4gbW9kdWxlIHJlcXVlc3QgaW5jbHVkaW5nIGxvYWRlclxuICAgICAqIHByZWZpeCBhbmQgcXVlcnkgcGFyYW1ldGVyLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSByZXF1ZXN0IHRvIHN0cmlwLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIG1vZHVsZSBpZCBzdHJpcHBlZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc3RyaXBMb2FkZXIobW9kdWxlSUQ6c3RyaW5nfFN0cmluZyk6c3RyaW5nIHtcbiAgICAgICAgbW9kdWxlSUQgPSBtb2R1bGVJRC50b1N0cmluZygpXG4gICAgICAgIGNvbnN0IG1vZHVsZUlEV2l0aG91dExvYWRlcjpzdHJpbmcgPSBtb2R1bGVJRC5zdWJzdHJpbmcoXG4gICAgICAgICAgICBtb2R1bGVJRC5sYXN0SW5kZXhPZignIScpICsgMSlcbiAgICAgICAgcmV0dXJuIG1vZHVsZUlEV2l0aG91dExvYWRlci5pbmNsdWRlcyhcbiAgICAgICAgICAgICc/J1xuICAgICAgICApID8gbW9kdWxlSURXaXRob3V0TG9hZGVyLnN1YnN0cmluZygwLCBtb2R1bGVJRFdpdGhvdXRMb2FkZXIuaW5kZXhPZihcbiAgICAgICAgICAgICc/J1xuICAgICAgICApKSA6IG1vZHVsZUlEV2l0aG91dExvYWRlclxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gYXJyYXlcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBnaXZlbiBsaXN0IG9mIHBhdGggdG8gYSBub3JtYWxpemVkIGxpc3Qgd2l0aCB1bmlxdWUgdmFsdWVzLlxuICAgICAqIEBwYXJhbSBwYXRocyAtIEZpbGUgcGF0aHMuXG4gICAgICogQHJldHVybnMgVGhlIGdpdmVuIGZpbGUgcGF0aCBsaXN0IHdpdGggbm9ybWFsaXplZCB1bmlxdWUgdmFsdWVzLlxuICAgICAqL1xuICAgIHN0YXRpYyBub3JtYWxpemVQYXRocyhwYXRoczpBcnJheTxzdHJpbmc+KTpBcnJheTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChwYXRocy5tYXAoKGdpdmVuUGF0aDpzdHJpbmcpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICBnaXZlblBhdGggPSBwYXRoLm5vcm1hbGl6ZShnaXZlblBhdGgpXG4gICAgICAgICAgICBpZiAoZ2l2ZW5QYXRoLmVuZHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdpdmVuUGF0aC5zdWJzdHJpbmcoMCwgZ2l2ZW5QYXRoLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICByZXR1cm4gZ2l2ZW5QYXRoXG4gICAgICAgIH0pKSlcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGRhdGFcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBnaXZlbiBzZXJpYWxpemVkLCBiYXNlNjQgZW5jb2RlZCBvciBmaWxlIHBhdGggZ2l2ZW4gb2JqZWN0IGludG9cbiAgICAgKiBhIG5hdGl2ZSBqYXZhU2NyaXB0IG9uZSBpZiBwb3NzaWJsZS5cbiAgICAgKiBAcGFyYW0gc2VyaWFsaXplZE9iamVjdCAtIE9iamVjdCBhcyBzdHJpbmcuXG4gICAgICogQHBhcmFtIHNjb3BlIC0gQW4gb3B0aW9uYWwgc2NvcGUgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGV2YWx1YXRlIGdpdmVuXG4gICAgICogb2JqZWN0IGluLlxuICAgICAqIEBwYXJhbSBuYW1lIC0gVGhlIG5hbWUgdW5kZXIgZ2l2ZW4gc2NvcGUgd2lsbCBiZSBhdmFpbGFibGUuXG4gICAgICogQHJldHVybnMgVGhlIHBhcnNlZCBvYmplY3QgaWYgcG9zc2libGUgYW5kIG51bGwgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZUVuY29kZWRPYmplY3QoXG4gICAgICAgIHNlcmlhbGl6ZWRPYmplY3Q6c3RyaW5nLCBzY29wZTpPYmplY3QgPSB7fSwgbmFtZTpzdHJpbmcgPSAnc2NvcGUnXG4gICAgKTo/UGxhaW5PYmplY3Qge1xuICAgICAgICBpZiAoc2VyaWFsaXplZE9iamVjdC5lbmRzV2l0aCgnLmpzb24nKSAmJiBIZWxwZXIuaXNGaWxlU3luYyhcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRPYmplY3RcbiAgICAgICAgKSlcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRPYmplY3QgPSBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhzZXJpYWxpemVkT2JqZWN0LCB7XG4gICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCd9KVxuICAgICAgICBpZiAoIXNlcmlhbGl6ZWRPYmplY3Quc3RhcnRzV2l0aCgneycpKVxuICAgICAgICAgICAgc2VyaWFsaXplZE9iamVjdCA9IEJ1ZmZlci5mcm9tKFxuICAgICAgICAgICAgICAgIHNlcmlhbGl6ZWRPYmplY3QsICdiYXNlNjQnXG4gICAgICAgICAgICApLnRvU3RyaW5nKCd1dGY4JylcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihuYW1lLCBgcmV0dXJuICR7c2VyaWFsaXplZE9iamVjdH1gKShzY29wZSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBwcm9jZXNzIGhhbmRsZXJcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgYSBvbmUgc2hvdCBjbG9zZSBoYW5kbGVyIHdoaWNoIHRyaWdnZXJzIGdpdmVuIHByb21pc2UgbWV0aG9kcy5cbiAgICAgKiBJZiBhIHJlYXNvbiBpcyBwcm92aWRlZCBpdCB3aWxsIGJlIGdpdmVuIGFzIHJlc29sdmUgdGFyZ2V0LiBBbiBFcnJvclxuICAgICAqIHdpbGwgYmUgZ2VuZXJhdGVkIGlmIHJldHVybiBjb2RlIGlzIG5vdCB6ZXJvLiBUaGUgZ2VuZXJhdGVkIEVycm9yIGhhc1xuICAgICAqIGEgcHJvcGVydHkgXCJyZXR1cm5Db2RlXCIgd2hpY2ggcHJvdmlkZXMgY29ycmVzcG9uZGluZyBwcm9jZXNzIHJldHVyblxuICAgICAqIGNvZGUuXG4gICAgICogQHBhcmFtIHJlc29sdmUgLSBQcm9taXNlJ3MgcmVzb2x2ZSBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0gcmVqZWN0IC0gUHJvbWlzZSdzIHJlamVjdCBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0gcmVhc29uIC0gUHJvbWlzZSB0YXJnZXQgaWYgcHJvY2VzcyBoYXMgYSB6ZXJvIHJldHVybiBjb2RlLlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAtIE9wdGlvbmFsIGZ1bmN0aW9uIHRvIGNhbGwgb2YgcHJvY2VzcyBoYXMgc3VjY2Vzc2Z1bGx5XG4gICAgICogZmluaXNoZWQuXG4gICAgICogQHJldHVybnMgUHJvY2VzcyBjbG9zZSBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRQcm9jZXNzQ2xvc2VIYW5kbGVyKFxuICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb24sIHJlYXNvbjphbnkgPSBudWxsLFxuICAgICAgICBjYWxsYmFjazpGdW5jdGlvbiA9ICgpOnZvaWQgPT4ge31cbiAgICApOigocmV0dXJuQ29kZTo/bnVtYmVyKSA9PiB2b2lkKSB7XG4gICAgICAgIGxldCBmaW5pc2hlZDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIChyZXR1cm5Db2RlOj9udW1iZXIpOnZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKCFmaW5pc2hlZClcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJldHVybkNvZGUgIT09ICdudW1iZXInIHx8IHJldHVybkNvZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlYXNvbilcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvcjpFcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGBUYXNrIGV4aXRlZCB3aXRoIGVycm9yIGNvZGUgJHtyZXR1cm5Db2RlfWApXG4gICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgICAgICAgICBlcnJvci5yZXR1cm5Db2RlID0gcmV0dXJuQ29kZVxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRm9yd2FyZHMgZ2l2ZW4gY2hpbGQgcHJvY2VzcyBjb21tdW5pY2F0aW9uIGNoYW5uZWxzIHRvIGNvcnJlc3BvbmRpbmdcbiAgICAgKiBjdXJyZW50IHByb2Nlc3MgY29tbXVuaWNhdGlvbiBjaGFubmVscy5cbiAgICAgKiBAcGFyYW0gY2hpbGRQcm9jZXNzIC0gQ2hpbGQgcHJvY2VzcyBtZXRhIGRhdGEuXG4gICAgICogQHJldHVybnMgR2l2ZW4gY2hpbGQgcHJvY2VzcyBtZXRhIGRhdGEuXG4gICAgICovXG4gICAgc3RhdGljIGhhbmRsZUNoaWxkUHJvY2VzcyhjaGlsZFByb2Nlc3M6Q2hpbGRQcm9jZXNzKTpDaGlsZFByb2Nlc3Mge1xuICAgICAgICBjaGlsZFByb2Nlc3Muc3Rkb3V0LnBpcGUocHJvY2Vzcy5zdGRvdXQpXG4gICAgICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIucGlwZShwcm9jZXNzLnN0ZGVycilcbiAgICAgICAgY2hpbGRQcm9jZXNzLm9uKCdjbG9zZScsIChyZXR1cm5Db2RlOm51bWJlcik6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAocmV0dXJuQ29kZSAhPT0gMClcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBUYXNrIGV4aXRlZCB3aXRoIGVycm9yIGNvZGUgJHtyZXR1cm5Db2RlfWApXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBjaGlsZFByb2Nlc3NcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGZpbGUgaGFuZGxlclxuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgZmlsZSBwYXRoL25hbWUgcGxhY2Vob2xkZXIgcmVwbGFjZW1lbnRzIHdpdGggZ2l2ZW4gYnVuZGxlXG4gICAgICogYXNzb2NpYXRlZCBpbmZvcm1hdGlvbnMuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoVGVtcGxhdGUgLSBGaWxlIHBhdGggdG8gcHJvY2VzcyBwbGFjZWhvbGRlciBpbi5cbiAgICAgKiBAcGFyYW0gaW5mb3JtYXRpb25zIC0gU2NvcGUgdG8gdXNlIGZvciBwcm9jZXNzaW5nLlxuICAgICAqIEByZXR1cm5zIFByb2Nlc3NlZCBmaWxlIHBhdGguXG4gICAgICovXG4gICAgc3RhdGljIHJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgIGZpbGVQYXRoVGVtcGxhdGU6c3RyaW5nLCBpbmZvcm1hdGlvbnM6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge1xuICAgICAgICAgICAgJ1tuYW1lXSc6ICcuX19kdW1teV9fJywgJ1tpZF0nOiAnLl9fZHVtbXlfXycsXG4gICAgICAgICAgICAnW2hhc2hdJzogJy5fX2R1bW15X18nXG4gICAgICAgIH1cbiAgICApOnN0cmluZyB7XG4gICAgICAgIGxldCBmaWxlUGF0aDpzdHJpbmcgPSBmaWxlUGF0aFRlbXBsYXRlXG4gICAgICAgIGZvciAoY29uc3QgcGxhY2Vob2xkZXJOYW1lOnN0cmluZyBpbiBpbmZvcm1hdGlvbnMpXG4gICAgICAgICAgICBpZiAoaW5mb3JtYXRpb25zLmhhc093blByb3BlcnR5KHBsYWNlaG9sZGVyTmFtZSkpXG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkUmVndWxhckV4cHJlc3Npb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlck5hbWVcbiAgICAgICAgICAgICAgICAgICAgKSwgJ2cnXG4gICAgICAgICAgICAgICAgKSwgaW5mb3JtYXRpb25zW3BsYWNlaG9sZGVyTmFtZV0pXG4gICAgICAgIHJldHVybiBmaWxlUGF0aFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBnaXZlbiByZXF1ZXN0IHBvaW50cyB0byBhbiBleHRlcm5hbCBkZXBlbmRlbmN5IG5vdCBtYWludGFpbmVkXG4gICAgICogYnkgY3VycmVudCBwYWNrYWdlIGNvbnRleHQuXG4gICAgICogQHBhcmFtIHJlcXVlc3QgLSBSZXF1ZXN0IHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIENvbnRleHQgb2YgY3VycmVudCBwcm9qZWN0LlxuICAgICAqIEBwYXJhbSByZXF1ZXN0Q29udGV4dCAtIENvbnRleHQgb2YgZ2l2ZW4gcmVxdWVzdCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gLSBNYXBwaW5nIG9mIGNodW5rIG5hbWVzIHRvIG1vZHVsZXNcbiAgICAgKiB3aGljaCBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gICAgICogQHBhcmFtIGV4dGVybmFsTW9kdWxlTG9jYXRpb25zIC0gQXJyYXkgaWYgcGF0aHMgd2hlcmUgZXh0ZXJuYWwgbW9kdWxlc1xuICAgICAqIHRha2UgcGxhY2UuXG4gICAgICogQHBhcmFtIG1vZHVsZUFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGtub3duRXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBleHRlbnNpb25zIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIGluY2x1ZGVQYXR0ZXJuIC0gQXJyYXkgb2YgcmVndWxhciBleHByZXNzaW9ucyB0byBleHBsaWNpdGx5IG1hcmtcbiAgICAgKiBhcyBleHRlcm5hbCBkZXBlbmRlbmN5LlxuICAgICAqIEBwYXJhbSBleGNsdWRlUGF0dGVybiAtIEFycmF5IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZXhwbGljaXRseSBtYXJrXG4gICAgICogYXMgaW50ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAgKiBAcGFyYW0gaW5QbGFjZU5vcm1hbExpYnJhcnkgLSBJbmRpY2F0ZXMgd2hldGhlciBub3JtYWwgbGlicmFyaWVzIHNob3VsZFxuICAgICAqIGJlIGV4dGVybmFsIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0gaW5QbGFjZUR5bmFtaWNMaWJyYXJ5IC0gSW5kaWNhdGVzIHdoZXRoZXIgcmVxdWVzdHMgd2l0aFxuICAgICAqIGludGVncmF0ZWQgbG9hZGVyIGNvbmZpZ3VyYXRpb25zIHNob3VsZCBiZSBtYXJrZWQgYXMgZXh0ZXJuYWwgb3Igbm90LlxuICAgICAqIEBwYXJhbSBleHRlcm5hbEhhbmRhYmxlRmlsZUV4dGVuc2lvbnMgLSBGaWxlIGV4dGVuc2lvbnMgd2hpY2ggc2hvdWxkIGJlXG4gICAgICogYWJsZSB0byBiZSBoYW5kbGVkIGJ5IHRoZSBleHRlcm5hbCBtb2R1bGUgYnVuZGxlci4gSWYgYXJyYXkgaXMgZW1wdHlcbiAgICAgKiBldmVyeSBleHRlbnNpb24gd2lsbCBiZSBhc3N1bWVkIHRvIGJlIHN1cHBvcnRlZC5cbiAgICAgKiBAcmV0dXJucyBBIG5ldyByZXNvbHZlZCByZXF1ZXN0IGluZGljYXRpbmcgd2hldGhlciBnaXZlbiByZXF1ZXN0IGlzIGFuXG4gICAgICogZXh0ZXJuYWwgb25lLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVFeHRlcm5hbFJlcXVlc3QoXG4gICAgICAgIHJlcXVlc3Q6c3RyaW5nLCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlcXVlc3RDb250ZXh0OnN0cmluZyA9ICcuLycsXG4gICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbjpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gPSB7fSxcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnM6QXJyYXk8c3RyaW5nPiA9IFtwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBfX2Rpcm5hbWUsICdub2RlX21vZHVsZXMnXG4gICAgICAgICldLCBtb2R1bGVBbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sIGtub3duRXh0ZW5zaW9uczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJycsICcuanMnLCAnLmNzcycsICcuc3ZnJywgJy5odG1sJywgJ2pzb24nXG4gICAgICAgIF0sIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJy4vJywgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIGluY2x1ZGVQYXR0ZXJuOkFycmF5PHN0cmluZ3xSZWdFeHA+ID0gW10sXG4gICAgICAgIGV4Y2x1ZGVQYXR0ZXJuOkFycmF5PHN0cmluZ3xSZWdFeHA+ID0gW10sXG4gICAgICAgIGluUGxhY2VOb3JtYWxMaWJyYXJ5OmJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgaW5QbGFjZUR5bmFtaWNMaWJyYXJ5OmJvb2xlYW4gPSB0cnVlLFxuICAgICAgICBleHRlcm5hbEhhbmRhYmxlRmlsZUV4dGVuc2lvbnM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICcnLCAnLmpzJywgJy5ub2RlJywgJy5qc29uJ11cbiAgICApOj9zdHJpbmcge1xuICAgICAgICBjb250ZXh0ID0gcGF0aC5yZXNvbHZlKGNvbnRleHQpXG4gICAgICAgIHJlcXVlc3RDb250ZXh0ID0gcGF0aC5yZXNvbHZlKHJlcXVlc3RDb250ZXh0KVxuICAgICAgICByZWZlcmVuY2VQYXRoID0gcGF0aC5yZXNvbHZlKHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIC8vIE5PVEU6IFdlIGFwcGx5IGFsaWFzIG9uIGV4dGVybmFscyBhZGRpdGlvbmFsbHkuXG4gICAgICAgIGxldCByZXNvbHZlZFJlcXVlc3Q6c3RyaW5nID0gSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgIHJlcXVlc3Quc3Vic3RyaW5nKHJlcXVlc3QubGFzdEluZGV4T2YoJyEnKSArIDEpLCBtb2R1bGVBbGlhc2VzKVxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogQWxpYXNlcyBkb2Vzbid0IGhhdmUgdG8gYmUgZm9yd2FyZGVkIHNpbmNlIHdlIHBhc3MgYW4gYWxyZWFkeVxuICAgICAgICAgICAgcmVzb2x2ZWQgcmVxdWVzdC5cbiAgICAgICAgKi9cbiAgICAgICAgbGV0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsIHt9LCBrbm93bkV4dGVuc2lvbnMsIHJlcXVlc3RDb250ZXh0LFxuICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgcGF0aHNUb0lnbm9yZSlcbiAgICAgICAgaWYgKCEoZmlsZVBhdGggfHwgaW5QbGFjZU5vcm1hbExpYnJhcnkpIHx8IFRvb2xzLmlzQW55TWF0Y2hpbmcoXG4gICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsIGluY2x1ZGVQYXR0ZXJuXG4gICAgICAgICkpXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZWRSZXF1ZXN0XG4gICAgICAgIGlmIChUb29scy5pc0FueU1hdGNoaW5nKHJlc29sdmVkUmVxdWVzdCwgZXhjbHVkZVBhdHRlcm4pKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCwgbW9kdWxlQWxpYXNlcywga25vd25FeHRlbnNpb25zLCBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgICAgICAgICApID09PSBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBtYXJrIGRlcGVuZGVuY2llcyBhcyBleHRlcm5hbCBpZiB0aGV5IGRvZXMgbm90IGNvbnRhaW4gYVxuICAgICAgICAgICAgbG9hZGVyIGluIHRoZWlyIHJlcXVlc3QgYW5kIGFyZW4ndCBwYXJ0IG9mIHRoZSBjdXJyZW50IG1haW4gcGFja2FnZVxuICAgICAgICAgICAgb3IgaGF2ZSBhIGZpbGUgZXh0ZW5zaW9uIG90aGVyIHRoYW4gamF2YVNjcmlwdCBhd2FyZS5cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKCFpblBsYWNlTm9ybWFsTGlicmFyeSAmJiAoXG4gICAgICAgICAgICBleHRlcm5hbEhhbmRhYmxlRmlsZUV4dGVuc2lvbnMubGVuZ3RoID09PSAwIHx8IGZpbGVQYXRoICYmXG4gICAgICAgICAgICBleHRlcm5hbEhhbmRhYmxlRmlsZUV4dGVuc2lvbnMuaW5jbHVkZXMocGF0aC5leHRuYW1lKGZpbGVQYXRoKSkgfHxcbiAgICAgICAgICAgICFmaWxlUGF0aCAmJiBleHRlcm5hbEhhbmRhYmxlRmlsZUV4dGVuc2lvbnMuaW5jbHVkZXMoJycpXG4gICAgICAgICkgJiYgIShpblBsYWNlRHluYW1pY0xpYnJhcnkgJiYgcmVxdWVzdC5pbmNsdWRlcygnIScpKSAmJiAoXG4gICAgICAgICAgICAhZmlsZVBhdGggJiYgaW5QbGFjZUR5bmFtaWNMaWJyYXJ5IHx8IGZpbGVQYXRoICYmIChcbiAgICAgICAgICAgICFmaWxlUGF0aC5zdGFydHNXaXRoKGNvbnRleHQpIHx8IEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCwgZXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnMpKVxuICAgICAgICApKVxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVkUmVxdWVzdFxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgZ2l2ZW4gcGF0aCBwb2ludHMgdG8gYSB2YWxpZCBmaWxlLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZS5cbiAgICAgKiBAcmV0dXJucyBBIGJvb2xlYW4gd2hpY2ggaW5kaWNhdGVzIGZpbGUgZXhpc3RlbnRzLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc0ZpbGVTeW5jKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaWxlU3lzdGVtLmFjY2Vzc1N5bmMoZmlsZVBhdGgsIGZpbGVTeXN0ZW0uRl9PSylcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyB0aHJvdWdoIGdpdmVuIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgcmVjdXJzaXZlbHkgYW5kIGNhbGxzIGdpdmVuXG4gICAgICogY2FsbGJhY2sgZm9yIGVhY2ggZm91bmQgZmlsZS4gQ2FsbGJhY2sgZ2V0cyBmaWxlIHBhdGggYW5kIGNvcnJlc3BvbmRpbmdcbiAgICAgKiBzdGF0IG9iamVjdCBhcyBhcmd1bWVudC5cbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5UGF0aCAtIFBhdGggdG8gZGlyZWN0b3J5IHN0cnVjdHVyZSB0byB0cmF2ZXJzZS5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBpbnZva2UgZm9yIGVhY2ggdHJhdmVyc2VkIGZpbGUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIHdhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoXG4gICAgICAgIGRpcmVjdG9yeVBhdGg6c3RyaW5nLCBjYWxsYmFjazpUcmF2ZXJzZUZpbGVzQ2FsbGJhY2tGdW5jdGlvbiA9IChcbiAgICAgICAgICAgIF9maWxlUGF0aDpzdHJpbmcsIF9zdGF0Ok9iamVjdFxuICAgICAgICApOj9ib29sZWFuID0+IHRydWVcbiAgICApOlRyYXZlcnNlRmlsZXNDYWxsYmFja0Z1bmN0aW9uIHtcbiAgICAgICAgZmlsZVN5c3RlbS5yZWFkZGlyU3luYyhkaXJlY3RvcnlQYXRoKS5mb3JFYWNoKChcbiAgICAgICAgICAgIGZpbGVOYW1lOnN0cmluZ1xuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeVBhdGgsIGZpbGVOYW1lKVxuICAgICAgICAgICAgY29uc3Qgc3RhdDpPYmplY3QgPSBmaWxlU3lzdGVtLnN0YXRTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKGZpbGVQYXRoLCBzdGF0KSAhPT0gZmFsc2UgJiYgc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KFxuICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICBIZWxwZXIud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhmaWxlUGF0aCwgY2FsbGJhY2spXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBjYWxsYmFja1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgZ2l2ZW4gc291cmNlIGZpbGUgdmlhIHBhdGggdG8gZ2l2ZW4gdGFyZ2V0IGRpcmVjdG9yeSBsb2NhdGlvblxuICAgICAqIHdpdGggc2FtZSB0YXJnZXQgbmFtZSBhcyBzb3VyY2UgZmlsZSBoYXMgb3IgY29weSB0byBnaXZlbiBjb21wbGV0ZVxuICAgICAqIHRhcmdldCBmaWxlIHBhdGguXG4gICAgICogQHBhcmFtIHNvdXJjZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gY29weS5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0UGF0aCAtIFRhcmdldCBkaXJlY3Rvcnkgb3IgY29tcGxldGUgZmlsZSBsb2NhdGlvbiB0byBjb3B5XG4gICAgICogdG8uXG4gICAgICogQHJldHVybnMgRGV0ZXJtaW5lZCB0YXJnZXQgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyBjb3B5RmlsZVN5bmMoc291cmNlUGF0aDpzdHJpbmcsIHRhcmdldFBhdGg6c3RyaW5nKTpzdHJpbmcge1xuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogSWYgdGFyZ2V0IHBhdGggcmVmZXJlbmNlcyBhIGRpcmVjdG9yeSBhIG5ldyBmaWxlIHdpdGggdGhlXG4gICAgICAgICAgICBzYW1lIG5hbWUgd2lsbCBiZSBjcmVhdGVkLlxuICAgICAgICAqL1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGZpbGVTeXN0ZW0ubHN0YXRTeW5jKHRhcmdldFBhdGgpLmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgICAgICAgdGFyZ2V0UGF0aCA9IHBhdGgucmVzb2x2ZSh0YXJnZXRQYXRoLCBwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VQYXRoKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgIGZpbGVTeXN0ZW0ud3JpdGVGaWxlU3luYyh0YXJnZXRQYXRoLCBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgIHNvdXJjZVBhdGgpKVxuICAgICAgICByZXR1cm4gdGFyZ2V0UGF0aFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgZ2l2ZW4gc291cmNlIGRpcmVjdG9yeSB2aWEgcGF0aCB0byBnaXZlbiB0YXJnZXQgZGlyZWN0b3J5XG4gICAgICogbG9jYXRpb24gd2l0aCBzYW1lIHRhcmdldCBuYW1lIGFzIHNvdXJjZSBmaWxlIGhhcyBvciBjb3B5IHRvIGdpdmVuXG4gICAgICogY29tcGxldGUgdGFyZ2V0IGRpcmVjdG9yeSBwYXRoLlxuICAgICAqIEBwYXJhbSBzb3VyY2VQYXRoIC0gUGF0aCB0byBkaXJlY3RvcnkgdG8gY29weS5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0UGF0aCAtIFRhcmdldCBkaXJlY3Rvcnkgb3IgY29tcGxldGUgZGlyZWN0b3J5IGxvY2F0aW9uIHRvXG4gICAgICogY29weSBpbi5cbiAgICAgKiBAcmV0dXJucyBEZXRlcm1pbmVkIHRhcmdldCBkaXJlY3RvcnkgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgY29weURpcmVjdG9yeVJlY3Vyc2l2ZVN5bmMoXG4gICAgICAgIHNvdXJjZVBhdGg6c3RyaW5nLCB0YXJnZXRQYXRoOnN0cmluZ1xuICAgICk6c3RyaW5nIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGZvbGRlciBuZWVkcyB0byBiZSBjcmVhdGVkIG9yIGludGVncmF0ZWQuXG4gICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5sc3RhdFN5bmModGFyZ2V0UGF0aCkuaXNEaXJlY3RvcnkoKSlcbiAgICAgICAgICAgICAgICB0YXJnZXRQYXRoID0gcGF0aC5yZXNvbHZlKHRhcmdldFBhdGgsIHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZVBhdGgpKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgZmlsZVN5c3RlbS5ta2RpclN5bmModGFyZ2V0UGF0aClcbiAgICAgICAgSGVscGVyLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoc291cmNlUGF0aCwgKFxuICAgICAgICAgICAgY3VycmVudFNvdXJjZVBhdGg6c3RyaW5nLCBzdGF0Ok9iamVjdFxuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFRhcmdldFBhdGg6c3RyaW5nID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgIHRhcmdldFBhdGgsIGN1cnJlbnRTb3VyY2VQYXRoLnN1YnN0cmluZyhzb3VyY2VQYXRoLmxlbmd0aCkpXG4gICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0ubWtkaXJTeW5jKGN1cnJlbnRUYXJnZXRQYXRoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEhlbHBlci5jb3B5RmlsZVN5bmMoY3VycmVudFNvdXJjZVBhdGgsIGN1cnJlbnRUYXJnZXRQYXRoKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gdGFyZ2V0UGF0aFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgYXNzZXQgdHlwZSBpZiBnaXZlbiBmaWxlLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBhbmFseXNlLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb24gLSBNZXRhIGluZm9ybWF0aW9ucyBmb3IgYXZhaWxhYmxlIGFzc2V0XG4gICAgICogdHlwZXMuXG4gICAgICogQHBhcmFtIHBhdGhzIC0gTGlzdCBvZiBwYXRocyB0byBzZWFyY2ggaWYgZ2l2ZW4gcGF0aCBkb2Vzbid0IHJlZmVyZW5jZVxuICAgICAqIGEgZmlsZSBkaXJlY3RseS5cbiAgICAgKiBAcmV0dXJucyBEZXRlcm1pbmVkIGZpbGUgdHlwZSBvciBcIm51bGxcIiBvZiBnaXZlbiBmaWxlIGNvdWxkbid0IGJlXG4gICAgICogZGV0ZXJtaW5lZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIGJ1aWxkQ29uZmlndXJhdGlvbjpCdWlsZENvbmZpZ3VyYXRpb24sIHBhdGhzOlBhdGhcbiAgICApOj9zdHJpbmcge1xuICAgICAgICBsZXQgcmVzdWx0Oj9zdHJpbmcgPSBudWxsXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gYnVpbGRDb25maWd1cmF0aW9uKVxuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShcbiAgICAgICAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICAgICAgKSA9PT0gYC4ke2J1aWxkQ29uZmlndXJhdGlvblt0eXBlXS5leHRlbnNpb259YCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHR5cGVcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydzb3VyY2UnLCAndGFyZ2V0J10pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFR5cGU6c3RyaW5nIGluIHBhdGhzW3R5cGVdLmFzc2V0KVxuICAgICAgICAgICAgICAgICAgICBpZiAocGF0aHNbdHlwZV0uYXNzZXQuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGVcbiAgICAgICAgICAgICAgICAgICAgKSAmJiBhc3NldFR5cGUgIT09ICdiYXNlJyAmJlxuICAgICAgICAgICAgICAgICAgICBwYXRoc1t0eXBlXS5hc3NldFthc3NldFR5cGVdICYmIGZpbGVQYXRoLnN0YXJ0c1dpdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoc1t0eXBlXS5hc3NldFthc3NldFR5cGVdXG4gICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzZXRUeXBlXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHByb3BlcnR5IHdpdGggYSBzdG9yZWQgYXJyYXkgb2YgYWxsIG1hdGNoaW5nIGZpbGUgcGF0aHMsIHdoaWNoXG4gICAgICogbWF0Y2hlcyBlYWNoIGJ1aWxkIGNvbmZpZ3VyYXRpb24gaW4gZ2l2ZW4gZW50cnkgcGF0aCBhbmQgY29udmVydHMgZ2l2ZW5cbiAgICAgKiBidWlsZCBjb25maWd1cmF0aW9uIGludG8gYSBzb3J0ZWQgYXJyYXkgd2VyZSBqYXZhU2NyaXB0IGZpbGVzIHRha2VzXG4gICAgICogcHJlY2VkZW5jZS5cbiAgICAgKiBAcGFyYW0gY29uZmlndXJhdGlvbiAtIEdpdmVuIGJ1aWxkIGNvbmZpZ3VyYXRpb25zLlxuICAgICAqIEBwYXJhbSBlbnRyeVBhdGggLSBQYXRoIHRvIGFuYWx5c2UgbmVzdGVkIHN0cnVjdHVyZS5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcmV0dXJucyBDb252ZXJ0ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZUJ1aWxkQ29uZmlndXJhdGlvbkZpbGVQYXRocyhcbiAgICAgICAgY29uZmlndXJhdGlvbjpCdWlsZENvbmZpZ3VyYXRpb24sIGVudHJ5UGF0aDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXVxuICAgICk6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24ge1xuICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24gPSBbXVxuICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW06UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtID1cbiAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtmaWxlUGF0aHM6IFtdfSwgY29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVdKVxuICAgICAgICAgICAgICAgIEhlbHBlci53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKGVudHJ5UGF0aCwgKChcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6bnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25JdGVtOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbVxuICAgICAgICAgICAgICAgICk6VHJhdmVyc2VGaWxlc0NhbGxiYWNrRnVuY3Rpb24gPT4gKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIHN0YXQ6T2JqZWN0XG4gICAgICAgICAgICAgICAgKTo/Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oZmlsZVBhdGgsIHBhdGhzVG9JZ25vcmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LmlzRmlsZSgpICYmIHBhdGguZXh0bmFtZShmaWxlUGF0aCkuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICApID09PSBidWlsZENvbmZpZ3VyYXRpb25JdGVtLmV4dGVuc2lvbiAmJiAhKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25JdGVtLmZpbGVOYW1lUGF0dGVyblxuICAgICAgICAgICAgICAgICAgICApKS50ZXN0KGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0uZmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgfSkoaW5kZXgsIG5ld0l0ZW0pKVxuICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5wdXNoKG5ld0l0ZW0pXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnVpbGRDb25maWd1cmF0aW9uLnNvcnQoKFxuICAgICAgICAgICAgZmlyc3Q6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtLFxuICAgICAgICAgICAgc2Vjb25kOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbVxuICAgICAgICApOm51bWJlciA9PiB7XG4gICAgICAgICAgICBpZiAoZmlyc3Qub3V0cHV0RXh0ZW5zaW9uICE9PSBzZWNvbmQub3V0cHV0RXh0ZW5zaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Lm91dHB1dEV4dGVuc2lvbiA9PT0gJ2pzJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgaWYgKHNlY29uZC5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpcnN0Lm91dHB1dEV4dGVuc2lvbiA8IHNlY29uZC5vdXRwdXRFeHRlbnNpb24gPyAtMSA6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIGZpbGUgYW5kIGRpcmVjdG9yeSBwYXRocyByZWxhdGVkIHRvIGdpdmVuIGludGVybmFsXG4gICAgICogbW9kdWxlcyBhcyBhcnJheS5cbiAgICAgKiBAcGFyYW0gaW50ZXJuYWxJbmplY3Rpb24gLSBMaXN0IG9mIG1vZHVsZSBpZHMgb3IgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICogQHBhcmFtIG1vZHVsZUFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGtub3duRXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBleHRlbnNpb25zIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHJlc29sdmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHNlYXJjaCBmb3IgbG9jYWwgbW9kdWxlcy5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMgLSBNb2R1bGUgZmlsZSBwYXRocyByZWxhdGl2ZWx5IHRvIGdpdmVuXG4gICAgICogY29udGV4dC5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUVudHJ5RmlsZU5hbWVzIC0gTmFtZXMgb2YgcG9zc2libGUgcGFja2FnZSBlbnRyeSBmaWxlcy5cbiAgICAgKiBAcmV0dXJucyBPYmplY3Qgd2l0aCBhIGZpbGUgcGF0aCBhbmQgZGlyZWN0b3J5IHBhdGgga2V5IG1hcHBpbmcgdG9cbiAgICAgKiBjb3JyZXNwb25kaW5nIGxpc3Qgb2YgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgaW50ZXJuYWxJbmplY3Rpb246SW50ZXJuYWxJbmplY3Rpb24sIG1vZHVsZUFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAga25vd25FeHRlbnNpb25zOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnJywgJy5qcycsICcuY3NzJywgJy5zdmcnLCAnLmh0bWwnLCAnanNvbidcbiAgICAgICAgXSwgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFsnJywgJ25vZGVfbW9kdWxlcycsICcuLi8nXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnX19wYWNrYWdlX18nLCAnJywgJ2luZGV4JywgJ21haW4nXVxuICAgICk6e2ZpbGVQYXRoczpBcnJheTxzdHJpbmc+O2RpcmVjdG9yeVBhdGhzOkFycmF5PHN0cmluZz59IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoczpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiA9XG4gICAgICAgICAgICBIZWxwZXIubm9ybWFsaXplSW50ZXJuYWxJbmplY3Rpb24oaW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICBpZiAobm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2Ygbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uW1xuICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCwgbW9kdWxlQWxpYXNlcywga25vd25FeHRlbnNpb25zLCBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgcGF0aHNUb0lnbm9yZSwgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXMpXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoOnN0cmluZyA9IHBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGlyZWN0b3J5UGF0aHMuaW5jbHVkZXMoZGlyZWN0b3J5UGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5UGF0aHMucHVzaChkaXJlY3RvcnlQYXRoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2ZpbGVQYXRocywgZGlyZWN0b3J5UGF0aHN9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV2ZXJ5IGluamVjdGlvbiBkZWZpbml0aW9uIHR5cGUgY2FuIGJlIHJlcHJlc2VudGVkIGFzIHBsYWluIG9iamVjdFxuICAgICAqIChtYXBwaW5nIGZyb20gY2h1bmsgbmFtZSB0byBhcnJheSBvZiBtb2R1bGUgaWRzKS4gVGhpcyBtZXRob2QgY29udmVydHNcbiAgICAgKiBlYWNoIHJlcHJlc2VudGF0aW9uIGludG8gdGhlIG5vcm1hbGl6ZWQgcGxhaW4gb2JqZWN0IG5vdGF0aW9uLlxuICAgICAqIEBwYXJhbSBpbnRlcm5hbEluamVjdGlvbiAtIEdpdmVuIGludGVybmFsIGluamVjdGlvbiB0byBub3JtYWxpemUuXG4gICAgICogQHJldHVybnMgTm9ybWFsaXplZCByZXByZXNlbnRhdGlvbiBvZiBnaXZlbiBpbnRlcm5hbCBpbmplY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIG5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKFxuICAgICAgICBpbnRlcm5hbEluamVjdGlvbjpJbnRlcm5hbEluamVjdGlvblxuICAgICk6Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uIHtcbiAgICAgICAgbGV0IHJlc3VsdDpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gPSB7fVxuICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb24gaW5zdGFuY2VvZiBPYmplY3QgJiYgVG9vbHMuaXNQbGFpbk9iamVjdChcbiAgICAgICAgICAgIGludGVybmFsSW5qZWN0aW9uXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIGxldCBoYXNDb250ZW50OmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICAgICAgY29uc3QgY2h1bmtOYW1lc1RvRGVsZXRlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbEluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjaHVua05hbWVdID0gaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lc1RvRGVsZXRlLnB1c2goY2h1bmtOYW1lKVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY2h1bmtOYW1lXSA9IFtpbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGFzQ29udGVudClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgb2YgY2h1bmtOYW1lc1RvRGVsZXRlKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0W2NodW5rTmFtZV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IFtdfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnRlcm5hbEluamVjdGlvbiA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IFtpbnRlcm5hbEluamVjdGlvbl19XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaW50ZXJuYWxJbmplY3Rpb24pKVxuICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBpbnRlcm5hbEluamVjdGlvbn1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBjb25jcmV0ZSBmaWxlIHBhdGhzIGZvciBnaXZlbiBpbmplY3Rpb24gd2hpY2ggYXJlIG1hcmtlZFxuICAgICAqIHdpdGggdGhlIFwiX19hdXRvX19cIiBpbmRpY2F0b3IuXG4gICAgICogQHBhcmFtIGdpdmVuSW5qZWN0aW9uIC0gR2l2ZW4gaW50ZXJuYWwgYW5kIGV4dGVybmFsIGluamVjdGlvbiB0byB0YWtlXG4gICAgICogaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb25zIC0gUmVzb2x2ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gbW9kdWxlc1RvRXhjbHVkZSAtIEEgbGlzdCBvZiBtb2R1bGVzIHRvIGV4Y2x1ZGUgKHNwZWNpZmllZCBieVxuICAgICAqIHBhdGggb3IgaWQpIG9yIGEgbWFwcGluZyBmcm9tIGNodW5rIG5hbWVzIHRvIG1vZHVsZSBpZHMuXG4gICAgICogQHBhcmFtIG1vZHVsZUFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGtub3duRXh0ZW5zaW9ucyAtIEZpbGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byB1c2UgYXMgc3RhcnRpbmcgcG9pbnQuXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBSZWZlcmVuY2UgcGF0aCBmcm9tIHdoZXJlIGxvY2FsIGZpbGVzIHNob3VsZCBiZVxuICAgICAqIHJlc29sdmVkLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIGluamVjdGlvbiB3aXRoIHJlc29sdmVkIG1hcmtlZCBpbmRpY2F0b3JzLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlSW5qZWN0aW9uKFxuICAgICAgICBnaXZlbkluamVjdGlvbjpJbmplY3Rpb24sXG4gICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnM6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgIG1vZHVsZXNUb0V4Y2x1ZGU6SW50ZXJuYWxJbmplY3Rpb24sXG4gICAgICAgIG1vZHVsZUFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSwga25vd25FeHRlbnNpb25zOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnJywgJy5qcycsICcuY3NzJywgJy5zdmcnLCAnLmh0bWwnLCAnanNvbidcbiAgICAgICAgXSwgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXVxuICAgICk6SW5qZWN0aW9uIHtcbiAgICAgICAgY29uc3QgaW5qZWN0aW9uOkluamVjdGlvbiA9IFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgIHRydWUsIHt9LCBnaXZlbkluamVjdGlvbilcbiAgICAgICAgY29uc3QgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlOkFycmF5PHN0cmluZz4gPVxuICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgICAgICAgICBtb2R1bGVzVG9FeGNsdWRlLCBtb2R1bGVBbGlhc2VzLCBrbm93bkV4dGVuc2lvbnMsIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgKS5maWxlUGF0aHNcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2ludGVybmFsJywgJ2V4dGVybmFsJ10pXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBjdXJseSAqL1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmplY3Rpb25bdHlwZV0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGluamVjdGlvblt0eXBlXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID09PSAnX19hdXRvX18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXSA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVzOntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBba2V5OnN0cmluZ106c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zLCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViQ2h1bmtOYW1lOnN0cmluZyBpbiBtb2R1bGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGVzLmhhc093blByb3BlcnR5KHN1YkNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzW3N1YkNodW5rTmFtZV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldmVyc2UgYXJyYXkgdG8gbGV0IGphdmFTY3JpcHQgZmlsZXMgYmUgdGhlIGxhc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmVzIHRvIGV4cG9ydCB0aGVtIHJhdGhlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXS5yZXZlcnNlKClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmplY3Rpb25bdHlwZV0gPT09ICdfX2F1dG9fXycpXG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGN1cmx5ICovXG4gICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9ucywgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLCBjb250ZXh0KVxuICAgICAgICByZXR1cm4gaW5qZWN0aW9uXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb25zIC0gUmVzb2x2ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlIC0gQSBsaXN0IG9mIG1vZHVsZXMgZmlsZSBwYXRocyB0b1xuICAgICAqIGV4Y2x1ZGUgKHNwZWNpZmllZCBieSBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0b1xuICAgICAqIG1vZHVsZSBpZHMuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gdXNlIGFzIHN0YXJ0aW5nIHBvaW50LlxuICAgICAqIEByZXR1cm5zIEFsbCBkZXRlcm1pbmVkIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRBdXRvQ2h1bmsoXG4gICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnM6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZTpBcnJheTxzdHJpbmc+LCBjb250ZXh0OnN0cmluZ1xuICAgICk6e1trZXk6c3RyaW5nXTpzdHJpbmd9IHtcbiAgICAgICAgY29uc3QgcmVzdWx0Ontba2V5OnN0cmluZ106c3RyaW5nfSA9IHt9XG4gICAgICAgIGNvbnN0IGluamVjdGVkQmFzZU5hbWVzOntba2V5OnN0cmluZ106QXJyYXk8c3RyaW5nPn0gPSB7fVxuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSBvZlxuICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uc1xuICAgICAgICApIHtcbiAgICAgICAgICAgIGlmICghaW5qZWN0ZWRCYXNlTmFtZXNbYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvbl0pXG4gICAgICAgICAgICAgICAgaW5qZWN0ZWRCYXNlTmFtZXNbYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvbl0gPSBbXVxuICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVGaWxlUGF0aDpzdHJpbmcgb2YgYnVpbGRDb25maWd1cmF0aW9uLmZpbGVQYXRocylcbiAgICAgICAgICAgICAgICBpZiAoIW1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZS5pbmNsdWRlcyhtb2R1bGVGaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aDpzdHJpbmcgPSBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VOYW1lOnN0cmluZyA9IHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYC4ke2J1aWxkQ29uZmlndXJhdGlvbi5leHRlbnNpb259YClcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IGVhY2ggb3V0cHV0IHR5cGUgaGFzIG9ubHkgb25lIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5qZWN0ZWRCYXNlTmFtZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgIF0uaW5jbHVkZXMoYmFzZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IHNhbWUgYmFzZW5hbWVzIGFuZCBkaWZmZXJlbnQgb3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZXMgY2FuIGJlIGRpc3Rpbmd1aXNoZWQgYnkgdGhlaXIgZXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKEphdmFTY3JpcHQtTW9kdWxlcyByZW1haW5zIHdpdGhvdXQgZXh0ZW5zaW9uIHNpbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhleSB3aWxsIGJlIGhhbmRsZWQgZmlyc3QgYmVjYXVzZSB0aGUgYnVpbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyBhcmUgZXhwZWN0ZWQgdG8gYmUgc29ydGVkIGluIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0KS5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0W2Jhc2VOYW1lXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcmVsYXRpdmVNb2R1bGVGaWxlUGF0aF0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2Jhc2VOYW1lXSA9IHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGVkQmFzZU5hbWVzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIF0ucHVzaChiYXNlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBjb25jcmV0ZSBmaWxlIHBhdGggZm9yIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgaWQgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBtb2R1bGVBbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBrbm93bkV4dGVuc2lvbnMgLSBMaXN0IG9mIGtub3duIGV4dGVuc2lvbnMuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gZGV0ZXJtaW5lIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHJldHVybnMgRmlsZSBwYXRoIG9yIGdpdmVuIG1vZHVsZSBpZCBpZiBkZXRlcm1pbmF0aW9ucyBoYXMgZmFpbGVkIG9yXG4gICAgICogd2Fzbid0IG5lY2Vzc2FyeS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgIG1vZHVsZUlEOnN0cmluZywgbW9kdWxlQWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBrbm93bkV4dGVuc2lvbnM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICcnLCAnLmpzJywgJy5jc3MnLCAnLnN2ZycsICcuaHRtbCcsICdqc29uJ1xuICAgICAgICBdLCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnLCAnLi4vJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJ19fcGFja2FnZV9fJywgJycsICdpbmRleCcsICdtYWluJ11cbiAgICApOj9zdHJpbmcge1xuICAgICAgICBtb2R1bGVJRCA9IEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIobW9kdWxlSUQpLCBtb2R1bGVBbGlhc2VzKVxuICAgICAgICBpZiAoIW1vZHVsZUlEKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgaWYgKHJlZmVyZW5jZVBhdGguc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCA9IHBhdGgucmVsYXRpdmUoY29udGV4dCwgcmVmZXJlbmNlUGF0aClcbiAgICAgICAgZm9yIChjb25zdCBtb2R1bGVMb2NhdGlvbjpzdHJpbmcgb2YgW3JlZmVyZW5jZVBhdGhdLmNvbmNhdChcbiAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzXG4gICAgICAgICkpXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlTmFtZTpzdHJpbmcgb2YgcGFja2FnZUVudHJ5RmlsZU5hbWVzKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZXh0ZW5zaW9uOnN0cmluZyBvZiBrbm93bkV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZHVsZUZpbGVQYXRoOnN0cmluZyA9IG1vZHVsZUlEXG4gICAgICAgICAgICAgICAgICAgIGlmICghbW9kdWxlRmlsZVBhdGguc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCwgbW9kdWxlTG9jYXRpb24sIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUgPT09ICdfX3BhY2thZ2VfXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVTeXN0ZW0uc3RhdFN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhUb1BhY2thZ2VKU09OOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoLCAncGFja2FnZS5qc29uJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVTeXN0ZW0uc3RhdFN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoVG9QYWNrYWdlSlNPTlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04ucGFyc2UoZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhUb1BhY2thZ2VKU09OLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogJ3V0Zi04J30pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsQ29uZmlndXJhdGlvbi5tYWluKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gbG9jYWxDb25maWd1cmF0aW9uLm1haW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnX19wYWNrYWdlX18nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUobW9kdWxlRmlsZVBhdGgsIGZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCArPSBleHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVN5bmMobW9kdWxlRmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBUaGUgYWxpYXMgYXBwbGllZCBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICovXG4gICAgc3RhdGljIGFwcGx5QWxpYXNlcyhtb2R1bGVJRDpzdHJpbmcsIGFsaWFzZXM6UGxhaW5PYmplY3QpOnN0cmluZyB7XG4gICAgICAgIGZvciAoY29uc3QgYWxpYXM6c3RyaW5nIGluIGFsaWFzZXMpXG4gICAgICAgICAgICBpZiAoYWxpYXMuZW5kc1dpdGgoJyQnKSkge1xuICAgICAgICAgICAgICAgIGlmIChtb2R1bGVJRCA9PT0gYWxpYXMuc3Vic3RyaW5nKDAsIGFsaWFzLmxlbmd0aCAtIDEpKVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IGFsaWFzZXNbYWxpYXNdXG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnJlcGxhY2UoYWxpYXMsIGFsaWFzZXNbYWxpYXNdKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURcbiAgICB9XG59XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19