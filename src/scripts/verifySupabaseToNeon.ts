import "dotenv/config";
import pg from "pg";
import { getDumpPath, parseIconsDump } from "./dumpIcons";

const { Client } = pg;

const targetUrl = process.env.DATABASE_URL;

if (!targetUrl) {
  throw new Error("Missing DATABASE_URL in environment variables");
}

type CountRow = { count: string };
type SampleRow = { id: number; name: string; library: string; content: string; created_at: Date };
type LibraryRow = { library: string };

async function main() {
  const target = new Client({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });

  await target.connect();

  try {
    const { rows, dumpPath } = parseIconsDump();
    const sourceLibraryList = Array.from(new Set(rows.map((row) => row.library))).sort((a, b) =>
      a.localeCompare(b),
    );
    const sourceSamples = rows.slice(0, 10);
    const [targetCount, targetLibraries, targetSamples] =
      await Promise.all([
        target.query<CountRow>("select count(*)::text as count from icons"),
        target.query<LibraryRow>("select distinct library from icons order by library asc"),
        target.query<SampleRow>(
          "select id, name, library, content, created_at from icons order by id asc limit 10",
        ),
      ]);

    const targetLibraryList = targetLibraries.rows.map((row) => row.library);
    const sampleMismatch = sourceSamples.some((row, index) => {
      const targetRow = targetSamples.rows[index];
      return (
        !targetRow ||
        row.id !== targetRow.id ||
        row.name !== targetRow.name ||
        row.library !== targetRow.library ||
        row.content !== targetRow.content ||
        row.createdAt.toISOString() !== targetRow.created_at.toISOString()
      );
    });

    console.log(`Source dump: ${dumpPath}`);
    console.log(`Source row count: ${rows.length}`);
    console.log(`Target row count: ${targetCount.rows[0]?.count ?? "0"}`);
    console.log(`Distinct libraries match: ${JSON.stringify(sourceLibraryList) === JSON.stringify(targetLibraryList)}`);
    console.log(`First 10 rows match: ${!sampleMismatch}`);

    if (
      String(rows.length) !== targetCount.rows[0]?.count ||
      JSON.stringify(sourceLibraryList) !== JSON.stringify(targetLibraryList) ||
      sampleMismatch
    ) {
      process.exitCode = 1;
    }
  } finally {
    await target.end();
  }
}

main().catch((error) => {
  console.error("SQL dump to Neon verification failed.");
  console.error(error);
  process.exitCode = 1;
});
