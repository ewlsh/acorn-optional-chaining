module.exports = {
    input: 'index.js',
    output: [{
        file: 'dist/index.js',
        format: 'cjs'
    },
    {
        file: 'dist/index.mjs',
        format: 'esm'
    }]
};