#script para inicialização automática do MCP Server com VS Code
#este script monitora a abertura do VS Code e inicia o servidor automaticamente

param(
    [string]$ServerPath = "$env:APPDATA\MCPGraphQLServer",
    [int]$Port = 3001,
    [int]$CheckInterval = 5
)

Write-Host "🔄 MCP GraphQL Server - Monitor de Auto-Inicialização" -ForegroundColor Cyan
Write-Host "Monitorando VS Code para inicialização automática..." -ForegroundColor Yellow

function Test-VSCodeRunning{
    return (Get-Process -Name "Code" -ErrorAction SilentlyContinue) -ne $null
}

function Test-MCPServerRunning{
    try{
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/mcp/health" -TimeoutSec 2 -ErrorAction Stop
        return $true
    }catch{
        return $false
    }
}

function Start-MCPServer{
    Write-Host "🚀 VS Code detectado! Iniciando MCP GraphQL Server..." -ForegroundColor Green
    
    if(-not (Test-Path $ServerPath)){
        Write-Host "❌ Servidor não encontrado em: $ServerPath" -ForegroundColor Red
        Write-Host "💡 Execute o script install-global.ps1 primeiro" -ForegroundColor Yellow
        return $false
    }
    
    Set-Location $ServerPath
    $process = Start-Process -FilePath "bun" -ArgumentList "--bun", "mcp-server.ts" -WindowStyle Hidden -PassThru
    
    #aguardar inicialização
    $attempts = 0
    $maxAttempts = 10
    
    do{
        Start-Sleep 1
        $attempts++
        $isRunning = Test-MCPServerRunning
        
        if ($isRunning) {
            Write-Host "✅ MCP GraphQL Server iniciado com sucesso!" -ForegroundColor Green
            Write-Host "🌐 Disponível em: http://localhost:$Port" -ForegroundColor Cyan
            return $true
        }
    }while($attempts -lt $maxAttempts)
    
    Write-Host "❌ Falha ao iniciar o servidor após $maxAttempts tentativas" -ForegroundColor Red
    return $false
}

function Stop-MCPServer{
    Write-Host "🛑 VS Code fechado. Parando MCP Server..." -ForegroundColor Yellow
    
    #encontrar e parar processo do Bun executando o servidor MCP
    $mcpProcesses = Get-Process -Name "bun" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*mcp-server.ts*"
    }
    
    if($mcpProcesses){
        $mcpProcesses | ForEach-Object {
            Stop-Process -Id $_.Id -Force
            Write-Host "✅ Processo MCP Server parado (PID: $($_.Id))" -ForegroundColor Green
        }
    }
}

#loop principal de monitoramento
$vsCodeWasRunning = $false
$mcpServerRunning = $false

while($true){
    $vsCodeIsRunning = Test-VSCodeRunning
    $mcpIsRunning = Test-MCPServerRunning
    
    #VS Code foi aberto
    if($vsCodeIsRunning -and -not $vsCodeWasRunning){
        if(-not $mcpIsRunning){
            Start-MCPServer
            $mcpServerRunning = $true
        }else{
            Write-Host "ℹ️ MCP Server já está rodando" -ForegroundColor Blue
        }
    }
    
    #VS Code foi fechado
    if(-not $vsCodeIsRunning -and $vsCodeWasRunning){
        if($mcpServerRunning){
            Stop-MCPServer
            $mcpServerRunning = $false
        }
    }
    
    $vsCodeWasRunning = $vsCodeIsRunning
    
    #aguardar próxima verificação
    Start-Sleep $CheckInterval
}