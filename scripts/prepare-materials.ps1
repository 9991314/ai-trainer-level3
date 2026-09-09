[CmdletBinding()]
param(
  [string]$Root = (Split-Path $PSScriptRoot -Parent),
  [int]$MaxFileSizeMB = 50
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$Root = (Resolve-Path -LiteralPath $Root).Path
$materialsRoot = Join-Path $Root 'materials'
$filesRoot = Join-Path $materialsRoot 'files'
$auditRoot = Join-Path $Root '.codex_qc'
$catalogPath = Join-Path $materialsRoot 'catalog.json'
$auditPath = Join-Path $auditRoot 'github-materials-audit.csv'

$documentExtensions = @('.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt')
$skipRootDirectories = @(
  '.codex_qc', '.git', '.github', 'AI答题小助手', 'content', 'dist',
  'materials', 'node_modules', 'public', 'scripts', 'src', '__pycache__'
)
$restrictedPattern = '(?i)(请勿外传|带水印|水印版|机构流出|独家|咸鱼|赞助版|Python\s*编程[：:]从入门到实践|学习跟进)'
$emailPattern = '(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
$phonePattern = '(?<!\d)1[3-9]\d{9}(?!\d)'
$idCardPattern = '(?<!\d)\d{17}[\dXx](?!\d)'
$apiKeyPattern = '(?i)sk-[A-Za-z0-9_-]{12,}'

function Test-SensitiveText {
  param([string]$Text)

  return $Text -match $emailPattern -or
    $Text -match $phonePattern -or
    $Text -match $idCardPattern -or
    $Text -match $apiKeyPattern
}

function Get-Region {
  param([string]$Path)

  if ($Path -match '上海') { return 'shanghai' }
  if ($Path -match '深圳') { return 'shenzhen' }
  if ($Path -match '(广东|广州|珠海|佛山)') { return 'guangdong' }
  return 'national'
}

function Get-Level {
  param([string]$Path)

  if ($Path -match '(五级|5级)') { return 'level-5' }
  if ($Path -match '(四级|4级)') { return 'level-4' }
  if ($Path -match '(三级|3级)') { return 'level-3' }
  return 'mixed'
}

function Get-ContentType {
  param([string]$Path)

  if ($Path -match '(考纲|考情|考核方案|细目表|报考|通知|证书)') { return 'exam-info' }
  if ($Path -match '(实操|操作技能|Python|Pandas|Numpy|OpenCV|流程图|业务|智能训练|智能系统|数据处理|数据标注)') { return 'practical' }
  if ($Path -match '(理论|知识点|题库|试题|复习题|模拟试卷|真题)') { return 'theory' }
  if ($Path -match '(安装|使用手册|工具)') { return 'tools' }
  return 'other'
}

function Get-SafeFileName {
  param(
    [string]$Name,
    [string]$Hash
  )

  $extension = [System.IO.Path]::GetExtension($Name)
  $stem = [System.IO.Path]::GetFileNameWithoutExtension($Name) -replace '[<>:"/\\|?*]', '_'
  $stem = $stem.Trim(' ', '.')
  if ([string]::IsNullOrWhiteSpace($stem)) { $stem = "document-$($Hash.Substring(0, 8).ToLowerInvariant())" }
  if ($stem.Length -gt 100) { $stem = $stem.Substring(0, 100).TrimEnd() }
  return "$stem$($extension.ToLowerInvariant())"
}

$sourceFiles = Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object {
    $relative = [System.IO.Path]::GetRelativePath($Root, $_.FullName)
    $parts = $relative.Split([System.IO.Path]::DirectorySeparatorChar)
    $documentExtensions -contains $_.Extension.ToLowerInvariant() -and
      ($parts.Count -eq 1 -or $skipRootDirectories -notcontains $parts[0])
  }

$records = foreach ($file in $sourceFiles) {
  $relative = [System.IO.Path]::GetRelativePath($Root, $file.FullName)
  [PSCustomObject]@{
    File = $file
    Relative = $relative
    Hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    Priority = if ($relative.StartsWith('⭐2026')) { 0 } else { 1 }
  }
}

$uniqueRecords = $records | Group-Object Hash | ForEach-Object {
  $selected = $_.Group |
    Sort-Object Priority, @{ Expression = { $_.Relative.Split([System.IO.Path]::DirectorySeparatorChar).Count } }, @{ Expression = { $_.Relative.Length } } |
    Select-Object -First 1
  $selected | Add-Member -NotePropertyName DuplicateCopies -NotePropertyValue ($_.Count - 1) -PassThru
}

$sensitiveHashes = [System.Collections.Generic.HashSet[string]]::new()
foreach ($record in $uniqueRecords) {
  $extension = $record.File.Extension.ToLowerInvariant()

  if ($extension -eq '.txt') {
    $text = Get-Content -LiteralPath $record.File.FullName -Raw -ErrorAction SilentlyContinue
    if ($text -and (Test-SensitiveText $text)) { [void]$sensitiveHashes.Add($record.Hash) }
    continue
  }

  if ($extension -notin @('.docx', '.xlsx', '.pptx')) { continue }

  try {
    $archive = [System.IO.Compression.ZipFile]::OpenRead($record.File.FullName)
    try {
      foreach ($entry in $archive.Entries | Where-Object { $_.FullName -match '^(word|xl|ppt)/.*\.xml$' -and $_.Length -le 20MB }) {
        $reader = [System.IO.StreamReader]::new($entry.Open())
        try { $text = $reader.ReadToEnd() } finally { $reader.Dispose() }
        if (Test-SensitiveText $text) {
          [void]$sensitiveHashes.Add($record.Hash)
          break
        }
      }
    } finally {
      $archive.Dispose()
    }
  } catch {
    [void]$sensitiveHashes.Add($record.Hash)
  }
}

$pdfInfo = Get-Command pdfinfo -ErrorAction SilentlyContinue
if ($pdfInfo) {
  foreach ($record in $uniqueRecords | Where-Object { $_.File.Extension -ieq '.pdf' }) {
    $authorLine = & $pdfInfo.Source $record.File.FullName 2>$null |
      Where-Object { $_ -match '^Author:' } |
      Select-Object -First 1
    if ($authorLine -and (Test-SensitiveText ($authorLine -replace '^Author:\s*', ''))) {
      [void]$sensitiveHashes.Add($record.Hash)
    }
  }
}

New-Item -ItemType Directory -Path $filesRoot -Force | Out-Null
New-Item -ItemType Directory -Path $auditRoot -Force | Out-Null

$catalog = [System.Collections.Generic.List[object]]::new()
$excluded = [System.Collections.Generic.List[object]]::new()

foreach ($record in $uniqueRecords | Sort-Object Relative) {
  $reason = $null
  if ($record.File.Length -ge ($MaxFileSizeMB * 1MB)) { $reason = "file-at-least-${MaxFileSizeMB}mb" }
  elseif ($record.Relative -match $restrictedPattern) { $reason = 'restricted-label' }
  elseif ($sensitiveHashes.Contains($record.Hash)) { $reason = 'possible-sensitive-data' }

  if ($reason) {
    $excluded.Add([PSCustomObject]@{
      Reason = $reason
      SizeBytes = $record.File.Length
      SHA256 = $record.Hash.ToLowerInvariant()
      SourcePath = $record.Relative
    })
    continue
  }

  $region = Get-Region $record.Relative
  $level = Get-Level $record.Relative
  $contentType = Get-ContentType $record.Relative
  $destinationDirectory = Join-Path $filesRoot (Join-Path $region (Join-Path $level $contentType))
  New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null

  $safeName = Get-SafeFileName $record.File.Name $record.Hash
  $destinationPath = Join-Path $destinationDirectory $safeName
  if (Test-Path -LiteralPath $destinationPath) {
    $existingHash = (Get-FileHash -LiteralPath $destinationPath -Algorithm SHA256).Hash
    if ($existingHash -ne $record.Hash) {
      $stem = [System.IO.Path]::GetFileNameWithoutExtension($safeName)
      $extension = [System.IO.Path]::GetExtension($safeName)
      $destinationPath = Join-Path $destinationDirectory "$stem--$($record.Hash.Substring(0, 8).ToLowerInvariant())$extension"
    }
  }

  if (-not (Test-Path -LiteralPath $destinationPath)) {
    [System.IO.File]::Copy($record.File.FullName, $destinationPath, $false)
  }

  $catalog.Add([PSCustomObject]@{
    path = [System.IO.Path]::GetRelativePath($materialsRoot, $destinationPath).Replace('\', '/')
    title = [System.IO.Path]::GetFileNameWithoutExtension($record.File.Name)
    region = $region
    level = $level
    category = $contentType
    format = $record.File.Extension.TrimStart('.').ToLowerInvariant()
    sizeBytes = $record.File.Length
    sha256 = $record.Hash.ToLowerInvariant()
    duplicateCopiesRemoved = $record.DuplicateCopies
  })
}

$utf8 = [System.Text.UTF8Encoding]::new($false)
$catalogJson = $catalog | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($catalogPath, "$catalogJson`n", $utf8)
$excluded | Export-Csv -LiteralPath $auditPath -NoTypeInformation -Encoding utf8

$includedBytes = ($catalog | Measure-Object sizeBytes -Sum).Sum
$excludedBytes = ($excluded | Measure-Object SizeBytes -Sum).Sum
$duplicatesRemoved = ($catalog | Measure-Object duplicateCopiesRemoved -Sum).Sum

[PSCustomObject]@{
  IncludedFiles = $catalog.Count
  IncludedMB = [math]::Round($includedBytes / 1MB, 2)
  ExcludedFiles = $excluded.Count
  ExcludedMB = [math]::Round($excludedBytes / 1MB, 2)
  DuplicateCopiesRemoved = $duplicatesRemoved
  Catalog = $catalogPath
  Audit = $auditPath
} | Format-List
