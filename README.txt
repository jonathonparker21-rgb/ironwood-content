IRONWOOD ADMIN — GITHUB HEADERS PATCH
====================================

What this is:
- A safe, drop-in patch that overrides your admin’s GitHub helper functions
  (ghGet, ghPut, ghPutB64, ghDel) to include the recommended GitHub API headers.
- Fixes “GitHub not reachable” errors caused by missing Accept / API-Version / User-Agent headers.

How to install (Cloudflare Pages or any static host):
1) Upload `admin-gh-headers-patch.js` next to your existing `admin.html`.
2) Edit `admin.html` and add ONE line *after* your current admin scripts:

   <script src="admin-gh-headers-patch.js"></script>

3) Save and reload the Admin page.
4) Re-enter your PAT if prompted and try a simple action (e.g., read `config.json`).

Notes:
- This does NOT change your UI or logic—only the request headers + error messages.
- It relies on your existing `mustGH()` function (unchanged).
- Works with both fine-grained and classic PATs (repo contents must be Read/Write).
