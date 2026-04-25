const { execSync } = require('child_process');
const date = new Date().toISOString().slice(0, 10);
const container = 'supabase_db_grocery-app';
const out = 'supabase/dumps';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

run(`docker exec ${container} pg_dump -U postgres -d postgres --schema-only --schema public -f /tmp/schema.sql`);
run(`docker cp ${container}:/tmp/schema.sql ${out}/dump_schema_${date}.sql`);

run(`docker exec ${container} pg_dump -U postgres -d postgres --data-only --schema public -f /tmp/data.sql`);
run(`docker cp ${container}:/tmp/data.sql ${out}/dump_data_${date}.sql`);

run(`docker exec ${container} pg_dump -U postgres -d postgres --data-only -t auth.users -f /tmp/auth.sql`);
run(`docker cp ${container}:/tmp/auth.sql ${out}/dump_auth_${date}.sql`);

console.log(`Дамп сохранён: ${out}/*_${date}.sql`);
