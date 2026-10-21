#!/usr/bin/env python3
"""app.src.html 의 <!-- @include inc/xxx.html --> 줄을 해당 조각으로 바꿔 app.html 을 만든다.
inc/ 를 수정한 뒤 `python3 build.py` 를 실행하면 미리보기(app.html)가 갱신된다.
만들어진 app.html 은 서버 없이 더블클릭으로도 열린다."""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
src = (ROOT / 'app.src.html').read_text(encoding='utf-8')

def repl(m):
    indent, path = m.group(1), m.group(2)
    body = (ROOT / path).read_text(encoding='utf-8').rstrip('\n')
    return f'{indent}<!-- [{path}] start -->\n{body}\n{indent}<!-- [{path}] end -->'

def data(m):
    import json
    obj = json.loads((ROOT / m.group(2)).read_text(encoding='utf-8'))
    return f'{m.group(1)}<script>window.YBMP_DEMO = {json.dumps(obj, ensure_ascii=False)};</script>'
src = re.sub(r'^([ \t]*)<!--\s*@data\s+(\S+)\s*-->[ \t]*$', data, src, flags=re.M)
out = re.sub(r'^([ \t]*)<!--\s*@include\s+(\S+)\s*-->[ \t]*$', repl, src, flags=re.M)
banner = '<!-- 자동 생성 파일 : 수정은 inc/ 와 app.src.html 에서 하고 build.py 로 다시 만든다 -->\n'
out = out.replace('<html lang="ko">', banner + '<html lang="ko">', 1)
(ROOT / 'app.html').write_text(out, encoding='utf-8')
print('app.html', len(out.splitlines()), 'lines')
