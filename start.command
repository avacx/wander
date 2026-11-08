#!/bin/bash
# 双击运行：在本机起一个小服务器并打开浏览器（关掉这个终端窗口即停止）
# 整段包在 { } 里：bash 先读完再执行，git pull 更新本文件也不会出错
{
cd "$(dirname "$0")"
# 如果是用 git clone 下来的，先自动拉一下最新版（没网或出错就跳过，用本地版本）
if [ -d .git ] && command -v git >/dev/null; then
  echo "检查更新…"; git pull --ff-only || echo "更新失败，先用本地版本"
fi
# 之前打开的 Wander 服务还占着 8765 端口（比如旧版本的窗口没关），先把它关掉
for PID in $(lsof -ti tcp:8765 -sTCP:LISTEN 2>/dev/null); do
  if ps -o command= -p "$PID" | grep -Eq "http.server|serve.py"; then
    echo "关闭之前的 Wander 服务（进程 $PID）"; kill "$PID" 2>/dev/null; sleep 1
  fi
done
exec python3 serve.py
exit
}
