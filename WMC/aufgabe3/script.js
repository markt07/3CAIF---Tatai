import persons from "./persons.json" with { type: "json" };

let sortKey = null;
let sortAsc = true;

function renderPersons() {
    const tbody = document.querySelector("#tbody");
    tbody.innerHTML = "";
    for (const person of persons) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${person.id}</td>
            <td>${person.name}</td>
            <td>${person.groesse}</td>
            <td>${person.geburtsdatum}</td>
            <td>${person.herkunft}</td>
            <td>${person.gewicht}</td>
        `;
        tbody.appendChild(tr);
    }
}

function sortBy(key) {
    if (sortKey === key) {
        sortAsc = !sortAsc;
    } else {
        sortKey = key;
        sortAsc = true;
    }

    persons.sort((a, b) => {
        if (a[key] < b[key]) return sortAsc ? -1 : 1;
        if (a[key] > b[key]) return sortAsc ? 1 : -1;
        return 0;
    });

    // Update arrow indicators on headers
    document.querySelectorAll("th").forEach(th => {
        th.classList.remove("asc", "desc");
        if (th.dataset.key === key) {
            th.classList.add(sortAsc ? "asc" : "desc");
        }
    });

    renderPersons();
}

document.querySelectorAll("th[data-key]").forEach(th => {
    th.addEventListener("click", () => sortBy(th.dataset.key));
});

renderPersons();
