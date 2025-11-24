// Auto-detect GitHub Pages repo name
const repo = window.location.pathname.split('/')[1];
const base = `/${repo}`;

function loadComponent(id, file) {
    fetch(base + file)
        .then(res => res.text())
        .then(html => document.getElementById(id).innerHTML = html)
        .catch(err => console.error("Component load error:", err));
}

// Load components from correct root
loadComponent("sidebar", "/components/sidebar.html");
loadComponent("topbar", "/components/topbar.html");
