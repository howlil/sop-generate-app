# Arsitektur Sistem SOPFlow

Dokumen ini menggambarkan arsitektur implementasi SOPFlow berdasarkan codebase dan deployment Docker yang aktif saat ini. Diagram PlantUML pada dokumen ini menjadi dokumentasi arsitektur yang harus ikut diperbarui ketika topologi runtime, storage, atau integrasi eksternal berubah.

## Gambaran umum

SOPFlow adalah aplikasi berbasis web dengan tiga service utama pada Docker Compose: `frontend`, `backend`, dan `db`. Wago berjalan sebagai gateway WhatsApp self-hosted terpisah dan diintegrasikan dari backend.

Alur runtime utama:

```text
Browser
  |
  | HTTPS / public ingress
  v
Reverse proxy / platform ingress
  |
  v
Frontend Nginx :8080
  | \
  |  \ / -> TanStack Start SSR :4173
  |
  +---- /api -> NestJS Backend :3001
                    |
                    +--> Prisma -> MariaDB :3306
                    |
                    +--> persistent PDF storage
                    |
                    +--> Wago self-hosted
                           |
                           +--> WhatsApp
                           |
                           +--> signed delivery webhook -> SOPFlow
```

Port di atas adalah port internal container/service. Pengguna publik tidak perlu membuka port `8080`, `4173`, `3001`, atau `3306` secara langsung. Public ingress/reverse proxy menangani HTTP/HTTPS dan meneruskan traffic ke service frontend.

### Diagram arsitektur sistem

```plantuml
@startuml
title Arsitektur Sistem SOPFlow - Runtime Production

skinparam {
  componentStyle rectangle
  shadowing false
  linetype ortho
  packageStyle rectangle
  defaultFontName sans-serif
  roundCorner 8

  ActorBorderColor #2D3748
  ActorBackgroundColor #E2E8F0

  NodeBorderColor #4A5568
  NodeBackgroundColor #F7FAFC

  ComponentBorderColor #3182CE
  ComponentBackgroundColor #EBF8FF

  DatabaseBorderColor #38A169
  DatabaseBackgroundColor #F0FFF4

  StorageBorderColor #D69E2E
  StorageBackgroundColor #FFFFF0

  FrameBorderColor #718096
  FrameBackgroundColor #FFFFFF
}

actor "Pengguna / Pengunjung" as User
cloud "Internet / HTTPS" as Internet

node "Host / Platform Deployment" as Host {
  component "Public Ingress / Reverse Proxy\n(HTTP/HTTPS)" as PublicIngress

  frame "Docker Compose: SOPFlow" as Compose {
    node "Frontend Container" as FrontendContainer {
      component "Nginx\n:8080" as Nginx
      component "TanStack Start SSR\n127.0.0.1:4173" as SSR
      folder "Client Assets\n/app/dist/client" as Assets
    }

    node "Backend Container" as BackendContainer {
      component "NestJS REST API\n:3001 /api/v1" as NestApi
      component "Domain & Security Layer" as Domain
      component "Prisma ORM" as Prisma
      component "Notification / Reminder" as Notification
      component "PDF Storage Service" as PdfStorage
    }

    database "MariaDB 11.4\n:3306" as MariaDB
    storage "Docker Volume\ndb_data" as DbVolume
    storage "Docker Volume\nsop_pdf_data" as PdfVolume
  }
}

cloud "Wago Self-hosted\nWhatsApp Gateway" as Wago
cloud "WhatsApp Network" as WhatsApp
actor "Penerima Notifikasi" as Recipient

User --> Internet : HTTPS
Internet --> PublicIngress
PublicIngress --> Nginx : frontend:8080

Nginx --> SSR : / dan route aplikasi
Nginx --> Assets : /assets/*
Nginx --> NestApi : /api/* -> backend:3001

NestApi --> Domain : auth, RBAC, validasi,\nworkflow SOP dan TTE
Domain --> Prisma : query / transaction
Prisma --> MariaDB
MariaDB --> DbVolume : persistensi data

Domain --> PdfStorage : simpan / baca PDF
PdfStorage --> PdfVolume : /app/storage/sop-pdf

Domain --> Notification : event / reminder workflow
Notification --> Wago : POST /messages/send\nBearer API key + Idempotency-Key
Wago --> WhatsApp : kirim pesan
WhatsApp --> Recipient : notifikasi WhatsApp

Wago --> NestApi : POST /api/v1/webhooks/wago\nsigned delivery webhook
NestApi --> Notification : verify + reconcile status
Notification --> Prisma : simpan delivery / webhook state

note right of Nginx
  <b>Single application entry point</b>
  Nginx melayani asset, SSR,
  dan reverse proxy /api.
end note

note right of Wago
  <b>Service eksternal terhadap SOPFlow Compose</b>
  Wago di-host terpisah.
  API key hanya digunakan server-side.
end note

note bottom of NestApi
  <b>Webhook Wago</b>
  Menerima message.server_accepted
  atau message.rejected.
end note

@enduml
```

