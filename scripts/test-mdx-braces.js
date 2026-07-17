const { compile } = require('@mdx-js/mdx');
const fs = require('fs');

async function run() {
const samples = [
    '```gradle\ndependencies {\n  implementation("x")\n}\n```',
    '```gradle\ndependencies \\{\n  implementation("x")\n\\}\n```',
    '```\nParameter : { "placementName": "x" }\n```',
    '```\nParameter : \\{ "placementName": "x" \\}\n```',
  ];
  for (const s of samples) {
    try {
      await compile(s);
      console.log('OK compile:', s.split('\n')[0]);
    } catch (e) {
      console.log('FAIL compile:', e.message);
    }
  }
}

run();
