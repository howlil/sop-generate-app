import * as mysql from 'mysql2/promise';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  // Connect via mysql2 to run raw dynamic queries
  const dbNameMatch = connectionString.match(/\/([^\/\?]+)(\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : 'sop_biro_organisasi';

  const connection = await mysql.createConnection(connectionString);

  console.log(`\nMengecek database: ${dbName} ...\n`);

  // Get all tables
  const [tables] = await connection.query(
    'SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ?',
    [dbName]
  ) as any[];

  if (tables.length === 0) {
    console.log('Tidak ada tabel yang ditemukan.');
    await connection.end();
    return;
  }

  const uselessFields: { table: string; column: string; totalRows: number }[] = [];

  for (const t of tables) {
    const tableName = t.TABLE_NAME;

    // Get row count
    const [countRes] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``) as any[];
    const rowCount = countRes[0].count;

    if (rowCount === 0) {
      console.log(`Tabel \`${tableName}\` kosong (0 baris). Dilewati.`);
      continue;
    }

    // Get all columns for the table
    const [columns] = await connection.query(
      'SELECT COLUMN_NAME, IS_NULLABLE FROM information_schema.columns WHERE table_schema = ? AND table_name = ?',
      [dbName, tableName]
    ) as any[];

    const checkPromises = columns.map(async (col: any) => {
      const colName = col.COLUMN_NAME;
      // Check if all rows are null or empty
      const [nullCountRes] = await connection.query(
        `SELECT COUNT(*) as nullCount FROM \`${tableName}\` WHERE \`${colName}\` IS NULL`
      ) as any[];
      const nullCount = nullCountRes[0].nullCount;

      if (nullCount === rowCount) {
        uselessFields.push({
          table: tableName,
          column: colName,
          totalRows: rowCount,
        });
      }
    });

    await Promise.all(checkPromises);
  }

  await connection.end();

  console.log('--- HASIL PENGECEKAN FIELD YANG MUNGKIN TIDAK BERGUNA ---');
  if (uselessFields.length === 0) {
    console.log('Semua kolom setidaknya memiliki 1 data yang terisi.');
  } else {
    console.log('Berikut adalah kolom-kolom yang 100% isinya NULL atau kosong string:\n');
    uselessFields.forEach((f) => {
      console.log(`- Tabel: ${f.table} | Kolom: ${f.column} (di ${f.totalRows} baris)`);
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
