#MCP GraphQL Query Generator - Instalação Global
#este script instala o servidor MCP globalmente para uso com VS Code

param(
    [string]$InstallPath = "$env:APPDATA\MCPGraphQLServer",
    [int]$Port = 3001,
    [switch]$AutoStart = $true
)

Write-Host "🚀 MCP GraphQL Query Generator - Instalação Global" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

#verificar se Bun está instalado
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
try{
    $bunVersion = bun --version
    Write-Host "✅ Bun encontrado: v$bunVersion" -ForegroundColor Green
}catch{
    Write-Host "❌ Bun não encontrado!" -ForegroundColor Red
    Write-Host "💡 Instale o Bun: https://bun.sh/docs/installation" -ForegroundColor Yellow
    Write-Host "   PowerShell: powershell -c `"irm bun.sh/install.ps1 | iex`"" -ForegroundColor Cyan
    exit 1
}

#criar diretório de instalação
Write-Host "📁 Criando diretório de instalação..." -ForegroundColor Yellow
if(Test-Path $InstallPath){
    Write-Host "🗑️ Removendo instalação anterior..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $InstallPath
}
New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null

#copiar arquivos do projeto
Write-Host "📂 Copiando arquivos do projeto..." -ForegroundColor Yellow
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item -Recurse -Path "$currentPath/*" -Destination $InstallPath -Exclude ".git", "node_modules", "install-global.ps1"

#instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
Set-Location $InstallPath
bun install

#criar arquivo de configuração global
Write-Host "⚙️ Criando configuração global..." -ForegroundColor Yellow
$configContent = @"
# MCP GraphQL Server - Configuração Global
# Editado automaticamente pelo script de instalação

# Porta do servidor MCP
MCP_PORT=$Port

# URL da API GraphQL (configure conforme necessário)
# GRAPHQL_API_URL=https://sua-api.com/graphql

# Autenticação (opcional)
# API_TOKEN=seu_token_aqui
# API_KEY=sua_api_key_aqui

# Configurações avançadas
MAX_DEPTH=3
ENABLE_CORS=true
LOG_LEVEL=info
"@

$configContent | Out-File -FilePath "$InstallPath\.env" -Encoding UTF8

#criar script de inicialização global
Write-Host "🔧 Criando script de inicialização..." -ForegroundColor Yellow
$startScript = @"
@echo off
title MCP GraphQL Server (Global)
echo 🌐 MCP GraphQL Server - Modo Global
echo =======================================
echo 📍 Localização: $InstallPath
echo 🌐 Porta: $Port
echo 📡 URL: http://localhost:$Port
echo.
echo 💡 Para parar: Feche esta janela ou Ctrl+C
echo =======================================
echo.
cd /d "$InstallPath"
bun --bun mcp-server.ts
"@

$startScript | Out-File -FilePath "$InstallPath\start-global.bat" -Encoding ASCII

#criar script PowerShell para inicialização silenciosa
$startPsScript = @"
# MCP GraphQL Server - Inicialização Silenciosa
`$processName = "MCP-GraphQL-Server"
`$serverPath = "$InstallPath"

# Verificar se já está rodando
`$existing = Get-Process -Name "bun" -ErrorAction SilentlyContinue | Where-Object { `$_.MainWindowTitle -like "*MCP*" }
if (`$existing) {
    Write-Host "✅ MCP GraphQL Server já está rodando (PID: `$(`$existing.Id))" -ForegroundColor Green
    exit 0
}

# Iniciar servidor em background
Write-Host "🚀 Iniciando MCP GraphQL Server..." -ForegroundColor Cyan
Set-Location `$serverPath
Start-Process -FilePath "bun" -ArgumentList "--bun", "mcp-server.ts" -WindowStyle Hidden -PassThru
Start-Sleep 2

# Verificar se iniciou com sucesso
try {
    `$response = Invoke-WebRequest -Uri "http://localhost:$Port/mcp/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ MCP GraphQL Server iniciado com sucesso!" -ForegroundColor Green
    Write-Host "🌐 Disponível em: http://localhost:$Port" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro ao iniciar servidor. Verifique os logs." -ForegroundColor Red
}
"@

$startPsScript | Out-File -FilePath "$InstallPath\start-silent.ps1" -Encoding UTF8

#criar atalho na área de trabalho (opcional)
Write-Host "🔗 Criando atalho na área de trabalho..." -ForegroundColor Yellow
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\MCP GraphQL Server.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$InstallPath\start-global.bat"
$shortcut.WorkingDirectory = $InstallPath
$shortcut.Description = "MCP GraphQL Query Generator Server"
$shortcut.Save()

#configurar inicialização automática (se solicitado)
if($AutoStart){
    Write-Host "⚡ Configurando inicialização automática..." -ForegroundColor Yellow
    
    #adicionar ao registro do Windows para iniciar com o sistema
    $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
    $regName = "MCPGraphQLServer"
    $regValue = "PowerShell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$InstallPath\start-silent.ps1`""
    
    Set-ItemProperty -Path $regPath -Name $regName -Value $regValue -Force
    Write-Host "✅ Servidor configurado para iniciar automaticamente" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "📍 Localização: $InstallPath" -ForegroundColor Cyan
Write-Host "🌐 URL do Servidor: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "🔧 Configuração: $InstallPath\.env" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Configure sua API GraphQL no arquivo .env (se necessário)" -ForegroundColor White
Write-Host "2. Inicie o servidor manualmente: $InstallPath\start-global.bat" -ForegroundColor White
Write-Host "3. Ou use inicialização silenciosa: $InstallPath\start-silent.ps1" -ForegroundColor White
if($AutoStart){
    Write-Host "4. O servidor iniciará automaticamente no próximo boot" -ForegroundColor White
}
Write-Host ""
Write-Host "🔧 CONFIGURAÇÃO VS CODE:" -ForegroundColor Yellow
Write-Host "Adicione ao seu settings.json:" -ForegroundColor White
Write-Host @"
{
  "mcp.servers": {
    "graphql-query-generator": {
      "url": "http://localhost:$Port",
      "name": "GraphQL Query Generator"
    }
  }
}
"@ -ForegroundColor Gray