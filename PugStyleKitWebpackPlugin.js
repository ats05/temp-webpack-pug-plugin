const schemaUnits = require('schema-utils');
const {Compilation, sources: {RawSource}} = require('webpack');
const path = require('path');
const pug = require('pug');
const fs = require('fs');
const pugLexer = require('pug-lexer');
const pugParser = require('pug-parser');
const pugCodeGen = require('pug-code-gen');
const sass = require('sass')


const schema = {
  anyOf: [
    { type: 'array' },
    {
      type: 'object',
      propaties: {
        from: { type: 'string' },
        to: {
          anyOf: [
            {
              type: 'object',
              propaties: {
                html: { type: 'string' },
                css: { type: 'string' },
              },
            },
            { type: 'string' }
          ]
        },
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
        const outputPath = compilation.compiler.outputPath;
        let options = this.options;

        if(!Array.isArray(options)) options = [options];

        options.forEach(config => {

          const inputFile = config.from;
          const outputFile = (typeof config.to == 'string') ?
            {html: config.to} : {html: config.to.html, css: config.to.css};

          const pugReadBuffer = fs.readFileSync(inputFile, 'utf8');
          const filename = path.basename(inputFile);

          const tokens = pugLexer(pugReadBuffer, {filename});
          const ast = this._parseFile(inputFile);

          const styleKitBlocks = this._findStyleKitComments(ast);
          if(styleKitBlocks.length > 0) {

            const resultSass = this._createScss(styleKitBlocks);
            const distPath = path.relative(outputPath, outputFile.css);
            compilation.emitAsset(distPath, new RawSource(resultSass.css.toString()));
          }

          // TODO Async
          const options = {
            filename: inputFile,
            basedir: path.dirname(inputFile)
          };
          const html = pug.render(pugReadBuffer, options);
          const distPath = path.relative(outputPath, outputFile.html);
          compilation.emitAsset(distPath, new RawSource(html));
        });
      });
    });
  }

  _createScss(blocks) {
    let sassBuffer = '';
    blocks.forEach((element) => {
      element.block.nodes.forEach((node) => {
        sassBuffer += node.val;
      });
    });
    // TODO Async
    return sass.renderSync({
      data: sassBuffer,
      // includePaths: [],
      outputStyle: "expanded", // or "compressed"
    });
  }

  _parseFile(filename) {
    const buffer = fs.readFileSync(filename, 'utf8');
    const tokens = pugLexer(buffer, {filename});
    const ast = pugParser(tokens, {filename, buffer});
    return ast;
  }

  _findStyleKitComments(currentNode, list = []){
    let nodes = [];

    if(currentNode.type == 'BlockComment' && currentNode.val.trim() == 'stylekit') {
      list.push(currentNode);
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
      this._findStyleKitComments(node, list);
    });

    return list;
  }
}

module.exports = PugStyleKitWebpackPlugin;
