(function () {
  "use strict";

  var SB = window.StatusBoard;
  var statusEl = document.getElementById("commit-status");
  var bodyEl = document.getElementById("commit-body");

  function showError(message) {
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.classList.add("sb-empty");
    bodyEl.hidden = true;
  }

  function querySha() {
    var params = new URLSearchParams(window.location.search);
    return params.get("sha");
  }

  function findCommit(spine, shaRef) {
    if (!spine || !shaRef) return null;
    var want = String(shaRef).toLowerCase();
    for (var i = 0; i < spine.length; i++) {
      var c = spine[i];
      var full = String(c.sha || "").toLowerCase();
      var short = String(c.short_sha || full.slice(0, 7)).toLowerCase();
      if (full === want || short === want || full.indexOf(want) === 0) {
        return c;
      }
    }
    return null;
  }

  function diffLineClass(line) {
    if (line.indexOf("+++") === 0 || line.indexOf("---") === 0) return "meta";
    if (line.indexOf("@@") === 0) return "hunk";
    if (line.charAt(0) === "+") return "add";
    if (line.charAt(0) === "-") return "del";
    return "ctx";
  }

  function renderDiff(patch) {
    var panel = document.getElementById("diff-panel");
    if (!patch) {
      panel.innerHTML =
        '<div class="sb-diff-line sb-diff-ctx text-secondary">(no diff in snapshot)</div>';
      return;
    }
    var lines = String(patch).split("\n");
    panel.innerHTML = lines
      .map(function (line) {
        return (
          '<div class="sb-diff-line sb-diff-' +
          diffLineClass(line) +
          '">' +
          SB.escapeHtml(line) +
          "</div>"
        );
      })
      .join("");
  }

  function renderCommit(data, commit) {
    var repo = data.repo || {};
    var detail = commit.detail || {};
    var short =
      commit.short_sha || String(commit.sha || "").slice(0, 7);
    var repoId = repo.id || SB.queryId() || "";

    document.title = short + " · " + (repo.name || repoId) + " · status-board";
    document.getElementById("repo-name").textContent =
      repo.name || repoId || "repository";

    var pathEl = document.getElementById("repo-path");
    var pathText = repo.remote || repo.path || "";
    pathEl.textContent = pathText;
    pathEl.title = pathText;

    document.getElementById("commit-meta").innerHTML =
      'Commit <span class="sb-mono">' +
      SB.escapeHtml(short) +
      "</span>" +
      (commit.is_head
        ? ' <span class="badge sb-head-badge">HEAD</span>'
        : "");

    document.getElementById("back-link").href =
      "repo.html?id=" + encodeURIComponent(repoId);

    document.getElementById("commit-subject").textContent =
      commit.subject || "(no subject)";

    var bodyText = detail.body || commit.body || "";
    var bodyPre = document.getElementById("commit-body-text");
    if (bodyText) {
      bodyPre.hidden = false;
      bodyPre.textContent = bodyText;
    } else {
      bodyPre.hidden = true;
    }

    var authorName = detail.author_name || commit.author_name || "";
    var authorEmail = detail.author_email || commit.author_email || "";
    var when = SB.formatWhen(commit.authored_at || detail.authored_at);
    var authorLine = "";
    if (authorName || authorEmail) {
      authorLine =
        SB.escapeHtml(authorName) +
        (authorEmail
          ? " &lt;" + SB.escapeHtml(authorEmail) + "&gt;"
          : "") +
        " · ";
    }
    document.getElementById("commit-author").innerHTML =
      authorLine + SB.escapeHtml(when);

    var summaryText = commit.summary || detail.summary || "";
    document.getElementById("detail-story-text").textContent =
      summaryText || "No summary in this snapshot.";

    var feats = commit.features || detail.features || [];
    var featsLabel = document.getElementById("detail-features-label");
    var featsList = document.getElementById("detail-story-features");
    if (feats.length) {
      featsLabel.hidden = false;
      featsList.innerHTML = feats
        .map(function (f) {
          return "<li>" + SB.escapeHtml(f) + "</li>";
        })
        .join("");
    } else {
      featsLabel.hidden = true;
      featsList.innerHTML = "";
    }

    var stats = detail.stats || commit.stats || {};
    var files = stats.files || [];
    document.getElementById("files-meta").textContent =
      (stats.files_changed != null ? stats.files_changed : files.length) +
      " files · +" +
      (stats.insertions != null ? stats.insertions : "—") +
      " / −" +
      (stats.deletions != null ? stats.deletions : "—");

    var filesList = document.getElementById("files-list");
    if (files.length) {
      filesList.innerHTML = files
        .map(function (f) {
          var counts = "";
          if (f.additions != null || f.deletions != null) {
            counts =
              ' <span class="text-secondary">( +' +
              (f.additions || 0) +
              " / −" +
              (f.deletions || 0) +
              " )</span>";
          }
          return (
            "<li><span class=\"text-secondary\">" +
            SB.escapeHtml(f.status || "?") +
            "</span> " +
            SB.escapeHtml(f.path || "") +
            counts +
            "</li>"
          );
        })
        .join("");
    } else {
      filesList.innerHTML =
        '<li class="text-secondary">No file list in snapshot.</li>';
    }

    document.getElementById("diff-truncated").hidden = !detail.truncated;
    renderDiff(detail.patch || commit.patch || "");

    statusEl.hidden = true;
    bodyEl.hidden = false;
  }

  var id = SB.queryId();
  var sha = querySha();
  if (!id || !sha) {
    showError("Missing id or sha. Open Details from a repo spine row.");
    return;
  }

  SB.fetchJson("data/repos/" + encodeURIComponent(id) + ".json")
    .then(function (data) {
      var commit = findCommit(data.spine || [], sha);
      if (!commit) {
        showError("Commit " + sha + " not found in this snapshot.");
        return;
      }
      renderCommit(data, commit);
    })
    .catch(function (err) {
      showError(err.message || "Could not load snapshot.");
    });
})();
