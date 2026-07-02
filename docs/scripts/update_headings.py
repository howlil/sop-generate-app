import re

path = r'c:\Users\howlil\Documents\tugas-akhir\codingan\docs\arsitektur-sistem.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('## 2. Arsitektur Backend', '## 5.1.2 Implementasi Pengkodean Backend\n\n### 5.1.2.1 Arsitektur Backend')
content = re.sub(r'### 2\.\d+ ', '#### ', content)

backend_code = """
### 5.1.2.2 Potongan Kode

Berikut adalah representasi potongan kode dari controller dan service yang menunjukkan bagaimana request HTTP diterima dan diteruskan ke logika aplikasi menggunakan kerangka kerja NestJS:

```typescript
// src/modules/sop-catalog/sop-catalog.controller.ts
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

```typescript
// src/modules/sop-catalog/sop-catalog.service.ts
@Injectable()
export class SopCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: UserPayload) {
    // Membatasi akses SOP berdasarkan OPD pengguna kecuali evaluator
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

## 5.1.3 Implementasi Pengkodean Frontend"""

content = content.replace('## 3. Arsitektur Frontend', backend_code)

content = content.replace('Frontend sistem dibangun menggunakan React', '### 5.1.3.1 Arsitektur Frontend\n\nFrontend sistem dibangun menggunakan React')
content = re.sub(r'### 3\.\d+ ', '#### ', content)

frontend_code = """
### 5.1.3.2 Potongan Kode

Berikut adalah representasi potongan kode konfigurasi routing dengan `TanStack Router` dan pemanggilan data menggunakan `TanStack Query` yang menggambarkan arsitektur sisi klien dalam mengatur state dan koneksi API:

```tsx
// client/src/routes/penyusun/sop.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

export const Route = createFileRoute('/penyusun/sop')({
  component: SopListPage,
  beforeLoad: ({ context }) => {
    // Proteksi rute berbasis peran di sisi klien
    if (!context.auth.roles.includes('PENYUSUN')) {
      throw redirect({ to: '/unauthorized' });
    }
  },
});

function SopListPage() {
  // Pengambilan data menggunakan TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['sop-list'],
    queryFn: () => apiClient.get('/api/v1/sop').then(res => res.json()),
  });

  if (isLoading) return <div>Memuat data...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Daftar SOP</h1>
      {/* Komponen penyajian data */}
      <DataTable data={data} columns={sopColumns} />
    </div>
  );
}
```

## 4. Alur Data Sistem"""

content = content.replace('## 4. Alur Data Sistem', frontend_code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Selesai mengupdate file arsitektur-sistem.md")
