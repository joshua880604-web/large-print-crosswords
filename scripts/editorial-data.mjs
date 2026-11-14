// Shared build-time registry of preserved original editions.
import {readFileSync} from 'node:fs';
export const editorialSeries=JSON.parse(readFileSync(new URL('../src/data/editorial-series.json',import.meta.url),'utf8'));
export const originals=editorialSeries.filter(series=>series.archive).flatMap(series=>JSON.parse(readFileSync(new URL(`../src/data/archives/${series.archive}`,import.meta.url),'utf8')));
export const previousEditions=JSON.parse(readFileSync(new URL('../src/data/previous-editions.json',import.meta.url),'utf8'));
export const sourceRevisions=new Map(editorialSeries.flatMap(config=>JSON.parse(readFileSync(new URL(config.source,import.meta.url),'utf8')).map(source=>[source.id,source.revision??config.revision??2])));
