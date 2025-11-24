// Load components dynamically
function loadComponent(id, file) {
    fetch(file)
        .then(res => res.text())
        .then(html => document.getElementById(id).innerHTML = html);
}

// Inject sidebar + topbar
loadComponent("sidebar", "../components/sidebar.html");
loadComponent("topbar", "../components/topbar.html");
