document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            renderTable(results.data);
        }
    });
});

function renderTable(data) {
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (data.length === 0) return;

    // Add headers
    const headers = Object.keys(data[0]);
    let tr = document.createElement('tr');
    headers.forEach(h => {
        let th = document.createElement('th');
        th.textContent = h;
        tr.appendChild(th);
    });
    tableHead.appendChild(tr);

    // Add rows
    data.forEach(row => {
        let tr = document.createElement('tr');
        headers.forEach(h => {
            let td = document.createElement('td');
            td.textContent = row[h];
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
    document.getElementById('searchBox').addEventListener('input', function(e) {
    const value = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#table-body tr');
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(value) ? '' : 'none';
    });
});
}
