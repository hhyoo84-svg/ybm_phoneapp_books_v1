#!/usr/bin/env python3
"""미리보기 빌드 : python3 build.py

1) app.html
   app.src.html 의 <!-- @include inc/xxx.html --> 와 <!-- @data data/demo.json --> 를
   실제 조각·데이터로 바꿔 만든다. 서버 없이 더블클릭으로 열린다.

2) 산출물-수정금지(참고자료)/phone-ybmclass.html
   완성된 app.html 의 CSS·JS·이미지를 파일 안에 모두 넣은 단일 파일.
   와옹이 이미지를 webp 로 줄이기 위해 Pillow 가 필요하다 (pip install pillow).
   Pillow 가 없으면 이 단계만 건너뛰고 app.html 은 그대로 만든다.

inc/ · app.src.html · data/demo.json 을 고친 뒤 실행한다. 만들어진 두 파일은 직접 고치지 않는다.
"""
import base64, io, json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
REF_DIR = ROOT / '산출물-수정금지(참고자료)'


# ---------------------------------------------------------------- 1) app.html
def build_app():
    src = (ROOT / 'app.src.html').read_text(encoding='utf-8')

    def include(m):
        indent, path = m.group(1), m.group(2)
        body = (ROOT / path).read_text(encoding='utf-8').rstrip('\n')
        return f'{indent}<!-- [{path}] start -->\n{body}\n{indent}<!-- [{path}] end -->'

    def data(m):
        obj = json.loads((ROOT / m.group(2)).read_text(encoding='utf-8'))
        return f'{m.group(1)}<script>window.YBMP_DEMO = {json.dumps(obj, ensure_ascii=False)};</script>'

    src = re.sub(r'^([ \t]*)<!--\s*@data\s+(\S+)\s*-->[ \t]*$', data, src, flags=re.M)
    out = re.sub(r'^([ \t]*)<!--\s*@include\s+(\S+)\s*-->[ \t]*$', include, src, flags=re.M)
    banner = '<!-- 자동 생성 파일 : 수정은 inc/ 와 app.src.html 에서 하고 build.py 로 다시 만든다 -->\n'
    out = out.replace('<html lang="ko">', banner + '<html lang="ko">', 1)
    (ROOT / 'app.html').write_text(out, encoding='utf-8')
    print('app.html', len(out.splitlines()), 'lines')
    return out


# ------------------------------------------------- 2) phone-ybmclass.html (단일 파일)
def build_single(app_html):
    try:
        from PIL import Image
    except ImportError:
        print('phone-ybmclass.html 건너뜀 : Pillow 없음 (pip install pillow)')
        return

    def read(p):
        return (ROOT / p).read_text(encoding='utf-8')

    # CSS · JS 를 파일 안으로
    src = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',
                 lambda m: f'<style>/* {m.group(1)} */\n{read(m.group(1))}\n</style>', app_html)
    src = re.sub(r'<script src="(js/[^"]+)"></script>',
                 lambda m: f'<script>/* {m.group(1)} */\n' + read(m.group(1)).replace('</script', '<\\/script') + '\n</script>', src)

    # images/ 경로를 data URI 로 (와옹이 png 는 webp 로 줄임)
    cache, missing = {}, set()
    mime = {'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'svg': 'image/svg+xml', 'webp': 'image/webp'}

    def to_uri(m):
        name = m.group(1)
        if name in cache:
            return cache[name]
        path = ROOT / 'images' / name
        if not path.exists():
            if name != 'wawong-N.png':  # 주석 속 예시 표기
                missing.add(name)
            return m.group(0)
        if name.startswith('wawong') and name.endswith('.png'):
            buf = io.BytesIO()
            Image.open(path).save(buf, 'WEBP', quality=88, method=6)
            uri = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
        else:
            uri = f'data:{mime[name.rsplit(".", 1)[1].lower()]};base64,' + base64.b64encode(path.read_bytes()).decode()
        cache[name] = uri
        return uri

    src = re.sub(r'(?<![\w/])images/([A-Za-z0-9_.-]+\.(?:png|jpe?g|svg|webp))', to_uri, src)

    REF_DIR.mkdir(exist_ok=True)
    out = REF_DIR / 'phone-ybmclass.html'
    out.write_text(src, encoding='utf-8')
    print(f'{out.relative_to(ROOT)} {len(src) / 1e6:.2f} MB, 이미지 {len(cache)}개'
          + (f', 없는 이미지 {sorted(missing)}' if missing else ''))


if __name__ == '__main__':
    build_single(build_app())
