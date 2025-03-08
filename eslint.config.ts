import { moso } from './src';

export default moso(
    {
        react: true,
        typescript: true,
        vue: true,

    },
    {
        files: ['src/**/*.ts'],
        rules: {
            'perfectionist/sort-objects': [
                'error',
                {
                    type: 'unsorted',
                    order: 'asc',
                    fallbackSort: { type: 'unsorted' },
                },
            ],
        },
    },
);
