// Explicit release membership prevents a later expansion changing an older audit.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
export function releaseScope(args=process.argv){
 const option=args.find(arg=>arg.startsWith('--release='));
 const release=option?Number(option.split('=')[1]):1000;
 const ranges=new Map([[1000,[100,200]],[1200,[200,240]],[1500,[240,300]]]);
 const range=ranges.get(release);
 assert.ok(range,'Supported release: 1000, 1200 or 1500');
 const manifest=JSON.parse(readFileSync(new URL('../src/data/editorial-series.json',import.meta.url),'utf8'));
 const puzzles=JSON.parse(readFileSync(new URL('../src/data/puzzles.json',import.meta.url),'utf8'));
 const configs=manifest.slice(...range);
 const ids=new Set(configs.flatMap(c=>JSON.parse(readFileSync(new URL(c.source,import.meta.url),'utf8')).map(s=>s.id)));
 const selected=puzzles.filter(p=>ids.has(p.id));
 assert.equal(ids.size,(range[1]-range[0])*5);
 assert.equal(selected.length,ids.size);
 return {release,puzzles:selected};
}
