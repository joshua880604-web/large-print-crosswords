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
expected_count=int(sys.argv[2]) if len(sys.argv)>2 else 2000
assert expected_count>0 and export['checked']==export['expected']==expected_count and not export['failures']
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
        # In the large layout the clue or answer list must all be on page two.
        # Restrict extraction to the requested font to catch an individual small
        # or clipped line even when the other clues still print at the right size.
        content_page=doc[-1]
        sections=[span['text'] for block in content_page.get_text('dict')['blocks'] if 'lines' in block
                  for line in block['lines'] for span in line['spans']
                  if abs(span['size']-case['font'])<.15]
        correctly_sized_content=normalize(' '.join(sections))
        for expected_text in case['expectedText']:
            assert normalize(expected_text) in correctly_sized_content, f'Missing or wrong-size text: {expected_text}'
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
            for drawing in page.get_drawings():
                bounds=drawing['rect']
                assert bounds.x0>=-.5 and bounds.y0>=-.5 and bounds.x1<=613 and bounds.y1<=793, 'Drawing outside paper'
    except Exception as error:
        failures.append({'file':case['file'],'error':str(error)})
report={'expected':expected_count,'checked':len(export['results']),'passed':expected_count-len(failures),'failures':failures,'limits':'Chromium PDF rendering; not a physical-printer or reader study.'}
(directory/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='failures'}))
for failure in failures[:20]:print(failure)
assert not failures
