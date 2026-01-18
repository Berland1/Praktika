// ==================== FIREBASE КОНФИГУРАЦИЯ ====================
const firebaseConfig = {
    apiKey: "AIzaSyCqy8adRVCrCKouel1IWV8k5xMZSFnNfJA",
    authDomain: "vetclinic-berland.firebaseapp.com",
    projectId: "vetclinic-berland",
    storageBucket: "vetclinic-berland.firebasestorage.app",
    messagingSenderId: "638162869915",
    appId: "1:638162869915:web:18683343e2267cc087303e"
};

// Инициализация Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase инициализирован");
} catch (error) {
    console.error("Ошибка инициализации Firebase:", error);
}

const db = firebase.firestore();

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let data = {
    owners: [],
    animals: [],
    vets: [],
    appointments: []
};

// ==================== СЛУШАТЕЛИ ИЗМЕНЕНИЙ В БАЗЕ ====================
function setupListeners() {
    // Слушаем изменения владельцев
    db.collection('owners').onSnapshot(snapshot => {
        data.owners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderOwners();
        updateSelects();
        console.log('Владельцы обновлены:', data.owners.length);
    });

    // Слушаем изменения животных
    db.collection('animals').onSnapshot(snapshot => {
        data.animals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderAnimals();
        updateSelects();
        console.log('Животные обновлены:', data.animals.length);
    });

    // Слушаем изменения ветеринаров
    db.collection('vets').onSnapshot(snapshot => {
        data.vets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderVets();
        updateSelects();
        console.log('Ветеринары обновлены:', data.vets.length);
    });

    // Слушаем изменения записей
    db.collection('appointments').onSnapshot(snapshot => {
        data.appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderAppointments();
        console.log('Записи обновлены:', data.appointments.length);
    });
}

// ==================== ОБНОВЛЕНИЕ ВЫПАДАЮЩИХ СПИСКОВ ====================
function updateSelects() {
    // Владельцы
    const ownerSelect = document.getElementById('animalOwner');
    const searchOwnerSelect = document.getElementById('searchOwner');
    if (ownerSelect && searchOwnerSelect) {
        ownerSelect.innerHTML = '<option value="">Выберите владельца</option>';
        searchOwnerSelect.innerHTML = '<option value="">Выберите владельца</option>';
        data.owners.forEach(owner => {
            ownerSelect.innerHTML += `<option value="${owner.id}">${owner.name}</option>`;
            searchOwnerSelect.innerHTML += `<option value="${owner.id}">${owner.name}</option>`;
        });
    }

    // Животные
    const animalSelect = document.getElementById('appointmentAnimal');
    if (animalSelect) {
        animalSelect.innerHTML = '<option value="">Выберите животное</option>';
        data.animals.forEach(animal => {
            const owner = data.owners.find(o => o.id === animal.ownerId);
            animalSelect.innerHTML += `<option value="${animal.id}">${animal.name} (${owner ? owner.name : 'неизвестно'})</option>`;
        });
    }

    // Ветеринары
    const vetSelect = document.getElementById('appointmentVet');
    if (vetSelect) {
        vetSelect.innerHTML = '<option value="">Выберите ветеринара</option>';
        data.vets.forEach(vet => {
            vetSelect.innerHTML += `<option value="${vet.id}">${vet.name}</option>`;
        });
    }
}

// ==================== ВЛАДЕЛЬЦЫ ====================
async function addOwner() {
    const name = document.getElementById('ownerName').value.trim();
    const phone = document.getElementById('ownerPhone').value.trim();

    if (!name) {
        alert('Введите имя владельца');
        return;
    }

    try {
        await db.collection('owners').add({
            name: name,
            phone: phone,
            createdAt: new Date().toISOString()
        });

        document.getElementById('ownerName').value = '';
        document.getElementById('ownerPhone').value = '';
        console.log('Владелец добавлен');
    } catch (error) {
        console.error('Ошибка добавления владельца:', error);
        alert('Ошибка добавления владельца');
    }
}

async function deleteOwner(id) {
    if (!confirm('Удалить владельца?')) return;

    try {
        // Удаляем владельца
        await db.collection('owners').doc(id).delete();

        // Удаляем всех его животных
        const animalsToDelete = data.animals.filter(a => a.ownerId === id);
        for (const animal of animalsToDelete) {
            await db.collection('animals').doc(animal.id).delete();
        }

        console.log('Владелец и его животные удалены');
    } catch (error) {
        console.error('Ошибка удаления владельца:', error);
        alert('Ошибка удаления владельца');
    }
}

