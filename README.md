# status-board

Static GitHub Pages mirror for [status-branch](https://github.com/rdegraci/status-branch) snapshots.

Local **status-branch** computes git state and LLM stories, then publishes JSON here.
This site is read-only: a Dashboard hub plus per-repo pages. No terminal, no live git.

## Layout

```
index.html          Dashboard (hub)
repo.html           Per-repo shell (?id=<repo-id>)
commit.html         Commit details (?id=<repo-id>&sha=<short-sha>)
assets/             CSS, JS, Bootstrap vendor
data/
  index.json        Hub list
  repos/<id>.json   One snapshot per repo (spine entries may include detail)
```

## Local preview

```bash
cd /Users/rdegraci/Hack/status-board
python3 -m http.server 8080
# open http://127.0.0.1:8080/
```

Use a local server so `fetch('data/…')` works (file:// blocks it).

## GitHub Pages

1. Create a GitHub repo (e.g. `status-board`) and push this tree.
2. Settings → Pages → deploy from `main` (root), or `gh-pages`.
3. Site URL: `https://<user>.github.io/status-board/`

**Privacy:** Pages content is public on a public repo. Do not publish secrets or sensitive paths.

## Snapshot schema

See `data/repos/example.json`. `schema_version` is currently `1`.
The status-branch publisher writes `data/repos/<id>.json` and upserts
`data/index.json` into this checkout; commit and push here to update Pages.
