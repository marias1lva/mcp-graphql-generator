@echo off
title MCP GraphQL Server
echo 🚀 Iniciando MCP GraphQL Server...
echo.
cd /d "%~dp0"
echo 📁 Pasta: %CD%
echo ⚡ Executando: bun mcp-server.ts
echo 🌐 Server será acessível em: http://localhost:3001
echo.
echo 💡 Para parar o server, feche esta janela ou pressione Ctrl+C
echo ═══════════════════════════════════════════════════════════
echo.
bun --bun mcp-server.ts
pause