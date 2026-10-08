import moso from '../src';

export default moso(
    {
        astro: {
            overrides: {
                'astro/no-unsafe-inline-scripts': 'off',
            },
        },
    },
    {
        ignores: ['.astro', 'dist', 'src/content/docs/rules'],
    },
);
