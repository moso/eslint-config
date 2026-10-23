import pkg from '../package.json' with { type: 'json' };

if (!Bun.semver.satisfies(Bun.version, pkg.engines.bun))
    throw new Error(`Bun ${pkg.engines.bun} is required, found ${Bun.version}. Run bun upgrade`);
