import moso from '@moso/eslint-config';

export default moso(
    {
        astro: true,
        ignores: {
            userIgnores: [
                '.astro',
                'dist',
                'src/content/docs/rules',
            ],
        },
    },
    {
        files: ['src/overrides/ThemeProvider.astro'],
        rules: {
            // The theme pin must run inline before first paint to avoid a light-theme flash
            'astro/no-unsafe-inline-scripts': 'off',
        },
    },
);
