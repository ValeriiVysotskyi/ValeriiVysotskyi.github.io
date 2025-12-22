let feastDaysCount = 0

function addFeastDay(){
    const container = document.getElementById("eventContainer")
    const eventNameInput = document.createElement("input")
    eventNameInput.type = "text"
    eventNameInput.className = "eventsNames"
    eventNameInput.placeholder = "Назва свята"
    eventNameInput.required = true;

    const dateInput = document.createElement("input")
    dateInput.type = "date"
    dateInput.className = "eventsDates"
    dateInput.required = true;

    const deleteEventBtn = document.createElement("button")
    deleteEventBtn.textContent = "Х"

    const wrapper = document.createElement("div")
    wrapper.className = "eventWrapper"
    wrapper.append(eventNameInput, dateInput, deleteEventBtn)
    container.appendChild(wrapper)

    deleteEventBtn.onclick = () => {
        container.removeChild(wrapper);
        feastDaysCount--
    }
    feastDaysCount++;
}

function startSundayCheck(){
    let startDate = new Date(document.getElementById("startDate").value)
    if (!startDate.getDay()){
        document.getElementById("resultText").textContent = "Дата початку відпустки випадає на Неділю"
    }
}

function endSundayCheck(){
    let endDate = new Date(document.getElementById("endDate").value)
    if (!endDate.getDay()){
        document.getElementById("resultText").textContent = "Дата закінчення відпустки випадає на Неділю"
    }
}

function calculateDuring(startDate, endDate){
    let duringMs = endDate - startDate
    let during = (duringMs / (1000*60*60*24)) - feastDaysCount + 1
    return during
}

function calculateStartDate(during, endDate){
    let duringWithFeast = during + feastDaysCount - 1
    let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()-duringWithFeast)
    return startDate
}

function calculateEndDate(during, startDate){
    let duringWithFeast = during + feastDaysCount - 1
    let endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+duringWithFeast)
    return endDate
}

function calculateVacation(){
    let startDate, endDate
    let feastDays = {}
    let during = Number(document.getElementById("during").value)
    let stringStartDate = document.getElementById("startDate").value
    let stringEndDate = document.getElementById("endDate").value

    if (feastDaysCount){
        const nameInputs = document.querySelectorAll(".eventsNames");
        const dateInputs = document.querySelectorAll(".eventsDates");

        for (let i = 0; i < dateInputs.length; i++) {
            let date = dateInputs[i].value.trim();
            let name = nameInputs[i].value.trim();
            if (date && name) {
                let date = dateInputs[i].value;
                let name = nameInputs[i].value;
                feastDays[date] = name;
            }
            else {
                document.getElementById("resultText").textContent = "Заповність інформацію про свято або видаліть його"
                return
            }
        }  
    }
    
    requiredOptions = [during, stringStartDate, stringEndDate]

    if (requiredOptions.filter(f => !f).length === 1){
        if (!during){
            startDate = new Date(stringStartDate)
            endDate = new Date(stringEndDate)

            if (feastDayInDiapazon(startDate, endDate, feastDays)){
                during = calculateDuring(startDate, endDate, feastDays)
                document.getElementById("resultText").textContent = `Тривалість відпустки: ${during} дн.`
            }    
        }
        else if (!stringStartDate){
            endDate = new Date(stringEndDate)
            startDate = calculateStartDate(during, endDate, feastDays)
            if (feastDayInDiapazon(startDate, endDate, feastDays)){
                document.getElementById("resultText").textContent = `Дата початку відпустки: ${startDate.toDateString()}`
            }
        }
        else if (!stringEndDate){
            startDate = new Date(stringStartDate)
            endDate = calculateEndDate(during, startDate, feastDays)
            if (feastDayInDiapazon(startDate, endDate, feastDays)){
                document.getElementById("resultText").textContent = `Дата закінчення відпустки: ${endDate.toDateString()}`
            }
        }
    }
    else {
        document.getElementById("resultText").textContent = "Перевірте дані, одне зі значень має бути порожнім"
    }
}

function feastDayInDiapazon(startDate, endDate, feastDays){
    if (!feastDaysCount) return true

    for (let key in feastDays) {
        const feastDate = new Date(key);
        if (feastDate < startDate || feastDate > endDate) {
            document.getElementById("resultText").textContent = "Перевірте дані, є свято вне діпазоні відпустки"
            return false
        }
    }
    return true
}