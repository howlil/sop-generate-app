const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');

const titleMap = new Map([
  ['toWibDateOnly', 'Pengujian fungsi toWibDateOnly'],
  ['RolesGuard', 'Pengujian RolesGuard'],
  ['pengguna-admin.util', 'Pengujian util pengguna admin'],
  ['rethrowPrismaUniqueViolation', 'Pengujian rethrowPrismaUniqueViolation'],
  ['resolveDeletedAtFromStatus', 'Pengujian resolveDeletedAtFromStatus'],
  ['assertAtLeastOneUpdateField', 'Pengujian assertAtLeastOneUpdateField'],
  ['assertEmailNipUniqueOnUpdate', 'Pengujian assertEmailNipUniqueOnUpdate'],
  ['extractDbInvariantMessage', 'Pengujian extractDbInvariantMessage'],
  ['displayStatusSop', 'Pengujian displayStatusSop'],
  ['displayStatusPengajuan', 'Pengujian displayStatusPengajuan'],
  ['displayHasilEvaluasi', 'Pengujian displayHasilEvaluasi'],
  ['displayTampilanAlur', 'Pengujian displayTampilanAlur'],
  ['mapStatusSopUntukPengajuan', 'Pengujian mapStatusSopUntukPengajuan'],
  ['AuthService', 'Pengujian AuthService'],
  ['resolveAccessTokenExpiry', 'Pengujian resolveAccessTokenExpiry'],
  ['buildClearAccessTokenCookieOptions', 'Pengujian buildClearAccessTokenCookieOptions'],
  ['EvaluatorService', 'Pengujian EvaluatorService'],
  ['KepalaOpdService', 'Pengujian KepalaOpdService'],
  ['OpdService', 'Pengujian OpdService'],
  ['UserOpdAccessService', 'Pengujian UserOpdAccessService'],
  ['PenggunaRepository.createPengguna', 'Pengujian PenggunaRepository.createPengguna'],
  ['PenyusunService', 'Pengujian PenyusunService'],
  ['PeraturanService', 'Pengujian PeraturanService'],
  ['EvaluasiGrafikService', 'Pengujian EvaluasiGrafikService'],
  ['EvaluasiNilaiService', 'Pengujian EvaluasiNilaiService'],
  ['isiNilai', 'Pengujian isi nilai'],
  ['tandaiTindakLanjutSelesai', 'Pengujian tandai tindak lanjut selesai'],
  ['assertBolehKirimUlangSetelahRevisi', 'Pengujian assertBolehKirimUlangSetelahRevisi'],
  ['PengajuanEvaluasiRepository', 'Pengujian PengajuanEvaluasiRepository'],
  ['PengajuanEvaluasiService', 'Pengujian PengajuanEvaluasiService'],
  ['PengajuanEvaluasiDetailService', 'Pengujian PengajuanEvaluasiDetailService'],
  ['EvaluasiUmpanBalikService', 'Pengujian EvaluasiUmpanBalikService'],
  ['EvaluasiWorkspaceService', 'Pengujian EvaluasiWorkspaceService'],
  ['SopCatalogMapper', 'Pengujian SopCatalogMapper'],
  ['SopCatalogRepository', 'Pengujian SopCatalogRepository'],
  ['SopCatalogService', 'Pengujian SopCatalogService'],
  ['updateSop', 'Pengujian update SOP'],
  ['transitionStatus', 'Pengujian transisi status'],
  ['ajukanEvaluasi', 'Pengujian ajukan evaluasi'],
  ['mulaiRevisiDariBerlaku', 'Pengujian mulai revisi dari SOP berlaku'],
  ['verifikasiRevisiSop', 'Pengujian verifikasi revisi SOP'],
  ['cabutSopBerlaku', 'Pengujian cabut SOP berlaku'],
  ['hapusVersiDraft', 'Pengujian hapus versi draft'],
  ['sop-completeness.validator', 'Pengujian validator kelengkapan SOP'],
  ['sop-status-policy', 'Pengujian kebijakan status SOP'],
  ['log-edit-session.helper', 'Pengujian helper sesi log edit'],
  ['translateField', 'Pengujian translateField'],
  ['buildLogSummary', 'Pengujian buildLogSummary'],
  ['appendOrCreateLogSession', 'Pengujian appendOrCreateLogSession'],
  ['diagram-edge-key.util', 'Pengujian util kunci edge diagram'],
  ['SopDiagramService', 'Pengujian SopDiagramService'],
  ['PelaksanaService', 'Pengujian PelaksanaService'],
  ['SopProsedurRepository.updateProsedurTransaction', 'Pengujian SopProsedurRepository.updateProsedurTransaction'],
  ['SopProsedurService', 'Pengujian SopProsedurService'],
  ['updateProsedur', 'Pengujian update prosedur'],
  ['SopPublicService', 'Pengujian SopPublicService'],
  ['pdf-signature-verification.util', 'Pengujian util verifikasi tanda tangan PDF'],
  ['TtePdfSigningService', 'Pengujian TtePdfSigningService'],
  ['tte-verifikasi-qr.util', 'Pengujian util verifikasi QR TTE'],
  ['normalizePublicVerifyBaseUrl', 'Pengujian normalizePublicVerifyBaseUrl'],
  ['buildTteQrVerificationUrl', 'Pengujian buildTteQrVerificationUrl'],
  ['buildTteQrPayload', 'Pengujian buildTteQrPayload'],
  ['TteRepository', 'Pengujian TteRepository'],
  ['TteService', 'Pengujian TteService'],
]);

