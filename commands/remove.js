const { withError, getRepoName, getStatePath } = require('../src/utils');


module.exports = {
    method(name) {
        const api = require('../src/github');

        api.getRepo(process.env.GITHUB_USERNAME, getRepoName(getStatePath(name))).deleteRepo()
        .catch(() => withError('The repository does not exist or is already deleted'))
        .then(() => {
            console.log(`Repository deleted`);
        });
    }
};