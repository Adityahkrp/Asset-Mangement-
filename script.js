let data = [];
let statusChart, circleChart;

// Load CSV
Papa.parse("data/assets.csv", {
    download: true,
    header: true,
    complete: function(results) {
        data = results.data;
        initDashboard();
    }
});

// Initialize dashboard
function initDashboard() {
    fillTable(data);
    fillFilters(data);
    updateCharts(data);
    attachEvents();
}

// Fill Table
function fillTable(rows) {
    let tbody = document.querySelector("#assetTable tbody");
    tbody.innerHTML = "";
    rows.forEach(row => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row["DATE"]}</td>
            <td>${row["Asset ID"]}</td>
            <td>${row["Material Type"]}</td>
            <td>${row["Model/Variant"]}</td>
            <td>${row["NOS"]}</td>
            <td>${row["Circle"]}</td>
            <td>${row["Division"]}</td>
            <td>${row["Substation"]}</td>
            <td>${row["Status"]}</td>
            <td>${row["Assigned To"]}</td>
            <td>${row["Planned Date"]}</td>
            <td>${row["Replacement Date"]}</td>
            <td>${row["Remarks"]}</td>
            <td>${row["Last Updated By"]}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Fill filters
function fillFilters(data) {
    let circles = [...new Set(data.map(x => x.Circle).filter(x => x))];
    let circleFilter = document.getElementById("circleFilter");

    circles.forEach(circle => {
        let opt = document.createElement("option");
        opt.textContent = circle;
        circleFilter.appendChild(opt);
    });
}

// Apply filters
function applyFilters() {
    let status = document.getElementById("statusFilter").value;
    let circle = document.getElementById("circleFilter").value;
    let search = document.getElementById("searchBox").value.toLowerCase();

    let filtered = data.filter(row => {
        return (!status || row.Status === status) &&
               (!circle || row.Circle === circle) &&
               (
                   row["Asset ID"]?.toLowerCase().includes(search) ||
                   row["Substation"]?.toLowerCase().includes(search) ||
                   row["Assigned To"]?.toLowerCase().includes(search)
               );
    });

    fillTable(filtered);
    updateCharts(filtered);
}

// Create Charts
function updateCharts(rows) {
    // Status chart
    let statusCount = {};
    rows.forEach(r => statusCount[r.Status] = (statusCount[r.Status] || 0) + 1);

    let ctx1 = document.getElementById("statusChart");

    if (statusChart) statusChart.destroy();
    statusChart = new Chart(ctx1, {
        type: "pie",
        data: {
            labels: Object.keys(statusCount),
            datasets: [{
                data: Object.values(statusCount),
                backgroundColor: ["#4e79a7", "#59a14f", "#f28e2b", "#e15759"]
            }]
        }
    });

    // Circle chart
    let circleCount = {};
    rows.forEach(r => circleCount[r.Circle] = (circleCount[r.Circle] || 0) + 1);

    let ctx2 = document.getElementById("circleChart");

    if (circleChart) circleChart.destroy();
    circleChart = new Chart(ctx2, {
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

// Add New Asset
document.getElementById("entryForm").onsubmit = function(e) {
    e.preventDefault();

    let formData = new FormData(e.target);
    let newEntry = {};
    formData.forEach((value, key) => newEntry[key] = value);

    data.push(newEntry);

    fillTable(data);
    updateCharts(data);

    alert("Asset added successfully!");
};

// Download updated CSV
document.getElementById("downloadCSV").onclick = function() {
    let csv = Papa.unparse(data);

    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "updated_assets.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// Theme Toggle
document.getElementById("themeToggle").onclick = function() {
    let body = document.getElementById("body");

    if (body.classList.contains("bg-dark")) {
        body.classList.remove("bg-dark", "text-white");
        this.textContent = "🌙 Dark Mode";
    } else {
        body.classList.add("bg-dark", "text-white");
        this.textContent = "☀️ Light Mode";
    }
};

// Attach filter events
function attachEvents() {
    document.getElementById("statusFilter").onchange = applyFilters;
    document.getElementById("circleFilter").onchange = applyFilters;
    document.getElementById("searchBox").onkeyup = applyFilters;
}