const phraseMap = new Map([
  ['should_normalize_wib_instant_to_midnight_same_calendar_day', 'seharusnya menormalkan waktu WIB ke tengah malam pada tanggal kalender yang sama'],
  ['should_use_jakarta_calendar_day_when_utc_is_previous_day', 'seharusnya menggunakan tanggal kalender Jakarta ketika UTC masih hari sebelumnya'],
  ['should_throw_conflict_when_p2002', 'seharusnya melempar ConflictException ketika error Prisma P2002 terjadi'],
  ['should_not_throw_for_other_errors', 'seharusnya tidak melempar error untuk jenis error lain'],
  ['should_set_date_when_nonaktif', 'seharusnya mengisi tanggal ketika status nonaktif'],
  ['should_clear_when_aktif', 'seharusnya mengosongkan nilai ketika status aktif'],
  ['should_keep_current_when_status_undefined', 'seharusnya mempertahankan nilai saat ini ketika status tidak dikirim'],
  ['should_throw_when_all_fields_undefined', 'seharusnya melempar error ketika semua field update kosong'],
  ['should_throw_when_email_taken', 'seharusnya melempar error ketika email sudah digunakan'],
  ['should_throw_when_nip_taken', 'seharusnya melempar error ketika NIP sudah digunakan'],
  ['should_skip_check_when_value_unchanged', 'seharusnya melewati pengecekan ketika nilai tidak berubah'],
  ['should_extract_message_from_driver_adapter_error_shape', 'seharusnya mengambil pesan dari bentuk error driver adapter'],
  ['should_return_null_for_unrelated_errors', 'seharusnya mengembalikan null untuk error yang tidak terkait'],
  ['should_extract_self_loop_sop_terkait_message', 'seharusnya mengambil pesan self-loop SOP terkait'],
  ['should_provide_label_for_every_StatusSOP_enum', 'seharusnya menyediakan label untuk setiap enum StatusSOP'],
  ['should_provide_label_for_every_StatusPengajuanEvaluasi_enum', 'seharusnya menyediakan label untuk setiap enum StatusPengajuanEvaluasi'],
  ['should_map_DITANDATANGANI_PJ_EVALUATOR_to_BA_diverifikasi_biro', 'seharusnya memetakan DITANDATANGANI_PJ_EVALUATOR menjadi BA diverifikasi biro'],
  ['should_return_BELUM_DINILAI_when_hasil_null', 'seharusnya mengembalikan BELUM_DINILAI ketika hasil bernilai null'],
  ['should_map_SESUAI_and_PERLU_PERBAIKAN', 'seharusnya memetakan SESUAI dan PERLU_PERBAIKAN'],
  ['should_provide_labels_for_all_alur_values', 'seharusnya menyediakan label untuk semua nilai alur'],
  ['should_map_sedang_dievaluasi_to_sedang_dievaluasi', 'seharusnya memetakan SEDANG_DIEVALUASI tetap menjadi SEDANG_DIEVALUASI'],
  ['should_map_selesai_dievaluasi_to_siap_diverifikasi', 'seharusnya memetakan SELESAI_DIEVALUASI menjadi MENUNGGU_TTD_PJ_EVALUATOR'],
  ['should_map_DITANDATANGANI_PJ_EVALUATOR_to_siap_diverifikasi', 'seharusnya memetakan DITANDATANGANI_PJ_EVALUATOR menjadi MENUNGGU_TTD_PJ_EVALUATOR'],
  ['should_map_ditandatangani_pj_penyusun_to_DITANDATANGANI_PJ_EVALUATOR_organisasi', 'seharusnya memetakan DITANDATANGANI_PJ_PENYUSUN menjadi DITANDATANGANI_PJ_EVALUATOR_ORGANISASI'],
  ['should_map_selesai_to_berlaku', 'seharusnya memetakan SELESAI menjadi BERLAKU'],
  ['should return null for empty input', 'seharusnya mengembalikan null untuk input kosong'],
  ['should trim trailing slashes', 'seharusnya menghapus garis miring di akhir URL'],
  ['should append path and hash query', 'seharusnya menambahkan path dan query hash'],
  ['should use URL as payload when base URL is set', 'seharusnya menggunakan URL sebagai payload ketika base URL tersedia'],
  ['should use JSON payload when base URL is unset', 'seharusnya menggunakan payload JSON ketika base URL tidak tersedia'],
]);

