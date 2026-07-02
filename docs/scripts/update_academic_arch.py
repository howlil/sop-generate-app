import re

path = r'c:\Users\howlil\Documents\tugas-akhir\codingan\docs\arsitektur-sistem.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'## 5\.1\.2 Implementasi Pengkodean Backend.*?## 4\. Alur Data Sistem', re.DOTALL)

replacement = """## 5.1.2 Implementasi Pengkodean Backend (NestJS)

Backend diimplementasikan menggunakan arsitektur berlapis (*layered architecture*) untuk memisahkan tanggung jawab antarbagian sistem, sehingga proses pengelolaan titik akhir API (*endpoint*), validasi, logika bisnis, dan akses data dapat dikelola secara lebih terstruktur. Pemisahan ini memastikan bahwa sistem memiliki tingkat kohesi yang tinggi dan ketergantungan yang rendah (*high cohesion and loose coupling*), yang pada akhirnya mempermudah pemeliharaan sistem di masa mendatang.

Sistem ini dikembangkan menggunakan kerangka kerja *NestJS* yang secara bawaan mendukung pola injeksi dependensi (*dependency injection*) dan pembagian arsitektur berbasis modul.

### 5.1.2.1 Arsitektur Layer (*Layered Architecture*)

Berbeda dengan pola pengembangan *Express.js* tradisional yang sering memisahkan *route* sebagai lapisan mandiri, *NestJS* mengintegrasikan pendefinisian rute di dalam *Controller* menggunakan dekorator. Secara keseluruhan, arsitektur *backend* pada sistem ini terdiri dari beberapa lapisan utama:

a. **Module Layer**: Lapisan ini berfungsi mengelompokkan komponen-komponen (seperti *controller*, *service*, dan *provider*) yang memiliki kesamaan domain fungsional menjadi satu kesatuan. Contohnya adalah modul Katalog SOP, modul Evaluasi, dan modul Tanda Tangan Elektronik (TTE).
b. **Controller Layer**: Lapisan ini bertugas menerima permintaan HTTP dari antarmuka pengguna, mendeklarasikan *endpoint* rute melalui dekorator (seperti `@Get`, `@Post`), dan mengekstrak parameter dari permintaan. *Controller* tidak memuat logika bisnis yang rumit; tugas utamanya adalah mengarahkan permintaan ke *Service Layer* dan mengembalikan respons HTTP.
c. **DTO & Validation Pipe Layer**: Sebelum permintaan masuk ke proses lebih lanjut, data divalidasi oleh lapisan ini. Misalnya, pada fitur penyusunan SOP, lapisan ini akan memvalidasi kelengkapan dokumen SOP, memastikan struktur input sesuai, atau pada fitur TTE, memastikan bahwa PIN TTE yang diinput berformat valid sebelum dicocokkan di basis data.
d. **Service Layer**: Lapisan ini menjadi pusat logika bisnis aplikasi. Segala aturan komputasi, pengecekan kelayakan, dan perubahan status dokumen (seperti dari status *DRAFT* menjadi *SEDANG_DIEVALUASI* atau *BERLAKU*) dieksekusi di sini. Hal ini memastikan konsistensi transisi status sebelum disimpan ke basis data.
e. **Repository Layer (Prisma Service)**: Lapisan ini bertanggung jawab mengabstraksi semua operasi akses basis data menggunakan *Prisma ORM*. Pemisahan ini memberikan manfaat teknis yang signifikan; jika di masa mendatang terdapat perubahan skema tabel MariaDB, penyesuaian kueri cukup dilakukan pada lapisan *repository* tanpa mengganggu logika di lapisan *service* maupun *controller*.

### 5.1.2.2 Aspek Keamanan dan Otorisasi

Mengingat sistem melibatkan multiaktor dengan peran yang berbeda (PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, dan Penyusun), keamanan diimplementasikan secara berlapis. *Backend* menggunakan autentikasi *JSON Web Token* (JWT) yang disimpan di dalam *cookie* terproteksi. Otorisasi kemudian dilakukan melalui *RolesGuard* untuk membatasi akses setiap aktor sesuai haknya. Selain keamanan berbasis peran, sistem juga membatasi isolasi data berdasarkan OPD (*Organisasi Perangkat Daerah*); pengguna hanya dapat memanipulasi SOP yang berada di bawah wewenang instansinya. Pada fitur Tanda Tangan Elektronik, pengamanan diperketat dengan validasi PIN TTE yang di-*hash* menggunakan algoritma *bcrypt*.

### 5.1.2.3 Struktur Direktori Backend

Struktur direktori utama pada proyek *backend* dikelompokkan secara terstruktur berdasarkan modul domain bisnis untuk mendukung skalabilitas sistem. Struktur direktori ini dapat dilihat pada Gambar 5.1 berikut.

Gambar 5.1 Struktur Direktori Backend

### 5.1.2.4 Potongan Kode Implementasi (*Code Snippets*)

Untuk merepresentasikan kompleksitas domain sistem, contoh berikut menunjukkan alur fungsional pada fitur pengajuan evaluasi SOP, yang melibatkan beberapa validasi bisnis.

**a. Layer Controller (`pengajuan-evaluasi.controller.ts`)**  
*Controller* ini bertugas menerima permintaan untuk mengajukan dokumen SOP ke tahap evaluasi. Lapisan ini memvalidasi hak akses (hanya *PJ Penyusun*), lalu memanggil metode dari *service*.

```typescript
// Gambar 5.2 Potongan kode Controller Pengajuan Evaluasi
@Controller('pengajuan-evaluasi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PengajuanEvaluasiController {
  constructor(private readonly pengajuanService: PengajuanEvaluasiService) {}

  @Post()
  @Roles(Role.PJ_PENYUSUN)
  async submitEvaluasi(@Body() dto: CreatePengajuanDto, @Req() req) {
    // Meneruskan proses bisnis kepada layer service
    return this.pengajuanService.submit(dto, req.user);
  }
}
```

Analisis: Pada Gambar 5.2, terlihat bahwa *controller* berfungsi murni sebagai pintu gerbang. Input berupa *DTO* divalidasi secara otomatis oleh *Validation Pipe*. Proses utama tidak dieksekusi di sini, melainkan dilimpahkan kepada `pengajuanService`.

**b. Layer Service (`pengajuan-evaluasi.service.ts`)**  
Di sinilah logika pengajuan evaluasi berada. *Service* mengecek apakah masih ada pengajuan aktif di OPD tersebut, memvalidasi apakah dokumen SOP berstatus yang tepat, lalu mengubah statusnya menjadi *SEDANG_DIEVALUASI*.

```typescript
// Gambar 5.3 Potongan kode Service Pengajuan Evaluasi
@Injectable()
export class PengajuanEvaluasiService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(dto: CreatePengajuanDto, user: UserPayload) {
    // Pengecekan logika bisnis: validasi ketersediaan pengajuan aktif OPD
    const hasActive = await this.prisma.pengajuanEvaluasi.findFirst({
      where: { opdId: user.opdId, status: 'AKTIF' }
    });
    if (hasActive) throw new ConflictException('Terdapat pengajuan evaluasi yang masih aktif.');

    // Transisi status: mengubah status SOP dari DRAFT ke SEDANG_DIEVALUASI
    return this.prisma.$transaction(async (tx) => {
      const pengajuan = await tx.pengajuanEvaluasi.create({
        data: { opdId: user.opdId, status: 'AKTIF' }
      });
      await tx.detailSOP.updateMany({
        where: { id: { in: dto.sopIds }, status: 'DRAFT' },
        data: { status: 'SEDANG_DIEVALUASI' }
      });
      return pengajuan;
    });
  }
}
```

Analisis: Pada Gambar 5.3, kode menunjukkan bagaimana sistem mengendalikan integritas data. Lapisan ini memastikan aturan transisi status dipenuhi dan menjamin bahwa operasi pencatatan (*insert*) pengajuan evaluasi dan pembaharuan (*update*) status dokumen dijalankan dalam satu blok transaksi (*database transaction*). Dengan ini, jika salah satu operasi gagal, seluruh transisi dibatalkan.

## 5.1.3 Implementasi Pengkodean Frontend (React & TanStack)

Implementasi antarmuka klien menggunakan *React* berpedoman pada pola pengembangan aplikasi satu halaman (*Single Page Application*). Sistem ini mengatur pembagian kode ke dalam hierarki komponen yang bersifat reaktif terhadap perubahan data. 

### 5.1.3.1 Arsitektur Layer Klien

Untuk mendukung proses kerja pengelolaan SOP yang kompleks, aplikasi *frontend* dibangun dengan pemisahan sebagai berikut:

a. **Router & Pages Layer**: Menggunakan `TanStack Router` untuk memetakan URL ke halaman tertentu berdasarkan peran (*role-based routing*). Misalnya, halaman manajemen evaluator hanya dapat diakses oleh *PJ Evaluator*, sedangkan halaman arsip publik dapat diakses masyarakat umum tanpa autentikasi.
b. **State & Hooks Layer**: Digunakan untuk mengelola sinkronisasi data dengan *backend*. Menggunakan *custom hooks* berbasis `TanStack Query`, sistem melakukan proses pengambilan data secara asinkron (*data fetching*), penyimpanan sementara di peramban (*caching*), serta mengirimkan perintah perubahan data (mutasi). Sesi pengguna disimpan secara lokal melalui `Zustand`.
c. **API Service Layer**: Lapisan abstraksi terpusat yang mengatur pemanggilan antarmuka HTTP menggunakan koneksi terautentikasi (meneruskan *cookie* JWT) kepada titik akhir API *backend*.
d. **Component Layer**: Entitas visual antarmuka pengguna yang bisa digunakan kembali (*reusable components*), seperti komponen tabel data, elemen formulir, serta penampil dokumen PDF SOP.

### 5.1.3.2 Struktur Direktori Frontend

Struktur direktori *frontend* disusun agar elemen-elemen generik dapat dipisahkan dari elemen spesifik domain. Tampilan strukturnya ditunjukkan pada Gambar 5.4 berikut.

Gambar 5.4 Struktur Direktori Frontend

### 5.1.3.3 Potongan Kode Implementasi (*Code Snippets*)

Untuk memperlihatkan keterhubungan antara *Pages*, *Hooks*, dan *Components*, berikut adalah implementasi halaman tabel evaluasi dokumen SOP yang diakses oleh aktor *Evaluator*.

**a. Halaman dan Penggunaan Hooks (`pages/evaluator/SopEvaluasiList.tsx`)**  
Lapisan ini mengonfigurasi halaman untuk membaca *state* yang diambil dari *server*, kemudian meneruskannya sebagai parameter (atau *props*) ke dalam komponen tampilan.

```tsx
// Gambar 5.5 Potongan kode Halaman Evaluasi SOP
import { useEvaluasiListQuery } from '@/hooks/query/useEvaluasiList';
import DataTable from '@/components/shared/DataTable';
import EvaluasiSopColumns from '@/components/domain/EvaluasiSopColumns';

export default function SopEvaluasiList() {
  // Layer State & Hooks: Memanggil API service untuk mendapatkan daftar SOP
  const { data, isLoading, error } = useEvaluasiListQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage text="Gagal memuat data evaluasi." />;

  return (
    <div className="evaluasi-container p-6">
      <h1 className="text-xl font-semibold mb-4">Daftar SOP Menunggu Evaluasi</h1>
      
      {/* Layer Component: Merender antarmuka data tabular */}
      <DataTable 
        data={data} 
        columns={EvaluasiSopColumns} 
      />
    </div>
  );
}
```

Analisis: Gambar 5.5 menjelaskan alur di mana halaman antarmuka mendelegasikan tugas pengambilan dan pengelolaan siklus data (*loading*, *error*, *success*) kepada *hook* fungsional `useEvaluasiListQuery`. Hal ini membebaskan komponen visual dari kode pemrograman asinkron yang rumit. Komponen tabel `DataTable` kemudian ditugaskan secara eksklusif untuk menangani proses penyajian (*rendering*) baris dokumen sesuai aturan kolom `EvaluasiSopColumns`, yang mengikat antarmuka secara erat dengan kebutuhan bisnis sistem evaluasi.

## 4. Alur Data Sistem"""

new_content = pattern.sub(replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Berhasil mengupdate arsitektur-sistem.md dengan konten akademik komprehensif")
