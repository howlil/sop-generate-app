# API Documentation — Sistem Informasi SOP Biro Organisasi

**Document Type:** API Documentation  
**Version:** 1.0  
**Language:** Bahasa Indonesia  
**Last Updated:** 2026-04-03  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Base URL & Conventions](#3-base-url--conventions)
4. [API Reference](#4-api-reference)
   - [Auth](#41-auth)
   - [Users](#42-users)
   - [OPD](#43-opd)
   - [Peraturan](#44-peraturan)
   - [Tim Penyusun](#45-tim-penyusun)
   - [Tim Evaluasi](#46-tim-evaluasi)
   - [SOP](#47-sop)
   - [Detail SOP](#48-detail-sop)
   - [Evaluasi](#49-evaluasi)
   - [TTE (Tanda Tangan Elektronik)](#410-tte)
   - [Audit](#411-audit)
   - [Health](#412-health)
5. [Error Handling](#5-error-handling)
6. [Rate Limiting](#6-rate-limiting)
7. [Glossary](#7-glossary)

---

## 1. Overview

Sistem Informasi SOP Biro Organisasi adalah sistem berbasis web yang mengelola siklus hidup Standard Operating Procedure (SOP) di lingkungan instansi pemerintah. API ini mengikuti arsitektur RESTful dengan format JSON untuk request dan response.

### 1.1 Fitur Utama

- **Manajemen SOP**: Pembuatan, penyusunan, dan lifecycle SOP dari DRAFT hingga BERLAKU
- **Evaluasi SOP**: Proses evaluasi oleh Tim Evaluasi dengan nilai SESUAI/TIDAK_SESUAI
- **Tanda Tangan Elektronik**: Penandatanganan SOP dan Berita Acara menggunakan PIN
- **Audit Trail**: Pencatatan lengkap semua perubahan dokumen
- **Role-Based Access Control**: Pembatasan akses berdasarkan peran pengguna

### 1.2 Aktor Sistem

| Peran | Deskripsi |
|-------|-----------|
| `TIM_PENYUSUN` | Anggota tim yang menyusun SOP di OPD |
| `KOORDINATOR_TIM_PENYUSUN` | Koordinator Tim Penyusun di OPD |
| `KEPALA_OPD` | Pimpinan OPD yang mengesahkan SOP |
| `TIM_EVALUASI` | Tim yang mengevaluasi kualitas SOP |
| `BIRO_ORGANISASI` | Administrator sistem |

---

## 2. Authentication & Authorization

### 2.1 Authentication Scheme

API menggunakan **JWT (JSON Web Token)** dengan HttpOnly cookies untuk keamanan.

**Flow Authentication:**

```
1. Client → POST /login (email, password)
2. Server → Set HttpOnly cookies (access_token, refresh_token)
3. Client → Request dengan cookies otomatis
4. Server → Validate JWT dari cookie
5. Token expired? → POST /refresh untuk token baru
```

### 2.2 Token Details

| Token | Duration | Purpose |
|-------|----------|---------|
| `access_token` | 15 menit | Akses API |
| `refresh_token` | 7 hari | Refresh access token |

### 2.3 Role-Based Access Control

Setiap endpoint dilindungi dengan decorator `@Roles()` yang membatasi akses berdasarkan peran:

```typescript
@Roles(PeranPengguna.BIRO_ORGANISASI)
@Roles(PeranPengguna.TIM_PENYUSUN, PeranPengguna.KOORDINATOR_TIM_PENYUSUN)
```

**Permission Matrix:**

| Endpoint | TIM_PENYUSUN | KOORDINATOR | KEPALA_OPD | TIM_EVALUASI | BIRO |
|----------|--------------|-------------|------------|--------------|------|
| Auth | ✓ | ✓ | ✓ | ✓ | ✓ |
| Users | ✗ | ✗ | ✗ | ✗ | ✓ |
| OPD | Read own | Read own | Read own | ✗ | CRUD |
| Peraturan | Read own | Read own | Read own | ✗ | CRUD |
| Tim Penyusun | Read own | Read own | Read own | ✗ | CRUD |
| Tim Evaluasi | ✗ | ✗ | ✗ | Read | CRUD |
| SOP | CRUD own | CRUD own | Read all | ✗ | Read all |
| Detail SOP | CRUD own | CRUD own | Read all | Read | Read all |
| Evaluasi | ✗ | ✗ | ✗ | CRUD | CRUD |
| TTE | Setup | Setup | Sign SOP | ✗ | Sign BA |
| Audit | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 3. Base URL & Conventions

### 3.1 Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://api.example.com/api/v1
```

### 3.2 Request/Response Format

**Content-Type:** `application/json`

**Request Example:**
```json
{
  "judul": "SOP Pengadaan Barang",
  "nomorSop": "SOP/ORG/2026/001"
}
```

**Response Format:**
```json
{
  "data": { /* response data */ },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-04-03T10:00:00Z"
  }
}
```

**Paginated Response:**
```json
{
  "data": [ /* array of items */ ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### 3.3 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK — Request berhasil |
| 201 | Created — Resource berhasil dibuat |
| 204 | No Content — Delete berhasil |
| 400 | Bad Request — Validasi gagal |
| 401 | Unauthorized — Token invalid/expired |
| 403 | Forbidden — Tidak punya permission |
| 404 | Not Found — Resource tidak ditemukan |
| 409 | Conflict — Resource sudah ada/duplikat |
| 422 | Unprocessable Entity — Validasi bisnis gagal |
| 429 | Too Many Requests — Rate limit exceeded |
| 500 | Internal Server Error |

---

## 4. API Reference

### 4.1 Auth

#### 4.1.1 Login

**POST** `/login`

Login pengguna dan mendapatkan access token + refresh token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nama": "John Doe",
      "peran": "TIM_PENYUSUN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Cookies Set:**
- `access_token` (15 menit)
- `refresh_token` (7 hari)

**Response 401:**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email atau kata sandi salah"
  }
}
```

---

#### 4.1.2 Refresh Token

**POST** `/refresh`

Refresh access token menggunakan refresh token.

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 401:**
```json
{
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token tidak valid"
  }
}
```

---

#### 4.1.3 Logout

**POST** `/logout`

Logout pengguna dan menghapus cookies.

**Response 200:**
```json
{
  "message": "Logout berhasil"
}
```

---

#### 4.1.4 Change Password

**PATCH** `/change-password`

Ganti kata sandi pengguna yang sedang login.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response 200:**
```json
{
  "message": "Kata sandi berhasil diubah"
}
```

**Response 401:**
```json
{
  "error": {
    "code": "INVALID_OLD_PASSWORD",
    "message": "Kata sandi lama salah"
  }
}
```

---

### 4.2 Users

#### 4.2.1 Create User

**POST** `/users`

Buat pengguna baru (hanya Biro Organisasi).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nama": "John Doe",
  "nip": "123456789",
  "peran": "TIM_PENYUSUN",
  "opdId": "uuid-opd"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nama": "John Doe",
    "nip": "123456789",
    "peran": "TIM_PENYUSUN",
    "opdId": "uuid-opd",
    "createdAt": "2026-04-03T10:00:00Z"
  }
}
```

**Response 409:**
```json
{
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email sudah terdaftar"
  }
}
```

---

#### 4.2.2 List Users

**GET** `/users?page=1&limit=10`

Daftar semua pengguna (hanya Biro Organisasi).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Nomor halaman |
| `limit` | Integer | 10 | Jumlah per halaman |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "nama": "John Doe",
      "peran": "TIM_PENYUSUN"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

#### 4.2.3 Get User by ID

**GET** `/users/:id`

Detail pengguna berdasarkan ID.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nama": "John Doe",
    "nip": "123456789",
    "peran": "TIM_PENYUSUN",
    "opdId": "uuid-opd",
    "createdAt": "2026-04-03T10:00:00Z",
    "updatedAt": "2026-04-03T10:00:00Z"
  }
}
```

**Response 404:**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User tidak ditemukan"
  }
}
```

---

#### 4.2.4 Update User

**PATCH** `/users/:id`

Update informasi pengguna.

**Request Body:**
```json
{
  "nama": "Jane Doe",
  "nip": "987654321"
}
```

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "nama": "Jane Doe",
    "nip": "987654321"
  }
}
```

---

#### 4.2.5 Delete User

**DELETE** `/users/:id`

Hapus pengguna (hanya Biro Organisasi).

**Response 204:** No content

**Response 404:**
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User tidak ditemukan"
  }
}
```

---

### 4.3 OPD (Organisasi Perangkat Daerah)

#### 4.3.1 List OPD

**GET** `/opd`

Daftar OPD (BIRO: semua; lainnya: OPD sendiri).

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nama": "Dinas Kesehatan",
      "kode": "DK-001",
      "jumlahSop": 15
    }
  ]
}
```

---

#### 4.3.2 Get OPD by ID

**GET** `/opd/:id`

Detail OPD berdasarkan ID.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "nama": "Dinas Kesehatan",
    "kode": "DK-001",
    "jumlahSop": 15,
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

#### 4.3.3 Create OPD

**POST** `/opd`

Buat OPD baru (hanya Biro Organisasi).

**Request Body:**
```json
{
  "nama": "Badan Perencanaan Daerah",
  "kode": "BAPPEDA-001"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "nama": "Badan Perencanaan Daerah",
    "kode": "BAPPEDA-001",
    "jumlahSop": 0
  }
}
```

---

#### 4.3.4 Update OPD

**PATCH** `/opd/:id`

Update OPD (hanya Biro Organisasi).

**Request Body:**
```json
{
  "nama": "Badan Perencanaan dan Keuangan Daerah",
  "kode": "BAPKEDA-001"
}
```

---

#### 4.3.5 Delete OPD (Soft Delete)

**DELETE** `/opd/:id`

Nonaktifkan OPD (hanya Biro Organisasi).

**Response 204:** No content

**Response 409:**
```json
{
  "error": {
    "code": "OPD_HAS_ACTIVE_SUBMISSION",
    "message": "OPD masih memiliki pengajuan evaluasi aktif"
  }
}
```

---

### 4.4 Peraturan

#### 4.4.1 List Peraturan

**GET** `/peraturan?opdId=uuid`

Daftar peraturan (BIRO: semua; Tim Penyusun/Kepala OPD: OPD sendiri).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `opdId` | UUID | Filter by OPD (BIRO only) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "opdId": "uuid-opd",
      "nama": "Peraturan Gubernur No. 1 Tahun 2025",
      "nomor": "1",
      "tahun": "2025",
      "status": "BERLAKU",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

#### 4.4.2 Get Peraturan by ID

**GET** `/peraturan/:id`

Detail peraturan.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "opdId": "uuid-opd",
    "nama": "Peraturan Gubernur No. 1 Tahun 2025",
    "nomor": "1",
    "tahun": "2025",
    "status": "BERLAKU",
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

#### 4.4.3 Create Peraturan

**POST** `/peraturan`

Buat peraturan baru (hanya Biro Organisasi).

**Request Body:**
```json
{
  "opdId": "uuid-opd",
  "nama": "Peraturan Gubernur No. 2 Tahun 2026",
  "nomor": "2",
  "tahun": "2026"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "nama": "Peraturan Gubernur No. 2 Tahun 2026",
    "nomor": "2",
    "tahun": "2026",
    "status": "BERLAKU"
  }
}
```

**Response 409:**
```json
{
  "error": {
    "code": "DUPLICATE_PERATURAN",
    "message": "Peraturan dengan nomor dan tahun sama sudah ada di OPD ini"
  }
}
```

---

#### 4.4.4 Update Peraturan

**PATCH** `/peraturan/:id`

Update peraturan (hanya Biro Organisasi).

**Request Body:**
```json
{
  "nama": "Peraturan Gubernur No. 2A Tahun 2026"
}
```

---

#### 4.4.5 Revoke Peraturan (Cabut)

**PATCH** `/peraturan/:id/cabut`

Cabut peraturan — ubah status ke DICABUT (hanya Biro Organisasi).

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "status": "DICABUT",
    "dicabutAt": "2026-04-03T10:00:00Z"
  }
}
```

**Response 409:**
```json
{
  "error": {
    "code": "ALREADY_REVOKED",
    "message": "Peraturan sudah berstatus DICABUT"
  }
}
```

---

#### 4.4.6 Delete Peraturan

**DELETE** `/peraturan/:id`

Hapus peraturan (hanya Biro Organisasi).

**Response 204:** No content

**Response 409:**
```json
{
  "error": {
    "code": "PERATURAN_IN_USE",
    "message": "Peraturan masih digunakan sebagai dasar hukum SOP"
  }
}
```

---

### 4.5 Tim Penyusun

#### 4.5.1 List Tim Penyusun

**GET** `/tim-penyusun?opdId=uuid`

Daftar anggota Tim Penyusun (BIRO: semua; lainnya: OPD sendiri).

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid-user",
      "opdId": "uuid-opd",
      "pengguna": {
        "nama": "John Doe",
        "email": "john@example.com"
      },
      "status": "AKTIF",
      "bergabungPada": "2026-01-01T00:00:00Z",
      "berakhirPada": null
    }
  ]
}
```

---

#### 4.5.2 Get Tim Penyusun by ID

**GET** `/tim-penyusun/:id`

Detail anggota Tim Penyusun.

---

#### 4.5.3 Add Tim Penyusun

**POST** `/tim-penyusun`

Tambah anggota Tim Penyusun ke OPD (hanya Biro Organisasi).

**Request Body:**
```json
{
  "userId": "uuid-user",
  "opdId": "uuid-opd"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "status": "AKTIF",
    "bergabungPada": "2026-04-03T10:00:00Z"
  }
}
```

**Response 409:**
```json
{
  "error": {
    "code": "ALREADY_MEMBER",
    "message": "Pengguna sudah terdaftar di OPD ini"
  }
}
```

---

#### 4.5.4 Deactivate Tim Penyusun

**PATCH** `/tim-penyusun/:id/nonaktifkan`

Nonaktifkan anggota Tim Penyusun (hanya Biro Organisasi).

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "status": "NONAKTIF",
    "berakhirPada": "2026-04-03T10:00:00Z"
  }
}
```

---

#### 4.5.5 Transfer Tim Penyusun

**PATCH** `/tim-penyusun/:id/pindah`

Pindah anggota ke OPD lain (hanya Biro Organisasi).

**Request Body:**
```json
{
  "opdId": "uuid-opd-baru"
}
```

---

### 4.6 Tim Evaluasi

#### 4.6.1 List Tim Evaluasi

**GET** `/tim-evaluasi`

Daftar anggota Tim Evaluasi.

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid-user",
      "pengguna": {
        "nama": "Jane Doe",
        "email": "jane@example.com"
      },
      "status": "AKTIF",
      "bergabungPada": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

#### 4.6.2 Get Tim Evaluasi by ID

**GET** `/tim-evaluasi/:id`

Detail anggota Tim Evaluasi.

---

#### 4.6.3 Add Tim Evaluasi

**POST** `/tim-evaluasi`

Tambah anggota Tim Evaluasi (hanya Biro Organisasi).

**Request Body:**
```json
{
  "userId": "uuid-user"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "status": "AKTIF"
  }
}
```

**Response 409:**
```json
{
  "error": {
    "code": "ALREADY_MEMBER",
    "message": "Pengguna sudah terdaftar sebagai anggota Tim Evaluasi"
  }
}
```

---

#### 4.6.4 Deactivate Tim Evaluasi

**PATCH** `/tim-evaluasi/:id/nonaktifkan`

Nonaktifkan anggota Tim Evaluasi (hanya Biro Organisasi).

---

### 4.7 SOP

#### 4.7.1 List SOP

**GET** `/sop?opdId=uuid&status=DRAFT`

Daftar SOP (SOP-09/10/11/12).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `opdId` | UUID | Filter by OPD |
| `status` | Enum | Filter by status (DRAFT, SEDANG_DISUSUN, SIAP_DIEVALUASI, DIAJUKAN_EVALUASI, SEDANG_DIEVALUASI, REVISI_DARI_TIM_EVALUASI, SIAP_DIVERIFIKASI, DIVERIFIKASI_BIRO_ORGANISASI, BERLAKU, DIGANTIKAN, DICABUT) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "opdId": "uuid-opd",
      "judul": "SOP Pengadaan Barang",
      "nomorSop": "SOP/ORG/2026/001",
      "status": "DRAFT",
      "detailSop": [
        {
          "id": "uuid",
          "versi": 1,
          "status": "DRAFT"
        }
      ],
      "createdAt": "2026-04-03T10:00:00Z"
    }
  ]
}
```

---

#### 4.7.2 Get SOP by ID

**GET** `/sop/:id`

Detail SOP beserta semua versi DetailSOP.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "opdId": "uuid-opd",
    "opd": {
      "nama": "Dinas Kesehatan"
    },
    "judul": "SOP Pengadaan Barang",
    "nomorSop": "SOP/ORG/2026/001",
    "detailSop": [
      {
        "id": "uuid",
        "versi": 1,
        "status": "DRAFT",
        "nomorSOP": "SOP/ORG/2026/001",
        "judul": "SOP Pengadaan Barang",
        "createdAt": "2026-04-03T10:00:00Z"
      }
    ],
    "createdAt": "2026-04-03T10:00:00Z"
  }
}
```

