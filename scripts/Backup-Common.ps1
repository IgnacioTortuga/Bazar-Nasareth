Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Open-BazarSql([string]$Server, [bool]$TrustServerCertificate = $false) {
    $builder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new()
    $builder['Data Source'] = $Server
    $builder['Initial Catalog'] = 'master'
    $builder['Integrated Security'] = $true
    $builder['Encrypt'] = $true
    $builder['TrustServerCertificate'] = $TrustServerCertificate
    $connection = [System.Data.SqlClient.SqlConnection]::new($builder.ConnectionString)
    try { $connection.Open() }
    catch { $connection.Dispose(); throw }
    return $connection
}

function Invoke-BazarSql($Connection, [string]$Sql, [switch]$Table) {
    $command = $Connection.CreateCommand()
    $command.CommandText = $Sql
    $command.CommandTimeout = 0
    try {
        if ($Table) {
            $adapter = [System.Data.SqlClient.SqlDataAdapter]::new($command)
            $data = [System.Data.DataTable]::new()
            try { [void]$adapter.Fill($data); return ,$data }
            finally { $adapter.Dispose() }
        }
        [void]$command.ExecuteNonQuery()
    } finally { $command.Dispose() }
}

function Sql-Literal([string]$Value) { return "N'" + $Value.Replace("'", "''") + "'" }
function Sql-Identifier([string]$Value) { return '[' + $Value.Replace(']', ']]') + ']' }

function Assert-LocalSql($Connection) {
    $machine = Invoke-BazarSql $Connection "SELECT CAST(SERVERPROPERTY('MachineName') AS nvarchar(128)) AS Machine" -Table
    if ($machine.Rows[0].Machine -ine $env:COMPUTERNAME) {
        throw 'Este procedimiento requiere SQL Server y los archivos en el mismo equipo. Prepare rutas compartidas antes de usarlo con un servidor remoto.'
    }
}

function Assert-BazarManifest([string]$Bundle) {
    $root = (Resolve-Path -LiteralPath $Bundle).Path
    $manifest = Get-Content -LiteralPath (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json
    if ($manifest.version -ne 1 -or @($manifest.files | Where-Object { $_.path -eq 'database.bak' }).Count -ne 1) {
        throw 'El manifiesto no tiene el formato esperado o no incluye la base de datos.'
    }
    foreach ($file in $manifest.files) {
        $path = [IO.Path]::GetFullPath((Join-Path $root $file.path))
        if (!$path.StartsWith($root.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Ruta inválida en el manifiesto.' }
        if (!(Test-Path -LiteralPath $path -PathType Leaf)) { throw "Falta un archivo del respaldo: $($file.path)" }
        if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ne $file.sha256) { throw "El respaldo cambió o está dañado: $($file.path)" }
    }
    return $manifest
}
