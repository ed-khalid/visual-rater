import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Sql } from 'postgres'

const DIR = join(import.meta.dirname, 'db')

/**
 * Applies any migrations in server/db/ that haven't been applied yet, in filename order (NNN.description.sql),
 * each in its own transaction, recording them in schema_migrations. Returns the names it applied.
 */
export const migrate = async (sql: Sql, dir = DIR): Promise<string[]> => {
  await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`
  const done = new Set((await sql<{ name: string }[]>`select name from schema_migrations`).map(r => r.name))
  const files = (await readdir(dir)).filter(f => /^\d+\..+\.sql$/.test(f)).sort()
  const applied: string[] = []
  for (const file of files) {
    if (done.has(file)) continue
    const text = await readFile(join(dir, file), 'utf8')
    await sql.begin(async tx => {
      await tx.unsafe(text)
      await tx`insert into schema_migrations (name) values (${file})`
    })
    applied.push(file)
  }
  return applied
}