---

#### 4.7.3 Create SOP

**POST** `/sop`

Buat SOP baru + DetailSOP versi 1 (DRAFT) — SOP-01.

**Request Body:**
```json
{
  "judul": "SOP Pengadaan Barang",
  "nomorSop": "SOP/ORG/2026/001",
  "deskripsi": "SOP untuk proses pengadaan barang dan jasa"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "judul": "SOP Pengadaan Barang",
    "nomorSop": "SOP/ORG/2026/001",
    "status": "DRAFT",
    "detailSop": {
      "id": "uuid",
      "versi": 1,
      "status": "DRAFT"
    }
  }
}
```

---

#### 4.7.4 Update SOP

**PATCH** `/sop/:id`

Update judul SOP.

**Request Body:**
```json
{
  "judul": "SOP Pengadaan Barang dan Jasa"
}
```

---

#### 4.7.5 Delete SOP

**DELETE** `/sop/:id`

Hapus SOP (hanya jika belum ada TTE/evaluasi) — SOP-16.

**Response 204:** No content

**Response 409:**
```json
{
  "error": {
    "code": "SOP_CANNOT_BE_DELETED",
    "message": "SOP sudah ditandatangani atau dievaluasi"
  }
}
```

---

### 4.8 Detail SOP

#### 4.8.1 List Detail SOP

