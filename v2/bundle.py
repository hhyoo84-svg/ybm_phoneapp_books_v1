"""app.html → 산출물-수정금지(참고자료)/phone-ybmclass.html 단일 파일 (CSS·JS·이미지 내장). 사용: python3 bundle.py  (Pillow 필요: pip install pillow)"""
import re, base64, io, os, sys
from PIL import Image
R=os.path.dirname(os.path.abspath(__file__))+'/'
src=open(R+'app.html',encoding='utf-8').read()
def rd(p): return open(R+p,encoding='utf-8').read()
src=re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', lambda m:'<style>/* '+m.group(1)+' */\n'+rd(m.group(1))+'\n</style>', src)
src=re.sub(r'<script src="(js/[^"]+)"></script>', lambda m:'<script>/* '+m.group(1)+' */\n'+rd(m.group(1)).replace('</script','<\\/script')+'\n</script>', src)
cache={}
def uri(name):
    if name in cache: return cache[name]
    p=R+'images/'+name
    if not os.path.exists(p): return None
    if name.startswith('wawong') and name.endswith('.png'):
        b=io.BytesIO(); Image.open(p).save(b,'WEBP',quality=88,method=6); d='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
    else:
        mt={'png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg','svg':'image/svg+xml','webp':'image/webp'}[name.rsplit('.',1)[1].lower()]
        d=f'data:{mt};base64,'+base64.b64encode(open(p,'rb').read()).decode()
    cache[name]=d; return d
miss=set()
def rep(m):
    u=uri(m.group(1))
    if u is None: miss.add(m.group(1)); return m.group(0)
    return u
src=re.sub(r'(?<![\w/])images/([A-Za-z0-9_.-]+\.(?:png|jpe?g|svg|webp))', rep, src)
out=sys.argv[1] if len(sys.argv)>1 else R+'산출물-수정금지(참고자료)/phone-ybmclass.html'
src=src.replace('<title>','<title>',1)
open(out,'w',encoding='utf-8').write(src)
print(out, round(len(src)/1e6,2),'MB', 'imgs',len(cache),'miss',miss)
