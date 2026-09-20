$c = Get-Content 'index.html'
for ($i=0; $i -lt $c.Length; $i++) {
    if ($c[$i] -match 'wood-trim') {
        Write-Output (($i+1).ToString() + ': ' + $c[$i].Trim())
    }
}
