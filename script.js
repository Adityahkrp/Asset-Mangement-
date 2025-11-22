Papa.parse("data/assets.csv", {
    download: true,
    header: true,
    complete: function(results) {
        let data = results.data;
        let tbody = document.querySelector("#assetTable tbody");

        // Fill table
        function renderTable(filteredData) {
            tbody.innerHTML = "";
            filteredData.forEach(row => {
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

        // Load Circles in dropdown
        let circleSet = new Set(data.map(d => d.Circle).filter(Boolean));
        let circleFilter = document.getElementById("circleFilter");
        circleSet.forEach(c => {
            let opt = document.createElement("option");
            opt.textContent = c;
            circleFilter.appendChild(opt);
        });

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

            renderTable(filtered);
        }

        document.getElementById("statusFilter").onchange = applyFilters;
        document.getElementById("circleFilter").onchange = applyFilters;
        document.getElementById("searchBox").onkeyup = applyFilters;

        renderTable(data);
    }
});
