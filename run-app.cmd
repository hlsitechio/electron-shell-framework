@echo off
cd /d "G:\amazon_site\1"
npx electron . --remote-debugging-port=9334 --remote-allow-origins=*