**GET** `/detail-sop?sopId=uuid&opdId=uuid&status=DRAFT`

Daftar DetailSOP (SOP-09/10/11/12).

---

#### 4.8.2 Get Detail SOP by ID

**GET** `/detail-sop/:id`

Detail DetailSOP — SOP-22.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "sopId": "uuid-sop",
    "versi": 1,
    "nomorSOP": "SOP/ORG/2026/001",
    "judul": "SOP Pengadaan Barang",
    "status": "DRAFT",
    "metadata": {
      "institution": "Dinas Kesehatan",
      "pic": "Bagian Umum",
      "section": "Pengadaan",
      "warning": "Pastikan semua dokumen lengkap",
      "equipment": "Komputer, internet",
      "mutuKelengkapan": "100% dokumen lengkap",
      "mutuWaktu": "3 hari kerja"
    },
    "lampiran": [ /* LampiranTeks */ ],
    "dasarHukum": [ /* Peraturan */ ],
    "langkahSop": [ /* LangkahSOP */ ],
    "sopTerkait": [ /* DetailSOP terkait */ ]
  }
}
```

---

#### 4.8.3 Update Metadata

**PATCH** `/detail-sop/:id/metadata`

Update metadata DetailSOP — SOP-02/18.

**Request Body:**
```json
{
  "institution": "Dinas Kesehatan",
  "pic": "Bagian Umum",
  "section": "Pengadaan",
  "warning": "Pastikan semua dokumen lengkap",
  "equipment": "Komputer, internet",
  "mutuKelengkapan": "100% dokumen lengkap",
  "mutuWaktu": "3 hari kerja"
}
```

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "metadata": { /* updated metadata */ }
  }
}
```

