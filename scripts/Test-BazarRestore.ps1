[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Server,
    [Parameter(Mandatory)][string]$Bundle,
    [Parameter(Mandatory)][ValidatePattern('^BazarRestore_[A-Za-z0-9_]+$')][string]$TestDatabase,
    [Parameter(Mandatory)][string]$DestinationRoot,
    [switch]$TrustServerCertificate
)
. (Join-Path $PSScriptRoot 'Backup-Common.ps1')
$bundlePath = (Resolve-Path -LiteralPath $Bundle).Path
$manifest = Assert-BazarManifest $bundlePath
if ($TestDatabase -ieq $manifest.database) { throw 'La base de prueba debe ser diferente a la original.' }
$destination = [IO.Path]::GetFullPath($DestinationRoot)
if (Test-Path -LiteralPath $destination) { throw 'El destino de restauración debe ser una carpeta nueva.' }
$connection = Open-BazarSql $Server $TrustServerCertificate.IsPresent
try {
    Assert-LocalSql $connection
    $testLiteral = Sql-Literal $TestDatabase
    $existing = Invoke-BazarSql $connection "SELECT name FROM sys.databases WHERE name = $testLiteral" -Table
    if ($existing.Rows.Count -gt 0) { throw 'La base de prueba ya existe; no se sobrescribirá.' }
    $backupLiteral = Sql-Literal (Join-Path $bundlePath 'database.bak')
    $files = Invoke-BazarSql $connection "RESTORE FILELISTONLY FROM DISK = $backupLiteral" -Table
    if (@($files.Rows | Where-Object { $_.Type -notin @('D', 'L') }).Count) { throw 'Se requiere un procedimiento específico para archivos FILESTREAM u otros tipos.' }
    [void](New-Item -ItemType Directory -Path $destination)
    $moves = @($files.Rows | ForEach-Object {
        $extension = if ($_.Type -eq 'L') { '.ldf' } else { '.mdf' }
        $newPath = Join-Path $destination ($TestDatabase + '_' + $_.FileId + $extension)
        'MOVE ' + (Sql-Literal $_.LogicalName) + ' TO ' + (Sql-Literal $newPath)
    })
    $testName = Sql-Identifier $TestDatabase
    Invoke-BazarSql $connection ("RESTORE DATABASE $testName FROM DISK = $backupLiteral WITH CHECKSUM, RECOVERY, " + ($moves -join ', '))
    # TABLERESULTS permite fallar si CHECKDB devuelve filas de error, aunque no lance excepción.
    $check = Invoke-BazarSql $connection "DBCC CHECKDB ($testName) WITH NO_INFOMSGS, TABLERESULTS;" -Table
    if ($check.Rows.Count -gt 0) { throw 'CHECKDB encontró problemas en la base restaurada.' }
    Copy-Item -LiteralPath (Join-Path $bundlePath 'images') -Destination (Join-Path $destination 'images') -Recurse
    foreach ($file in $manifest.files | Where-Object { $_.path -like 'images*' }) {
        $path = Join-Path $destination $file.path
        if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ne $file.sha256) { throw 'La copia de imágenes restaurada no coincide.' }
    }
    $references = Invoke-BazarSql $connection "SELECT Ruta FROM $testName.dbo.Imagen" -Table
    foreach ($row in $references.Rows) {
        if (!(Test-Path -LiteralPath (Join-Path $destination ('images\' + [IO.Path]::GetFileName($row.Ruta))) -PathType Leaf)) { throw 'La base restaurada referencia una imagen que falta en el respaldo.' }
    }
    @{ database = $TestDatabase; checkedUtc = [DateTime]::UtcNow.ToString('o'); checkdb = 'ok'; imageReferences = $references.Rows.Count } |
        ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination 'restore-result.json') -Encoding utf8
    Write-Output "Restauración comprobada en $TestDatabase. Se conserva para revisión; no se modificó la base original."
} finally { $connection.Dispose() }
