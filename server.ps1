# =================================================================
# MENSETSU VR - LOCAL WEB SERVER
# Server HTTP lokal berbasis .NET Sockets bawaan Windows (Zero-dependency)
# =================================================================
$port = 8080
$listener = $null

try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
    $listener.Start()

    Write-Host ""
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host "     SIMULASI MENSETSU VR - SERVER LOKAL TELAH AKTIF       " -ForegroundColor Green
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host "  URL Lokal: http://localhost:$port/                      " -ForegroundColor Yellow
    Write-Host "  Status   : Menyajikan file HTML, CSS, JS & Scenes       " -ForegroundColor White
    Write-Host "  Tekan Ctrl+C di jendela ini jika ingin menghentikan.     " -ForegroundColor Gray
    Write-Host "===========================================================" -ForegroundColor Cyan
    Write-Host ""

    # Buka browser secara otomatis
    Start-Process "http://localhost:$port/"

    $mimeMap = @{
        ".html"  = "text/html; charset=utf-8"
        ".css"   = "text/css; charset=utf-8"
        ".js"    = "application/javascript; charset=utf-8"
        ".json"  = "application/json; charset=utf-8"
        ".png"   = "image/png"
        ".jpg"   = "image/jpeg"
        ".jpeg"  = "image/jpeg"
        ".webp"  = "image/webp"
        ".svg"   = "image/svg+xml"
        ".glb"   = "model/gltf-binary"
        ".gltf"  = "model/gltf+json"
        ".bin"   = "application/octet-stream"
        ".mp3"   = "audio/mpeg"
        ".wav"   = "audio/wav"
        ".woff2" = "font/woff2"
    }

    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $requestLine = $reader.ReadLine()

        if (-not [string]::IsNullOrEmpty($requestLine)) {
            $parts = $requestLine.Split(' ')
            if ($parts.Length -ge 2) {
                $rawPath = $parts[1].Split('?')[0].TrimStart('/')
                if ([string]::IsNullOrEmpty($rawPath)) { $rawPath = "index.html" }
                $rawPath = [System.Uri]::UnescapeDataString($rawPath)
                $filePath = Join-Path $PSScriptRoot $rawPath

                if (Test-Path $filePath -PathType Leaf) {
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
                    $cache = if ($ext -in @('.glb', '.png', '.jpg', '.jpeg', '.webp', '.woff2')) { "public, max-age=86400" } else { "no-cache" }
                    $bytes = [System.IO.File]::ReadAllBytes($filePath)

                    $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nCache-Control: $cache`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($bytes, 0, $bytes.Length)
                } else {
                    $msg = "404 File Not Found: $rawPath"
                    $msgBytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
                    $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($msgBytes.Length)`r`nConnection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                    $stream.Write($msgBytes, 0, $msgBytes.Length)
                }
            }
        }
        $client.Close()
    }
} catch {
    Write-Host "Server ditutup: $_" -ForegroundColor Yellow
} finally {
    if ($listener -ne $null) {
        $listener.Stop()
    }
}
