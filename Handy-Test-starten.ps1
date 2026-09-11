# ============================================================
#  G04Fit — Test auf iPhone oder Android
#
#  Startet den lokalen Server so, dass er im WLAN erreichbar ist,
#  und zeigt die Adresse an, die du am Handy eingeben musst.
#
#  Rechtsklick auf diese Datei > "Mit PowerShell ausführen"
#  oder im Terminal:  .\Handy-Test-starten.ps1
# ============================================================

$ErrorActionPreference = 'Stop'
$port = 5181
$projekt = Join-Path $PSScriptRoot 'src\G04Fit.Server\G04Fit.Server.csproj'

Write-Host ''
Write-Host '  G04Fit — Handy-Test' -ForegroundColor Green
Write-Host '  ================================================'
Write-Host ''

# --- 1. Projekt vorhanden? ---
if (-not (Test-Path $projekt)) {
    Write-Host '  Projekt nicht gefunden:' -ForegroundColor Red
    Write-Host "  $projekt"
    Read-Host '  Enter zum Beenden'
    exit 1
}

# --- 2. Lokale IP-Adresse im WLAN ermitteln ---
$adressen = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -notlike '127.*' -and
        $_.IPAddress -notlike '169.254.*' -and
        $_.PrefixOrigin -ne 'WellKnown'
    } |
    Sort-Object -Property @{ Expression = { $_.InterfaceAlias -match 'WLAN|Wi-Fi|Wireless' } } -Descending

if (-not $adressen) {
    Write-Host '  Keine Netzwerkadresse gefunden. Ist der Rechner im WLAN?' -ForegroundColor Red
    Read-Host '  Enter zum Beenden'
    exit 1
}

$ip = $adressen[0].IPAddress
$adapter = $adressen[0].InterfaceAlias

# --- 3. Firewall prüfen ---
$regelName = "G04Fit Handy-Test (Port $port)"
$regel = Get-NetFirewallRule -DisplayName $regelName -ErrorAction SilentlyContinue

if (-not $regel) {
    $istAdmin = ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()
    ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if ($istAdmin) {
        try {
            New-NetFirewallRule -DisplayName $regelName `
                -Direction Inbound -Action Allow -Protocol TCP `
                -LocalPort $port -Profile Private | Out-Null
            Write-Host '  Firewall-Regel angelegt (nur private Netzwerke).' -ForegroundColor Green
        } catch {
            Write-Host '  Firewall-Regel konnte nicht angelegt werden.' -ForegroundColor Yellow
        }
    } else {
        Write-Host '  Hinweis: Keine Firewall-Freigabe für Port ' -NoNewline -ForegroundColor Yellow
        Write-Host $port -NoNewline -ForegroundColor Yellow
        Write-Host ' vorhanden.' -ForegroundColor Yellow
        Write-Host '  Falls das Handy die Seite nicht erreicht, dieses Skript einmal'
        Write-Host '  als Administrator ausführen — dann wird die Regel automatisch gesetzt.'
        Write-Host ''
    }
}

# --- 4. Adresse anzeigen ---
$url = "http://${ip}:$port"

Write-Host '  Am Handy im Browser aufrufen:' -ForegroundColor Gray
Write-Host ''
Write-Host "      $url" -ForegroundColor Green
Write-Host ''
Write-Host "  (Netzwerkkarte: $adapter)" -ForegroundColor DarkGray
Write-Host ''
Write-Host '  iPhone : Safari öffnen > Adresse eingeben > Teilen-Symbol'
Write-Host '           > "Zum Home-Bildschirm"'
Write-Host '  Android: Chrome öffnen > Adresse eingeben > Menü drei Punkte'
Write-Host '           > "App installieren"'
Write-Host ''
Write-Host '  Wichtig: Handy und Rechner müssen im selben WLAN sein.'
Write-Host '  Zum Beenden dieses Fenster schließen oder Strg+C drücken.'
Write-Host ''
Write-Host '  ================================================'
Write-Host ''

# --- 5. Server starten ---
dotnet run --project $projekt --urls "http://0.0.0.0:$port"
