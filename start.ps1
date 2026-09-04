Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Starting SecureCheck - AI Security Auditor" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --reload --port 8000"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Backend API: http://localhost:8000 (Docs: http://localhost:8000/docs)" -ForegroundColor Yellow
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Yellow
