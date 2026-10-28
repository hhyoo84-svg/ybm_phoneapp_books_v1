"""src/ + assets/ → dist/ 배포용 단일 HTML (형태 2종 × 컬러 3종)
사용: python3 build.py
  dist/book-magazine-purple.html · -coral · -green
  dist/book-reader-purple.html   · -coral · -green
컬러 파일끼리는 <html data-palette> 속성만 다릅니다(purple은 속성 없음 = 기본값)."""
import base64, pathlib

here = pathlib.Path(__file__).parent
FORMS = ["magazine", "reader"]
PALETTES = ["purple", "coral", "green"]

def data_uri(name, mime):
    return f"data:{mime};base64," + base64.b64encode((here / "assets" / name).read_bytes()).decode()

font = data_uri("pretendard-kr-subset.woff2", "font/woff2")
photo = data_uri("lesson-photo.jpg", "image/jpeg")
(here / "dist").mkdir(exist_ok=True)

for form in FORMS:
    html = (here / "src" / f"book-{form}.html").read_text(encoding="utf-8")
    html = html.replace("@@FONT_PRETENDARD@@", font).replace("@@PHOTO_LESSON@@", photo)
    assert "@@" not in html, f"{form}: 치환되지 않은 자리표시자가 있습니다"
    assert html.count('<html lang="ko">') == 1
    for palette in PALETTES:
        attr = "" if palette == "purple" else f' data-palette="{palette}"'
        out = html.replace('<html lang="ko">', f'<html lang="ko"{attr}>')
        path = here / "dist" / f"book-{form}-{palette}.html"
        path.write_text(out, encoding="utf-8")
        print("built", path.relative_to(here), round(len(out) / 1024), "KB")
