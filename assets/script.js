let data = [];
let statusChart, circleChart;
let now = new Date();
let year = now.getFullYear();
let month = String(now.getMonth() + 1).padStart(2, '0');
let currentCSV = `data/${year}-${month}.csv`;

Papa.parse(currentCSV, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        data = results.data;
        initDashboard();
    }
});
document.getElementById("entryForm").onsubmit = function (e) {
    e.preventDefault();

    let form = new FormData(e.target);
    let entry = {};

    form.forEach((v, k) => entry[k] = v);

    // Push Entry
    data.push(entry);

    // Save to new month CSV
    let csv = Papa.unparse(data);
    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = `${year}-${month}.csv`;
    a.click();

    alert("Entry saved to this month’s file!");
    fillTable(data);
    updateCharts(data);
};
document.getElementById("importCSV").addEventListener("change", function () {
    Papa.parse(this.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            data = results.data;
            fillTable(data);
            updateCharts(data);
        }
    });
});

// Load CSV with cleaned data
Papa.parse("data/assets.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        data = results.data;
        initDashboard();
    }
});

// INIT
function initDashboard() {
    fillTable(data);
    fillFilters(data);
    updateCharts(data);
    attachEvents();
}

// -------- TABLE RENDERING --------
function fillTable(rows) {
    let tbody = document.querySelector("#assetTable tbody");
    tbody.innerHTML = "";

    rows.forEach(row => {
        if (!row["Asset ID"]) return;   // ignore bad rows

        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row["DATE"] || ""}</td>
            <td>${row["Asset ID"] || ""}</td>
            <td>${row["Material Type"] || ""}</td>
            <td>${row["Model/Variant"] || ""}</td>
            <td>${row["NOS"] || ""}</td>
            <td>${row["Circle"] || ""}</td>
            <td>${row["Division"] || ""}</td>
            <td>${row["Substation"] || ""}</td>
            <td>${row["Status"] || ""}</td>
            <td>${row["Assigned To"] || ""}</td>
            <td>${row["Planned Date"] || ""}</td>
            <td>${row["Replacement Date"] || ""}</td>
            <td>${row["Remarks"] || ""}</td>
            <td>${row["Last Updated By"] || ""}</td>
        `;
        tbody.appendChild(tr);
    });
}

// -------- FILTER SETUP --------
function fillFilters(rows) {
    let circleSet = new Set(rows.map(r => r.Circle).filter(Boolean));

    let circleFilter = document.getElementById("circleFilter");
    circleSet.forEach(c => {
        let opt = document.createElement("option");
        opt.textContent = c;
        circleFilter.appendChild(opt);
    });
}

// -------- FILTER LOGIC --------
function applyFilters() {
    let status = document.getElementById("statusFilter").value;
    let circle = document.getElementById("circleFilter").value;
    let search = document.getElementById("searchBox").value.toLowerCase();

    let filtered = data.filter(row => {
        if (!row["Asset ID"]) return false;

        return (!status || row.Status === status) &&
               (!circle || row.Circle === circle) &&
               (
                   (row["Asset ID"] || "").toLowerCase().includes(search) ||
                   (row["Substation"] || "").toLowerCase().includes(search) ||
                   (row["Assigned To"] || "").toLowerCase().includes(search)
               );
    });

    fillTable(filtered);
    updateCharts(filtered);
}

// -------- CHARTS --------
function updateCharts(rows) {

    // STATUS PIE
    let statusCount = {};
    rows.forEach(r => {
        if (!r.Status) return;
        statusCount[r.Status] = (statusCount[r.Status] || 0) + 1;
    });

    if (statusChart) statusChart.destroy();
    statusChart = new Chart(document.getElementById("statusChart"), {
        type: "pie",
        data: {
            labels: Object.keys(statusCount),
            datasets: [{
                data: Object.values(statusCount),
                backgroundColor: ["#4e79a7", "#59a14f", "#f28e2b", "#e15759"]
            }]
        }
    });

    // CIRCLE BAR
    let circleCount = {};
    rows.forEach(r => {
        if (!r.Circle) return;
        circleCount[r.Circle] = (circleCount[r.Circle] || 0) + 1;
    });

    if (circleChart) circleChart.destroy();
    circleChart = new Chart(document.getElementById("circleChart"), {
        type: "bar",
        data: {
            labels: Object.keys(circleCount),
            datasets: [{
                label: "Assets",
                data: Object.values(circleCount),
                backgroundColor: "#4e79a7"
            }]
        }
    });
}

// -------- ENTRY FORM --------
document.getElementById("entryForm").onsubmit = function(e) {
    e.preventDefault();

    let formData = new FormData(e.target);
    let entry = {};

    formData.forEach((val, key) => {
        entry[key] = val.trim();
    });

    // Save it
    data.push(entry);

    fillTable(data);
    updateCharts(data);

    alert("Asset added successfully!");
    e.target.reset();
};

// -------- CSV DOWNLOAD --------
document.getElementById("downloadCSV").onclick = function() {
    let csvText = Papa.unparse(data);

    let blob = new Blob([csvText], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "updated_assets.csv";
    a.click();
};

// -------- THEME SWITCH --------
document.getElementById("themeToggle").onclick = function () {
    let body = document.getElementById("body");

    body.classList.toggle("bg-dark");
    body.classList.toggle("text-white");

    this.textContent = body.classList.contains("bg-dark")
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
};

// -------- EVENT LISTENERS --------
function attachEvents() {
    document.getElementById("statusFilter").onchange = applyFilters;
    document.getElementById("circleFilter").onchange = applyFilters;
    document.getElementById("searchBox").onkeyup = applyFilters;
}
