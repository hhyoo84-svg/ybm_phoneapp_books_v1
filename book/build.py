#!/usr/bin/env python3
"""python3 build.py

1) magazine.html — magazine.src.html 의 @include · @data 를 채운 조립본 (css/ js/ images/ 참조)
2) 산출물-수정금지(참고자료)/book-magazine-{en|zh|ja}.html — CSS · JS · 이미지를 넣은 단일 파일 (언어별 컬러)
   data 레슨이 쓰는 레슨 사진 1장(가로 1600px)과 본문 그림(가로 1200px)만 Pillow 로 줄여 넣는다 (pip install pillow)
"""
import base64, io, json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
REF_DIR = ROOT / '산출물-수정금지(참고자료)'
LANGS = ['en', 'zh', 'ja']                       # 영어 purple · 중국어 coral · 일본어 green


def read(p):
    return (ROOT / p).read_text(encoding='utf-8')


def build_app():
    src = read('magazine.src.html')

    def include(m):
        indent, path = m.group(1), m.group(2)
        return f'{indent}<!-- [{path}] start -->\n{read(path).rstrip()}\n{indent}<!-- [{path}] end -->'

    def data(m):
        obj = json.loads(read(m.group(2)))
        return f'{m.group(1)}<script>window.BOOK_DATA = {json.dumps(obj, ensure_ascii=False)};</script>'

    src = re.sub(r'^([ \t]*)<!--\s*@data\s+(\S+)\s*-->[ \t]*$', data, src, flags=re.M)
    out = re.sub(r'^([ \t]*)<!--\s*@include\s+(\S+)\s*-->[ \t]*$', include, src, flags=re.M)
    out = out.replace('<html lang="ko">', '<!-- 자동 생성 : build.py -->\n<html lang="ko">', 1)
    (ROOT / 'magazine.html').write_text(out, encoding='utf-8')
    print('magazine.html')
    return out


def used_images():
    """data 레슨이 쓰는 이미지 { 경로: 최대 가로 } — js/core.js 규칙과 같게"""
    d = json.loads(read('data/lesson-01.json'))
    path = lambda name, folder: name if '/' in name else f'images/{folder}/{name}'
    fixed = d['lesson'].get('photo') or d['course'].get('photo')
    if fixed:
        lesson = path(fixed, 'lesson')
    else:
        count = int(re.search(r'count:\s*(\d+)', read('js/core.js')).group(1))
        lesson = f'images/lesson/lesson-photo{(d["lesson"]["number"] - 1) % count + 1}.jpg'
    used = {lesson: 1600}
    for p in d['parts']:
        if (p.get('picture') or {}).get('src'):
            used[path(p['picture']['src'], 'content')] = 1200
    return used


def image_uri(path, max_width):
    raw = (ROOT / path).read_bytes()
    try:
        from PIL import Image
        im = Image.open(io.BytesIO(raw)).convert('RGB')
        if im.width > max_width:
            im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=82, optimize=True, progressive=True)
        raw = buf.getvalue()
    except ImportError:
        print('Pillow 없음 : 이미지를 원본 크기로 넣음')
    return 'data:image/jpeg;base64,' + base64.b64encode(raw).decode()


def build_single(app_html):
    src = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',
                 lambda m: f'<style>/* {m.group(1)} */\n{read(m.group(1))}\n</style>', app_html)
    src = re.sub(r'<script src="(js/[^"]+)"></script>',
                 lambda m: f'<script>/* {m.group(1)} */\n' + read(m.group(1)).replace('</script', '<\\/script') + '\n</script>', src)

    used = used_images()
    table = {p: image_uri(p, w) for p, w in used.items() if (ROOT / p).exists()}
    missing = [p for p in used if p not in table]
    src = src.replace('<script>/* js/core.js */', f'<script>window.BOOK_IMAGES = {json.dumps(table)};</script>\n<script>/* js/core.js */', 1)

    REF_DIR.mkdir(exist_ok=True)
    for lang in LANGS:
        out = src.replace('"lang": "en"', f'"lang": "{lang}"', 1)       # data course.lang
        path = REF_DIR / f'book-magazine-{lang}.html'
        path.write_text(out, encoding='utf-8')
        print(f'{path.relative_to(ROOT)} {len(out) / 1e6:.2f} MB, 이미지 {len(table)}개' + (f', 없음 {missing}' if missing else ''))


if __name__ == '__main__':
    build_single(build_app())