const tokenMap = new Map(Object.entries({
  should: 'seharusnya',
  not: 'tidak',
  throw: 'melempar error',
  reject: 'menolak',
  forbid: 'menolak akses',
  allow: 'mengizinkan',
  return: 'mengembalikan',
  create: 'membuat',
  update: 'memperbarui',
  delete: 'menghapus',
  remove: 'menghapus',
  map: 'memetakan',
  set: 'mengatur',
  clear: 'mengosongkan',
  keep: 'mempertahankan',
  use: 'menggunakan',
  parse: 'memproses',
  normalize: 'menormalkan',
  extract: 'mengambil',
  provide: 'menyediakan',
  include: 'menyertakan',
  ignore: 'mengabaikan',
  average: 'menghitung rata-rata',
  resolve: 'menentukan',
  append: 'menambahkan',
  call: 'memanggil',
  delegate: 'mendelegasikan',
  persist: 'menyimpan',
  assign: 'menetapkan',
  match: 'mencocokkan',
  suffix: 'menambahkan sufiks',
  show: 'menampilkan',
  pass: 'lolos',
  skip: 'melewati',
  drop: 'membuang',
  flatten: 'meratakan',
  detect: 'mendeteksi',
  format: 'memformat',
  handle: 'menangani',
  merge: 'menggabungkan',
  bypass: 'melewati',
  separate: 'memisahkan',
  verify: 'memverifikasi',
  sign: 'menandatangani',
  mark: 'menandai',
  collect: 'mengumpulkan',
  replace: 'mengganti',
  break: 'memutus',
  insert: 'menambahkan',
  relink: 'menghubungkan ulang',
  validate: 'memvalidasi',
  validating: 'memvalidasi',
  searchable: 'dapat dicari',
  detectably: 'secara terdeteksi',
  when: 'ketika',
  with: 'dengan',
  without: 'tanpa',
  for: 'untuk',
  from: 'dari',
  to: 'menjadi',
  by: 'berdasarkan',
  on: 'pada',
  and: 'dan',
  or: 'atau',
  but: 'tetapi',
  if: 'jika',
  no: 'tidak ada',
  has: 'memiliki',
  exists: 'masih ada',
  existing: 'yang sudah ada',
  missing: 'tidak ditemukan',
  unknown: 'tidak dikenal',
  invalid: 'tidak valid',
  valid: 'valid',
  empty: 'kosong',
  found: 'ditemukan',
  ready: 'siap',
  same: 'sama',
  single: 'tunggal',
  multiple: 'lebih dari satu',
  many: 'banyak',
  all: 'semua',
  every: 'setiap',
  other: 'lain',
  outside: 'di luar',
  inside: 'di dalam',
  global: 'global',
  public: 'publik',
  latest: 'terbaru',
  current: 'saat ini',
  default: 'default',
  positive: 'positif',
  integer: 'integer',
  seconds: 'detik',
  string: 'string',
  timespan: 'rentang waktu',
  token: 'token',
  claims: 'claim',
  credentials: 'kredensial',
  password: 'password',
  pin: 'PIN',
  old: 'lama',
  wrong: 'salah',
  mismatch: 'tidak cocok',
  unresolvable: 'tidak dapat ditemukan',
  duplicate: 'duplikat',
  refs: 'referensi',
  query: 'query',
  param: 'parameter',
  payload: 'payload',
  input: 'input',
  output: 'output',
  fields: 'field',
  field: 'field',
  label: 'label',
  labels: 'label',
  value: 'nilai',
  values: 'nilai',
  count: 'jumlah',
  suffix: 'sufiks',
  prefix: 'prefix',
  singular: 'tunggal',
  session: 'sesi',
  sessions: 'sesi',
  window: 'jendela waktu',
  idle: 'idle',
  discrete: 'terpisah',
  target: 'target',
  entity: 'entitas',
  path: 'path',
  paths: 'path',
  edge: 'edge',
  edges: 'edge',
  key: 'key',
  rows: 'baris',
  relational: 'relasional',
  config: 'konfigurasi',
  workbench: 'workbench',
  detail: 'detail',
  details: 'detail',
  status: 'status',
  role: 'peran',
  roles: 'peran',
  metadata: 'metadata',
  user: 'pengguna',
  pengguna: 'pengguna',
  peran: 'peran',
  email: 'email',
  nip: 'NIP',
  opd: 'OPD',
  sop: 'SOP',
  pj: 'PJ',
  evaluator: 'evaluator',
  penyusun: 'penyusun',
  kepala: 'kepala',
  biro: 'biro',
  organisasi: 'organisasi',
  pelaksana: 'pelaksana',
  prosedur: 'prosedur',
  langkah: 'langkah',
  swimlane: 'swimlane',
  cabang: 'cabang',
  branch: 'cabang',
  branches: 'cabang',
  diagram: 'diagram',
  katalog: 'katalog',
  evaluasi: 'evaluasi',
  nilai: 'nilai',
  grafik: 'grafik',
  kpi: 'KPI',
  score: 'skor',
  scores: 'skor',
  scale: 'skala',
  tahun: 'tahun',
  dari: 'dari',
  sampai: 'sampai',
  pengajuan: 'pengajuan',
  revisi: 'revisi',
  tindak: 'tindak',
  lanjut: 'lanjut',
  terbuka: 'terbuka',
  selesai: 'selesai',
  sesuai: 'sesuai',
  perlu: 'perlu',
  perbaikan: 'perbaikan',
  catatan: 'catatan',
  kosong: 'kosong',
  hukum: 'hukum',
  dasar: 'dasar',
  arsip: 'arsip',
  riwayat: 'riwayat',
  pengesahan: 'pengesahan',
  profil: 'profil',
  credential: 'kredensial',
  ba: 'BA',
  pdf: 'PDF',
  p12: 'P12',
  qr: 'QR',
  tte: 'TTE',
  hash: 'hash',
  url: 'URL',
  json: 'JSON',
  base: 'base',
  enabled: 'aktif',
  unsigned: 'tanpa tanda tangan',
  signed: 'bertanda tangan',
  signing: 'penandatanganan',
  chain: 'chain',
  digest: 'digest',
  match: 'cocok',
  login: 'login',
  me: 'getMe',
  changePassword: 'changePassword',
  getMe: 'getMe',
  listGrup: 'listGrup',
  findEvaluatorsByOpd: 'findEvaluatorsByOpd',
  registerProfil: 'registerProfil',
  updateProfilPin: 'updateProfilPin',
  getPengesahanPublic: 'getPengesahanPublic',
  mint: 'menerbitkan',
  batch: 'batch',
  eligible: 'eligible',
  sort: 'urut',
  pagination: 'paginasi',
  paginated: 'terpaginasi',
  list: 'daftar',
  search: 'pencarian',
  catalog: 'katalog',
  repository: 'repository',
  repo: 'repository',
  helper: 'helper',
  dto: 'DTO',
  enum: 'enum',
  fk: 'FK',
  self: 'self',
  loop: 'loop',
  related: 'terkait',
  unassigned: 'belum ditugaskan',
  assigned: 'ditugaskan',
  configured: 'dikonfigurasi',
  present: 'tersedia',
  absent: 'tidak ada',
  lengkap: 'lengkap',
  header: 'header',
  read: 'membaca',
  increment: 'menaikkan',
  version: 'versi',
  versions: 'versi',
  draft: 'draft',
  berlaku: 'berlaku',
  dicabut: 'dicabut',
  cabut: 'cabut',
  hapus: 'hapus',
  diajukan: 'diajukan',
  diajukanEvaluasi: 'diajukan evaluasi',
  dievaluasi: 'dievaluasi',
  diverifikasi: 'diverifikasi',
  ditandatangani: 'ditandatangani',
  siap: 'siap',
  aktif: 'aktif',
  nonaktif: 'nonaktif',
  tetap: 'tetap',
  only: 'saja',
  both: 'keduanya',
  true: 'true',
  false: 'false',
  null: 'null',
}));

