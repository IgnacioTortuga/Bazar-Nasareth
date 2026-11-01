#!/usr/bin/env bash
set -euo pipefail

az webapp config appsettings set \
  --resource-group Bazar-nazareth_group \
  --name bazar-nazareth-web \
  --settings \
    'ConnectionStrings__Bazar=Server=tcp:bazar-nazareth-sql.database.windows.net,1433;Initial Catalog=BazarNazareth;Authentication=Active Directory Default;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;' \
    'FrontendOrigin=https://bazar-nazareth-web-f0a6gwcwehhmcahk.westus3-01.azurewebsites.net' \
    'ImageDirectory=D:\home\data\images' \
    'ASPNETCORE_ENVIRONMENT=Production' \
  --output none

az webapp deploy \
  --resource-group Bazar-nazareth_group \
  --name bazar-nazareth-web \
  --src-path /home/bryan/bazar-nazareth-azure.zip \
  --type zip \
  --clean true \
  --restart true \
  --track-status false
