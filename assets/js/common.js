/* Shared helpers for status-board static pages. */
(function (global) {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatWhen(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return escapeHtml(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatRelative(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    var sec = Math.round((Date.now() - d.getTime()) / 1000);
    if (sec < 0) return "just now";
    if (sec < 60) return sec + "s ago";
    var min = Math.round(sec / 60);
    if (min < 60) return min + "m ago";
    var hr = Math.round(min / 60);
    if (hr < 48) return hr + "h ago";
    var day = Math.round(hr / 24);
    return day + "d ago";
  }

  function queryId() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  async function fetchJson(url) {
    var res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to load " + url + " (" + res.status + ")");
    }
    return res.json();
  }

  global.StatusBoard = {
    escapeHtml: escapeHtml,
    formatWhen: formatWhen,
    formatRelative: formatRelative,
    queryId: queryId,
    fetchJson: fetchJson,
  };
})(window);
