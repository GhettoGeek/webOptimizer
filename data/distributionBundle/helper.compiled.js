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
         * @param aliases - Mapping of aliases to take into account.
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
            var externalModuleLocations = arguments.length <= 4 || arguments[4] === undefined ? ['node_modules'] : arguments[4];
            var aliases = arguments.length <= 5 || arguments[5] === undefined ? {} : arguments[5];
            var extensions = arguments.length <= 6 || arguments[6] === undefined ? {
                file: ['.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.json', '.eot', '.ttf', '.woff'], module: []
            } : arguments[6];
            var referencePath = arguments.length <= 7 || arguments[7] === undefined ? './' : arguments[7];
            var pathsToIgnore = arguments.length <= 8 || arguments[8] === undefined ? ['.git'] : arguments[8];
            var relativeModuleFilePaths = arguments.length <= 9 || arguments[9] === undefined ? ['node_modules'] : arguments[9];
            var packageEntryFileNames = arguments.length <= 10 || arguments[10] === undefined ? ['index', 'main'] : arguments[10];
            var packageMainPropertyNames = arguments.length <= 11 || arguments[11] === undefined ? ['main', 'module'] : arguments[11];
            var packageAliasPropertyNames = arguments.length <= 12 || arguments[12] === undefined ? [] : arguments[12];
            var includePattern = arguments.length <= 13 || arguments[13] === undefined ? [] : arguments[13];
            var excludePattern = arguments.length <= 14 || arguments[14] === undefined ? [] : arguments[14];
            var inPlaceNormalLibrary = arguments.length <= 15 || arguments[15] === undefined ? false : arguments[15];
            var inPlaceDynamicLibrary = arguments.length <= 16 || arguments[16] === undefined ? true : arguments[16];
            var externalHandableFileExtensions = arguments.length <= 17 || arguments[17] === undefined ? ['.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.json', '.eot', '.ttf', '.woff'] : arguments[17];

            context = _path2.default.resolve(context);
            requestContext = _path2.default.resolve(requestContext);
            referencePath = _path2.default.resolve(referencePath);
            // NOTE: We apply alias on externals additionally.
            var resolvedRequest = Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases);
            /*
                NOTE: Aliases doesn't have to be forwarded since we pass an already
                resolved request.
            */
            var filePath = Helper.determineModuleFilePath(resolvedRequest, {}, extensions, requestContext, referencePath, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames);
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

                            if (Helper.determineModuleFilePath(_moduleID, aliases, extensions, context, referencePath, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames) === filePath) return null;
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
         * Checks if given path points to a valid directory.
         * @param filePath - Path to directory.
         * @returns A boolean which indicates directory existents.
         */

    }, {
        key: 'isDirectorySync',
        value: function isDirectorySync(filePath) {
            try {
                return fileSystem.statSync(filePath).isDirectory();
            } catch (error) {
                return false;
            }
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
                return fileSystem.statSync(filePath).isFile();
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
            if (Helper.isDirectorySync(targetPath)) targetPath = _path2.default.resolve(targetPath, _path2.default.basename(sourcePath));
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
            // Check if folder needs to be created or integrated.
            if (Helper.isDirectorySync(targetPath)) targetPath = _path2.default.resolve(targetPath, _path2.default.basename(sourcePath));
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
                            if (stat.isFile() && _path2.default.extname(filePath).substring(1) === buildConfigurationItem.extension && !new RegExp(buildConfigurationItem.filePathPattern).test(filePath)) buildConfigurationItem.filePaths.push(filePath);
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
         * @param aliases - Mapping of aliases to take into account.
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
         * @returns Object with a file path and directory path key mapping to
         * corresponding list of paths.
         */

    }, {
        key: 'determineModuleLocations',
        value: function determineModuleLocations(internalInjection) {
            var aliases = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var extensions = arguments.length <= 2 || arguments[2] === undefined ? {
                file: ['.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.json', '.eot', '.ttf', '.woff'], module: []
            } : arguments[2];
            var context = arguments.length <= 3 || arguments[3] === undefined ? './' : arguments[3];
            var referencePath = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
            var pathsToIgnore = arguments.length <= 5 || arguments[5] === undefined ? ['.git'] : arguments[5];
            var relativeModuleFilePaths = arguments.length <= 6 || arguments[6] === undefined ? ['', 'node_modules', '../'] : arguments[6];
            var packageEntryFileNames = arguments.length <= 7 || arguments[7] === undefined ? ['__package__', '', 'index', 'main'] : arguments[7];
            var packageMainPropertyNames = arguments.length <= 8 || arguments[8] === undefined ? ['main', 'module'] : arguments[8];
            var packageAliasPropertyNames = arguments.length <= 9 || arguments[9] === undefined ? [] : arguments[9];

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

                            var filePath = Helper.determineModuleFilePath(_moduleID2, aliases, extensions, context, referencePath, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames);
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
         * Determines a list of concrete file paths for given module id pointing
         * to a folder which isn't a package.
         * @param normalizedInternalInjection - Injection data structure of
         * modules with folder references to resolve.
         * @param aliases - Mapping of aliases to take into account.
         * @param extensions - List of file and module extensions.
         * @param context - File path to determine relative to.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @returns Given injections with resolved folder pointing modules.
         */

    }, {
        key: 'resolveModulesInFolders',
        value: function resolveModulesInFolders(normalizedInternalInjection) {
            var aliases = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var extensions = arguments.length <= 2 || arguments[2] === undefined ? {
                file: ['.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.json', '.eot', '.ttf', '.woff'], module: []
            } : arguments[2];
            var context = arguments.length <= 3 || arguments[3] === undefined ? './' : arguments[3];
            var referencePath = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
            var pathsToIgnore = arguments.length <= 5 || arguments[5] === undefined ? ['.git'] : arguments[5];

            if (referencePath.startsWith('/')) referencePath = _path2.default.relative(context, referencePath);

            var _loop = function _loop(chunkName) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var index = 0;
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        var _loop2 = function _loop2() {
                            var moduleID = _step4.value;

                            moduleID = Helper.applyAliases(Helper.stripLoader(moduleID), aliases);
                            var directoryPath = _path2.default.resolve(referencePath, moduleID);
                            if (Helper.isDirectorySync(directoryPath)) {
                                normalizedInternalInjection[chunkName].splice(index, 1);
                                Helper.walkDirectoryRecursivelySync(directoryPath, function (filePath, stat) {
                                    if (Helper.isFilePathInLocation(_path2.default.resolve(directoryPath, filePath), pathsToIgnore)) return false;
                                    if (stat.isFile()) normalizedInternalInjection[chunkName].push(_path2.default.relative(referencePath, _path2.default.resolve(directoryPath, filePath)));
                                });
                            }
                            index += 1;
                        };

                        for (var _iterator4 = normalizedInternalInjection[chunkName][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            _loop2();
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
                }
            };

            for (var chunkName in normalizedInternalInjection) {
                _loop(chunkName);
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
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = chunkNamesToDelete[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var _chunkName = _step5.value;

                            delete result[_chunkName];
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
            var aliases = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
            var extensions = arguments.length <= 4 || arguments[4] === undefined ? {
                file: ['.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.json', '.eot', '.ttf', '.woff'], module: []
            } : arguments[4];
            var context = arguments.length <= 5 || arguments[5] === undefined ? './' : arguments[5];
            var referencePath = arguments.length <= 6 || arguments[6] === undefined ? '' : arguments[6];
            var pathsToIgnore = arguments.length <= 7 || arguments[7] === undefined ? ['.git'] : arguments[7];

            var injection = _clientnode2.default.extendObject(true, {}, givenInjection);
            var moduleFilePathsToExclude = Helper.determineModuleLocations(modulesToExclude, aliases, extensions, context, referencePath, pathsToIgnore).filePaths;
            var _arr2 = ['internal', 'external'];
            for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
                var type = _arr2[_i2];
                /* eslint-disable curly */
                if (_typeof(injection[type]) === 'object') {
                    for (var chunkName in injection[type]) {
                        if (injection[type][chunkName] === '__auto__') {
                            injection[type][chunkName] = [];
                            var modules = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, referencePath);
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
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = buildConfigurations[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var buildConfiguration = _step6.value;

                    if (!injectedBaseNames[buildConfiguration.outputExtension]) injectedBaseNames[buildConfiguration.outputExtension] = [];
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = buildConfiguration.filePaths[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var moduleFilePath = _step7.value;

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

            return result;
        }
        /**
         * Determines a concrete file path for given module id.
         * @param moduleID - Module id to determine.
         * @param aliases - Mapping of aliases to take into account.
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
         * @returns File path or given module id if determinations has failed or
         * wasn't necessary.
         */

    }, {
        key: 'determineModuleFilePath',
        value: function determineModuleFilePath(moduleID) {
            var aliases = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var extensions = arguments.length <= 2 || arguments[2] === undefined ? {
                file: ['.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.json', '.eot', '.ttf', '.woff'], module: []
            } : arguments[2];
            var context = arguments.length <= 3 || arguments[3] === undefined ? './' : arguments[3];
            var referencePath = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
            var pathsToIgnore = arguments.length <= 5 || arguments[5] === undefined ? ['.git'] : arguments[5];
            var relativeModuleFilePaths = arguments.length <= 6 || arguments[6] === undefined ? ['node_modules'] : arguments[6];
            var packageEntryFileNames = arguments.length <= 7 || arguments[7] === undefined ? ['index'] : arguments[7];
            var packageMainPropertyNames = arguments.length <= 8 || arguments[8] === undefined ? ['main'] : arguments[8];
            var packageAliasPropertyNames = arguments.length <= 9 || arguments[9] === undefined ? [] : arguments[9];

            moduleID = Helper.applyAliases(Helper.stripLoader(moduleID), aliases);
            if (!moduleID) return null;
            var moduleFilePath = moduleID;
            if (moduleFilePath.startsWith('./')) moduleFilePath = _path2.default.join(context, moduleFilePath);
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = [referencePath].concat(relativeModuleFilePaths.map(function (filePath) {
                    return _path2.default.resolve(referencePath, filePath);
                }))[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var moduleLocation = _step8.value;
                    var _iteratorNormalCompletion9 = true;
                    var _didIteratorError9 = false;
                    var _iteratorError9 = undefined;

                    try {
                        for (var _iterator9 = ['', '__package__'].concat(packageEntryFileNames)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            var fileName = _step9.value;
                            var _iteratorNormalCompletion10 = true;
                            var _didIteratorError10 = false;
                            var _iteratorError10 = undefined;

                            try {
                                for (var _iterator10 = [''].concat(extensions.module)[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                    var moduleExtension = _step10.value;
                                    var _iteratorNormalCompletion11 = true;
                                    var _didIteratorError11 = false;
                                    var _iteratorError11 = undefined;

                                    try {
                                        for (var _iterator11 = [''].concat(extensions.file)[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                            var fileExtension = _step11.value;

                                            var currentModuleFilePath = void 0;
                                            if (moduleFilePath.startsWith('/')) currentModuleFilePath = _path2.default.resolve(moduleFilePath);else currentModuleFilePath = _path2.default.resolve(moduleLocation, moduleFilePath);
                                            var packageAliases = {};
                                            if (fileName === '__package__') {
                                                if (Helper.isDirectorySync(currentModuleFilePath)) {
                                                    var pathToPackageJSON = _path2.default.resolve(currentModuleFilePath, 'package.json');
                                                    if (Helper.isFileSync(pathToPackageJSON)) {
                                                        var localConfiguration = {};
                                                        try {
                                                            localConfiguration = JSON.parse(fileSystem.readFileSync(pathToPackageJSON, {
                                                                encoding: 'utf-8' }));
                                                        } catch (error) {}
                                                        var _iteratorNormalCompletion12 = true;
                                                        var _didIteratorError12 = false;
                                                        var _iteratorError12 = undefined;

                                                        try {
                                                            for (var _iterator12 = packageMainPropertyNames[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                                                var propertyName = _step12.value;

                                                                if (localConfiguration.hasOwnProperty(propertyName) && localConfiguration[propertyName]) {
                                                                    fileName = localConfiguration[propertyName];
                                                                    break;
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

                                                        var _iteratorNormalCompletion13 = true;
                                                        var _didIteratorError13 = false;
                                                        var _iteratorError13 = undefined;

                                                        try {
                                                            for (var _iterator13 = packageAliasPropertyNames[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                                                                var _propertyName = _step13.value;

                                                                if (localConfiguration.hasOwnProperty(_propertyName) && localConfiguration[_propertyName]) {
                                                                    packageAliases = localConfiguration[_propertyName];
                                                                    break;
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
                                                    }
                                                }
                                                if (fileName === '__package__') continue;
                                            }
                                            fileName = Helper.applyAliases(fileName, packageAliases);
                                            if (fileName) currentModuleFilePath = _path2.default.resolve(currentModuleFilePath, '' + fileName + moduleExtension + fileExtension);else currentModuleFilePath += '' + fileName + moduleExtension + fileExtension;
                                            if (Helper.isFilePathInLocation(currentModuleFilePath, pathsToIgnore)) continue;
                                            if (Helper.isFileSync(currentModuleFilePath)) return currentModuleFilePath;
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

//# sourceMappingURL=data:application/json;base64,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QUFISjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFKSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFQTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTJGTixtQkFBTyxJQUFQO0FBQ0g7QUFDRDtBQUNBOzs7Ozs7Ozs7cUNBTW9CLFEsRUFBaUIsTyxFQUE0QjtBQUM3RCxpQkFBSyxJQUFNLEtBQVgsSUFBMkIsT0FBM0I7QUFDSSxvQkFBSSxNQUFNLFFBQU4sQ0FBZSxHQUFmLENBQUosRUFBeUI7QUFDckIsd0JBQUksYUFBYSxNQUFNLFNBQU4sQ0FBZ0IsQ0FBaEIsRUFBbUIsTUFBTSxNQUFOLEdBQWUsQ0FBbEMsQ0FBakIsRUFDSSxXQUFXLFFBQVEsS0FBUixDQUFYO0FBQ1AsaUJBSEQsTUFJSSxXQUFXLFNBQVMsT0FBVCxDQUFpQixLQUFqQixFQUF3QixRQUFRLEtBQVIsQ0FBeEIsQ0FBWDtBQUxSLGFBTUEsT0FBTyxRQUFQO0FBQ0g7Ozs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O2tCQXgyQnFCLE0iLCJmaWxlIjoiaGVscGVyLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB7Q2hpbGRQcm9jZXNzfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgKiBhcyBmaWxlU3lzdGVtIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbi8vIE5PVEU6IE9ubHkgbmVlZGVkIGZvciBkZWJ1Z2dpbmcgdGhpcyBmaWxlLlxudHJ5IHtcbiAgICByZXF1aXJlKCdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInKVxufSBjYXRjaCAoZXJyb3IpIHt9XG5cbmltcG9ydCB0eXBlIHtcbiAgICBCdWlsZENvbmZpZ3VyYXRpb24sIEluamVjdGlvbiwgSW50ZXJuYWxJbmplY3Rpb24sXG4gICAgTm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uLCBQYXRoLCBQbGFpbk9iamVjdCwgUmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgUmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtLCBUcmF2ZXJzZUZpbGVzQ2FsbGJhY2tGdW5jdGlvblxufSBmcm9tICcuL3R5cGUnXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBtZXRob2RzXG4vKipcbiAqIFByb3ZpZGVzIGEgY2xhc3Mgb2Ygc3RhdGljIG1ldGhvZHMgd2l0aCBnZW5lcmljIHVzZSBjYXNlcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGVscGVyIHtcbiAgICAvLyByZWdpb24gYm9vbGVhblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hldGhlciBnaXZlbiBmaWxlIHBhdGggaXMgd2l0aGluIGdpdmVuIGxpc3Qgb2YgZmlsZVxuICAgICAqIGxvY2F0aW9ucy5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gY2hlY2suXG4gICAgICogQHBhcmFtIGxvY2F0aW9uc1RvQ2hlY2sgLSBMb2NhdGlvbnMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHJldHVybnMgVmFsdWUgXCJ0cnVlXCIgaWYgZ2l2ZW4gZmlsZSBwYXRoIGlzIHdpdGhpbiBvbmUgb2YgZ2l2ZW5cbiAgICAgKiBsb2NhdGlvbnMgb3IgXCJmYWxzZVwiIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgIGZpbGVQYXRoOnN0cmluZywgbG9jYXRpb25zVG9DaGVjazpBcnJheTxzdHJpbmc+XG4gICAgKTpib29sZWFuIHtcbiAgICAgICAgZm9yIChjb25zdCBwYXRoVG9DaGVjazpzdHJpbmcgb2YgbG9jYXRpb25zVG9DaGVjaylcbiAgICAgICAgICAgIGlmIChwYXRoLnJlc29sdmUoZmlsZVBhdGgpLnN0YXJ0c1dpdGgocGF0aC5yZXNvbHZlKHBhdGhUb0NoZWNrKSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBzdHJpbmdcbiAgICAvKipcbiAgICAgKiBTdHJpcHMgbG9hZGVyIGluZm9ybWF0aW9ucyBmb3JtIGdpdmVuIG1vZHVsZSByZXF1ZXN0IGluY2x1ZGluZyBsb2FkZXJcbiAgICAgKiBwcmVmaXggYW5kIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgcmVxdWVzdCB0byBzdHJpcC5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBtb2R1bGUgaWQgc3RyaXBwZWQuXG4gICAgICovXG4gICAgc3RhdGljIHN0cmlwTG9hZGVyKG1vZHVsZUlEOnN0cmluZ3xTdHJpbmcpOnN0cmluZyB7XG4gICAgICAgIG1vZHVsZUlEID0gbW9kdWxlSUQudG9TdHJpbmcoKVxuICAgICAgICBjb25zdCBtb2R1bGVJRFdpdGhvdXRMb2FkZXI6c3RyaW5nID0gbW9kdWxlSUQuc3Vic3RyaW5nKFxuICAgICAgICAgICAgbW9kdWxlSUQubGFzdEluZGV4T2YoJyEnKSArIDEpXG4gICAgICAgIHJldHVybiBtb2R1bGVJRFdpdGhvdXRMb2FkZXIuaW5jbHVkZXMoXG4gICAgICAgICAgICAnPydcbiAgICAgICAgKSA/IG1vZHVsZUlEV2l0aG91dExvYWRlci5zdWJzdHJpbmcoMCwgbW9kdWxlSURXaXRob3V0TG9hZGVyLmluZGV4T2YoXG4gICAgICAgICAgICAnPydcbiAgICAgICAgKSkgOiBtb2R1bGVJRFdpdGhvdXRMb2FkZXJcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGFycmF5XG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZ2l2ZW4gbGlzdCBvZiBwYXRoIHRvIGEgbm9ybWFsaXplZCBsaXN0IHdpdGggdW5pcXVlIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0gcGF0aHMgLSBGaWxlIHBhdGhzLlxuICAgICAqIEByZXR1cm5zIFRoZSBnaXZlbiBmaWxlIHBhdGggbGlzdCB3aXRoIG5vcm1hbGl6ZWQgdW5pcXVlIHZhbHVlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgbm9ybWFsaXplUGF0aHMocGF0aHM6QXJyYXk8c3RyaW5nPik6QXJyYXk8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQocGF0aHMubWFwKChnaXZlblBhdGg6c3RyaW5nKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgZ2l2ZW5QYXRoID0gcGF0aC5ub3JtYWxpemUoZ2l2ZW5QYXRoKVxuICAgICAgICAgICAgaWYgKGdpdmVuUGF0aC5lbmRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgIHJldHVybiBnaXZlblBhdGguc3Vic3RyaW5nKDAsIGdpdmVuUGF0aC5sZW5ndGggLSAxKVxuICAgICAgICAgICAgcmV0dXJuIGdpdmVuUGF0aFxuICAgICAgICB9KSkpXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBkYXRhXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZ2l2ZW4gc2VyaWFsaXplZCwgYmFzZTY0IGVuY29kZWQgb3IgZmlsZSBwYXRoIGdpdmVuIG9iamVjdCBpbnRvXG4gICAgICogYSBuYXRpdmUgamF2YVNjcmlwdCBvbmUgaWYgcG9zc2libGUuXG4gICAgICogQHBhcmFtIHNlcmlhbGl6ZWRPYmplY3QgLSBPYmplY3QgYXMgc3RyaW5nLlxuICAgICAqIEBwYXJhbSBzY29wZSAtIEFuIG9wdGlvbmFsIHNjb3BlIHdoaWNoIHdpbGwgYmUgdXNlZCB0byBldmFsdWF0ZSBnaXZlblxuICAgICAqIG9iamVjdCBpbi5cbiAgICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIHVuZGVyIGdpdmVuIHNjb3BlIHdpbGwgYmUgYXZhaWxhYmxlLlxuICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgb2JqZWN0IGlmIHBvc3NpYmxlIGFuZCBudWxsIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2VFbmNvZGVkT2JqZWN0KFxuICAgICAgICBzZXJpYWxpemVkT2JqZWN0OnN0cmluZywgc2NvcGU6T2JqZWN0ID0ge30sIG5hbWU6c3RyaW5nID0gJ3Njb3BlJ1xuICAgICk6P1BsYWluT2JqZWN0IHtcbiAgICAgICAgaWYgKHNlcmlhbGl6ZWRPYmplY3QuZW5kc1dpdGgoJy5qc29uJykgJiYgSGVscGVyLmlzRmlsZVN5bmMoXG4gICAgICAgICAgICBzZXJpYWxpemVkT2JqZWN0XG4gICAgICAgICkpXG4gICAgICAgICAgICBzZXJpYWxpemVkT2JqZWN0ID0gZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMoc2VyaWFsaXplZE9iamVjdCwge1xuICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmLTgnfSlcbiAgICAgICAgaWYgKCFzZXJpYWxpemVkT2JqZWN0LnN0YXJ0c1dpdGgoJ3snKSlcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRPYmplY3QgPSBCdWZmZXIuZnJvbShcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVkT2JqZWN0LCAnYmFzZTY0J1xuICAgICAgICAgICAgKS50b1N0cmluZygndXRmOCcpXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24obmFtZSwgYHJldHVybiAke3NlcmlhbGl6ZWRPYmplY3R9YCkoc2NvcGUpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gcHJvY2VzcyBoYW5kbGVyXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIGEgb25lIHNob3QgY2xvc2UgaGFuZGxlciB3aGljaCB0cmlnZ2VycyBnaXZlbiBwcm9taXNlIG1ldGhvZHMuXG4gICAgICogSWYgYSByZWFzb24gaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBnaXZlbiBhcyByZXNvbHZlIHRhcmdldC4gQW4gRXJyb3JcbiAgICAgKiB3aWxsIGJlIGdlbmVyYXRlZCBpZiByZXR1cm4gY29kZSBpcyBub3QgemVyby4gVGhlIGdlbmVyYXRlZCBFcnJvciBoYXNcbiAgICAgKiBhIHByb3BlcnR5IFwicmV0dXJuQ29kZVwiIHdoaWNoIHByb3ZpZGVzIGNvcnJlc3BvbmRpbmcgcHJvY2VzcyByZXR1cm5cbiAgICAgKiBjb2RlLlxuICAgICAqIEBwYXJhbSByZXNvbHZlIC0gUHJvbWlzZSdzIHJlc29sdmUgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHJlamVjdCAtIFByb21pc2UncyByZWplY3QgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHJlYXNvbiAtIFByb21pc2UgdGFyZ2V0IGlmIHByb2Nlc3MgaGFzIGEgemVybyByZXR1cm4gY29kZS5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBPcHRpb25hbCBmdW5jdGlvbiB0byBjYWxsIG9mIHByb2Nlc3MgaGFzIHN1Y2Nlc3NmdWxseVxuICAgICAqIGZpbmlzaGVkLlxuICAgICAqIEByZXR1cm5zIFByb2Nlc3MgY2xvc2UgaGFuZGxlciBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0UHJvY2Vzc0Nsb3NlSGFuZGxlcihcbiAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uLCByZWFzb246YW55ID0gbnVsbCxcbiAgICAgICAgY2FsbGJhY2s6RnVuY3Rpb24gPSAoKTp2b2lkID0+IHt9XG4gICAgKTooKHJldHVybkNvZGU6P251bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBsZXQgZmluaXNoZWQ6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgIHJldHVybiAocmV0dXJuQ29kZTo/bnVtYmVyKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGlmICghZmluaXNoZWQpXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXR1cm5Db2RlICE9PSAnbnVtYmVyJyB8fCByZXR1cm5Db2RlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZWFzb24pXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3I6RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgVGFzayBleGl0ZWQgd2l0aCBlcnJvciBjb2RlICR7cmV0dXJuQ29kZX1gKVxuICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IucmV0dXJuQ29kZSA9IHJldHVybkNvZGVcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZvcndhcmRzIGdpdmVuIGNoaWxkIHByb2Nlc3MgY29tbXVuaWNhdGlvbiBjaGFubmVscyB0byBjb3JyZXNwb25kaW5nXG4gICAgICogY3VycmVudCBwcm9jZXNzIGNvbW11bmljYXRpb24gY2hhbm5lbHMuXG4gICAgICogQHBhcmFtIGNoaWxkUHJvY2VzcyAtIENoaWxkIHByb2Nlc3MgbWV0YSBkYXRhLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIGNoaWxkIHByb2Nlc3MgbWV0YSBkYXRhLlxuICAgICAqL1xuICAgIHN0YXRpYyBoYW5kbGVDaGlsZFByb2Nlc3MoY2hpbGRQcm9jZXNzOkNoaWxkUHJvY2Vzcyk6Q2hpbGRQcm9jZXNzIHtcbiAgICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5waXBlKHByb2Nlc3Muc3Rkb3V0KVxuICAgICAgICBjaGlsZFByb2Nlc3Muc3RkZXJyLnBpcGUocHJvY2Vzcy5zdGRlcnIpXG4gICAgICAgIGNoaWxkUHJvY2Vzcy5vbignY2xvc2UnLCAocmV0dXJuQ29kZTpudW1iZXIpOnZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKHJldHVybkNvZGUgIT09IDApXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVGFzayBleGl0ZWQgd2l0aCBlcnJvciBjb2RlICR7cmV0dXJuQ29kZX1gKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gY2hpbGRQcm9jZXNzXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBmaWxlIGhhbmRsZXJcbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGZpbGUgcGF0aC9uYW1lIHBsYWNlaG9sZGVyIHJlcGxhY2VtZW50cyB3aXRoIGdpdmVuIGJ1bmRsZVxuICAgICAqIGFzc29jaWF0ZWQgaW5mb3JtYXRpb25zLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aFRlbXBsYXRlIC0gRmlsZSBwYXRoIHRvIHByb2Nlc3MgcGxhY2Vob2xkZXIgaW4uXG4gICAgICogQHBhcmFtIGluZm9ybWF0aW9ucyAtIFNjb3BlIHRvIHVzZSBmb3IgcHJvY2Vzc2luZy5cbiAgICAgKiBAcmV0dXJucyBQcm9jZXNzZWQgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICBmaWxlUGF0aFRlbXBsYXRlOnN0cmluZywgaW5mb3JtYXRpb25zOntba2V5OnN0cmluZ106c3RyaW5nfSA9IHtcbiAgICAgICAgICAgICdbbmFtZV0nOiAnLl9fZHVtbXlfXycsICdbaWRdJzogJy5fX2R1bW15X18nLFxuICAgICAgICAgICAgJ1toYXNoXSc6ICcuX19kdW1teV9fJ1xuICAgICAgICB9XG4gICAgKTpzdHJpbmcge1xuICAgICAgICBsZXQgZmlsZVBhdGg6c3RyaW5nID0gZmlsZVBhdGhUZW1wbGF0ZVxuICAgICAgICBmb3IgKGNvbnN0IHBsYWNlaG9sZGVyTmFtZTpzdHJpbmcgaW4gaW5mb3JtYXRpb25zKVxuICAgICAgICAgICAgaWYgKGluZm9ybWF0aW9ucy5oYXNPd25Qcm9wZXJ0eShwbGFjZWhvbGRlck5hbWUpKVxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGgucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFJlZ3VsYXJFeHByZXNzaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXJOYW1lXG4gICAgICAgICAgICAgICAgICAgICksICdnJ1xuICAgICAgICAgICAgICAgICksIGluZm9ybWF0aW9uc1twbGFjZWhvbGRlck5hbWVdKVxuICAgICAgICByZXR1cm4gZmlsZVBhdGhcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgZ2l2ZW4gcmVxdWVzdCBwb2ludHMgdG8gYW4gZXh0ZXJuYWwgZGVwZW5kZW5jeSBub3QgbWFpbnRhaW5lZFxuICAgICAqIGJ5IGN1cnJlbnQgcGFja2FnZSBjb250ZXh0LlxuICAgICAqIEBwYXJhbSByZXF1ZXN0IC0gUmVxdWVzdCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBDb250ZXh0IG9mIGN1cnJlbnQgcHJvamVjdC5cbiAgICAgKiBAcGFyYW0gcmVxdWVzdENvbnRleHQgLSBDb250ZXh0IG9mIGdpdmVuIHJlcXVlc3QgdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uIC0gTWFwcGluZyBvZiBjaHVuayBuYW1lcyB0byBtb2R1bGVzXG4gICAgICogd2hpY2ggc2hvdWxkIGJlIGluamVjdGVkLlxuICAgICAqIEBwYXJhbSBleHRlcm5hbE1vZHVsZUxvY2F0aW9ucyAtIEFycmF5IGlmIHBhdGhzIHdoZXJlIGV4dGVybmFsIG1vZHVsZXNcbiAgICAgKiB0YWtlIHBsYWNlLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBpbmNsdWRlUGF0dGVybiAtIEFycmF5IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZXhwbGljaXRseSBtYXJrXG4gICAgICogYXMgZXh0ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAgKiBAcGFyYW0gZXhjbHVkZVBhdHRlcm4gLSBBcnJheSBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIGV4cGxpY2l0bHkgbWFya1xuICAgICAqIGFzIGludGVybmFsIGRlcGVuZGVuY3kuXG4gICAgICogQHBhcmFtIGluUGxhY2VOb3JtYWxMaWJyYXJ5IC0gSW5kaWNhdGVzIHdoZXRoZXIgbm9ybWFsIGxpYnJhcmllcyBzaG91bGRcbiAgICAgKiBiZSBleHRlcm5hbCBvciBub3QuXG4gICAgICogQHBhcmFtIGluUGxhY2VEeW5hbWljTGlicmFyeSAtIEluZGljYXRlcyB3aGV0aGVyIHJlcXVlc3RzIHdpdGhcbiAgICAgKiBpbnRlZ3JhdGVkIGxvYWRlciBjb25maWd1cmF0aW9ucyBzaG91bGQgYmUgbWFya2VkIGFzIGV4dGVybmFsIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0gZXh0ZXJuYWxIYW5kYWJsZUZpbGVFeHRlbnNpb25zIC0gRmlsZSBleHRlbnNpb25zIHdoaWNoIHNob3VsZCBiZVxuICAgICAqIGFibGUgdG8gYmUgaGFuZGxlZCBieSB0aGUgZXh0ZXJuYWwgbW9kdWxlIGJ1bmRsZXIuIElmIGFycmF5IGlzIGVtcHR5XG4gICAgICogZXZlcnkgZXh0ZW5zaW9uIHdpbGwgYmUgYXNzdW1lZCB0byBiZSBzdXBwb3J0ZWQuXG4gICAgICogQHJldHVybnMgQSBuZXcgcmVzb2x2ZWQgcmVxdWVzdCBpbmRpY2F0aW5nIHdoZXRoZXIgZ2l2ZW4gcmVxdWVzdCBpcyBhblxuICAgICAqIGV4dGVybmFsIG9uZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lRXh0ZXJuYWxSZXF1ZXN0KFxuICAgICAgICByZXF1ZXN0OnN0cmluZywgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZXF1ZXN0Q29udGV4dDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb246Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uID0ge30sXG4gICAgICAgIGV4dGVybmFsTW9kdWxlTG9jYXRpb25zOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddLFxuICAgICAgICBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGV4dGVuc2lvbnM6e2ZpbGU6QXJyYXk8c3RyaW5nPjttb2R1bGU6QXJyYXk8c3RyaW5nPn0gPSB7XG4gICAgICAgICAgICBmaWxlOiBbXG4gICAgICAgICAgICAgICAgJy5qcycsICcuY3NzJywgJy5zdmcnLCAnLnBuZycsICcuanBnJywgJy5naWYnLCAnLmljbycsICcuaHRtbCcsXG4gICAgICAgICAgICAgICAgJy5qc29uJywgJy5lb3QnLCAnLnR0ZicsICcud29mZidcbiAgICAgICAgICAgIF0sIG1vZHVsZTogW11cbiAgICAgICAgfSwgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnLi8nLCBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gWydpbmRleCcsICdtYWluJ10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJywgJ21vZHVsZSddLFxuICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXSxcbiAgICAgICAgaW5jbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgZXhjbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgaW5QbGFjZU5vcm1hbExpYnJhcnk6Ym9vbGVhbiA9IGZhbHNlLFxuICAgICAgICBpblBsYWNlRHluYW1pY0xpYnJhcnk6Ym9vbGVhbiA9IHRydWUsXG4gICAgICAgIGV4dGVybmFsSGFuZGFibGVGaWxlRXh0ZW5zaW9uczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJy5qcycsICcuY3NzJywgJy5zdmcnLCAnLnBuZycsICcuanBnJywgJy5naWYnLCAnLmljbycsICcuaHRtbCcsXG4gICAgICAgICAgICAnLmpzb24nLCAnLmVvdCcsICcudHRmJywgJy53b2ZmJ1xuICAgICAgICBdXG4gICAgKTo/c3RyaW5nIHtcbiAgICAgICAgY29udGV4dCA9IHBhdGgucmVzb2x2ZShjb250ZXh0KVxuICAgICAgICByZXF1ZXN0Q29udGV4dCA9IHBhdGgucmVzb2x2ZShyZXF1ZXN0Q29udGV4dClcbiAgICAgICAgcmVmZXJlbmNlUGF0aCA9IHBhdGgucmVzb2x2ZShyZWZlcmVuY2VQYXRoKVxuICAgICAgICAvLyBOT1RFOiBXZSBhcHBseSBhbGlhcyBvbiBleHRlcm5hbHMgYWRkaXRpb25hbGx5LlxuICAgICAgICBsZXQgcmVzb2x2ZWRSZXF1ZXN0OnN0cmluZyA9IEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICByZXF1ZXN0LnN1YnN0cmluZyhyZXF1ZXN0Lmxhc3RJbmRleE9mKCchJykgKyAxKSwgYWxpYXNlcylcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IEFsaWFzZXMgZG9lc24ndCBoYXZlIHRvIGJlIGZvcndhcmRlZCBzaW5jZSB3ZSBwYXNzIGFuIGFscmVhZHlcbiAgICAgICAgICAgIHJlc29sdmVkIHJlcXVlc3QuXG4gICAgICAgICovXG4gICAgICAgIGxldCBmaWxlUGF0aDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCB7fSwgZXh0ZW5zaW9ucywgcmVxdWVzdENvbnRleHQsIHJlZmVyZW5jZVBhdGgsXG4gICAgICAgICAgICBwYXRoc1RvSWdub3JlLCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocywgcGFja2FnZUVudHJ5RmlsZU5hbWVzLFxuICAgICAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzLCBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzKVxuICAgICAgICBpZiAoIShmaWxlUGF0aCB8fCBpblBsYWNlTm9ybWFsTGlicmFyeSkgfHwgVG9vbHMuaXNBbnlNYXRjaGluZyhcbiAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCwgaW5jbHVkZVBhdHRlcm5cbiAgICAgICAgKSlcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlZFJlcXVlc3RcbiAgICAgICAgaWYgKFRvb2xzLmlzQW55TWF0Y2hpbmcocmVzb2x2ZWRSZXF1ZXN0LCBleGNsdWRlUGF0dGVybikpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELCBhbGlhc2VzLCBleHRlbnNpb25zLCBjb250ZXh0LCByZWZlcmVuY2VQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aHNUb0lnbm9yZSwgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXMsIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgKSA9PT0gZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgbWFyayBkZXBlbmRlbmNpZXMgYXMgZXh0ZXJuYWwgaWYgdGhleSBkb2VzIG5vdCBjb250YWluIGFcbiAgICAgICAgICAgIGxvYWRlciBpbiB0aGVpciByZXF1ZXN0IGFuZCBhcmVuJ3QgcGFydCBvZiB0aGUgY3VycmVudCBtYWluIHBhY2thZ2VcbiAgICAgICAgICAgIG9yIGhhdmUgYSBmaWxlIGV4dGVuc2lvbiBvdGhlciB0aGFuIGphdmFTY3JpcHQgYXdhcmUuXG4gICAgICAgICovXG4gICAgICAgIGlmICghaW5QbGFjZU5vcm1hbExpYnJhcnkgJiYgKFxuICAgICAgICAgICAgZXh0ZXJuYWxIYW5kYWJsZUZpbGVFeHRlbnNpb25zLmxlbmd0aCA9PT0gMCB8fCBmaWxlUGF0aCAmJlxuICAgICAgICAgICAgZXh0ZXJuYWxIYW5kYWJsZUZpbGVFeHRlbnNpb25zLmluY2x1ZGVzKHBhdGguZXh0bmFtZShmaWxlUGF0aCkpIHx8XG4gICAgICAgICAgICAhZmlsZVBhdGggJiYgZXh0ZXJuYWxIYW5kYWJsZUZpbGVFeHRlbnNpb25zLmluY2x1ZGVzKCcnKVxuICAgICAgICApICYmICEoaW5QbGFjZUR5bmFtaWNMaWJyYXJ5ICYmIHJlcXVlc3QuaW5jbHVkZXMoJyEnKSkgJiYgKFxuICAgICAgICAgICAgIWZpbGVQYXRoICYmIGluUGxhY2VEeW5hbWljTGlicmFyeSB8fCBmaWxlUGF0aCAmJiAoXG4gICAgICAgICAgICAhZmlsZVBhdGguc3RhcnRzV2l0aChjb250ZXh0KSB8fCBIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgZmlsZVBhdGgsIGV4dGVybmFsTW9kdWxlTG9jYXRpb25zKSlcbiAgICAgICAgKSlcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlZFJlcXVlc3RcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGdpdmVuIHBhdGggcG9pbnRzIHRvIGEgdmFsaWQgZGlyZWN0b3J5LlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZGlyZWN0b3J5LlxuICAgICAqIEByZXR1cm5zIEEgYm9vbGVhbiB3aGljaCBpbmRpY2F0ZXMgZGlyZWN0b3J5IGV4aXN0ZW50cy5cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNEaXJlY3RvcnlTeW5jKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZVN5c3RlbS5zdGF0U3luYyhmaWxlUGF0aCkuaXNEaXJlY3RvcnkoKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGdpdmVuIHBhdGggcG9pbnRzIHRvIGEgdmFsaWQgZmlsZS5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggLSBQYXRoIHRvIGZpbGUuXG4gICAgICogQHJldHVybnMgQSBib29sZWFuIHdoaWNoIGluZGljYXRlcyBmaWxlIGV4aXN0ZW50cy5cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNGaWxlU3luYyhmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVTeXN0ZW0uc3RhdFN5bmMoZmlsZVBhdGgpLmlzRmlsZSgpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyB0aHJvdWdoIGdpdmVuIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgcmVjdXJzaXZlbHkgYW5kIGNhbGxzIGdpdmVuXG4gICAgICogY2FsbGJhY2sgZm9yIGVhY2ggZm91bmQgZmlsZS4gQ2FsbGJhY2sgZ2V0cyBmaWxlIHBhdGggYW5kIGNvcnJlc3BvbmRpbmdcbiAgICAgKiBzdGF0IG9iamVjdCBhcyBhcmd1bWVudC5cbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5UGF0aCAtIFBhdGggdG8gZGlyZWN0b3J5IHN0cnVjdHVyZSB0byB0cmF2ZXJzZS5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBpbnZva2UgZm9yIGVhY2ggdHJhdmVyc2VkIGZpbGUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIHdhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoXG4gICAgICAgIGRpcmVjdG9yeVBhdGg6c3RyaW5nLCBjYWxsYmFjazpUcmF2ZXJzZUZpbGVzQ2FsbGJhY2tGdW5jdGlvbiA9IChcbiAgICAgICAgICAgIF9maWxlUGF0aDpzdHJpbmcsIF9zdGF0Ok9iamVjdFxuICAgICAgICApOj9ib29sZWFuID0+IHRydWVcbiAgICApOlRyYXZlcnNlRmlsZXNDYWxsYmFja0Z1bmN0aW9uIHtcbiAgICAgICAgZmlsZVN5c3RlbS5yZWFkZGlyU3luYyhkaXJlY3RvcnlQYXRoKS5mb3JFYWNoKChcbiAgICAgICAgICAgIGZpbGVOYW1lOnN0cmluZ1xuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeVBhdGgsIGZpbGVOYW1lKVxuICAgICAgICAgICAgY29uc3Qgc3RhdDpPYmplY3QgPSBmaWxlU3lzdGVtLnN0YXRTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKGZpbGVQYXRoLCBzdGF0KSAhPT0gZmFsc2UgJiYgc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KFxuICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICBIZWxwZXIud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhmaWxlUGF0aCwgY2FsbGJhY2spXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBjYWxsYmFja1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgZ2l2ZW4gc291cmNlIGZpbGUgdmlhIHBhdGggdG8gZ2l2ZW4gdGFyZ2V0IGRpcmVjdG9yeSBsb2NhdGlvblxuICAgICAqIHdpdGggc2FtZSB0YXJnZXQgbmFtZSBhcyBzb3VyY2UgZmlsZSBoYXMgb3IgY29weSB0byBnaXZlbiBjb21wbGV0ZVxuICAgICAqIHRhcmdldCBmaWxlIHBhdGguXG4gICAgICogQHBhcmFtIHNvdXJjZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gY29weS5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0UGF0aCAtIFRhcmdldCBkaXJlY3Rvcnkgb3IgY29tcGxldGUgZmlsZSBsb2NhdGlvbiB0byBjb3B5XG4gICAgICogdG8uXG4gICAgICogQHJldHVybnMgRGV0ZXJtaW5lZCB0YXJnZXQgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyBjb3B5RmlsZVN5bmMoc291cmNlUGF0aDpzdHJpbmcsIHRhcmdldFBhdGg6c3RyaW5nKTpzdHJpbmcge1xuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogSWYgdGFyZ2V0IHBhdGggcmVmZXJlbmNlcyBhIGRpcmVjdG9yeSBhIG5ldyBmaWxlIHdpdGggdGhlXG4gICAgICAgICAgICBzYW1lIG5hbWUgd2lsbCBiZSBjcmVhdGVkLlxuICAgICAgICAqL1xuICAgICAgICBpZiAoSGVscGVyLmlzRGlyZWN0b3J5U3luYyh0YXJnZXRQYXRoKSlcbiAgICAgICAgICAgIHRhcmdldFBhdGggPSBwYXRoLnJlc29sdmUodGFyZ2V0UGF0aCwgcGF0aC5iYXNlbmFtZShzb3VyY2VQYXRoKSlcbiAgICAgICAgZmlsZVN5c3RlbS53cml0ZUZpbGVTeW5jKHRhcmdldFBhdGgsIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgc291cmNlUGF0aCkpXG4gICAgICAgIHJldHVybiB0YXJnZXRQYXRoXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvcGllcyBnaXZlbiBzb3VyY2UgZGlyZWN0b3J5IHZpYSBwYXRoIHRvIGdpdmVuIHRhcmdldCBkaXJlY3RvcnlcbiAgICAgKiBsb2NhdGlvbiB3aXRoIHNhbWUgdGFyZ2V0IG5hbWUgYXMgc291cmNlIGZpbGUgaGFzIG9yIGNvcHkgdG8gZ2l2ZW5cbiAgICAgKiBjb21wbGV0ZSB0YXJnZXQgZGlyZWN0b3J5IHBhdGguXG4gICAgICogQHBhcmFtIHNvdXJjZVBhdGggLSBQYXRoIHRvIGRpcmVjdG9yeSB0byBjb3B5LlxuICAgICAqIEBwYXJhbSB0YXJnZXRQYXRoIC0gVGFyZ2V0IGRpcmVjdG9yeSBvciBjb21wbGV0ZSBkaXJlY3RvcnkgbG9jYXRpb24gdG9cbiAgICAgKiBjb3B5IGluLlxuICAgICAqIEByZXR1cm5zIERldGVybWluZWQgdGFyZ2V0IGRpcmVjdG9yeSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyBjb3B5RGlyZWN0b3J5UmVjdXJzaXZlU3luYyhcbiAgICAgICAgc291cmNlUGF0aDpzdHJpbmcsIHRhcmdldFBhdGg6c3RyaW5nXG4gICAgKTpzdHJpbmcge1xuICAgICAgICAvLyBDaGVjayBpZiBmb2xkZXIgbmVlZHMgdG8gYmUgY3JlYXRlZCBvciBpbnRlZ3JhdGVkLlxuICAgICAgICBpZiAoSGVscGVyLmlzRGlyZWN0b3J5U3luYyh0YXJnZXRQYXRoKSlcbiAgICAgICAgICAgIHRhcmdldFBhdGggPSBwYXRoLnJlc29sdmUodGFyZ2V0UGF0aCwgcGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICBzb3VyY2VQYXRoKSlcbiAgICAgICAgZmlsZVN5c3RlbS5ta2RpclN5bmModGFyZ2V0UGF0aClcbiAgICAgICAgSGVscGVyLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoc291cmNlUGF0aCwgKFxuICAgICAgICAgICAgY3VycmVudFNvdXJjZVBhdGg6c3RyaW5nLCBzdGF0Ok9iamVjdFxuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFRhcmdldFBhdGg6c3RyaW5nID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgIHRhcmdldFBhdGgsIGN1cnJlbnRTb3VyY2VQYXRoLnN1YnN0cmluZyhzb3VyY2VQYXRoLmxlbmd0aCkpXG4gICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0ubWtkaXJTeW5jKGN1cnJlbnRUYXJnZXRQYXRoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEhlbHBlci5jb3B5RmlsZVN5bmMoY3VycmVudFNvdXJjZVBhdGgsIGN1cnJlbnRUYXJnZXRQYXRoKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gdGFyZ2V0UGF0aFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgYXNzZXQgdHlwZSBpZiBnaXZlbiBmaWxlLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBhbmFseXNlLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb24gLSBNZXRhIGluZm9ybWF0aW9ucyBmb3IgYXZhaWxhYmxlIGFzc2V0XG4gICAgICogdHlwZXMuXG4gICAgICogQHBhcmFtIHBhdGhzIC0gTGlzdCBvZiBwYXRocyB0byBzZWFyY2ggaWYgZ2l2ZW4gcGF0aCBkb2Vzbid0IHJlZmVyZW5jZVxuICAgICAqIGEgZmlsZSBkaXJlY3RseS5cbiAgICAgKiBAcmV0dXJucyBEZXRlcm1pbmVkIGZpbGUgdHlwZSBvciBcIm51bGxcIiBvZiBnaXZlbiBmaWxlIGNvdWxkbid0IGJlXG4gICAgICogZGV0ZXJtaW5lZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIGJ1aWxkQ29uZmlndXJhdGlvbjpCdWlsZENvbmZpZ3VyYXRpb24sIHBhdGhzOlBhdGhcbiAgICApOj9zdHJpbmcge1xuICAgICAgICBsZXQgcmVzdWx0Oj9zdHJpbmcgPSBudWxsXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gYnVpbGRDb25maWd1cmF0aW9uKVxuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShcbiAgICAgICAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICAgICAgKSA9PT0gYC4ke2J1aWxkQ29uZmlndXJhdGlvblt0eXBlXS5leHRlbnNpb259YCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHR5cGVcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydzb3VyY2UnLCAndGFyZ2V0J10pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFR5cGU6c3RyaW5nIGluIHBhdGhzW3R5cGVdLmFzc2V0KVxuICAgICAgICAgICAgICAgICAgICBpZiAocGF0aHNbdHlwZV0uYXNzZXQuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGVcbiAgICAgICAgICAgICAgICAgICAgKSAmJiBhc3NldFR5cGUgIT09ICdiYXNlJyAmJlxuICAgICAgICAgICAgICAgICAgICBwYXRoc1t0eXBlXS5hc3NldFthc3NldFR5cGVdICYmIGZpbGVQYXRoLnN0YXJ0c1dpdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoc1t0eXBlXS5hc3NldFthc3NldFR5cGVdXG4gICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzZXRUeXBlXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHByb3BlcnR5IHdpdGggYSBzdG9yZWQgYXJyYXkgb2YgYWxsIG1hdGNoaW5nIGZpbGUgcGF0aHMsIHdoaWNoXG4gICAgICogbWF0Y2hlcyBlYWNoIGJ1aWxkIGNvbmZpZ3VyYXRpb24gaW4gZ2l2ZW4gZW50cnkgcGF0aCBhbmQgY29udmVydHMgZ2l2ZW5cbiAgICAgKiBidWlsZCBjb25maWd1cmF0aW9uIGludG8gYSBzb3J0ZWQgYXJyYXkgd2VyZSBqYXZhU2NyaXB0IGZpbGVzIHRha2VzXG4gICAgICogcHJlY2VkZW5jZS5cbiAgICAgKiBAcGFyYW0gY29uZmlndXJhdGlvbiAtIEdpdmVuIGJ1aWxkIGNvbmZpZ3VyYXRpb25zLlxuICAgICAqIEBwYXJhbSBlbnRyeVBhdGggLSBQYXRoIHRvIGFuYWx5c2UgbmVzdGVkIHN0cnVjdHVyZS5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcmV0dXJucyBDb252ZXJ0ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZUJ1aWxkQ29uZmlndXJhdGlvbkZpbGVQYXRocyhcbiAgICAgICAgY29uZmlndXJhdGlvbjpCdWlsZENvbmZpZ3VyYXRpb24sIGVudHJ5UGF0aDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXVxuICAgICk6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24ge1xuICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24gPSBbXVxuICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW06UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtID1cbiAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtmaWxlUGF0aHM6IFtdfSwgY29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVdKVxuICAgICAgICAgICAgICAgIEhlbHBlci53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKGVudHJ5UGF0aCwgKChcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6bnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25JdGVtOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbVxuICAgICAgICAgICAgICAgICk6VHJhdmVyc2VGaWxlc0NhbGxiYWNrRnVuY3Rpb24gPT4gKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIHN0YXQ6T2JqZWN0XG4gICAgICAgICAgICAgICAgKTo/Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oZmlsZVBhdGgsIHBhdGhzVG9JZ25vcmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LmlzRmlsZSgpICYmIHBhdGguZXh0bmFtZShmaWxlUGF0aCkuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICApID09PSBidWlsZENvbmZpZ3VyYXRpb25JdGVtLmV4dGVuc2lvbiAmJiAhKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25JdGVtLmZpbGVQYXRoUGF0dGVyblxuICAgICAgICAgICAgICAgICAgICApKS50ZXN0KGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0uZmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgfSkoaW5kZXgsIG5ld0l0ZW0pKVxuICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5wdXNoKG5ld0l0ZW0pXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnVpbGRDb25maWd1cmF0aW9uLnNvcnQoKFxuICAgICAgICAgICAgZmlyc3Q6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtLFxuICAgICAgICAgICAgc2Vjb25kOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbVxuICAgICAgICApOm51bWJlciA9PiB7XG4gICAgICAgICAgICBpZiAoZmlyc3Qub3V0cHV0RXh0ZW5zaW9uICE9PSBzZWNvbmQub3V0cHV0RXh0ZW5zaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Lm91dHB1dEV4dGVuc2lvbiA9PT0gJ2pzJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgaWYgKHNlY29uZC5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpcnN0Lm91dHB1dEV4dGVuc2lvbiA8IHNlY29uZC5vdXRwdXRFeHRlbnNpb24gPyAtMSA6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIGZpbGUgYW5kIGRpcmVjdG9yeSBwYXRocyByZWxhdGVkIHRvIGdpdmVuIGludGVybmFsXG4gICAgICogbW9kdWxlcyBhcyBhcnJheS5cbiAgICAgKiBAcGFyYW0gaW50ZXJuYWxJbmplY3Rpb24gLSBMaXN0IG9mIG1vZHVsZSBpZHMgb3IgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbnMgLSBMaXN0IG9mIGZpbGUgYW5kIG1vZHVsZSBleHRlbnNpb25zIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gc2VhcmNoIGZvciBsb2NhbCBtb2R1bGVzLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocyAtIExpc3Qgb2YgcmVsYXRpdmUgZmlsZSBwYXRoIHRvIHNlYXJjaFxuICAgICAqIGZvciBtb2R1bGVzIGluLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlRW50cnlGaWxlTmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZW50cnkgZmlsZSBuYW1lcyB0b1xuICAgICAqIHNlYXJjaCBmb3IuIFRoZSBtYWdpYyBuYW1lIFwiX19wYWNrYWdlX19cIiB3aWxsIHNlYXJjaCBmb3IgYW4gYXBwcmVjaWF0ZVxuICAgICAqIGVudHJ5IGluIGEgXCJwYWNrYWdlLmpzb25cIiBmaWxlLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBtYWluIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHJlcHJlc2VudGluZyBlbnRyeSBtb2R1bGUgZGVmaW5pdGlvbnMuXG4gICAgICogQHBhcmFtIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBhbGlhcyBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSBzcGVjaWZpYyBtb2R1bGUgYWxpYXNlcy5cbiAgICAgKiBAcmV0dXJucyBPYmplY3Qgd2l0aCBhIGZpbGUgcGF0aCBhbmQgZGlyZWN0b3J5IHBhdGgga2V5IG1hcHBpbmcgdG9cbiAgICAgKiBjb3JyZXNwb25kaW5nIGxpc3Qgb2YgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgaW50ZXJuYWxJbmplY3Rpb246SW50ZXJuYWxJbmplY3Rpb24sIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczp7ZmlsZTpBcnJheTxzdHJpbmc+O21vZHVsZTpBcnJheTxzdHJpbmc+fSA9IHtcbiAgICAgICAgICAgIGZpbGU6IFtcbiAgICAgICAgICAgICAgICAnLmpzJywgJy5jc3MnLCAnLnN2ZycsICcucG5nJywgJy5qcGcnLCAnLmdpZicsICcuaWNvJywgJy5odG1sJyxcbiAgICAgICAgICAgICAgICAnLmpzb24nLCAnLmVvdCcsICcudHRmJywgJy53b2ZmJ1xuICAgICAgICAgICAgXSwgbW9kdWxlOiBbXVxuICAgICAgICB9LCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gWycnLCAnbm9kZV9tb2R1bGVzJywgJy4uLyddLFxuICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICdfX3BhY2thZ2VfXycsICcnLCAnaW5kZXgnLCAnbWFpbiddLFxuICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnbWFpbicsICdtb2R1bGUnXSxcbiAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gW11cbiAgICApOntmaWxlUGF0aHM6QXJyYXk8c3RyaW5nPjtkaXJlY3RvcnlQYXRoczpBcnJheTxzdHJpbmc+fSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbjpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gPVxuICAgICAgICAgICAgSGVscGVyLm5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKGludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgXSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQsIGFsaWFzZXMsIGV4dGVuc2lvbnMsIGNvbnRleHQsIHJlZmVyZW5jZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoc1RvSWdub3JlLCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lcywgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcylcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHMucHVzaChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGg6c3RyaW5nID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkaXJlY3RvcnlQYXRocy5pbmNsdWRlcyhkaXJlY3RvcnlQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RvcnlQYXRocy5wdXNoKGRpcmVjdG9yeVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiB7ZmlsZVBhdGhzLCBkaXJlY3RvcnlQYXRoc31cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGxpc3Qgb2YgY29uY3JldGUgZmlsZSBwYXRocyBmb3IgZ2l2ZW4gbW9kdWxlIGlkIHBvaW50aW5nXG4gICAgICogdG8gYSBmb2xkZXIgd2hpY2ggaXNuJ3QgYSBwYWNrYWdlLlxuICAgICAqIEBwYXJhbSBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gLSBJbmplY3Rpb24gZGF0YSBzdHJ1Y3R1cmUgb2ZcbiAgICAgKiBtb2R1bGVzIHdpdGggZm9sZGVyIHJlZmVyZW5jZXMgdG8gcmVzb2x2ZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gZGV0ZXJtaW5lIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9ucyB3aXRoIHJlc29sdmVkIGZvbGRlciBwb2ludGluZyBtb2R1bGVzLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbixcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBleHRlbnNpb25zOntmaWxlOkFycmF5PHN0cmluZz47bW9kdWxlOkFycmF5PHN0cmluZz59ID0ge1xuICAgICAgICAgICAgZmlsZTogW1xuICAgICAgICAgICAgICAgICcuanMnLCAnLmNzcycsICcuc3ZnJywgJy5wbmcnLCAnLmpwZycsICcuZ2lmJywgJy5pY28nLCAnLmh0bWwnLFxuICAgICAgICAgICAgICAgICcuanNvbicsICcuZW90JywgJy50dGYnLCAnLndvZmYnXG4gICAgICAgICAgICBdLCBtb2R1bGU6IFtdXG4gICAgICAgIH0sIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiB7XG4gICAgICAgIGlmIChyZWZlcmVuY2VQYXRoLnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlbGF0aXZlKGNvbnRleHQsIHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICBpZiAobm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlBbGlhc2VzKFxuICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKG1vZHVsZUlEKSwgYWxpYXNlcylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aDpzdHJpbmcgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBtb2R1bGVJRClcbiAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0RpcmVjdG9yeVN5bmMoZGlyZWN0b3J5UGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKGRpcmVjdG9yeVBhdGgsIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIHN0YXQ6T2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICApOj9mYWxzZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKGRpcmVjdG9yeVBhdGgsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LmlzRmlsZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXS5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZWxhdGl2ZShyZWZlcmVuY2VQYXRoLCBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5UGF0aCwgZmlsZVBhdGgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvblxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFdmVyeSBpbmplY3Rpb24gZGVmaW5pdGlvbiB0eXBlIGNhbiBiZSByZXByZXNlbnRlZCBhcyBwbGFpbiBvYmplY3RcbiAgICAgKiAobWFwcGluZyBmcm9tIGNodW5rIG5hbWUgdG8gYXJyYXkgb2YgbW9kdWxlIGlkcykuIFRoaXMgbWV0aG9kIGNvbnZlcnRzXG4gICAgICogZWFjaCByZXByZXNlbnRhdGlvbiBpbnRvIHRoZSBub3JtYWxpemVkIHBsYWluIG9iamVjdCBub3RhdGlvbi5cbiAgICAgKiBAcGFyYW0gaW50ZXJuYWxJbmplY3Rpb24gLSBHaXZlbiBpbnRlcm5hbCBpbmplY3Rpb24gdG8gbm9ybWFsaXplLlxuICAgICAqIEByZXR1cm5zIE5vcm1hbGl6ZWQgcmVwcmVzZW50YXRpb24gb2YgZ2l2ZW4gaW50ZXJuYWwgaW5qZWN0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyBub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihcbiAgICAgICAgaW50ZXJuYWxJbmplY3Rpb246SW50ZXJuYWxJbmplY3Rpb25cbiAgICApOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiB7XG4gICAgICAgIGxldCByZXN1bHQ6Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uID0ge31cbiAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uIGluc3RhbmNlb2YgT2JqZWN0ICYmIFRvb2xzLmlzUGxhaW5PYmplY3QoXG4gICAgICAgICAgICBpbnRlcm5hbEluamVjdGlvblxuICAgICAgICApKSB7XG4gICAgICAgICAgICBsZXQgaGFzQ29udGVudDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgICAgIGNvbnN0IGNodW5rTmFtZXNUb0RlbGV0ZTpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBpbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY2h1bmtOYW1lXSA9IGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZXNUb0RlbGV0ZS5wdXNoKGNodW5rTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NodW5rTmFtZV0gPSBbaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc0NvbnRlbnQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIG9mIGNodW5rTmFtZXNUb0RlbGV0ZSlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJlc3VsdFtjaHVua05hbWVdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBbXX1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW50ZXJuYWxJbmplY3Rpb24gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBbaW50ZXJuYWxJbmplY3Rpb25dfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGludGVybmFsSW5qZWN0aW9uKSlcbiAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogaW50ZXJuYWxJbmplY3Rpb259XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgY29uY3JldGUgZmlsZSBwYXRocyBmb3IgZ2l2ZW4gaW5qZWN0aW9uIHdoaWNoIGFyZSBtYXJrZWRcbiAgICAgKiB3aXRoIHRoZSBcIl9fYXV0b19fXCIgaW5kaWNhdG9yLlxuICAgICAqIEBwYXJhbSBnaXZlbkluamVjdGlvbiAtIEdpdmVuIGludGVybmFsIGFuZCBleHRlcm5hbCBpbmplY3Rpb24gdG8gdGFrZVxuICAgICAqIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9ucyAtIFJlc29sdmVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHBhcmFtIG1vZHVsZXNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyB0byBleGNsdWRlIChzcGVjaWZpZWQgYnlcbiAgICAgKiBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0byBtb2R1bGUgaWRzLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHVzZSBhcyBzdGFydGluZyBwb2ludC5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFJlZmVyZW5jZSBwYXRoIGZyb20gd2hlcmUgbG9jYWwgZmlsZXMgc2hvdWxkIGJlXG4gICAgICogcmVzb2x2ZWQuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9uIHdpdGggcmVzb2x2ZWQgbWFya2VkIGluZGljYXRvcnMuXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVJbmplY3Rpb24oXG4gICAgICAgIGdpdmVuSW5qZWN0aW9uOkluamVjdGlvbixcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlc1RvRXhjbHVkZTpJbnRlcm5hbEluamVjdGlvbixcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBleHRlbnNpb25zOntmaWxlOkFycmF5PHN0cmluZz47bW9kdWxlOkFycmF5PHN0cmluZz59ID0ge1xuICAgICAgICAgICAgZmlsZTogW1xuICAgICAgICAgICAgICAgICcuanMnLCAnLmNzcycsICcuc3ZnJywgJy5wbmcnLCAnLmpwZycsICcuZ2lmJywgJy5pY28nLCAnLmh0bWwnLFxuICAgICAgICAgICAgICAgICcuanNvbicsICcuZW90JywgJy50dGYnLCAnLndvZmYnXG4gICAgICAgICAgICBdLCBtb2R1bGU6IFtdXG4gICAgICAgIH0sIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOkluamVjdGlvbiB7XG4gICAgICAgIGNvbnN0IGluamVjdGlvbjpJbmplY3Rpb24gPSBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICB0cnVlLCB7fSwgZ2l2ZW5JbmplY3Rpb24pXG4gICAgICAgIGNvbnN0IG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZTpBcnJheTxzdHJpbmc+ID1cbiAgICAgICAgICAgIEhlbHBlci5kZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgICAgICAgICAgICAgbW9kdWxlc1RvRXhjbHVkZSwgYWxpYXNlcywgZXh0ZW5zaW9ucywgY29udGV4dCwgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICApLmZpbGVQYXRoc1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnaW50ZXJuYWwnLCAnZXh0ZXJuYWwnXSlcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGN1cmx5ICovXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluamVjdGlvblt0eXBlXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gaW5qZWN0aW9uW3R5cGVdKVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0gPT09ICdfX2F1dG9fXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZXM6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtrZXk6c3RyaW5nXTpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnMsIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJDaHVua05hbWU6c3RyaW5nIGluIG1vZHVsZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZHVsZXMuaGFzT3duUHJvcGVydHkoc3ViQ2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0ucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZXNbc3ViQ2h1bmtOYW1lXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmV2ZXJzZSBhcnJheSB0byBsZXQgamF2YVNjcmlwdCBmaWxlcyBiZSB0aGUgbGFzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uZXMgdG8gZXhwb3J0IHRoZW0gcmF0aGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnJldmVyc2UoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluamVjdGlvblt0eXBlXSA9PT0gJ19fYXV0b19fJylcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgY3VybHkgKi9cbiAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV0gPSBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zLCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsIGNvbnRleHQpXG4gICAgICAgIHJldHVybiBpbmplY3Rpb25cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbnMgLSBSZXNvbHZlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqIEBwYXJhbSBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyBmaWxlIHBhdGhzIHRvXG4gICAgICogZXhjbHVkZSAoc3BlY2lmaWVkIGJ5IHBhdGggb3IgaWQpIG9yIGEgbWFwcGluZyBmcm9tIGNodW5rIG5hbWVzIHRvXG4gICAgICogbW9kdWxlIGlkcy5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byB1c2UgYXMgc3RhcnRpbmcgcG9pbnQuXG4gICAgICogQHJldHVybnMgQWxsIGRldGVybWluZWQgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGdldEF1dG9DaHVuayhcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlOkFycmF5PHN0cmluZz4sIGNvbnRleHQ6c3RyaW5nXG4gICAgKTp7W2tleTpzdHJpbmddOnN0cmluZ30ge1xuICAgICAgICBjb25zdCByZXN1bHQ6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge31cbiAgICAgICAgY29uc3QgaW5qZWN0ZWRCYXNlTmFtZXM6e1trZXk6c3RyaW5nXTpBcnJheTxzdHJpbmc+fSA9IHt9XG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtIG9mXG4gICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zXG4gICAgICAgICkge1xuICAgICAgICAgICAgaWYgKCFpbmplY3RlZEJhc2VOYW1lc1tidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXSlcbiAgICAgICAgICAgICAgICBpbmplY3RlZEJhc2VOYW1lc1tidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXSA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUZpbGVQYXRoOnN0cmluZyBvZiBidWlsZENvbmZpZ3VyYXRpb24uZmlsZVBhdGhzKVxuICAgICAgICAgICAgICAgIGlmICghbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLmluY2x1ZGVzKG1vZHVsZUZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoOnN0cmluZyA9IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFzZU5hbWU6c3RyaW5nID0gcGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBgLiR7YnVpbGRDb25maWd1cmF0aW9uLmV4dGVuc2lvbn1gKVxuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgRW5zdXJlIHRoYXQgZWFjaCBvdXRwdXQgdHlwZSBoYXMgb25seSBvbmUgc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmplY3RlZEJhc2VOYW1lc1tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgXS5pbmNsdWRlcyhiYXNlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRW5zdXJlIHRoYXQgc2FtZSBiYXNlbmFtZXMgYW5kIGRpZmZlcmVudCBvdXRwdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlcyBjYW4gYmUgZGlzdGluZ3Vpc2hlZCBieSB0aGVpciBleHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoSmF2YVNjcmlwdC1Nb2R1bGVzIHJlbWFpbnMgd2l0aG91dCBleHRlbnNpb24gc2luY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGV5IHdpbGwgYmUgaGFuZGxlZCBmaXJzdCBiZWNhdXNlIHRoZSBidWlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zIGFyZSBleHBlY3RlZCB0byBiZSBzb3J0ZWQgaW4gdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQpLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHRbYmFzZU5hbWVdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtyZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbYmFzZU5hbWVdID0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0ZWRCYXNlTmFtZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgXS5wdXNoKGJhc2VOYW1lKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbnMgLSBMaXN0IG9mIGZpbGUgYW5kIG1vZHVsZSBleHRlbnNpb25zIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gZGV0ZXJtaW5lIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEByZXR1cm5zIEZpbGUgcGF0aCBvciBnaXZlbiBtb2R1bGUgaWQgaWYgZGV0ZXJtaW5hdGlvbnMgaGFzIGZhaWxlZCBvclxuICAgICAqIHdhc24ndCBuZWNlc3NhcnkuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICBtb2R1bGVJRDpzdHJpbmcsIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczp7ZmlsZTpBcnJheTxzdHJpbmc+O21vZHVsZTpBcnJheTxzdHJpbmc+fSA9IHtcbiAgICAgICAgICAgIGZpbGU6IFtcbiAgICAgICAgICAgICAgICAnLmpzJywgJy5jc3MnLCAnLnN2ZycsICcucG5nJywgJy5qcGcnLCAnLmdpZicsICcuaWNvJywgJy5odG1sJyxcbiAgICAgICAgICAgICAgICAnLmpzb24nLCAnLmVvdCcsICcudHRmJywgJy53b2ZmJ1xuICAgICAgICAgICAgXSwgbW9kdWxlOiBbXVxuICAgICAgICB9LCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ2luZGV4J10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJ10sXG4gICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgKTo/c3RyaW5nIHtcbiAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlBbGlhc2VzKEhlbHBlci5zdHJpcExvYWRlcihtb2R1bGVJRCksIGFsaWFzZXMpXG4gICAgICAgIGlmICghbW9kdWxlSUQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBsZXQgbW9kdWxlRmlsZVBhdGg6c3RyaW5nID0gbW9kdWxlSURcbiAgICAgICAgaWYgKG1vZHVsZUZpbGVQYXRoLnN0YXJ0c1dpdGgoJy4vJykpXG4gICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCA9IHBhdGguam9pbihjb250ZXh0LCBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgZm9yIChjb25zdCBtb2R1bGVMb2NhdGlvbjpzdHJpbmcgb2YgW3JlZmVyZW5jZVBhdGhdLmNvbmNhdChcbiAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUocmVmZXJlbmNlUGF0aCwgZmlsZVBhdGgpKVxuICAgICAgICApKVxuICAgICAgICAgICAgZm9yIChsZXQgZmlsZU5hbWU6c3RyaW5nIG9mIFsnJywgJ19fcGFja2FnZV9fJ10uY29uY2F0KFxuICAgICAgICAgICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lc1xuICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUV4dGVuc2lvbjpzdHJpbmcgb2YgWycnXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMubW9kdWxlXG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlRXh0ZW5zaW9uOnN0cmluZyBvZiBbJyddLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuZmlsZVxuICAgICAgICAgICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudE1vZHVsZUZpbGVQYXRoOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZHVsZUZpbGVQYXRoLnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlTG9jYXRpb24sIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhY2thZ2VBbGlhc2VzOlBsYWluT2JqZWN0ID0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ19fcGFja2FnZV9fJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNEaXJlY3RvcnlTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhUb1BhY2thZ2VKU09OOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCwgJ3BhY2thZ2UuanNvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlU3luYyhwYXRoVG9QYWNrYWdlSlNPTikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2NhbENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb24gPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhUb1BhY2thZ2VKU09OLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCd9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWU6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsQ29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAmJiBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWU6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbENvbmZpZ3VyYXRpb24uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiYgbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc2VzID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ19fcGFja2FnZV9fJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSwgcGFja2FnZUFsaWFzZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2ZpbGVOYW1lfSR7bW9kdWxlRXh0ZW5zaW9ufSR7ZmlsZUV4dGVuc2lvbn1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCArPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtmaWxlTmFtZX0ke21vZHVsZUV4dGVuc2lvbn0ke2ZpbGVFeHRlbnNpb259YFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGgsIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlU3luYyhjdXJyZW50TW9kdWxlRmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50TW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBUaGUgYWxpYXMgYXBwbGllZCBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICovXG4gICAgc3RhdGljIGFwcGx5QWxpYXNlcyhtb2R1bGVJRDpzdHJpbmcsIGFsaWFzZXM6UGxhaW5PYmplY3QpOnN0cmluZyB7XG4gICAgICAgIGZvciAoY29uc3QgYWxpYXM6c3RyaW5nIGluIGFsaWFzZXMpXG4gICAgICAgICAgICBpZiAoYWxpYXMuZW5kc1dpdGgoJyQnKSkge1xuICAgICAgICAgICAgICAgIGlmIChtb2R1bGVJRCA9PT0gYWxpYXMuc3Vic3RyaW5nKDAsIGFsaWFzLmxlbmd0aCAtIDEpKVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IGFsaWFzZXNbYWxpYXNdXG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnJlcGxhY2UoYWxpYXMsIGFsaWFzZXNbYWxpYXNdKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURcbiAgICB9XG59XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19