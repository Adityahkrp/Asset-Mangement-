// ---- Populate Year Select ----
const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const historyTable = document.getElementById("historyTable");

for (let y = 2023; y <= 2030; y++) {
    let opt = document.createElement("option");
    opt.value = opt.textContent = y;
    yearSelect.appendChild(opt);
}

// ---- Populate Month Select ----
for (let m = 1; m <= 12; m++) {
    let mm = String(m).padStart(2, '0');
    let opt = document.createElement("option");
    opt.value = opt.textContent = mm;
    monthSelect.appendChild(opt);
}

// Default selection = current month-year
let now = new Date();
yearSelect.value = now.getFullYear();
monthSelect.value = String(now.getMonth() + 1).padStart(2, '0');


// ---- Load History Button ----
document.getElementById("loadHistory").onclick = function () {
    let year = yearSelect.value;
    let month = monthSelect.value;

    let filePath = `data/${year}-${month}.csv`;

    Papa.parse(filePath, {
        download: true,
        header: true,
        skipEmptyLines: true,
        error: function () {
            historyTable.innerHTML =
                `<div class="alert alert-danger">
                    File not found: <b>${filePath}</b>
                </div>`;
        },
        complete: function (res) {
            if (!res.data || res.data.length === 0) {
                historyTable.innerHTML =
                    `<div class="alert alert-warning">
                        No data inside: <b>${filePath}</b>
                    </div>`;
                return;
            }
            display(res.data);
        }
    });
};


// ---- Display Table ----
function display(rows) {
    if (rows.length === 0) {
        historyTable.innerHTML =
            `<div class="alert alert-warning">No rows to display</div>`;
        return;
    }

    let html = "<table class='table table-bordered table-striped'><thead><tr>";

    Object.keys(rows[0]).forEach(k => html += `<th>${k}</th>`);
    html += "</tr></thead><tbody>";

    rows.forEach(r => {
        html += "<tr>";
        Object.values(r).forEach(v => html += `<td>${v || ""}</td>`);
        html += "</tr>";
    });

    html += "</tbody></table>";
    historyTable.innerHTML = html;
}
