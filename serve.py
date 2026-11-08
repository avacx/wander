# Wander 本地服务：默认用 8765 端口（Google key 和 3D 缓存都跟着这个地址存在浏览器里）
# 端口被占用时依次试 8766、8767…，并自动打开浏览器
import http.server, socketserver, webbrowser, threading, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        # 页面和脚本每次都重新取，换了新版本不会被浏览器缓存的旧版挡住
        if self.path.split('?')[0].endswith(('.html', '.js', '/')): self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
for port in range(8765, 8780):
    try: srv = S(('127.0.0.1', port), H); break
    except OSError: continue
else:
    sys.exit('8765–8779 端口都被占用了，关掉一些程序再试')
url = f'http://localhost:{port}/earth-explorer.html'
if port != 8765: print('8765 端口被其它程序占用，改用', port, '（需要在设置里重新填一次 Google key）')
print('Wander 已启动：', url, '\n关掉这个窗口即停止')
threading.Timer(1, lambda: webbrowser.open(url)).start()
try: srv.serve_forever()
except KeyboardInterrupt: pass
