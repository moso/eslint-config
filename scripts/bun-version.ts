import pkg from '../package.json' with { type: 'json' };

const prefix = '[@moso/bun-version-check]';

console.warn(`🔍 ${prefix}: Checking the version of Bun installed ...\n`);

setTimeout(() => {
    if (Bun.semver.satisfies(Bun.version, pkg.engines.bun))
        console.warn(`✅ ${prefix}: Bun v${Bun.version} found (mininum required: ${pkg.engines.bun.replace('>=', 'v')}), installing packages ...`);
    else
         
        throw new Error(`❌ ${prefix}: Bun v${pkg.engines.bun} is required, found v${Bun.version}. No packages was installed. Run 'bun upgrade' to fix this error.`);
}, 1000);
