import fs from 'fs';

const stereotypeHeader = (st, name) =>
  '&lt;div style=&quot;text-align:center;line-height:1.3&quot;&gt;&lt;div style=&quot;font-weight:normal;font-size:12px&quot;&gt;&amp;lt;&amp;lt;' +
  st +
  '&amp;gt;&amp;gt;&lt;/div&gt;&lt;div&gt;&lt;b&gt;' +
  name +
  '&lt;/b&gt;&lt;/div&gt;&lt;/div&gt;';

const SWIM =
  'swimlane;fontStyle=0;align=center;childLayout=stackLayout;horizontal=1;startSize=52;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;separatorColor=#000000;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;fontSize=13;';
const TXT =
  'text;strokeColor=#000000;fillColor=#ffffff;align=left;verticalAlign=top;spacingLeft=10;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontSize=13;fontColor=#000000;';
const LINE_H = 18;
const PAD = 12;
const HDR = 52;

function h(lineCount) {
  return Math.max(26, lineCount * LINE_H + PAD);
}

function swimlane(id, name, st, x, y, w, attrLines, opLines) {
  const attrs = attrLines.join('&#10;');
  const ops = opLines.join('&#10;');
  const hasAttr = attrLines.length > 0;
  const hasOps = opLines.length > 0;
  const attrH = hasAttr ? h(attrLines.length) : 0;
  const opH = hasOps ? h(opLines.length) : 0;
  const totalH = HDR + attrH + opH;
  let xml = '';
  xml += `                <mxCell id="${id}" value="${stereotypeHeader(st, name)}" style="${SWIM}" parent="1" vertex="1">\n`;
  xml += `                    <mxGeometry x="${x}" y="${y}" width="${w}" height="${totalH}" as="geometry"/>\n`;
  xml += '                </mxCell>\n';
  let yOff = HDR;
  if (hasAttr) {
    xml += `                <mxCell id="${id}-attr" value="${attrs}" style="${TXT}" parent="${id}" vertex="1">\n`;
    xml += `                    <mxGeometry y="${yOff}" width="${w}" height="${attrH}" as="geometry"/>\n`;
    xml += '                </mxCell>\n';
    yOff += attrH;
  }
  if (hasOps) {
    xml += `                <mxCell id="${id}-ops" value="${ops}" style="${TXT}" parent="${id}" vertex="1">\n`;
    xml += `                    <mxGeometry y="${yOff}" width="${w}" height="${opH}" as="geometry"/>\n`;
    xml += '                </mxCell>\n';
  }
  return { xml, totalH };
}

function enumeration(id, name, x, y, w, literals) {
  const litH = h(literals.length);
  const totalH = HDR + litH;
  const lits = literals.join('&#10;');
  let xml = '';
  xml += `                <mxCell id="${id}" value="${stereotypeHeader('enumeration', name)}" style="${SWIM}" parent="1" vertex="1">\n`;
  xml += `                    <mxGeometry x="${x}" y="${y}" width="${w}" height="${totalH}" as="geometry"/>\n`;
  xml += '                </mxCell>\n';
  xml += `                <mxCell id="${id}-lit" value="${lits}" style="${TXT}" parent="${id}" vertex="1">\n`;
  xml += `                    <mxGeometry y="${HDR}" width="${w}" height="${litH}" as="geometry"/>\n`;
  xml += '                </mxCell>\n';
  return { xml, totalH };
}

function edge(id, src, tgt, style, points) {
  let p = '';
  if (points?.length) {
    p = '\n                        <Array as="points">\n';
    for (const [px, py] of points) {
      p += `                            <mxPoint x="${px}" y="${py}"/>\n`;
    }
    p += '                        </Array>\n';
  }
  return `                <mxCell id="${id}" value="" style="${style}" edge="1" parent="1" source="${src}" target="${tgt}">
                    <mxGeometry relative="1" as="geometry">${p}                    </mxGeometry>
                </mxCell>\n`;
}

const dep = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;dashed=1;endArrow=open;endFill=0;strokeColor=#000000;';
const assoc = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;startArrow=diamondThin;startFill=0;endArrow=none;strokeColor=#000000;';
const comp = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;startArrow=diamond;startFill=1;endArrow=none;strokeColor=#000000;';
const link = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=open;endFill=0;strokeColor=#000000;';

