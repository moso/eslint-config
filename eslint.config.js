import moso from  './src';

export default moso(
    {
        react: true,
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
