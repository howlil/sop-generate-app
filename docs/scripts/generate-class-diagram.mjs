import fs from 'fs';

const esc = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const header = (stereotype, name) =>
  '&lt;div style=&quot;text-align:center;line-height:1.3&quot;&gt;&lt;div style=&quot;font-weight:normal;font-size:12px&quot;&gt;&amp;lt;&amp;lt;' +
  esc(stereotype) +
  '&amp;gt;&amp;gt;&lt;/div&gt;&lt;div&gt;&lt;b&gt;' +
  esc(name) +
  '&lt;/b&gt;&lt;/div&gt;&lt;/div&gt;';

const SWIM =
  'swimlane;fontStyle=0;align=center;childLayout=stackLayout;horizontal=1;startSize=52;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;separatorColor=#000000;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;fontSize=13;';
const TXT =
  'text;strokeColor=#000000;fillColor=#ffffff;align=left;verticalAlign=top;spacingLeft=10;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=13;fontColor=#000000;';
const TITLE =
  'text;html=1;strokeColor=none;fillColor=none;fontColor=#000000;fontSize=18;fontStyle=1;align=center;';

const HDR = 52;
const LINE_H = 18;
const PAD = 12;

function lines(value) {
  return value.map(esc).join('&#10;');
}

function height(count) {
  return Math.max(30, count * LINE_H + PAD);
}

function klass(id, name, stereotype, x, y, w, attrs = [], ops = []) {
  const attrH = attrs.length ? height(attrs.length) : 0;
  const opsH = ops.length ? height(ops.length) : 0;
  const totalH = HDR + attrH + opsH;
  let xml = '';

  xml += `                <mxCell id="${esc(id)}" value="${header(stereotype, name)}" style="${SWIM}" parent="1" vertex="1">\n`;
  xml += `                    <mxGeometry x="${x}" y="${y}" width="${w}" height="${totalH}" as="geometry"/>\n`;
  xml += '                </mxCell>\n';

  let yOff = HDR;
  if (attrs.length) {
    xml += `                <mxCell id="${esc(id)}-attr" value="${lines(attrs)}" style="${TXT}" parent="${esc(id)}" vertex="1">\n`;
    xml += `                    <mxGeometry y="${yOff}" width="${w}" height="${attrH}" as="geometry"/>\n`;
    xml += '                </mxCell>\n';
    yOff += attrH;
  }

  if (ops.length) {
    xml += `                <mxCell id="${esc(id)}-ops" value="${lines(ops)}" style="${TXT}" parent="${esc(id)}" vertex="1">\n`;
    xml += `                    <mxGeometry y="${yOff}" width="${w}" height="${opsH}" as="geometry"/>\n`;
    xml += '                </mxCell>\n';
  }

  return { id, xml, h: totalH };
}

function section(id, value, x, y, w) {
  return `                <mxCell id="${esc(id)}" value="${esc(value)}" style="${TITLE}" parent="1" vertex="1"><mxGeometry x="${x}" y="${y}" width="${w}" height="32" as="geometry"/></mxCell>\n`;
}

function edge(id, src, tgt, style, label = '') {
  return `                <mxCell id="${esc(id)}" value="${esc(label)}" style="${style}" edge="1" parent="1" source="${esc(src)}" target="${esc(tgt)}">
                    <mxGeometry relative="1" as="geometry"/>
                </mxCell>\n`;
}

const dep = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;dashed=1;endArrow=open;endFill=0;strokeColor=#000000;';
const assoc = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=none;strokeColor=#000000;';
const aggregate = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;startArrow=diamondThin;startFill=0;endArrow=none;strokeColor=#000000;';
const compose = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;startArrow=diamond;startFill=1;endArrow=none;strokeColor=#000000;';
const enumUse = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;dashed=1;endArrow=open;endFill=0;strokeColor=#000000;';

