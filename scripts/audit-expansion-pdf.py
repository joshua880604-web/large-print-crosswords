"""Check current-run Chromium exports for size, text, typography and boundaries.

Requires PyMuPDF in this cloud machine. This is separate from physical-printer
testing and from complete accessibility or target-reader validation.
"""
import json
import re
import sys
from pathlib import Path
import fitz

directory=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/lpc-expansion-print')
export=json.loads((directory/'exports.json').read_text())
assert export['checked']==export['expected']==2000 and not export['failures']
def normalize(text):
    # Chromium may break after a visible hyphen. PDF extraction inserts a newline
    # there; join that line without changing any printed letters or punctuation.
    text=re.sub(r'(?<=-)\s+(?=\w)','',text)
    return re.sub(r'\s+',' ',text).strip()
failures=[]
for case in export['results']:
    try:
        doc=fitz.open(directory/case['file'])
        assert len(doc)==case['pages'],f'{len(doc)} pages, expected {case["pages"]}'
        text=normalize(' '.join(page.get_text() for page in doc))
        assert normalize(case['title']) in text,'Missing title'
        for expected in case['expectedText']:
            assert normalize(expected) in text,f'Missing text: {expected}'
        spans=[]
        for page in doc:
            assert abs(page.rect.width-612)<1 and abs(page.rect.height-792)<1,'Not US Letter'
            current=[span for block in page.get_text('dict')['blocks'] if 'lines' in block for line in block['lines'] for span in line['spans'] if span['text'].strip()]
            for span in current:
                x0,y0,x1,y1=span['bbox']
                assert x0>=0 and y0>=0 and x1<=613 and y1<=793,f'Outside paper: {span["text"]}'
            footers=[span for span in current if 'largeprintcrosswords.com' in span['text']]
            for footer in footers:
                fy=footer['bbox'][1]
                for span in current:
                    if abs(span['size']-case['font'])<.15:
                        assert span['bbox'][3]<=fy+.5,'Clue overlaps footer'
            spans.extend(current)
        assert any(abs(span['size']-case['font'])<.15 for span in spans),'Wrong clue/answer font size'
    except Exception as error:
        failures.append({'file':case['file'],'error':str(error)})
report={'expected':2000,'checked':len(export['results']),'passed':2000-len(failures),'failures':failures,'limits':'Chromium PDF rendering; not a physical-printer or reader study.'}
(directory/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='failures'}))
for failure in failures[:20]:print(failure)
assert not failures
