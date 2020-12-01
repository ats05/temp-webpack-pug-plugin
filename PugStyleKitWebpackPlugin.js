const schemaUnits = require('schema-utils');
const {Compilation, sources: {RawSource}} = require('webpack');
const path = require('path');
const pug = require('pug');
const fs = require('fs');
const pugLexer = require('pug-lexer');
const pugParser = require('pug-parser');


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

        const regexTarget = /stylekit\./g;
        const regexReplace = '//-';

        const context = compilation.compiler.context;
        let options = this.options;
        const outputPath = compilation.compiler.outputPath;

        if(!Array.isArray(options)) options = [options];

        options.forEach(config => {
          const buffer = fs.readFileSync(config.from, 'utf8');
          const filename = path.basename(config.from);

          const tokens = pugLexer(buffer, {filename});
          const ast = this._parseFile(config.from);

          const targetNames = ['stylekit'];
          const styleKitElements = this._findElementsByName(ast, targetNames);
          console.log(styleKitElements);
          // ここでタグをコメントに置き換える


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

  _parseFile(filename) {
    const buffer = fs.readFileSync(filename, 'utf8');
    const tokens = pugLexer(buffer, {filename});
    const ast = pugParser(tokens, {filename, buffer});
    return ast;
  }

  _findElementsByName(currentNode, targetNames, list = new Set()){
    let nodes = [];

    if(targetNames.includes(currentNode.name)) {
      list.add(currentNode);
    }

    if('file' in currentNode) {
      const childFilePath = path.join(path.dirname(currentNode.filename), currentNode.file.path);
      const ast = this._parseFile(childFilePath);
      nodes = ast.nodes;
    }
    else if('nodes' in currentNode && currentNode.nodes.length > 0) {
      nodes = currentNode.nodes;
    }
    else if('block' in currentNode && currentNode.block != null) {
      nodes = currentNode.block.nodes;
    }

    nodes.forEach(node => {
      this._findElementsByName(node, targetNames, list);
    });

    return list;
  }
}

module.exports = PugStyleKitWebpackPlugin;
