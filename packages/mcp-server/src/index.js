#!/usr/bin/env node
// StackPost MCP Server - Claude, Cursor e AI agents
// Model Context Protocol server for social media publishing

const BASE_URL = process.env.STACKPOST_API_URL || 'https://stackpost.expostacker.com.br';
const API_KEY = process.env.STACKPOST_API_KEY;

if (!API_KEY) {
  console.error('STACKPOST_API_KEY not set');
  process.exit(1);
}

const readline = require('readline');

const TOOLS = [
  {
    name: 'create_post',
    description: 'Create a social media post on one or more platforms',
    inputSchema: {
      type: 'object',
      properties: {
        platforms: { type: 'array', items: { type: 'string' }, description: 'Platforms: instagram, facebook, tiktok, youtube, linkedin, x, threads, pinterest, reddit, bluesky, mastodon, discord, slack, google_business, snapchat' },
        text: { type: 'string', description: 'Post caption/text' },
        uploadIds: { type: 'array', items: { type: 'string' } },
        scheduledAt: { type: 'string', description: 'ISO 8601 datetime for scheduling' },
        firstComment: { type: 'string' },
      },
      required: ['platforms', 'text'],
    },
  },
  {
    name: 'publish_post',
    description: 'Publish a scheduled or draft post immediately',
    inputSchema: { type: 'object', properties: { postId: { type: 'string' } }, required: ['postId'] },
  },
  {
    name: 'list_posts',
    description: 'List posts with optional cursor pagination',
    inputSchema: { type: 'object', properties: { cursor: { type: 'string' }, limit: { type: 'number' } } },
  },
  {
    name: 'list_accounts',
    description: 'List connected social accounts',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'upload_from_url',
    description: 'Upload media from a URL',
    inputSchema: { type: 'object', properties: { url: { type: 'string' }, fileName: { type: 'string' } }, required: ['url'] },
  },
  {
    name: 'get_analytics',
    description: 'Get analytics for a post or platform',
    inputSchema: { type: 'object', properties: { postId: { type: 'string' }, platform: { type: 'string' } } },
  },
  {
    name: 'generate_caption',
    description: 'Generate AI caption for a platform and topic',
    inputSchema: { type: 'object', properties: { platform: { type: 'string' }, topic: { type: 'string' } }, required: ['platform', 'topic'] },
  },
  {
    name: 'suggest_hashtags',
    description: 'Suggest hashtags for content',
    inputSchema: { type: 'object', properties: { platform: { type: 'string' }, content: { type: 'string' } }, required: ['content'] },
  },
  {
    name: 'get_best_time',
    description: 'Get best posting time for a platform',
    inputSchema: { type: 'object', properties: { platform: { type: 'string' } }, required: ['platform'] },
  },
];

async function callApi(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function executeTool(name, args) {
  switch (name) {
    case 'create_post': return await callApi('POST', '/api/posts', args);
    case 'publish_post': return await callApi('POST', '/api/posts/publish', args);
    case 'list_posts': {
      const q = args.cursor ? `?cursor=${args.cursor}&limit=${args.limit || 20}` : `?limit=${args.limit || 20}`;
      return await callApi('GET', `/api/posts${q}`);
    }
    case 'list_accounts': return await callApi('GET', '/api/accounts');
    case 'upload_from_url': return await callApi('POST', '/api/upload/from-url', args);
    case 'get_analytics': {
      const q = args.postId ? `?postId=${args.postId}` : args.platform ? `?platform=${args.platform}` : '';
      return await callApi('GET', `/api/analytics${q}`);
    }
    case 'generate_caption': return await callApi('POST', '/api/ai/caption', args);
    case 'suggest_hashtags': return await callApi('POST', '/api/ai/hashtags', args);
    case 'get_best_time': return await callApi('GET', `/api/best-time?platform=${args.platform}`);
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });

async function handleMessage(line) {
  try {
    const msg = JSON.parse(line);
    if (msg.method === 'initialize') {
      return { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'stackpost-mcp', version: '1.0.0' } };
    }
    if (msg.method === 'tools/list') {
      return { tools: TOOLS };
    }
    if (msg.method === 'tools/call') {
      const result = await executeTool(msg.params.name, msg.params.arguments || {});
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    return null;
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
}

rl.on('line', async (line) => {
  const result = await handleMessage(line);
  if (result !== null) {
    const id = JSON.parse(line).id;
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
  }
});
