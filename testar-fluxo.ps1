$base = "http://localhost:3333"

Write-Host "=== TESTE STACKPOST ===" -ForegroundColor Cyan

# 1. Criar conta
Write-Host "1. Criando usuario..." -ForegroundColor Cyan
$body = '{"name":"Operador","email":"op@teste.com","password":"12345678"}'
$reg = Invoke-RestMethod -Uri "$base/api/auth/register" -Method POST -ContentType "application/json" -Body $body
Write-Host "Usuario: $($reg.user.email)" -ForegroundColor Green

# 2. Criar conta social
Write-Host "2. Conectando Instagram..." -ForegroundColor Cyan
$body = '{"platform":"instagram","username":"@expostacker","accessToken":"fake-token"}'
$acc = Invoke-RestMethod -Uri "$base/api/accounts" -Method POST -ContentType "application/json" -Body $body
Write-Host "Conta: $($acc.username)" -ForegroundColor Green

# 3. Criar conta LinkedIn
Write-Host "3. Conectando LinkedIn..." -ForegroundColor Cyan
$body = '{"platform":"linkedin","username":"ExpoStacker Studio","accessToken":"fake-token-linkedin"}'
$acc2 = Invoke-RestMethod -Uri "$base/api/accounts" -Method POST -ContentType "application/json" -Body $body
Write-Host "Conta: $($acc2.username)" -ForegroundColor Green

# 4. Criar post
Write-Host "4. Criando post..." -ForegroundColor Cyan
$body = '{"content":"Visibilidade total da sua frota com Frotamais.","platforms":["instagram","linkedin"],"scheduledAt":null}'
$post = Invoke-RestMethod -Uri "$base/api/posts" -Method POST -ContentType "application/json" -Body $body
Write-Host "Post: $($post.id)" -ForegroundColor Green

# 5. Publicar
Write-Host "5. Publicando..." -ForegroundColor Cyan
$body = "{`"postId`":`"$($post.id)`"}"
$pub = Invoke-RestMethod -Uri "$base/api/posts/publish" -Method POST -ContentType "application/json" -Body $body
Write-Host "Status: $($pub.status)" -ForegroundColor Green
$pub.results | ForEach-Object { Write-Host "  - $($_.platform): $($_.success)" }

# 6. Listar posts
Write-Host "6. Listando posts..." -ForegroundColor Cyan
$posts = Invoke-RestMethod -Uri "$base/api/posts" -Method GET
$posts | ForEach-Object { Write-Host "  - $($_.content) [$($_.status)]" }

# 7. Listar contas
Write-Host "7. Listando contas..." -ForegroundColor Cyan
$accs = Invoke-RestMethod -Uri "$base/api/accounts" -Method GET
$accs | ForEach-Object { Write-Host "  - $($_.platform): $($_.username)" }

Write-Host "=== FIM ===" -ForegroundColor Cyan
