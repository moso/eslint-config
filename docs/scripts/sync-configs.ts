import {
    readdir,
    readFile,
    rm,
    writeFile,
} from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

import { tableRow, writeOverviewTable } from './overview';

const docsRoot = resolve(import.meta.dirname, '..');
const repoRoot = resolve(docsRoot, '..');
const srcRoot = join(repoRoot, 'src');
const configsRoot = join(srcRoot, 'configs');
const pagesDir = join(docsRoot, 'src', 'content', 'docs', 'configs');

const [
    factorySource,
    typesSource,
    configFiles,
    pageFiles,
] = await Promise.all([
    readFile(join(srcRoot, 'factory.ts'), 'utf8'),
    readFile(join(srcRoot, 'types.ts'), 'utf8'),
    readdir(configsRoot),
    readdir(pagesDir),
]);

const a11yOption = /\ba11y\?:/u;
const absoluteUrl = /^https?:\/\//u;
const attributesEntry = /^attributes:\n(?: {2}.*\n?)*/mu;
const configExport = /\bexport const (\w+) = (?:async )?\(([\s\S]*?)\)(?:: [^=]+)? =>/gu;
const customParser = /\b(?:parser|parserOptions)\s*:\s/u;
const definableIdentifier = /\b[a-z]\w*(?:Enforcement|Options|Requested)\b/gu;
const dynamicImport = /\bimport\('([^'.][^']*)'\)/gu;
const frontmatterBlock = /^---\n([\s\S]*?)\n---/u;
const hasAttributes = /^---\n[\s\S]*?^attributes:/mu;
const gitProtocol = /^git:\/\//u;
const gitUrlNoise = /^git\+|^github:|\.git$/gu;
const identifierGate = /^(\w+)(?: !== (?:false|'none'))?$/u;
const ifStatement = /^\n {4}if \((.*)\) \{\n/u;
const ownOptionGate = /^options\.\w+ !== false$/u;
const packageDetection = /\?\?\s*(?:any)?[Pp]ackageExists\(/u;
const packageLoad = /([=?:])\s*\(?await loadPackages\(\s*\[([^\]]*)\]/gu;
const pageTitle = /^title: (['"]?)(.*)\1$/mu;
const optionTypeName = /\b(?:\w*Options\w+|StylisticConfig)\b/gu;
const quotedString = /'([^']+)'/gu;
const readmeAnchor = /#readme$/u;
const stylisticTypes = ['OptionsStylistic', 'RequiredOptionsStylistic', 'StylisticConfig'];

type Attributes = Readonly<Record<
    | 'auto_detect'
    | 'base_config'
    | 'custom_parseroptions'
    | 'enabled_unless_disabled'
    | 'has_a11y'
    | 'has_lessopinionated'
    | 'has_stylistic'
    | 'has_typeaware',
    boolean
>>;

type Gate = Readonly<{
    autoDetect: boolean;
    enabledByDefault: boolean;
    lessOpinionated: boolean;
}>;

const alwaysOn: Gate = {
    autoDetect: false,
    enabledByDefault: true,
    lessOpinionated: false,
};

const fail = (name: string, reason: string): never => {
    throw new Error(`[sync-configs] "${name}": ${reason}. If src/ is correct, teach docs/scripts/sync-configs.ts the new shape.`);
};

const expandDefinitions = (expression: string, depth = 0): string => depth > 4
    ? expression
    : expression.replaceAll(definableIdentifier, (identifier) => {
        const definition = new RegExp(String.raw `\bconst ${identifier} = ([\s\S]*?);\n`, 'u').exec(factorySource)?.[1];

        return definition === undefined
            ? identifier
            : `(${expandDefinitions(definition, depth + 1)})`;
    });

const resolveGate = (name: string, gate: string): Gate => {
    if (ownOptionGate.test(gate))
        return alwaysOn;

    const identifier = identifierGate.exec(gate)?.[1] ?? fail(name, `unrecognised factory gate \`if (${gate})\``);
    const destructuredDefault = new RegExp(String.raw `\b\w+: ${identifier} = (true|false),`, 'u').exec(factorySource)?.[1];

    if (destructuredDefault !== undefined) {
        return {
            ...alwaysOn,
            enabledByDefault: destructuredDefault === 'true',
        };
    }

    const expanded = expandDefinitions(identifier);

    if (expanded === identifier)
        fail(name, `no definition found for factory gate \`${identifier}\``);

    return {
        autoDetect: packageDetection.test(expanded),
        enabledByDefault: true,
        lessOpinionated: expanded.includes('lessOpinionated'),
    };
};

const factoryGate = (name: string, exportNames: ReadonlyArray<string>): Gate => {
    const callIndex = exportNames
        .map((exportName) => factorySource.search(new RegExp(String.raw `\n\s+(?:mut_configs\.push\()?${exportName}\(`, 'u')))
        .find((index) => index !== -1) ?? fail(name, `none of [${exportNames.join(', ')}] is called in src/factory.ts`);

    const before = factorySource.slice(0, callIndex);
    const ifIndex = before.lastIndexOf('\n    if (');

    if (ifIndex < before.lastIndexOf('\n    }'))
        return alwaysOn;

    const gate = ifStatement.exec(before.slice(ifIndex))?.[1] ?? fail(name, 'could not read the factory gate');

    return resolveGate(name, gate);
};

const typeDeclaration = (typeName: string): string => {
    const start = typesSource.search(new RegExp(String.raw `\bexport (?:interface|type) ${typeName}\b`, 'u'));
    const end = typesSource.indexOf('\nexport ', start + 1);

    return start === -1
        ? ''
        : typesSource.slice(start, end === -1 ? undefined : end);
};

const deriveAttributes = (name: string, source: string): Attributes => {
    const signatures = source.matchAll(configExport).toArray();

    if (signatures.length === 0)
        fail(name, 'no `export const <config> = (...) =>` found');

    const parameterTypes = new Set(signatures.flatMap((signature) => (signature[2] ?? '').match(optionTypeName) ?? []));
    const gate = factoryGate(name, signatures.map((signature) => signature[1] ?? ''));

    return {
        auto_detect: gate.autoDetect,
        base_config: gate.enabledByDefault && !gate.autoDetect && !gate.lessOpinionated,
        custom_parseroptions: customParser.test(source),
        enabled_unless_disabled: gate.enabledByDefault || gate.autoDetect,
        has_a11y: [...parameterTypes].some((typeName) => a11yOption.test(typeDeclaration(typeName))),
        has_lessopinionated: parameterTypes.has('OptionsLessOpinionated') || gate.lessOpinionated,
        has_stylistic: stylisticTypes.some((typeName) => parameterTypes.has(typeName)),
        has_typeaware: parameterTypes.has('OptionsTypeScriptWithTypes') || source.includes('filesTypeAware'),
    };
};

const attributesBlock = (attributes: Attributes): string => [
    'attributes:',
    ...Object.entries(attributes)
        .toSorted(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `  ${key}: ${String(value)}`),
].join('\n');

const newPage = (name: string, attributes: Attributes): string => {
    const title = name
        .split('-')
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(' ');

    return [
        '---',
        `title: '${title}'`,
        `description: 'Configuration information about the ${title} config'`,
        attributesBlock(attributes),
        '---',
        '',
    ].join('\n');
};

const withAttributes = (page: string, name: string, attributes: Attributes): string => {
    const [whole, frontmatter = ''] = frontmatterBlock.exec(page) ?? fail(name, 'page has no frontmatter');
    const withoutAttributes = frontmatter.replace(attributesEntry, '').trimEnd();

    return page.replace(whole, `---\n${withoutAttributes}\n${attributesBlock(attributes)}\n---`);
};

type PackageLoad = Readonly<{
    conditional: boolean;
    name: string;
}>;

const packageLoads = (source: string): ReadonlyArray<PackageLoad> => [
    ...source.matchAll(packageLoad).flatMap(([, operator, list]) => (list ?? '')
        .matchAll(quotedString)
        .map(([, name]) => ({
            conditional: operator !== '=',
            name: name ?? '',
        }))),
    ...source.matchAll(dynamicImport).map(([, name]) => ({
        conditional: false,
        name: name ?? '',
    })),
];

type Repository = string | Readonly<{ directory?: string; url?: string }> | undefined;

const repositoryUrl = (repository: Repository): string | undefined => {
    const raw = typeof repository === 'string' ? repository : repository?.url;

    if (raw === undefined)
        return undefined;

    const url = raw.replaceAll(gitUrlNoise, '').replace(gitProtocol, 'https://');
    const base = absoluteUrl.test(url) ? url : `https://github.com/${url}`;
    const directory = typeof repository === 'object' ? repository.directory : undefined;

    return directory === undefined ? base : `${base}/tree/HEAD/${directory}`;
};

const readManifest = async (packageName: string): Promise<string> => {
    try {
        return await readFile(join(repoRoot, 'node_modules', packageName, 'package.json'), 'utf8');
    } catch {
        return '{}';
    }
};

const homepage = async (packageName: string): Promise<string> => {
    const { homepage: url, repository } = JSON.parse(await readManifest(packageName)) as { homepage?: string; repository?: Repository };

    return url?.replace(readmeAnchor, '') ?? repositoryUrl(repository) ?? `https://npmx.dev/package/${packageName}`;
};

const enabledSymbols = (attributes: Attributes): string => {
    const enabled = attributes.auto_detect
        ? '\u{2611}\u{FE0F}'
        : attributes.enabled_unless_disabled
            ? (attributes.base_config ? '✅' : '🌟')
            : '🟨';

    return `${enabled}${attributes.has_a11y ? '\u{2139}\u{FE0F}' : ''}`;
};

const configNames = new Set(configFiles
    .flatMap((file) => (file !== 'index.ts' && file.endsWith('.ts') ? [basename(file, '.ts')] : [])));

const configs = await Promise.all(Array.from(configNames, async (name) => {
    const path = join(pagesDir, `${name}.mdx`);
    const source = await readFile(join(configsRoot, `${name}.ts`), 'utf8');
    const attributes = deriveAttributes(name, source);
    const current = pageFiles.includes(`${name}.mdx`) ? await readFile(path, 'utf8') : undefined;
    const next = current === undefined ? newPage(name, attributes) : withAttributes(current, name, attributes);

    if (next !== current)
        await writeFile(path, next);

    return {
        attributes,
        packages: packageLoads(source),
        title: pageTitle.exec(next)?.[2] ?? name,
    };
}));

const ownedPackages = new Set(configs.flatMap(({ packages }) => packages.flatMap((load) => (load.conditional ? [] : [load.name]))));

const configRows = configs.flatMap((config) => {
    const packageNames = [...new Set(config.packages.flatMap((load) => (load.conditional && ownedPackages.has(load.name) ? [] : [load.name])))];
    return packageNames.length === 0 ? [] : [{ ...config, packageNames }];
}).toSorted((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));

const homepages = new Map(await Promise.all(Array.from(
    new Set(configRows.flatMap(({ packageNames }) => packageNames)),
    async (packageName) => [packageName, await homepage(packageName)] as const,
)));

await writeOverviewTable('sync-configs', [
    '| Config | Plugins | Enabled | Stylistic | Type-aware |',
    '| --- | --- | --- | --- | --- |',
    ...configRows.map(({ attributes, packageNames, title }) => tableRow([
        title,
        packageNames.map((packageName) => `[\`${packageName}\`](${homepages.get(packageName) ?? ''})`).join(', '),
        enabledSymbols(attributes),
        attributes.has_stylistic ? '🎨' : '',
        attributes.has_typeaware ? '💭' : '',
    ])),
]);

await Promise.all(pageFiles.map(async (file) => {
    const path = join(pagesDir, file);

    if (file.endsWith('.mdx') && !configNames.has(basename(file, '.mdx')) && hasAttributes.test(await readFile(path, 'utf8')))
        await rm(path);
}));
