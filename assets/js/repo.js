(function () {
  "use strict";

  var SB = window.StatusBoard;
  var statusEl = document.getElementById("repo-status");
  var bodyEl = document.getElementById("repo-body");

  function showError(message) {
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.classList.add("sb-empty");
    bodyEl.hidden = true;
  }

  function listItems(items) {
    if (!items || !items.length) return "";
    return items
      .map(function (item) {
        return "<li>" + SB.escapeHtml(item) + "</li>";
      })
      .join("");
  }

  function fileList(label, files) {
    if (!files || !files.length) return "";
    var rows = files
      .map(function (f) {
        return (
          "<li><span class=\"text-secondary\">" +
          SB.escapeHtml(f.status || "?") +
          "</span> " +
          SB.escapeHtml(f.path || "") +
          "</li>"
        );
      })
      .join("");
    return (
      '<p class="small mb-1"><strong>' +
      SB.escapeHtml(label) +
      "</strong></p>" +
      '<ul class="small sb-mono">' +
      rows +
      "</ul>"
    );
  }

  function renderWorkingTree(wt) {
    var el = document.getElementById("working-tree-content");
    if (!wt) {
      el.innerHTML = '<p class="text-secondary small mb-0">No working tree data.</p>';
      return;
    }

    var parts = [];
    if (wt.summary) {
      parts.push(
        '<div class="sb-narrative small mb-2">' +
          SB.escapeHtml(wt.summary) +
          "</div>"
      );
    }

    if (wt.clean) {
      parts.push(
        '<p class="text-secondary small mb-0">Clean — nothing to commit</p>'
      );
    } else {
      parts.push(fileList("Staged", wt.staged));
      parts.push(fileList("Unstaged", wt.unstaged));
      parts.push(fileList("Untracked", wt.untracked));
      if (
        !(wt.staged && wt.staged.length) &&
        !(wt.unstaged && wt.unstaged.length) &&
        !(wt.untracked && wt.untracked.length) &&
        !wt.summary
      ) {
        parts.push(
          '<p class="text-secondary small mb-0">Dirty — no file list in snapshot.</p>'
        );
      }
    }
    el.innerHTML = parts.join("");
  }

  function renderSpine(spine) {
    var tbody = document.getElementById("spine-rows");
    if (!spine || !spine.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-secondary small">No commits in this snapshot.</td></tr>';
      return;
    }

    var repoId = SB.queryId() || "";

    tbody.innerHTML = spine
      .map(function (c) {
        var feats = c.features || [];
        var featHtml = feats.length
          ? '<ul class="sb-feature-skim mb-0">' + listItems(feats) + "</ul>"
          : '<span class="text-secondary">—</span>';
        var summary = c.summary
          ? '<span class="sb-story-preview small">' +
            SB.escapeHtml(c.summary) +
            "</span>"
          : '<span class="text-secondary small">—</span>';
        var shaRef = c.short_sha || (c.sha || "").slice(0, 7);
        var detailsHref =
          "commit.html?id=" +
          encodeURIComponent(repoId) +
          "&sha=" +
          encodeURIComponent(shaRef);
        return (
          '<tr class="' +
          (c.is_head ? "sb-head" : "") +
          '">' +
          '<td class="sb-mono">' +
          SB.escapeHtml(shaRef) +
          (c.is_head
            ? ' <span class="badge sb-head-badge ms-1">HEAD</span>'
            : "") +
          "</td>" +
          "<td>" +
          SB.escapeHtml(c.subject || "") +
          "</td>" +
          '<td class="small text-secondary">' +
          SB.escapeHtml(SB.formatWhen(c.authored_at)) +
          "</td>" +
          "<td>" +
          summary +
          "</td>" +
          '<td class="sb-features-cell small">' +
          featHtml +
          "</td>" +
          "<td>" +
          '<a class="btn btn-sm btn-outline-secondary" href="' +
          detailsHref +
          '">Details</a>' +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderRepo(data) {
    var repo = data.repo || {};
    var name = repo.name || repo.id || "repository";
    document.title = name + " · status-board";
    document.getElementById("repo-name").textContent = name;

    var pathEl = document.getElementById("repo-path");
    var pathText = repo.remote || repo.path || "";
    pathEl.textContent = pathText;
    pathEl.title = pathText;

    document.getElementById("repo-meta").innerHTML =
      "<span>" +
      SB.escapeHtml(data.branch || "—") +
      "</span> · base <span>" +
      SB.escapeHtml(data.base_ref || "—") +
      "</span> · <span>" +
      SB.escapeHtml(String(data.ahead_count == null ? "—" : data.ahead_count)) +
      "</span> ahead";

    var dirty = document.getElementById("dirty-badge");
    var clean = data.working_tree && data.working_tree.clean;
    dirty.hidden = false;
    dirty.className = "badge " + (clean ? "text-bg-success" : "text-bg-warning");
    dirty.textContent = clean ? "clean" : "dirty";

    var source = document.getElementById("source-badge");
    if (data.source) {
      source.hidden = false;
      source.textContent = data.source;
    }

    var updated = document.getElementById("repo-updated");
    updated.textContent = data.updated_at
      ? "Updated " + SB.formatRelative(data.updated_at)
      : "";
    updated.title = data.updated_at || "";

    var story = data.head_story || {};
    document.getElementById("head-story-meta").innerHTML =
      "Range <code>" +
      SB.escapeHtml(data.range_label || (data.base_ref || "?") + "..HEAD") +
      "</code> · " +
      SB.escapeHtml(String(data.commit_count == null ? "—" : data.commit_count)) +
      " commits · " +
      SB.escapeHtml(
        String(data.files_touched_total == null ? "—" : data.files_touched_total)
      ) +
      " files";

    document.getElementById("head-story-text").textContent =
      story.text || "No story in this snapshot.";

    var feats = story.features || [];
    var featsLabel = document.getElementById("head-features-label");
    var featsList = document.getElementById("head-story-features");
    if (feats.length) {
      featsLabel.hidden = false;
      featsList.innerHTML = listItems(feats);
    } else {
      featsLabel.hidden = true;
      featsList.innerHTML = "";
    }

    var steps = data.future_steps || [];
    var stepsEl = document.getElementById("future-story-steps");
    if (steps.length) {
      stepsEl.innerHTML = steps
        .map(function (step) {
          var text = typeof step === "string" ? step : step.text;
          return "<li>" + SB.escapeHtml(text || "") + "</li>";
        })
        .join("");
    } else {
      stepsEl.innerHTML =
        '<li class="text-secondary">No future steps in this snapshot.</li>';
    }

    renderWorkingTree(data.working_tree);
    renderSpine(data.spine);

    statusEl.hidden = true;
    bodyEl.hidden = false;
  }

  var id = SB.queryId();
  if (!id) {
    showError("Missing repo id. Open a link from the Dashboard.");
    return;
  }

  SB.fetchJson("data/repos/" + encodeURIComponent(id) + ".json")
    .then(renderRepo)
    .catch(function (err) {
      showError(err.message || "Could not load snapshot.");
    });
})();