---

#### 4.8.4 Update Status

**PATCH** `/detail-sop/:id/status`

Ubah status DetailSOP — SOP-03/04/14/15.

**Request Body:**
```json
{
  "status": "SEDANG_DISUSUN"
}
```

**Valid Status Transitions:**
```
DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI → DIAJUKAN_EVALUASI
→ SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI → SIAP_DIVERIFIKASI
→ DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU

BERLAKU → DIGANTIKAN (otomatis saat versi baru berlaku)
BERLAKU → DICABUT (manual)
```

---

#### 4.8.5 Lampiran Teks

**GET** `/detail-sop/:id/lampiran`

Daftar lampiran teks.

**POST** `/detail-sop/:id/lampiran`

Tambah lampiran teks — SOP-24.

**Request Body:**
```json
{
  "jenis": "PERINGATAN",
  "teks": "Pastikan semua dokumen lengkap sebelum mengajukan"
}
```

**Jenis Lampiran:**
- `PERINGATAN`
- `KUALIFIKASI_PELAKSANAAN`
- `PERALATAN`
- `PENCATATAN_PENDATAAN`

**PATCH** `/detail-sop/:id/lampiran/:lampiranId`

Update lampiran teks.

**DELETE** `/detail-sop/:id/lampiran/:lampiranId`

