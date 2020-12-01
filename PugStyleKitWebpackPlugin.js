const schemaUnits = require('schema-utils');
const {Compilation, sources: {RawSource}} = require('webpack');
const path = require('path');
const pug = require('pug');
const fs = require('fs');


const schema = {
  anyOf: [
    { type: 'array' },
    {
      type: 'object',
      propaties: {
        from: { type: 'string' },
        to: { type: 'string' },
      },
    }
  ]
};

const PLUGIN_NAME = 'PugStyleKitWebpackPlugin';

class PugStyleKitWebpackPlugin {

  constructor(options = {}){
    schemaUnits.validate(schema, options, { name: PLUGIN_NAME });
    this.options = options;
  }

  apply(compiler) {


    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {

      compilation.hooks.processAssets.tapPromise(PLUGIN_NAME, async () => {

        const context = compilation.compiler.context;
        let options = this.options;
        const outputPath = compilation.compiler.outputPath;

        if(!Array.isArray(options)) options = [options];

        options.forEach(config => {
          const buffer = fs.readFileSync(config.from, 'utf8');
          const options = {
            filename: config.from,
            basedir: path.dirname(config.from)
          };
          const html = pug.render(buffer, options);

          const distPath = path.relative(outputPath, config.to);
          compilation.emitAsset(distPath, new RawSource(html));
        });
      });
    });
  }
}

module.exports = PugStyleKitWebpackPlugin;
