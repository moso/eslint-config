import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const overviewPath = resolve(import.meta.dirname, '..', 'src', 'content', 'docs', 'configs', 'overview.mdx');

export const tableRow = (cells: ReadonlyArray<string>): string => `|${cells.map((cell) => (cell === '' ? ' ' : ` ${cell} `)).join('|')}|`;

export const writeOverviewTable = async (marker: string, lines: ReadonlyArray<string>): Promise<void> => {
    const start = `{/* ${marker}:start (generated, do not edit) */}`;
    const end = `{/* ${marker}:end */}`;
    const page = await readFile(overviewPath, 'utf8');
    const from = page.indexOf(start);
    const to = page.indexOf(end);

    if (from === -1 || to < from)
        throw new Error(`[${marker}] overview.mdx is missing the "${start}" … "${end}" markers`);

    const next = [
        page.slice(0, from + start.length),
        '',
        ...lines,
        '',
        page.slice(to),
    ].join('\n');

    if (next !== page)
        await writeFile(overviewPath, next);
};
