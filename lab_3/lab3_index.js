let timer = null;
let counter = 0;

function startGeneration() {
    const interval = document.getElementById("intervalInput").value;
    const tbody = document.querySelector("#dataTable tbody");
    const ingridients = ["Капуста", "Картопля", "Буряк", 
        "Морква", "Сало", "Цибуля", "Свинина", "Хліб"];

    if (timer !== null) return;

    timer = setInterval(() => {
        counter++;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${counter}</td>
            <td>${ingridients[Math.floor(Math.random() * ingridients.length)]}</td>
            <td>${Math.floor(Math.random() * 1000)}</td>
        `;

        tbody.appendChild(row);
    }, interval);
}

function stopGeneration() {
    clearInterval(timer);
    timer = null;
}