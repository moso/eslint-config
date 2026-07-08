import fs from 'node:fs/promises';

import { flatConfigsToRulesDTS } from 'eslint-typegen/core';

import { full } from '../src/presets';
import { moso } from '../src/factory';

const configs = await moso(full);

const configNames = configs.map((x) => x.name).filter(Boolean) as string[];

const dts = await flatConfigsToRulesDTS(configs, { includeAugmentation: false });
const fullDts = `// @ts-nocheck\n
${dts}\n\n

// Names of all the configs\n
export type ConfigNames = ${configNames.map((x) => `'${x}'`).join(' | ')};
`;

await fs.writeFile('src/typegen.d.ts', fullDts);
