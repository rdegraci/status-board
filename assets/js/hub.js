(function () {
  "use strict";

  var SB = window.StatusBoard;
  var statusEl = document.getElementById("hub-status");
  var tableWrap = document.getElementById("hub-table-wrap");
  var rowsEl = document.getElementById("hub-rows");
  var updatedEl = document.getElementById("hub-updated");

  function renderEmpty(message) {
    statusEl.textContent = message;
    statusEl.classList.add("sb-empty");
    tableWrap.hidden = true;
  }

  function renderHub(data) {
    var repos = (data && data.repos) || [];
    if (!repos.length) {
      renderEmpty("Nothing published yet.");
      return;
    }

    if (data.updated_at) {
      updatedEl.hidden = false;
      updatedEl.textContent =
        "Updated " + SB.formatRelative(data.updated_at) +
        " · " + SB.formatWhen(data.updated_at);
    }

    rowsEl.innerHTML = repos
      .map(function (repo) {
        var id = repo.id || "";
        var name = repo.name || id || "unnamed";
        var clean = repo.working_tree_clean !== false;
        var treeBadge = clean
          ? '<span class="badge text-bg-success">clean</span>'
          : '<span class="badge text-bg-warning">dirty</span>';
        var ahead =
          repo.ahead_count == null ? "—" : SB.escapeHtml(String(repo.ahead_count));
        return (
          "<tr>" +
          '<td><a href="repo.html?id=' +
          encodeURIComponent(id) +
          '">' +
          SB.escapeHtml(name) +
          "</a></td>" +
          "<td class=\"sb-mono\">" +
          SB.escapeHtml(repo.branch || "—") +
          "</td>" +
          "<td class=\"sb-mono\">" +
          SB.escapeHtml(repo.base_ref || "—") +
          "</td>" +
          "<td>" +
          ahead +
          "</td>" +
          "<td>" +
          treeBadge +
          "</td>" +
          '<td class="small text-secondary" title="' +
          SB.escapeHtml(repo.updated_at || "") +
          '">' +
          SB.escapeHtml(SB.formatRelative(repo.updated_at) || "—") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    statusEl.hidden = true;
    tableWrap.hidden = false;
  }

  SB.fetchJson("data/index.json")
    .then(renderHub)
    .catch(function (err) {
      renderEmpty(err.message || "Could not load dashboard data.");
    });
})();
