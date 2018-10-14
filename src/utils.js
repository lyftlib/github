const shell = require('shelljs');
const path = require('path');
const { readFileSync, writeFile } = require('fs');

/**
 * This function is used to override the default configuration
 * if the user uses the appropriates flags
 * @function overrideEnvVar
 * @param {Object} map key: A flag use in the cli (--test),
 *                     value: the name of the environment variable
 * @param {Object} command An object currently provided by docopt
 */
function overrideEnvVar(map, command) {
    for (const key in map) {
        // In docopt a parameter not filled is null
        if (command[key] !== null) {
            process.env[map[key]] = command[key];
        }
    }
}

/**
 * A default filter which returns only the fields not nulls
 * @function filter
 * @param {Object} command An object currently provided by docopt
 * @param {Object} args Map object of one command
 * @returns {Object}
 */
function filter(command, args) {
    const args_key = Object.keys(args);

    // Gets only the fields not nulls
    const options =  Object.keys(command)
        .filter(e => args_key.includes(e))
        .reduce((obj, key) => {
            if (command[key] !== null) obj[args[key]] = command[key];
            return obj;
        }, {});
    // A default name to prevent name collisions
    options.name = `lyft_${process.env.LYFTPV_PROJECT_NAME}_${command['<name>']}`;
    // The name of the resource
    options.localName = command['<name>'];
    return options;
}

/**
 * A helper to get the absolute path of the state.json of the requested resource
 * @function getStatePath
 * @param {String} name The name of the resource
 * @returns {String}
 */
function getStatePath(name) {
    return path.join(process.env.LYFTPV_PROJECT_PATH, 'resources', name, 'state.json');
}

/**
 * Function which returns the contents of a state.json
 * @function getState
 * @param {String} statePath The absolute path of the state.json
 * @returns {Object}
 */
function getState(statePath) {
    try {
        return JSON.parse(readFileSync(statePath));
    } catch (error) {
        withError(`The file ${statePath} does not exist`);
    }
}

/**
 * A helper to retrieve the local cloned repository name from the state.json
 * @function getRepoName
 * @param {String} statePath The absolute path of the state.json
 * @returns {String}
 */
function getRepoName(statePath) {
    return getState(statePath).name;
}

/**
 * A helper to retrieve the local cloned repository path from the state.json
 * @function getClonePath
 * @param {String} statePath The absolute path of the state.json
 * @returns {String}
 */
function getClonePath(statePath) {
    const clonePath = getState(statePath).clonePath;
    if (clonePath === undefined) withError('The repository was not cloned');
    return clonePath;
}

/**
 * A helper to retrieve the local cloned repository url from the state.json
 * @function getCloneUrl
 * @param {String} statePath The absolute path of the state.json
 * @returns {String}
 */
function getCloneUrl(statePath) {
    return getState(statePath)['clone_url'];
}

/**
 * Function which is able to clone a repository in the current directory
 * @function clone
 * @param {String} url The url of the repository that will be cloned
 * @param {String} name The name of the resource
 */
function clone(url, name) {
    // Checks if git is installed
    if (!shell.which('git')) {
        throw new Error('Git is required');
    }

    // Current directory + resource name
    const clonePath = `${path.join(process.cwd(), name)}`;

    // Performs the clone
    if (shell.exec(`git clone ${url} ${clonePath}`).code !== 0) {
        throw new Error('Git clone failed');
    } else {
        // Store the local cloned repository path into the state.json
        const statePath = getStatePath(name);

        const state = getState(statePath);
        state.clonePath = clonePath;
        writeFile(statePath, JSON.stringify(state), error => {
            if (error) withError(error);
        })
    }
}

/**
 * A helper to provide a default comportment when an error is thrown
 * @function withError
 * @param {Any} msg The message/object that will be printed
 */
function withError(msg) {
    console.log(msg);
    process.exit(-1);
}

module.exports = {
    filter,
    clone,
    withError,
    overrideEnvVar,
    getRepoName,
    getClonePath,
    getCloneUrl,
    getStatePath,
 };