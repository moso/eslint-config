import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type {
    OptionsHasTypeScript,
    OptionsLessOpinionated,
    OptionsOverrides,
    TypedFlatConfigItem,
} from '../types';

export const promise = async (
    options: Readonly<
        OptionsHasTypeScript &
        OptionsLessOpinionated &
        OptionsOverrides
    >,
): Promise<TypedFlatConfigItem[]> => {
    const {
        lessOpinionated,
        overrides,
        typescript,
    } = options;

    const [promisePlugin] = await loadPackages(['eslint-plugin-promise']);

    return [
        {
            name: 'moso/promise',
            plugins: {
                'promise': memoize(promisePlugin, 'eslint-plugin-promise'),
            },
            rules: {
                'promise/no-callback-in-promise': 'error',
                'promise/no-nesting': 'error',
                'promise/no-new-statics': 'error',
                'promise/no-promise-in-callback': 'error',
                'promise/no-return-in-finally': 'error',
                'promise/no-return-wrap': 'error',
                'promise/param-names': 'error',
                'promise/valid-params': 'error',

                ...(!lessOpinionated && {
                    'promise/always-return': typescript
                        ? 'off'
                        : ['error', { ignoreLastCallback: true }],
                    'promise/avoid-new': 'off',
                    'promise/catch-or-return': [
                        'error',
                        {
                            allowFinally: true,
                            terminationMethod: ['catch', 'asCallback', 'finally'],
                        },
                    ],
                    'promise/no-native': 'off',
                    // 'promise/prefer-catch': 'error', // Disabled as `unicorn/prefer-then-catch` forces `.then().catch()` better
                }),

                ...overrides,
            },
        },
    ];
};
