const {
    filter,
    clone,
    withError,
    getStatePath,
    getClonePath,
    getCloneUrl,
} = require('../src/utils');

module.exports = {
    cli : [
        'path',
        'clone'
    ],
    args : {
        'path': 'path',
        'clone': 'clone',
    },
    filter,
    method(options) {
        const statePath = getStatePath(options.localName);

        if (options.path) {
            console.log(getClonePath(statePath));
        } else if (options.clone) {
            try {
                clone(getCloneUrl(statePath), options.localName);
            } catch (error) {
                withError(error);
            }
        }
    }
};