const repositories = [
  {
    id: 'AuthRepository',
    name: 'AuthRepository',
    attrs: ['- prisma: PrismaService', '- target: Pengguna session and password data'],
    ops: [
      '+ findActivePenggunaByEmail(email)',
      '+ findActivePenggunaById(penggunaId)',
      '+ updateKataSandi(penggunaId, hash)',
      '+ startSession(penggunaId)',
      '+ storeRefreshToken(penggunaId, tokenHash, expiresAt)',
      '+ revokeSession(penggunaId)',
    ],
  },
  {
    id: 'OpdRepository',
    name: 'OpdRepository',
    attrs: ['- prisma: PrismaService', '- target: OPD aggregate'],
    ops: [
      '+ findOpdIdByPenggunaId(penggunaId)',
      '+ findManyRingkasAktif(search?)',
      '+ findRingkasAktifById(opdId)',
      '+ findAktifById(opdId)',
      '+ countPenggunaStrukturalAktifByOpdId(opdId)',
      '+ create(data)',
      '+ update(opdId, data)',
      '+ softDelete(opdId)',
      '+ summarizeBlockingRelations(opdId)',
    ],
  },
  {
    id: 'PenggunaRepository',
    name: 'PenggunaRepository',
    attrs: ['- prisma: PrismaService', '- target: Pengguna role profiles'],
    ops: [
      '+ findPjEvaluatorOrganisasiOpdId()',
      '+ findPjEvaluatorOrganisasiOpd()',
      '+ countAktifByOpdIdAndPeran(opdId, peran)',
      '+ findEvaluatorsByOpd(opdId, search?)',
      '+ findEvaluatorByIdInOpd(penggunaId, opdId)',
      '+ findEvaluatorAktifById(penggunaId, opdId)',
      '+ createPengguna(data)',
      '+ updateEvaluator(penggunaId, data)',
      '+ softDeleteEvaluator(penggunaId)',
      '+ existsEmailOtherThan(email, excludeId)',
      '+ existsNipOtherThan(nip, excludeId)',
    ],
  },
  {
    id: 'KepalaOpdRepository',
    name: 'KepalaOpdRepository',
    attrs: ['- prisma: PrismaService', '- target: Pengguna KEPALA_OPD'],
    ops: [
      '+ findOpdAktifById(opdId)',
      '+ findKepalaById(penggunaId)',
      '+ findManyKepala(search?)',
      '+ findRiwayatRowsForPengguna(penggunaId)',
      '+ createWithRiwayatOpd(input)',
      '+ persistUpdate(penggunaId, input)',
      '+ softDeleteKepalaOpd(penggunaId)',
    ],
  },
  {
    id: 'PenyusunRepository',
    name: 'PenyusunRepository',
    attrs: ['- prisma: PrismaService', '- target: Pengguna PENYUSUN/PJ_PENYUSUN'],
    ops: [
      '+ findOpdsWithPenyusun(search?)',
      '+ findPenyusunById(penggunaId)',
      '+ findPenyusunAktifById(penggunaId)',
      '+ findOpdById(opdId)',
      '+ findRiwayatOpdByPenggunaId(penggunaId)',
      '+ findOtherPjPenyusunAktif(opdId, excludeId?)',
      '+ createWithRiwayatOpd(input)',
      '+ updatePenyusun(penggunaId, data)',
      '+ softDeletePenyusun(penggunaId)',
      '+ aktifkanPenyusun(penggunaId)',
      '+ pindahPenyusun(penggunaId, opdTujuanId)',
      '+ findDeleteGuardRow(penggunaId)',
      '+ deletePenyusunPermanen(penggunaId)',
    ],
  },
  {
    id: 'PeraturanRepository',
    name: 'PeraturanRepository',
    attrs: ['- prisma: PrismaService', '- target: Peraturan, OPDPeraturan, DasarHukum'],
    ops: [
      '+ findOpdIdByPenggunaId(penggunaId)',
      '+ findManyByOpdId(opdId)',
      '+ hasOpdLink(peraturanId, opdId)',
      '+ findByIdForOpd(peraturanId, opdId)',
      '+ countDasarHukum(peraturanId)',
      '+ countOpdLinks(peraturanId)',
      '+ createWithOpdLink(params)',
      '+ updateMaster(peraturanId, data)',
      '+ updateMasterWithLastEditor(peraturanId, data, userId)',
      '+ deleteOpdLink(opdId, peraturanId)',
      '+ deletePeraturan(peraturanId)',
    ],
  },
  {
    id: 'PelaksanaRepository',
    name: 'PelaksanaRepository',
    attrs: ['- prisma: PrismaService', '- target: Pelaksana and procedure references'],
    ops: [
      '+ findOpdIdByPenggunaId(penggunaId)',
      '+ findManyByOpdId(opdId)',
      '+ findByIdAndOpd(pelaksanaId, opdId)',
      '+ create(opdId, nama)',
      '+ updateNama(pelaksanaId, nama)',
      '+ delete(pelaksanaId)',
      '+ countLangkahReferences(pelaksanaId)',
      '+ countSwimlaneReferences(pelaksanaId)',
    ],
  },
  {
    id: 'SopCatalogRepository',
    name: 'SopCatalogRepository',
    attrs: ['- prisma: PrismaService', '- target: SOP, DetailSOP, header aggregate'],
    ops: [
      '+ findOpdIdByPenggunaId(penggunaId)',
      '+ findOpdNama(opdId)',
      '+ findPenggunaNama(penggunaId)',
      '+ createSopWithInitialDetail(params)',
      '+ findDaftarByOpdId(opdId, query)',
      '+ findWorkbenchPayload(detailOrSopId)',
      '+ findDetailIdByDetailOrSopId(id)',
      '+ findLatestDetailStatusContext(sopId)',
      '+ updateDetailSopStatus(detailSopId, status)',
      '+ transitionDetailSopRevisiToSedangDievaluasi(id)',
      '+ updateSopHeaderTransaction(params)',
      '+ findDaftarAll(query)',
      '+ findRiwayatVersiBySopId(sopId)',
      '+ cloneDetailSopFromBerlaku(params)',
      '+ deleteVersiDraft(detailSopId)',
      '+ deleteSopDraftAwal(detailSopId)',
    ],
  },
  {
    id: 'SopProsedurRepository',
    name: 'SopProsedurRepository',
    attrs: ['- prisma: PrismaService', '- target: LangkahSOP and swimlane aggregate'],
    ops: [
      '+ findDetailIdByDetailOrSopId(id)',
      '+ findDetailStatus(detailSopId)',
      '+ findOpdIdByPenggunaId(penggunaId)',
      '+ findPelaksanaIdsByOpd(opdId, ids)',
      '+ findExistingSwimlanePelaksanaIds(detailSopId)',
      '+ updateProsedurTransaction(params)',
    ],
  },
  {
    id: 'SopDiagramRepository',
    name: 'SopDiagramRepository',
    attrs: ['- prisma: PrismaService', '- target: KonfigurasiDiagramSOP aggregate'],
    ops: [
      '+ findDetailIdByDetailOrSopId(id)',
      '+ findDetailStatus(detailSopId)',
      '+ findConfigsByDetailSopId(detailSopId)',
      '+ upsertConfig(input)',
      '+ cloneConfigsForRevision(sourceDetailId, targetDetailId)',
    ],
  },
  {
    id: 'SopPublicRepository',
    name: 'SopPublicRepository',
    attrs: ['- prisma: PrismaService', '- target: published SOP read model'],
    ops: [
      '+ findOpdAktifById(opdId)',
      '+ countOpdWithBerlakuSop(search?)',
      '+ findOpdWithBerlakuSop(params)',
      '+ countBerlakuSopByOpd(opdId, search?)',
      '+ findBerlakuSopByOpd(params)',
      '+ countBerlakuSopGlobal(search?)',
      '+ findBerlakuSopGlobal(params)',
      '+ findPublishedPdfByDetailSopId(detailSopId)',
    ],
  },
  {
    id: 'PengajuanEvaluasiRepository',
    name: 'PengajuanEvaluasiRepository',
    attrs: ['- prisma: PrismaService', '- target: PengajuanEvaluasi workflow'],
    ops: [
      '+ findOpdIdPengguna(penggunaId)',
      '+ findManyFiltered(query)',
      '+ findByIdFull(pengajuanEvaluasiId)',
      '+ buildWhereFromQuery(query)',
      '+ buildWhereRingkasFromQuery(query)',
      '+ countWhere(where)',
      '+ repairPengesahanKepalaOpdStatusJikaDokumenSudahSigned(id)',
      '+ findRingkasPage(query)',
    ],
  },
  {
    id: 'PengajuanEvaluasiDetailRepository',
    name: 'PengajuanEvaluasiDetailRepository',
    attrs: ['- prisma: PrismaService', '- target: evaluation detail documents'],
    ops: [
      '+ existsNilaiUntukDetail(pengajuanId, detailSopId)',
      '+ findDokumenBeritaAcara(pengajuanId)',
      '+ findDokumenSopBerlaku(detailSopId)',
    ],
  },
  {
    id: 'EvaluasiNilaiRepository',
    name: 'EvaluasiNilaiRepository',
    attrs: ['- prisma: PrismaService', '- target: NilaiEvaluasi and LogNilaiEvaluasi'],
    ops: [
      '+ findNilaiRevisiAktifForDetail(detailSopId)',
      '+ findUmpanBalikForDetail(detailSopId)',
      '+ findOpdIdByDetailSopId(detailSopId)',
    ],
  },
  {
    id: 'EvaluasiWorkspaceRepository',
    name: 'EvaluasiWorkspaceRepository',
    attrs: ['- prisma: PrismaService', '- target: workspace read model'],
    ops: [
      '+ findOpdRingkas(opdId)',
      '+ findDaftarDetailPipeline(opdId)',
      '+ findPengajuanBundleForWorkspace(pengajuanId)',
      '+ findPengajuanAktif(opdId)',
      '+ findRiwayatOpdSelesai(opdId)',
      '+ findLogNilaiUntukDetailWorkspace(detailSopId)',
      '+ detailMilikiOpd(detailSopId, opdId)',
      '+ evaluatorTerakhirUntukDetailSop(detailSopId)',
    ],
  },
  {
    id: 'EvaluasiGrafikRepository',
    name: 'EvaluasiGrafikRepository',
    attrs: ['- prisma: PrismaService', '- target: evaluation report aggregate'],
    ops: ['+ findDaftarOpdAktif()', '+ findAgregasiPerTahunOpd(tahun)'],
  },
  {
    id: 'TteRepository',
    name: 'TteRepository',
    attrs: ['- prisma: PrismaService', '- target: TTE credentials, documents, signatures'],
    ops: [
      '+ findPenggunaAktif(userId)',
      '+ findKredensial(userId)',
      '+ createKredensialPin(params)',
      '+ createKredensialPinDanP12(params)',
      '+ updateKredensialPinHash(params)',
      '+ updateKredensialP12(params)',
      '+ findRiwayatPengesahanByUserAndDokumen(params)',
      '+ findBeritaAcaraArsipForPdfSigning(id)',
      '+ findRiwayatForPdfSigning(params)',
      '+ updateRiwayatPdfSignatureMetadata(params)',
      '+ findRiwayatByPdfSignatureBinding(params)',
      '+ assertRiwayatBelumAda(params)',
      '+ transaksiTandaTanganiBaEvaluator(params)',
      '+ transaksiTandaTanganiBaPjPenyusun(params)',
      '+ prepareSopPengesahanDocuments(params)',
      '+ finalizeSopPengesahanWithArtifacts(params)',
      '+ transaksiTandaTanganiSemuaSopPengajuan(params)',
    ],
  },
];

