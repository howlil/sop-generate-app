import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const schemaPath = path.join(root, 'prisma', 'schema.prisma');
const outputPath = path.resolve(root, '..', 'docs', 'server-prisma-erd.drawio');

const schema = fs.readFileSync(schemaPath, 'utf8');

const moduleNames = {
  Pengguna: 'MASTER & AKSES',
  OPD: 'MASTER & AKSES',
  RiwayatOpdPengguna: 'MASTER & AKSES',
  Peraturan: 'REGULASI',
  OPDPeraturan: 'REGULASI',
  SOP: 'AUTHORING SOP',
  DetailSOP: 'AUTHORING SOP',
  LampiranPeringatan: 'AUTHORING SOP',
  LampiranKualifikasiPelaksanaan: 'AUTHORING SOP',
  LampiranPeralatanPerlengkapan: 'AUTHORING SOP',
  LampiranPencatatanPendataan: 'AUTHORING SOP',
  DasarHukum: 'AUTHORING SOP',
  SopTerkait: 'AUTHORING SOP',
  LangkahSOP: 'AUTHORING SOP',
  Pelaksana: 'AUTHORING SOP',
  DetailSOPPelaksana: 'AUTHORING SOP',
  LogEditSOP: 'KOLABORASI SOP',
  LogEditSopDomainField: 'KOLABORASI SOP',
  PengajuanEvaluasi: 'PENGAJUAN & EVALUASI',
  NilaiEvaluasi: 'PENGAJUAN & EVALUASI',
  LogNilaiEvaluasi: 'PENGAJUAN & EVALUASI',
  DokumenTte: 'LEGALISASI & TTE',
  RiwayatTandaTangan: 'LEGALISASI & TTE',
  KonfigurasiDiagramSOP: 'DIAGRAM SOP',
  OverridePanahDiagramSOP: 'DIAGRAM SOP',
  TitikTekukPanahDiagramSOP: 'DIAGRAM SOP',
  OverrideLabelDiagramSOP: 'DIAGRAM SOP',
};

const layoutPositions = {
  OPD: { x: 380, y: 1987 },
  Pengguna: { x: 830, y: 1662 },
  RiwayatOpdPengguna: { x: 1361, y: 1833 },
  Peraturan: { x: 1361, y: 947 },
  OPDPeraturan: { x: 1892.5, y: 320 },
  SOP: { x: 850.5, y: 1480 },
  DetailSOP: { x: 1360.5, y: 1340 },
  LampiranPeringatan: { x: 1892.5, y: 1498 },
  LampiranKualifikasiPelaksanaan: { x: 1865.5, y: 636 },
  LampiranPeralatanPerlengkapan: { x: 1869, y: 818 },
  LampiranPencatatanPendataan: { x: 1876, y: 1000 },
  DasarHukum: { x: 1892.5, y: 478 },
  SopTerkait: { x: 1892.5, y: 1182 },
  LangkahSOP: { x: 1851, y: 1680 },
  Pelaksana: { x: 1361, y: 2015 },
  DetailSOPPelaksana: { x: 1892.5, y: 2886 },
  LogEditSOP: { x: 1892.5, y: 2102 },
  LogEditSopDomainField: { x: 2394, y: 1733 },
  PengajuanEvaluasi: { x: 1291, y: 2591 },
  NilaiEvaluasi: { x: 1856, y: 3068 },
  LogNilaiEvaluasi: { x: 2354, y: 3056 },
  DokumenTte: { x: 1887, y: 2356 },
  RiwayatTandaTangan: { x: 2394, y: 1891 },
  KonfigurasiDiagramSOP: { x: 1889, y: 1340 },
  OverridePanahDiagramSOP: { x: 2394, y: 1320 },
  TitikTekukPanahDiagramSOP: { x: 2810, y: 1320 },
  OverrideLabelDiagramSOP: { x: 2810, y: 1574 },
};

const enumBlocks = [...schema.matchAll(/enum\s+(\w+)\s*\{([\s\S]*?)\}/g)].map((match) => ({
  name: match[1],
  values: match[2]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//')),
}));
const enumNames = new Set(enumBlocks.map((item) => item.name));

