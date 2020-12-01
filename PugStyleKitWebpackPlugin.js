class PugStyleKitWebpackPlugin {
  apply(compiler) {
    const PLUGIN_NAME = 'PugStyleKitWebpackPlugin';

    compiler.hooks.beforeRun.tapAsync(PLUGIN_NAME, (compiler, callback) => {
      console.log(PLUGIN_NAME);
      console.log('this is before run hook!');
      callback();
    });

  }
}

module.exports = PugStyleKitWebpackPlugin;
