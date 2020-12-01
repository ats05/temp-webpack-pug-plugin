const schemaUnits = require('schema-utils');
const path = require('path');
const pug = require('pug');
const fs = require('fs');

const schema = {
  type: 'object',
  properties: {
    templateFile: {
      anyOf: [
        { type: 'array' },
        { type: 'string' },
      ]
    },
  }
};

const PLUGIN_NAME = 'PugStyleKitWebpackPlugin';

class PugStyleKitWebpackPlugin {

  constructor(options = {}){
    schemaUnits.validate(schema, options, { name: PLUGIN_NAME });
    this.options = options;
  }

  apply(compiler) {

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const context = compilation.compiler.context;
      let templateFile = this.options.templateFile;

      if(!Array.isArray(templateFile)) templateFile = [templateFile];

      templateFile.forEach(templatePath => {
        const buffer = fs.readFileSync(templatePath, 'utf8');
        // const tokens = lex(buffer, {templatePath});
        // const ast = parse(tokens, {templatePath, buffer});
        const options = {};
        const fn = pug.compile(buffer, options);
        const html = fn();

        compilation.assets['index.html'] = {
          source: function() {
            return html;
          },
          size: function() {
            return html.length;
          }
        };
      });
      callback();
    });

  }
}

module.exports = PugStyleKitWebpackPlugin;
