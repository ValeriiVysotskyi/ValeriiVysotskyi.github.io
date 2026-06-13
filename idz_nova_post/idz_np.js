//===========================================
//  GLOBAL VARIABLES
//===========================================
const API_KEY = "YOUR API KEY"
const PAGE_LIMIT = 6

var currentPage = 1
var currentWarehousePage = 1
var settlementRef = null
var lastSearchMode = null
var warehouseTypeRef = null


//===========================================
//  API
//===========================================
async function searchSettlement(page) {
    const settlementInput = document.getElementById("settlement-input").value
    if (settlementInput.length < 2) {
        throw new Error("Введіть щонайменше 2 символи")
    }

    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "apiKey": API_KEY,
            "modelName": "AddressGeneral",
            "calledMethod": "getSettlements",
            "methodProperties": {
                "Page" : page,
                "FindByString" : settlementInput,
                "Limit" : PAGE_LIMIT
            }
        })
    })

    if (!response.ok){
        throw new Error(`HTTP помилка: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error("Помилка API Нової Пошти")
    }

    if (data.data.length === 0) {
        throw new Error("Населений пункт не знайдено")
    }

    if (data.info.totalCount === 0) {
        throw new Error("Населений пункт не знайдено")
    }

    return data.data
}

async function searchStreet() {
    const streetInput = document.getElementById("street-input").value
    if (streetInput.length < 2) {
            throw new Error("Введіть щонайменше 2 символи")
    }

    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "apiKey": API_KEY,
            "modelName": "AddressGeneral",
            "calledMethod": "searchSettlementStreets",
            "methodProperties": {
                "StreetName": streetInput,
                "SettlementRef": settlementRef
            }
        })
    })

    if (!response.ok){
        throw new Error(`HTTP помилка: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error("Помилка API Нової Пошти")
    }

    if (data.data[0].TotalCount === 0) {
        throw new Error("Вулицю не знайдено")
    }

    return data.data
}

async function searchWirehouseTypes() {
    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "apiKey": API_KEY,
            "modelName": "AddressGeneral",
            "calledMethod": "getWarehouseTypes",
            "methodProperties": { }
        })
    })

    if (!response.ok) {
        throw new Error(`HTTP помилка: ${response.status}`)
    }
    
    const data = await response.json()

    if (!data.success) {
        throw new Error("Помилка API Нової Пошти")
    }
    
    return data.data
}

