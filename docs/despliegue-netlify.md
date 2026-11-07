# Netlify frontend and ASP.NET backend

Netlify builds the React frontend from this monorepo. The ASP.NET Core server runs
on a separate .NET/Docker host with SQL Server and persistent storage. A folder
dropped into Netlify is a static upload: it does not build the monorepo or run C#.

The public flow is:

```text
Browser -> bazarnazareth.netlify.app
           |-- static files -> Netlify
           |-- /api/*       -> ASP.NET -> SQL Server + image disk
           |-- /producto/*  -> ASP.NET (shared product pages)
           |-- /idea/*      -> ASP.NET (shared gallery pages)
           `-- other paths -> React index.html
```

## 1. Deploy the backend

### Render Free: temporary preview

The root `render.yaml` defines one **Free Docker web service**, without a paid
disk or a Render database. It still needs a reachable **external SQL Server**.
Render Postgres is not compatible with the application's current SQL Server
provider. A LocalDB/SQL Server instance on your PC is not a hosted database.

Render Free discards filesystem changes on sleep, restart, and redeploy. Uploaded
images and login encryption keys under `/data` will be lost; existing sessions
will no longer work when the keys are replaced. The Docker build does not include
your local uploaded images. This setup is for a temporary preview, not a durable
catalog with administrative image uploads.

Render Free sleeps after 15 minutes without inbound traffic and can take about a
minute to wake. Netlify's proxy timeout is 26 seconds, so the first catalog/login
request after sleep can fail. Open the Render service's HTTPS URL, wait for the
application to respond, then retry Netlify. Sleeping services remain a limitation
of the Free plan; the configuration does not attempt to keep them awake.

To create the preview:

1. Push the deployment files to your Git repository.
2. In Render, select **New > Blueprint**, connect that repository, and review
   `render.yaml`. Confirm the web service compute plan is **Free**.
3. Supply `ConnectionStrings__Bazar`, `INITIAL_ADMIN_EMAIL`, and
   `INITIAL_ADMIN_PASSWORD` in Render's private settings. The SQL Server must be
   reachable from Render and allow the service's outbound connections. Do not
   paste credentials into Git or chat. Startup requires that database and still
   performs the initialization described below.
4. Deploy. Once the service is running, copy its assigned HTTPS origin.
5. In Netlify, set `NETLIFY_BACKEND_ORIGIN` to that Render origin and redeploy the
   frontend from Git.

If creating a **New > Web Service** manually, use the repository root (leave
**Root Directory** empty), **Language: Docker**, **Dockerfile Path: ./Dockerfile**,
**Docker Build Context: .**, and **Instance Type: Free**. Leave the Docker start
command at its default. Add the variables in the table below and override
`ASPNETCORE_HTTP_PORTS` to `10000`, matching the Blueprint. The health check path
is `/`.

If you do not have external SQL Server hosting yet, the API cannot finish startup.
Provisioning that database or adapting the project to another database/storage
provider is separate work; this Blueprint does neither.

### Durable backend hosting

Use a host that runs Linux Docker containers, exposes HTTPS, and supports a
persistent disk. The repository-root `Dockerfile` builds both projects and runs
ASP.NET Core on port **8080** as an unprivileged user. Set the Docker build context
to the repository root, not `backend/`.

Configure these variables in the backend host's secret/environment settings:

| Variable | Value |
| --- | --- |
| `ConnectionStrings__Bazar` | Connection string for the target SQL Server; use an encrypted connection with a valid server certificate. LocalDB on your PC is not accessible from the container. |
| `FrontendOrigin` | `https://bazarnazareth.netlify.app` (no trailing slash) |
| `PublicSiteUrl` | `https://bazarnazareth.netlify.app` |
| `INITIAL_ADMIN_EMAIL` | Initial administrator email, required only for a database without editors. |
| `INITIAL_ADMIN_PASSWORD` | Initial password of at least 12 characters, required only for a database without editors. |

