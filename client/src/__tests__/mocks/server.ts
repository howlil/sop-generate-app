import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock handlers for API endpoints
export const handlers = [
  // Health check
  http.get('/api/v1/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Login endpoint
  http.post('/api/v1/login', async ({ request }) => {
    const body = await request.json() as { email: string; kataSandi: string };
    
    // Mock different users based on email
    const mockUsers: Record<string, any> = {
      'tim-penyusun@example.com': {
        id: 'user-1',
        email: 'tim-penyusun@example.com',
        nama: 'Tim Penyusun Test',
        peran: 'TIM_PENYUSUN',
        opdId: 'opd-1',
        nip: '123456789',
        jabatan: 'Staff',
      },
      'biro@example.com': {
        id: 'user-2',
        email: 'biro@example.com',
        nama: 'Biro Organisasi Test',
        peran: 'BIRO_ORGANISASI',
        opdId: null,
        nip: '987654321',
        jabatan: 'Kepala Biro',
      },
      'evaluator@example.com': {
        id: 'user-3',
        email: 'evaluator@example.com',
        nama: 'Tim Evaluasi Test',
        peran: 'TIM_EVALUASI',
        opdId: null,
        nip: '456789123',
        jabatan: 'Evaluator',
      },
      'kepala-opd@example.com': {
        id: 'user-4',
        email: 'kepala-opd@example.com',
        nama: 'Kepala OPD Test',
        peran: 'KEPALA_OPD',
        opdId: 'opd-1',
        nip: '321654987',
        jabatan: 'Kepala Dinas',
      },
    };

    const user = mockUsers[body.email];
    if (!user || body.kataSandi !== 'password123') {
      return HttpResponse.json(
        { error: 'Email atau kata sandi salah' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      accessToken: 'mock-jwt-token',
      tokenType: 'Bearer',
      user,
    });
  }),

  // SOP endpoints
  http.get('/api/v1/sop', () => {
    return HttpResponse.json([
      {
        id: 'sop-1',
        opdId: 'opd-1',
        judul: 'SOP Test 1',
        createdAt: '2026-04-01T00:00:00Z',
        updatedAt: '2026-04-01T00:00:00Z',
        totalVersi: 1,
        statusAktif: 'DRAFT',
      },
      {
        id: 'sop-2',
        opdId: 'opd-1',
        judul: 'SOP Test 2',
        createdAt: '2026-04-01T00:00:00Z',
        updatedAt: '2026-04-01T00:00:00Z',
        totalVersi: 1,
        statusAktif: 'BERLAKU',
      },
    ]);
  }),

  http.post('/api/v1/sop', async ({ request }) => {
    const body = await request.json() as { judul: string; opdId: string };
    return HttpResponse.json({
      id: 'sop-new',
      opdId: body.opdId,
      judul: body.judul,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalVersi: 1,
      statusAktif: 'DRAFT',
    }, { status: 201 });
  }),

  http.get('/api/v1/sop/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      opdId: 'opd-1',
      judul: `SOP ${id}`,
      createdAt: '2026-04-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z',
      totalVersi: 1,
      statusAktif: 'DRAFT',
    });
  }),

  // OPD endpoints
  http.get('/api/v1/opd', () => {
    return HttpResponse.json([
      {
        id: 'opd-1',
        nama: 'Dinas Pendidikan',
        createdAt: '2026-04-01T00:00:00Z',
        updatedAt: '2026-04-01T00:00:00Z',
      },
      {
        id: 'opd-2',
        nama: 'Dinas Kesehatan',
        createdAt: '2026-04-01T00:00:00Z',
        updatedAt: '2026-04-01T00:00:00Z',
      },
    ]);
  }),

  // Peraturan endpoints
  http.get('/api/v1/peraturan', () => {
    return HttpResponse.json([
      {
        id: 'peraturan-1',
        opdId: 'opd-1',
        namaPeraturan: 'Peraturan Test 1',
        nomor: '123',
        tahun: 2024,
        tentang: 'Test Regulation',
        status: 'BERLAKU',
        createdAt: '2026-04-01T00:00:00Z',
        updatedAt: '2026-04-01T00:00:00Z',
      },
    ]);
  }),
];

export const server = setupServer(...handlers);
