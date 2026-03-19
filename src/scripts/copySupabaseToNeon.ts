import "dotenv/config";
import pg from "pg";
import { parseIconsDump } from "./dumpIcons";

const { Client } = pg;

const targetUrl = process.env.DATABASE_URL;

if (!targetUrl) {
  throw new Error("Missing DATABASE_URL in environment variables");
}

const batchSize = 500;

async function main() {
  const target = new Client({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });

  await target.connect();

  try {
    const { dumpPath, rows } = parseIconsDump();

    await target.query("begin");
    await target.query("truncate table icons restart identity");

    for (let start = 0; start < rows.length; start += batchSize) {
      const batch = rows.slice(start, start + batchSize);
      const values: Array<number | string | Date> = [];
      const placeholders = batch.map((row: (typeof batch)[number], index: number) => {
        const offset = index * 5;
        values.push(row.id, row.name, row.library, row.content, row.createdAt);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
      });

      await target.query(
        `insert into icons (id, name, library, content, created_at) values ${placeholders.join(", ")}`,
        values,
      );
    }

    await target.query(`
      select setval(
        pg_get_serial_sequence('icons', 'id'),
        coalesce((select max(id) from icons), 1),
        true
      )
    `);
    await target.query("commit");

    const [{ count: sourceCount }] = rows.length ? [{ count: rows.length }] : [{ count: 0 }];
    const targetCountResult = await target.query<{ count: string }>("select count(*)::text as count from icons");

    console.log(`Imported ${sourceCount} rows from ${dumpPath} into Neon.`);
    console.log(`Target row count: ${targetCountResult.rows[0]?.count ?? "0"}`);
  } catch (error) {
    await target.query("rollback");
    throw error;
  } finally {
    await target.end();
  }
}

main().catch((error) => {
  console.error("SQL dump to Neon import failed.");
  console.error(error);
  process.exitCode = 1;
});
