// Hash router managing screen navigation and URL parameters.
// Uses window location and hashchange events.
// Used by main.js, screens, and self-test.

export function parseRoute(hashString = "", searchString = "") {
  const hash = (hashString || (typeof window !== "undefined" ? window.location.hash : "")) || "#/";
  const search = searchString !== undefined ? searchString : (typeof window !== "undefined" ? window.location.search : "");

  const query = {};
  if (search && search.length > 1) {
    const qStr = search.startsWith("?") ? search.slice(1) : search;
    const pairs = qStr.split("&");
    for (const pair of pairs) {
      if (!pair) continue;
      const [k, v] = pair.split("=");
      query[decodeURIComponent(k)] = v !== undefined ? decodeURIComponent(v) : "";
    }
  }

  const cleanHash = hash.replace(/^#\/?/, "").split("?")[0];
  const parts = cleanHash ? cleanHash.split("/").filter(Boolean) : [];

  if (parts.length === 0) {
    return { route: "home", params: {}, query };
  }

  const screen = parts[0];
  if (screen === "play" && parts[1]) {
    return { route: "play", params: { id: parts[1] }, query };
  }
  if (screen === "result") {
    return { route: "result", params: {}, query };
  }
  if (screen === "think") {
    return { route: "think", params: { id: parts[1] || null }, query };
  }

  return { route: "home", params: {}, query };
}

export function navigate(path) {
  if (typeof window === "undefined") return;
  const target = path.startsWith("#") ? path : `#/${path.replace(/^\/+/, "")}`;
  if (window.location.hash !== target) {
    window.location.hash = target;
  }
}

export function initRouter(onRouteChange) {
  if (typeof window === "undefined") return () => {};

  function handleRoute() {
    const parsed = parseRoute(window.location.hash, window.location.search);
    if (typeof onRouteChange === "function") {
      onRouteChange(parsed);
    }
  }

  window.addEventListener("hashchange", handleRoute);
  handleRoute();

  return () => {
    window.removeEventListener("hashchange", handleRoute);
  };
}