function parseModels(source) {
  return [...source.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\}/g)].map((match) => {
    const name = match[1];
    const body = match[2];
    const lines = body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('///') && !line.startsWith('//'));

    const fields = [];
    const uniqueSingles = new Set();
    const compositeIds = [];
    const uniqueComposites = [];
    const indexes = [];

    for (const line of lines) {
      if (line.startsWith('@@id')) {
        compositeIds.push(parseListAttribute(line));
      } else if (line.startsWith('@@unique')) {
        uniqueComposites.push(parseListAttribute(line));
      } else if (line.startsWith('@@index')) {
        indexes.push(parseListAttribute(line));
      } else if (!line.startsWith('@@')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const field = {
            name: parts[0],
            typeRaw: parts[1],
            attrs: line.slice(parts[0].length + parts[1].length).trim(),
            isScalar: false,
            isRequired: !parts[1].includes('?'),
            isList: parts[1].endsWith('[]'),
            isId: line.includes('@id'),
            isUnique: line.includes('@unique'),
            dbType: null,
            relation: null,
          };
          field.type = field.typeRaw.replace(/[?\[\]]/g, '');
          field.isScalar = isScalarType(field.type) || enumNames.has(field.type);
          field.dbType = toDbType(field);
          field.relation = parseRelation(line);
          if (field.isUnique) uniqueSingles.add(field.name);
          fields.push(field);
        }
      }
    }

    return {
      name,
      module: moduleNames[name] ?? 'LAINNYA',
      fields,
      scalarFields: fields.filter((field) => field.isScalar),
      relationFields: fields.filter((field) => field.relation),
      uniqueSingles,
      compositeIds,
      uniqueComposites,
      indexes,
    };
  });
}

function parseListAttribute(line) {
  const match = line.match(/\[([^\]]+)\]/);
  if (!match) return [];
  return match[1].split(',').map((item) => item.trim());
}

function parseRelation(line) {
  const relationMatch = line.match(/@relation\((.+)\)/);
  if (!relationMatch) return null;
  const relationArgs = relationMatch[1];
  const fields = parseNamedList(relationArgs, 'fields');
  const references = parseNamedList(relationArgs, 'references');
  if (!fields.length || !references.length) return null;
  return { fields, references };
}

function parseNamedList(text, name) {
  const match = text.match(new RegExp(`${name}:\\s*\\[([^\\]]+)\\]`));
  if (!match) return [];
  return match[1].split(',').map((item) => item.trim());
}

function isScalarType(type) {
  return ['String', 'Int', 'Boolean', 'DateTime', 'Float', 'Decimal', 'BigInt', 'Bytes', 'Json'].includes(type);
}

function toDbType(field) {
  if (!field.isScalar) return '';
  const attrs = field.attrs;
  if (attrs.includes('@db.VarChar')) {
    const size = attrs.match(/@db\.VarChar\((\d+)\)/)?.[1] ?? '191';
    return `VARCHAR(${size})${field.isRequired ? '' : ' NULL'}`;
  }
  if (attrs.includes('@db.Char')) {
    const size = attrs.match(/@db\.Char\((\d+)\)/)?.[1] ?? '191';
    return `CHAR(${size})${field.isRequired ? '' : ' NULL'}`;
  }
  if (attrs.includes('@db.LongText')) return `LONGTEXT${field.isRequired ? '' : ' NULL'}`;
  if (attrs.includes('@db.Text')) return `TEXT${field.isRequired ? '' : ' NULL'}`;
  if (attrs.includes('@db.DateTime')) {
    const precision = attrs.match(/@db\.DateTime\((\d+)\)/)?.[1] ?? '3';
    return `DATETIME(${precision})${field.isRequired ? '' : ' NULL'}`;
  }
  if (enumNames.has(field.type)) return `ENUM ${field.type}${field.isRequired ? '' : ' NULL'}`;

  const base = {
    String: 'VARCHAR(191)',
    Int: 'INT',
    Boolean: 'BOOLEAN',
    DateTime: 'DATETIME(3)',
    Float: 'DOUBLE',
    Decimal: 'DECIMAL',
    BigInt: 'BIGINT',
    Bytes: 'LONGBLOB',
    Json: 'JSON',
  }[field.type] ?? field.type.toUpperCase();

  return `${base}${field.isRequired ? '' : ' NULL'}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function idFor(prefix, name) {
  return `${prefix}_${name.replace(/[^A-Za-z0-9_]/g, '_')}`;
}

function tableHeight(model) {
  return 32 + model.scalarFields.length * 24;
}

function tableWidth(model) {
  const longestField = Math.max(...model.scalarFields.map((field) => field.name.length), model.name.length);
  const longestType = Math.max(...model.scalarFields.map((field) => field.dbType.length), 12);
  return Math.max(320, Math.min(460, 78 + longestField * 7 + longestType * 6));
}

function keyFor(model, field) {
  const compositePk = model.compositeIds.some((idFields) => idFields.includes(field.name));
  const isPk = field.isId || compositePk;
  const isFk = model.relationFields.some((relationField) => relationField.relation.fields.includes(field.name));
  if (isPk && isFk) return 'PFK';
  if (isPk) return 'PK';
  if (isFk) return 'FK';
  return '';
}

function placeModels(models) {
  const placements = new Map();
  let fallbackIndex = 0;
  for (const model of models) {
    const position = layoutPositions[model.name] ?? {
      x: 320 + (fallbackIndex % 4) * 500,
      y: 3400 + Math.floor(fallbackIndex / 4) * 220,
    };
    if (!layoutPositions[model.name]) fallbackIndex += 1;
    placements.set(model.name, {
      x: position.x,
      y: position.y,
      width: tableWidth(model),
      height: tableHeight(model),
      moduleName: model.module,
    });
  }
  return placements;
}

function addVertex(cells, id, value, style, x, y, width, height, parent = '1') {
  cells.push(
    `<mxCell id="${id}" value="${escapeXml(value)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" /></mxCell>`,
  );
}

function addEdge(cells, id, source, target, startArrow, endArrow) {
  const style = [
    'edgeStyle=orthogonalEdgeStyle',
    'rounded=0',
    'orthogonalLoop=1',
    'jettySize=auto',
    'html=1',
    'endFill=0',
    'startFill=0',
    `startArrow=${startArrow}`,
    `endArrow=${endArrow}`,
    'strokeColor=#000000',
    'fontColor=#000000',
    'strokeWidth=1.4',
    'fontSize=11',
  ].join(';');
  cells.push(
    `<mxCell id="${id}" value="" style="${style};" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry" /></mxCell>`,
  );
}