The Docker image already sets `ASPNETCORE_ENVIRONMENT=Production`,
`ASPNETCORE_HTTP_PORTS=8080`, `ImageDirectory=/data/images`, and
`DataProtectionKeysDirectory=/data/keys`. If your host supplies a different port,
configure its target port to 8080 or override `ASPNETCORE_HTTP_PORTS` accordingly.

Mount persistent storage at **`/data`** and give the container's `app` user write
access. Both images and cookie encryption keys must survive redeployments. Keep
the keys private to the application; the file-based key ring is not encrypted by
this configuration. Start with one backend instance using this disk.

The Docker build excludes local appsettings, uploaded images, and secrets. It
does not transfer your local SQL database. To retain an existing catalog, restore
an authorized SQL backup to the target server and copy its matching image files
to `/data/images`, preserving filenames. Back up both together.

The existing startup still calls `EnsureCreatedAsync()` and seeds missing initial
records. It does not migrate an existing schema. Do not point a first deployment
at a real database until its schema and backup have been reviewed. No migration
or database operation is performed by building this image.

An optional local build, without starting the server or accessing SQL Server:

```powershell
docker build -t bazar-nazareth .
```

After the host is configured, retain its public HTTPS origin, for example
`https://your-backend.example`. Use a running service that responds within
Netlify's proxy timeout (currently 26 seconds); a sleeping service may time out
during cold starts. Do not put SQL credentials in Netlify or the frontend.

## 2. Connect the repository to Netlify

Connect this Git repository to the existing Netlify project for automatic builds.
The root `netlify.toml` sets:

| Setting | Value |
| --- | --- |
| Base directory | `frontend` |
| Build command | `npm run build:netlify` |
| Publish directory | `dist` (relative to `frontend`) |
| Node.js | `22` |

In Netlify's environment settings, add **`NETLIFY_BACKEND_ORIGIN`** with the
backend's HTTPS origin. Include it in the build scope. It must not contain an
`/api` path, credentials, query parameters, or the Netlify site's own URL.

Trigger a new deploy. The build generates `frontend/dist/_redirects`, forwarding
API and sharing routes before the React fallback. A missing backend origin fails
the build with an explanation instead of publishing broken API routing.

The browser continues using relative `/api` requests and same-origin cookies.
There is no change to API contracts or need for browser cross-origin credentials.
The backend keeps its Origin check and HttpOnly/SameSite=Strict cookie; production
cookies require HTTPS. API responses use `Cache-Control: no-store` because data
and image access can depend on the signed-in editor and publication state.

Use the production URL for administration. A deploy preview has a different
Origin and is intentionally not authorized for writes by this backend
configuration. Use a separate test backend/database for writable previews.

For manual uploads instead of Git builds, first set `NETLIFY_BACKEND_ORIGIN` in
your local environment, run `npm --prefix frontend run build:netlify`, and upload
**only `frontend/dist`** to Netlify. A regular `npm run build` is kept unchanged
for local development and standalone ASP.NET publishing; it does not generate
Netlify's proxy rules.

## 3. Validate after deployment

1. Confirm `/` and a direct reload of `/login` display the frontend.
2. Confirm `/api/publico` returns JSON and published content/images load.
3. Without a session, `/api/session` and protected admin routes must return 401.
4. On an isolated test database, sign in and confirm the cookie has `Secure`,
   `HttpOnly`, and `SameSite=Strict`; verify writes and logout through Netlify.
5. Confirm POST requests from an unrelated Origin still return 403.
6. Check `/producto/ID` and `/idea/ID` for published records and their images.
7. After a backend restart, check image persistence and an existing session.

Repository builds do not prove these live checks. They require deployed hosting,
the target SQL Server, and persistent storage.

References: [Netlify monorepos](https://docs.netlify.com/build/configure-builds/monorepos/),
[Render Free limits](https://render.com/docs/free),
[Render Docker setup](https://render.com/docs/docker),
[Render Blueprint fields](https://render.com/docs/blueprint-spec),
[manual deploys](https://docs.netlify.com/deploy/create-deploys/),
[proxy rewrites and timeout](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/),
[ASP.NET containers](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/building-net-docker-images?view=aspnetcore-10.0),
[persistent Data Protection keys](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview?view=aspnetcore-10.0).
