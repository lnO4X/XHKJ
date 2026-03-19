try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing -TimeoutSec 10
    $r.Content.Substring(0, [Math]::Min(3000, $r.Content.Length)) | Out-File -FilePath 'C:\Users\eashe\x\XHKJ\mainsite\page_output.txt' -Encoding utf8
    "STATUS: $($r.StatusCode)" | Out-File -FilePath 'C:\Users\eashe\x\XHKJ\mainsite\page_status.txt'
    "SIZE: $($r.Content.Length)" | Add-Content -Path 'C:\Users\eashe\x\XHKJ\mainsite\page_status.txt'
} catch {
    "ERROR: $_" | Out-File -FilePath 'C:\Users\eashe\x\XHKJ\mainsite\page_status.txt'
}
