"""Serve runtime assets with CORS for the opaque-origin sandbox iframe."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Cross-Origin-Resource-Policy','cross-origin')
        super().end_headers()
if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--port',type=int,default=4176)
    args=parser.parse_args()
    root=Path(__file__).resolve().parent.parent/'public'/'runtime'
    ThreadingHTTPServer(('127.0.0.1',args.port),lambda *a,**kw:Handler(*a,directory=str(root),**kw)).serve_forever()
