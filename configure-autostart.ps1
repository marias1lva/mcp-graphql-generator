#MCP GraphQL Server - Configurador de Auto-Inicialização
#este script configura o servidor para iniciar automaticamente com o VS Code

param(
    [ValidateSet("install", "uninstall", "status")]
    [string]$Action = "install",
    [string]$ServerPath = "$env:APPDATA\MCPGraphQLServer"
)

$ServiceName = "MCPGraphQLAutoStart"
$TaskName = "MCP GraphQL Server Auto Start"

function Install-AutoStart{
    Write-Host "⚙️ Configurando auto-inicialização do MCP Server..." -ForegroundColor Cyan
    
    #método 1: Task Scheduler (Recomendado)
    Write-Host "📅 Configurando Task Scheduler..." -ForegroundColor Yellow
    
    $taskAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ServerPath\auto-start-monitor.ps1`""
    $taskTrigger = New-ScheduledTaskTrigger -AtLogOn
    $taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    $taskPrincipal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive
    
    try{
        Register-ScheduledTask -TaskName $TaskName -Action $taskAction -Trigger $taskTrigger -Settings $taskSettings -Principal $taskPrincipal -Force
        Write-Host "✅ Task Scheduler configurado com sucesso!" -ForegroundColor Green
    }catch{
        Write-Host "❌ Erro ao configurar Task Scheduler: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    #método 2: Registro do Windows (Backup)
    Write-Host "📝 Configurando registro do Windows..." -ForegroundColor Yellow
    
    try{
        $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
        $regValue = "PowerShell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ServerPath\auto-start-monitor.ps1`""
        Set-ItemProperty -Path $regPath -Name $ServiceName -Value $regValue -Force
        Write-Host "✅ Registro do Windows configurado!" -ForegroundColor Green
    }catch{
        Write-Host "❌ Erro ao configurar registro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    #criar script de desinstalação
    $uninstallScript = @"
# MCP GraphQL Server - Desinstalador
Write-Host "🗑️ Removendo auto-inicialização do MCP Server..." -ForegroundColor Yellow

# Remover Task Scheduler
try {
    Unregister-ScheduledTask -TaskName "$TaskName" -Confirm:`$false -ErrorAction Stop
    Write-Host "✅ Task Scheduler removido!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Task Scheduler não encontrado ou já removido" -ForegroundColor Yellow
}

# Remover do registro
try {
    Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "$ServiceName" -ErrorAction Stop
    Write-Host "✅ Entrada do registro removida!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Entrada do registro não encontrada" -ForegroundColor Yellow
}

Write-Host "🎉 Auto-inicialização removida com sucesso!" -ForegroundColor Green
"@
    
    $uninstallScript | Out-File -FilePath "$ServerPath\uninstall-autostart.ps1" -Encoding UTF8
    
    Write-Host ""
    Write-Host "🎉 AUTO-INICIALIZAÇÃO CONFIGURADA!" -ForegroundColor Green
    Write-Host "=" * 50 -ForegroundColor Gray
    Write-Host "✅ O MCP Server agora iniciará automaticamente quando:" -ForegroundColor Cyan
    Write-Host "   • Você fizer login no Windows" -ForegroundColor White
    Write-Host "   • Abrir o VS Code" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Para desinstalar: $ServerPath\uninstall-autostart.ps1" -ForegroundColor Yellow
}

function Uninstall-AutoStart{
    Write-Host "🗑️ Removendo auto-inicialização..." -ForegroundColor Yellow
    
    #remover Task Scheduler
    try{
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-Host "✅ Task Scheduler removido!" -ForegroundColor Green
    }catch{
        Write-Host "⚠️ Task Scheduler não encontrado" -ForegroundColor Yellow
    }
    
    #remover do registro
    try{
        Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name $ServiceName -ErrorAction Stop
        Write-Host "✅ Entrada do registro removida!" -ForegroundColor Green
    }catch{
        Write-Host "⚠️ Entrada do registro não encontrada" -ForegroundColor Yellow
    }
    
    #parar processo se estiver rodando
    $monitorProcess = Get-Process -Name "powershell" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*auto-start-monitor.ps1*"
    }
    
    if($monitorProcess){
        $monitorProcess | Stop-Process -Force
        Write-Host "✅ Monitor parado!" -ForegroundColor Green
    }
    
    Write-Host "🎉 Auto-inicialização removida com sucesso!" -ForegroundColor Green
}

function Get-AutoStartStatus{
    Write-Host "📊 STATUS DA AUTO-INICIALIZAÇÃO" -ForegroundColor Cyan
    Write-Host "=" * 40 -ForegroundColor Gray
    
    #verificar Task Scheduler
    try{
        $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
        Write-Host "✅ Task Scheduler: ATIVO" -ForegroundColor Green
        Write-Host "   Estado: $($task.State)" -ForegroundColor White
    }catch{
        Write-Host "❌ Task Scheduler: INATIVO" -ForegroundColor Red
    }
    
    #verificar registro
    try{
        $regValue = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name $ServiceName -ErrorAction Stop
        Write-Host "✅ Registro Windows: ATIVO" -ForegroundColor Green
    }catch{
        Write-Host "❌ Registro Windows: INATIVO" -ForegroundColor Red
    }
    
    #verificar se o monitor está rodando
    $monitorProcess = Get-Process -Name "powershell" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*auto-start-monitor.ps1*"
    }
    
    if($monitorProcess){
        Write-Host "✅ Monitor: RODANDO (PID: $($monitorProcess.Id))" -ForegroundColor Green
    }else{
        Write-Host "❌ Monitor: PARADO" -ForegroundColor Red
    }
    
    #verificar servidor MCP
    try{
        $response = Invoke-WebRequest -Uri "http://localhost:3001/mcp/health" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ MCP Server: RODANDO" -ForegroundColor Green
    }catch{
        Write-Host "❌ MCP Server: PARADO" -ForegroundColor Red
    }
}

#executar ação solicitada
switch ($Action){
    "install" { Install-AutoStart }
    "uninstall" { Uninstall-AutoStart }
    "status" { Get-AutoStartStatus }
}