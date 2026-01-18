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
    alert("Ошибка подключения к базе данных. Проверь консоль.");
}

const db = firebase.firestore();

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let data = {
    owners: [],
    animals: [],
    vets: [],
    appointments: []
};

// ==================== СТАТУС ПОДКЛЮЧЕНИЯ ====================
function updateStatus(message, isError = false) {
    const statusEl = document.getElementById('firebaseStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = isError ? 'status error' : 'status connected';
    }
    console.log(isError ? '❌ ' : '✅ ', message);
}

// ==================== ПРОВЕРКА ПОДКЛЮЧЕНИЯ ====================
async function checkConnection() {
    try {
        updateStatus("Проверка подключения к Firebase...");

        // Пробуем прочитать что-то из базы
        const testQuery = await db.collection('owners').limit(1).get();

        updateStatus("Подключено к Firebase. База данных готова.");
        return true;
    } catch (error) {
        console.error("Ошибка подключения:", error);
        updateStatus(`Ошибка подключения: ${error.message}`, true);
        return false;
    }
}

// ==================== СЛУШАТЕЛИ ИЗМЕНЕНИЙ В БАЗЕ ====================
function setupListeners() {
    // Владельцы
    db.collection('owners').onSnapshot(snapshot => {
        data.owners = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderOwners();
        updateSelects();
        console.log(`Владельцы: ${data.owners.length} записей`);
    }, error => {
        console.error("Ошибка слушателя владельцев:", error);
    });

    // Животные
    db.collection('animals').onSnapshot(snapshot => {
        data.animals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderAnimals();
        updateSelects();
        console.log(`Животные: ${data.animals.length} записей`);
    }, error => {
        console.error("Ошибка слушателя животных:", error);
    });

    // Ветеринары
    db.collection('vets').onSnapshot(snapshot => {
        data.vets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderVets();
        updateSelects();
        console.log(`Ветеринары: ${data.vets.length} записей`);
    }, error => {
        console.error("Ошибка слушателя ветеринаров:", error);
    });

    // Записи
    db.collection('appointments').onSnapshot(snapshot => {
        data.appointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderAppointments();
        console.log(`Записи: ${data.appointments.length} записей`);
    }, error => {
        console.error("Ошибка слушателя записей:", error);
    });
}

