const schemaUnits = require('schema-utils');


const schema = {
  type: 'object',
  properties: {
    test: {
      type: 'string'
    }
  }
};

const PLUGIN_NAME = 'PugStyleKitWebpackPlugin';

class PugStyleKitWebpackPlugin {

  constructor(options = {}){
    schemaUnits.validate(schema, options, { name: PLUGIN_NAME });
    this.options = options;
  }

  apply(compiler) {

    compiler.hooks.beforeRun.tapAsync(PLUGIN_NAME, (compiler, callback) => {
      console.log(PLUGIN_NAME);
      console.log('this is before run hook!');
      console.log(this.options);
      callback();
    });

  }
}

module.exports = PugStyleKitWebpackPlugin;
