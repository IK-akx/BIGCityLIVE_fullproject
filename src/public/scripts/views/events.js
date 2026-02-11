window.views = window.views || {};

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
  } catch {
    return iso;
  }
}

function minPrice(ticketTypes) {
  if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) return null;
  return Math.min(...ticketTypes.map(t => Number(t.price ?? 0)));
}

window.views.renderEventsList = async function renderEventsList(root) {
  root.innerHTML = `
    <div class="pagehead">
      <div>
        <h1 class="h1">City events — in one place</h1>
        <p class="p">Find event and buy tickets in seconds.</p>
      </div>
      <div class="panel" style="padding:10px 12px;">
        Use search & filters
      </div>
    </div>

    <div class="panel">
      <div class="filters">
        <input class="input" id="q" placeholder="Search by title..." />
        <select class="select" id="cat">
          <option value="">All categories</option>
          <option value="concert">Concert</option>
          <option value="sports">Sports</option>
          <option value="shopping">Shopping</option>
          <option value="exhibition">Exhibition</option>
          <option value="education">Education</option>
          <option value="other">Other</option>
        </select>
        <input class="input" id="minPrice" type="number" min="0" placeholder="Min price" />
        <input class="input" id="maxPrice" type="number" min="0" placeholder="Max price" />
        <button class="btn btn--soft" id="apply">Apply</button>
      </div>
    </div>

    <div id="listArea"></div>
  `;

  const listArea = root.querySelector("#listArea");
  const q = root.querySelector("#q");
  const cat = root.querySelector("#cat");
  const minP = root.querySelector("#minPrice");
  const maxP = root.querySelector("#maxPrice");
  const apply = root.querySelector("#apply");

  async function load() {
    listArea.innerHTML = `<div class="alert">Loading events...</div>`;

    const params = new URLSearchParams();
    if (q.value.trim()) params.set("search", q.value.trim());
    if (cat.value) params.set("category", cat.value);
    if (minP.value) params.set("minPrice", minP.value);
    if (maxP.value) params.set("maxPrice", maxP.value);

    try {
      const data = await window.api.request("GET", `/api/events?${params.toString()}`);
      const events = data?.events || [];

      if (events.length === 0) {
        listArea.innerHTML = `<div class="alert">No events found.</div>`;
        return;
      }

      const cards = events.map(ev => {
        const img = ev.imageUrl ? `<img class="card__img" src="${ev.imageUrl}" alt="Event image">` : `<div class="card__img"></div>`;
        const price = minPrice(ev.ticketTypes);
        return `
          <article class="card">
            ${img}
            <div class="card__body">
              <h3 class="card__title">${ev.title}</h3>
              <div class="meta">${formatDate(ev.date)} • ${ev.location}</div>
              <div class="badge">${ev.category || "other"}</div>
              <div class="card__footer">
                <div class="price">${price !== null ? `From ₸${price}` : ""}</div>
                <a class="linkbtn" href="#/event/${ev._id}">View →</a>
              </div>
            </div>
          </article>
        `;
      }).join("");

      listArea.innerHTML = `<div class="grid">${cards}</div>`;
    } catch (e) {
      const details = e.payload?.errors?.map(x => x.message).join(", ");
      listArea.innerHTML = `
        <div class="alert alert--error">
          <b>${e.message}</b>${details ? `<div class="muted" style="margin-top:6px">${details}</div>` : ""}
        </div>
      `;
    }
  }

  apply.addEventListener("click", load);
  q.addEventListener("keydown", (e) => { if (e.key === "Enter") load(); });

  await load();
};
