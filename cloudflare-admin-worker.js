export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    // Basic auth check
    const auth = req.headers.get('Authorization') || '';
    const key = auth.replace(/^Bearer\s+/i, '').trim();
    if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const path = url.searchParams.get('path');
    if (!path) return new Response(JSON.stringify({ error: 'Missing path' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const owner = env.GITHUB_OWNER;
    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || 'main';
    const token = env.GITHUB_TOKEN;
    if (!owner || !repo || !token) {
      return new Response(JSON.stringify({ error: 'Missing GitHub env vars' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const ghHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'cf-worker-admin-proxy'
    };
    const ghBase = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

    async function getSha() {
      const r = await fetch(`${ghBase}?ref=${branch}`, { headers: ghHeaders });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`GitHub get SHA failed: ${r.status}`);
      const j = await r.json();
      return j.sha || null;
    }

    if (req.method === 'GET') {
      const r = await fetch(`${ghBase}?ref=${branch}`, { headers: ghHeaders });
      if (!r.ok) return new Response(JSON.stringify({ ok: false, status: r.status, text: await r.text() }), { status: r.status, headers: { 'Content-Type': 'application/json' } });
      const j = await r.json();
      return new Response(JSON.stringify(j), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE') {
      const body = await req.json().catch(() => ({}));
      const message = body.message || `delete ${path}`;
      const sha = await getSha();
      if (!sha) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      const payload = { message, sha, branch };
      const r = await fetch(ghBase, { method: 'DELETE', headers: ghHeaders, body: JSON.stringify(payload) });
      const text = await r.text();
      return new Response(text || '{}', { status: r.status, headers: { 'Content-Type': 'application/json' } });
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
      return new Response(text || '{}', { status: r.status, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }
};
