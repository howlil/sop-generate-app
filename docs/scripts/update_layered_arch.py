import re

path = r'c:\Users\howlil\Documents\tugas-akhir\codingan\docs\arsitektur-sistem.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'## 5\.1\.2 Implementasi Pengkodean Backend.*?## 4\. Alur Data Sistem', re.DOTALL)

replacement = """## 5.1.2 Implementasi Pengkodean Backend (NestJS)

Backend sistem dibangun menggunakan kerangka kerja NestJS. Kerangka kerja ini mengutamakan struktur kode yang rapi, mudah dipelihara, dan mudah diuji dengan menerapkan pembagian tanggung jawab secara tegas pada setiap lapisannya melalui metode *Dependency Injection*.

### 5.1.2.1 Arsitektur Layer (Layered Architecture)

Alih-alih menumpuk seluruh logika dalam satu file, backend dirancang menggunakan arsitektur berlapis yang memiliki tanggung jawab terpisah:

a. **Module Layer**: Mengelompokkan komponen-komponen (controller, service, provider) yang memiliki kesamaan domain bisnis menjadi satu kesatuan (misalnya modul SOP, modul Evaluasi).
b. **Controller Layer**: Mendefinisikan endpoint API, menerima permintaan (request) HTTP dari klien, mengambil parameter, dan meneruskan proses ke lapisan service. Hasil akhirnya dikembalikan sebagai respons HTTP.
c. **Service Layer**: Menjalankan aturan bisnis utama (business logic), proses komputasi, dan pengaturan transisi status dokumen. Lapisan ini menjadi pusat logika aplikasi yang memanggil repository.
d. **Repository Layer**: Mengabstraksi akses komunikasi data menggunakan Prisma ORM. Lapisan ini memisahkan query database secara langsung dari lapisan logika bisnis, memastikan seluruh operasi persistensi terpusat.
e. **Security & Validation Layer**: Menggunakan *Guard* (seperti `JwtAuthGuard`, `RolesGuard`) untuk mengotentikasi dan mengotorisasi peran pengguna. Serta menggunakan *Pipe* dan *DTO* (Data Transfer Object) untuk memvalidasi skema data masukan sebelum diproses oleh controller.

### 5.1.2.2 Struktur Direktori Backend

Struktur direktori utama pada proyek backend dikelompokkan secara terstruktur berdasarkan domain (*domain-driven*). Struktur direktori utama backend ditampilkan pada Gambar 5.1 berikut.

Gambar 5.1 Struktur Direktori Backend

### 5.1.2.3 Potongan Kode Implementasi (Code Snippets)

Contoh berikut menunjukkan alur manajemen katalog SOP. Contoh ini memperlihatkan bagaimana setiap lapisan menangani tugasnya masing-masing secara independen tanpa mencampuradukkan logika bisnis.

a. **Layer Controller (`sop-catalog.controller.ts`)**  
Layer ini bertugas mendaftarkan endpoint, menerapkan pengamanan berbasis peran melalui Guard, lalu memanggil service tanpa memuat logika bisnis rumit di dalamnya. Implementasi layer controller ditampilkan pada Gambar 5.2 berikut.

```typescript
// Gambar 5.2 Potongan kode Controller Backend
@Controller('sop')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SopCatalogController {
  constructor(private readonly sopCatalogService: SopCatalogService) {}

  @Get()
  @Roles(Role.PENYUSUN, Role.PJ_PENYUSUN, Role.EVALUATOR, Role.PJ_EVALUATOR, Role.KEPALA_OPD)
  async getSopList(@Req() req) {
    return this.sopCatalogService.findAll(req.user);
  }
}
```

b. **Layer Service (`sop-catalog.service.ts`)**  
Service bertugas memproses data yang sudah lolos keamanan, memeriksa kondisi organisasi pengguna, dan memanggil repository. Controller tidak ikut campur dalam penentuan *query* di sini. Implementasi layer service ditampilkan pada Gambar 5.3 berikut.

```typescript
// Gambar 5.3 Potongan kode Service Backend
@Injectable()
export class SopCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: UserPayload) {
    // Membatasi akses membaca SOP hanya untuk OPD masing-masing, kecuali peran Evaluator
    const whereClause = user.role === Role.EVALUATOR || user.role === Role.PJ_EVALUATOR 
      ? {} 
      : { opdId: user.opdId };

    return this.prisma.sOP.findMany({
      where: whereClause,
      include: { detailSOP: true },
    });
  }
}
```

## 5.1.3 Implementasi Pengkodean Frontend (React & TanStack)

Frontend dibangun dengan React, TypeScript, dan dikelola menggunakan ekosistem TanStack (Router & Query) serta Vite. Kode pada klien dirancang untuk menjaga status (*state*) yang sinkron dengan server serta menyajikan navigasi antar halaman secara mulus sebagai *Single Page Application*.

### 5.1.3.1 Arsitektur Layer

Untuk menjaga keterbacaan kode, frontend dipisahkan menjadi beberapa layer dengan fokus masing-masing:

a. **Router Layer**: Menggunakan `TanStack Router` untuk mendefinisikan rute halaman berbasis peran, melakukan validasi akses (*Route Guard*) sebelum halaman dimuat, serta menangani pengalihan rute (*redirect*).
b. **API Client Layer**: Mengabstraksi komunikasi HTTP untuk memberikan standarisasi header permintaan, pengaturan cookie otentikasi (*credentials*), dan menangani error secara terpusat.
c. **State & Query Layer**: Menggunakan `TanStack Query` untuk pengambilan data (*fetching*), *caching*, dan mutasi (pengiriman formulir), serta `Zustand` untuk mengelola data status global seperti profil sesi pengguna.
d. **Component Layer**: Mengelola tampilan antarmuka (UI). Lapisan ini dibagi kembali menjadi *shared components* (komponen umum seperti tombol, form) dan *domain components* (komponen bisnis khusus untuk SOP dan evaluasi).

### 5.1.3.2 Struktur Direktori Frontend

Struktur proyek frontend diatur berbasis fitur dan lapisan fungsional aplikasi web. Struktur direktori utamanya ditampilkan pada Gambar 5.4 berikut.

Gambar 5.4 Struktur Direktori Frontend

### 5.1.3.3 Potongan Kode Implementasi (Code Snippets)

Contoh berikut menunjukkan bagaimana lapisan-lapisan di frontend menyajikan halaman yang terproteksi serta melakukan pemanggilan API secara asinkron tanpa merusak struktur komponen UI.

a. **Layer Router & State Query (`routes/penyusun/sop.tsx`)**  
Layer ini bertugas memastikan hanya aktor tertentu (misalnya `PENYUSUN`) yang dapat membuka halaman ini di browser. Apabila diizinkan, halaman memanggil *hook* untuk mengambil data melalui API Client Layer. Implementasi rute dan pengambilan data ditampilkan pada Gambar 5.5 berikut.

```tsx
// Gambar 5.5 Potongan kode Konfigurasi Router dan Pengambilan Data
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

export const Route = createFileRoute('/penyusun/sop')({
  component: SopListPage,
  beforeLoad: ({ context }) => {
    // Membatasi akses halaman hanya untuk penyusun
    if (!context.auth.roles.includes('PENYUSUN')) {
      throw redirect({ to: '/unauthorized' });
    }
  },
});

function SopListPage() {
  // Layer State & Query mengambil data
  const { data, isLoading } = useQuery({
    queryKey: ['sop-list'],
    queryFn: () => apiClient.get('/api/v1/sop').then(res => res.json()),
  });

  if (isLoading) return <div>Memuat data...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Daftar SOP</h1>
      {/* Layer Component */}
      <DataTable data={data} columns={sopColumns} />
    </div>
  );
}
```

## 4. Alur Data Sistem"""

new_content = pattern.sub(replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Berhasil mengupdate arsitektur-sistem.md")
