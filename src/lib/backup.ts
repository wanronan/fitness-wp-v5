import { db } from './db';

export async function exportBackup() {
  const payload = {
    app: 'Fitness WP',
    version: 5,
    exportedAt: new Date().toISOString(),
    sessions: await db.sessions.toArray(),
    measures: await db.measures.toArray()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitness-wp-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function importBackup(file: File) {
  const parsed = JSON.parse(await file.text());
  if (!Array.isArray(parsed.sessions) || !Array.isArray(parsed.measures)) throw new Error('Backup inválido');
  await db.transaction('rw', db.sessions, db.measures, async () => {
    await db.sessions.clear();
    await db.measures.clear();
    if (parsed.sessions.length) await db.sessions.bulkAdd(parsed.sessions.map(({ id, ...s }: any) => s));
    if (parsed.measures.length) await db.measures.bulkAdd(parsed.measures.map(({ id, ...m }: any) => m));
  });
}
