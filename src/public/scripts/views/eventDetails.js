window.views = window.views || {};

function formatDateLong(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function kzt(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return "";
  return `₸${x}`;
}

window.views.renderEventDetails = async function renderEventDetails(root, eventId) {
  root.innerHTML = `<div class="alert">Loading event...</div>`;

  try {
    const data = await window.api.request("GET", `/api/events/${eventId}`);
    const ev = data.event;

    const img = ev.imageUrl
      ? `<img class="hero__img" src="${ev.imageUrl}" alt="Event image">`
      : `<div class="hero__img hero__img--placeholder"></div>`;

    const ticketOptions = (ev.ticketTypes || []).map(t => {
      const available = Math.max(0, (t.total ?? 0) - (t.sold ?? 0));
      return `
        <option value="${t.name}" data-price="${t.price}" data-available="${available}">
          ${t.name} — ${kzt(t.price)} (available: ${available})
        </option>
      `;
    }).join("");

    root.innerHTML = `
      <div class="detail">
        <a class="backlink" href="#/events">← Back to events</a>

        <div class="hero">
          ${img}
          <div class="hero__body">
            <div class="badge">${ev.category || "other"}</div>
            <h1 class="detail__title">${ev.title}</h1>
            <div class="meta">${formatDateLong(ev.date)} • ${ev.location}</div>
            <p class="detail__desc">${ev.description}</p>
          </div>
        </div>

        <div class="panel">
          <h3 class="sectionTitle">Tickets</h3>
          <div class="buyRow">
            <select class="select" id="ticketType">
              ${ticketOptions}
            </select>

            <div class="qty">
              <button class="qty__btn" id="qtyMinus">–</button>
              <input class="input qty__input" id="qty" type="number" min="1" value="1"/>
              <button class="qty__btn" id="qtyPlus">+</button>
            </div>

            <button class="btn btn--primary" id="buyBtn">Buy</button>
          </div>

          <div class="muted" id="priceLine" style="margin-top:10px;"></div>
          <div id="msg" style="margin-top:12px;"></div>
        </div>
      </div>
    `;

    const sel = root.querySelector("#ticketType");
    const qtyInput = root.querySelector("#qty");
    const minus = root.querySelector("#qtyMinus");
    const plus = root.querySelector("#qtyPlus");
    const buyBtn = root.querySelector("#buyBtn");
    const priceLine = root.querySelector("#priceLine");
    const msg = root.querySelector("#msg");

    function current() {
      const opt = sel.selectedOptions[0];
      return {
        type: sel.value,
        price: Number(opt?.dataset?.price ?? 0),
        available: Number(opt?.dataset?.available ?? 0),
        qty: Math.max(1, Number(qtyInput.value || 1))
      };
    }

    function renderPrice() {
      const c = current();
      const total = c.price * c.qty;
      priceLine.textContent = `Selected: ${c.type} • ${kzt(c.price)} each • Total: ${kzt(total)}`;
    }

    minus.onclick = () => {
      qtyInput.value = String(Math.max(1, Number(qtyInput.value || 1) - 1));
      renderPrice();
    };
    plus.onclick = () => {
      qtyInput.value = String(Number(qtyInput.value || 1) + 1);
      renderPrice();
    };
    sel.onchange = renderPrice;
    qtyInput.oninput = renderPrice;

    renderPrice();

    buyBtn.onclick = async () => {
      msg.innerHTML = "";

      const token = localStorage.getItem("USER_TOKEN");
      if (!token) {
        msg.innerHTML = `<div class="alert alert--error"><b>Please login</b> to buy tickets.</div>`;
        setTimeout(() => (location.hash = "#/login"), 600);
        return;
      }

      const c = current();
      if (c.qty > c.available) {
        msg.innerHTML = `<div class="alert alert--error"><b>Not enough tickets available.</b></div>`;
        return;
      }

      try {
        buyBtn.disabled = true;
        buyBtn.textContent = "Buying...";

        const payload = {
          eventId: ev._id,
          ticketType: c.type,
          quantity: c.qty
        };

        await window.api.request("POST", "/tickets", payload, true);

        msg.innerHTML = `<div class="alert"><b>Success!</b> Ticket purchased. Go to <a href="#/profile">Profile</a>.</div>`;

      } catch (e) {
        const details = e.payload?.errors?.map(x => x.message).join(", ");
        msg.innerHTML = `<div class="alert alert--error"><b>${e.message}</b>${details ? `<div class="muted" style="margin-top:6px">${details}</div>` : ""}</div>`;
      } finally {
        buyBtn.disabled = false;
        buyBtn.textContent = "Buy";
      }
    };
  } catch (e) {
    root.innerHTML = `
      <div class="alert alert--error">
        <b>${e.message}</b>
      </div>
      <a class="backlink" href="#/events">← Back to events</a>
    `;
  }
};
