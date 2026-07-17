const fs = require('fs');
const { unified } = require('unified');
const remarkParse = require('remark-parse');
const remarkMdx = require('remark-mdx');
const remarkStringify = require('remark-stringify');

async function test(file) {
  const body = fs.readFileSync(file, 'utf8');
  const start = body.indexOf('---', 3);
  const mdx = start === -1 ? body : body.slice(body.indexOf('---', 3) + 3);
  const tree = unified().use(remarkParse).use(remarkMdx).parse(mdx);
  const out = unified().use(remarkStringify).stringify(tree);
  const count = (out.match(/```/g) || []).length;
  return { file, fenceCount: count, balanced: count % 2 === 0, len: out.length };
}

(async () => {
  const files = process.argv.slice(2);
  for (const f of files) {
    console.log(JSON.stringify(await test(f)));
  }
})();
