const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(req.url);
    // Basic auth check
    const auth = req.headers.get('Authorization') || '';
    const key = auth.replace(/^Bearer\s+/i, '').trim();
    if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const path = url.searchParams.get('path');
    if (!path) return json({ error: 'Missing path' }, 400);

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || 'main';
    const token = env.GITHUB_TOKEN;
    if (!owner || !repo || !token) {
      return json({ error: 'Missing GitHub env vars' }, 500);
    }

    const ghHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'cf-worker-admin-proxy'
    };
    // Preserve nested paths by encoding each segment instead of the entire path.
    const safePath = path.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/');
    const ghBase = `https://api.github.com/repos/${owner}/${repo}/contents/${safePath}`;

    async function getSha() {
      const r = await fetch(`${ghBase}?ref=${branch}`, { headers: ghHeaders });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`GitHub get SHA failed: ${r.status}`);
      const j = await r.json();
      return j.sha || null;
    }

    if (req.method === 'GET') {
      const r = await fetch(`${ghBase}?ref=${branch}`, { headers: ghHeaders });
      if (!r.ok) return json({ ok: false, status: r.status, text: await r.text() }, r.status);
      const j = await r.json();
      return json(j, 200);
    }

    if (req.method === 'DELETE') {
      const body = await req.json().catch(() => ({}));
      const message = body.message || `delete ${path}`;
      const sha = await getSha();
      if (!sha) return json({ error: 'Not found' }, 404);
      const payload = { message, sha, branch };
      const r = await fetch(ghBase, { method: 'DELETE', headers: ghHeaders, body: JSON.stringify(payload) });
      const text = await r.text();
      return new Response(text || '{}', { status: r.status, headers: cors });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const message = body.message || `update ${path}`;
      const content = body.content || body.text || '';
      const isBase64 = !!body.base64;
      const data = isBase64 ? content : btoa(unescape(encodeURIComponent(content)));
      const payload = { message, content: data, branch };
      const sha = await getSha();
      if (sha) payload.sha = sha;
      const r = await fetch(ghBase, { method: 'PUT', headers: ghHeaders, body: JSON.stringify(payload) });
      const text = await r.text();
      return new Response(text || '{}', { status: r.status, headers: cors });
    }

    return json({ error: 'Method not allowed' }, 405);
  }
};
