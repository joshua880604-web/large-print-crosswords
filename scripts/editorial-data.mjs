// Shared build-time registry of preserved original editions.
import {readFileSync} from 'node:fs';
export const editorialSeries=JSON.parse(readFileSync(new URL('../src/data/editorial-series.json',import.meta.url),'utf8'));
export const originals=editorialSeries.flatMap(series=>JSON.parse(readFileSync(new URL(`../src/data/archives/${series.archive}`,import.meta.url),'utf8')));