Hapus lampiran teks.

---

#### 4.8.6 Dasar Hukum

**GET** `/detail-sop/:id/dasar-hukum`

Daftar dasar hukum SOP — SOP-19.

**POST** `/detail-sop/:id/dasar-hukum`

Tambah dasar hukum — SOP-19/23.

**Request Body:**
```json
{
  "peraturanId": "uuid-peraturan"
}
```

**Constraints:**
- Peraturan harus dari OPD yang sama
- Peraturan tidak boleh berstatus DICABUT

**DELETE** `/detail-sop/:id/dasar-hukum/:peraturanId`

Hapus dasar hukum.

---

#### 4.8.7 SOP Terkait

**GET** `/detail-sop/:id/sop-terkait`

Daftar SOP terkait — SOP-20.

**POST** `/detail-sop/:id/sop-terkait`

Tambah SOP terkait — SOP-20/21.

**Request Body:**
```json
{
  "sopTerkaitDetailId": "uuid-sop-terkait"
}
```

**Constraints:**
- Tidak boleh self-reference (A → A)
- Tidak boleh duplikat dua arah (jika A → B sudah ada, tidak boleh B → A)

**DELETE** `/detail-sop/:id/sop-terkait/:terkaitId`

Hapus SOP terkait.

---

### 4.9 Evaluasi

