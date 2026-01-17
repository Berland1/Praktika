// ==================== ХРАНИЛИЩЕ (LocalStorage) ====================
let data = {
    owners: JSON.parse(localStorage.getItem('vet_owners')) || [],
    animals: JSON.parse(localStorage.getItem('vet_animals')) || [],
    vets: JSON.parse(localStorage.getItem('vet_vets')) || [],
    appointments: JSON.parse(localStorage.getItem('vet_appointments')) || []
};

function saveData() {
    localStorage.setItem('vet_owners', JSON.stringify(data.owners));
    localStorage.setItem('vet_animals', JSON.stringify(data.animals));
    localStorage.setItem('vet_vets', JSON.stringify(data.vets));
    localStorage.setItem('vet_appointments', JSON.stringify(data.appointments));
}

function getNextId(arr) {
    return arr.length > 0 ? Math.max(...arr.map(item => item.id)) + 1 : 1;
}

function updateSelects() {
    // Владельцы
    const ownerSelect = document.getElementById('animalOwner');
    const searchOwnerSelect = document.getElementById('searchOwner');
    ownerSelect.innerHTML = '<option value="">Выберите владельца</option>';
    searchOwnerSelect.innerHTML = '<option value="">Выберите владельца</option>';
    data.owners.forEach(owner => {
        ownerSelect.innerHTML += `<option value="${owner.id}">${owner.name}</option>`;
        searchOwnerSelect.innerHTML += `<option value="${owner.id}">${owner.name}</option>`;
    });

    // Животные
    const animalSelect = document.getElementById('appointmentAnimal');
    animalSelect.innerHTML = '<option value="">Выберите животное</option>';
    data.animals.forEach(animal => {
        const owner = data.owners.find(o => o.id === animal.ownerId);
        animalSelect.innerHTML += `<option value="${animal.id}">${animal.name} (${owner ? owner.name : 'неизвестно'})</option>`;
    });

    // Ветеринары
    const vetSelect = document.getElementById('appointmentVet');
    vetSelect.innerHTML = '<option value="">Выберите ветеринара</option>';
    data.vets.forEach(vet => {
        vetSelect.innerHTML += `<option value="${vet.id}">${vet.name}</option>`;
    });
}

// ==================== ВЛАДЕЛЬЦЫ ====================
function addOwner() {
    const name = document.getElementById('ownerName').value.trim();
    const phone = document.getElementById('ownerPhone').value.trim();
    if (!name) return alert('Введите имя владельца');

    const newOwner = {
        id: getNextId(data.owners),
        name,
        phone
    };
    data.owners.push(newOwner);
    saveData();
    updateSelects();
    renderOwners();
    document.getElementById('ownerName').value = '';
    document.getElementById('ownerPhone').value = '';
}

function deleteOwner(id) {
    if (!confirm('Удалить владельца и всех его животных?')) return;
    data.owners = data.owners.filter(o => o.id !== id);
    data.animals = data.animals.filter(a => a.ownerId !== id);
    saveData();
    updateSelects();
    renderOwners();
    renderAnimals();
}

