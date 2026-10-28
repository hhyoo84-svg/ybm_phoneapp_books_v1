#!/usr/bin/env python3
"""미리보기 빌드 : python3 build.py

1) magazine.html
   magazine.src.html 의 <!-- @include inc/xxx.html --> 와 <!-- @data data/xxx.json --> 를
   실제 조각 · 데이터로 바꿔 만든다. css/ js/ images/ 를 그대로 참조하며 서버 없이 더블클릭으로 열린다.

2) 산출물-수정금지(참고자료)/book-magazine-{purple|coral|green}.html
   magazine.html 의 CSS · JS · 이미지를 파일 안에 모두 넣은 단일 파일(컬러 3종, <html data-palette>만 다름).

inc/ · css/ · js/ · data/ · magazine.src.html 을 고친 뒤 실행한다. 만들어진 파일은 직접 고치지 않는다.
"""
import base64, json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
REF_DIR = ROOT / '산출물-수정금지(참고자료)'
PALETTES = ['purple', 'coral', 'green']          # purple = 기본(속성 없음)
MIME = {'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'svg': 'image/svg+xml', 'webp': 'image/webp'}


def read(p):
    return (ROOT / p).read_text(encoding='utf-8')


# ---------------------------------------------------------------- 1) magazine.html
def build_app():
    src = read('magazine.src.html')

    def include(m):
        indent, path = m.group(1), m.group(2)
        body = read(path).rstrip('\n')
        return f'{indent}<!-- [{path}] start -->\n{body}\n{indent}<!-- [{path}] end -->'

    def data(m):
        obj = json.loads(read(m.group(2)))
        return f'{m.group(1)}<script>window.BOOK_DATA = {json.dumps(obj, ensure_ascii=False)};</script>'

    src = re.sub(r'^([ \t]*)<!--\s*@data\s+(\S+)\s*-->[ \t]*$', data, src, flags=re.M)
    out = re.sub(r'^([ \t]*)<!--\s*@include\s+(\S+)\s*-->[ \t]*$', include, src, flags=re.M)
    banner = '<!-- 자동 생성 파일 : 수정은 inc/ · css/ · js/ · data/ · magazine.src.html 에서 하고 build.py 로 다시 만든다 -->\n'
    out = out.replace('<html lang="ko">', banner + '<html lang="ko">', 1)
    (ROOT / 'magazine.html').write_text(out, encoding='utf-8')
    print('magazine.html', len(out.splitlines()), 'lines')
    return out


# ------------------------------------------- 2) 산출물 단일 파일 (CSS · JS · 이미지 내장)
def build_single(app_html):
    src = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',
                 lambda m: f'<style>/* {m.group(1)} */\n{read(m.group(1))}\n</style>', app_html)
    src = re.sub(r'<script src="(js/[^"]+)"></script>',
                 lambda m: f'<script>/* {m.group(1)} */\n' + read(m.group(1)).replace('</script', '<\\/script') + '\n</script>', src)

    # images/ 의 레슨 사진을 data URI 로 → JS 가 만드는 경로(images/lesson-photoN.jpg)를 같은 이름으로 찾게 등록
    photos = sorted((ROOT / 'images').glob('lesson-photo*.jpg'), key=lambda p: int(re.sub(r'\D', '', p.stem) or 0))
    table = {f'images/{p.name}': f'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode() for p in photos}
    inline = ('<script>/* 단일 파일 전용 : images/ 경로 → 내장 이미지 */\n'
              f'window.BOOK_IMAGES = {json.dumps(table)};\n</script>\n')
    src = src.replace('<script>/* js/core.js */', inline + '<script>/* js/core.js */', 1)

    REF_DIR.mkdir(exist_ok=True)
    for palette in PALETTES:
        attr = '' if palette == 'purple' else f' data-palette="{palette}"'
        out = src.replace('<html lang="ko">', f'<html lang="ko"{attr}>', 1)
        path = REF_DIR / f'book-magazine-{palette}.html'
        path.write_text(out, encoding='utf-8')
        print(f'{path.relative_to(ROOT)} {len(out) / 1e6:.2f} MB, 사진 {len(table)}장')


if __name__ == '__main__':
    build_single(build_app())
