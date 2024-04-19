import moso from  './src';

export default moso(
    {
        react: true,
        vue: true,
        typescript: true,

    },
    {
        files: ['src/**/*.ts'],
        rules: {
            'perfectionist/sort-objects': 'error',
        },
    },
);
