/* eslint-disable @moso/no-invisible-characters */
import {
    mkdir,
    readdir,
    readFile,
    rm,
    writeFile,
} from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { tableRow, writeOverviewTable } from './overview';

const docsRoot = resolve(import.meta.dirname, '..');
const rulesRoot = resolve(docsRoot, '..', 'src', 'rules');
const outDir = join(docsRoot, 'src', 'content', 'docs', 'rules');

const emoji: Readonly<Record<string, string>> = {
    ':bulb:': '💡',
    ':gear:': '⚙️',
    ':thought_balloon:': '💭',
    ':white_check_mark:': '✅',
    ':wrench:': '🔧',
};

const codeSpan = /(`[^`]*`)/u;
const codeFence = /^\s*(?:```|~~~)/u;
const headingMarker = /^#\s*/u;
const trailingPeriod = /\.$/u;
const recommendedRule = /\brecommended: 'recommended'/u;
const fixableRule = /\bfixable: '/u;

const escapeMdxLine = (line: string): string => line
    .split(codeSpan)
    .map((part, index) => index % 2 === 1
        ? part
        : Object.entries(emoji).reduce(
            (text, [shortcode, character]) => text.replaceAll(shortcode, character),
            part.replaceAll(/([<{])/gu, String.raw `\$1`),
        ))
    .join('');

const escapeMdx = (markdown: string): string => {
    const state = markdown.split('\n').reduce<{ inFence: boolean; lines: ReadonlyArray<string> }>(
        (accumulator, line) => {
            if (codeFence.test(line)) {
                return {
                    inFence: !accumulator.inFence,
                    lines: [...accumulator.lines, line],
                };
            }

            return {
                inFence: accumulator.inFence,
                lines: [
                    ...accumulator.lines,
                    accumulator.inFence
                        ? line
                        : escapeMdxLine(line),
                ],
            };
        },
        {
            inFence: false,
            lines: [],
        },
    );

    return state.lines.join('\n');
};

const toPlainText = (markdown: string): string => markdown.replaceAll(/[`*_]/gu, '').trim();

const parseDoc = (markdown: string, name: string) => {
    const lines = markdown.split('\n');
    const titleIndex = lines.findIndex((line) => line.startsWith('# '));

    if (titleIndex === -1)
        throw new Error(`No H1 title found in rule doc for "${name}"`);

    const body = lines.slice(titleIndex + 1);

    return {
        body,
        summary: body.find((line) => line.trim().length > 0) ?? '',
        title: toPlainText(lines[titleIndex] ?? '').replace(headingMarker, ''),
    };
};

const toPage = (markdown: string, name: string): string => {
    const { body, summary, title } = parseDoc(markdown, name);

    return [
        '---',
        `title: ${JSON.stringify(title)}`,
        `description: ${JSON.stringify(toPlainText(summary))}`,
        '---',
        escapeMdx(body.join('\n')),
    ].join('\n');
};

const toTableRow = (markdown: string, name: string, ruleSource: string): string => tableRow([
    `[\`${name}\`](/rules/${name}/)`,
    escapeMdxLine(parseDoc(markdown, name).summary.trim().replace(trailingPeriod, '')).replaceAll('|', String.raw `\|`),
    recommendedRule.test(ruleSource) ? '✅' : '',
    fixableRule.test(ruleSource) ? '🔧' : '',
]);

await rm(outDir, { force: true, recursive: true });
await mkdir(outDir, { recursive: true });

const ruleEntries = await readdir(rulesRoot, { withFileTypes: true });
const ruleNames = ruleEntries
    .flatMap((entry) => (entry.isDirectory() ? [entry.name] : []))
    .toSorted();

const tableRows = await Promise.all(ruleNames.map(async (name) => {
    const [markdown, ruleSource] = await Promise.all([
        readFile(join(rulesRoot, name, `${name}.md`), 'utf8'),
        readFile(join(rulesRoot, name, `${name}.ts`), 'utf8'),
    ]);

    await writeFile(join(outDir, `${name}.mdx`), toPage(markdown, name));

    return toTableRow(markdown, name, ruleSource);
}));

await writeOverviewTable('sync-rules', [
    '| Rule | Description | Default | Fixable |',
    '| --- | --- | --- | --- |',
    ...tableRows,
]);