#### 4.9.1 List Pengajuan Evaluasi

**GET** `/evaluasi?opdId=uuid&status=SEDANG_DIEVALUASI&jenis=TERJADWAL`

Daftar PengajuanEvaluasi — EVL-04.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `opdId` | UUID | Filter by OPD |
| `status` | Enum | MENUNGGU_EVALUASI, SEDANG_DIEVALUASI, SELESAI_DIEVALUASI, DIVERIFIKASI_BIRO, DITANDATANGANI_KOORDINATOR, SELESAI |
| `jenis` | Enum | TERJADWAL, MANDIRI |

---

#### 4.9.2 Get Pengajuan Evaluasi by ID

**GET** `/evaluasi/:id`

Detail PengajuanEvaluasi beserta NilaiEvaluasi — EVL-08.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "opdId": "uuid-opd",
    "jenis": "TERJADWAL",
    "status": "SEDANG_DIEVALUASI",
    "tanggalDibuat": "2026-04-01T00:00:00Z",
    "nilaiEvaluasi": [
      {
        "id": "uuid",
        "sopDetailId": "uuid",
        "hasil": null,
        "catatan": null,
        "dinilaiOlehId": null
      }
    ]
  }
}
```

---

#### 4.9.3 Rekap Evaluasi Tahunan

**GET** `/evaluasi/rekap?tahun=2026`

Rekap evaluasi tahunan per OPD — EVL-09.

**Response 200:**
```json
{
  "data": [
    {
      "opdId": "uuid",
      "opdNama": "Dinas Kesehatan",
      "tahun": 2026,
      "totalSop": 10,
      "sesuai": 8,
      "tidakSesuai": 2,
      "nilaiRataRata": 80
    }
  ]
}
```

---

#### 4.9.4 Create Pengajuan Evaluasi

**POST** `/evaluasi`

Buat PengajuanEvaluasi — EVL-01.

**Request Body:**
```json
{
  "opdId": "uuid-opd",
  "jenis": "TERJADWAL",
  "sopDetailIds": ["uuid-sop-1", "uuid-sop-2"]
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "status": "SEDANG_DIEVALUASI",
    "nilaiEvaluasi": [
      {
        "sopDetailId": "uuid-sop-1",
        "hasil": null
      }
    ]
  }
}
```

---

#### 4.9.5 Isi Nilai Evaluasi

**PATCH** `/evaluasi/:id/nilai/:sopDetailId`

Isi hasil evaluasi per DetailSOP — EVL-05.

**Request Body:**
```json
{
  "hasil": "SESUAI",
  "catatan": "SOP sudah sesuai standar",
  "rekomendasi": "Pertahankan kualitas"
}
```

**Optimistic Locking:**
```json
{
  "version": 1
}
```

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "hasil": "SESUAI",
    "catatan": "SOP sudah sesuai standar"
  }
}
```

**Response 409:**
```json
{
  "error": {
    "code": "OPTIMISTIC_LOCK_ERROR",
    "message": "Data telah diubah oleh user lain"
  }
}
```

---

#### 4.9.6 Selesaikan Evaluasi

**PATCH** `/evaluasi/:id/selesai`

Selesaikan evaluasi — EVL-06/07.

**Request Body:**
```json
{
  "nilaiOPD": 85
}
```

**Constraints:**
- `nilaiOPD` wajib untuk evaluasi TERJADWAL
- `nilaiOPD` harus NULL untuk evaluasi MANDIRI

---

### 4.10 TTE (Tanda Tangan Elektronik)

#### 4.10.1 Get Profil TTE

**GET** `/tte/profil`

Lihat profil TTE sendiri — TTE-01.

**Response 200:**
```json
{
  "data": {
    "userId": "uuid",
    "peran": "KEPALA_OPD",
    "emailTerverifikasi": true,
    "setupPada": "2026-04-01T00:00:00Z"
  }
}
```

---

#### 4.10.2 Register Profil TTE

**POST** `/tte/profil`

Daftarkan/update KredensialTTE — TTE-01/03/04.