async function searchWarehouse(typeRef, page) {
    const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "apiKey": API_KEY,
            "modelName": "AddressGeneral",
            "calledMethod": "getWarehouses",
            "methodProperties": {
                "Page" : page,
                "SettlementRef" : settlementRef,
                "TypeOfWarehouseRef" : typeRef,
                "Limit" : PAGE_LIMIT
            }
        })
    })

    if (!response.ok){
        throw new Error(`HTTP помилка: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        throw new Error("Помилка API Нової Пошти")
    }

    if (data.data.length === 0) {
        throw new Error("Більше відділень не знайдено")
    }

    return data.data
}


//===========================================
//  HANDLERS
//===========================================
async function searchSettlementHandler(page = 1) {
    const previousBtn = document.getElementById("prev-btn")
    const nextBtn = document.getElementById("next-btn")

    try {
        previousBtn.disabled = true
        nextBtn.disabled = true

        page = page === 0? 1 : page

        const settlements = await searchSettlement(page)

        currentPage = page
        lastSearchMode = searchSettlementHandler

        renderSettlements(settlements)

    } catch (error) {
        showErrorMsg(error.message)

    } finally {
        previousBtn.disabled = false
        nextBtn.disabled = false

    }
}

async function selectSettlementHandler (ref, settlementName) {
    try {
        settlementRef = ref
        renderStreetSearch(settlementName)

        const wirehouseTypes = await searchWirehouseTypes()
        renderWarehouseTypes(wirehouseTypes)

        await searchWarehouseHandler()
        
    } catch (error) {
        showErrorMsg(error.message)

    }
}

async function searchStreetHandler(page = 1) {
    const previousBtn = document.getElementById("prev-btn")
    const nextBtn = document.getElementById("next-btn")

    try {
        previousBtn.disabled = true
        nextBtn.disabled = true

        page = page === 0? 1 : page

        const data = await searchStreet()

        lastSearchMode = searchStreetHandler

        const addresses = sliceToPages(data[0].Addresses, page, PAGE_LIMIT)

        if (addresses.length === 0){
            throw new Error("Вулицю не знайдено")
        }

        currentPage = page

        renderStreets(addresses)
        
    } catch (error) {
        showErrorMsg(error.message)

    } finally {
        previousBtn.disabled = false
        nextBtn.disabled = false

    }
}

async function searchWarehouseHandler(page = 1) {
    const previousBtn = document.getElementById("warehouse-prev-btn")
    const nextBtn = document.getElementById("warehouse-next-btn")

    try {
        previousBtn.disabled = true
        nextBtn.disabled = true

        page = page === 0? 1 : page

        const warehouses = await searchWarehouse(warehouseTypeRef, page)

        currentWarehousePage = page

        renderWarehouses(warehouses)

    } catch (error) {
        showErrorMsg(error.message)

    } finally {
        previousBtn.disabled = false
        nextBtn.disabled = false

    }
}

const changeWarehouseRef = () => {
    warehouseTypeRef = document.getElementById("warehouse-type").value
    searchWarehouseHandler()
}


//===========================================
//  PARSERS
//===========================================
const sliceToPages = (array, page, limit) => {
    const end = page * limit
    const start = end - limit
    
    return array.slice(start, end)
}


//===========================================
//  UI
//===========================================
const showErrorMsg = errorMessage => {
    alert(errorMessage)
}

const renderSettlements = settlements => {
    document.getElementById("page-number").textContent = ` Сторінка: ${currentPage} `

    const searchZone = document.getElementById("search-zone")
    searchZone.style.display = "block"

    const container = document.getElementById("result-container")
    container.innerHTML = ``

    for (const settlement of settlements) {
        const settlementElement = document.createElement("div")
        settlementElement.onclick = () => selectSettlementHandler(settlement.Ref, settlement.Description)
        settlementElement.className = "result-item"

        settlementElement.innerHTML = `
            <p>
                <strong>${settlement.SettlementTypeDescription} ${settlement.Description}, 
                ${settlement.AreaDescription} обл., ${settlement.RegionsDescription} р-н</strong>
            </p>
            <p>
                <strong>Індекс:</strong> ${settlement.Index1} 
                <strong>Широта:</strong> ${settlement.Latitude} 
                <strong>Довгота:</strong> ${settlement.Longitude}
            </p>
        `

        container.appendChild(settlementElement)
    }
}

const renderStreetSearch = settlementName => {
    document.getElementById("settlement-name").textContent = settlementName

    const streetSearch = document.getElementById("street-search")
    streetSearch.style.display = "block"
}

const renderStreets = addresses => {
    document.getElementById("page-number").textContent = ` Сторінка: ${currentPage} `

    const container = document.getElementById("result-container")
    container.innerHTML = ``

    for (const address of addresses) {
        const streetElement = document.createElement("div")
        streetElement.className = "result-item"

        streetElement.innerHTML = `
            <p>
                <strong>${address.Present}</strong>
            </p>
        `

        container.appendChild(streetElement)
    }
}

const renderWarehouseTypes = warehouseTypes => {
    const select = document.getElementById("warehouse-type")
    select.innerHTML = `<option value="">--усі відділення--</option>`

    for (const warehouseType of warehouseTypes) {
        const option = document.createElement("option")
        option.value = warehouseType.Ref
        option.textContent = warehouseType.Description
        select.appendChild(option)
    }

    document.getElementById("main").style.width = "70%"
    document.getElementById("warehouses-window").style.display = "block"
}

const renderWarehouses = warehouses => {
    document.getElementById("warehouse-page-number").textContent = ` Сторінка: ${currentWarehousePage} `

    const container = document.getElementById("warehouse-result")
    container.innerHTML = ``

    for (const warehouse of warehouses) {
        const warehouseElement = document.createElement("div")
        warehouseElement.className = "warehouse-item"

        warehouseElement.innerHTML = `
            <p><strong>${warehouse.Description}</strong></p>
            <p><strong>Години роботи</strong></p>
            <p>пн-пт ${warehouse.Schedule.Monday || "інформація відсутня"}</p>
            <p>сб ${warehouse.Schedule.Saturday || "інформація відсутня"}</p>
            <p>нд ${warehouse.Schedule.Sunday || "інформація відсутня"}</p>
        `

        container.appendChild(warehouseElement)
    }

    document.getElementById("warehouse-search").style.display = "block"
}