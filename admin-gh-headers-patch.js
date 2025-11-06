// admin-gh-headers-patch.js
// Drop-in override for GitHub helper functions to add required headers and clearer errors.
// Include this file *after* your existing admin helpers so these functions take precedence.

(function(){
  function commonHeaders(token){
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ironwood-admin'
    };
  }

  // Expect a global mustGH() that returns { owner, repo, branch, token }
  if (typeof window.mustGH !== 'function') {
    console.warn('[ironwood] admin-gh-headers-patch.js: mustGH() not found; ensure this file loads after your admin helpers.');
  }

  // GET file or directory listing
  window.ghGet = async function(path){
    const g = mustGH();
    const url = `https://api.github.com/repos/${g.owner}/${g.repo}/contents/${encodeURIComponent(path)}?ref=${g.branch}`;
    const r = await fetch(url, { headers: commonHeaders(g.token) });
    if(!r.ok){
      const txt = await r.text().catch(()=> '');
      throw new Error(`GET ${r.status}: ${txt || r.statusText}`);
    }
    return r.json();
  };

  // PUT text content (auto-b64 + existing sha if present)
  window.ghPut = async function(path, content, message){
    const g = mustGH();
    const url = `https://api.github.com/repos/${g.owner}/${g.repo}/contents/${encodeURIComponent(path)}`;
    let sha = null;
    try { const existing = await ghGet(path); sha = existing.sha; } catch(_) {}
    const body = {
      message: message || `update ${path}`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: g.branch
    };
    if (sha) body.sha = sha;
    const r = await fetch(url, {
      method: 'PUT',
      headers: { ...commonHeaders(g.token), 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    if(!r.ok){
      const txt = await r.text().catch(()=> '');
      throw new Error(`PUT ${r.status}: ${txt || r.statusText}`);
    }
    return r.json();
  };

  // PUT binary content where caller passes a raw base64 string (no data: prefix)
  window.ghPutB64 = async function(path, base64, message){
    const g = mustGH();
    const url = `https://api.github.com/repos/${g.owner}/${g.repo}/contents/${encodeURIComponent(path)}`;
    let sha = null;
    try { const existing = await ghGet(path); sha = existing.sha; } catch(_) {}
    const body = {
      message: message || `upload ${path}`,
      content: base64,
      branch: g.branch
    };
    if (sha) body.sha = sha;
    const r = await fetch(url, {
      method: 'PUT',
      headers: { ...commonHeaders(g.token), 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    if(!r.ok){
      const txt = await r.text().catch(()=> '');
      throw new Error(`PUT(B64) ${r.status}: ${txt || r.statusText}`);
    }
    return r.json();
  };

  // DELETE a file
  window.ghDel = async function(path){
    const g = mustGH();
    const ex = await ghGet(path);
    const url = `https://api.github.com/repos/${g.owner}/${g.repo}/contents/${encodeURIComponent(path)}`;
    const body = { message: `delete ${path}`, sha: ex.sha, branch: g.branch };
    const r = await fetch(url, {
      method: 'DELETE',
      headers: { ...commonHeaders(g.token), 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    if(!r.ok){
      const txt = await r.text().catch(()=> '');
      throw new Error(`DEL ${r.status}: ${txt || r.statusText}`);
    }
    return r.json();
  };

  console.log('[ironwood] GitHub header patch loaded.');
})();
