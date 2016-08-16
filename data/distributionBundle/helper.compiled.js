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

var _child_process = require('child_process');

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}
// endregion
// region declarations
// NOTE: This declaration isn't needed if flow knows javaScript's native
// "Proxy" in future.

// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
class Helper {
    // region boolean
    /**
     * Checks weather one of the given pattern matches given string.
     * @param target - Target to check in pattern for.
     * @param pattern - List of pattern to check for.
     * @returns Value "true" if given object is matches by at leas one of the
     * given pattern and "false" otherwise.
     */
    static isAnyMatching(target, pattern) {
        for (const currentPattern of pattern) if (typeof currentPattern === 'string') {
            if (currentPattern === target) return true;
        } else if (currentPattern.test(target)) return true;
        return false;
    }
    /**
     * Checks weather given object is a plain native object.
     * @param object - Object to check.
     * @returns Value "true" if given object is a plain javaScript object and
     * "false" otherwise.
     */
    static isPlainObject(object) {
        return typeof object === 'object' && object !== null && Object.getPrototypeOf(object) === Object.prototype;
    }
    /**
     * Checks weather given object is a function.
     * @param object - Object to check.
     * @returns Value "true" if given object is a function and "false"
     * otherwise.
     */
    static isFunction(object) {
        return Boolean(object) && {}.toString.call(object) === '[object Function]';
    }
    /**
     * Determines whether given file path is within given list of file
     * locations.
     * @param filePath - Path to file to check.
     * @param locationsToCheck - Locations to take into account.
     * @returns Value "true" if given file path is within one of given
     * locations or "false" otherwise.
     */
    static isFilePathInLocation(filePath, locationsToCheck) {
        for (const pathToCheck of locationsToCheck) if (_path2.default.resolve(filePath).startsWith(_path2.default.resolve(pathToCheck))) return true;
        return false;
    }
    // endregion
    // region data handling
    /**
     * Converts given object into its serialized json representation by
     * replacing circular references with a given provided value.
     * @param object - Object to serialize.
     * @param determineCicularReferenceValue - Callback to create a fallback
     * value depending on given redundant value.
     * @param numberOfSpaces - Number of spaces to use for string formatting.
     */
    static convertCircularObjectToJSON(object, determineCicularReferenceValue = () => '__circularReference__', numberOfSpaces = 0) {
        const seenObjects = [];
        return JSON.stringify(object, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seenObjects.includes(value)) return determineCicularReferenceValue(key, value, seenObjects);
                seenObjects.push(value);
                return value;
            }
            return value;
        }, numberOfSpaces);
    }
    /**
     * Converts given serialized or base64 encoded string into a javaScript
     * one if possible.
     * @param serializedObject - Object as string.
     * @param scope - An optional scope which will be used to evaluate given
     * object in.
     * @param name - The name under given scope will be available.
     * @returns The parsed object if possible and null otherwise.
     */
    static parseEncodedObject(serializedObject, scope = {}, name = 'scope') {
        if (!serializedObject.startsWith('{')) serializedObject = Buffer.from(serializedObject, 'base64').toString('utf8');
        try {
            // IgnoreTypeCheck
            return new Function(name, `return ${ serializedObject }`)(scope);
        } catch (error) {}
        return null;
    }
    /**
     * Replaces given pattern in each value in given object recursively with
     * given string replacement.
     * @param object - Object to convert substrings in.
     * @param pattern - Regular expression to replace.
     * @param replacement - String to use as replacement for found patterns.
     * @returns Converted object with replaced patterns.
     */
    static convertSubstringInPlainObject(object, pattern, replacement) {
        for (const key in object) if (object.hasOwnProperty(key)) if (Helper.isPlainObject(object[key])) object[key] = Helper.convertSubstringInPlainObject(object[key], pattern, replacement);else if (typeof object[key] === 'string') object[key] = object[key].replace(pattern, replacement);
        return object;
    }
    /**
     * Extends given target object with given sources object. As target and
     * sources many expandable types are allowed but target and sources have to
     * to come from the same type.
     * @param targetOrDeepIndicator - Maybe the target or deep indicator.
     * @param _targetAndOrSources - Target and at least one source object.
     * @returns Returns given target extended with all given sources.
     */
    static extendObject(targetOrDeepIndicator, ..._targetAndOrSources) {
        let index = 1;
        let deep = false;
        let target;
        if (typeof targetOrDeepIndicator === 'boolean') {
            // Handle a deep copy situation and skip deep indicator and target.
            deep = targetOrDeepIndicator;
            target = arguments[index];
            index = 2;
        } else target = targetOrDeepIndicator;
        const mergeValue = (key, value, targetValue) => {
            if (value === targetValue) return targetValue;
            // Recurse if we're merging plain objects or maps.
            if (deep && value && (Helper.isPlainObject(value) || value instanceof Map)) {
                let clone;
                if (value instanceof Map) clone = targetValue && targetValue instanceof Map ? targetValue : new Map();else clone = targetValue && Helper.isPlainObject(targetValue) ? targetValue : {};
                return Helper.extendObject(deep, clone, value);
            }
            return value;
        };
        while (index < arguments.length) {
            const source = arguments[index];
            let targetType = typeof target;
            let sourceType = typeof source;
            if (target instanceof Map) targetType += ' Map';
            if (source instanceof Map) sourceType += ' Map';
            if (targetType === sourceType && target !== source) {
                if (target instanceof Map && source instanceof Map) for (const [key, value] of source) target.set(key, mergeValue(key, value, target.get(key)));else if (Helper.isPlainObject(target) && Helper.isPlainObject(source)) {
                    for (const key in source) if (source.hasOwnProperty(key)) target[key] = mergeValue(key, source[key], target[key]);
                } else target = source;
            } else target = source;
            index += 1;
        }
        return target;
    }
    /**
     * Removes a proxies from given data structure recursivley.
     * @param object - Object to proxy.
     * @param seenObjects - Tracks all already processed obejcts to avoid
     * endless loops (usually only needed for internal prupose).
     * @returns Returns given object unwrapped from a dynamic proxy.
     */
    static unwrapProxy(object, seenObjects = []) {
        if (object !== null && typeof object === 'object') {
            while (object.__target__) object = object.__target__;
            const index = seenObjects.indexOf(object);
            if (index !== -1) return seenObjects[index];
            seenObjects.push(object);
            if (Array.isArray(object)) {
                let index = 0;
                for (const value of object) {
                    object[index] = Helper.unwrapProxy(value, seenObjects);
                    index += 1;
                }
            } else if (object instanceof Map) for (const [key, value] of object) object.set(key, Helper.unwrapProxy(value, seenObjects));else for (const key in object) if (object.hasOwnProperty(key)) object[key] = Helper.unwrapProxy(object[key], seenObjects);
        }
        return object;
    }
    /**
     * Adds dynamic getter and setter to any given data structure such as maps.
     * @param object - Object to proxy.
     * @param getterWrapper - Function to wrap each property get.
     * @param setterWrapper - Function to wrap each property set.
     * @param getterMethodName - Method name to get a stored value by key.
     * @param setterMethodName - Method name to set a stored value by key.
     * @param containesMethodName - Method name to indicate if a key is stored
     * in given data structure.
     * @param deep - Indicates to perform a deep wrapping of specified types.
     * performed via "value instanceof type".).
     * @param typesToExtend - Types which should be extended (Checks are
     * performed via "value instanceof type".).
     * @returns Returns given object wrapped with a dynamic getter proxy.
     */
    static addDynamicGetterAndSetter(object, getterWrapper = value => value, setterWrapper = (key, value) => value, getterMethodName = '[]', setterMethodName = '[]', containesMethodName = 'hasOwnProperty', deep = true, typesToExtend = [Object]) {
        if (deep) if (object instanceof Map) for (const [key, value] of object) object.set(key, Helper.addDynamicGetterAndSetter(value, getterWrapper, setterWrapper, getterMethodName, setterMethodName, containesMethodName, deep, typesToExtend));else if (typeof object === 'object' && object !== null) {
            for (const key in object) if (object.hasOwnProperty(key)) object[key] = Helper.addDynamicGetterAndSetter(object[key], getterWrapper, setterWrapper, getterMethodName, setterMethodName, containesMethodName, deep, typesToExtend);
        } else if (Array.isArray(object)) {
            let index = 0;
            for (const value of object) {
                object[index] = Helper.addDynamicGetterAndSetter(value, getterWrapper, setterWrapper, getterMethodName, setterMethodName, containesMethodName, deep, typesToExtend);
                index += 1;
            }
        }
        for (const type of typesToExtend) if (object instanceof type) {
            if (object.__target__) return object;
            const handler = {};
            if (containesMethodName) handler.has = (target, name) => {
                if (containesMethodName === '[]') return name in target;
                return target[containesMethodName](name);
            };
            if (containesMethodName && getterMethodName) handler.get = (target, name) => {
                if (name === '__target__') return target;
                if (typeof target[name] === 'function') return target[name].bind(target);
                if (target[containesMethodName](name)) {
                    if (getterMethodName === '[]') return getterWrapper(target[name]);
                    return getterWrapper(target[getterMethodName](name));
                }
                return target[name];
            };
            if (setterMethodName) handler.set = (target, name, value) => {
                if (setterMethodName === '[]') target[name] = setterWrapper(name, value);else target[setterMethodName](name, setterWrapper(name, value));
            };
            return new Proxy(object, handler);
        }
        return object;
    }
    /**
     * Searches for nested mappings with given indicator key and resolves
     * marked values. Additionally all objects are wrapped with a proxy to
     * dynamically resolve nested properties.
     * @param object - Given mapping to resolve.
     * @param configuration - Configuration context to resolve marked values.
     * @param deep - Indicates weather to perform a recursive resolving.
     * @param evaluationIndicatorKey - Indicator property name to mark a value
     * to evaluate.
     * @param executionIndicatorKey - Indicator property name to mark a value
     * to evaluate.
     * @param configurationKeyName - Name under the given configuration name
     * should be provided to evaluation or execution contexts.
     * @returns Evaluated given mapping.
     */
    static resolveDynamicDataStructure(object, configuration = null, deep = true, evaluationIndicatorKey = '__evaluate__', executionIndicatorKey = '__execute__', configurationKeyName = 'self') {
        if (object === null || typeof object !== 'object') return object;
        if (configuration === null) configuration = object;
        if (deep && configuration && !configuration.__target__) configuration = Helper.addDynamicGetterAndSetter(configuration, value => Helper.resolveDynamicDataStructure(value, configuration, false, evaluationIndicatorKey, executionIndicatorKey, configurationKeyName), (key, value) => value, '[]', '');
        if (Array.isArray(object) && deep) {
            let index = 0;
            for (const value of object) {
                object[index] = Helper.resolveDynamicDataStructure(value, configuration, deep, evaluationIndicatorKey, executionIndicatorKey, configurationKeyName);
                index += 1;
            }
        } else for (const key in object) if (object.hasOwnProperty(key)) if ([evaluationIndicatorKey, executionIndicatorKey].includes(key)) try {
            const evaluationFunction = new Function(configurationKeyName, 'webOptimizerPath', 'currentPath', 'path', 'helper', (key === evaluationIndicatorKey ? 'return ' : '') + object[key]);
            return Helper.resolveDynamicDataStructure(evaluationFunction(configuration, __dirname, process.cwd(), _path2.default, Helper), configuration, false, evaluationIndicatorKey, executionIndicatorKey, configurationKeyName);
        } catch (error) {
            throw Error('Error during ' + (key === evaluationIndicatorKey ? 'executing' : 'evaluating') + ` "${ object[key] }": ${ error }`);
        } else if (deep) object[key] = Helper.resolveDynamicDataStructure(object[key], configuration, deep, evaluationIndicatorKey, executionIndicatorKey, configurationKeyName);
        return object;
    }
    // endregion
    // region string handling
    /**
     * Translates given string into the regular expression validated
     * representation.
     * @param value - String to convert.
     * @param excludeSymbols - Symbols not to escape.
     * @returns Converted string.
     */
    static convertToValidRegularExpressionString(value, excludeSymbols = []) {
        // NOTE: This is only for performance improvements.
        if (value.length === 1 && !Helper.specialRegexSequences.includes(value)) return value;
        // The escape sequence must also be escaped; but at first.
        if (!excludeSymbols.includes('\\')) value.replace(/\\/g, '\\\\');
        for (const replace of Helper.specialRegexSequences) if (!excludeSymbols.includes(replace)) value = value.replace(new RegExp(`\\${ replace }`, 'g'), `\\${ replace }`);
        return value;
    }
    /**
     * Translates given name into a valid javaScript one.
     * @param name - Name to convert.
     * @param allowedSymbols - String of symbols which should be allowed within
     * a variable name (not the first character).
     * @returns Converted name is returned.
     */
    static convertToValidVariableName(name, allowedSymbols = '0-9a-zA-Z_$') {
        return name.replace(/^[^a-zA-Z_$]+/, '').replace(new RegExp(`[^${ allowedSymbols }]+([a-zA-Z0-9])`, 'g'), (fullMatch, firstLetter) => firstLetter.toUpperCase());
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
    static getProcessCloseHandler(resolve, reject, reason = null, callback = () => {}) {
        let finished = false;
        return returnCode => {
            if (!finished) if (typeof returnCode !== 'number' || returnCode === 0) {
                callback();
                resolve(reason);
            } else {
                const error = new Error(`Task exited with error code ${ returnCode }`);
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
    static handleChildProcess(childProcess) {
        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);
        childProcess.on('close', returnCode => {
            if (returnCode !== 0) console.error(`Task exited with error code ${ returnCode }`);
        });
        return childProcess;
    }
    // endregion
    // region file handler
    /**
     * Checks if given path points to a valid file.
     * @param filePath - Path to file.
     * @returns A boolean which indicates file existents.
     */
    static isFileSync(filePath) {
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
    static walkDirectoryRecursivelySync(directoryPath, callback = (_filePath, _stat) => true) {
        fileSystem.readdirSync(directoryPath).forEach(fileName => {
            const filePath = _path2.default.resolve(directoryPath, fileName);
            const stat = fileSystem.statSync(filePath);
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
    static copyFileSync(sourcePath, targetPath) {
        /*
            NOTE: If target path references a directory a new file with the
            same name will be created.
        */
        try {
            if (fileSystem.lstatSync(targetPath).isDirectory()) targetPath = _path2.default.join(targetPath, _path2.default.basename(sourcePath));
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
    static copyDirectoryRecursiveSync(sourcePath, targetPath) {
        try {
            // Check if folder needs to be created or integrated.
            if (fileSystem.lstatSync(targetPath).isDirectory()) targetPath = _path2.default.join(targetPath, _path2.default.basename(sourcePath));
        } catch (error) {}
        fileSystem.mkdirSync(targetPath);
        Helper.walkDirectoryRecursivelySync(sourcePath, (currentSourcePath, stat) => {
            const currentTargetPath = _path2.default.join(targetPath, currentSourcePath.substring(sourcePath.length));
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
    static determineAssetType(filePath, buildConfiguration, paths) {
        let result = null;
        for (const type in buildConfiguration) if (_path2.default.extname(filePath) === `.${ buildConfiguration[type].extension }`) {
            result = type;
            break;
        }
        if (!result) for (const type of ['source', 'target']) for (const assetType in paths.asset) if (paths.asset[assetType].startsWith(_path2.default.join(paths[type], paths.asset[assetType]))) return assetType;
        return result;
    }
    /**
     * Adds a property with a stored array of all matching file paths, which
     * matches each build configuration in given entry path and converts given
     * build configuration into a sorted array were javaScript files takes
     * precedence.
     * @param configuration - Given build configurations.
     * @param entryPath - Path to analyse nested structure.
     * @param context - Path to set paths relative to and determine relative
     * ignored paths to.
     * @param pathsToIgnore - Paths which marks location to ignore (Relative
     * paths are resolved relatively to given context.).
     * @returns Converted build configuration.
     */
    static resolveBuildConfigurationFilePaths(configuration, entryPath = './', context = './', pathsToIgnore = ['.git']) {
        const buildConfiguration = [];
        let index = 0;
        for (const type in configuration) if (configuration.hasOwnProperty(type)) {
            const newItem = Helper.extendObject(true, { filePaths: [] }, configuration[type]);
            Helper.walkDirectoryRecursivelySync(entryPath, ((index, buildConfigurationItem) => (filePath, stat) => {
                if (Helper.isFilePathInLocation(filePath, pathsToIgnore)) return false;
                if (stat.isFile() && _path2.default.extname(filePath).substring(1) === buildConfigurationItem.extension && !new RegExp(buildConfigurationItem.fileNamePattern).test(filePath)) buildConfigurationItem.filePaths.push(filePath);
            })(index, newItem));
            buildConfiguration.push(newItem);
            index += 1;
        }
        return buildConfiguration.sort((first, second) => {
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
     * @param internalInjection - List of moduleIDs or module file paths.
     * @param moduleAliases - Mapping of aliases to take into account.
     * @param knownExtensions - List of file extensions to take into account.
     * @param context - File path to resolve relative to.
     * @returns Object with a file path and directory path key mapping to
     * corresponding list of paths.
     */
    static determineModuleLocations(internalInjection, moduleAliases = {}, knownExtensions = ['.js'], context = './') {
        const filePaths = [];
        const directoryPaths = [];
        const normalizedInternalInjection = Helper.normalizeInternalInjection(internalInjection);
        for (const chunkName in normalizedInternalInjection) if (normalizedInternalInjection.hasOwnProperty(chunkName)) for (const moduleID of normalizedInternalInjection[chunkName]) {
            const filePath = Helper.determineModuleFilePath(moduleID, moduleAliases, knownExtensions, context);
            filePaths.push(filePath);
            const directoryPath = _path2.default.dirname(filePath);
            if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
        }
        return { filePaths, directoryPaths };
    }
    /**
     * Every injection definition type can be represented as plain object
     * (mapping from chunk name to array of module ids). This method converts
     * each representation into the normalized plain object notation.
     * @param internalInjection - Given internal injection to normalize.
     * @returns Normalized representation of given internal injection.
     */
    static normalizeInternalInjection(internalInjection) {
        let result = {};
        if (internalInjection instanceof Object && Helper.isPlainObject(internalInjection)) {
            let hasContent = false;
            const chunkNamesToDelete = [];
            for (const chunkName in internalInjection) if (internalInjection.hasOwnProperty(chunkName)) if (Array.isArray(internalInjection[chunkName])) {
                if (internalInjection[chunkName].length > 0) {
                    hasContent = true;
                    result[chunkName] = internalInjection[chunkName];
                } else chunkNamesToDelete.push(chunkName);
            } else {
                hasContent = true;
                result[chunkName] = [internalInjection[chunkName]];
            }
            if (hasContent) for (const chunkName of chunkNamesToDelete) delete result[chunkName];else result = { index: [] };
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
     * @param pathsToIgnore - Paths which marks location to ignore (Relative
     * paths are resolved relatively to given context.).
     * @returns Given injection with resolved marked indicators.
     */
    static resolveInjection(givenInjection, buildConfigurations, modulesToExclude, moduleAliases = {}, knownExtensions = ['.js', '.css', '.svg', '.html'], context = './', pathsToIgnore = ['.git']) {
        const injection = Helper.extendObject(true, {}, givenInjection);
        const moduleFilePathsToExclude = Helper.determineModuleLocations(modulesToExclude, moduleAliases, knownExtensions, context, pathsToIgnore).filePaths;
        for (const type of ['internal', 'external'])
        /* eslint-disable curly */
        if (typeof injection[type] === 'object') {
            for (const chunkName in injection[type]) if (injection[type][chunkName] === '__auto__') {
                injection[type][chunkName] = [];
                const modules = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context);
                for (const subChunkName in modules) if (modules.hasOwnProperty(subChunkName)) injection[type][chunkName].push(modules[subChunkName]);
            }
        } else if (injection[type] === '__auto__')
            /* eslint-enable curly */
            injection[type] = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context);
        return injection;
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
    static getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context) {
        const result = {};
        const injectedBaseNames = {};
        for (const buildConfiguration of buildConfigurations) {
            if (!injectedBaseNames[buildConfiguration.outputExtension]) injectedBaseNames[buildConfiguration.outputExtension] = [];
            for (const moduleFilePath of buildConfiguration.filePaths) if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                const baseName = _path2.default.basename(moduleFilePath, `.${ buildConfiguration.extension }`);
                /*
                    Ensure that each output type has only one source
                    representation.
                */
                if (!injectedBaseNames[buildConfiguration.outputExtension].includes(baseName)) {
                    /*
                        Ensure that if same basenames and different output
                        types can be distinguished by their extension
                        (JavaScript-Modules remains without extension since
                        they will be handled first because the build
                        configurations are expected to be sorted in this
                        context).
                    */
                    if (result[baseName]) result[_path2.default.relative(context, moduleFilePath)] = moduleFilePath;else result[baseName] = moduleFilePath;
                    injectedBaseNames[buildConfiguration.outputExtension].push(baseName);
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
     * @param relativeModuleFilePaths - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @returns File path or given module id if determinations has failed or
     * wasn't necessary.
     */
    static determineModuleFilePath(moduleID, moduleAliases = {}, knownExtensions = ['.js'], context = './', relativeModuleFilePaths = ['', 'node_modules', '../'], packageEntryFileNames = ['__package__', '', 'index', 'main']) {
        moduleID = Helper.applyAliases(moduleID, moduleAliases);
        for (const moduleLocation of relativeModuleFilePaths) for (let fileName of packageEntryFileNames) for (const extension of knownExtensions) {
            let moduleFilePath = moduleID;
            if (!moduleFilePath.startsWith('/')) moduleFilePath = _path2.default.join(context, moduleLocation, moduleFilePath);
            if (fileName === '__package__') {
                try {
                    if (fileSystem.statSync(moduleFilePath).isDirectory()) {
                        const pathToPackageJSON = _path2.default.join(moduleFilePath, 'package.json');
                        if (fileSystem.statSync(pathToPackageJSON).isFile()) {
                            const localConfiguration = JSON.parse(fileSystem.readFileSync(pathToPackageJSON, {
                                encoding: 'utf-8' }));
                            if (localConfiguration.main) fileName = localConfiguration.main;
                        }
                    }
                } catch (error) {}
                if (fileName === '__package__') continue;
            }
            moduleFilePath = _path2.default.join(moduleFilePath, fileName);
            moduleFilePath += extension;
            try {
                if (fileSystem.statSync(moduleFilePath).isFile()) return moduleFilePath;
            } catch (error) {}
        }
        return moduleID;
    }
    // endregion
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     * @returns The alias applied given module id.
     */
    static applyAliases(moduleID, aliases) {
        for (const alias in aliases) if (alias.endsWith('$')) {
            if (moduleID === alias.substring(0, alias.length - 1)) moduleID = aliases[alias];
        } else moduleID = moduleID.replace(alias, aliases[alias]);
        return moduleID;
    }
}
exports.default = Helper; // endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

Helper.specialRegexSequences = ['-', '[', ']', '(', ')', '^', '$', '*', '+', '.', '{', '}'];

//# sourceMappingURL=data:application/json;base64,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TyxLQUFQLEVBQWMsQ0FBRTtBQUNsQixvQkFBSSxhQUFhLGFBQWpCLEVBQ0k7QUFDUDtBQUNELDZCQUFpQixlQUFLLElBQUwsQ0FBVSxjQUFWLEVBQTBCLFFBQTFCLENBQWpCO0FBQ0EsOEJBQWtCLFNBQWxCO0FBQ0EsZ0JBQUk7QUFDQSxvQkFBSSxXQUFXLFFBQVgsQ0FBb0IsY0FBcEIsRUFBb0MsTUFBcEMsRUFBSixFQUNJLE9BQU8sY0FBUDtBQUNQLGFBSEQsQ0FHRSxPQUFPLEtBQVAsRUFBYyxDQUFFO0FBQ3JCO0FBQ1QsZUFBTyxRQUFQO0FBQ0g7QUFDRDtBQUNBOzs7Ozs7QUFNQSxXQUFPLFlBQVAsQ0FBb0IsUUFBcEIsRUFBcUMsT0FBckMsRUFBaUU7QUFDN0QsYUFBSyxNQUFNLEtBQVgsSUFBMkIsT0FBM0IsRUFDSSxJQUFJLE1BQU0sUUFBTixDQUFlLEdBQWYsQ0FBSixFQUF5QjtBQUNyQixnQkFBSSxhQUFhLE1BQU0sU0FBTixDQUFnQixDQUFoQixFQUFtQixNQUFNLE1BQU4sR0FBZSxDQUFsQyxDQUFqQixFQUNJLFdBQVcsUUFBUSxLQUFSLENBQVg7QUFDUCxTQUhELE1BSUksV0FBVyxTQUFTLE9BQVQsQ0FBaUIsS0FBakIsRUFBd0IsUUFBUSxLQUFSLENBQXhCLENBQVg7QUFDUixlQUFPLFFBQVA7QUFDSDtBQXA1QnVCO2tCQUFQLE0sRUFzNUJyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTE1QnFCLE0sQ0FDVixxQixHQUFzQyxDQUN6QyxHQUR5QyxFQUNwQyxHQURvQyxFQUMvQixHQUQrQixFQUMxQixHQUQwQixFQUNyQixHQURxQixFQUNoQixHQURnQixFQUNYLEdBRFcsRUFDTixHQURNLEVBQ0QsR0FEQyxFQUNJLEdBREosRUFDUyxHQURULEVBQ2MsR0FEZCxDIiwiZmlsZSI6ImhlbHBlci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQge0NoaWxkUHJvY2Vzc30gZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IHR5cGUge1xuICAgIEJ1aWxkQ29uZmlndXJhdGlvbiwgRXZhbHVhdGlvbkZ1bmN0aW9uLCBHZXR0ZXJGdW5jdGlvbiwgSW5qZWN0aW9uLFxuICAgIEludGVybmFsSW5qZWN0aW9uLCBOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24sIFBhdGhzLCBQbGFpbk9iamVjdCxcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiwgUmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtLCBTZXR0ZXJGdW5jdGlvbixcbiAgICBUcmF2ZXJzZUZpbGVzQ2FsbGJhY2tGdW5jdGlvblxufSBmcm9tICcuL3R5cGUnXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBkZWNsYXJhdGlvbnNcbi8vIE5PVEU6IFRoaXMgZGVjbGFyYXRpb24gaXNuJ3QgbmVlZGVkIGlmIGZsb3cga25vd3MgamF2YVNjcmlwdCdzIG5hdGl2ZVxuLy8gXCJQcm94eVwiIGluIGZ1dHVyZS5cbmRlY2xhcmUgY2xhc3MgUHJveHkge1xuICAgIGNvbnN0cnVjdG9yKG9iamVjdDphbnksIGhhbmRsZXI6T2JqZWN0KTphbnlcbn1cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIG1ldGhvZHNcbi8qKlxuICogUHJvdmlkZXMgYSBjbGFzcyBvZiBzdGF0aWMgbWV0aG9kcyB3aXRoIGdlbmVyaWMgdXNlIGNhc2VzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZWxwZXIge1xuICAgIHN0YXRpYyBzcGVjaWFsUmVnZXhTZXF1ZW5jZXM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgJy0nLCAnWycsICddJywgJygnLCAnKScsICdeJywgJyQnLCAnKicsICcrJywgJy4nLCAneycsICd9J107XG4gICAgLy8gcmVnaW9uIGJvb2xlYW5cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2VhdGhlciBvbmUgb2YgdGhlIGdpdmVuIHBhdHRlcm4gbWF0Y2hlcyBnaXZlbiBzdHJpbmcuXG4gICAgICogQHBhcmFtIHRhcmdldCAtIFRhcmdldCB0byBjaGVjayBpbiBwYXR0ZXJuIGZvci5cbiAgICAgKiBAcGFyYW0gcGF0dGVybiAtIExpc3Qgb2YgcGF0dGVybiB0byBjaGVjayBmb3IuXG4gICAgICogQHJldHVybnMgVmFsdWUgXCJ0cnVlXCIgaWYgZ2l2ZW4gb2JqZWN0IGlzIG1hdGNoZXMgYnkgYXQgbGVhcyBvbmUgb2YgdGhlXG4gICAgICogZ2l2ZW4gcGF0dGVybiBhbmQgXCJmYWxzZVwiIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNBbnlNYXRjaGluZyh0YXJnZXQ6c3RyaW5nLCBwYXR0ZXJuOkFycmF5PHN0cmluZ3xSZWdFeHA+KTpib29sZWFuIHtcbiAgICAgICAgZm9yIChjb25zdCBjdXJyZW50UGF0dGVybjpSZWdFeHB8c3RyaW5nIG9mIHBhdHRlcm4pXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnRQYXR0ZXJuID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UGF0dGVybiA9PT0gdGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50UGF0dGVybi50ZXN0KHRhcmdldCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3ZWF0aGVyIGdpdmVuIG9iamVjdCBpcyBhIHBsYWluIG5hdGl2ZSBvYmplY3QuXG4gICAgICogQHBhcmFtIG9iamVjdCAtIE9iamVjdCB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyBWYWx1ZSBcInRydWVcIiBpZiBnaXZlbiBvYmplY3QgaXMgYSBwbGFpbiBqYXZhU2NyaXB0IG9iamVjdCBhbmRcbiAgICAgKiBcImZhbHNlXCIgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc1BsYWluT2JqZWN0KG9iamVjdDptaXhlZCk6Ym9vbGVhbiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QgIT09IG51bGwgJiZcbiAgICAgICAgICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpID09PSBPYmplY3QucHJvdG90eXBlKVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2VhdGhlciBnaXZlbiBvYmplY3QgaXMgYSBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0gb2JqZWN0IC0gT2JqZWN0IHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIFZhbHVlIFwidHJ1ZVwiIGlmIGdpdmVuIG9iamVjdCBpcyBhIGZ1bmN0aW9uIGFuZCBcImZhbHNlXCJcbiAgICAgKiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgc3RhdGljIGlzRnVuY3Rpb24ob2JqZWN0Om1peGVkKTpib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4ob2JqZWN0KSAmJiB7fS50b1N0cmluZy5jYWxsKFxuICAgICAgICAgICAgb2JqZWN0XG4gICAgICAgICkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSdcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGdpdmVuIGZpbGUgcGF0aCBpcyB3aXRoaW4gZ2l2ZW4gbGlzdCBvZiBmaWxlXG4gICAgICogbG9jYXRpb25zLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBjaGVjay5cbiAgICAgKiBAcGFyYW0gbG9jYXRpb25zVG9DaGVjayAtIExvY2F0aW9ucyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBWYWx1ZSBcInRydWVcIiBpZiBnaXZlbiBmaWxlIHBhdGggaXMgd2l0aGluIG9uZSBvZiBnaXZlblxuICAgICAqIGxvY2F0aW9ucyBvciBcImZhbHNlXCIgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBsb2NhdGlvbnNUb0NoZWNrOkFycmF5PHN0cmluZz5cbiAgICApOmJvb2xlYW4ge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGhUb0NoZWNrOnN0cmluZyBvZiBsb2NhdGlvbnNUb0NoZWNrKVxuICAgICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShmaWxlUGF0aCkuc3RhcnRzV2l0aChwYXRoLnJlc29sdmUocGF0aFRvQ2hlY2spKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGRhdGEgaGFuZGxpbmdcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBnaXZlbiBvYmplY3QgaW50byBpdHMgc2VyaWFsaXplZCBqc29uIHJlcHJlc2VudGF0aW9uIGJ5XG4gICAgICogcmVwbGFjaW5nIGNpcmN1bGFyIHJlZmVyZW5jZXMgd2l0aCBhIGdpdmVuIHByb3ZpZGVkIHZhbHVlLlxuICAgICAqIEBwYXJhbSBvYmplY3QgLSBPYmplY3QgdG8gc2VyaWFsaXplLlxuICAgICAqIEBwYXJhbSBkZXRlcm1pbmVDaWN1bGFyUmVmZXJlbmNlVmFsdWUgLSBDYWxsYmFjayB0byBjcmVhdGUgYSBmYWxsYmFja1xuICAgICAqIHZhbHVlIGRlcGVuZGluZyBvbiBnaXZlbiByZWR1bmRhbnQgdmFsdWUuXG4gICAgICogQHBhcmFtIG51bWJlck9mU3BhY2VzIC0gTnVtYmVyIG9mIHNwYWNlcyB0byB1c2UgZm9yIHN0cmluZyBmb3JtYXR0aW5nLlxuICAgICAqL1xuICAgIHN0YXRpYyBjb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgIG9iamVjdDpPYmplY3QsIGRldGVybWluZUNpY3VsYXJSZWZlcmVuY2VWYWx1ZTooKFxuICAgICAgICAgICAga2V5OnN0cmluZywgdmFsdWU6YW55LCBzZWVuZE9iamVjdHM6QXJyYXk8YW55PlxuICAgICAgICApID0+IGFueSkgPSAoKTpzdHJpbmcgPT4gJ19fY2lyY3VsYXJSZWZlcmVuY2VfXycsXG4gICAgICAgIG51bWJlck9mU3BhY2VzOm51bWJlciA9IDBcbiAgICApOnN0cmluZyB7XG4gICAgICAgIGNvbnN0IHNlZW5PYmplY3RzOkFycmF5PGFueT4gPSBbXVxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqZWN0LCAoa2V5OnN0cmluZywgdmFsdWU6YW55KTphbnkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2Vlbk9iamVjdHMuaW5jbHVkZXModmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGV0ZXJtaW5lQ2ljdWxhclJlZmVyZW5jZVZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5LCB2YWx1ZSwgc2Vlbk9iamVjdHMpXG4gICAgICAgICAgICAgICAgc2Vlbk9iamVjdHMucHVzaCh2YWx1ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICB9LCBudW1iZXJPZlNwYWNlcylcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZ2l2ZW4gc2VyaWFsaXplZCBvciBiYXNlNjQgZW5jb2RlZCBzdHJpbmcgaW50byBhIGphdmFTY3JpcHRcbiAgICAgKiBvbmUgaWYgcG9zc2libGUuXG4gICAgICogQHBhcmFtIHNlcmlhbGl6ZWRPYmplY3QgLSBPYmplY3QgYXMgc3RyaW5nLlxuICAgICAqIEBwYXJhbSBzY29wZSAtIEFuIG9wdGlvbmFsIHNjb3BlIHdoaWNoIHdpbGwgYmUgdXNlZCB0byBldmFsdWF0ZSBnaXZlblxuICAgICAqIG9iamVjdCBpbi5cbiAgICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIHVuZGVyIGdpdmVuIHNjb3BlIHdpbGwgYmUgYXZhaWxhYmxlLlxuICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgb2JqZWN0IGlmIHBvc3NpYmxlIGFuZCBudWxsIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2VFbmNvZGVkT2JqZWN0KFxuICAgICAgICBzZXJpYWxpemVkT2JqZWN0OnN0cmluZywgc2NvcGU6T2JqZWN0ID0ge30sIG5hbWU6c3RyaW5nID0gJ3Njb3BlJ1xuICAgICk6P1BsYWluT2JqZWN0IHtcbiAgICAgICAgaWYgKCFzZXJpYWxpemVkT2JqZWN0LnN0YXJ0c1dpdGgoJ3snKSlcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRPYmplY3QgPSBCdWZmZXIuZnJvbShcbiAgICAgICAgICAgICAgICBzZXJpYWxpemVkT2JqZWN0LCAnYmFzZTY0J1xuICAgICAgICAgICAgKS50b1N0cmluZygndXRmOCcpXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24obmFtZSwgYHJldHVybiAke3NlcmlhbGl6ZWRPYmplY3R9YCkoc2NvcGUpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXBsYWNlcyBnaXZlbiBwYXR0ZXJuIGluIGVhY2ggdmFsdWUgaW4gZ2l2ZW4gb2JqZWN0IHJlY3Vyc2l2ZWx5IHdpdGhcbiAgICAgKiBnaXZlbiBzdHJpbmcgcmVwbGFjZW1lbnQuXG4gICAgICogQHBhcmFtIG9iamVjdCAtIE9iamVjdCB0byBjb252ZXJ0IHN1YnN0cmluZ3MgaW4uXG4gICAgICogQHBhcmFtIHBhdHRlcm4gLSBSZWd1bGFyIGV4cHJlc3Npb24gdG8gcmVwbGFjZS5cbiAgICAgKiBAcGFyYW0gcmVwbGFjZW1lbnQgLSBTdHJpbmcgdG8gdXNlIGFzIHJlcGxhY2VtZW50IGZvciBmb3VuZCBwYXR0ZXJucy5cbiAgICAgKiBAcmV0dXJucyBDb252ZXJ0ZWQgb2JqZWN0IHdpdGggcmVwbGFjZWQgcGF0dGVybnMuXG4gICAgICovXG4gICAgc3RhdGljIGNvbnZlcnRTdWJzdHJpbmdJblBsYWluT2JqZWN0KFxuICAgICAgICBvYmplY3Q6UGxhaW5PYmplY3QsIHBhdHRlcm46UmVnRXhwLCByZXBsYWNlbWVudDpzdHJpbmdcbiAgICApOlBsYWluT2JqZWN0IHtcbiAgICAgICAgZm9yIChjb25zdCBrZXk6c3RyaW5nIGluIG9iamVjdClcbiAgICAgICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSlcbiAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzUGxhaW5PYmplY3Qob2JqZWN0W2tleV0pKVxuICAgICAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSA9IEhlbHBlci5jb252ZXJ0U3Vic3RyaW5nSW5QbGFpbk9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFtrZXldLCBwYXR0ZXJuLCByZXBsYWNlbWVudClcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygb2JqZWN0W2tleV0gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSA9IG9iamVjdFtrZXldLnJlcGxhY2UocGF0dGVybiwgcmVwbGFjZW1lbnQpXG4gICAgICAgIHJldHVybiBvYmplY3RcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXh0ZW5kcyBnaXZlbiB0YXJnZXQgb2JqZWN0IHdpdGggZ2l2ZW4gc291cmNlcyBvYmplY3QuIEFzIHRhcmdldCBhbmRcbiAgICAgKiBzb3VyY2VzIG1hbnkgZXhwYW5kYWJsZSB0eXBlcyBhcmUgYWxsb3dlZCBidXQgdGFyZ2V0IGFuZCBzb3VyY2VzIGhhdmUgdG9cbiAgICAgKiB0byBjb21lIGZyb20gdGhlIHNhbWUgdHlwZS5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0T3JEZWVwSW5kaWNhdG9yIC0gTWF5YmUgdGhlIHRhcmdldCBvciBkZWVwIGluZGljYXRvci5cbiAgICAgKiBAcGFyYW0gX3RhcmdldEFuZE9yU291cmNlcyAtIFRhcmdldCBhbmQgYXQgbGVhc3Qgb25lIHNvdXJjZSBvYmplY3QuXG4gICAgICogQHJldHVybnMgUmV0dXJucyBnaXZlbiB0YXJnZXQgZXh0ZW5kZWQgd2l0aCBhbGwgZ2l2ZW4gc291cmNlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgZXh0ZW5kT2JqZWN0KFxuICAgICAgICB0YXJnZXRPckRlZXBJbmRpY2F0b3I6Ym9vbGVhbnxhbnksIC4uLl90YXJnZXRBbmRPclNvdXJjZXM6QXJyYXk8YW55PlxuICAgICk6YW55IHtcbiAgICAgICAgbGV0IGluZGV4Om51bWJlciA9IDFcbiAgICAgICAgbGV0IGRlZXA6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgIGxldCB0YXJnZXQ6bWl4ZWRcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRPckRlZXBJbmRpY2F0b3IgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgLy8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvbiBhbmQgc2tpcCBkZWVwIGluZGljYXRvciBhbmQgdGFyZ2V0LlxuICAgICAgICAgICAgZGVlcCA9IHRhcmdldE9yRGVlcEluZGljYXRvclxuICAgICAgICAgICAgdGFyZ2V0ID0gYXJndW1lbnRzW2luZGV4XVxuICAgICAgICAgICAgaW5kZXggPSAyXG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0T3JEZWVwSW5kaWNhdG9yXG4gICAgICAgIGNvbnN0IG1lcmdlVmFsdWUgPSAoa2V5OnN0cmluZywgdmFsdWU6YW55LCB0YXJnZXRWYWx1ZTphbnkpOmFueSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHRhcmdldFZhbHVlKVxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRWYWx1ZVxuICAgICAgICAgICAgLy8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgbWFwcy5cbiAgICAgICAgICAgIGlmIChkZWVwICYmIHZhbHVlICYmIChcbiAgICAgICAgICAgICAgICBIZWxwZXIuaXNQbGFpbk9iamVjdCh2YWx1ZSkgfHwgdmFsdWUgaW5zdGFuY2VvZiBNYXBcbiAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICBsZXQgY2xvbmU6YW55XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTWFwKVxuICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHRhcmdldFZhbHVlICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhbHVlIGluc3RhbmNlb2YgTWFwXG4gICAgICAgICAgICAgICAgICAgICkgPyB0YXJnZXRWYWx1ZSA6IG5ldyBNYXAoKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY2xvbmUgPSB0YXJnZXRWYWx1ZSAmJiBIZWxwZXIuaXNQbGFpbk9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhbHVlXG4gICAgICAgICAgICAgICAgICAgICkgPyB0YXJnZXRWYWx1ZSA6IHt9XG4gICAgICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5leHRlbmRPYmplY3QoZGVlcCwgY2xvbmUsIHZhbHVlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlOmFueSA9IGFyZ3VtZW50c1tpbmRleF1cbiAgICAgICAgICAgIGxldCB0YXJnZXRUeXBlOnN0cmluZyA9IHR5cGVvZiB0YXJnZXRcbiAgICAgICAgICAgIGxldCBzb3VyY2VUeXBlOnN0cmluZyA9IHR5cGVvZiBzb3VyY2VcbiAgICAgICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBNYXApXG4gICAgICAgICAgICAgICAgdGFyZ2V0VHlwZSArPSAnIE1hcCdcbiAgICAgICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBNYXApXG4gICAgICAgICAgICAgICAgc291cmNlVHlwZSArPSAnIE1hcCdcbiAgICAgICAgICAgIGlmICh0YXJnZXRUeXBlID09PSBzb3VyY2VUeXBlICYmIHRhcmdldCAhPT0gc291cmNlKVxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBNYXAgJiYgc291cmNlIGluc3RhbmNlb2YgTWFwKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXk6c3RyaW5nLCB2YWx1ZTphbnldIG9mIHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5zZXQoa2V5LCBtZXJnZVZhbHVlKGtleSwgdmFsdWUsIHRhcmdldC5nZXQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5KSkpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoSGVscGVyLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiBIZWxwZXIuaXNQbGFpbk9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgc291cmNlXG4gICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleTpzdHJpbmcgaW4gc291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gbWVyZ2VWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LCBzb3VyY2Vba2V5XSwgdGFyZ2V0W2tleV0pXG4gICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHNvdXJjZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHNvdXJjZVxuICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXRcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHByb3hpZXMgZnJvbSBnaXZlbiBkYXRhIHN0cnVjdHVyZSByZWN1cnNpdmxleS5cbiAgICAgKiBAcGFyYW0gb2JqZWN0IC0gT2JqZWN0IHRvIHByb3h5LlxuICAgICAqIEBwYXJhbSBzZWVuT2JqZWN0cyAtIFRyYWNrcyBhbGwgYWxyZWFkeSBwcm9jZXNzZWQgb2JlamN0cyB0byBhdm9pZFxuICAgICAqIGVuZGxlc3MgbG9vcHMgKHVzdWFsbHkgb25seSBuZWVkZWQgZm9yIGludGVybmFsIHBydXBvc2UpLlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgZ2l2ZW4gb2JqZWN0IHVud3JhcHBlZCBmcm9tIGEgZHluYW1pYyBwcm94eS5cbiAgICAgKi9cbiAgICBzdGF0aWMgdW53cmFwUHJveHkob2JqZWN0OmFueSwgc2Vlbk9iamVjdHM6QXJyYXk8YW55PiA9IFtdKTphbnkge1xuICAgICAgICBpZiAob2JqZWN0ICE9PSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB3aGlsZSAob2JqZWN0Ll9fdGFyZ2V0X18pXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gb2JqZWN0Ll9fdGFyZ2V0X19cbiAgICAgICAgICAgIGNvbnN0IGluZGV4Om51bWJlciA9IHNlZW5PYmplY3RzLmluZGV4T2Yob2JqZWN0KVxuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gc2Vlbk9iamVjdHNbaW5kZXhdXG4gICAgICAgICAgICBzZWVuT2JqZWN0cy5wdXNoKG9iamVjdClcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdmFsdWU6bWl4ZWQgb2Ygb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFtpbmRleF0gPSBIZWxwZXIudW53cmFwUHJveHkodmFsdWUsIHNlZW5PYmplY3RzKVxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmplY3QgaW5zdGFuY2VvZiBNYXApXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBba2V5Om1peGVkLCB2YWx1ZTptaXhlZF0gb2Ygb2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICBvYmplY3Quc2V0KGtleSwgSGVscGVyLnVud3JhcFByb3h5KHZhbHVlLCBzZWVuT2JqZWN0cykpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXk6c3RyaW5nIGluIG9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2tleV0gPSBIZWxwZXIudW53cmFwUHJveHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2tleV0sIHNlZW5PYmplY3RzKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmplY3RcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBkeW5hbWljIGdldHRlciBhbmQgc2V0dGVyIHRvIGFueSBnaXZlbiBkYXRhIHN0cnVjdHVyZSBzdWNoIGFzIG1hcHMuXG4gICAgICogQHBhcmFtIG9iamVjdCAtIE9iamVjdCB0byBwcm94eS5cbiAgICAgKiBAcGFyYW0gZ2V0dGVyV3JhcHBlciAtIEZ1bmN0aW9uIHRvIHdyYXAgZWFjaCBwcm9wZXJ0eSBnZXQuXG4gICAgICogQHBhcmFtIHNldHRlcldyYXBwZXIgLSBGdW5jdGlvbiB0byB3cmFwIGVhY2ggcHJvcGVydHkgc2V0LlxuICAgICAqIEBwYXJhbSBnZXR0ZXJNZXRob2ROYW1lIC0gTWV0aG9kIG5hbWUgdG8gZ2V0IGEgc3RvcmVkIHZhbHVlIGJ5IGtleS5cbiAgICAgKiBAcGFyYW0gc2V0dGVyTWV0aG9kTmFtZSAtIE1ldGhvZCBuYW1lIHRvIHNldCBhIHN0b3JlZCB2YWx1ZSBieSBrZXkuXG4gICAgICogQHBhcmFtIGNvbnRhaW5lc01ldGhvZE5hbWUgLSBNZXRob2QgbmFtZSB0byBpbmRpY2F0ZSBpZiBhIGtleSBpcyBzdG9yZWRcbiAgICAgKiBpbiBnaXZlbiBkYXRhIHN0cnVjdHVyZS5cbiAgICAgKiBAcGFyYW0gZGVlcCAtIEluZGljYXRlcyB0byBwZXJmb3JtIGEgZGVlcCB3cmFwcGluZyBvZiBzcGVjaWZpZWQgdHlwZXMuXG4gICAgICogcGVyZm9ybWVkIHZpYSBcInZhbHVlIGluc3RhbmNlb2YgdHlwZVwiLikuXG4gICAgICogQHBhcmFtIHR5cGVzVG9FeHRlbmQgLSBUeXBlcyB3aGljaCBzaG91bGQgYmUgZXh0ZW5kZWQgKENoZWNrcyBhcmVcbiAgICAgKiBwZXJmb3JtZWQgdmlhIFwidmFsdWUgaW5zdGFuY2VvZiB0eXBlXCIuKS5cbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIGdpdmVuIG9iamVjdCB3cmFwcGVkIHdpdGggYSBkeW5hbWljIGdldHRlciBwcm94eS5cbiAgICAgKi9cbiAgICBzdGF0aWMgYWRkRHluYW1pY0dldHRlckFuZFNldHRlcjxWYWx1ZT4oXG4gICAgICAgIG9iamVjdDpWYWx1ZSwgZ2V0dGVyV3JhcHBlcjpHZXR0ZXJGdW5jdGlvbiA9ICh2YWx1ZTphbnkpOmFueSA9PiB2YWx1ZSxcbiAgICAgICAgc2V0dGVyV3JhcHBlcjpTZXR0ZXJGdW5jdGlvbiA9IChrZXk6YW55LCB2YWx1ZTphbnkpOmFueSA9PiB2YWx1ZSxcbiAgICAgICAgZ2V0dGVyTWV0aG9kTmFtZTpzdHJpbmcgPSAnW10nLCBzZXR0ZXJNZXRob2ROYW1lOnN0cmluZyA9ICdbXScsXG4gICAgICAgIGNvbnRhaW5lc01ldGhvZE5hbWU6c3RyaW5nID0gJ2hhc093blByb3BlcnR5JywgZGVlcDpib29sZWFuID0gdHJ1ZSxcbiAgICAgICAgdHlwZXNUb0V4dGVuZDpBcnJheTxtaXhlZD4gPSBbT2JqZWN0XVxuICAgICk6VmFsdWUge1xuICAgICAgICBpZiAoZGVlcClcbiAgICAgICAgICAgIGlmIChvYmplY3QgaW5zdGFuY2VvZiBNYXApXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBba2V5Om1peGVkLCB2YWx1ZTptaXhlZF0gb2Ygb2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICBvYmplY3Quc2V0KGtleSwgSGVscGVyLmFkZER5bmFtaWNHZXR0ZXJBbmRTZXR0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSwgZ2V0dGVyV3JhcHBlciwgc2V0dGVyV3JhcHBlciwgZ2V0dGVyTWV0aG9kTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRlck1ldGhvZE5hbWUsIGNvbnRhaW5lc01ldGhvZE5hbWUsIGRlZXAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlc1RvRXh0ZW5kKSlcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5OnN0cmluZyBpbiBvYmplY3QpXG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFtrZXldID0gSGVscGVyLmFkZER5bmFtaWNHZXR0ZXJBbmRTZXR0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2tleV0sIGdldHRlcldyYXBwZXIsIHNldHRlcldyYXBwZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0dGVyTWV0aG9kTmFtZSwgc2V0dGVyTWV0aG9kTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXNNZXRob2ROYW1lLCBkZWVwLCB0eXBlc1RvRXh0ZW5kKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdmFsdWU6bWl4ZWQgb2Ygb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFtpbmRleF0gPSBIZWxwZXIuYWRkRHluYW1pY0dldHRlckFuZFNldHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLCBnZXR0ZXJXcmFwcGVyLCBzZXR0ZXJXcmFwcGVyLCBnZXR0ZXJNZXRob2ROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGVyTWV0aG9kTmFtZSwgY29udGFpbmVzTWV0aG9kTmFtZSwgZGVlcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVzVG9FeHRlbmQpXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgdHlwZTptaXhlZCBvZiB0eXBlc1RvRXh0ZW5kKVxuICAgICAgICAgICAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIHR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0Ll9fdGFyZ2V0X18pXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3RcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyOntcbiAgICAgICAgICAgICAgICAgICAgaGFzPzoodGFyZ2V0Ok9iamVjdCwgbmFtZTpzdHJpbmcpID0+IGJvb2xlYW47XG4gICAgICAgICAgICAgICAgICAgIGdldD86KHRhcmdldDpPYmplY3QsIG5hbWU6c3RyaW5nKSA9PiBhbnk7XG4gICAgICAgICAgICAgICAgICAgIHNldD86KHRhcmdldDpPYmplY3QsIG5hbWU6c3RyaW5nKSA9PiBhbnlcbiAgICAgICAgICAgICAgICB9ID0ge31cbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVzTWV0aG9kTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5oYXMgPSAodGFyZ2V0Ok9iamVjdCwgbmFtZTpzdHJpbmcpOmJvb2xlYW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lc01ldGhvZE5hbWUgPT09ICdbXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5hbWUgaW4gdGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W2NvbnRhaW5lc01ldGhvZE5hbWVdKG5hbWUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVzTWV0aG9kTmFtZSAmJiBnZXR0ZXJNZXRob2ROYW1lKVxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmdldCA9ICh0YXJnZXQ6T2JqZWN0LCBuYW1lOnN0cmluZyk6YW55ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYW1lID09PSAnX190YXJnZXRfXycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbbmFtZV0gPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtuYW1lXS5iaW5kKHRhcmdldClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXRbY29udGFpbmVzTWV0aG9kTmFtZV0obmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0dGVyTWV0aG9kTmFtZSA9PT0gJ1tdJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlcldyYXBwZXIodGFyZ2V0W25hbWVdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXR0ZXJXcmFwcGVyKHRhcmdldFtnZXR0ZXJNZXRob2ROYW1lXShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W25hbWVdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2V0dGVyTWV0aG9kTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5zZXQgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6T2JqZWN0LCBuYW1lOnN0cmluZywgdmFsdWU6YW55XG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGVyTWV0aG9kTmFtZSA9PT0gJ1tdJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSBzZXR0ZXJXcmFwcGVyKG5hbWUsIHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtzZXR0ZXJNZXRob2ROYW1lXShuYW1lLCBzZXR0ZXJXcmFwcGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLCB2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb3h5KG9iamVjdCwgaGFuZGxlcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iamVjdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZWFyY2hlcyBmb3IgbmVzdGVkIG1hcHBpbmdzIHdpdGggZ2l2ZW4gaW5kaWNhdG9yIGtleSBhbmQgcmVzb2x2ZXNcbiAgICAgKiBtYXJrZWQgdmFsdWVzLiBBZGRpdGlvbmFsbHkgYWxsIG9iamVjdHMgYXJlIHdyYXBwZWQgd2l0aCBhIHByb3h5IHRvXG4gICAgICogZHluYW1pY2FsbHkgcmVzb2x2ZSBuZXN0ZWQgcHJvcGVydGllcy5cbiAgICAgKiBAcGFyYW0gb2JqZWN0IC0gR2l2ZW4gbWFwcGluZyB0byByZXNvbHZlLlxuICAgICAqIEBwYXJhbSBjb25maWd1cmF0aW9uIC0gQ29uZmlndXJhdGlvbiBjb250ZXh0IHRvIHJlc29sdmUgbWFya2VkIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0gZGVlcCAtIEluZGljYXRlcyB3ZWF0aGVyIHRvIHBlcmZvcm0gYSByZWN1cnNpdmUgcmVzb2x2aW5nLlxuICAgICAqIEBwYXJhbSBldmFsdWF0aW9uSW5kaWNhdG9yS2V5IC0gSW5kaWNhdG9yIHByb3BlcnR5IG5hbWUgdG8gbWFyayBhIHZhbHVlXG4gICAgICogdG8gZXZhbHVhdGUuXG4gICAgICogQHBhcmFtIGV4ZWN1dGlvbkluZGljYXRvcktleSAtIEluZGljYXRvciBwcm9wZXJ0eSBuYW1lIHRvIG1hcmsgYSB2YWx1ZVxuICAgICAqIHRvIGV2YWx1YXRlLlxuICAgICAqIEBwYXJhbSBjb25maWd1cmF0aW9uS2V5TmFtZSAtIE5hbWUgdW5kZXIgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gbmFtZVxuICAgICAqIHNob3VsZCBiZSBwcm92aWRlZCB0byBldmFsdWF0aW9uIG9yIGV4ZWN1dGlvbiBjb250ZXh0cy5cbiAgICAgKiBAcmV0dXJucyBFdmFsdWF0ZWQgZ2l2ZW4gbWFwcGluZy5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZUR5bmFtaWNEYXRhU3RydWN0dXJlKFxuICAgICAgICBvYmplY3Q6YW55LCBjb25maWd1cmF0aW9uOj9QbGFpbk9iamVjdCA9IG51bGwsIGRlZXA6Ym9vbGVhbiA9IHRydWUsXG4gICAgICAgIGV2YWx1YXRpb25JbmRpY2F0b3JLZXk6c3RyaW5nID0gJ19fZXZhbHVhdGVfXycsXG4gICAgICAgIGV4ZWN1dGlvbkluZGljYXRvcktleTpzdHJpbmcgPSAnX19leGVjdXRlX18nLFxuICAgICAgICBjb25maWd1cmF0aW9uS2V5TmFtZTpzdHJpbmcgPSAnc2VsZidcbiAgICApOmFueSB7XG4gICAgICAgIGlmIChvYmplY3QgPT09IG51bGwgfHwgdHlwZW9mIG9iamVjdCAhPT0gJ29iamVjdCcpXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0XG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uID09PSBudWxsKVxuICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IG9iamVjdFxuICAgICAgICBpZiAoZGVlcCAmJiBjb25maWd1cmF0aW9uICYmICFjb25maWd1cmF0aW9uLl9fdGFyZ2V0X18pXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uID0gSGVscGVyLmFkZER5bmFtaWNHZXR0ZXJBbmRTZXR0ZXIoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgKCh2YWx1ZTphbnkpOmFueSA9PlxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIucmVzb2x2ZUR5bmFtaWNEYXRhU3RydWN0dXJlKFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsIGNvbmZpZ3VyYXRpb24sIGZhbHNlLCBldmFsdWF0aW9uSW5kaWNhdG9yS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhlY3V0aW9uSW5kaWNhdG9yS2V5LCBjb25maWd1cmF0aW9uS2V5TmFtZSlcbiAgICAgICAgICAgICAgICApLCAoa2V5OmFueSwgdmFsdWU6YW55KTphbnkgPT4gdmFsdWUsICdbXScsICcnKVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmplY3QpICYmIGRlZXApIHtcbiAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHZhbHVlOm1peGVkIG9mIG9iamVjdCkge1xuICAgICAgICAgICAgICAgIG9iamVjdFtpbmRleF0gPSBIZWxwZXIucmVzb2x2ZUR5bmFtaWNEYXRhU3RydWN0dXJlKFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSwgY29uZmlndXJhdGlvbiwgZGVlcCwgZXZhbHVhdGlvbkluZGljYXRvcktleSxcbiAgICAgICAgICAgICAgICAgICAgZXhlY3V0aW9uSW5kaWNhdG9yS2V5LCBjb25maWd1cmF0aW9uS2V5TmFtZSlcbiAgICAgICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXk6c3RyaW5nIGluIG9iamVjdClcbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChbXG4gICAgICAgICAgICAgICAgICAgICAgICBldmFsdWF0aW9uSW5kaWNhdG9yS2V5LCBleGVjdXRpb25JbmRpY2F0b3JLZXlcbiAgICAgICAgICAgICAgICAgICAgXS5pbmNsdWRlcyhrZXkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uRnVuY3Rpb246RXZhbHVhdGlvbkZ1bmN0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbktleU5hbWUsICd3ZWJPcHRpbWl6ZXJQYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjdXJyZW50UGF0aCcsICdwYXRoJywgJ2hlbHBlcicsICgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5ID09PSBldmFsdWF0aW9uSW5kaWNhdG9yS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApID8gJ3JldHVybiAnIDogJycpICsgb2JqZWN0W2tleV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2YWx1YXRpb25GdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sIF9fZGlybmFtZSwgcHJvY2Vzcy5jd2QoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgsIEhlbHBlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCBjb25maWd1cmF0aW9uLCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvbkluZGljYXRvcktleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhlY3V0aW9uSW5kaWNhdG9yS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uS2V5TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdFcnJvciBkdXJpbmcgJyArIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9PT0gZXZhbHVhdGlvbkluZGljYXRvcktleSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2V4ZWN1dGluZycgOiAnZXZhbHVhdGluZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArIGAgXCIke29iamVjdFtrZXldfVwiOiAke2Vycm9yfWApXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRlZXApXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSA9IEhlbHBlci5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2tleV0sIGNvbmZpZ3VyYXRpb24sIGRlZXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvbkluZGljYXRvcktleSwgZXhlY3V0aW9uSW5kaWNhdG9yS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25LZXlOYW1lKVxuICAgICAgICByZXR1cm4gb2JqZWN0XG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBzdHJpbmcgaGFuZGxpbmdcbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGVzIGdpdmVuIHN0cmluZyBpbnRvIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gdmFsaWRhdGVkXG4gICAgICogcmVwcmVzZW50YXRpb24uXG4gICAgICogQHBhcmFtIHZhbHVlIC0gU3RyaW5nIHRvIGNvbnZlcnQuXG4gICAgICogQHBhcmFtIGV4Y2x1ZGVTeW1ib2xzIC0gU3ltYm9scyBub3QgdG8gZXNjYXBlLlxuICAgICAqIEByZXR1cm5zIENvbnZlcnRlZCBzdHJpbmcuXG4gICAgICovXG4gICAgc3RhdGljIGNvbnZlcnRUb1ZhbGlkUmVndWxhckV4cHJlc3Npb25TdHJpbmcoXG4gICAgICAgIHZhbHVlOnN0cmluZywgZXhjbHVkZVN5bWJvbHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgKTpzdHJpbmcge1xuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIG9ubHkgZm9yIHBlcmZvcm1hbmNlIGltcHJvdmVtZW50cy5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMSAmJiAhSGVscGVyLnNwZWNpYWxSZWdleFNlcXVlbmNlcy5pbmNsdWRlcyhcbiAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICkpXG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgLy8gVGhlIGVzY2FwZSBzZXF1ZW5jZSBtdXN0IGFsc28gYmUgZXNjYXBlZDsgYnV0IGF0IGZpcnN0LlxuICAgICAgICBpZiAoIWV4Y2x1ZGVTeW1ib2xzLmluY2x1ZGVzKCdcXFxcJykpXG4gICAgICAgICAgICB2YWx1ZS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXG4gICAgICAgIGZvciAoY29uc3QgcmVwbGFjZTpzdHJpbmcgb2YgSGVscGVyLnNwZWNpYWxSZWdleFNlcXVlbmNlcylcbiAgICAgICAgICAgIGlmICghZXhjbHVkZVN5bWJvbHMuaW5jbHVkZXMocmVwbGFjZSkpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBuZXcgUmVnRXhwKGBcXFxcJHtyZXBsYWNlfWAsICdnJyksIGBcXFxcJHtyZXBsYWNlfWApXG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFuc2xhdGVzIGdpdmVuIG5hbWUgaW50byBhIHZhbGlkIGphdmFTY3JpcHQgb25lLlxuICAgICAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBjb252ZXJ0LlxuICAgICAqIEBwYXJhbSBhbGxvd2VkU3ltYm9scyAtIFN0cmluZyBvZiBzeW1ib2xzIHdoaWNoIHNob3VsZCBiZSBhbGxvd2VkIHdpdGhpblxuICAgICAqIGEgdmFyaWFibGUgbmFtZSAobm90IHRoZSBmaXJzdCBjaGFyYWN0ZXIpLlxuICAgICAqIEByZXR1cm5zIENvbnZlcnRlZCBuYW1lIGlzIHJldHVybmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBjb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShcbiAgICAgICAgbmFtZTpzdHJpbmcsIGFsbG93ZWRTeW1ib2xzOnN0cmluZyA9ICcwLTlhLXpBLVpfJCdcbiAgICApOnN0cmluZyB7XG4gICAgICAgIHJldHVybiBuYW1lLnJlcGxhY2UoL15bXmEtekEtWl8kXSsvLCAnJykucmVwbGFjZShcbiAgICAgICAgICAgIG5ldyBSZWdFeHAoYFteJHthbGxvd2VkU3ltYm9sc31dKyhbYS16QS1aMC05XSlgLCAnZycpLCAoXG4gICAgICAgICAgICAgICAgZnVsbE1hdGNoOnN0cmluZywgZmlyc3RMZXR0ZXI6c3RyaW5nXG4gICAgICAgICAgICApOnN0cmluZyA9PiBmaXJzdExldHRlci50b1VwcGVyQ2FzZSgpKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gcHJvY2VzcyBoYW5kbGVyXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIGEgb25lIHNob3QgY2xvc2UgaGFuZGxlciB3aGljaCB0cmlnZ2VycyBnaXZlbiBwcm9taXNlIG1ldGhvZHMuXG4gICAgICogSWYgYSByZWFzb24gaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBnaXZlbiBhcyByZXNvbHZlIHRhcmdldC4gQW4gRXJyb3JcbiAgICAgKiB3aWxsIGJlIGdlbmVyYXRlZCBpZiByZXR1cm4gY29kZSBpcyBub3QgemVyby4gVGhlIGdlbmVyYXRlZCBFcnJvciBoYXNcbiAgICAgKiBhIHByb3BlcnR5IFwicmV0dXJuQ29kZVwiIHdoaWNoIHByb3ZpZGVzIGNvcnJlc3BvbmRpbmcgcHJvY2VzcyByZXR1cm5cbiAgICAgKiBjb2RlLlxuICAgICAqIEBwYXJhbSByZXNvbHZlIC0gUHJvbWlzZSdzIHJlc29sdmUgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHJlamVjdCAtIFByb21pc2UncyByZWplY3QgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHJlYXNvbiAtIFByb21pc2UgdGFyZ2V0IGlmIHByb2Nlc3MgaGFzIGEgemVybyByZXR1cm4gY29kZS5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBPcHRpb25hbCBmdW5jdGlvbiB0byBjYWxsIG9mIHByb2Nlc3MgaGFzIHN1Y2Nlc3NmdWxseVxuICAgICAqIGZpbmlzaGVkLlxuICAgICAqIEByZXR1cm5zIFByb2Nlc3MgY2xvc2UgaGFuZGxlciBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0UHJvY2Vzc0Nsb3NlSGFuZGxlcihcbiAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uLCByZWFzb246YW55ID0gbnVsbCxcbiAgICAgICAgY2FsbGJhY2s6RnVuY3Rpb24gPSAoKTp2b2lkID0+IHt9XG4gICAgKTooKHJldHVybkNvZGU6P251bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBsZXQgZmluaXNoZWQ6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgIHJldHVybiAocmV0dXJuQ29kZTo/bnVtYmVyKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGlmICghZmluaXNoZWQpXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXR1cm5Db2RlICE9PSAnbnVtYmVyJyB8fCByZXR1cm5Db2RlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZWFzb24pXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3I6RXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBgVGFzayBleGl0ZWQgd2l0aCBlcnJvciBjb2RlICR7cmV0dXJuQ29kZX1gKVxuICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IucmV0dXJuQ29kZSA9IHJldHVybkNvZGVcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZvcndhcmRzIGdpdmVuIGNoaWxkIHByb2Nlc3MgY29tbXVuaWNhdGlvbiBjaGFubmVscyB0byBjb3JyZXNwb25kaW5nXG4gICAgICogY3VycmVudCBwcm9jZXNzIGNvbW11bmljYXRpb24gY2hhbm5lbHMuXG4gICAgICogQHBhcmFtIGNoaWxkUHJvY2VzcyAtIENoaWxkIHByb2Nlc3MgbWV0YSBkYXRhLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIGNoaWxkIHByb2Nlc3MgbWV0YSBkYXRhLlxuICAgICAqL1xuICAgIHN0YXRpYyBoYW5kbGVDaGlsZFByb2Nlc3MoY2hpbGRQcm9jZXNzOkNoaWxkUHJvY2Vzcyk6Q2hpbGRQcm9jZXNzIHtcbiAgICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5waXBlKHByb2Nlc3Muc3Rkb3V0KVxuICAgICAgICBjaGlsZFByb2Nlc3Muc3RkZXJyLnBpcGUocHJvY2Vzcy5zdGRlcnIpXG4gICAgICAgIGNoaWxkUHJvY2Vzcy5vbignY2xvc2UnLCAocmV0dXJuQ29kZTpudW1iZXIpOnZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKHJldHVybkNvZGUgIT09IDApXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgVGFzayBleGl0ZWQgd2l0aCBlcnJvciBjb2RlICR7cmV0dXJuQ29kZX1gKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gY2hpbGRQcm9jZXNzXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBmaWxlIGhhbmRsZXJcbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgZ2l2ZW4gcGF0aCBwb2ludHMgdG8gYSB2YWxpZCBmaWxlLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZS5cbiAgICAgKiBAcmV0dXJucyBBIGJvb2xlYW4gd2hpY2ggaW5kaWNhdGVzIGZpbGUgZXhpc3RlbnRzLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc0ZpbGVTeW5jKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaWxlU3lzdGVtLmFjY2Vzc1N5bmMoZmlsZVBhdGgsIGZpbGVTeXN0ZW0uRl9PSylcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyB0aHJvdWdoIGdpdmVuIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgcmVjdXJzaXZlbHkgYW5kIGNhbGxzIGdpdmVuXG4gICAgICogY2FsbGJhY2sgZm9yIGVhY2ggZm91bmQgZmlsZS4gQ2FsbGJhY2sgZ2V0cyBmaWxlIHBhdGggYW5kIGNvcnJlc3BvbmRpbmdcbiAgICAgKiBzdGF0IG9iamVjdCBhcyBhcmd1bWVudC5cbiAgICAgKiBAcGFyYW0gZGlyZWN0b3J5UGF0aCAtIFBhdGggdG8gZGlyZWN0b3J5IHN0cnVjdHVyZSB0byB0cmF2ZXJzZS5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBpbnZva2UgZm9yIGVhY2ggdHJhdmVyc2VkIGZpbGUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIHdhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoXG4gICAgICAgIGRpcmVjdG9yeVBhdGg6c3RyaW5nLCBjYWxsYmFjazpUcmF2ZXJzZUZpbGVzQ2FsbGJhY2tGdW5jdGlvbiA9IChcbiAgICAgICAgICAgIF9maWxlUGF0aDpzdHJpbmcsIF9zdGF0Ok9iamVjdFxuICAgICAgICApOj9ib29sZWFuID0+IHRydWVcbiAgICApOlRyYXZlcnNlRmlsZXNDYWxsYmFja0Z1bmN0aW9uIHtcbiAgICAgICAgZmlsZVN5c3RlbS5yZWFkZGlyU3luYyhkaXJlY3RvcnlQYXRoKS5mb3JFYWNoKChcbiAgICAgICAgICAgIGZpbGVOYW1lOnN0cmluZ1xuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeVBhdGgsIGZpbGVOYW1lKVxuICAgICAgICAgICAgY29uc3Qgc3RhdDpPYmplY3QgPSBmaWxlU3lzdGVtLnN0YXRTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKGZpbGVQYXRoLCBzdGF0KSAhPT0gZmFsc2UgJiYgc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KFxuICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICBIZWxwZXIud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhmaWxlUGF0aCwgY2FsbGJhY2spXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBjYWxsYmFja1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgZ2l2ZW4gc291cmNlIGZpbGUgdmlhIHBhdGggdG8gZ2l2ZW4gdGFyZ2V0IGRpcmVjdG9yeSBsb2NhdGlvblxuICAgICAqIHdpdGggc2FtZSB0YXJnZXQgbmFtZSBhcyBzb3VyY2UgZmlsZSBoYXMgb3IgY29weSB0byBnaXZlbiBjb21wbGV0ZVxuICAgICAqIHRhcmdldCBmaWxlIHBhdGguXG4gICAgICogQHBhcmFtIHNvdXJjZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gY29weS5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0UGF0aCAtIFRhcmdldCBkaXJlY3Rvcnkgb3IgY29tcGxldGUgZmlsZSBsb2NhdGlvbiB0byBjb3B5XG4gICAgICogdG8uXG4gICAgICogQHJldHVybnMgRGV0ZXJtaW5lZCB0YXJnZXQgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyBjb3B5RmlsZVN5bmMoc291cmNlUGF0aDpzdHJpbmcsIHRhcmdldFBhdGg6c3RyaW5nKTpzdHJpbmcge1xuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogSWYgdGFyZ2V0IHBhdGggcmVmZXJlbmNlcyBhIGRpcmVjdG9yeSBhIG5ldyBmaWxlIHdpdGggdGhlXG4gICAgICAgICAgICBzYW1lIG5hbWUgd2lsbCBiZSBjcmVhdGVkLlxuICAgICAgICAqL1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGZpbGVTeXN0ZW0ubHN0YXRTeW5jKHRhcmdldFBhdGgpLmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgICAgICAgdGFyZ2V0UGF0aCA9IHBhdGguam9pbih0YXJnZXRQYXRoLCBwYXRoLmJhc2VuYW1lKHNvdXJjZVBhdGgpKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgZmlsZVN5c3RlbS53cml0ZUZpbGVTeW5jKHRhcmdldFBhdGgsIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgc291cmNlUGF0aCkpXG4gICAgICAgIHJldHVybiB0YXJnZXRQYXRoXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvcGllcyBnaXZlbiBzb3VyY2UgZGlyZWN0b3J5IHZpYSBwYXRoIHRvIGdpdmVuIHRhcmdldCBkaXJlY3RvcnlcbiAgICAgKiBsb2NhdGlvbiB3aXRoIHNhbWUgdGFyZ2V0IG5hbWUgYXMgc291cmNlIGZpbGUgaGFzIG9yIGNvcHkgdG8gZ2l2ZW5cbiAgICAgKiBjb21wbGV0ZSB0YXJnZXQgZGlyZWN0b3J5IHBhdGguXG4gICAgICogQHBhcmFtIHNvdXJjZVBhdGggLSBQYXRoIHRvIGRpcmVjdG9yeSB0byBjb3B5LlxuICAgICAqIEBwYXJhbSB0YXJnZXRQYXRoIC0gVGFyZ2V0IGRpcmVjdG9yeSBvciBjb21wbGV0ZSBkaXJlY3RvcnkgbG9jYXRpb24gdG9cbiAgICAgKiBjb3B5IGluLlxuICAgICAqIEByZXR1cm5zIERldGVybWluZWQgdGFyZ2V0IGRpcmVjdG9yeSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyBjb3B5RGlyZWN0b3J5UmVjdXJzaXZlU3luYyhcbiAgICAgICAgc291cmNlUGF0aDpzdHJpbmcsIHRhcmdldFBhdGg6c3RyaW5nXG4gICAgKTpzdHJpbmcge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZm9sZGVyIG5lZWRzIHRvIGJlIGNyZWF0ZWQgb3IgaW50ZWdyYXRlZC5cbiAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtLmxzdGF0U3luYyh0YXJnZXRQYXRoKS5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgICAgICAgIHRhcmdldFBhdGggPSBwYXRoLmpvaW4odGFyZ2V0UGF0aCwgcGF0aC5iYXNlbmFtZShzb3VyY2VQYXRoKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgIGZpbGVTeXN0ZW0ubWtkaXJTeW5jKHRhcmdldFBhdGgpXG4gICAgICAgIEhlbHBlci53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKHNvdXJjZVBhdGgsIChcbiAgICAgICAgICAgIGN1cnJlbnRTb3VyY2VQYXRoOnN0cmluZywgc3RhdDpPYmplY3RcbiAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUYXJnZXRQYXRoOnN0cmluZyA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICB0YXJnZXRQYXRoLCBjdXJyZW50U291cmNlUGF0aC5zdWJzdHJpbmcoc291cmNlUGF0aC5sZW5ndGgpKVxuICAgICAgICAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSlcbiAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLm1rZGlyU3luYyhjdXJyZW50VGFyZ2V0UGF0aClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBIZWxwZXIuY29weUZpbGVTeW5jKGN1cnJlbnRTb3VyY2VQYXRoLCBjdXJyZW50VGFyZ2V0UGF0aClcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHRhcmdldFBhdGhcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGFzc2V0IHR5cGUgaWYgZ2l2ZW4gZmlsZS5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gYW5hbHlzZS5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9uIC0gTWV0YSBpbmZvcm1hdGlvbnMgZm9yIGF2YWlsYWJsZSBhc3NldFxuICAgICAqIHR5cGVzLlxuICAgICAqIEBwYXJhbSBwYXRocyAtIExpc3Qgb2YgcGF0aHMgdG8gc2VhcmNoIGlmIGdpdmVuIHBhdGggZG9lc24ndCByZWZlcmVuY2VcbiAgICAgKiBhIGZpbGUgZGlyZWN0bHkuXG4gICAgICogQHJldHVybnMgRGV0ZXJtaW5lZCBmaWxlIHR5cGUgb3IgXCJudWxsXCIgb2YgZ2l2ZW4gZmlsZSBjb3VsZG4ndCBiZVxuICAgICAqIGRldGVybWluZWQuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBidWlsZENvbmZpZ3VyYXRpb246QnVpbGRDb25maWd1cmF0aW9uLCBwYXRoczpQYXRoc1xuICAgICk6P3N0cmluZyB7XG4gICAgICAgIGxldCByZXN1bHQ6P3N0cmluZyA9IG51bGxcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiBidWlsZENvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoXG4gICAgICAgICAgICApID09PSBgLiR7YnVpbGRDb25maWd1cmF0aW9uW3R5cGVdLmV4dGVuc2lvbn1gKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHlwZVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIGlmICghcmVzdWx0KVxuICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ3NvdXJjZScsICd0YXJnZXQnXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0VHlwZTpzdHJpbmcgaW4gcGF0aHMuYXNzZXQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXRocy5hc3NldFthc3NldFR5cGVdLnN0YXJ0c1dpdGgocGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aHNbdHlwZV0sIHBhdGhzLmFzc2V0W2Fzc2V0VHlwZV1cbiAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzZXRUeXBlXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHByb3BlcnR5IHdpdGggYSBzdG9yZWQgYXJyYXkgb2YgYWxsIG1hdGNoaW5nIGZpbGUgcGF0aHMsIHdoaWNoXG4gICAgICogbWF0Y2hlcyBlYWNoIGJ1aWxkIGNvbmZpZ3VyYXRpb24gaW4gZ2l2ZW4gZW50cnkgcGF0aCBhbmQgY29udmVydHMgZ2l2ZW5cbiAgICAgKiBidWlsZCBjb25maWd1cmF0aW9uIGludG8gYSBzb3J0ZWQgYXJyYXkgd2VyZSBqYXZhU2NyaXB0IGZpbGVzIHRha2VzXG4gICAgICogcHJlY2VkZW5jZS5cbiAgICAgKiBAcGFyYW0gY29uZmlndXJhdGlvbiAtIEdpdmVuIGJ1aWxkIGNvbmZpZ3VyYXRpb25zLlxuICAgICAqIEBwYXJhbSBlbnRyeVBhdGggLSBQYXRoIHRvIGFuYWx5c2UgbmVzdGVkIHN0cnVjdHVyZS5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIFBhdGggdG8gc2V0IHBhdGhzIHJlbGF0aXZlIHRvIGFuZCBkZXRlcm1pbmUgcmVsYXRpdmVcbiAgICAgKiBpZ25vcmVkIHBhdGhzIHRvLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlIChSZWxhdGl2ZVxuICAgICAqIHBhdGhzIGFyZSByZXNvbHZlZCByZWxhdGl2ZWx5IHRvIGdpdmVuIGNvbnRleHQuKS5cbiAgICAgKiBAcmV0dXJucyBDb252ZXJ0ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZUJ1aWxkQ29uZmlndXJhdGlvbkZpbGVQYXRocyhcbiAgICAgICAgY29uZmlndXJhdGlvbjpCdWlsZENvbmZpZ3VyYXRpb24sIGVudHJ5UGF0aDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBjb250ZXh0OnN0cmluZyA9ICcuLycsIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddXG4gICAgKTpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiB7XG4gICAgICAgIGNvbnN0IGJ1aWxkQ29uZmlndXJhdGlvbjpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiA9IFtdXG4gICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbilcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbTpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0gPVxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuZXh0ZW5kT2JqZWN0KHRydWUsIHtmaWxlUGF0aHM6IFtdfSwgY29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVdKVxuICAgICAgICAgICAgICAgIEhlbHBlci53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKGVudHJ5UGF0aCwgKChcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6bnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25JdGVtOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbVxuICAgICAgICAgICAgICAgICk6VHJhdmVyc2VGaWxlc0NhbGxiYWNrRnVuY3Rpb24gPT4gKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIHN0YXQ6T2JqZWN0XG4gICAgICAgICAgICAgICAgKTo/Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oZmlsZVBhdGgsIHBhdGhzVG9JZ25vcmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LmlzRmlsZSgpICYmIHBhdGguZXh0bmFtZShmaWxlUGF0aCkuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICApID09PSBidWlsZENvbmZpZ3VyYXRpb25JdGVtLmV4dGVuc2lvbiAmJiAhKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25JdGVtLmZpbGVOYW1lUGF0dGVyblxuICAgICAgICAgICAgICAgICAgICApKS50ZXN0KGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0uZmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgfSkoaW5kZXgsIG5ld0l0ZW0pKVxuICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5wdXNoKG5ld0l0ZW0pXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnVpbGRDb25maWd1cmF0aW9uLnNvcnQoKFxuICAgICAgICAgICAgZmlyc3Q6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtLFxuICAgICAgICAgICAgc2Vjb25kOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbVxuICAgICAgICApOm51bWJlciA9PiB7XG4gICAgICAgICAgICBpZiAoZmlyc3Qub3V0cHV0RXh0ZW5zaW9uICE9PSBzZWNvbmQub3V0cHV0RXh0ZW5zaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Lm91dHB1dEV4dGVuc2lvbiA9PT0gJ2pzJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgaWYgKHNlY29uZC5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpcnN0Lm91dHB1dEV4dGVuc2lvbiA8IHNlY29uZC5vdXRwdXRFeHRlbnNpb24gPyAtMSA6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIGZpbGUgYW5kIGRpcmVjdG9yeSBwYXRocyByZWxhdGVkIHRvIGdpdmVuIGludGVybmFsXG4gICAgICogbW9kdWxlcyBhcyBhcnJheS5cbiAgICAgKiBAcGFyYW0gaW50ZXJuYWxJbmplY3Rpb24gLSBMaXN0IG9mIG1vZHVsZUlEcyBvciBtb2R1bGUgZmlsZSBwYXRocy5cbiAgICAgKiBAcGFyYW0gbW9kdWxlQWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0ga25vd25FeHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcmV0dXJucyBPYmplY3Qgd2l0aCBhIGZpbGUgcGF0aCBhbmQgZGlyZWN0b3J5IHBhdGgga2V5IG1hcHBpbmcgdG9cbiAgICAgKiBjb3JyZXNwb25kaW5nIGxpc3Qgb2YgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgaW50ZXJuYWxJbmplY3Rpb246SW50ZXJuYWxJbmplY3Rpb24sIG1vZHVsZUFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAga25vd25FeHRlbnNpb25zOkFycmF5PHN0cmluZz4gPSBbJy5qcyddLCBjb250ZXh0OnN0cmluZyA9ICcuLydcbiAgICApOntmaWxlUGF0aHM6QXJyYXk8c3RyaW5nPjtkaXJlY3RvcnlQYXRoczpBcnJheTxzdHJpbmc+fSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbjpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gPVxuICAgICAgICAgICAgSGVscGVyLm5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKFxuICAgICAgICAgICAgICAgIGludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgXSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCwgbW9kdWxlQWxpYXNlcywga25vd25FeHRlbnNpb25zLCBjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHMucHVzaChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aDpzdHJpbmcgPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmICghZGlyZWN0b3J5UGF0aHMuaW5jbHVkZXMoZGlyZWN0b3J5UGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RvcnlQYXRocy5wdXNoKGRpcmVjdG9yeVBhdGgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2ZpbGVQYXRocywgZGlyZWN0b3J5UGF0aHN9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV2ZXJ5IGluamVjdGlvbiBkZWZpbml0aW9uIHR5cGUgY2FuIGJlIHJlcHJlc2VudGVkIGFzIHBsYWluIG9iamVjdFxuICAgICAqIChtYXBwaW5nIGZyb20gY2h1bmsgbmFtZSB0byBhcnJheSBvZiBtb2R1bGUgaWRzKS4gVGhpcyBtZXRob2QgY29udmVydHNcbiAgICAgKiBlYWNoIHJlcHJlc2VudGF0aW9uIGludG8gdGhlIG5vcm1hbGl6ZWQgcGxhaW4gb2JqZWN0IG5vdGF0aW9uLlxuICAgICAqIEBwYXJhbSBpbnRlcm5hbEluamVjdGlvbiAtIEdpdmVuIGludGVybmFsIGluamVjdGlvbiB0byBub3JtYWxpemUuXG4gICAgICogQHJldHVybnMgTm9ybWFsaXplZCByZXByZXNlbnRhdGlvbiBvZiBnaXZlbiBpbnRlcm5hbCBpbmplY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIG5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKFxuICAgICAgICBpbnRlcm5hbEluamVjdGlvbjpJbnRlcm5hbEluamVjdGlvblxuICAgICk6Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uIHtcbiAgICAgICAgbGV0IHJlc3VsdDpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gPSB7fVxuICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb24gaW5zdGFuY2VvZiBPYmplY3QgJiYgSGVscGVyLmlzUGxhaW5PYmplY3QoXG4gICAgICAgICAgICBpbnRlcm5hbEluamVjdGlvblxuICAgICAgICApKSB7XG4gICAgICAgICAgICBsZXQgaGFzQ29udGVudDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgICAgIGNvbnN0IGNodW5rTmFtZXNUb0RlbGV0ZTpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBpbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY2h1bmtOYW1lXSA9IGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZXNUb0RlbGV0ZS5wdXNoKGNodW5rTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NodW5rTmFtZV0gPSBbaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc0NvbnRlbnQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIG9mIGNodW5rTmFtZXNUb0RlbGV0ZSlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJlc3VsdFtjaHVua05hbWVdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBbXX1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW50ZXJuYWxJbmplY3Rpb24gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBbaW50ZXJuYWxJbmplY3Rpb25dfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGludGVybmFsSW5qZWN0aW9uKSlcbiAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogaW50ZXJuYWxJbmplY3Rpb259XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgY29uY3JldGUgZmlsZSBwYXRocyBmb3IgZ2l2ZW4gaW5qZWN0aW9uIHdoaWNoIGFyZSBtYXJrZWRcbiAgICAgKiB3aXRoIHRoZSBcIl9fYXV0b19fXCIgaW5kaWNhdG9yLlxuICAgICAqIEBwYXJhbSBnaXZlbkluamVjdGlvbiAtIEdpdmVuIGludGVybmFsIGFuZCBleHRlcm5hbCBpbmplY3Rpb24gdG8gdGFrZVxuICAgICAqIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9ucyAtIFJlc29sdmVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHBhcmFtIG1vZHVsZXNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyB0byBleGNsdWRlIChzcGVjaWZpZWQgYnlcbiAgICAgKiBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0byBtb2R1bGUgaWRzLlxuICAgICAqIEBwYXJhbSBtb2R1bGVBbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBrbm93bkV4dGVuc2lvbnMgLSBGaWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gdXNlIGFzIHN0YXJ0aW5nIHBvaW50LlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlIChSZWxhdGl2ZVxuICAgICAqIHBhdGhzIGFyZSByZXNvbHZlZCByZWxhdGl2ZWx5IHRvIGdpdmVuIGNvbnRleHQuKS5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBpbmplY3Rpb24gd2l0aCByZXNvbHZlZCBtYXJrZWQgaW5kaWNhdG9ycy5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZUluamVjdGlvbihcbiAgICAgICAgZ2l2ZW5JbmplY3Rpb246SW5qZWN0aW9uLFxuICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uLFxuICAgICAgICBtb2R1bGVzVG9FeGNsdWRlOkludGVybmFsSW5qZWN0aW9uLFxuICAgICAgICBtb2R1bGVBbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sIGtub3duRXh0ZW5zaW9uczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJy5qcycsICcuY3NzJywgJy5zdmcnLCAnLmh0bWwnXG4gICAgICAgIF0sIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOkluamVjdGlvbiB7XG4gICAgICAgIGNvbnN0IGluamVjdGlvbjpJbmplY3Rpb24gPSBIZWxwZXIuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgdHJ1ZSwge30sIGdpdmVuSW5qZWN0aW9uKVxuICAgICAgICBjb25zdCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGU6QXJyYXk8c3RyaW5nPiA9XG4gICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICAgICAgICAgIG1vZHVsZXNUb0V4Y2x1ZGUsIG1vZHVsZUFsaWFzZXMsIGtub3duRXh0ZW5zaW9ucywgY29udGV4dCxcbiAgICAgICAgICAgICAgICBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICApLmZpbGVQYXRoc1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnaW50ZXJuYWwnLCAnZXh0ZXJuYWwnXSlcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGN1cmx5ICovXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluamVjdGlvblt0eXBlXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gaW5qZWN0aW9uW3R5cGVdKVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0gPT09ICdfX2F1dG9fXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZXM6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtrZXk6c3RyaW5nXTpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnMsIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJDaHVua05hbWU6c3RyaW5nIGluIG1vZHVsZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZHVsZXMuaGFzT3duUHJvcGVydHkoc3ViQ2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0ucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZXNbc3ViQ2h1bmtOYW1lXSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmplY3Rpb25bdHlwZV0gPT09ICdfX2F1dG9fXycpXG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGN1cmx5ICovXG4gICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9ucywgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLCBjb250ZXh0KVxuICAgICAgICByZXR1cm4gaW5qZWN0aW9uXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb25zIC0gUmVzb2x2ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlIC0gQSBsaXN0IG9mIG1vZHVsZXMgZmlsZSBwYXRocyB0b1xuICAgICAqIGV4Y2x1ZGUgKHNwZWNpZmllZCBieSBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0b1xuICAgICAqIG1vZHVsZSBpZHMuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gdXNlIGFzIHN0YXJ0aW5nIHBvaW50LlxuICAgICAqIEByZXR1cm5zIEFsbCBkZXRlcm1pbmVkIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRBdXRvQ2h1bmsoXG4gICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnM6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZTpBcnJheTxzdHJpbmc+LCBjb250ZXh0OnN0cmluZ1xuICAgICk6e1trZXk6c3RyaW5nXTpzdHJpbmd9IHtcbiAgICAgICAgY29uc3QgcmVzdWx0Ontba2V5OnN0cmluZ106c3RyaW5nfSA9IHt9XG4gICAgICAgIGNvbnN0IGluamVjdGVkQmFzZU5hbWVzOntba2V5OnN0cmluZ106QXJyYXk8c3RyaW5nPn0gPSB7fVxuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSBvZlxuICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uc1xuICAgICAgICApIHtcbiAgICAgICAgICAgIGlmICghaW5qZWN0ZWRCYXNlTmFtZXNbYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvbl0pXG4gICAgICAgICAgICAgICAgaW5qZWN0ZWRCYXNlTmFtZXNbXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25cbiAgICAgICAgICAgICAgICBdID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlRmlsZVBhdGg6c3RyaW5nIG9mIGJ1aWxkQ29uZmlndXJhdGlvbi5maWxlUGF0aHMpXG4gICAgICAgICAgICAgICAgaWYgKCFtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUuaW5jbHVkZXMobW9kdWxlRmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VOYW1lOnN0cmluZyA9IHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCwgYC4ke2J1aWxkQ29uZmlndXJhdGlvbi5leHRlbnNpb259YClcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IGVhY2ggb3V0cHV0IHR5cGUgaGFzIG9ubHkgb25lIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5qZWN0ZWRCYXNlTmFtZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgIF0uaW5jbHVkZXMoYmFzZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IGlmIHNhbWUgYmFzZW5hbWVzIGFuZCBkaWZmZXJlbnQgb3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZXMgY2FuIGJlIGRpc3Rpbmd1aXNoZWQgYnkgdGhlaXIgZXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKEphdmFTY3JpcHQtTW9kdWxlcyByZW1haW5zIHdpdGhvdXQgZXh0ZW5zaW9uIHNpbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhleSB3aWxsIGJlIGhhbmRsZWQgZmlyc3QgYmVjYXVzZSB0aGUgYnVpbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyBhcmUgZXhwZWN0ZWQgdG8gYmUgc29ydGVkIGluIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0KS5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0W2Jhc2VOYW1lXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCwgbW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXSA9IG1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2Jhc2VOYW1lXSA9IG1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RlZEJhc2VOYW1lc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBdLnB1c2goYmFzZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gbW9kdWxlQWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0ga25vd25FeHRlbnNpb25zIC0gTGlzdCBvZiBrbm93biBleHRlbnNpb25zLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIGRldGVybWluZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMgLSBMaXN0IG9mIHJlbGF0aXZlIGZpbGUgcGF0aCB0byBzZWFyY2hcbiAgICAgKiBmb3IgbW9kdWxlcyBpbi5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUVudHJ5RmlsZU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGVudHJ5IGZpbGUgbmFtZXMgdG9cbiAgICAgKiBzZWFyY2ggZm9yLiBUaGUgbWFnaWMgbmFtZSBcIl9fcGFja2FnZV9fXCIgd2lsbCBzZWFyY2ggZm9yIGFuIGFwcHJlY2lhdGVcbiAgICAgKiBlbnRyeSBpbiBhIFwicGFja2FnZS5qc29uXCIgZmlsZS5cbiAgICAgKiBAcmV0dXJucyBGaWxlIHBhdGggb3IgZ2l2ZW4gbW9kdWxlIGlkIGlmIGRldGVybWluYXRpb25zIGhhcyBmYWlsZWQgb3JcbiAgICAgKiB3YXNuJ3QgbmVjZXNzYXJ5LlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgbW9kdWxlSUQ6c3RyaW5nLCBtb2R1bGVBbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGtub3duRXh0ZW5zaW9uczpBcnJheTxzdHJpbmc+ID0gWycuanMnXSwgY29udGV4dDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gWycnLCAnbm9kZV9tb2R1bGVzJywgJy4uLyddLFxuICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICdfX3BhY2thZ2VfXycsICcnLCAnaW5kZXgnLCAnbWFpbiddXG4gICAgKTpzdHJpbmcge1xuICAgICAgICBtb2R1bGVJRCA9IEhlbHBlci5hcHBseUFsaWFzZXMobW9kdWxlSUQsIG1vZHVsZUFsaWFzZXMpXG4gICAgICAgIGZvciAoY29uc3QgbW9kdWxlTG9jYXRpb246c3RyaW5nIG9mIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzKVxuICAgICAgICAgICAgZm9yIChsZXQgZmlsZU5hbWU6c3RyaW5nIG9mIHBhY2thZ2VFbnRyeUZpbGVOYW1lcylcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGV4dGVuc2lvbjpzdHJpbmcgb2Yga25vd25FeHRlbnNpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtb2R1bGVGaWxlUGF0aDpzdHJpbmcgPSBtb2R1bGVJRFxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1vZHVsZUZpbGVQYXRoLnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIG1vZHVsZUxvY2F0aW9uLCBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnX19wYWNrYWdlX18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtLnN0YXRTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoVG9QYWNrYWdlSlNPTjpzdHJpbmcgPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCwgJ3BhY2thZ2UuanNvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtLnN0YXRTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFRvUGFja2FnZUpTT05cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBKU09OLnBhcnNlKGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoVG9QYWNrYWdlSlNPTiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCd9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbENvbmZpZ3VyYXRpb24ubWFpbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IGxvY2FsQ29uZmlndXJhdGlvbi5tYWluXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ19fcGFja2FnZV9fJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoID0gcGF0aC5qb2luKG1vZHVsZUZpbGVQYXRoLCBmaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGggKz0gZXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5zdGF0U3luYyhtb2R1bGVGaWxlUGF0aCkuaXNGaWxlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1vZHVsZUlEXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBjb25jcmV0ZSBmaWxlIHBhdGggZm9yIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgaWQgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEByZXR1cm5zIFRoZSBhbGlhcyBhcHBsaWVkIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlBbGlhc2VzKG1vZHVsZUlEOnN0cmluZywgYWxpYXNlczpQbGFpbk9iamVjdCk6c3RyaW5nIHtcbiAgICAgICAgZm9yIChjb25zdCBhbGlhczpzdHJpbmcgaW4gYWxpYXNlcylcbiAgICAgICAgICAgIGlmIChhbGlhcy5lbmRzV2l0aCgnJCcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZUlEID09PSBhbGlhcy5zdWJzdHJpbmcoMCwgYWxpYXMubGVuZ3RoIC0gMSkpXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gYWxpYXNlc1thbGlhc11cbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gbW9kdWxlSUQucmVwbGFjZShhbGlhcywgYWxpYXNlc1thbGlhc10pXG4gICAgICAgIHJldHVybiBtb2R1bGVJRFxuICAgIH1cbn1cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=