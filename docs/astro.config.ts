import starlight from '@astrojs/starlight';
import interVariable from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
import notoSansMonoVariable from '@fontsource-variable/noto-sans-mono/files/noto-sans-mono-latin-wght-normal.woff2?url';
import { defineConfig } from 'astro/config';

export default defineConfig({
    integrations: [
        starlight({
            components: {
                ThemeProvider: './src/overrides/ThemeProvider.astro',
                ThemeSelect: './src/overrides/ThemeSelect.astro',
            },
            customCss: ['./src/styles/custom.css'],
            description: 'Opinionated ESLint config for JavaScript, TypeScript, Vue, React, and more.',
            editLink: {
                baseUrl: 'https://github.com/moso/eslint-config/edit/main/docs/',
            },
            head: [
                {
                    attrs: {
                        crossorigin: 'anonymous',
                        href: interVariable,
                        rel: 'preload',
                        type: 'font/woff2',
                    },
                    tag: 'link',
                },
                {
                    attrs: {
                        crossorigin: 'anonymous',
                        href: notoSansMonoVariable,
                        rel: 'preload',
                        type: 'font/woff2',
                    },
                    tag: 'link',
                },
            ],
            logo: {
                src: './src/assets/logo.svg',
            },
            sidebar: [
                {
                    items: [
                        'guides/getting-started',
                        'guides/configuration',
                        'guides/typed-linting',
                        'guides/frameworks',
                        'guides/faq',
                    ],
                    label: 'Guides',
                },
                {
                    items: [
                        'configs/overview',
                        'configs/astro',
                        'configs/e18e',
                        'configs/functional',
                        'configs/ignores',
                        'configs/imports',
                        'configs/javascript',
                        'configs/jsx',
                        'configs/nextjs',
                        'configs/node',
                        'configs/perfectionist',
                        'configs/promise',
                        'configs/react',
                        'configs/regexp',
                        'configs/stylistic',
                        'configs/typescript',
                        'configs/unicorn',
                        'configs/vue',
                        'configs/others',
                    ],
                    label: 'Configs',
                },
                {
                    items: [{ autogenerate: { directory: 'rules' } }],
                    label: 'Rules',
                },
            ],
            social: [
                { href: 'https://github.com/moso/eslint-config', icon: 'github', label: 'GitHub' },
            ],
            title: '@moso/eslint-config',
        }),
    ],
    // TODO: replace with the final Cloudflare Pages / custom domain URL
    site: 'https://example.pages.dev',
});
