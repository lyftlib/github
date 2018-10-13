const { writeFile } = require('fs');

const { filter, clone, withError, getStatePath } = require('../src/utils');

// Exports the add command for the Github module
module.exports = {
    // Defines all parameters allowed for this command in the cli
    cli : [
        '[--repo-name=<repo-name>]',
        '[--description=<description>]',
        '[--homepage=<homepage>]',
        '[--private]',
        '[--has-issues]',
        '[--has-projects]',
        '[--has-wiki]',
        '[--team-id=<team-id>]',
        '[--auto-init]',
        '[--gitignore-template=<gitignore-template>]',
        '[--license-template=<license-template>]',
        '[--allow-squash-merge]',
        '[--allow-commit-merge]',
        '[--allow-rebase-merge]',
        '[--clone]',
    ],
    // Map object used to get only parameters required for this command
    // Interpretation into github-api syntax
    args : {
        '--repo-name': 'repoName',
        '--description': 'description',
        '--homepage': 'homepage',
        '--private': 'private',
        '--has-issues': 'has_issues',
        '--has-projects': 'has_projects',
        '--has-wiki': 'has_wiki',
        '--team-id': 'team_id',
        '--gitignore-template': 'gitignore_template',
        '--license-template': 'license_template',
        '--allow-squash-merge': 'allow_squash_merge',
        '--allow-commit-merge': 'allow_commit_merge',
        '--allow-rebase-merge': 'allow_rebase_merge',
        '--clone' : 'clone'
    },
    // The default filter
    filter,
    method(options) {
        const api = require('../src/github');
        // If the user uses the flag --repo-name to rename his repository
        options.name = options.repoName ? options.repoName : options.name;
        const mustClone = options.clone;
        const localName = options.localName;

        // Deletes all keys whom not needed by the function createRepo
        delete options.clone;
        delete options.localName;
        delete options.repoName;

        // Uses the github-api to create the repo
        api.getUser().createRepo(options)
        .then(response => {
            // The name of the resource provided by the user
            response.data.localName = localName;
            // Writes a file named state.json to keep all data of the new repository.
            // These data will be used to manage the repository by the other commands of this module
            writeFile(getStatePath(localName), JSON.stringify(response.data), error => {
                if (error) withError(error);
                console.log(`Repository ${options.name} created`);

                // If the flag --clone is provided
                if (mustClone) {
                    try {
                        clone(response.data['clone_url'], localName);
                    } catch (error) {
                        withError(error);
                    }
                }
            });
        })
        .catch(withError);
    }
};