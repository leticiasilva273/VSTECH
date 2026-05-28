$pastaImagens = Join-Path $PSScriptRoot "imagens"
$arquivoJson = Join-Path $pastaImagens "index.json"
$extensoes = @(".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg")

if (-not (Test-Path -LiteralPath $pastaImagens)) {
    New-Item -ItemType Directory -Path $pastaImagens | Out-Null
    Write-Host "Pasta imagens criada."
}

$imagens = Get-ChildItem -LiteralPath $pastaImagens -File |
    Where-Object { $extensoes -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object Name |
    Select-Object -ExpandProperty Name

$json = $imagens | ConvertTo-Json -Depth 1

if ($null -eq $json) {
    $json = "[]"
}

Set-Content -LiteralPath $arquivoJson -Value $json -Encoding UTF8

Write-Host ""
Write-Host "Lista de imagens atualizada com sucesso!"
Write-Host "$($imagens.Count) imagem(ns) encontrada(s)."
Write-Host "Arquivo atualizado: imagens/index.json"
