// Populate selectors
for (let y = 2023; y <= 2030; y++) {
    let opt = document.createElement("option");
    opt.textContent = y;
    document.getElementById("yearSelect").appendChild(opt);
}

for (let m = 1; m <= 12; m++) {
    let opt = document.createElement("option");
    opt.textContent = String(m).padStart(2, '0');
    document.getElementById("monthSelect").appendChild(opt);
}

// Load selected month
document.getElementById("loadHistory").onclick = function() {
    let year = document.getElementById("yearSelect").value;
    let month = document.getElementById("monthSelect").value;

    Papa.parse(`data/${year}-${month}.csv`, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(res) {
            let rows = res.data;
            display(rows);
        }
    });
};

function display(rows) {
    let html = "<table class='table table-bordered'><tr>";

    Object.keys(rows[0]).forEach(k => html += `<th>${k}</th>`);
    html += "</tr>";

    rows.forEach(r => {
        html += "<tr>";
        Object.values(r).forEach(v => html += `<td>${v}</td>`);
        html += "</tr>";
    });

    html += "</table>";
    document.getElementById("historyTable").innerHTML = html;
}
