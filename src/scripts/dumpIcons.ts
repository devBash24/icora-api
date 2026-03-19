import fs from "fs";
import path from "path";

export type DumpIconRow = {
  id: number;
  name: string;
  library: string;
  content: string;
  createdAt: Date;
};

const defaultDumpPath = path.resolve(process.cwd(), "db_cluster-25-04-2025@14-25-40.backup");

function resolveDumpPath(): string {
  const cliPath = process.argv[2];
  return path.resolve(cliPath || process.env.SUPABASE_DUMP_PATH || defaultDumpPath);
}

function decodeCopyValue(value: string): string {
  return value
    .replace(/\\\\/g, "\\")
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r");
}

function parseDumpLine(line: string): DumpIconRow {
  const parts = line.split("\t");
  if (parts.length !== 5) {
    throw new Error(`Unexpected icons row format. Expected 5 columns, received ${parts.length}.`);
  }

  const [id, name, library, content, createdAt] = parts.map((part) =>
    part === "\\N" ? "" : decodeCopyValue(part),
  );

  return {
    id: Number(id),
    name,
    library,
    content,
    createdAt: new Date(createdAt),
  };
}

export function getDumpPath(): string {
  return resolveDumpPath();
}

export function parseIconsDump() {
  const dumpPath = resolveDumpPath();
  const dumpContent = fs.readFileSync(dumpPath, "utf8");
  const copyBlockMatch = dumpContent.match(
    /COPY public\.icons \(id, name, library, content, created_at\) FROM stdin;\r?\n([\s\S]*?)\r?\n\\\./,
  );

  if (!copyBlockMatch) {
    throw new Error(`Could not find icons COPY block in ${dumpPath}`);
  }

  const matchStart = copyBlockMatch.index ?? 0;

  const copyPayload = dumpContent
    .slice(matchStart, matchStart + copyBlockMatch[0].length)
    .replace(/^COPY public\.icons \(id, name, library, content, created_at\) FROM stdin;\r?\n/, "")
    .replace(/\r?\n\\\.$/, "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  const rows = copyPayload.map(parseDumpLine);

  return {
    dumpPath,
    rows,
  };
}