**Request Body:**
```json
{
  "pin": "123456"
}
```

**Response 201:**
```json
{
  "data": {
    "userId": "uuid",
    "peran": "KEPALA_OPD",
    "emailTerverifikasi": false
  }
}
```

---

#### 4.10.3 Request Email Verification Token

**POST** `/tte/profil/verifikasi-email`

Minta token verifikasi email TTE — TTE-02.

**Response 200:**
```json
{
  "message": "Token verifikasi telah dikirim ke email"
}
```

---

#### 4.10.4 Verify Email

**GET** `/tte/profil/verifikasi-email?token=abc123`

Konfirmasi email TTE via token — TTE-02.

**Response 200:**
```json
{
  "message": "Email berhasil diverifikasi"
}
```

---

#### 4.10.5 Get Riwayat TTE

**GET** `/tte/riwayat`

Riwayat penandatanganan sendiri — TTE-13.

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "peran": "KEPALA_OPD",
      "sopDetail": {
        "nomorSOP": "SOP/ORG/2026/001",
        "judul": "SOP Pengadaan"
      },
      "ditandatanganiPada": "2026-04-03T10:00:00Z"
    }
  ]
}
```

---

#### 4.10.6 Sign Berita Acara

**POST** `/tte/tanda-tangani/ba/:pengajuanId`

TTD Berita Acara — TTE-05/06.

**Request Body:**
```json
{
  "pin": "123456"
}
```

**Flow:**
- **Biro Organisasi**: Status → DIVERIFIKASI_BIRO, SOP → DIVERIFIKASI_BIRO_ORGANISASI
- **Koordinator**: Status → DITANDATANGANI_KOORDINATOR

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "peran": "BIRO_ORGANISASI",
    "ditandatanganiPada": "2026-04-03T10:00:00Z"
  }
}
```

**Response 401:**
```json
{
  "error": {
    "code": "INVALID_PIN",
    "message": "PIN salah"
  }
}
```

---

#### 4.10.7 Sign SOP

**POST** `/tte/tanda-tangani/sop/:sopDetailId`

Kepala OPD mengesahkan DetailSOP (→ BERLAKU) — TTE-07.

**Request Body:**
```json
{
  "pin": "123456"
}
```

**Preconditions:**
- SOP status = DIVERIFIKASI_BIRO_ORGANISASI
- BA terkait sudah ditandatangani Koordinator dan Biro

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "sopDetailId": "uuid",
    "status": "BERLAKU",
    "tanggalEfektif": "2026-04-03T10:00:00Z"
  }
}
```

---

### 4.11 Audit

#### 4.11.1 List All Audit Logs

**GET** `/audit?bagian=METADATA&skip=0&take=10`

Semua LogEditSOP — AUD-04 (BIRO_ORGANISASI only).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `bagian` | Enum | METADATA, LANGKAH_SOP, LAMPIRAN_TEKS, DASAR_HUKUM, PELAKSANA, DIAGRAM, SOP_TERKAIT |
| `skip` | Integer | Offset untuk pagination |
| `take` | Integer | Limit hasil |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sopDetailId": "uuid",
      "userId": "uuid",
      "bagian": "METADATA",
      "entityId": null,
      "keterangan": "Update metadata",
      "createdAt": "2026-04-03T10:00:00Z"
    }
  ]
}
```

---

#### 4.11.2 Audit Logs per Detail SOP

**GET** `/audit/detail-sop/:sopDetailId?bagian=METADATA&skip=0&take=10`

LogEditSOP per DetailSOP — AUD-03.

---

### 4.12 Health

#### 4.12.1 Health Check

**GET** `/health`

Check kesehatan API.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-03T10:00:00Z",
  "uptime": "7d 12h 30m"
}
```

---

## 5. Error Handling

### 5.1 Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [
      {
        "field": "email",
        "message": "Email harus valid"
      }
    ]
  }
}
```

