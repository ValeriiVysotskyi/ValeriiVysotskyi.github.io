let currentDate = new Date()
let expiredDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0)
let currentBalance, tarif

function setAutomaticDates(currentDate, expiredDate){
    yyyy = currentDate.getFullYear();
    mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    dd = String(currentDate.getDate()).padStart(2, '0');
    document.getElementById("currentDate").value = `${yyyy}-${mm}-${dd}`;

    yyyy = expiredDate.getFullYear();
    mm = String(expiredDate.getMonth() + 1).padStart(2, '0');
    dd = String(expiredDate.getDate()).padStart(2, '0');
    document.getElementById("expiredDate").value = `${yyyy}-${mm}-${dd}`;
}

function getPaidMonthsLeft(currentBalance, tarif, expiredDate){
    let monthWithoutPayment = Math.floor(currentBalance/tarif)
    let paymentDate = new Date(expiredDate.getFullYear(), expiredDate.getMonth()+monthWithoutPayment, expiredDate.getDate())
    return paymentDate
}

function calculateSubscriptionEndDate(){
    currentDate = new Date(document.getElementById("currentDate").value)
    expiredDate = new Date(document.getElementById("expiredDate").value)

    currentBalance = document.getElementById("currentBalance").value
    tarif = document.getElementById("tarif").value

    paymentDate = getPaidMonthsLeft(currentBalance, tarif, expiredDate)

    document.getElementById("resultText").textContent = `Потрібно поповнити баланс до: ${paymentDate.toDateString()}`
}

setAutomaticDates(currentDate, expiredDate)