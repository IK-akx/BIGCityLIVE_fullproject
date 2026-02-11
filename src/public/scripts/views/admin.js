window.views = window.views || {};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function fmtDateInput(iso) {
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

window.views.renderAdmin = async function renderAdmin(root) {
  const token = localStorage.getItem("USER_TOKEN");
  const role = localStorage.getItem("USER_ROLE");

  if (!token) {
    root.innerHTML = `<div class="alert alert--error"><b>Please login</b> as admin.</div>`;
    setTimeout(() => (location.hash = "#/login"), 600);
    return;
  }
  if (role !== "admin") {
    root.innerHTML = `<div class="alert alert--error"><b>Forbidden</b> (admin only).</div>`;
    return;
  }

  root.innerHTML = `<div class="alert">Loading admin panel...</div>`;

  let editingId = null;

  async function loadEvents() {
    const data = await window.api.request("GET", "/api/events");
    return data.events || [];
  }

  function ticketTypesFromForm() {
    const rows = [...root.querySelectorAll(".ttRow")];
    const types = rows.map(r => {
      const name = r.querySelector(".ttName").value.trim();
      const price = Number(r.querySelector(".ttPrice").value);
      const total = Number(r.querySelector(".ttTotal").value);
      return { name, price, total, sold: 0 };
    }).filter(t => t.name && !Number.isNaN(t.price) && !Number.isNaN(t.total));

    return types;
  }

  function setFormForCreate() {
    editingId = null;
    root.querySelector("#formTitle").textContent = "Create event";
    root.querySelector("#submitBtn").textContent = "Create";
    root.querySelector("#cancelEdit").style.display = "none";
    root.querySelector("#eTitle").value = "";
    root.querySelector("#eDesc").value = "";
    root.querySelector("#eCategory").value = "other";
    root.querySelector("#eDate").value = "";
    root.querySelector("#eLocation").value = "";
    root.querySelector("#eImage").value = "";
    root.querySelector("#ttContainer").innerHTML = ticketTypeRowHTML("Standard", 5000, 100) + ticketTypeRowHTML("VIP", 15000, 20);
    root.querySelector("#formMsg").innerHTML = "";
  }

  function setFormForEdit(ev) {
    editingId = ev._id;
    root.querySelector("#formTitle").textContent = "Edit event";
    root.querySelector("#submitBtn").textContent = "Save changes";
    root.querySelector("#cancelEdit").style.display = "";
    root.querySelector("#eTitle").value = ev.title || "";
    root.querySelector("#eDesc").value = ev.description || "";
    root.querySelector("#eCategory").value = ev.category || "other";
    root.querySelector("#eDate").value = fmtDateInput(ev.date);
    root.querySelector("#eLocation").value = ev.location || "";
    root.querySelector("#eImage").value = ev.imageUrl || "";

    const tt = (ev.ticketTypes || []).map(t => ticketTypeRowHTML(t.name, t.price, t.total)).join("");
    root.querySelector("#ttContainer").innerHTML = tt || ticketTypeRowHTML("Standard", 5000, 100);
    root.querySelector("#formMsg").innerHTML = `<div class="alert">Editing: <b>${esc(ev.title)}</b></div>`;
  }

  function ticketTypeRowHTML(name = "", price = 0, total = 0) {
    return `
      <div class="ttRow">
        <input class="input ttName" placeholder="Type (e.g., VIP)" value="${esc(name)}">
        <input class="input ttPrice" type="number" min="0" placeholder="Price" value="${esc(price)}">
        <input class="input ttTotal" type="number" min="0" placeholder="Total" value="${esc(total)}">
        <button class="btn btn--danger ttRemove" type="button">Remove</button>
      </div>
    `;
  }

  function eventCardHTML(ev) {
    const img = ev.imageUrl ? `<img class="miniImg" src="${esc(ev.imageUrl)}" alt="img">` : `<div class="miniImg miniImg--ph"></div>`;
    return `
      <div class="adminRow">
        <div class="adminRow__left">
          ${img}
          <div>
            <div class="adminTitle">${esc(ev.title)}</div>
            <div class="muted" style="margin-top:4px; font-size:13px;">
              ${esc(ev.category)} • ${esc(ev.location)}
            </div>
          </div>
        </div>
        <div class="adminRow__actions">
          <button class="btn btn--soft" data-act="edit" data-id="${ev._id}">Edit</button>
          <button class="btn btn--danger" data-act="del" data-id="${ev._id}">Delete</button>
        </div>
      </div>
    `;
  }

  root.innerHTML = `
    <div class="pagehead">
      <div>
        <h1 class="h1">Admin panel</h1>
      </div>
      <div class="panel" style="padding:10px 12px;">
        <span class="muted">Access:</span> <b>admin</b>
      </div>
    </div>

    <div class="adminGrid">
      <div class="panel">
        <h3 class="sectionTitle" id="formTitle">Create event</h3>

        <div class="form" style="margin-top:12px;">
          <label class="label">Title</label>
          <input class="input" id="eTitle" placeholder="Event title">

          <label class="label">Description</label>
          <textarea class="input" id="eDesc" rows="5" placeholder="Describe the event"></textarea>

          <label class="label">Category</label>
          <select class="select" id="eCategory">
            <option value="concert">concert</option>
            <option value="sports">sports</option>
            <option value="shopping">shopping</option>
            <option value="exhibition">exhibition</option>
            <option value="education">education</option>
            <option value="other" selected>other</option>
          </select>

          <label class="label">Date & time</label>
          <input class="input" id="eDate" type="datetime-local">

          <label class="label">Location</label>
          <input class="input" id="eLocation" placeholder="Astana Arena">

          <label class="label">Image URL</label>
          <input class="input" id="eImage" placeholder="https://...">

          <div style="margin-top:10px;">
            <div class="label">Ticket types</div>
            <div class="muted" style="font-size:13px; margin-top:4px;">
              Add 1+ types (e.g., Standard, VIP)
            </div>
            <div id="ttContainer" style="margin-top:10px;"></div>
            <button class="btn btn--soft" id="addType" type="button" style="margin-top:10px;">+ Add ticket type</button>
          </div>

          <button class="btn btn--primary" id="submitBtn" type="button" style="margin-top:10px;">Create</button>
          <button class="btn btn--soft" id="cancelEdit" type="button" style="display:none;">Cancel edit</button>
          <div id="formMsg" style="margin-top:12px;"></div>
        </div>
      </div>

      <div class="panel">
        <h3 class="sectionTitle">Events</h3>
        <div id="eventsList" style="margin-top:12px;"></div>
      </div>
    </div>
  `;

  root.querySelector("#ttContainer").innerHTML =
    ticketTypeRowHTML("Standard", 5000, 100) + ticketTypeRowHTML("VIP", 15000, 20);

  root.querySelector("#addType").onclick = () => {
    root.querySelector("#ttContainer").insertAdjacentHTML("beforeend", ticketTypeRowHTML());
  };
  root.querySelector("#ttContainer").onclick = (e) => {
    if (e.target.classList.contains("ttRemove")) {
      e.target.closest(".ttRow")?.remove();
    }
  };

  const eventsList = root.querySelector("#eventsList");
  const formMsg = root.querySelector("#formMsg");
  const submitBtn = root.querySelector("#submitBtn");
  const cancelEdit = root.querySelector("#cancelEdit");

  async function refresh() {
    const evs = await loadEvents();
    eventsList.innerHTML = evs.length ? evs.map(eventCardHTML).join("") : `<div class="alert">No events yet.</div>`;
    return evs;
  }

  let cached = await refresh();

  eventsList.onclick = async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    if (!id || !act) return;

    if (act === "edit") {
      const ev = cached.find(x => x._id === id);
      if (ev) setFormForEdit(ev);
      return;
    }

    if (act === "del") {
      const ok = confirm("Delete this event?");
      if (!ok) return;

      try {
        btn.disabled = true;
        await window.api.request("DELETE", `/api/events/${id}`, undefined, true);
        cached = await refresh();
        if (editingId === id) setFormForCreate();
      } catch (err) {
        alert(err.message);
      } finally {
        btn.disabled = false;
      }
    }
  };

  cancelEdit.onclick = () => setFormForCreate();

  submitBtn.onclick = async () => {
    formMsg.innerHTML = "";

    const title = root.querySelector("#eTitle").value.trim();
    const description = root.querySelector("#eDesc").value.trim();
    const category = root.querySelector("#eCategory").value;
    const date = root.querySelector("#eDate").value;
    const location = root.querySelector("#eLocation").value.trim();
    const imageUrl = root.querySelector("#eImage").value.trim();
    const ticketTypes = ticketTypesFromForm();

    const payload = { title, description, category, date: new Date(date).toISOString(), location, imageUrl, ticketTypes };

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = editingId ? "Saving..." : "Creating...";

      if (!editingId) {
        await window.api.request("POST", "/api/events", payload, true);
        formMsg.innerHTML = `<div class="alert"><b>Created!</b> Event added.</div>`;
      } else {
        await window.api.request("PUT", `/api/events/${editingId}`, payload, true);
        formMsg.innerHTML = `<div class="alert"><b>Saved!</b> Event updated.</div>`;
      }

      cached = await refresh();
      setFormForCreate();
    } catch (err) {
      const details = err.payload?.errors?.map(x => x.message).join(", ");
      formMsg.innerHTML = `<div class="alert alert--error"><b>${err.message}</b>${details ? `<div class="muted" style="margin-top:6px">${details}</div>` : ""}</div>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = editingId ? "Save changes" : "Create";
    }
  };
};