function modelTableValue(model) {
  const rows = [
    `<tr><th colspan="3" bgcolor="#ffffff"><font color="#000000">${model.name}</font></th></tr>`,
  ];
  for (const field of model.scalarFields) {
    const key = keyFor(model, field);
    const unique = field.isUnique ? ' (unique)' : '';
    rows.push(
      `<tr><td width="42" align="left"><font color="#000000"><b>${key}</b></font></td><td align="left"><font color="#000000">${field.name}${unique}</font></td><td align="left"><font color="#000000">${field.dbType}</font></td></tr>`,
    );
  }
  return `<table border="1" cellpadding="2" cellspacing="0" width="100%" height="100%">${rows.join('')}</table>`;
}

function buildXml(models) {
  const modelMap = new Map(models.map((model) => [model.name, model]));
  const placements = placeModels(models);
  const cells = ['<mxCell id="0" />', '<mxCell id="1" parent="0" />'];

  for (const model of models) {
    const placement = placements.get(model.name);
    if (!placement) continue;
    const tableId = idFor('table', model.name);
    addVertex(
      cells,
      tableId,
      modelTableValue(model),
      'rounded=0;whiteSpace=wrap;html=1;align=center;verticalAlign=top;spacing=0;overflow=fill;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;',
      placement.x,
      placement.y,
      placement.width,
      placement.height,
    );
  }

  let edgeIndex = 0;
  for (const model of models) {
    for (const field of model.relationFields) {
      const parent = modelMap.get(field.type);
      if (!parent) continue;
      const targetFields = field.relation.fields;
      const parentCardinality = 'ERmandOne';
      const childCardinality = 'ERoneToMany';
      addEdge(
        cells,
        `rel_${edgeIndex++}_${parent.name}_${model.name}_${field.name}`,
        idFor('table', parent.name),
        idFor('table', model.name),
        parentCardinality,
        childCardinality,
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-05-25T00:00:00.000Z" agent="Codex" version="24.7.17" type="device">
  <diagram id="prisma-erd" name="Prisma ERD">
    <mxGraphModel dx="3540" dy="1903" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}

function isUniqueFieldSet(model, fields) {
  if (fields.length === 1 && (model.uniqueSingles.has(fields[0]) || model.fields.find((field) => field.name === fields[0])?.isId)) {
    return true;
  }
  return (
    model.compositeIds.some((set) => sameSet(set, fields)) ||
    model.uniqueComposites.some((set) => sameSet(set, fields))
  );
}

function sameSet(left, right) {
  return left.length === right.length && left.every((item) => right.includes(item));
}

const models = parseModels(schema);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buildXml(models), 'utf8');
console.log(outputPath);
