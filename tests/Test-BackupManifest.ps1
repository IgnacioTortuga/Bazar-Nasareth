. (Join-Path $PSScriptRoot '../scripts/Backup-Common.ps1')
$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('bazar-backup-check-' + [guid]::NewGuid().ToString('N'))
[void](New-Item -ItemType Directory -Path $testRoot)
$databaseFile = Join-Path $testRoot 'database.bak'
Set-Content -LiteralPath $databaseFile -Value 'Archivo ficticio; no es un respaldo SQL.'
$files = @(@{ path = 'database.bak'; sha256 = (Get-FileHash -LiteralPath $databaseFile -Algorithm SHA256).Hash })
$manifestPath = Join-Path $testRoot 'manifest.json'
@{ version = 1; database = 'Test'; files = $files } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath
[void](Assert-BazarManifest $testRoot)
$rejected = $false
Set-Content -LiteralPath $databaseFile -Value 'Alterado'
try { [void](Assert-BazarManifest $testRoot) } catch { $rejected = $true }
if (!$rejected) { throw 'No se detectó el archivo alterado.' }
Set-Content -LiteralPath $databaseFile -Value 'Archivo ficticio; no es un respaldo SQL.'
$files += @{ path = '..\outside.bak'; sha256 = 'invalid' }
@{ version = 1; database = 'Test'; files = $files } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath
$rejected = $false
try { [void](Assert-BazarManifest $testRoot) } catch { $rejected = $_.Exception.Message -eq 'Ruta inválida en el manifiesto.' }
if (!$rejected) { throw 'No se detectó la ruta inválida.' }
Write-Output 'Tres comprobaciones correctas: integridad, alteración y manifiesto inválido. No se ejecutó SQL Server.'
Write-Output "Archivos ficticios conservados en: $testRoot"