let cells = '';
const BX = 50;
const CX = 400;
const RX = 750;
const EX = 1280;
const W = 300;
const EW = 320;

cells += `                <mxCell id="labelBoundary" value="BOUNDARY / CONTROLLER" style="text;html=1;strokeColor=none;fillColor=none;fontColor=#000000;fontSize=16;fontStyle=1;align=center;" parent="1" vertex="1"><mxGeometry x="${BX}" y="20" width="${W}" height="28" as="geometry"/></mxCell>\n`;
cells += `                <mxCell id="labelControl" value="CONTROL / SERVICE" style="text;html=1;strokeColor=none;fillColor=none;fontColor=#000000;fontSize=16;fontStyle=1;align=center;" parent="1" vertex="1"><mxGeometry x="${CX}" y="20" width="${W}" height="28" as="geometry"/></mxCell>\n`;
cells += `                <mxCell id="labelRepo" value="REPOSITORY" style="text;html=1;strokeColor=none;fillColor=none;fontColor=#000000;fontSize=16;fontStyle=1;align=center;" parent="1" vertex="1"><mxGeometry x="${RX}" y="20" width="${EW}" height="28" as="geometry"/></mxCell>\n`;
cells += `                <mxCell id="labelEntity" value="ENTITY / DOMAIN CLASS" style="text;html=1;strokeColor=none;fillColor=none;fontColor=#000000;fontSize=16;fontStyle=1;align=center;" parent="1" vertex="1"><mxGeometry x="${EX}" y="20" width="900" height="28" as="geometry"/></mxCell>\n`;

let y = 60;
const rowGap = 28;
const addRow = (b, c, r) => {
  const maxH = Math.max(b.totalH, c?.totalH ?? 0, r?.totalH ?? 0);
  cells += b.xml + (c?.xml ?? '') + (r?.xml ?? '');
  return maxH + rowGap;
};

let b = swimlane('AuthController', 'AuthController', 'boundary', BX, y, W, [], ['+ login()', '+ me()', '+ refresh()', '+ logout()', '+ changePassword()']);
let c = swimlane('AuthService', 'AuthService', 'control', CX, y, W, [], ['+ login()', '+ getMe()', '+ refreshSession()', '+ logout()', '+ changePassword()']);
let r = swimlane('AuthRepository', 'AuthRepository', 'repository', RX, y, EW, [], ['+ findActivePenggunaByEmail()', '+ findActivePenggunaById()', '+ startSession()', '+ storeRefreshToken()', '+ revokeSession()']);
y += addRow(b, c, r);

b = swimlane('CoreControllers', 'Core Master Controllers', 'boundary', BX, y, W, ['OpdController', 'PelaksanaController', 'PeraturanController'], ['+ findAll()', '+ create()', '+ update()', '+ remove()']);
c = swimlane('CoreServices', 'Core Master Services', 'control', CX, y, W, ['OpdService', 'PelaksanaService', 'PeraturanService', 'UserOpdAccessService'], ['+ kelolaOPD()', '+ kelolaPelaksana()', '+ kelolaPeraturan()', '+ validasiAksesOPD()']);
r = swimlane('CoreRepositories', 'Core Repositories', 'repository', RX, y, EW, ['OpdRepository', 'PenggunaRepository', 'PelaksanaRepository', 'PeraturanRepository'], ['+ findMany()', '+ create()', '+ update()', '+ softDelete()']);
y += addRow(b, c, r);

b = swimlane('RoleControllers', 'User Role Controllers', 'boundary', BX, y, W, ['EvaluatorController', 'KepalaOpdController', 'PenyusunController'], ['+ listGrup()', '+ create()', '+ update()', '+ aktifkan()', '+ nonaktifkan()', '+ pindah()']);
c = swimlane('RoleServices', 'User Role Services', 'control', CX, y, W, ['EvaluatorService', 'KepalaOpdService', 'PenyusunService'], ['+ createAnggota()', '+ updateAnggota()', '+ softDeleteAnggota()']);
y += addRow(b, c, null);

