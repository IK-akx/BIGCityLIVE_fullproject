window.views = window.views || {};

function setAuthState({ token, user }) {
  localStorage.setItem("USER_TOKEN", token);
  localStorage.setItem("USER_ROLE", user.role || "user");
  localStorage.setItem("USER_EMAIL", user.email || "");
}

function showErrors(payload) {
  const details = payload?.errors?.map(e => `• ${e.field}: ${e.message}`).join("<br>");
  if (details) return `<div class="muted" style="margin-top:8px">${details}</div>`;
  return "";
}

window.views.renderAuth = function renderAuth(root) {
  root.innerHTML = `
    <div class="authWrap">
      <div class="authCard">
        <div class="authTabs">
          <button class="tab tab--active" id="tabLogin">Login</button>
          <button class="tab" id="tabRegister">Register</button>
        </div>

        <div id="msg" style="margin-top:12px;"></div>

        <form id="formLogin" class="form">
          <label class="label">Email</label>
          <input class="input" type="email" id="loginEmail" placeholder="you@example.com" required>

          <label class="label">Password</label>
          <input class="input" type="password" id="loginPass" placeholder="••••••••" required>

          <button class="btn btn--primary" type="submit" id="btnLogin" style="width:100%; margin-top:10px;">
            Login
          </button>
        </form>

        <form id="formRegister" class="form" style="display:none;">
          <label class="label">Username</label>
          <input class="input" type="text" id="regUsername" placeholder="Your name" required>

          <label class="label">Email</label>
          <input class="input" type="email" id="regEmail" placeholder="you@example.com" required>

          <label class="label">Password</label>
          <input class="input" type="password" id="regPass" placeholder="Min 6 characters" required>

          <button class="btn btn--primary" type="submit" id="btnRegister" style="width:100%; margin-top:10px;">
            Create account
          </button>

          <div class="muted" style="margin-top:10px; font-size:13px;">
            By registering you agree to basic usage rules. (demo text)
          </div>
        </form>

        <div class="muted" style="margin-top:14px; font-size:13px;">
          After login you can buy tickets and manage your profile.
        </div>
      </div>
    </div>
  `;

  const tabLogin = root.querySelector("#tabLogin");
  const tabRegister = root.querySelector("#tabRegister");
  const formLogin = root.querySelector("#formLogin");
  const formRegister = root.querySelector("#formRegister");
  const msg = root.querySelector("#msg");

  function setTab(which) {
    const isLogin = which === "login";
    tabLogin.classList.toggle("tab--active", isLogin);
    tabRegister.classList.toggle("tab--active", !isLogin);
    formLogin.style.display = isLogin ? "" : "none";
    formRegister.style.display = isLogin ? "none" : "";
    msg.innerHTML = "";
  }

  tabLogin.onclick = () => setTab("login");
  tabRegister.onclick = () => setTab("register");

  formLogin.onsubmit = async (e) => {
    e.preventDefault();
    msg.innerHTML = "";

    const email = root.querySelector("#loginEmail").value.trim();
    const password = root.querySelector("#loginPass").value;

    const btn = root.querySelector("#btnLogin");
    btn.disabled = true;
    btn.textContent = "Logging in...";

    try {
      const data = await window.api.request("POST", "/login", { email, password });
      setAuthState(data);

      msg.innerHTML = `<div class="alert"><b>Success!</b> Logged in.</div>`;
      setTimeout(() => {
        location.hash = "#/events";
        window.updateNav?.(); 
      }, 400);
    } catch (err) {
      msg.innerHTML = `
        <div class="alert alert--error">
          <b>${err.message}</b>
          ${showErrors(err.payload)}
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.textContent = "Login";
    }
  };

  formRegister.onsubmit = async (e) => {
    e.preventDefault();
    msg.innerHTML = "";

    const username = root.querySelector("#regUsername").value.trim();
    const email = root.querySelector("#regEmail").value.trim();
    const password = root.querySelector("#regPass").value;

    const btn = root.querySelector("#btnRegister");
    btn.disabled = true;
    btn.textContent = "Creating...";

    try {
      const data = await window.api.request("POST", "/register", { username, email, password });
      setAuthState(data);

      msg.innerHTML = `<div class="alert"><b>Welcome!</b> Account created.</div>`;
      setTimeout(() => {
        location.hash = "#/events";
        window.updateNav?.();
      }, 500);
    } catch (err) {
      msg.innerHTML = `
        <div class="alert alert--error">
          <b>${err.message}</b>
          ${showErrors(err.payload)}
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.textContent = "Create account";
    }
  };
};
