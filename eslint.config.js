import moso from  './dist/index.js';

export default await moso(
    {
        vue: true,
        typescript: true,
        ignores: ['fixtures', '_fixtures'],

    },
    {
        files: ['src/**/*.ts'],
        rules: {
            'perfectionist/sort-objects': 'error',
        },
    },
);