const exceptionMap = new Map([
  ['bad request', 'BadRequestException'],
  ['conflict', 'ConflictException'],
  ['forbidden', 'ForbiddenException'],
  ['not found', 'NotFoundException'],
  ['unauthorized', 'UnauthorizedException'],
  ['service unavailable', 'ServiceUnavailableException'],
]);

function splitCamel(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

function translateWords(value) {
  const words = splitCamel(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  const translated = [];
  for (let i = 0; i < words.length; i += 1) {
    const one = words[i];
    const two = `${words[i]} ${words[i + 1] ?? ''}`.trim().toLowerCase();
    if (exceptionMap.has(two)) {
      translated.push(exceptionMap.get(two));
      i += 1;
      continue;
    }

    const lower = one.toLowerCase();
    if (/^[A-Z0-9_]+$/.test(one) && one.length > 1) {
      translated.push(one);
    } else {
      translated.push(tokenMap.get(lower) ?? one);
    }
  }

  return translated.join(' ').replace(/\s+/g, ' ').trim();
}

function cleanupSentence(value) {
  return value
    .replace(/^seharusnya melempar error ConflictException\b/, 'seharusnya melempar ConflictException')
    .replace(/^seharusnya melempar error BadRequestException\b/, 'seharusnya melempar BadRequestException')
    .replace(/^seharusnya melempar error ForbiddenException\b/, 'seharusnya melempar ForbiddenException')
    .replace(/^seharusnya melempar error NotFoundException\b/, 'seharusnya melempar NotFoundException')
    .replace(/^seharusnya melempar error UnauthorizedException\b/, 'seharusnya melempar UnauthorizedException')
    .replace(/^seharusnya melempar error ServiceUnavailableException\b/, 'seharusnya melempar ServiceUnavailableException')
    .replace(/\bmenjadi menjadi\b/g, 'menjadi')
    .replace(/\bdan dan\b/g, 'dan')
    .replace(/\bketika ketika\b/g, 'ketika')
    .replace(/\bdi luar skala 1 menjadi 5\b/g, 'di luar skala 1 sampai 5')
    .replace(/\bPDF penandatanganan aktif\b/g, 'penandatanganan PDF aktif')
    .replace(/\bURL sebagai payload\b/g, 'URL sebagai payload')
    .replace(/\s+/g, ' ')
    .trim();
}

function translateTitle(title, kind) {
  if (titleMap.has(title)) return titleMap.get(title);
  if (phraseMap.has(title)) return phraseMap.get(title);

  const normalized = title.replace(/\s+/g, '_');
  if (phraseMap.has(normalized)) return phraseMap.get(normalized);

  if (kind === 'describe') {
    return `Pengujian ${translateWords(title)}`;
  }

  return cleanupSentence(translateWords(title));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (entry.isFile() && entry.name.endsWith('.spec.ts')) return [full];
    return [];
  });
}

let changedFiles = 0;
let changedTitles = 0;

for (const file of walk(root)) {
  const source = fs.readFileSync(file, 'utf8');
  const updated = source.replace(
    /\b(describe|it|test)(\.(?:only|skip))?\(\s*'([^']+)'/g,
    (match, kind, modifier = '', title) => {
      const translated = translateTitle(title, kind);
      if (translated === title) return match;
      changedTitles += 1;
      return `${kind}${modifier}('${translated}'`;
    },
  );

  if (updated !== source) {
    fs.writeFileSync(file, updated);
    changedFiles += 1;
  }
}

console.log(`Translated ${changedTitles} test titles in ${changedFiles} files.`);