b = swimlane('SopControllers', 'SOP Authoring Controllers', 'boundary', BX, y, W, ['SopCatalogController', 'SopProsedurController', 'SopDiagramController'], ['+ createSop()', '+ getWorkbench()', '+ updateHeader()', '+ updateProsedur()', '+ updateDiagram()']);
c = swimlane('SopServices', 'SOP Authoring Services', 'control', CX, y, W, ['SopCatalogService', 'SopProsedurService', 'SopDiagramService'], ['+ buatSOP()', '+ ubahHeader()', '+ ubahProsedur()', '+ ubahKonfigurasiDiagram()']);
r = swimlane('SopRepositories', 'SOP Repositories', 'repository', RX, y, EW, ['SopCatalogRepository', 'SopProsedurRepository', 'SopDiagramRepository'], ['+ simpanHeaderSOP()', '+ simpanProsedur()', '+ simpanDiagram()']);
y += addRow(b, c, r);

b = swimlane('PublicSopController', 'SopPublicController', 'boundary', BX, y, W, [], ['+ listOpd()', '+ listSopGlobal()', '+ listSopByOpd()', '+ getDokumen()']);
c = swimlane('PublicSopService', 'SopPublicService', 'control', CX, y, W, [], ['+ listOpd()', '+ listSopGlobal()', '+ listSopByOpd()', '+ getDokumen()']);
y += addRow(b, c, null);

b = swimlane('EvaluationControllers', 'Evaluation Controllers', 'boundary', BX, y, W, ['PengajuanEvaluasiController', 'EvaluasiNilaiController', 'EvaluasiWorkspaceController'], ['+ createPengajuan()', '+ isiNilai()', '+ selesaiEvaluasi()', '+ getGrafikTahunan()']);
c = swimlane('EvaluationServices', 'Evaluation Services', 'control', CX, y, W, ['PengajuanEvaluasiService', 'EvaluasiNilaiService', 'EvaluasiGrafikService'], ['+ buatPengajuan()', '+ isiNilai()', '+ selesaikanEvaluasi()', '+ buatGrafikTahunan()']);
r = swimlane('EvaluationRepositories', 'Evaluation Repositories', 'repository', RX, y, EW, ['PengajuanEvaluasiRepository', 'EvaluasiNilaiRepository'], ['+ createPengajuan()', '+ patchNilai()', '+ appendLogNilai()']);
y += addRow(b, c, r);

b = swimlane('TteControllers', 'TTE Controllers', 'boundary', BX, y, W, ['TteController', 'TtePublicController'], ['+ getProfil()', '+ registerProfil()', '+ tandaTanganiBa()', '+ tandaTanganiSop()', '+ signPdf()', '+ verifyPdf()']);
c = swimlane('TteService', 'TTE Services', 'control', CX, y, W, ['TteService', 'TteProfilService', 'TtePenandatangananService'], ['+ registerProfil()', '+ tandaTanganiBA()', '+ tandaTanganiSOP()', '+ signPdf()', '+ verifyPdf()']);
r = swimlane('TteRepository', 'TteRepository', 'repository', RX, y, EW, [], ['+ findKredensial()', '+ transaksiTandaTanganiBa()', '+ transaksiTandaTanganiSop()']);
y += addRow(b, c, r);

let ey = 60;
const e1 = swimlane('OPD', 'OPD', 'entity', EX, ey, 280, ['- opdId: string', '- nama: string', '- deletedAt: Date?'], ['+ tambahPengguna()', '+ tambahSOP()']);
const e2 = swimlane('Pengguna', 'Pengguna', 'entity', EX + 310, ey, 300, ['- penggunaId: string', '- opdId: string', '- nama: string', '- email: string', '- peran: PeranPengguna'], ['+ login()', '+ ubahProfil()', '+ aktifkanTTE()']);
const e3 = enumeration('PeranPengguna', 'PeranPengguna', EX + 640, ey, 240, ['PJ_EVALUATOR', 'EVALUATOR', 'KEPALA_OPD', 'PJ_PENYUSUN', 'PENYUSUN']);
cells += e1.xml + e2.xml + e3.xml;
ey += Math.max(e1.totalH, e2.totalH, e3.totalH) + rowGap;