Diagram tersebut menggambarkan boundary runtime aktif. Wago tidak menjadi container di `compose.yml` SOPFlow; Wago adalah gateway terpisah yang diakses backend melalui `WAGO_BASE_URL`.

## Frontend

Frontend menggunakan React, Vite, dan TanStack Start. Production image menjalankan Nginx pada port internal `8080` dan server SSR TanStack Start pada loopback `127.0.0.1:4173`.

- Nginx berjalan sebagai user non-root.
- `/assets/` dilayani langsung dari bundle client.
- `/api/` diteruskan ke `backend:3001`.
- route aplikasi selain `/api/` dan `/assets/` diteruskan ke TanStack Start SSR pada `127.0.0.1:4173`.
- frontend tidak membutuhkan Linux capability `NET_BIND_SERVICE` karena bind pada port `8080`, bukan privileged port `80`.
- browser berinteraksi melalui hostname publik yang ditangani reverse proxy/platform deployment.

### Diagram arsitektur frontend

```plantuml
@startuml
title Arsitektur Frontend SOPFlow

skinparam {
  componentStyle rectangle
  shadowing false
  linetype ortho
  packageStyle rectangle
  defaultFontName sans-serif
  roundCorner 8

  ActorBorderColor #2D3748
  ActorBackgroundColor #E2E8F0
  NodeBorderColor #4A5568
  NodeBackgroundColor #F7FAFC
  ComponentBorderColor #3182CE
  ComponentBackgroundColor #EBF8FF
  StorageBorderColor #D69E2E
  StorageBackgroundColor #FFFFF0
}

actor "Pengguna" as User

node "Browser" as Browser {
  component "React UI Components" as Components
  component "TanStack Router\nPages & Route Guards" as Router
  component "TanStack Query\nHooks, Cache, Mutations" as Query
  component "API Client" as ApiClient
  storage "Browser State / Session" as BrowserState
}

node "Frontend Container" as Frontend {
  component "Nginx :8080" as Nginx
  component "TanStack Start SSR\n127.0.0.1:4173" as SSR
  folder "Static Assets\n/app/dist/client" as Assets
}

cloud "NestJS Backend\nbackend:3001 /api/v1" as Backend

User --> Nginx : HTTPS via public ingress
Nginx --> SSR : /
Nginx --> Assets : /assets/*
Nginx --> Backend : /api/*

SSR --> Router : render route
Router --> Components : compose page UI
Components --> Query : data / mutation
Query --> ApiClient : request API
ApiClient --> Nginx : same-origin /api/v1/*
Query --> BrowserState : cache
BrowserState --> Router : state sesi / navigasi

note right of Nginx
  Nginx adalah entry point
  container frontend.
end note

note right of SSR
  SSR tidak diekspos keluar
  container; listen pada loopback 4173.
end note

note bottom of ApiClient
  API tetap same-origin dari browser.
  Nginx meneruskan /api ke backend.
end note

@enduml
```

## Backend

Backend menggunakan NestJS/TypeScript dan berjalan pada port internal `3001` pada Compose production. Pada level arsitektur, backend ditampilkan sebagai layered application agar diagram menjelaskan pemisahan tanggung jawab tanpa masuk ke detail setiap modul bisnis.

Lapisan utama backend:

