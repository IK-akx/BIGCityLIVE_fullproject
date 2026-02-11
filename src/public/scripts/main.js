function getRole() {
  return localStorage.getItem("USER_ROLE") || "";
}

function isLoggedIn() {
  return !!localStorage.getItem("USER_TOKEN");
}

function updateNav() {
  document.getElementById("year").textContent = new Date().getFullYear();

  const btnAuth = document.getElementById("btnAuth");
  const navProfile = document.getElementById("navProfile");
  const navAdmin = document.getElementById("navAdmin");

  if (isLoggedIn()) {
    btnAuth.textContent = "Logout";
    navProfile.style.display = "";
    navAdmin.style.display = (getRole() === "admin") ? "" : "none";
  } else {
    btnAuth.textContent = "Login";
    navProfile.style.display = "none";
    navAdmin.style.display = "none";
  }

  btnAuth.onclick = () => {
    if (isLoggedIn()) {
      localStorage.removeItem("USER_TOKEN");
      localStorage.removeItem("USER_ROLE");
      localStorage.removeItem("USER_EMAIL");
      location.hash = "#/events";
      updateNav();
    } else {
      location.hash = "#/login";
    }
  };
}
window.updateNav = updateNav;

async function renderRoute() {
  updateNav();

  const app = document.getElementById("app");
  const hash = location.hash || "#/events";

  if (hash === "#/" || hash === "#") location.hash = "#/events";

  if (hash === "#/events") {
    return window.views.renderEventsList(app);
  }

  if (hash.startsWith("#/event/")) {
    const id = hash.split("#/event/")[1];
    return window.views.renderEventDetails(app, id);
  }
  if (hash === "#/login") {
    return window.views.renderAuth(app);
  }
  if (hash === "#/profile") {
    return window.views.renderProfile(app);
  }
  if (hash === "#/admin") {
    return window.views.renderAdmin(app);
  }

  app.innerHTML = `<div class="alert alert--error"><b>Page not found</b></div>`;
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("DOMContentLoaded", () => {
  if (!location.hash) location.hash = "#/events";
  renderRoute();
});
