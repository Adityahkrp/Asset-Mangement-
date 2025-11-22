document.addEventListener('DOMContentLoaded', function() {

    let data = [];
    let statusChart, circleChart, rangeChart;

    // Detect current month CSV
    let now = new Date();
    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0');
    let currentCSV = `data/${year}-${month}.csv`;

    // Load CSV
    Papa.parse(currentCSV, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            data = results.data;
            initDashboard();
        }
    });

    // ---------- ENTRY FORM ----------
    document.getElementById("entryForm").onsubmit = function(e){
        e.preventDefault();

        let formData = new FormData(e.target);
        let entry = {};
        formData.forEach((val,key) => entry[key.replace(/\s+/g,"_")] = val.trim());

        data.push(entry);
        fillTable(data);
        updateCharts(data);

        alert("Asset added successfully!");
        e.target.reset();
    };

    // ---------- CSV DOWNLOAD ----------
    document.getElementById("downloadCSV").onclick = function() {
        let csvText = Papa.unparse(data);
        let blob = new Blob([csvText], { type: "text/csv" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = `${year}-${month}.csv`;
        a.click();
    };

    // ---------- CSV IMPORT ----------
    document.getElementById("importCSV").addEventListener("change", function() {
        Papa.parse(this.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function(res) {
                data = res.data;
                fillTable(data);
                updateCharts(data);
            }
        });
    });

    // ---------- DATE RANGE CHART ----------
    document.getElementById("rangeBtn").onclick = function() {
        let start = new Date(document.getElementById("startDate").value);
        let end = new Date(document.getElementById("endDate").value);

        let subset = data.filter(r => {
            if(!r.DATE) return false;
            let d = new Date(r.DATE);
            return d >= start && d <= end;
        });

        let count = {};
        subset.forEach(r => {
            let key = r.DATE;
            count[key] = (count[key] || 0) + 1;
        });

        if(rangeChart) rangeChart.destroy();
        rangeChart = new Chart(document.getElementById("rangeChart"), {
            type: "bar",
            data: {
                labels: Object.keys(count),
                datasets: [{ label:"Material Count", data:Object.values(count), backgroundColor:"#4e79a7" }]
            }
        });
    };

    // ---------- FILTERS ----------
    function applyFilters() {
        let status = document.getElementById("statusFilter").value;
        let circle = document.getElementById("circleFilter").value;
        let search = document.getElementById("searchBox").value.toLowerCase();

        let filtered = data.filter(row => {
            if(!row.Asset_ID) return false;
            return (!status || row.Status === status) &&
                   (!circle || row.Circle === circle) &&
                   (
                    (row.Asset_ID||"").toString().toLowerCase().includes(search) ||
                    (row.Substation||"").toString().toLowerCase().includes(search) ||
                    (row.Assigned_To||"").toString().toLowerCase().includes(search)
                   );
        });
        fillTable(filtered);
        updateCharts(filtered);
    }

    // ---------- INIT DASHBOARD ----------
    function initDashboard(){
        fillTable(data);
        fillFilters(data);
        updateCharts(data);
        attachEvents();
    }

    function attachEvents(){
        document.getElementById("statusFilter").onchange = applyFilters;
        document.getElementById("circleFilter").onchange = applyFilters;
        document.getElementById("searchBox").onkeyup = applyFilters;
    }

    function fillTable(rows){
        let tbody = document.querySelector("#assetTable tbody");
        tbody.innerHTML = "";
        rows.forEach(row=>{
            if(!row.Asset_ID) return;
            let tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.DATE||""}</td>
                <td>${row.Asset_ID||""}</td>
                <td>${row.Material_Type||""}</td>
                <td>${row.Model_Variant||""}</td>
                <td>${row.NOS||""}</td>
                <td>${row.Circle||""}</td>
                <td>${row.Division||""}</td>
                <td>${row.Substation||""}</td>
                <td>${row.Status||""}</td>
                <td>${row.Assigned_To||""}</td>
                <td>${row.Planned_Date||""}</td>
                <td>${row.Replacement_Date||""}</td>
                <td>${row.Remarks||""}</td>
                <td>${row.Last_Updated_By||""}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function fillFilters(rows){
        let circleSet = new Set(rows.map(r=>r.Circle).filter(Boolean));
        let circleFilter = document.getElementById("circleFilter");
        circleFilter.innerHTML = "<option value=''>All Circles</option>";
        circleSet.forEach(c=>{
            let opt = document.createElement("option");
            opt.textContent = c;
            circleFilter.appendChild(opt);
        });
    }

    function updateCharts(rows){
        // STATUS PIE
        let statusCount = {};
        rows.forEach(r=>{ if(r.Status) statusCount[r.Status]=(statusCount[r.Status]||0)+1; });
        if(statusChart) statusChart.destroy();
        statusChart = new Chart(document.getElementById("statusChart"), {
            type:"pie",
            data:{
                labels:Object.keys(statusCount),
                datasets:[{ data:Object.values(statusCount), backgroundColor:["#4e79a7","#59a14f","#f28e2b","#e15759"] }]
            }
        });

        // CIRCLE BAR
        let circleCount = {};
        rows.forEach(r=>{ if(r.Circle) circleCount[r.Circle]=(circleCount[r.Circle]||0)+1; });
        if(circleChart) circleChart.destroy();
        circleChart = new Chart(document.getElementById("circleChart"), {
            type:"bar",
            data:{
                labels:Object.keys(circleCount),
                datasets:[{label:"Assets", data:Object.values(circleCount), backgroundColor:"#4e79a7"}]
            }
        });
    }

    // ---------- THEME TOGGLE ----------
    document.getElementById("themeToggle").onclick = function(){
        let body = document.getElementById("body");
        body.classList.toggle("bg-dark");
        body.classList.toggle("text-white");
        this.textContent = body.classList.contains("bg-dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
    };

});