- **Controller** menerima request HTTP dan mengekspos endpoint REST;
- **DTO & Validation** mendefinisikan kontrak data request/response serta validasi input;
- **Service** menjalankan business logic dan workflow aplikasi;
- **Repository** mengabstraksikan akses data dari business logic;
- **Prisma ORM** menjadi implementasi akses persistence ke MariaDB;
- **Wago Integration** menghubungkan service backend dengan gateway WhatsApp eksternal;
- **PDF Storage** menangani penyimpanan artefak PDF pada persistent volume.

Detail autentikasi, workflow SOP, reminder, webhook, retry, dan mekanisme delivery Wago merupakan detail implementasi di dalam layer tersebut dan tidak ditampilkan pada diagram backend tingkat tinggi.

Backend menjalankan Prisma migration sebelum start production melalui `pnpm prisma migrate deploy`.

### Diagram arsitektur backend

```plantuml
@startuml
title Arsitektur Backend SOPFlow

skinparam {
  componentStyle rectangle
  shadowing false
  linetype ortho
  packageStyle rectangle
  defaultFontName sans-serif
  roundCorner 8

  NodeBorderColor #4A5568
  NodeBackgroundColor #F7FAFC
  ComponentBorderColor #3182CE
  ComponentBackgroundColor #EBF8FF
  DatabaseBorderColor #38A169
  DatabaseBackgroundColor #F0FFF4
  StorageBorderColor #D69E2E
  StorageBackgroundColor #FFFFF0
}

cloud "Frontend / Nginx" as Frontend
cloud "Wago Gateway\nWhatsApp" as Wago

node "Backend Container :3001" as BackendContainer {
  frame "NestJS Application" as NestApp {
    component "Controller Layer\nREST API /api/v1" as Controller
    component "DTO & Validation\nRequest / Response Contract" as DTO
    component "Service Layer\nBusiness Logic & Workflow" as Service
    component "Repository Layer\nData Access Abstraction" as Repository
    component "Prisma ORM" as Prisma
    component "Wago Integration\nNotification Adapter" as WagoIntegration
    component "PDF Storage" as PdfStorage
  }
}

database "MariaDB 11.4" as Database
storage "sop_pdf_data\nPersistent PDF Storage" as PdfVolume

Frontend --> Controller : HTTP / REST
Controller --> DTO : bind & validate
DTO --> Service : validated data
Service --> Repository : read / write data
Repository --> Prisma : persistence operation
Prisma --> Database : query / transaction

Service --> PdfStorage : store / read PDF
PdfStorage --> PdfVolume

Service --> WagoIntegration : send notification
WagoIntegration --> Wago : REST API
Wago --> Controller : delivery webhook

note bottom of NestApp
  Detail modul seperti auth, SOP, evaluasi,
  TTE, pengesahan, reminder, dan webhook
  berada di dalam layer yang sama.
end note

@enduml
```

Diagram backend ini sengaja berhenti pada boundary layer aplikasi. Detail internal integrasi Wago tetap dijelaskan pada bagian **Notifikasi** agar diagram arsitektur utama tetap mudah dibaca.

## Database

Database menggunakan MariaDB 11.4 pada Compose, port internal `3306`.

Volume `db_data` menyimpan data database secara persisten. Database tidak perlu dipublikasikan ke internet pada deployment normal.

Prisma menjadi lapisan akses database aplikasi. Constraint/invariant pada migration merupakan bagian dari kontrak persistence production.

## PDF dan TTE storage

PDF hasil proses signing tidak disimpan di MinIO/S3 pada implementasi sekarang. Backend menggunakan filesystem persistent:

```text
/app/storage/sop-pdf
```

Compose memasang Docker volume:

```text
sop_pdf_data -> /app/storage/sop-pdf
```

Database menyimpan data domain, credential/metadata TTE yang diperlukan, serta informasi untuk menghubungkan signature dengan workflow. Artefak PDF tetap berada pada persistent storage backend.

Detail TTE dijelaskan pada:

- `docs/detail_workflow_dan_teknis_tte.md`
- `docs/tanda_tangan_elektronik_dan_ca.md`

## Notifikasi

### In-app

Reminder in-app dijalankan oleh scheduler backend dan tidak memerlukan provider eksternal.

### WhatsApp melalui Wago

Provider aktif adalah `WagoProvider`. SOPFlow dan Wago mempunyai dua arah integrasi yang berbeda:

