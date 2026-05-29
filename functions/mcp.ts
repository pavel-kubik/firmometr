import { checkCap, withCap } from './_shared/_cap';
import { authenticateBearer, type AgentPrincipal } from './_shared/_auth';
import { searchCompaniesByName } from './_shared/_search';
import { getCompanyByIco, type CompanyCtx, type CompanyEnv } from './_shared/_company';

interface Env extends CompanyEnv {
  SUPABASE_ANON_KEY: string;
}

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = { name: 'firmometr', version: '1.0.0' };

const TOOLS = [
  {
    name: 'searchCompanies',
    description: 'Search Czech companies by name using the ARES business registry. Returns up to 20 results per page.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Company name or partial name to search for.' },
        page: { type: 'integer', minimum: 1, default: 1, description: 'Page number (1-indexed). Each page returns up to 20 items.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'getCompanyByIco',
    description: 'Get full Czech company profile by IČO: registration data, address, insolvency status (ISIR), VAT reliability (DPH), statutory officers, and commercial register links.',
    inputSchema: {
      type: 'object',
      properties: {
        ico: { type: 'string', pattern: '^\\d{1,8}$', description: '8-digit Czech business ID (IČO), zero-padded.' },
      },
      required: ['ico'],
      additionalProperties: false,
    },
  },
];

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

function jsonRpcResult(id: JsonRpcRequest['id'], result: unknown): unknown {
  return { jsonrpc: '2.0', id: id ?? null, result };
}

function jsonRpcError(id: JsonRpcRequest['id'], code: number, message: string, data?: unknown): unknown {
  const error: Record<string, unknown> = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: '2.0', id: id ?? null, error };
}

function mcpResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function callSearchCompanies(args: Record<string, unknown>): Promise<unknown> {
  const query = typeof args.query === 'string' ? args.query : '';
  const page = typeof args.page === 'number' ? args.page : 1;
  if (!query.trim()) {
    return { content: [{ type: 'text', text: JSON.stringify({ total: 0, items: [] }) }] };
  }
  const start = Math.max(0, (page - 1) * 20);
  const result = await searchCompaniesByName(query, start);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
}

async function callGetCompanyByIco(
  args: Record<string, unknown>,
  request: Request,
  env: Env,
  principal: AgentPrincipal | null,
  waitUntil: (p: Promise<unknown>) => void,
): Promise<unknown> {
  const ico = typeof args.ico === 'string' ? args.ico : '';
  if (!/^\d{1,8}$/.test(ico)) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: 'Invalid IČO' }) }], isError: true };
  }
  const hostname = new URL(request.url).hostname;
  const deployEnv = hostname === 'localhost' || hostname === '127.0.0.1' ? 'local' : 'prod';
  const ctx: CompanyCtx = {
    env,
    ico,
    sourceIp: request.headers.get('CF-Connecting-IP'),
    userAgent: request.headers.get('User-Agent'),
    userId: principal?.user_id ?? null,
    waitUntil,
    maxCacheAgeSecs: undefined,
    deployEnv,
  };
  const profile = await getCompanyByIco(ctx);
  return { content: [{ type: 'text', text: JSON.stringify(profile) }] };
}

export const onRequestOptions = () => new Response(null, {
  status: 204,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
  },
});

export const onRequestPost = async ({
  request,
  env,
  waitUntil,
}: {
  request: Request;
  env: Env;
  waitUntil: (p: Promise<unknown>) => void;
}) => {
  const principal = await authenticateBearer(request, env);

  if (!principal) {
    const cap = checkCap(request);
    if (cap.blocked) return withCap({ jsonrpc: '2.0', id: null, error: { code: -32000, message: 'rate_limited' } }, cap, 429);
  }

  let rpc: JsonRpcRequest;
  try {
    rpc = await request.json() as JsonRpcRequest;
  } catch {
    return mcpResponse(jsonRpcError(null, -32700, 'Parse error'), 400);
  }

  if (!rpc || rpc.jsonrpc !== '2.0' || typeof rpc.method !== 'string') {
    return mcpResponse(jsonRpcError(rpc?.id ?? null, -32600, 'Invalid Request'), 400);
  }

  const id = rpc.id ?? null;
  const params = rpc.params ?? {};

  switch (rpc.method) {
    case 'initialize':
      return mcpResponse(jsonRpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
      }));

    case 'notifications/initialized':
    case 'initialized':
      return new Response(null, {
        status: 204,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });

    case 'ping':
      return mcpResponse(jsonRpcResult(id, {}));

    case 'tools/list':
      return mcpResponse(jsonRpcResult(id, { tools: TOOLS }));

    case 'tools/call': {
      const name = (params as { name?: string }).name;
      const args = ((params as { arguments?: Record<string, unknown> }).arguments) ?? {};
      if (name === 'searchCompanies') {
        const result = await callSearchCompanies(args);
        return mcpResponse(jsonRpcResult(id, result));
      }
      if (name === 'getCompanyByIco') {
        const result = await callGetCompanyByIco(args, request, env, principal, waitUntil);
        return mcpResponse(jsonRpcResult(id, result));
      }
      return mcpResponse(jsonRpcError(id, -32602, `Unknown tool: ${name}`));
    }

    default:
      return mcpResponse(jsonRpcError(id, -32601, `Method not found: ${rpc.method}`));
  }
};
