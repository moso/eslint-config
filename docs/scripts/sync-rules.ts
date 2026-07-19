import {
    mkdirSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

const docsRoot = resolve(import.meta.dirname, '..');
const rulesRoot = resolve(docsRoot, '..', 'src', 'rules');
const outDir = join(docsRoot, 'src', 'content', 'docs', 'rules');

const emoji: Readonly<Record<string, string>> = {
    ':bulb:': '💡',
    // eslint-disable-next-line @moso/no-invisible-characters
    ':gear:': '⚙️',
    ':thought_balloon:': '💭',
    ':white_check_mark:': '✅',
    ':wrench:': '🔧',
};

const escapeMdxLine = (line: string): string => line
    .split(/(`[^`]*`)/u)
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
            if ((/^\s*(?:```|~~~)/u).test(line)) {
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

const toPage = (markdown: string, name: string): string => {
    const lines = markdown.split('\n');
    const titleIndex = lines.findIndex((line) => line.startsWith('# '));

    if (titleIndex === -1)
        throw new Error(`No H1 title found in rule doc for "${name}"`);

    const title = toPlainText(lines[titleIndex] ?? '').replace(/^#\s*/u, '');
    const body = lines.slice(titleIndex + 1);
    const description = toPlainText(body.find((line) => line.trim().length > 0) ?? '');

    return [
        '---',
        `title: ${JSON.stringify(title)}`,
        `description: ${JSON.stringify(description)}`,
        '---',
        escapeMdx(body.join('\n')),
    ].join('\n');
};

rmSync(outDir, { force: true, recursive: true });
mkdirSync(outDir, { recursive: true });

const ruleNames = readdirSync(rulesRoot, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? [entry.name] : []));

ruleNames.forEach((name) => {
    const source = readFileSync(join(rulesRoot, name, `${name}.md`), 'utf8');
    writeFileSync(join(outDir, `${name}.mdx`), toPage(source, name));
});