1. **Outbound command** — SOPFlow mengirim pesan ke Wago melalui `POST /messages/send`.
2. **Inbound delivery event** — Wago mengirim webhook bertanda tangan ke `POST /api/v1/webhooks/wago`.

Outbound request menggunakan:

- `Authorization: Bearer <WAGO_API_KEY>`;
- `Content-Type: application/json`;
- `Idempotency-Key` untuk logical reminder occurrence;
- payload `to` dan `text`.

Konfigurasi utama:

- `WAGO_BASE_URL` kosong + `WAGO_API_KEY` kosong: outbound WhatsApp nonaktif;
- keduanya terisi: outbound WhatsApp aktif;
- hanya salah satu terisi: konfigurasi invalid dan backend menolak startup;
- `WAGO_REQUEST_TIMEOUT_MS`: timeout request outbound;
- `WAGO_WEBHOOK_SECRET`: secret minimal 32 karakter untuk memverifikasi webhook Wago ketika receiver webhook dikonfigurasi.

Recipient policy tidak disimpan ulang atau dikelola oleh SOPFlow. Nomor receiver harus di-allow secara manual pada Wago. SOPFlow tidak mencoba membypass policy Wago.

Setiap logical reminder occurrence membawa `Idempotency-Key` yang stabil selama retry. Respons Wago `DUPLICATE_MESSAGE` untuk key occurrence yang sama diperlakukan sebagai logical success agar timeout/retry transport tidak menggandakan pesan.

Setelah outbound request diterima Wago, `WagoProvider` menyimpan `messageId` transport sebagai delivery berstatus pending. Wago kemudian dapat mengirim salah satu event:

- `message.server_accepted` dengan status `accepted`;
- `message.rejected` dengan status `rejected` dan optional error code.

Receiver webhook:

- memerlukan `Webhook-Id`, `Webhook-Timestamp`, `Webhook-Signature`, dan `X-Wago-Event`;
- memverifikasi signature terhadap raw request body;
- memvalidasi envelope event;
- mendeduplikasi `Webhook-Id`;
- mencocokkan event dengan transport `messageId`;
- menyimpan event unmatched secara durable agar dapat direkonsiliasi;
- mengubah delivery `PENDING` menjadi `ACCEPTED` atau `REJECTED`;
- dapat mempercepat jadwal retry untuk rejection yang eligible.

### Diagram integrasi Wago

```plantuml
@startuml
title Integrasi Notifikasi WhatsApp SOPFlow dan Wago

skinparam {
  componentStyle rectangle
  shadowing false
  linetype ortho
  defaultFontName sans-serif
  roundCorner 8
}

participant "Reminder Scheduler" as Scheduler
participant "Notification Service" as Notification
participant "WagoProvider" as Provider
participant "Delivery Repository" as Delivery
participant "Wago Gateway" as Wago
participant "WhatsApp" as WA
participant "WagoWebhookController" as Webhook
participant "Webhook Signature Service" as Signature
participant "WagoWebhookService" as WebhookService
database "MariaDB" as DB

Scheduler -> Notification : reminder due
Notification -> Provider : send(destination, message,\nidempotencyKey)
Provider -> Wago : POST /messages/send\nBearer API key\nIdempotency-Key

alt Wago menerima request
  Wago --> Provider : 2xx + messageId
  Provider --> Notification : status=pending,\ntransportMessageId
  Notification -> Delivery : persist delivery
  Delivery -> DB : PENDING + messageId

  Wago -> WA : submit message

  alt server accepted
    Wago -> Webhook : POST /api/v1/webhooks/wago\nmessage.server_accepted
  else rejected
    Wago -> Webhook : POST /api/v1/webhooks/wago\nmessage.rejected
  end

  Webhook -> Signature : verify headers + raw body
  Signature --> Webhook : valid
  Webhook -> WebhookService : ingest trusted event
  WebhookService -> DB : dedupe webhookId\nmatch transportMessageId

  alt matched accepted
    WebhookService -> DB : PENDING -> ACCEPTED
  else matched rejected
    WebhookService -> DB : PENDING -> REJECTED
    WebhookService -> DB : accelerate retry\njika eligible
  else transport message belum ditemukan
    WebhookService -> DB : store unmatched event
  end

  Webhook --> Wago : HTTP 200
else duplicate idempotency key
  Wago --> Provider : 409 DUPLICATE_MESSAGE
  Provider --> Notification : logical success / pending
else request gagal
  Wago --> Provider : 4xx / 5xx
  Provider --> Notification : mapped channel error
end

@enduml
```

