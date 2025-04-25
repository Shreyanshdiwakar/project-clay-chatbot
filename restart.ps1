# Stop any running Node.js processes
Write-Host "Stopping any running Node.js processes..."
taskkill /F /IM node.exe 2> $null

# Wait a moment to ensure processes are fully terminated
Start-Sleep -Seconds 2

# Try to remove the .next directory
Write-Host "Removing .next directory..."
if (Test-Path .next) {
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host ".next directory removed successfully"
    } catch {
        Write-Host "Could not remove .next directory completely. Error: $_"
    }
}

# Start the development server
Write-Host "Starting development server..."
npm run dev 