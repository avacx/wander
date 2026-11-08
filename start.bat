@echo off
rem 双击运行：在本机起一个小服务器并打开浏览器（关掉这个窗口即停止）
cd /d "%~dp0"
if exist .git (
  echo 检查更新...
  git pull --ff-only || echo 更新失败，先用本地版本
)
python serve.py
if errorlevel 9009 py serve.py
pause
