#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_BASE = process.env.STACKPOST_API_URL || 'https://stackpost.expostacker.com.br';
const API_KEY = process.env.STACKPOST_API_KEY || '';

async function apiCall(method: string, path: string, body?: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

const tools = [
  {
    name: 'create_post',
    description: 'Create a social media post on StackPost',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Post content/caption' },
        platforms: { type: 'array', items: { type: 'string' }, description: 'Platforms to post to' },
        scheduledAt: { type: 'string', description: 'ISO 8601 datetime to schedule' },
        uploadIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['content', 'platforms'],
    },
  },
  {
    name: 'list_posts',
    description: 'List posts from StackPost',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max results (default 50)' },
        cursor: { type: 'string', description: 'Pagination cursor' },
      },
    },
  },
  {
    name: 'list_accounts',
    description: 'List connected social accounts',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_analytics',
    description: 'Get analytics summary for the team',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'upload_from_url',
    description: 'Upload media from a public URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Public HTTP(S) URL' },
        fileName: { type: 'string' },
      },
      required: ['url'],
    },
  },
  {
    name: 'get_best_time',
    description: 'Get best time to post recommendations',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'Platform name (optional)' },
      },
    },
  },
  {
    name: 'generate_caption',
    description: 'Generate an AI caption for a post',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Topic or description' },
        platform: { type: 'string' },
        tone: { type: 'string', description: 'professional, casual, funny, inspirational, promotional' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'suggest_hashtags',
    description: 'Get hashtag suggestions based on content',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        platform: { type: 'string' },
      },
      required: ['content'],
    },
  },
];

const server = new Server(
  { name: 'stackpost-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema as any,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case 'create_post':
        result = await apiCall('POST', '/api/posts', args);
        break;
      case 'list_posts':
        const params = new URLSearchParams();
        if (args?.limit) params.set('limit', String(args.limit));
        if (args?.cursor) params.set('cursor', args.cursor);
        result = await apiCall('GET', `/api/posts?${params}`);
        break;
      case 'list_accounts':
        result = await apiCall('GET', '/api/accounts');
        break;
      case 'get_analytics':
        result = await apiCall('GET', '/api/analytics');
        break;
      case 'upload_from_url':
        result = await apiCall('POST', '/api/upload/from-url', args);
        break;
      case 'get_best_time':
        const btParams = args?.platform ? `?platform=${args.platform}` : '';
        result = await apiCall('GET', `/api/best-time${btParams}`);
        break;
      case 'generate_caption':
        result = await apiCall('POST', '/api/ai/caption', args);
        break;
      case 'suggest_hashtags':
        result = await apiCall('POST', '/api/ai/hashtags', args);
        break;
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  } catch (err: any) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('StackPost MCP server running on stdio');
}

main().catch(console.error);
