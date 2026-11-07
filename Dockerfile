# Build from the repository root: docker build -t bazar-nazareth .
FROM node:22-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# React and ASP.NET both use the repository-level translation dictionary.
COPY localization/ /src/localization/
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /src
COPY backend/BazarNazareth.csproj backend/
RUN dotnet restore backend/BazarNazareth.csproj
COPY backend/ backend/
COPY localization/ localization/
# The frontend is built above; the SDK stage does not need Node.js.
RUN dotnet publish backend/BazarNazareth.csproj -c Release -o /out --no-restore -p:SkipFrontendBuild=true

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080 \
    ImageDirectory=/data/images \
    DataProtectionKeysDirectory=/data/keys
COPY --from=backend /out/ ./
COPY --from=frontend /src/frontend/dist/ ./wwwroot/
RUN mkdir -p /data/images /data/keys && chown -R app:app /data
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "BazarNazareth.dll"]
