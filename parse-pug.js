
const fs = require('fs');
const path = require('path');

const lex = require('pug-lexer');
const parse = require('pug-parser');

// pugファイルの抽象構文木を作成する
function parseFile(filename) {
  // pugファイルの中身を読み取って、bufferに入れる
  const buffer = fs.readFileSync(filename, 'utf8');

  // 字句解析して、トークンを得る
  const tokens = lex(buffer, {filename});

  // 構文解析
  const ast = parse(tokens, {filename, buffer});

  // 見やすく整形してコンソールに出力
  // console.log(JSON.stringify(ast, null, '  '));

  return ast;
}

// 抽象構文木を基に、ファイルのinclude構造を紐解く。
// 重複を除去する目的でSetを使ってる
function findElementsByType(currentNode, targetTypes, list = new Set()){
  let nodes = [];

  // カレントノードが検索対象だったら、Setに追加
  if(targetTypes.includes(currentNode.type)) {
    list.add(currentNode);
  }

  if('file' in currentNode) { // カレントノードがfile属性を持っていたら、もう一度構文解析をしてからその中身を検索する
    const childFilePath = path.join(path.dirname(currentNode.filename), currentNode.file.path);
    const ast = parseFile(childFilePath);
    nodes = ast.nodes;
  }
  else if('nodes' in currentNode && currentNode.nodes.length > 0) { // カレントノードがnodes属性を持っていたら、さらに検索
    nodes = currentNode.nodes;
  }
  else if('block' in currentNode && currentNode.block != null) { // カレントノードがblock属性を持っていたら、その中のnodes属性からさらに検索
    nodes = currentNode.block.nodes;
  }

  nodes.forEach(node => {
    findElementsByType(node, targetTypes, list);
  });

  return list;
}

const filename = 'src/parse-test.pug';
const ast = parseFile(filename);
console.log(JSON.stringify(ast, null, '  '));
const targetTypes = ['Extends', 'Include'];
const includeList = findElementsByType(ast, targetTypes);

console.log(includeList);