function renderOwners() {
    const tbody = document.querySelector('#ownersTable tbody');
    tbody.innerHTML = '';
    data.owners.forEach(owner => {
        const row = `<tr>
            <td>${owner.id}</td>
            <td>${owner.name}</td>
            <td>${owner.phone}</td>
            <td>
                <button onclick="deleteOwner(${owner.id})">Удалить</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// ==================== ЖИВОТНЫЕ ====================
function addAnimal() {
    const ownerId = parseInt(document.getElementById('animalOwner').value);
    const name = document.getElementById('animalName').value.trim();
    const type = document.getElementById('animalType').value.trim();
    if (!ownerId || !name) return alert('Заполните все поля');

    const newAnimal = {
        id: getNextId(data.animals),
        name,
        type,
        ownerId
    };
    data.animals.push(newAnimal);
    saveData();
    updateSelects();
    renderAnimals();
    document.getElementById('animalName').value = '';
    document.getElementById('animalType').value = '';
}

function deleteAnimal(id) {
    if (!confirm('Удалить животное?')) return;
    data.animals = data.animals.filter(a => a.id !== id);
    saveData();
    renderAnimals();
}

function renderAnimals() {
    const tbody = document.querySelector('#animalsTable tbody');
    tbody.innerHTML = '';
    data.animals.forEach(animal => {
        const owner = data.owners.find(o => o.id === animal.ownerId);
        const row = `<tr>
            <td>${animal.id}</td>
            <td>${animal.name}</td>
            <td>${animal.type}</td>
            <td>${owner ? owner.name : 'неизвестно'}</td>
            <td>
                <button onclick="deleteAnimal(${animal.id})">Удалить</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// ==================== ВЕТЕРИНАРЫ ====================
function addVet() {
    const name = document.getElementById('vetName').value.trim();
    const specialty = document.getElementById('vetSpecialty').value.trim();
    if (!name) return alert('Введите имя ветеринара');

    const newVet = {
        id: getNextId(data.vets),
        name,
        specialty
    };
    data.vets.push(newVet);
    saveData();
    updateSelects();
    renderVets();
    document.getElementById('vetName').value = '';
    document.getElementById('vetSpecialty').value = '';
}

function deleteVet(id) {
    if (!confirm('Удалить ветеринара?')) return;
    data.vets = data.vets.filter(v => v.id !== id);
    saveData();
    renderVets();
}

function renderVets() {
    const tbody = document.querySelector('#vetsTable tbody');
    tbody.innerHTML = '';
    data.vets.forEach(vet => {
        const row = `<tr>
            <td>${vet.id}</td>
            <td>${vet.name}</td>
            <td>${vet.specialty}</td>
            <td>
                <button onclick="deleteVet(${vet.id})">Удалить</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// ==================== ЗАПИСИ НА ПРИЁМ ====================
function addAppointment() {
    const animalId = parseInt(document.getElementById('appointmentAnimal').value);
    const vetId = parseInt(document.getElementById('appointmentVet').value);
    const date = document.getElementById('appointmentDate').value;
    if (!animalId || !vetId || !date) return alert('Заполните все поля');

    const newApp = {
        id: getNextId(data.appointments),
        animalId,
        vetId,
        date
    };
    data.appointments.push(newApp);
    saveData();
    renderAppointments();
    document.getElementById('appointmentDate').value = '';
}

function deleteAppointment(id) {
    if (!confirm('Удалить запись?')) return;
    data.appointments = data.appointments.filter(a => a.id !== id);
    saveData();
    renderAppointments();
}

function renderAppointments() {
    const tbody = document.querySelector('#appointmentsTable tbody');
    tbody.innerHTML = '';
    data.appointments.forEach(app => {
        const animal = data.animals.find(a => a.id === app.animalId);
        const vet = data.vets.find(v => v.id === app.vetId);
        const owner = animal ? data.owners.find(o => o.id === animal.ownerId) : null;
        const row = `<tr>
            <td>${app.id}</td>
            <td>${new Date(app.date).toLocaleString()}</td>
            <td>${animal ? animal.name : 'неизвестно'}</td>
            <td>${vet ? vet.name : 'неизвестно'}</td>
            <td>${owner ? owner.name : 'неизвестно'}</td>
            <td>
                <button onclick="deleteAppointment(${app.id})">Удалить</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// ==================== ПОИСК ПОСЕЩЕНИЙ ПО КЛИЕНТУ ====================
function showVisitsByOwner() {
    const ownerId = parseInt(document.getElementById('searchOwner').value);
    if (!ownerId) return alert('Выберите владельца');

    const owner = data.owners.find(o => o.id === ownerId);
    const ownerAnimals = data.animals.filter(a => a.ownerId === ownerId);
    const animalIds = ownerAnimals.map(a => a.id);
    const visits = data.appointments.filter(app => animalIds.includes(app.animalId));

    let html = `<h3>Посещения ${owner.name}:</h3>`;
    if (visits.length === 0) {
        html += '<p>Нет записей</p>';
    } else {
        html += '<ul>';
        visits.forEach(v => {
            const animal = data.animals.find(a => a.id === v.animalId);
            const vet = data.vets.find(vet => vet.id === v.vetId);
            html += `<li>${new Date(v.date).toLocaleString()} - ${animal ? animal.name : 'неизвестно'} у ветеринара ${vet ? vet.name : 'неизвестно'}</li>`;
        });
        html += '</ul>';
    }
    document.getElementById('visitsResult').innerHTML = html;
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
function init() {
    updateSelects();
    renderOwners();
    renderAnimals();
    renderVets();
    renderAppointments();
}

document.addEventListener('DOMContentLoaded', init);