Suite integration Evolution API lama bukan bagian dari source module notifikasi aktif. Integrasi aktif adalah Wago.

## Deployment Docker Compose

Service pada `compose.yml`:

### `db`

- image: MariaDB 11.4;
- volume: `db_data`;
- healthcheck database;
- hanya dibutuhkan oleh backend.

### `backend`

- build dari `server/Dockerfile`;
- internal port/expose `3001`;
- menunggu database healthy;
- menjalankan Prisma migration lalu NestJS;
- volume `sop_pdf_data` untuk artefak PDF;
- `cap_drop: ALL` dan `no-new-privileges`;
- menggunakan `WAGO_BASE_URL`, `WAGO_API_KEY`, `WAGO_WEBHOOK_SECRET`, dan `WAGO_REQUEST_TIMEOUT_MS` bila integrasi WhatsApp dikonfigurasi.

### `frontend`

- build dari `client/Dockerfile`;
- Nginx internal `8080`;
- TanStack Start SSR internal `127.0.0.1:4173`;
- menunggu backend healthy;
- `cap_drop: ALL`;
- tidak membutuhkan `cap_add`.

Wago di-host sebagai service/gateway terpisah. SOPFlow membutuhkan base URL Wago dan API key untuk outbound. Untuk delivery webhook, endpoint SOPFlow harus dapat dijangkau Wago dan kedua service harus memiliki webhook secret yang sesuai. Secret dan API key tidak boleh dimasukkan ke bundle frontend.

## Reverse proxy dan MyPaas

Pada deployment melalui platform seperti MyPaas, reverse proxy/public ingress menerima request publik pada HTTP/HTTPS dan mengarahkan hostname aplikasi ke internal frontend port `8080`.

Dengan demikian:

- port publik tetap mengikuti ingress/reverse proxy, umumnya `80/443`;
- target aplikasi frontend di dalam deployment adalah `8080`;
- backend `3001` dan database `3306` tidak perlu diekspos sebagai public application port;
- `/api/v1/webhooks/wago` tetap dapat dicapai melalui hostname publik SOPFlow dan diteruskan oleh Nginx ke backend.

## Security boundary

Secret berikut tidak boleh di-hardcode atau dicommit:

- password database;
- JWT secret dan refresh secret;
- `TTE_ENCRYPTION_SECRET`;
- `WAGO_API_KEY`;
- `WAGO_WEBHOOK_SECRET`.

Auth menggunakan cookie/JWT sesuai implementasi backend. CORS production harus menggunakan origin eksplisit karena request authenticated memakai credentials.

Wago API key hanya digunakan untuk request **SOPFlow -> Wago**. Webhook secret digunakan untuk memverifikasi request **Wago -> SOPFlow**; keduanya memiliki fungsi dan trust boundary yang berbeda.

Private key TTE berada di dalam P12 personal pengguna pada model internal SOPFlow. Untuk production pemerintah yang membutuhkan sertifikat resmi, rekomendasi arsitekturnya adalah integrasi PSrE/BSrE sehingga custody private key tidak berada di aplikasi ini.

## CI dan testing

CI utama memeriksa server dan client melalui typecheck, lint, unit test, build, serta critical Playwright journeys. Dokumentasi integration test aktual ada pada `docs/integration-test.md`.

Dokumen laporan test yang memuat jumlah test/coverage adalah snapshot historis pada commit/run tertentu. Status branch terkini harus dilihat dari CI commit tersebut.

## Komponen yang tidak merupakan arsitektur aktif

Dokumentasi lama pernah menyebut beberapa komponen berikut, tetapi komponen tersebut bukan bagian dari runtime SOPFlow saat ini:

- PostgreSQL;
- S3/MinIO;
- Evolution API notification module;
- HSM/KMS production;
- OCSP/TSA eksternal;
- PSrE/BSrE integration.

Komponen production-grade TTE tersebut dapat menjadi pengembangan lanjutan dan tidak boleh digambarkan sebagai fitur yang sudah diimplementasikan.
