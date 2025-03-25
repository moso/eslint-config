import { moso } from './src';

export default moso(
    {
        react: false,
        typescript: true,
        vue: false,
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
