import moso from  './src';

export default moso(
    {
        vue: true,
        typescript: true,

    },
    {
        ignores: [
            'fixtures',
            '_fixtures'
        ],
    },
    {
        files: ['src/**/*.ts'],
        rules: {
            'perfectionist/sort-objects': 'error',
        },
    },
);
