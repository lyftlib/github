const Github = require('github-api');

// Creates a new instance of the Github class with the credentials of the user
const api = new Github({
    username: process.env.GITHUB_USERNAME,
    token: process.env.GITHUB_TOKEN
});

module.exports = api;