const entities = [
  {
    id: 'Pengguna',
    attrs: [
      '- penggunaId: string <<PK>>',
      '- email: string <<unique>>',
      '- opdId: string <<FK OPD>>',
      '- nama, nip, jabatan, pangkat, nohp: string',
      '- peran: PeranPengguna',
      '- kataSandi: string',
      '- sesiTokenVersion: number',
      '- refreshTokenHash?: string',
      '- refreshTokenExpiresAt?: DateTime',
      '- passwordChangedAt?: DateTime',
      '- ttePinHash?: string',
      '- tteP12Base64?: string',
      '- tteP12PassphraseEncrypted?: string',
      '- deletedAt?: DateTime',
    ],
  },
  {
    id: 'OPD',
    attrs: ['- opdId: string <<PK>>', '- nama: string', '- deletedAt?: DateTime', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'RiwayatOpdPengguna',
    attrs: ['- penggunaId: string <<PK, FK Pengguna>>', '- opdId: string <<PK, FK OPD>>', '- isAktif: boolean', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'Peraturan',
    attrs: ['- peraturanId: string <<PK>>', '- nama: string', '- nomor: string <<unique pair>>', '- tahun: number <<unique pair>>', '- tentang: string', '- lastEditedById?: string <<FK Pengguna>>'],
  },
  {
    id: 'OPDPeraturan',
    attrs: ['- opdId: string <<PK, FK OPD>>', '- peraturanId: string <<PK, FK Peraturan>>', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'SOP',
    attrs: ['- sopId: string <<PK>>', '- opdId: string <<FK OPD>>', '- judul: string', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'DetailSOP',
    attrs: [
      '- detailSopId: string <<PK>>',
      '- sopId: string <<FK SOP>>',
      '- status: StatusSOP',
      '- versi: number <<unique with sopId>>',
      '- nomorSOP: string <<unique>>',
      '- tanggalPembuatan: DateTime',
      '- tanggalRevisi?: DateTime',
      '- tanggalEfektif?: DateTime',
      '- namaLembaga: string',
      '- dibuatOlehId?: string <<FK Pengguna>>',
      '- terakhirDieditOlehId?: string <<FK Pengguna>>',
      '- revisiDariDetailSopId?: string <<self FK>>',
    ],
  },
  {
    id: 'LampiranPeringatan',
    attrs: ['- lampiranPeringatanId: string <<PK>>', '- detailSopId: string <<FK DetailSOP>>', '- teks: string', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'LampiranKualifikasiPelaksanaan',
    attrs: ['- lampiranKualifikasiPelaksanaanId: string <<PK>>', '- detailSopId: string <<FK DetailSOP>>', '- teks: string', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'LampiranPeralatanPerlengkapan',
    attrs: ['- lampiranPeralatanPerlengkapanId: string <<PK>>', '- detailSopId: string <<FK DetailSOP>>', '- teks: string', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'LampiranPencatatanPendataan',
    attrs: ['- lampiranPencatatanPendataanId: string <<PK>>', '- detailSopId: string <<FK DetailSOP>>', '- teks: string', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'DasarHukum',
    attrs: ['- detailSopId: string <<PK, FK DetailSOP>>', '- peraturanId: string <<PK, FK Peraturan>>', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'SopTerkait',
    attrs: ['- detailSopId: string <<PK, FK DetailSOP>>', '- detailSopTerkaitId: string <<PK, FK DetailSOP>>', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'LangkahSOP',
    attrs: [
      '- langkahSopId: string <<PK>>',
      '- detailSopId: string <<FK DetailSOP>>',
      '- kegiatan: string',
      '- jenis: JenisLangkahProsedur',
      '- urutan: number <<unique per detail>>',
      '- kelengkapan: string',
      '- keluaran: string',
      '- waktu: number',
      '- satuanWaktu: SatuanWaktu',
      '- keterangan: string',
      '- pelaksanaId: string <<FK Pelaksana>>',
      '- langkahSelanjutnyaYaId?: string <<self FK>>',
      '- langkahSelanjutnyaTidakId?: string <<self FK>>',
    ],
  },
  {
    id: 'Pelaksana',
    attrs: ['- pelaksanaId: string <<PK>>', '- opdId: string <<FK OPD>>', '- nama: string <<unique per OPD>>', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'DetailSOPPelaksana',
    attrs: ['- detailSopId: string <<PK, FK DetailSOP>>', '- pelaksanaId: string <<PK, FK Pelaksana>>', '- urutan: number', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
  {
    id: 'LogEditSOP',
    attrs: [
      '- detailSopId: string <<PK, FK DetailSOP>>',
      '- penggunaId: string <<PK, FK Pengguna>>',
      '- createdAt: DateTime(3) <<PK>>',
      '- bagian: BagianSOP',
      '- keterangan?: string',
      '- sesiChangeCount: number',
      '- closedAt?: DateTime(3)',
      '- updatedAt: DateTime(3)',
    ],
  },
  {
    id: 'LogEditSopDomainField',
    attrs: ['- detailSopId: string <<PK>>', '- penggunaId: string <<PK>>', '- logCreatedAt: DateTime(3) <<PK>>', '- domainField: string <<PK>>'],
  },
  {
    id: 'PengajuanEvaluasi',
    attrs: [
      '- pengajuanEvaluasiId: string <<PK>>',
      '- opdId: string <<FK OPD>>',
      '- jenis: JenisPengajuanEvaluasi',
      '- status: StatusPengajuanEvaluasi',
      '- nomorBA?: string <<unique>>',
      '- tanggalPermintaan?: DateTime',
      '- tanggalEvaluasi?: DateTime',
      '- nilaiOPD?: number',
      '- diverifikasiOlehUserId?: string <<FK Pengguna>>',
      '- ditandatanganiOlehPjPenyusunUserId?: string <<FK Pengguna>>',
      '- diselesaikanOlehId?: string <<FK Pengguna>>',
      '- version: number',
    ],
  },
  {
    id: 'NilaiEvaluasi',
    attrs: [
      '- pengajuanEvaluasiId: string <<PK, FK PengajuanEvaluasi>>',
      '- detailSopId: string <<PK, FK DetailSOP>>',
      '- hasil?: HasilEvaluasi',
      '- catatan?: string',
      '- statusTindakLanjut?: StatusTindakLanjut',
      '- ditindaklanjutiPada?: DateTime',
      '- ditindaklanjutiOlehId?: string <<FK Pengguna>>',
      '- dinilaiOlehId?: string <<FK Pengguna>>',
      '- version: number',
    ],
  },
  {
    id: 'LogNilaiEvaluasi',
    attrs: [
      '- pengajuanEvaluasiId: string <<PK, FK>>',
      '- detailSopId: string <<PK, FK>>',
      '- penggunaId: string <<PK, FK Pengguna>>',
      '- hasilSebelum?: HasilEvaluasi',
      '- hasilSesudah?: HasilEvaluasi',
      '- catatanSebelum?: string',
      '- catatanSesudah?: string',
      '- statusTindakLanjutSebelum?: StatusTindakLanjut',
      '- statusTindakLanjutSesudah?: StatusTindakLanjut',
      '- createdAt: DateTime(3) <<PK>>',
    ],
  },
  {
    id: 'DokumenTte',
    attrs: [
      '- dokumenTteId: string <<PK>>',
      '- nomorDokumen: string <<unique>>',
      '- jenisDokumen: JenisDokumenTte',
      '- judulDokumen: string',
      '- hashDokumen: string',
      '- versiDokumen: number',
      '- pdfPath?: string',
      '- pdfSha256?: string',
      '- pdfStatus?: string',
      '- detailSopId?: string <<unique FK DetailSOP>>',
      '- pengajuanEvaluasiId?: string <<unique FK PengajuanEvaluasi>>',
    ],
  },
  {
    id: 'RiwayatTandaTangan',
    attrs: [
      '- userId: string <<PK, FK Pengguna>>',
      '- dokumenTteId: string <<PK, FK DokumenTte>>',
      '- peran: PeranPengguna',
      '- signatureValue?: string',
      '- signatureAlgorithm?: string',
      '- signatureFormat?: string',
      '- certSerialNumber?: string',
      '- certIssuer?: string',
      '- certSubject?: string',
      '- certFingerprint?: string',
      '- certValidFrom?: DateTime',
      '- certValidTo?: DateTime',
      '- ditandatanganiPada: DateTime',
    ],
  },
  {
    id: 'KonfigurasiDiagramSOP',
    attrs: ['- detailSopId: string <<PK, FK DetailSOP>>', '- jenis: JenisDiagram <<PK>>', '- layoutSeed: number', '- updatedAt: DateTime'],
  },
  {
    id: 'OverridePanahDiagramSOP',
    attrs: [
      '- detailSopId: string <<PK>>',
      '- jenis: JenisDiagram <<PK>>',
      '- dariLangkahSopId: string <<PK, FK LangkahSOP>>',
      '- keLangkahSopId: string <<PK, FK LangkahSOP>>',
      '- cabang: CabangDiagram <<PK>>',
      '- sSide: SisiPanahDiagram',
      '- eSide: SisiPanahDiagram',
      '- startX/startY/endX/endY: number',
    ],
  },
  {
    id: 'TitikTekukPanahDiagramSOP',
    attrs: ['- detailSopId: string <<PK>>', '- jenis: JenisDiagram <<PK>>', '- dariLangkahSopId: string <<PK>>', '- keLangkahSopId: string <<PK>>', '- cabang: CabangDiagram <<PK>>', '- urutan: number <<PK>>', '- x/y: number'],
  },
  {
    id: 'OverrideLabelDiagramSOP',
    attrs: ['- detailSopId: string <<PK>>', '- jenis: JenisDiagram <<PK>>', '- kunciLabel: string <<PK>>', '- posisiX/posisiY: number', '- createdAt: DateTime', '- updatedAt: DateTime'],
  },
];

const enums = [
  { id: 'PeranPengguna', values: ['PJ_EVALUATOR', 'EVALUATOR', 'KEPALA_OPD', 'PJ_PENYUSUN', 'PENYUSUN'] },
  {
    id: 'StatusSOP',
    values: [
      'DRAFT',
      'SEDANG_DISUSUN',
      'MENUNGGU_PENGAJUAN_EVALUASI',
      'DIAJUKAN_EVALUASI',
      'SEDANG_DIEVALUASI',
      'REVISI_DARI_EVALUATOR',
      'MENUNGGU_TTD_PJ_EVALUATOR',
      'DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI',
      'BERLAKU',
      'DIGANTIKAN',
      'DICABUT',
    ],
  },
  { id: 'JenisLangkahProsedur', values: ['AWAL_AKHIR', 'KEGIATAN', 'KEPUTUSAN'] },
  { id: 'SatuanWaktu', values: ['m', 'h', 'd', 'w', 'mo', 'y'] },
  { id: 'JenisPengajuanEvaluasi', values: ['EVALUASI_REQUEST_EVALUATOR', 'EVALUASI_REQUEST_OPD'] },
  { id: 'StatusPengajuanEvaluasi', values: ['SEDANG_DIEVALUASI', 'SELESAI_DIEVALUASI', 'DITANDATANGANI_PJ_EVALUATOR', 'DITANDATANGANI_PJ_PENYUSUN', 'SELESAI'] },
  { id: 'HasilEvaluasi', values: ['SESUAI', 'PERLU_PERBAIKAN'] },
  { id: 'JenisDokumenTte', values: ['BERITA_ACARA_EVALUASI', 'SOP_BERLAKU'] },
  { id: 'StatusTindakLanjut', values: ['TERBUKA', 'SELESAI'] },
  { id: 'BagianSOP', values: ['HEADER', 'LANGKAH', 'STATUS', 'UMPAN_BALIK', 'EVALUASI'] },
  { id: 'JenisDiagram', values: ['FLOWCHART', 'BPMN'] },
  { id: 'CabangDiagram', values: ['UTAMA', 'YA', 'TIDAK'] },
  { id: 'SisiPanahDiagram', values: ['top', 'bottom', 'left', 'right'] },
];

let cells = '';
let edges = '';

cells += section('repoSection', 'REPOSITORY CLASSES', 40, 20, 420);
cells += section('entitySection', 'ENTITY CLASSES (PRISMA MODELS)', 520, 20, 1660);
cells += section('enumSection', 'ENUM CLASSES', 2240, 20, 780);

const repoX = 50;
let repoY = 70;
for (const repo of repositories) {
  const node = klass(repo.id, repo.name, 'repository', repoX, repoY, 400, repo.attrs, repo.ops);
  cells += node.xml;
  repoY += node.h + 28;
}

const entityColumns = [520, 880, 1240, 1600, 1960];
const entityY = [70, 70, 70, 70, 70];
for (let i = 0; i < entities.length; i += 1) {
  const col = i % entityColumns.length;
  const entity = entities[i];
  const node = klass(entity.id, entity.id, 'entity', entityColumns[col], entityY[col], 330, entity.attrs, []);
  cells += node.xml;
  entityY[col] += node.h + 28;
}

const enumColumns = [2240, 2630];
const enumY = [70, 70];
for (let i = 0; i < enums.length; i += 1) {
  const col = i % enumColumns.length;
  const en = enums[i];
  const node = klass(en.id, en.id, 'enumeration', enumColumns[col], enumY[col], 350, en.values, []);
  cells += node.xml;
  enumY[col] += node.h + 28;
}

const repoEntityLinks = [
  ['AuthRepository', 'Pengguna', 'auth/session'],
  ['OpdRepository', 'OPD', 'CRUD'],
  ['OpdRepository', 'Pengguna', 'blocking count'],
  ['PenggunaRepository', 'Pengguna', 'CRUD role profile'],
  ['PenggunaRepository', 'OPD', 'role grouping'],
  ['KepalaOpdRepository', 'Pengguna', 'KEPALA_OPD'],
  ['KepalaOpdRepository', 'OPD', 'assignment'],
  ['KepalaOpdRepository', 'RiwayatOpdPengguna', 'history'],
  ['PenyusunRepository', 'Pengguna', 'PENYUSUN/PJ'],
  ['PenyusunRepository', 'OPD', 'assignment'],
  ['PenyusunRepository', 'RiwayatOpdPengguna', 'history'],
  ['PeraturanRepository', 'Peraturan', 'CRUD'],
  ['PeraturanRepository', 'OPDPeraturan', 'link'],
  ['PeraturanRepository', 'DasarHukum', 'guard'],
  ['PelaksanaRepository', 'Pelaksana', 'CRUD'],
  ['PelaksanaRepository', 'LangkahSOP', 'reference guard'],
  ['PelaksanaRepository', 'DetailSOPPelaksana', 'reference guard'],
  ['SopCatalogRepository', 'SOP', 'aggregate root'],
  ['SopCatalogRepository', 'DetailSOP', 'version/header'],
  ['SopCatalogRepository', 'DasarHukum', 'legal basis'],
  ['SopCatalogRepository', 'SopTerkait', 'related SOP'],
  ['SopCatalogRepository', 'LogEditSOP', 'audit'],
  ['SopProsedurRepository', 'DetailSOP', 'status guard'],
  ['SopProsedurRepository', 'LangkahSOP', 'replace steps'],
  ['SopProsedurRepository', 'DetailSOPPelaksana', 'replace swimlanes'],
  ['SopDiagramRepository', 'KonfigurasiDiagramSOP', 'config'],
  ['SopDiagramRepository', 'OverridePanahDiagramSOP', 'arrows'],
  ['SopDiagramRepository', 'TitikTekukPanahDiagramSOP', 'waypoints'],
  ['SopDiagramRepository', 'OverrideLabelDiagramSOP', 'labels'],
  ['SopPublicRepository', 'OPD', 'public list'],
  ['SopPublicRepository', 'DetailSOP', 'published SOP'],
  ['SopPublicRepository', 'DokumenTte', 'published PDF'],
  ['PengajuanEvaluasiRepository', 'PengajuanEvaluasi', 'workflow'],
  ['PengajuanEvaluasiRepository', 'NilaiEvaluasi', 'score rows'],
  ['PengajuanEvaluasiRepository', 'DokumenTte', 'repair TTE status'],
  ['PengajuanEvaluasiDetailRepository', 'NilaiEvaluasi', 'detail check'],
  ['PengajuanEvaluasiDetailRepository', 'DokumenTte', 'BA/SOP document'],
  ['EvaluasiNilaiRepository', 'NilaiEvaluasi', 'feedback'],
  ['EvaluasiNilaiRepository', 'LogNilaiEvaluasi', 'audit'],
  ['EvaluasiWorkspaceRepository', 'PengajuanEvaluasi', 'workspace'],
  ['EvaluasiWorkspaceRepository', 'DetailSOP', 'pipeline'],
  ['EvaluasiWorkspaceRepository', 'LogNilaiEvaluasi', 'history'],
  ['EvaluasiGrafikRepository', 'OPD', 'report dimension'],
  ['EvaluasiGrafikRepository', 'PengajuanEvaluasi', 'report fact'],
  ['TteRepository', 'Pengguna', 'credential owner'],
  ['TteRepository', 'DokumenTte', 'document'],
  ['TteRepository', 'RiwayatTandaTangan', 'signature'],
  ['TteRepository', 'PengajuanEvaluasi', 'BA signing'],
  ['TteRepository', 'DetailSOP', 'SOP signing'],
];

for (const [src, tgt, label] of repoEntityLinks) {
  edges += edge(`repo-${src}-${tgt}`, src, tgt, dep, label);
}

const entityLinks = [
  ['OPD', 'Pengguna', aggregate, '1..* pengguna'],
  ['OPD', 'RiwayatOpdPengguna', aggregate, '1..* riwayat'],
  ['Pengguna', 'RiwayatOpdPengguna', compose, 'history'],
  ['OPD', 'OPDPeraturan', compose, 'M:N'],
  ['Peraturan', 'OPDPeraturan', aggregate, 'M:N'],
  ['Peraturan', 'DasarHukum', aggregate, 'used by SOP'],
  ['Pengguna', 'Peraturan', assoc, 'lastEditedBy'],
  ['OPD', 'SOP', aggregate, '1..* SOP'],
  ['SOP', 'DetailSOP', compose, 'versions'],
  ['DetailSOP', 'DetailSOP', assoc, 'revisiDari'],
  ['Pengguna', 'DetailSOP', assoc, 'dibuat/diedit'],
  ['DetailSOP', 'LampiranPeringatan', compose, 'lampiran'],
  ['DetailSOP', 'LampiranKualifikasiPelaksanaan', compose, 'lampiran'],
  ['DetailSOP', 'LampiranPeralatanPerlengkapan', compose, 'lampiran'],
  ['DetailSOP', 'LampiranPencatatanPendataan', compose, 'lampiran'],
  ['DetailSOP', 'DasarHukum', compose, 'dasar hukum'],
  ['DetailSOP', 'SopTerkait', compose, 'related out'],
  ['SopTerkait', 'DetailSOP', assoc, 'target'],
  ['DetailSOP', 'LangkahSOP', compose, 'steps'],
  ['LangkahSOP', 'LangkahSOP', assoc, 'next ya/tidak'],
  ['OPD', 'Pelaksana', aggregate, '1..* actors'],
  ['Pelaksana', 'LangkahSOP', aggregate, 'used by step'],
  ['DetailSOP', 'DetailSOPPelaksana', compose, 'swimlane'],
  ['Pelaksana', 'DetailSOPPelaksana', aggregate, 'actor'],
  ['DetailSOP', 'LogEditSOP', compose, 'edit log'],
  ['Pengguna', 'LogEditSOP', aggregate, 'editor'],
  ['LogEditSOP', 'LogEditSopDomainField', compose, 'changed fields'],
  ['OPD', 'PengajuanEvaluasi', aggregate, 'submits'],
  ['PengajuanEvaluasi', 'NilaiEvaluasi', compose, 'nilai'],
  ['DetailSOP', 'NilaiEvaluasi', aggregate, 'evaluated detail'],
  ['NilaiEvaluasi', 'LogNilaiEvaluasi', compose, 'audit'],
  ['PengajuanEvaluasi', 'LogNilaiEvaluasi', aggregate, 'audit'],
  ['Pengguna', 'NilaiEvaluasi', assoc, 'evaluator/follow-up'],
  ['Pengguna', 'LogNilaiEvaluasi', aggregate, 'actor'],
  ['DetailSOP', 'DokumenTte', aggregate, 'SOP_BERLAKU'],
  ['PengajuanEvaluasi', 'DokumenTte', aggregate, 'BA_EVALUASI'],
  ['DokumenTte', 'RiwayatTandaTangan', compose, 'signatures'],
  ['Pengguna', 'RiwayatTandaTangan', aggregate, 'signer'],
  ['DetailSOP', 'KonfigurasiDiagramSOP', compose, 'diagram config'],
  ['KonfigurasiDiagramSOP', 'OverridePanahDiagramSOP', compose, 'arrows'],
  ['OverridePanahDiagramSOP', 'TitikTekukPanahDiagramSOP', compose, 'waypoints'],
  ['KonfigurasiDiagramSOP', 'OverrideLabelDiagramSOP', compose, 'labels'],
  ['LangkahSOP', 'OverridePanahDiagramSOP', aggregate, 'from/to step'],
];

for (const [src, tgt, style, label] of entityLinks) {
  edges += edge(`rel-${src}-${tgt}-${label}`.replaceAll(' ', '-').replaceAll('/', '-'), src, tgt, style, label);
}

const enumLinks = [
  ['Pengguna', 'PeranPengguna', 'peran'],
  ['RiwayatTandaTangan', 'PeranPengguna', 'signing role'],
  ['DetailSOP', 'StatusSOP', 'status'],
  ['LangkahSOP', 'JenisLangkahProsedur', 'jenis'],
  ['LangkahSOP', 'SatuanWaktu', 'satuan'],
  ['PengajuanEvaluasi', 'JenisPengajuanEvaluasi', 'jenis'],
  ['PengajuanEvaluasi', 'StatusPengajuanEvaluasi', 'status'],
  ['NilaiEvaluasi', 'HasilEvaluasi', 'hasil'],
  ['LogNilaiEvaluasi', 'HasilEvaluasi', 'before/after'],
  ['NilaiEvaluasi', 'StatusTindakLanjut', 'feedback'],
  ['LogNilaiEvaluasi', 'StatusTindakLanjut', 'before/after'],
  ['DokumenTte', 'JenisDokumenTte', 'jenis'],
  ['LogEditSOP', 'BagianSOP', 'bagian'],
  ['KonfigurasiDiagramSOP', 'JenisDiagram', 'jenis'],
  ['OverridePanahDiagramSOP', 'JenisDiagram', 'jenis'],
  ['OverridePanahDiagramSOP', 'CabangDiagram', 'cabang'],
  ['OverridePanahDiagramSOP', 'SisiPanahDiagram', 'sSide/eSide'],
  ['TitikTekukPanahDiagramSOP', 'JenisDiagram', 'jenis'],
  ['TitikTekukPanahDiagramSOP', 'CabangDiagram', 'cabang'],
  ['OverrideLabelDiagramSOP', 'JenisDiagram', 'jenis'],
];

for (const [src, tgt, label] of enumLinks) {
  edges += edge(`enum-${src}-${tgt}`, src, tgt, enumUse, label);
}

const pageHeight = Math.max(...entityY, ...enumY, repoY) + 120;
const xml = `<mxfile host="65bd71144e">
    <diagram id="server-uml-repository-entity-enum-class-diagram" name="Repository Entity Enum Class Diagram">
        <mxGraphModel dx="1549" dy="940" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="3060" pageHeight="${pageHeight}" background="#ffffff" math="0" shadow="0" adaptiveColors="auto">
            <root>
                <mxCell id="0"/>
                <mxCell id="1" parent="0"/>
${cells}
${edges}
            </root>
        </mxGraphModel>
    </diagram>
</mxfile>`;

fs.writeFileSync(new URL('../server-class-diagram.drawio', import.meta.url), xml);
console.log('OK', xml.length);
