"""Rebuild the real Godot Web runtime. Requires Godot 4.5.1 and its templates."""
import argparse,json,re,subprocess
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument('--godot',required=True)
p.add_argument('--templates',required=True,help='Directory containing web_nothreads_debug.zip and web_nothreads_release.zip')
a=p.parse_args()
root=Path(__file__).resolve().parent
cfg=root/'export_presets.cfg'
original=cfg.read_text()
updated=re.sub(r'custom_template/debug="[^"]*"','custom_template/debug='+json.dumps(str(Path(a.templates).resolve()/'web_nothreads_debug.zip')),original)
updated=re.sub(r'custom_template/release="[^"]*"','custom_template/release='+json.dumps(str(Path(a.templates).resolve()/'web_nothreads_release.zip')),updated)
try:
 cfg.write_text(updated)
 subprocess.run([a.godot,'--headless','--log-file',str(root/'build.log'),'--path',str(root),'--export-debug','Web',str(root.parent/'public/runtime/engine.html')],check=True)
finally:
 cfg.write_text(original)
loader=root.parent/'public/runtime/index.html'
s=loader.read_text()
for name in ['engine.wasm','engine.pck']:
 s=re.sub("'"+re.escape(name)+"':\\d+",repr(name)+':'+str((loader.parent/name).stat().st_size),s)
loader.write_text(s)

import shutil
shutil.copyfile(root/"runtime.gd", loader.parent/"runtime-source.gd")
shutil.copyfile(root/"fixtures/token.tscn", loader.parent/"token.tscn")