const e4 = swimlane('SOP', 'SOP', 'entity', EX, ey, 280, ['- sopId: string', '- opdId: string', '- judul: string'], ['+ buatDraft()', '+ buatRevisi()']);
const e5 = swimlane('DetailSOP', 'DetailSOP', 'entity', EX + 310, ey, 320, ['- detailSopId: string', '- sopId: string', '- nomorSOP: string', '- versi: number', '- status: StatusSOP'], ['+ ajukanEvaluasi()', '+ verifikasi()', '+ sahkan()', '+ cabut()']);
const e6 = enumeration('StatusSOP', 'StatusSOP', EX + 660, ey, 280, ['DRAFT', 'SEDANG_DISUSUN', 'MENUNGGU_PENGAJUAN_EVALUASI', 'DIAJUKAN_EVALUASI', 'SEDANG_DIEVALUASI', 'REVISI_DARI_EVALUATOR', 'MENUNGGU_TTD_PJ_EVALUATOR', 'DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI', 'BERLAKU', 'DIGANTIKAN', 'DICABUT']);
const e7 = swimlane('Pelaksana', 'Pelaksana', 'entity', EX + 970, ey, 260, ['- pelaksanaId: string', '- opdId: string', '- nama: string'], ['+ ubahNama()']);
cells += e4.xml + e5.xml + e6.xml + e7.xml;
ey += Math.max(e4.totalH, e5.totalH, e6.totalH, e7.totalH) + rowGap;

const e8 = swimlane('LangkahSOP', 'LangkahSOP', 'entity', EX, ey, 300, ['- langkahSopId: string', '- detailSopId: string', '- pelaksanaId: string', '- kegiatan: string', '- urutan: number'], ['+ hubungkanYa()', '+ hubungkanTidak()']);
const e9 = swimlane('LampiranSOP', 'LampiranSOP', 'entity', EX + 330, ey, 300, ['- detailSopId: string', '- jenis: JenisLampiran', '- teks: string'], ['+ tambah()', '+ ubahTeks()']);
const e10 = swimlane('Peraturan', 'Peraturan', 'entity', EX + 660, ey, 280, ['- peraturanId: string', '- nama: string', '- nomor: string', '- tahun: number'], ['+ gunakanSebagaiDasarHukum()']);
cells += e8.xml + e9.xml + e10.xml;
ey += Math.max(e8.totalH, e9.totalH, e10.totalH) + rowGap;

const e11 = swimlane('PengajuanEvaluasi', 'PengajuanEvaluasi', 'entity', EX, ey, 320, ['- pengajuanEvaluasiId: string', '- opdId: string', '- status: StatusPengajuanEvaluasi', '- nilaiOPD: number?'], ['+ buatPengajuan()', '+ selesaikanEvaluasi()']);
const e12 = swimlane('NilaiEvaluasi', 'NilaiEvaluasi', 'entity', EX + 350, ey, 300, ['- pengajuanEvaluasiId: string', '- detailSopId: string', '- hasil: HasilEvaluasi?'], ['+ beriNilai()', '+ beriCatatan()']);
const e13 = swimlane('LogNilaiEvaluasi', 'LogNilaiEvaluasi', 'entity', EX + 680, ey, 300, ['- pengajuanEvaluasiId: string', '- detailSopId: string', '- penggunaId: string'], ['+ catatPerubahan()']);
const e14 = swimlane('LogEditSOP', 'LogEditSOP', 'entity', EX + 1010, ey, 300, ['- detailSopId: string', '- penggunaId: string', '- bagian: BagianSOP'], ['+ catatEdit()']);
cells += e11.xml + e12.xml + e13.xml + e14.xml;
ey += Math.max(e11.totalH, e12.totalH, e13.totalH, e14.totalH) + rowGap;

