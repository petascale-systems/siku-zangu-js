const {createGlobPatternsForDependencies} = require('@nx/react/tailwind');
const {join} = require('path');

module.exports = {
    content: [join(__dirname, '**/!(*.stories|*.spec).{ts,tsx,html}'), ...createGlobPatternsForDependencies(__dirname), 'node_modules/flowbite-react/lib/esm/**/*.js',],
    theme: {extend: {}},
    plugins: [// Add this plugin
        require('flowbite/plugin'),],
};