function renderOwners() {
    const tbody = document.getElementById('ownersTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.owners.forEach(owner => {
        const row = `<tr>
            <td>${owner.id.substring(0, 8)}...</td>
            <td>${owner.name}</td>
            <td>${owner.phone || ''}</td>
            <td>
                <button class="delete" onclick="deleteOwner('${owner.id}')">Удалить</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// ==================== ЖИВОТНЫЕ ====================
async function addAnimal() {
    const ownerId = document.getElementById('animalOwner').value;
    const name = document.getElementById('animalName').value.trim();
    const type = document.getElementById('animalType').value.trim();

    if (!ownerId || !name) {
        alert('Выберите владельца и введите кличку');
        return;
    }

    try {
        await db.collection('animals').add({
            name: name,
            type: type,
            ownerId: ownerId,
            createdAt: new Date().toISOString()
        });

        document.getElementById('animalName').value = '';
        document.getElementById('animalType').value = '';
        console.log('Животное добавлено');
    } catch (error) {
        console.error('Ошибка добавления животного:', error);
        alert('Ошибка добавления животного');
    }
}

async function deleteAnimal(id) {
    if (!confirm('Удалить животное?')) return;

    try {
        await db.collection('animals').doc(id).delete();
        console.log('Животное удалено');
    } catch (error) {
        console.error('Ошибка удаления животного:', error);
        alert('Ошибка удаления животного');
    }
}

function renderAnimals() {
    const tbody = document.getElementById('animalsTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.animals.forEach(animal => {
        const owner = data.owners.find(o => o.id === animal.ownerId);
        const row = `<tr>
            <td>${animal.id.substring(0, 8)}...</td>
            <td>${animal.name}</td>
            <td>${animal.type || ''}</td>
            <td>${owner ? owner.name : 'неизвестно'}</td>
            <td>
                <button class="delete" onclick="deleteAnimal('${animal.id}')">Удалить</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// ==================== ВЕТЕРИНАРЫ ====================
async function addVet() {
    const name = document.getElementById('vetName').value.trim();
    const specialty = document.getElementById('vetSpecialty').value.trim();

    if (!name) {
        alert('Введите имя ветеринара');
        return;
    }

    try {
        await db.collection('vets').add({
            name: name,
            specialty: specialty,
            createdAt: new Date().toISOString()
        });

        document.getElementById('vetName').value = '';
        document.getElementById('vetSpecialty').value = '';
        console.log('Ветеринар добавлен');
    } catch (error) {
        console.error('Ошибка добавления ветеринара:', error);
        alert('Ошибка добавления ветеринара');
    }
}

async function deleteVet(id) {
    if (!confirm('Удалить ветеринара?')) return;

    try {
        await db.collection('vets').doc(id).delete();
        console.log('Ветеринар удален');
    } catch (error) {
        console.error('Ошибка удаления ветеринара:', error);
        alert('Ошибка удаления ветеринара');
    }
}

function renderVets() {
    const tbody = document.getElementById('vetsTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.vets.forEach(vet => {
        const row = `<tr>
            <td>${vet.id.substring(0, 8)}...</td>
            <td>${vet.name}</td>
            <td>${vet.specialty || ''}</td>
            <td>
                <button class="delete" onclick="deleteVet('${vet.id}')">Удалить</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// ==================== ЗАПИСИ НА ПРИЁМ ====================
async function addAppointment() {
    const animalId = document.getElementById('appointmentAnimal').value;
    const vetId = document.getElementById('appointmentVet').value;
    const date = document.getElementById('appointmentDate').value;

    if (!animalId || !vetId || !date) {
        alert('Заполните все поля');
        return;
    }

    try {
        await db.collection('appointments').add({
            animalId: animalId,
            vetId: vetId,
            date: date,
            createdAt: new Date().toISOString()
        });

        document.getElementById('appointmentDate').value = '';
        console.log('Запись добавлена');
    } catch (error) {
        console.error('Ошибка добавления записи:', error);
        alert('Ошибка добавления записи');
    }
}

async function deleteAppointment(id) {
    if (!confirm('Удалить запись?')) return;

    try {
        await db.collection('appointments').doc(id).delete();
        console.log('Запись удалена');
    } catch (error) {
        console.error('Ошибка удаления записи:', error);
        alert('Ошибка удаления записи');
    }
}

function renderAppointments() {
    const tbody = document.getElementById('appointmentsTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.appointments.forEach(app => {
        const animal = data.animals.find(a => a.id === app.animalId);
        const vet = data.vets.find(v => v.id === app.vetId);
        const owner = animal ? data.owners.find(o => o.id === animal.ownerId) : null;

        const row = `<tr>
            <td>${app.id.substring(0, 8)}...</td>
            <td>${new Date(app.date).toLocaleString()}</td>
            <td>${animal ? animal.name : 'неизвестно'}</td>
            <td>${vet ? vet.name : 'неизвестно'}</td>
            <td>${owner ? owner.name : 'неизвестно'}</td>
            <td>
                <button class="delete" onclick="deleteAppointment('${app.id}')">Удалить</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// ==================== ПОИСК ПОСЕЩЕНИЙ ====================
function showVisitsByOwner() {
    const ownerId = document.getElementById('searchOwner').value;
    if (!ownerId) {
        alert('Выберите владельца');
        return;
    }

    const owner = data.owners.find(o => o.id === ownerId);
    if (!owner) return;

    // Находим животных владельца
    const ownerAnimals = data.animals.filter(a => a.ownerId === ownerId);
    const animalIds = ownerAnimals.map(a => a.id);

    // Находим записи для этих животных
    const visits = data.appointments.filter(app => animalIds.includes(app.animalId));

    let html = `<h3>Посещения ${owner.name}:</h3>`;

    if (visits.length === 0) {
        html += '<p>Нет записей на приём</p>';
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
    const statusEl = document.getElementById('firebaseStatus');

    // Проверяем подключение
    db.collection('owners').get()
        .then(() => {
            statusEl.textContent = '✓ Подключено к базе данных Firebase';
            statusEl.className = 'status connected';
            console.log('Firebase подключен успешно');

            // Настраиваем слушатели
            setupListeners();

            // Первоначальная загрузка данных
            updateSelects();
        })
        .catch(error => {
            statusEl.textContent = '✗ Ошибка подключения к Firebase: ' + error.message;
            statusEl.className = 'status error';
            console.error('Ошибка подключения Firebase:', error);
        });
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', init);