// ==================== ОБНОВЛЕНИЕ ВЫПАДАЮЩИХ СПИСКОВ ====================
function updateSelects() {
    // Владельцы для животных
    const ownerSelect = document.getElementById('animalOwner');
    const searchOwnerSelect = document.getElementById('searchOwner');

    if (ownerSelect) {
        ownerSelect.innerHTML = '<option value="">Выберите владельца</option>';
        data.owners.forEach(owner => {
            ownerSelect.innerHTML += `<option value="${owner.id}">${owner.name}</option>`;
        });
    }

    if (searchOwnerSelect) {
        searchOwnerSelect.innerHTML = '<option value="">Выберите владельца</option>';
        data.owners.forEach(owner => {
            searchOwnerSelect.innerHTML += `<option value="${owner.id}">${owner.name}</option>`;
        });
    }

    // Животные для записей
    const animalSelect = document.getElementById('appointmentAnimal');
    if (animalSelect) {
        animalSelect.innerHTML = '<option value="">Выберите животное</option>';
        data.animals.forEach(animal => {
            const owner = data.owners.find(o => o.id === animal.ownerId);
            animalSelect.innerHTML += `<option value="${animal.id}">${animal.name} (${owner ? owner.name : 'неизвестно'})</option>`;
        });
    }

    // Ветеринары для записей
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
        console.log("Добавляем владельца:", name);

        await db.collection('owners').add({
            name: name,
            phone: phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Очищаем поля
        document.getElementById('ownerName').value = '';
        document.getElementById('ownerPhone').value = '';

        console.log("Владелец добавлен");
    } catch (error) {
        console.error("Ошибка добавления владельца:", error);
        alert('Ошибка добавления владельца: ' + error.message);
    }
}

async function deleteOwner(id) {
    if (!confirm('Удалить владельца и всех его животных?')) return;

    try {
        // Удаляем владельца
        await db.collection('owners').doc(id).delete();
        console.log("Владелец удален");
    } catch (error) {
        console.error("Ошибка удаления владельца:", error);
        alert('Ошибка удаления владельца: ' + error.message);
    }
}

function renderOwners() {
    const tbody = document.getElementById('ownersTable');
    if (!tbody) return;

    tbody.innerHTML = '';

    data.owners.forEach(owner => {
        const shortId = owner.id.substring(0, 6) + '...';
        const row = `<tr>
            <td>${shortId}</td>
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
        alert('Выберите владельца и введите кличку животного');
        return;
    }

    try {
        await db.collection('animals').add({
            name: name,
            type: type,
            ownerId: ownerId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('animalName').value = '';
        document.getElementById('animalType').value = '';
        console.log("Животное добавлено");
    } catch (error) {
        console.error("Ошибка добавления животного:", error);
        alert('Ошибка добавления животного: ' + error.message);
    }
}

async function deleteAnimal(id) {
    if (!confirm('Удалить животное?')) return;

    try {
        await db.collection('animals').doc(id).delete();
        console.log("Животное удалено");
    } catch (error) {
        console.error("Ошибка удаления животного:", error);
        alert('Ошибка удаления животного: ' + error.message);
    }
}

function renderAnimals() {
    const tbody = document.getElementById('animalsTable');
    if (!tbody) return;

    tbody.innerHTML = '';

    data.animals.forEach(animal => {
        const owner = data.owners.find(o => o.id === animal.ownerId);
        const shortId = animal.id.substring(0, 6) + '...';

        const row = `<tr>
            <td>${shortId}</td>
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
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('vetName').value = '';
        document.getElementById('vetSpecialty').value = '';
        console.log("Ветеринар добавлен");
    } catch (error) {
        console.error("Ошибка добавления ветеринара:", error);
        alert('Ошибка добавления ветеринара: ' + error.message);
    }
}

async function deleteVet(id) {
    if (!confirm('Удалить ветеринара?')) return;

    try {
        await db.collection('vets').doc(id).delete();
        console.log("Ветеринар удален");
    } catch (error) {
        console.error("Ошибка удаления ветеринара:", error);
        alert('Ошибка удаления ветеринара: ' + error.message);
    }
}

function renderVets() {
    const tbody = document.getElementById('vetsTable');
    if (!tbody) return;

    tbody.innerHTML = '';

    data.vets.forEach(vet => {
        const shortId = vet.id.substring(0, 6) + '...';
        const row = `<tr>
            <td>${shortId}</td>
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
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('appointmentDate').value = '';
        console.log("Запись добавлена");
    } catch (error) {
        console.error("Ошибка добавления записи:", error);
        alert('Ошибка добавления записи: ' + error.message);
    }
}

async function deleteAppointment(id) {
    if (!confirm('Удалить запись?')) return;

    try {
        await db.collection('appointments').doc(id).delete();
        console.log("Запись удалена");
    } catch (error) {
        console.error("Ошибка удаления записи:", error);
        alert('Ошибка удаления записи: ' + error.message);
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
        const shortId = app.id.substring(0, 6) + '...';

        const row = `<tr>
            <td>${shortId}</td>
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

    const ownerAnimals = data.animals.filter(a => a.ownerId === ownerId);
    const animalIds = ownerAnimals.map(a => a.id);
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
async function init() {
    console.log("Инициализация приложения...");

    // Проверяем подключение
    const connected = await checkConnection();

    if (connected) {
        // Настраиваем слушатели
        setupListeners();

        // Обновляем списки
        updateSelects();

        console.log("Приложение готово к работе");
    } else {
        console.error("Не удалось подключиться к Firebase");
        alert("Не удалось подключиться к базе данных. Проверь консоль браузера.");
    }
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', init);
