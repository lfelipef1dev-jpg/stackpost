const fs = require('fs');
const token = fs.readFileSync('C:\\\\Users\\\\lfeli\\\\Desktop\\\\StackPost\\\\.devin\\\\secrets\\\\supabase-master-global-token.txt', 'utf8').trim();
const ref = 'aaynzvvoeufunbpzblwa';

async function get(url) {
  const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token }});
  const t = await r.text();
  return { status: r.status, body: t.substring(0, 500) };
}

(async () => {
  const endpoints = [
    `https://api.supabase.com/v1/projects/${ref}`,
    `https://api.supabase.com/v1/projects/${ref}/database/tables`,
    `https://api.supabase.com/v1/projects/${ref}/database/schemas`,
    `https://api.supabase.com/v1/projects/${ref}/database/roles`,
    `https://api.supabase.com/v1/projects/${ref}/database/extensions`,
    `https://api.supabase.com/v1/projects/${ref}/database/rls-policies`,
    `https://api.supabase.com/v1/projects/${ref}/database/policies`,
  ];
  for (const u of endpoints) {
    const res = await get(u);
    console.log(res.status + ' ' + u);
    if (res.status === 200) {
      try {
        const j = JSON.parse(res.body);
        console.log(JSON.stringify(j).substring(0, 300));
      } catch {
        console.log(res.body);
      }
    } else {
      console.log(res.body);
    }
    console.log('---');
  }
})();
