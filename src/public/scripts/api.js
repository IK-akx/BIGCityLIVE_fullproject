window.api = {
  async request(method, path, body, auth = false) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = localStorage.getItem("USER_TOKEN");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const opts = { method, headers };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(path, opts);
    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
      const msg = data?.message || `Request failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }
};
