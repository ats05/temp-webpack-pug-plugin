const fs = require('fs');

const lex = require('pug-lexer');
const parse = require('pug-parser');

// pugファイルの中身を読み取って、bufferに入れる
const filename = './src/parse-test.pug';
const buffer = fs.readFileSync(filename, 'utf8');

// 字句解析して、トークンを得る
const tokens = lex(buffer, {filename});

// 構文解析
const ast = parse(tokens, {filename, buffer});

// 見やすく整形してコンソールに出力
console.log(JSON.stringify(ast, null, '  '))
