import { GLOB_EXCLUDE } from '@/globs';

import type { TypedFlatConfigItem } from '@/types';

export const ignores = async (): Promise<TypedFlatConfigItem[]> => {
    return [
        {
            name: 'moso/ignores',
            ignores: GLOB_EXCLUDE,
        },
    ];
};
