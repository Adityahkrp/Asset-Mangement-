// Load sidebar
fetch("../components/sidebar.html")
    .then(res => res.text())
    .then(html => document.getElementById("sidebar").innerHTML = html);

// Load topbar
fetch("../components/topbar.html")
    .then(res => res.text())
    .then(html => document.getElementById("topbar").innerHTML = html);

