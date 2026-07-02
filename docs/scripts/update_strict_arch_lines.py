path = r'c:\Users\howlil\Documents\tugas-akhir\codingan\docs\arsitektur-sistem.md'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = """## 5.1.2 Implementasi Pengkodean Backend

Backend diimplementasikan menggunakan arsitektur berlapis (*layered architecture*) untuk memisahkan tanggung jawab antarbagian sistem, sehingga proses pengelolaan titik akhir API (*endpoint*), validasi, logika bisnis, dan akses data dapat dikelola secara lebih terstruktur. Pemisahan ini memastikan bahwa sistem memiliki tingkat kohesi yang tinggi dan ketergantungan yang rendah (*high cohesion and loose coupling*), yang mempermudah pemeliharaan sistem. Sistem ini dikembangkan menggunakan kerangka kerja *NestJS* yang secara bawaan mendukung pola injeksi dependensi (*dependency injection*) dan pembagian arsitektur berbasis modul.

### 5.1.2.1 Arsitektur Backend

Berbeda dengan pola pengembangan tradisional yang sering memisahkan *route* sebagai lapisan mandiri, *NestJS* mengintegrasikan pendefinisian rute di dalam *Controller* menggunakan dekorator. Secara keseluruhan, arsitektur *backend* pada sistem ini terdiri dari beberapa lapisan utama:

a. **Module Layer**: Lapisan ini berfungsi mengelompokkan komponen-komponen (seperti *controller*, *service*, dan *provider*) yang memiliki kesamaan domain fungsional menjadi satu kesatuan. Pengelompokan ini mempermudah pengelolaan dependensi.
b. **Controller Layer**: Lapisan ini bertugas menerima permintaan HTTP dari antarmuka pengguna, mendeklarasikan *endpoint* rute melalui dekorator (seperti `@Get`, `@Post`), dan mengekstrak parameter dari permintaan. Lapisan ini juga mengamankan sistem melalui *RolesGuard* yang membatasi akses peran (seperti PJ Evaluator atau Penyusun) dan menggunakan autentikasi *JSON Web Token* (JWT). *Controller* tidak memuat logika bisnis rumit; tugas utamanya adalah mengarahkan permintaan ke *Service Layer*.
c. **DTO & Validation Pipe Layer**: Sebelum permintaan masuk ke proses lebih lanjut, data divalidasi oleh lapisan ini. Lapisan ini menggunakan *Data Transfer Object* (DTO) untuk memvalidasi kelengkapan data masuk dan memastikan struktur input sesuai standar (misalnya validasi PIN TTE atau kelengkapan data dokumen SOP).
d. **Service Layer**: Lapisan ini menjadi pusat logika bisnis aplikasi. Segala aturan komputasi, pengecekan kelayakan akses berdasarkan OPD, dan perubahan status dokumen (seperti transisi dari status *DRAFT* menjadi *SEDANG_DIEVALUASI*) dieksekusi di sini. Hal ini memastikan konsistensi logika sebelum disimpan.
e. **Repository Layer (Prisma Service)**: Lapisan ini bertanggung jawab mengabstraksi operasi komunikasi basis data menggunakan *Prisma ORM*. Pemisahan ini memberikan manfaat teknis yang signifikan; ketika terdapat perubahan skema tabel di masa depan, penyesuaian kueri cukup dilakukan pada lapisan *repository* ini tanpa merusak logika di lapisan *service* maupun *controller*.

### 5.1.2.2 Potongan Kode

Untuk merepresentasikan kompleksitas domain sistem, contoh berikut menampilkan potongan kode implementasi pada fitur pengajuan evaluasi SOP untuk setiap layernya.

**a. Layer Module (`pengajuan-evaluasi.module.ts`)**  
Modul ini mendaftarkan *controller* dan *service* secara bersamaan agar terhubung dalam ekosistem injeksi dependensi sistem.

```typescript
@Module({
  controllers: [PengajuanEvaluasiController],
  providers: [PengajuanEvaluasiService, PrismaService],
})
export class PengajuanEvaluasiModule {}
```

**b. Layer Controller (`pengajuan-evaluasi.controller.ts`)**  
*Controller* berfungsi murni sebagai pintu gerbang (*endpoint*) yang divalidasi dengan aturan peran (hanya *PJ Penyusun*).

```typescript
@Controller('pengajuan-evaluasi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PengajuanEvaluasiController {
  constructor(private readonly pengajuanService: PengajuanEvaluasiService) {}

  @Post()
  @Roles(Role.PJ_PENYUSUN)
  async submitEvaluasi(@Body() dto: CreatePengajuanDto, @Req() req) {
    return this.pengajuanService.submit(dto, req.user);
  }
}
```

**c. Layer DTO & Validation (`create-pengajuan.dto.ts`)**  
Lapisan validasi memastikan bahwa struktur *array* `sopIds` benar-benar dikirimkan klien sebelum menyentuh logika *service*.

```typescript
export class CreatePengajuanDto {
  @IsArray()
  @IsNotEmpty()
  sopIds: string[];
}
```

**d. Layer Service (`pengajuan-evaluasi.service.ts`)**  
Logika bisnis utama berjalan di sini, melakukan validasi OPD, memastikan tidak ada pengajuan lain yang berjalan, serta memproses transaksi perubahan status.

```typescript
@Injectable()
export class PengajuanEvaluasiService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(dto: CreatePengajuanDto, user: UserPayload) {
    const hasActive = await this.prisma.pengajuanEvaluasi.findFirst({
      where: { opdId: user.opdId, status: 'AKTIF' }
    });
    if (hasActive) throw new ConflictException('Masih ada pengajuan aktif.');

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

**e. Layer Repository (`prisma.service.ts`)**  
Lapisan abstraksi basis data yang memusatkan koneksi basis data ORM MariaDB agar kueri terisolasi dengan aman.

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

## 5.1.3 Implementasi Pengkodean Frontend

Implementasi antarmuka klien menggunakan *React* berpedoman pada pola aplikasi satu halaman (*Single Page Application*). Sistem ini mengatur pembagian kode ke dalam hierarki komponen yang reaktif terhadap perubahan data.

### 5.1.3.1 Arsitektur Frontend

Untuk mendukung proses kerja pengelolaan SOP yang kompleks dan saling terkait, aplikasi *frontend* dibangun dengan pemisahan lapisan fungsional sebagai berikut:

a. **Router & Pages Layer**: Menggunakan `TanStack Router` untuk memetakan URL ke halaman fisik (*page*). Lapisan ini bertugas melakukan validasi akses berbasis peran (*Route Guard*) sebelum halaman dimuat, misalnya menolak akses pengunjung yang tidak memiliki hak pada halaman evaluator.
b. **State & Hooks Layer**: Lapisan ini bertugas mengelola proses pengambilan data secara asinkron dari *backend* dan menyimpannya ke memori peramban (*caching*). Dengan *custom hooks* berbasis `TanStack Query`, halaman antarmuka dipisahkan dari kompleksitas siklus data (*loading*, *error*, dan mutasi perubahan data).
c. **API Service Layer**: Lapisan ini mengabstraksi komunikasi antarmuka jaringan. Segala permintaan *fetch* ke *backend* melewati abstraksi ini agar pengaturan *header*, kredensial sesi *cookie* JWT, serta mekanisme pengulangan otomatis saat gagal, dapat dikelola dari satu tempat.
d. **Component Layer**: Berisi entitas visual antarmuka pengguna yang bisa digunakan ulang (*reusable UI*). Komponen-komponen ini bersifat murni hanya menyajikan data yang diterimanya dari halaman (*props*) tanpa harus melakukan kueri secara independen, seperti tabel data atau penampil formulir.

### 5.1.3.2 Potongan Kode

Contoh berikut menunjukkan sinkronisasi antarlapisan *frontend* untuk menampilkan daftar evaluasi SOP oleh aktor Evaluator.

**a. Layer Router & Pages (`routes/evaluator/SopEvaluasiList.tsx`)**  
Lapisan *router* dan *page* mengikat komponen antarmuka menjadi sebuah halaman utuh yang dilindungi peran evaluator.

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEvaluasiListQuery } from '@/hooks/query/useEvaluasiList';
import DataTable from '@/components/shared/DataTable';

export const Route = createFileRoute('/evaluator/sop')({
  component: SopEvaluasiList,
  beforeLoad: ({ context }) => {
    if (!context.auth.roles.includes('EVALUATOR')) throw redirect({ to: '/unauthorized' });
  },
});

function SopEvaluasiList() {
  const { data, isLoading } = useEvaluasiListQuery();

  if (isLoading) return <div>Memuat...</div>;
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">SOP Menunggu Evaluasi</h1>
      <DataTable data={data} columns={SopColumns} />
    </div>
  );
}
```

**b. Layer State & Hooks (`useEvaluasiList.ts`)**  
*Hook* khusus untuk memanggil lapisan *service*, memproses *loading state*, dan mengelola *cache* antarmuka.

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchEvaluasiList } from '@/services/evaluasi.service';

export function useEvaluasiListQuery() {
  return useQuery({
    queryKey: ['evaluasi-list'],
    queryFn: fetchEvaluasiList,
  });
}
```

**c. Layer API Service (`evaluasi.service.ts` & `apiClient.ts`)**  
Abstraksi untuk komunikasi jaringan ke *backend* menggunakan klien HTTP terpusat.

```typescript
import { apiClient } from '@/utils/apiClient';

export async function fetchEvaluasiList() {
  const response = await apiClient.get('/api/v1/pengajuan-evaluasi');
  return response.json();
}
```

**d. Layer Component (`DataTable.tsx`)**  
Komponen presentasional yang menyajikan properti data dari halaman ke dalam bentuk antarmuka visual tabel.

```tsx
export default function DataTable({ data, columns }) {
  return (
    <table className="min-w-full border">
      <thead>
        <tr>{columns.map(col => <th key={col.id}>{col.title}</th>)}</tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            {columns.map(col => <td key={col.id}>{row[col.id]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```
\n"""

new_lines = lines[:134] + [new_content] + lines[260:]
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Berhasil mengupdate arsitektur-sistem.md dengan baris eksak")
