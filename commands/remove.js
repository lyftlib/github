const { withError, getRepoName, getStatePath } = require('../src/utils');

// Exports the remove command for the Github module
module.exports = {
    method(name) {
        const api = require('../src/github');

        // Gets the repository and deletes it.
        api.getRepo(process.env.LYFTPV_GITHUB_USERNAME, getRepoName(getStatePath(name))).deleteRepo()
        .catch(() => withError('The repository does not exist or is already deleted'))
        .then(() => {
            console.log(`Repository deleted`);
        });
    }
};