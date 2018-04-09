const mode = require('./config/helpers').processFlag('mode');
switch (mode) {
  case 'prod':
  case 'production':
    console.log('Using production Webpack configuration...');
    module.exports = require('./config/webpack.prod');
    break;
  case 'test':
  case 'testing':
    console.log('Using testing Webpack configuration...');
    module.exports = require('./config/webpack.test');
    break;
  case 'dev':
  case 'development':
  default:
    console.log('Using developement Webpack configuration...');
    module.exports = require('./config/webpack.dev');
}