const e15 = swimlane('DokumenTte', 'DokumenTte', 'entity', EX, ey, 300, ['- dokumenTteId: string', '- nomorDokumen: string', '- hashDokumen: string'], ['+ buatHash()', '+ terbitkan()']);
const e16 = swimlane('RiwayatTandaTangan', 'RiwayatTandaTangan', 'entity', EX + 330, ey, 300, ['- userId: string', '- dokumenTteId: string', '- ditandatanganiPada: Date'], ['+ tandaTangani()', '+ verifikasiSignature()']);
const e17 = swimlane('RiwayatOpdPengguna', 'RiwayatOpdPengguna', 'entity', EX + 660, ey, 280, ['- penggunaId: string', '- opdId: string', '- isAktif: boolean'], ['+ aktifkanRiwayat()']);
const e18 = swimlane('KonfigurasiDiagramSOP', 'KonfigurasiDiagramSOP', 'entity', EX + 970, ey, 300, ['- detailSopId: string', '- jenis: JenisDiagram', '- layoutSeed: number'], ['+ simpanOverride()']);
cells += e15.xml + e16.xml + e17.xml + e18.xml;

let edges = '';
edges += edge('e-auth-c-s', 'AuthController', 'AuthService', dep);
edges += edge('e-auth-s-r', 'AuthService', 'AuthRepository', dep);
edges += edge('e-core-c-s', 'CoreControllers', 'CoreServices', dep);
edges += edge('e-core-s-r', 'CoreServices', 'CoreRepositories', dep);
edges += edge('e-role-c-s', 'RoleControllers', 'RoleServices', dep);
edges += edge('e-role-s-r', 'RoleServices', 'CoreRepositories', dep);
edges += edge('e-sop-c-s', 'SopControllers', 'SopServices', dep);
edges += edge('e-sop-s-r', 'SopServices', 'SopRepositories', dep);
edges += edge('e-public-c-s', 'PublicSopController', 'PublicSopService', dep);
edges += edge('e-eval-c-s', 'EvaluationControllers', 'EvaluationServices', dep);
edges += edge('e-eval-s-r', 'EvaluationServices', 'EvaluationRepositories', dep);
edges += edge('e-tte-c-s', 'TteControllers', 'TteService', dep);
edges += edge('e-tte-s-r', 'TteService', 'TteRepository', dep);
edges += edge('r-auth-p', 'AuthRepository', 'Pengguna', dep);
edges += edge('r-core-opd', 'CoreRepositories', 'OPD', dep);
edges += edge('r-sop-detail', 'SopRepositories', 'DetailSOP', dep);
edges += edge('r-eval-p', 'EvaluationRepositories', 'PengajuanEvaluasi', dep);
edges += edge('r-tte-d', 'TteRepository', 'DokumenTte', dep);
edges += edge('d-opd-p', 'OPD', 'Pengguna', assoc);
edges += edge('d-p-role', 'Pengguna', 'PeranPengguna', link);
edges += edge('d-opd-s', 'OPD', 'SOP', assoc);
edges += edge('d-s-d', 'SOP', 'DetailSOP', comp);
edges += edge('d-d-st', 'DetailSOP', 'StatusSOP', link);
edges += edge('d-d-l', 'DetailSOP', 'LangkahSOP', comp);
edges += edge('d-l-p', 'LangkahSOP', 'Pelaksana', link);
edges += edge('d-peng-nilai', 'PengajuanEvaluasi', 'NilaiEvaluasi', comp);
edges += edge('d-nilai-log', 'NilaiEvaluasi', 'LogNilaiEvaluasi', comp);
edges += edge('d-detail-logedit', 'DetailSOP', 'LogEditSOP', comp);
edges += edge('d-detail-diagram', 'DetailSOP', 'KonfigurasiDiagramSOP', comp);
edges += edge('d-pengguna-riwayat', 'Pengguna', 'RiwayatOpdPengguna', comp);
edges += edge('d-opd-riwayat', 'OPD', 'RiwayatOpdPengguna', assoc);
edges += edge('d-d-tt', 'DetailSOP', 'DokumenTte', link);
edges += edge('d-peng-tt', 'PengajuanEvaluasi', 'DokumenTte', link);
edges += edge('d-tt-r', 'DokumenTte', 'RiwayatTandaTangan', comp);
edges += edge('d-p-tt', 'Pengguna', 'RiwayatTandaTangan', link);

const xml = `<mxfile host="65bd71144e">
    <diagram id="server-uml-analysis-class-diagram" name="UML Analysis Class Diagram">
        <mxGraphModel dx="1549" dy="940" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2600" pageHeight="2200" background="#ffffff" math="0" shadow="0">
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
