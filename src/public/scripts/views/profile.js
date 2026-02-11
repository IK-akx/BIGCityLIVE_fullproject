window.views = window.views || {};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
  } catch { return iso; }
}

window.views.renderProfile = async function renderProfile(root) {
  const token = localStorage.getItem("USER_TOKEN");
  if (!token) {
    root.innerHTML = `<div class="alert alert--error"><b>Please login</b> to view profile.</div>`;
    setTimeout(() => (location.hash = "#/login"), 600);
    return;
  }

  root.innerHTML = `<div class="alert">Loading profile...</div>`;

  try {
    const prof = await window.api.request("GET", "/users/profile", undefined, true);
    const user = prof.user;

    const ticketsResp = await window.api.request("GET", "/tickets", undefined, true);
    const tickets = ticketsResp.tickets || [];

    root.innerHTML = `
      <div class="pagehead">
        <div>
          <h1 class="h1">Your profile</h1>
        </div>
        <div class="panel" style="padding:10px 12px;">
          <span class="muted">Role:</span> <b>${esc(user.role)}</b>
        </div>
      </div>

      <div class="profileGrid">
        <div class="panel">
          <h3 class="sectionTitle">Account</h3>
          <div class="muted" style="margin-top:6px;">Logged in as <b>${esc(user.email)}</b></div>

          <div class="form" style="margin-top:12px;">
            <label class="label">Username</label>
            <input class="input" id="uName" value="${esc(user.username)}" />

            <label class="label">Email</label>
            <input class="input" id="uEmail" type="email" value="${esc(user.email)}" />

            <button class="btn btn--primary" id="saveBtn">Save changes</button>
            <div id="saveMsg" style="margin-top:10px;"></div>
          </div>
        </div>

        <div class="panel">
          <h3 class="sectionTitle">My tickets</h3>

          <div id="ticketsArea" style="margin-top:12px;"></div>
        </div>
      </div>
    `;

    // Save profile
    const saveBtn = root.querySelector("#saveBtn");
    const saveMsg = root.querySelector("#saveMsg");

    saveBtn.onclick = async () => {
      saveMsg.innerHTML = "";
      const username = root.querySelector("#uName").value.trim();
      const email = root.querySelector("#uEmail").value.trim();

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        const data = await window.api.request("PUT", "/users/profile", { username, email }, true);

        localStorage.setItem("USER_EMAIL", data.user.email);

        saveMsg.innerHTML = `<div class="alert"><b>Saved!</b> Profile updated.</div>`;
      } catch (e) {
        const details = e.payload?.errors?.map(x => x.message).join(", ");
        saveMsg.innerHTML = `<div class="alert alert--error"><b>${e.message}</b>${details ? `<div class="muted" style="margin-top:6px">${details}</div>` : ""}</div>`;
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save changes";
      }
    };

    const ticketsArea = root.querySelector("#ticketsArea");

    function ticketRow(t) {
      const ev = t.event || {};
      const status = t.status || "active";
      const statusClass = status === "active" ? "pill--ok" : "pill--muted";

      return `
        <div class="ticketRow">
          <div class="ticketMain">
            <div class="ticketTitle">${esc(ev.title || "Event")}</div>
            <div class="ticketMeta">
              ${fmtDate(ev.date)} • ${esc(ev.location || "")} • 
              <b>${esc(t.ticketType)}</b> × ${esc(t.quantity)} • ${esc(t.price)}₸ each
            </div>
            <div class="pill ${statusClass}">${esc(status)}</div>
          </div>

          <div class="ticketActions">
            <button class="btn btn--soft" data-act="cancel" data-id="${t._id}" ${status !== "active" ? "disabled" : ""}>Cancel</button>
            <button class="btn btn--danger" data-act="delete" data-id="${t._id}">Delete</button>
          </div>
        </div>
      `;
    }

    function renderTickets(list) {
      if (!list.length) {
        ticketsArea.innerHTML = `<div class="alert">No tickets yet. Go to <a href="#/events">Events</a>.</div>`;
        return;
      }
      ticketsArea.innerHTML = list.map(ticketRow).join("");
    }

    renderTickets(tickets);

    ticketsArea.onclick = async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const act = btn.dataset.act;
      const id = btn.dataset.id;
      if (!act || !id) return;

      btn.disabled = true;

      try {
        if (act === "cancel") {
          await window.api.request("PUT", `/tickets/${id}`, { status: "cancelled" }, true);
        } else if (act === "delete") {
          await window.api.request("DELETE", `/tickets/${id}`, undefined, true);
        }

        const updated = await window.api.request("GET", "/tickets", undefined, true);
        renderTickets(updated.tickets || []);
      } catch (err) {
        alert(err.message);
      } finally {
        btn.disabled = false;
      }
    };

  } catch (e) {
    root.innerHTML = `<div class="alert alert--error"><b>${e.message}</b></div>`;
  }
};
