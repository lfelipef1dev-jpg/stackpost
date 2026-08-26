const fs = require('fs');
const path = require('path');

const endpoints = [
  { p: 'posts/[id]', methods: ['GET','DELETE','PATCH'], desc: 'Get/update/delete single post' },
  { p: 'posts/[id]/retry', methods: ['POST'], desc: 'Retry failed post' },
  { p: 'posts/reference-key/[referenceKey]', methods: ['GET'], desc: 'Get post by reference key' },
  { p: 'organization', methods: ['GET','PATCH'], desc: 'Organization info and settings' },
  { p: 'usage/posts', methods: ['GET'], desc: 'Post usage stats' },
  { p: 'usage/comments', methods: ['GET'], desc: 'Comment usage stats' },
  { p: 'usage/uploads', methods: ['GET'], desc: 'Upload usage stats' },
  { p: 'usage/imports', methods: ['GET'], desc: 'Import usage stats' },
  { p: 'accounts/connect', methods: ['POST'], desc: 'Connect social account' },
  { p: 'accounts/disconnect', methods: ['POST'], desc: 'Disconnect social account' },
  { p: 'accounts/set-channel', methods: ['POST'], desc: 'Set channel for account' },
  { p: 'accounts/unset-channel', methods: ['POST'], desc: 'Unset channel' },
  { p: 'accounts/refresh-channels', methods: ['POST'], desc: 'Refresh channels' },
  { p: 'accounts/profile-refresh', methods: ['POST'], desc: 'Refresh profile data' },
  { p: 'accounts/by-type', methods: ['GET'], desc: 'List accounts by platform type' },
  { p: 'accounts/copy', methods: ['POST'], desc: 'Copy account to another team' },
  { p: 'analytics/account', methods: ['GET'], desc: 'Account analytics' },
  { p: 'analytics/account/raw', methods: ['GET'], desc: 'Raw account analytics' },
  { p: 'analytics/account/force', methods: ['POST'], desc: 'Force refresh account analytics' },
  { p: 'analytics/post', methods: ['GET'], desc: 'Post analytics' },
  { p: 'analytics/post/raw', methods: ['GET'], desc: 'Raw post analytics' },
  { p: 'analytics/post/bulk', methods: ['POST'], desc: 'Bulk post analytics' },
  { p: 'analytics/post/force', methods: ['POST'], desc: 'Force refresh post analytics' },
  { p: 'comments/[id]', methods: ['GET','DELETE'], desc: 'Get/delete comment' },
  { p: 'comments/[id]/retry', methods: ['POST'], desc: 'Retry failed comment' },
  { p: 'comments/import', methods: ['POST'], desc: 'Import comments' },
  { p: 'comments/import/comments', methods: ['GET'], desc: 'List imported comments' },
  { p: 'comments/import/[importId]', methods: ['GET'], desc: 'Get import status' },
];

const base = 'C:\\Users\\lfeli\\Desktop\\StackPost\\apps\\web\\src\\app\\api';
let created = 0;

for (const ep of endpoints) {
  const dir = path.join(base, ep.p.split('/').join(path.sep));
  fs.mkdirSync(dir, { recursive: true });
  
  let handlers = '';
  for (const m of ep.methods) {
    const hasBody = ['POST','PATCH','PUT'].includes(m);
    const bodyLine = hasBody ? '  const body = await req.json().catch(() => ({}));\n' : '';
    handlers += `export async function ${m}(req: NextRequest) {\n${bodyLine}  const supabase = getSupabase();\n  // TODO: ${ep.desc}\n  return NextResponse.json({ ok: true, endpoint: '${ep.p}', method: '${m}' });\n}\n\n`;
  }
  
  const content = `import { NextRequest, NextResponse } from 'next/server';\nimport { getSupabase } from '@/lib/supabase';\n\n// ${ep.desc}\n${handlers}`;
  fs.writeFileSync(path.join(dir, 'route.ts'), content, 'utf8');
  created++;
}

console.log(`Created ${created} endpoints`);
