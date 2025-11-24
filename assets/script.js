document.addEventListener("DOMContentLoaded", function () {

    let data = [];
    let statusChart, circleChart, rangeChart;

    // ---------------- CSV AUTO-DETECT CURRENT MONTH ----------------
    let now = new Date();
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, "0");
    let currentCSV = `data/${year}-${month}.csv`;

    Papa.parse(currentCSV, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            data = cleanRows(results.data);
            initDashboard();
        }
    });

    function cleanRows(rows) {
        return rows.filter(r => Object.values(r).some(v => v && v.trim() !== ""));
    }

    // ---------------- ENTRY FORM ----------------
    document.getElementById("entryForm").onsubmit = function (e) {
        e.preventDefault();

        let formData = new FormData(e.target);
        let entry = {};

        formData.forEach((val, key) => {
            entry[key.replace(/\s+/g, "_")] = val.trim();
        });

        data.push(entry);

        fillTable(data);
        updateCharts(data);
        fillFilters(data);

        alert("Asset added successfully!");

        e.target.reset();
    };

    // ---------------- CSV DOWNLOAD ----------------
    document.getElementById("downloadCSV").onclick = function () {
        let orderedColumns = [
            "DATE", "Asset_ID", "Material_Type", "Model_Variant", "NOS",
            "Circle", "Division", "Substation", "Status",
            "Assigned_To", "Planned_Date", "Replacement_Date",
            "Remarks", "Last_Updated_By"
        ];

        let csvText = Papa.unparse({ fields: orderedColumns, data: data });

        let blob = new Blob([csvText], { type: "text/csv" });
        let url = URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.href = url;
        a.download = `${year}-${month}.csv`;
        a.click();
    };

    // ---------------- CSV IMPORT ----------------
    document.getElementById("importCSV").addEventListener("change", function () {
        Papa.parse(this.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (res) {
                data = cleanRows(res.data);
                fillTable(data);
                updateCharts(data);
                fillFilters(data);
            }
        });
    });

    // ---------------- FILTERS ----------------
    function applyFilters() {
        let status = document.getElementById("statusFilter").value;
        let circle = document.getElementById("circleFilter").value;
        let search = document.getElementById("searchBox").value.toLowerCase();

        let filtered = data.filter(row => {
            return (!status || row.Status === status) &&
                (!circle || row.Circle === circle) &&
                ((row.Asset_ID || "").toLowerCase().includes(search) ||
                 (row.Substation || "").toLowerCase().includes(search) ||
                 (row.Assigned_To || "").toLowerCase().includes(search));
        });

        fillTable(filtered);
        updateCharts(filtered);
    }

    // ---------------- DATE RANGE CHART ----------------
    document.getElementById("rangeBtn").onclick = function () {
        let start = document.getElementById("startDate").value;
        let end = document.getElementById("endDate").value;

        if (!start || !end) {
            alert("Please select both start and end dates!");
            return;
        }

        let startDate = new Date(start);
        let endDate = new Date(end);

        let subset = data.filter(r => {
            if (!r.DATE) return false;
            let d = parseDate(r.DATE);
            return d >= startDate && d <= endDate;
        });

        let count = {};
        subset.forEach(r => {
            let d = r.DATE;
            count[d] = (count[d] || 0) + 1;
        });

        if (rangeChart) rangeChart.destroy();
        rangeChart = new Chart(document.getElementById("rangeChart"), {
            type: "bar",
            data: {
                labels: Object.keys(count),
                datasets: [{ label: "Material Count", data: Object.values(count) }]
            }
        });
    };

    function parseDate(d) {
        if (d.includes("/")) {
            let [dd, mm, yyyy] = d.split("/");
            return new Date(`${yyyy}-${mm}-${dd}`);
        }
        if (d.includes("-")) {
            let [yyyy, mm, dd] = d.split("-");
            return new Date(`${yyyy}-${mm}-${dd}`);
        }
        return new Date(d);
    }

    // ---------------- INIT DASHBOARD ----------------
    function initDashboard() {
        fillTable(data);
        fillFilters(data);
        updateCharts(data);
        attachEvents();
        loadTheme();
    }

    function attachEvents() {
        document.getElementById("statusFilter").onchange = applyFilters;
        document.getElementById("circleFilter").onchange = applyFilters;
        document.getElementById("searchBox").onkeyup = applyFilters;
    }

    // ---------------- TABLE ----------------
    function fillTable(rows) {
        let tbody = document.querySelector("#assetTable tbody");
        tbody.innerHTML = "";

        rows.forEach(row => {
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.DATE || ""}</td>
                <td>${row.Asset_ID || ""}</td>
                <td>${row.Material_Type || ""}</td>
                <td>${row.Model_Variant || ""}</td>
                <td>${row.NOS || ""}</td>
                <td>${row.Circle || ""}</td>
                <td>${row.Division || ""}</td>
                <td>${row.Substation || ""}</td>
                <td>${row.Status || ""}</td>
                <td>${row.Assigned_To || ""}</td>
                <td>${row.Planned_Date || ""}</td>
                <td>${row.Replacement_Date || ""}</td>
                <td>${row.Remarks || ""}</td>
                <td>${row.Last_Updated_By || ""}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ---------------- FILTER DROPDOWNS ----------------
    function fillFilters(rows) {
        let circles = [...new Set(rows.map(r => r.Circle).filter(Boolean))];

        let circleFilter = document.getElementById("circleFilter");
        circleFilter.innerHTML = "<option value=''>All Circles</option>";

        circles.forEach(c => {
            let opt = document.createElement("option");
            opt.textContent = c;
            circleFilter.appendChild(opt);
        });
    }

    // ---------------- CHARTS ----------------
    function updateCharts(rows) {
        let statusCount = {};
        rows.forEach(r => { if (r.Status) statusCount[r.Status] = (statusCount[r.Status] || 0) + 1; });

        if (statusChart) statusChart.destroy();
        statusChart = new Chart(document.getElementById("statusChart"), {
            type: "pie",
            data: { labels: Object.keys(statusCount), datasets: [{ data: Object.values(statusCount) }] }
        });

        let circleCount = {};
        rows.forEach(r => { if (r.Circle) circleCount[r.Circle] = (circleCount[r.Circle] || 0) + 1; });

        if (circleChart) circleChart.destroy();
        circleChart = new Chart(document.getElementById("circleChart"), {
            type: "bar",
            data: { labels: Object.keys(circleCount), datasets: [{ label: "Assets", data: Object.values(circleCount) }] }
        });
    }

    // ---------------- THEME TOGGLE ----------------
    document.getElementById("themeToggle").onclick = function () {
        let body = document.getElementById("body");
        body.classList.toggle("bg-dark");
        body.classList.toggle("text-white");

        let mode = body.classList.contains("bg-dark") ? "dark" : "light";
        localStorage.setItem("theme", mode);

        this.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    };

    function loadTheme() {
        let saved = localStorage.getItem("theme");
        if (saved === "dark") {
            document.getElementById("body").classList.add("bg-dark", "text-white");
            document.getElementById("themeToggle").textContent = "☀️ Light Mode";
        }
    }

});