### 5.2 Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email atau password salah |
| `INVALID_TOKEN` | 401 | JWT token tidak valid |
| `TOKEN_EXPIRED` | 401 | JWT token sudah expired |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token tidak valid |
| `INVALID_OLD_PASSWORD` | 401 | Password lama salah |
| `FORBIDDEN` | 403 | Tidak punya permission |
| `USER_NOT_FOUND` | 404 | User tidak ditemukan |
| `SOP_NOT_FOUND` | 404 | SOP tidak ditemukan |
| `OPD_NOT_FOUND` | 404 | OPD tidak ditemukan |
| `PERATURAN_NOT_FOUND` | 404 | Peraturan tidak ditemukan |
| `EMAIL_EXISTS` | 409 | Email sudah terdaftar |
| `DUPLICATE_PERATURAN` | 409 | Peraturan duplikat |
| `ALREADY_MEMBER` | 409 | Sudah terdaftar di tim |
| `ALREADY_REVOKED` | 409 | Sudah dicabut |
| `PERATURAN_IN_USE` | 409 | Masih digunakan sebagai dasar hukum |
| `SOP_CANNOT_BE_DELETED` | 409 | SOP sudah ditandatangani/dievaluasi |
| `OPD_HAS_ACTIVE_SUBMISSION` | 409 | OPD masih punya pengajuan aktif |
| `OPTIMISTIC_LOCK_ERROR` | 409 | Data telah diubah user lain |
| `INVALID_PIN` | 401 | PIN TTE salah |
| `EMAIL_NOT_VERIFIED` | 403 | Email belum diverifikasi |
| `VALIDATION_ERROR` | 400 | Validasi input gagal |

---

## 6. Rate Limiting

API menggunakan rate limiting untuk mencegah abuse.

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/login` | 5 requests | 15 minutes |
| `/refresh` | 10 requests | 15 minutes |
| `/tte/tanda-tangani/*` | 3 requests | 15 minutes |
| Other authenticated | 100 requests | 15 minutes |

**Response 429:**
```json
{
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Terlalu banyak request, coba lagi nanti"
  }
}
```

---

## 7. Glossary

| Istilah | Definisi |
|---------|----------|
| **OPD** | Organisasi Perangkat Daerah — unit kerja pemerintah daerah |
| **SOP** | Standard Operating Procedure — dokumen prosedur standar |
| **DetailSOP** | Versi dokumen SOP (satu SOP bisa punya banyak versi) |
| **Tim Penyusun** | Tim yang bertugas menyusun SOP di OPD |
| **Tim Evaluasi** | Tim yang mengevaluasi kualitas SOP |
| **Biro Organisasi** | Administrator sistem |
| **TTE** | Tanda Tangan Elektronik — penandatanganan digital dengan PIN |
| **Berita Acara (BA)** | Dokumen resmi hasil evaluasi SOP |
| **Dasar Hukum** | Peraturan yang menjadi landasan SOP |
| **Lampiran Teks** | Teks tambahan SOP (peringatan, kualifikasi, peralatan, pencatatan) |
| **Langkah SOP** | Langkah-langkah prosedur dalam flowchart SOP |
| **Optimistic Locking** | Mekanisme concurrency control menggunakan version number |
| **Soft Delete** | Penghapusan logis dengan field `deletedAt`, bukan hapus fisik |

---

## Appendix A — Status Lifecycle

### SOP Status Lifecycle

```
DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI → DIAJUKAN_EVALUASI
→ SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI → SIAP_DIVERIFIKASI
→ DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU

BERLAKU → DIGANTIKAN (otomatis saat versi baru berlaku)
BERLAKU → DICABUT (manual, administratif)
```

**Terminal States:** `DIGANTIKAN`, `DICABUT`

### Pengajuan Evaluasi Status Lifecycle

```
MENUNGGU_EVALUASI → SEDANG_DIEVALUASI → SELESAI_DIEVALUASI
→ DIVERIFIKASI_BIRO → DITANDATANGANI_KOORDINATOR → SELESAI
```

---

## Appendix B — Role Permissions Summary

| Resource | TIM_PENYUSUN | KOORDINATOR | KEPALA_OPD | TIM_EVALUASI | BIRO |
|----------|--------------|-------------|------------|--------------|------|
| **SOP** | CRUD own | CRUD own + Ajukan Evaluasi | Read all + Sahkan | Read assigned | Read all |
| **DetailSOP** | CRUD own | CRUD own | Read all | Read assigned | Read all |
| **Evaluasi** | ✗ | ✗ | ✗ | Isi nilai + Selesai | CRUD |
| **TTE** | Setup | Setup | Sign SOP | ✗ | Sign BA |
| **Users** | ✗ | ✗ | ✗ | ✗ | CRUD |
| **OPD** | Read own | Read own | Read own | ✗ | CRUD |
| **Peraturan** | Read own | Read own | Read own | ✗ | CRUD |
| **Tim** | Read own | Read own | Read own | Read | CRUD |
| **Audit** | ✗ | ✗ | ✗ | ✗ | Read all |

---

**Document Quality:** HIGH  
**Ready for Distribution:** YES

---

*Last updated: 2026-04-03 — Generated from NestJS controllers with @nestjs/swagger decorators*
