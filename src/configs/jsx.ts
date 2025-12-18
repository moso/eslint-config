import type { OptionsFiles, TypedFlatConfigItem } from '../types';

export const jsx = (options: Readonly<Required<OptionsFiles>>): TypedFlatConfigItem[] => {
    const { files } = options;

    return [
        {
            name: 'moso/jsx',
            files,
            languageOptions: {
                parserOptions: {
                    ecmaFeatures: {
                        jsx: true,
                    },
                },
            },
        },
    ];
};
