const {
    filter,
    clone,
    withError,
    getStatePath,
    getClonePath,
    getCloneUrl,
} = require('../src/utils');

// Exports the use command for the Github module
module.exports = {
    // Defines all parameters allowed for this command in the cli
    cli : [
        'path',
        'clone'
    ],
    // Args gets by the filter
    args : {
        'path': 'path',
        'clone': 'clone',
    },
    // The default filter
    filter,
    method(options) {
        // Gets the absolute path of the state.json
        const statePath = getStatePath(options.localName);

        // Only prints the local cloned repository path to be use by the user
        if (options.path) {
            console.log(getClonePath(statePath));
        }
        // Clones the repository
        else if (options.clone) {
            try {
                clone(getCloneUrl(statePath), options.localName);
            } catch (error) {
                withError(error);
            }
        }
    }
};
