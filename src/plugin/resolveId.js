const path = require('path');

function resolveId(state, config, importee, importer) {
    const match = importee.match(config.pattern);
    if (importee.startsWith('\0rollup-plugin-web-worker-loader::helper')) {
        if (config.forceInline) {
            return `\0${state.forceInlineCounter++}::${importee.substr(1)}`;
        }
        return importee;
    } else if (match && match.length) {
        const name = match[match.length - 1];
        if (!state.idMap.has(name)) {
            let target = null;
            if (importer) {
                const folder = path.dirname(importer);
                const paths = require.resolve.paths(importer);
                paths.push(folder);
                target = require.resolve(name, {paths});
            } else if (path.isAbsolute(name)) {
                target = name;
            }

            if (target) {
                const prefixed = `\0rollup-plugin-worker-loader::module:${config.forceInline ? `:${state.forceInlineCounter++}:` : ''}${name}`;
                if (!state.idMap.has(prefixed)) {
                    const inputOptions = Object.assign({}, state.options, {
                        input: target,
                    });

                    state.idMap.set(prefixed, {
                        workerID: `web-worker-${state.idMap.size}.js`,
                        chunk: null,
                        inputOptions,
                        target,
                    });
                }

                if (state.idMap.has(prefixed)) {
                    return prefixed;
                }
                return target;
            }
        }
    }
    return null;
}

module.exports = resolveId;
