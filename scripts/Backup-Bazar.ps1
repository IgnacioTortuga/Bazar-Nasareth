[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Server,
    [Parameter(Mandatory)][ValidatePattern('^[A-Za-z0-9_-]+$')][string]$Database,
    [Parameter(Mandatory)][string]$ImageDirectory,
    [Parameter(Mandatory)][string]$DestinationRoot,
    [switch]$TrustServerCertificate,
    [Parameter(Mandatory)][switch]$ApiStopped
)
. (Join-Path $PSScriptRoot 'Backup-Common.ps1')
if (!$ApiStopped) { throw 'Detenga todas las instancias de la API antes del respaldo y confirme con -ApiStopped.' }
if (Get-Process -Name BazarNazareth -ErrorAction SilentlyContinue) { throw 'La API sigue ejecutándose. Deténgala antes del respaldo.' }
$images = (Resolve-Path -LiteralPath $ImageDirectory).Path
if (!(Test-Path -LiteralPath $images -PathType Container)) { throw 'La carpeta de imágenes no existe.' }
$destination = [IO.Path]::GetFullPath($DestinationRoot)
if ($destination.StartsWith($images.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) -or $destination -eq $images) { throw 'El respaldo debe estar fuera de la carpeta de imágenes.' }
$bundle = Join-Path $destination ($Database + '-' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ'))
$connection = Open-BazarSql $Server $TrustServerCertificate.IsPresent
try {
    Assert-LocalSql $connection
    [void](New-Item -ItemType Directory -Path $bundle -ErrorAction Stop)
    $backupPath = Join-Path $bundle 'database.bak'
    $databaseName = Sql-Identifier $Database
    $backupLiteral = Sql-Literal $backupPath
    Invoke-BazarSql $connection "BACKUP DATABASE $databaseName TO DISK = $backupLiteral WITH COPY_ONLY, CHECKSUM; RESTORE VERIFYONLY FROM DISK = $backupLiteral WITH CHECKSUM;"
    $targetImages = Join-Path $bundle 'images'
    [void](New-Item -ItemType Directory -Path $targetImages)
    Get-ChildItem -LiteralPath $images -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $targetImages -Recurse
    }
    $files = @(Get-ChildItem -LiteralPath $bundle -File -Recurse | ForEach-Object {
        @{ path = [IO.Path]::GetRelativePath($bundle, $_.FullName); sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }
    })
    @{ version = 1; database = $Database; createdUtc = [DateTime]::UtcNow.ToString('o'); files = $files } |
        ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $bundle 'manifest.json') -Encoding utf8
    [void](Assert-BazarManifest $bundle)
    Write-Output "Respaldo creado y verificado: $bundle. Falta restaurarlo en una base de prueba."
} finally { $connection.Dispose() }
