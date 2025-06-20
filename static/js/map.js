
let map = L.map('map', {
    center: [51.8335, 107.5840], 
    zoom: 13,
    zoomControl: true
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);



const routesLayer = L.layerGroup().addTo(map);
const poisLayer = L.layerGroup().addTo(map);
const servicesLayer = L.layerGroup().addTo(map);
const searchResultsLayer = L.layerGroup().addTo(map);
const customRouteLayer = L.layerGroup().addTo(map); 
const userPoisLayer = L.layerGroup().addTo(map);

const toggleUserPoisBtn = document.getElementById('toggleUserPoisBtn');

toggleUserPoisBtn.addEventListener('click', function() {
    layersVisibility.userPois = !layersVisibility.userPois;
    this.classList.toggle('active', layersVisibility.userPois);
    updateLayersVisibility();
});

// Глобальные переменные для создания маршрута
let isCustomRouteMode = false; // Режим создания пользовательского маршрута
let customWaypoints = []; // Точки пользовательского маршрута

const poiIcon = L.divIcon({
    className: 'poi-icon',
    html: '<span class="fa-stack"><i class="fas fa-circle fa-stack-2x text-primary"></i><i class="fas fa-landmark fa-stack-1x fa-inverse"></i></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const userPoiIcon = L.divIcon({
    className: 'user-poi-icon',
    html: '<span class="fa-stack"><i class="fas fa-circle fa-stack-2x" style="color: #ffd700;"></i><i class="fas fa-star fa-stack-1x" style="color: #333;"></i></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

function createServiceIcon(category) {
    let iconClass;
    let iconColor;
    
    switch(category) {
        case 'hotel':
            iconClass = 'fa-hotel';
            iconColor = '#3366cc';
            break;
        case 'restaurant':
            iconClass = 'fa-utensils';
            iconColor = '#dc3545';
            break;
        case 'pharmacy':
            iconClass = 'fa-prescription-bottle-alt';
            iconColor = '#28a745';
            break;
        case 'shop':
            iconClass = 'fa-shopping-cart';
            iconColor = '#fd7e14';
            break;
        case 'sport':
            iconClass = 'fa-running';
            iconColor = '#6f42c1';
            break;
        case 'beauty':
            iconClass = 'fa-spa';
            iconColor = '#e83e8c';
            break;
        case 'auto':
            iconClass = 'fa-car';
            iconColor = '#17a2b8';
            break;
        case 'post':
            iconClass = 'fa-envelope';
            iconColor = '#6c757d';
            break;
        case 'shopping':
            iconClass = 'fa-shopping-bag';
            iconColor = '#20c997';
            break;
        default:
            iconClass = 'fa-map-marker-alt';
            iconColor = '#007bff';
    }
    
    return L.divIcon({
        className: 'service-icon',
        html: `<div style="background-color: ${iconColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;">
                <i class="fas ${iconClass}"></i>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
}

function drawRoute(route) {
    
    routesLayer.clearLayers();
    
    if (!route || !route.waypoints || route.waypoints.length < 2) {
        console.error('Invalid route data');
        return;
    }
    
    // Если есть активный маршрутизатор для готовых маршрутов, удалить его
    if (predefinedRouteControl) {
        map.removeControl(predefinedRouteControl);
        predefinedRouteControl = null;
    }
    
    // Создаем точки для маршрутизатора
    const routeWaypoints = route.waypoints.map(wp => L.latLng(wp.lat, wp.lng));
    
    // Создаем маршрутизатор для дорожного маршрута
    predefinedRouteControl = L.Routing.control({
        waypoints: routeWaypoints,
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false, // Не показывать панель инструкций
        lineOptions: {
            styles: [
                {color: '#e74c3c', opacity: 0.8, weight: 6},
                {color: 'white', opacity: 0.3, weight: 4}
            ]
        },
        createMarker: function(i, wp, nWps) {
            const isStart = i === 0;
            const isEnd = i === nWps - 1;
            
            let waypointIcon;
            
            if (isStart) {
                waypointIcon = L.divIcon({
                    className: 'waypoint-icon',
                    html: '<div class="start-marker" style="color: #e74c3c;"><i class="fas fa-play-circle"></i></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
            } else if (isEnd) {
                waypointIcon = L.divIcon({
                    className: 'waypoint-icon',
                    html: '<div class="end-marker" style="color: #e74c3c;"><i class="fas fa-flag-checkered"></i></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
            } else {
                waypointIcon = L.divIcon({
                    className: 'waypoint-icon',
                    html: `<div class="waypoint-number" style="background-color: #e74c3c; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 12px;">${i + 1}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
            }
            
            const marker = L.marker(wp.latLng, { icon: waypointIcon })
                .bindPopup(`<div class="popup-title">${route.waypoints[i].name || `Точка ${i + 1}`}</div>`);
            
            return marker;
        }
    }).addTo(map);
    
    // Обновление информации о маршруте в боковой панели
    predefinedRouteControl.on('routesfound', function(e) {
        if (e.routes && e.routes.length > 0) {
            const routeData = e.routes[0];
            
            // Обновить дистанцию и время в UI
            const distanceElement = document.querySelector('#routeDistance .value');
            const durationElement = document.querySelector('#routeDuration .value');
            
            if (distanceElement && durationElement) {
                const distanceKm = (routeData.summary.totalDistance / 1000).toFixed(1);
                const durationMin = Math.round(routeData.summary.totalTime / 60);
                
                distanceElement.textContent = `${distanceKm} км`;
                durationElement.textContent = `${durationMin} мин`;
            }
        }
    });
}

function showPointsOfInterest() {
    
    poisLayer.clearLayers();
    
    
    fetch('/api/pois')
        .then(response => response.json())
        .then(pois => {
            
            pois.forEach(poi => {
                const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon })
                    .bindPopup(`
                        <div class="popup-title">${poi.name}</div>
                        <div class="popup-category">${getCategoryName(poi.category)}</div>
                        ${poi.description ? `<div class="popup-description">${poi.description}</div>` : ''}
                    `)
                    .addTo(poisLayer);
            });
            
            
            if (routesLayer.getLayers().length === 0) {
                const bounds = L.latLngBounds(pois.map(poi => [poi.lat, poi.lng]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        })
        .catch(error => console.error('Error fetching POIs:', error));
}

function showServicesByCategory(category) {
    servicesLayer.clearLayers();
    
    let url = '/api/services';
    if (category && category !== 'all') {
        url += `?category=${category}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(services => {
            services.forEach(service => {
                const serviceIcon = createServiceIcon(service.category);
                const marker = L.marker([service.lat, service.lng], { icon: serviceIcon })
                    .bindPopup(`
                        <div class="popup-title">${service.name}</div>
                        <div class="popup-category">${getCategoryName(service.category)}</div>
                        ${service.description ? `<div class="popup-description">${service.description}</div>` : ''}
                        ${service.address ? `<div class="popup-address"><i class="fas fa-map-marker-alt"></i> ${service.address}</div>` : ''}
                        ${service.phone ? `<div class="popup-phone"><i class="fas fa-phone"></i> ${service.phone}</div>` : ''}
                        ${service.working_hours ? `<div class="popup-hours"><i class="far fa-clock"></i> ${service.working_hours}</div>` : ''}
                    `)
                    .addTo(servicesLayer);
            });
            
            if (routesLayer.getLayers().length === 0 && services.length > 0) {
                const bounds = L.latLngBounds(services.map(service => [service.lat, service.lng]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        })
        .catch(error => console.error('Error fetching services:', error));
}

function getCategoryName(categoryId) {
    const categories = {
        'historical': 'Исторический',
        'natural': 'Природный',
        'cultural': 'Культурный',
        'sport': 'Спортивный',
        'leisure': 'Развлекательный',
        'shopping': 'Торговый',
        'industrial': 'Промышленный',
        'hotel': 'Гостиница',
        'restaurant': 'Ресторан',
        'pharmacy': 'Аптека',
        'shop': 'Магазин',
        'beauty': 'Салон красоты',
        'auto': 'Автосервис',
        'post': 'Почта'
    };
    
    return categories[categoryId] || categoryId;
}

function showSearchResults(results) {
    
    searchResultsLayer.clearLayers();
    
    if (!results || results.length === 0) {
        return;
    }
    
    
    results.forEach(result => {
        let resultIcon;
        
        if (result.type === 'poi') {
            resultIcon = poiIcon;
        } else if (result.type === 'service') {
            resultIcon = createServiceIcon(result.category);
        } else {
            resultIcon = L.divIcon({
                className: 'search-result-icon',
                html: '<i class="fas fa-search"></i>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
        }
        
        const marker = L.marker([result.lat, result.lng], { icon: resultIcon })
            .bindPopup(`
                <div class="popup-title">${result.name}</div>
                <div class="popup-category">${getCategoryName(result.category)}</div>
            `)
            .addTo(searchResultsLayer);
    });
    
   
    const bounds = L.latLngBounds(results.map(result => [result.lat, result.lng]));
    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Функции для работы с пользовательскими маршрутами

// Включение режима создания маршрута
function enableCustomRouteMode() {
    isCustomRouteMode = true;
    customWaypoints = [];
    customRouteLayer.clearLayers();
    
    // Очистить существующие точки маршрута в UI
    const waypointsList = document.getElementById('selectedWaypoints');
    waypointsList.innerHTML = '';
    
    // Обновить счетчики
    updateCustomRouteStats();
    
    // Загрузить доступные точки для выбора
    loadAttractions();
    
    // Добавить обработчик клика по карте
    map.on('click', onMapClick);
}

// Выключение режима создания маршрута
function disableCustomRouteMode() {
    isCustomRouteMode = false;
    customRouteLayer.clearLayers();
    
    // Удалить обработчик клика по карте
    map.off('click', onMapClick);
}

// Обработчик клика по карте для добавления точки в маршрут
function onMapClick(e) {
    if (!isCustomRouteMode) return;
    
    const latlng = e.latlng;
    
    // Создать новую точку маршрута
    const waypoint = {
        lat: latlng.lat,
        lng: latlng.lng,
        name: `Точка ${customWaypoints.length + 1}`,
        custom: true
    };
    
    // Добавить точку в массив
    addWaypointToCustomRoute(waypoint);
}

// Добавление точки в пользовательский маршрут
function addWaypointToCustomRoute(waypoint) {
    // Добавить точку в массив
    customWaypoints.push(waypoint);
    
    // Добавить точку на карту
    drawCustomRoute();
    
    // Добавить точку в UI
    addWaypointToUI(waypoint, customWaypoints.length - 1);
    
    // Обновить счетчики расстояния и времени
    updateCustomRouteStats();
}

// Удаление точки из пользовательского маршрута
function removeWaypointFromCustomRoute(index) {
    if (index < 0 || index >= customWaypoints.length) return;
    
    // Удалить точку из массива
    customWaypoints.splice(index, 1);
    
    // Перерисовать маршрут
    drawCustomRoute();
    
    // Обновить весь UI маршрута
    updateCustomRouteUI();
}

// Перерисовка всего UI маршрута
function updateCustomRouteUI() {
    // Очистить существующие точки маршрута в UI
    const waypointsList = document.getElementById('selectedWaypoints');
    waypointsList.innerHTML = '';
    
    // Добавить все точки
    customWaypoints.forEach((waypoint, index) => {
        addWaypointToUI(waypoint, index);
    });
    
    // Обновить счетчики
    updateCustomRouteStats();
}

// Добавление точки в UI
function addWaypointToUI(waypoint, index) {
    const waypointsList = document.getElementById('selectedWaypoints');
    
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.innerHTML = `
        <span class="me-2">${index + 1}.</span>
        <span class="flex-grow-1">${waypoint.name}</span>
        <button class="btn btn-sm btn-outline-danger waypoint-remove" data-index="${index}">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    waypointsList.appendChild(listItem);
    
    // Добавить обработчик удаления
    const removeButton = listItem.querySelector('.waypoint-remove');
    removeButton.addEventListener('click', function() {
        const waypointIndex = parseInt(this.getAttribute('data-index'));
        removeWaypointFromCustomRoute(waypointIndex);
    });
}

// Переменные для хранения экземпляров маршрутизатора
let routingControl = null; // Для создаваемого маршрута
let predefinedRouteControl = null; // Для готового маршрута

// Переменные для управления видимостью слоев
let layersVisibility = {
    routes: true,
    pois: true,
    services: true,
    customRoutes: true,
    userPois: true
};

// Отрисовка пользовательского маршрута на карте
function drawCustomRoute() {
    // Очистить слой
    customRouteLayer.clearLayers();
    
    // Если есть активный маршрутизатор, удалить его
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    
    if (customWaypoints.length < 1) return;
    
    // Если только одна точка, просто добавить маркер
    if (customWaypoints.length === 1) {
        const waypoint = customWaypoints[0];
        const waypointIcon = L.divIcon({
            className: 'waypoint-icon',
            html: '<div class="start-marker" style="color: var(--primary-color);"><i class="fas fa-map-marker-alt"></i></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon })
            .bindPopup(`<div class="popup-title">${waypoint.name}</div>`)
            .addTo(customRouteLayer);
        
        return;
    }
    
    // Маршруты с более чем одной точкой обрабатываем через Routing Machine
    const routeWaypoints = customWaypoints.map(wp => L.latLng(wp.lat, wp.lng));
    
    // Создать маршрутизатор
    routingControl = L.Routing.control({
        waypoints: routeWaypoints,
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false,  // Не показывать панель инструкций
        lineOptions: {
            styles: [
                {color: 'var(--primary-color)', opacity: 0.8, weight: 6},
                {color: 'white', opacity: 0.3, weight: 4}
            ]
        },
        createMarker: function(i, wp, nWps) {
            const isStart = i === 0;
            const isEnd = i === nWps - 1;
            
            let waypointIcon;
            
            if (isStart) {
                waypointIcon = L.divIcon({
                    className: 'waypoint-icon',
                    html: '<div class="start-marker" style="color: var(--primary-color);"><i class="fas fa-play-circle"></i></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
            } else if (isEnd) {
                waypointIcon = L.divIcon({
                    className: 'waypoint-icon',
                    html: '<div class="end-marker" style="color: var(--primary-color);"><i class="fas fa-flag-checkered"></i></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
            } else {
                waypointIcon = L.divIcon({
                    className: 'waypoint-icon',
                    html: `<div class="waypoint-number" style="background-color: var(--primary-color); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 12px;">${i + 1}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
            }
            
            const marker = L.marker(wp.latLng, { icon: waypointIcon })
                .bindPopup(`<div class="popup-title">${customWaypoints[i].name}</div>`);
            
            return marker;
        }
    }).addTo(map);
    
    // Обновить статистику маршрута при расчете
    routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
            const route = routes[0];
            // Обновить расстояние и время в UI (будет вызвано из updateCustomRouteStats)
            // Сохраняем данные о маршруте
            window.currentRouteData = {
                distance: route.summary.totalDistance,
                duration: route.summary.totalTime
            };
            
            // И обновляем статистику
            updateCustomRouteStats();
        }
    });
}

// Обновление счетчиков расстояния и времени
function updateCustomRouteStats() {
    const distanceSpan = document.getElementById('customRouteDistance');
    const durationSpan = document.getElementById('customRouteDuration');
    
    if (customWaypoints.length < 2) {
        distanceSpan.textContent = 'Расстояние: 0 км';
        durationSpan.textContent = 'Время: 0 мин';
        return;
    }
    
    // Если есть данные от маршрутизатора, используем их
    if (window.currentRouteData) {
        // Преобразовать расстояние из метров в километры
        const distanceKm = (window.currentRouteData.distance / 1000).toFixed(1);
        
        // Время в минутах
        const durationMin = Math.round(window.currentRouteData.duration / 60);
        
        distanceSpan.textContent = `Расстояние: ${distanceKm} км`;
        durationSpan.textContent = `Время: ${durationMin} мин`;
        return;
    }
    
    // Запасной вариант - вычисление по прямым линиям (если маршрутизация недоступна)
    let totalDistance = 0;
    for (let i = 0; i < customWaypoints.length - 1; i++) {
        const start = L.latLng(customWaypoints[i].lat, customWaypoints[i].lng);
        const end = L.latLng(customWaypoints[i + 1].lat, customWaypoints[i + 1].lng);
        totalDistance += start.distanceTo(end);
    }
    
    // Преобразовать расстояние из метров в километры
    const distanceKm = (totalDistance / 1000).toFixed(1);
    
    // Приблизительное время в минутах (считаем скорость 4 км/ч)
    const durationMin = Math.round((totalDistance / 1000) * 15);
    
    distanceSpan.textContent = `Расстояние: ${distanceKm} км`;
    durationSpan.textContent = `Время: ${durationMin} мин`;
}

// Сохранение пользовательского маршрута
function saveCustomRoute() {
    if (customWaypoints.length < 2) {
        alert('Для создания маршрута необходимо добавить хотя бы 2 точки');
        return;
    }
    
    const nameInput = document.getElementById('routeNameInput');
    const descInput = document.getElementById('routeDescInput');
    const saveBtn = document.getElementById('saveRouteBtn');
    
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    
    if (!name) {
        alert('Пожалуйста, введите название маршрута');
        nameInput.focus();
        return;
    }
    
    // Показать индикатор загрузки
    const originalBtnText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Сохранение...';
    saveBtn.disabled = true;
    
    // Рассчитать расстояние и время
    let distanceKm, durationMin;
    
    // Если есть данные от маршрутизатора, используем их
    if (window.currentRouteData) {
        distanceKm = parseFloat((window.currentRouteData.distance / 1000).toFixed(1));
        durationMin = Math.round(window.currentRouteData.duration / 60);
    } else {
        // Запасной вариант - вычисление по прямым линиям
        let totalDistance = 0;
        for (let i = 0; i < customWaypoints.length - 1; i++) {
            const start = L.latLng(customWaypoints[i].lat, customWaypoints[i].lng);
            const end = L.latLng(customWaypoints[i + 1].lat, customWaypoints[i + 1].lng);
            totalDistance += start.distanceTo(end);
        }
        
        distanceKm = parseFloat((totalDistance / 1000).toFixed(1));
        durationMin = Math.round((totalDistance / 1000) * 15);
    }
    
    // Создать объект маршрута
    const route = {
        name: name,
        description: description,
        distance: distanceKm,
        duration: durationMin,
        waypoints: JSON.parse(JSON.stringify(customWaypoints)) // Глубокая копия
    };
    
    // Отправить на сервер
    fetch('/api/custom-routes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(route)
    })
    .then(response => response.json())
    .then(data => {
        // Сохранить в localStorage
        const savedRoutes = JSON.parse(localStorage.getItem('customRoutes') || '[]');
        savedRoutes.push(data);
        localStorage.setItem('customRoutes', JSON.stringify(savedRoutes));
        
        // Обновить список маршрутов
        loadCustomRoutes();
        
        // Очистить форму
        disableCustomRouteMode();
        
        // Скрыть форму создания маршрута
        document.getElementById('customRouteBuilder').classList.add('d-none');
        
        // Показать маршрут на карте
        drawCustomRouteById(data.id);
        
        // Уведомление об успешном сохранении
        showToast('Маршрут успешно сохранен!');
    })
    .catch(error => {
        console.error('Error saving route:', error);
        alert('Произошла ошибка при сохранении маршрута. Пожалуйста, попробуйте еще раз.');
    })
    .finally(() => {
        // Восстановить кнопку
        saveBtn.innerHTML = originalBtnText;
        saveBtn.disabled = false;
    });
}

// Функция для отображения уведомления
function showToast(message, type = 'success') {
    // Проверка на существование контейнера тостов
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Определение иконки и цвета в зависимости от типа уведомления
    let icon, iconColor;
    
    switch (type) {
        case 'success':
            icon = 'check-circle';
            iconColor = 'success';
            break;
        case 'info':
            icon = 'info-circle';
            iconColor = 'info';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            iconColor = 'warning';
            break;
        case 'error':
            icon = 'exclamation-circle';
            iconColor = 'danger';
            break;
        default:
            icon = 'bell';
            iconColor = 'primary';
    }
    
    // Создание нового тоста
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div class="toast" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="fas fa-${icon} text-${iconColor} me-2"></i>
                <strong class="me-auto">Уведомление</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
    bsToast.show();
    
    // Удаление тоста после скрытия
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Загрузка всех сохраненных пользовательских маршрутов
function loadCustomRoutes() {
    const customRoutesList = document.getElementById('customRoutesList');
    customRoutesList.innerHTML = '';
    
    // Загрузить маршруты из localStorage
    const savedRoutes = JSON.parse(localStorage.getItem('customRoutes') || '[]');
    
    if (savedRoutes.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'list-group-item text-center text-muted';
        emptyMessage.textContent = 'У вас пока нет сохраненных маршрутов';
        customRoutesList.appendChild(emptyMessage);
        return;
    }
    
    // Добавить каждый маршрут в список
    savedRoutes.forEach(route => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item custom-route-item d-flex justify-content-between align-items-center';
        listItem.setAttribute('data-route-id', route.id);
        
        listItem.innerHTML = `
            <div>
                <div class="fw-bold">${route.name}</div>
                <div class="small">${route.distance} км | ${route.duration} мин</div>
            </div>
            <button class="btn btn-sm btn-outline-danger delete-route-btn" data-route-id="${route.id}">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        
        customRoutesList.appendChild(listItem);
        
        // Добавить обработчик клика для отображения маршрута
        listItem.addEventListener('click', function(e) {
            if (e.target.closest('.delete-route-btn')) return; // Не срабатывать при клике на кнопку удаления
            
            const routeId = parseInt(this.getAttribute('data-route-id'));
            drawCustomRouteById(routeId);
            
            // Добавить активный класс
            document.querySelectorAll('.custom-route-item').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
        
        // Добавить обработчик удаления
        const deleteBtn = listItem.querySelector('.delete-route-btn');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const routeId = parseInt(this.getAttribute('data-route-id'));
            deleteCustomRoute(routeId);
        });
    });
}

// Переменная для хранения экземпляра маршрутизатора для сохраненных маршрутов
let savedRouteControl = null;

// Отрисовка пользовательского маршрута по ID
function drawCustomRouteById(routeId) {
    // Загрузить маршруты из localStorage
    const savedRoutes = JSON.parse(localStorage.getItem('customRoutes') || '[]');
    
    // Найти маршрут по ID
    const route = savedRoutes.find(r => r.id === routeId);
    
    if (!route) {
        console.error('Route not found:', routeId);
        return;
    }
    
    // Очистить слои
    routesLayer.clearLayers();
    customRouteLayer.clearLayers();
    poisLayer.clearLayers();
    servicesLayer.clearLayers();
    
    // Если есть активный маршрутизатор, удалить его
    if (savedRouteControl) {
        map.removeControl(savedRouteControl);
        savedRouteControl = null;
    }
    
    // Если точка только одна
    if (route.waypoints.length === 1) {
        const waypoint = route.waypoints[0];
        const waypointIcon = L.divIcon({
            className: 'waypoint-icon',
            html: '<div class="start-marker" style="color: var(--primary-color);"><i class="fas fa-map-marker-alt"></i></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon })
            .bindPopup(`<div class="popup-title">${waypoint.name}</div>`)
            .addTo(routesLayer);
            
        // Центрировать карту на точке
        map.setView([waypoint.lat, waypoint.lng], 15);
        return;
    }
    
    // Создаем точки для маршрутизатора
    const routeWaypoints = route.waypoints.map(wp => L.latLng(wp.lat, wp.lng));
    
    // Создаем маршрутизатор для дорожного маршрута
    savedRouteControl = L.Routing.control({
        waypoints: routeWaypoints,
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false, // Не показывать панель инструкций
        lineOptions: {
            styles: [
                {color: 'var(--primary-color)', opacity: 0.8, weight: 6},
                {color: 'white', opacity: 0.3, weight: 4}
            ]
        },
        createMarker: function(i, wp, nWps) {
            const isStart = i === 0;
            const isEnd = i === nWps - 1;
            
            let waypointIcon;
            
            if (isStart) {
                waypointIcon = L.divIcon({
                    className: 'waypoint-icon',
                    html: '<div class="start-marker" style="color: var(--primary-color);"><i class="fas fa-play-circle"></i></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
            } else if (isEnd) {
                waypointIcon = L.divIcon({
                    className: 'waypoint-icon',
                    html: '<div class="end-marker" style="color: var(--primary-color);"><i class="fas fa-flag-checkered"></i></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
            } else {
                waypointIcon = L.divIcon({
                    className: 'waypoint-icon',
                    html: `<div class="waypoint-number" style="background-color: var(--primary-color); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 12px;">${i + 1}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
            }
            
            const marker = L.marker(wp.latLng, { icon: waypointIcon })
                .bindPopup(`<div class="popup-title">${route.waypoints[i].name}</div>`);
            
            return marker;
        }
    }).addTo(map);
}


// Удаление пользовательского маршрута
function deleteCustomRoute(routeId) {
    // Создаем модальное окно подтверждения
    const confirmationModalId = 'delete-confirmation-modal';
    let confirmationModal = document.getElementById(confirmationModalId);
    
    // Если модального окна еще нет, создаем его
    if (!confirmationModal) {
        const modalHtml = `
            <div class="modal fade" id="${confirmationModalId}" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="confirmationModalLabel">Подтверждение удаления</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Вы уверены, что хотите удалить этот маршрут?</p>
                            <p class="text-muted small">Это действие нельзя будет отменить.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Удалить</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        confirmationModal = document.getElementById(confirmationModalId);
    }
    
    // Получаем модальное окно и кнопку подтверждения
    const modal = new bootstrap.Modal(confirmationModal);
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Очищаем предыдущие обработчики
    const newConfirmBtn = confirmDeleteBtn.cloneNode(true);
    confirmDeleteBtn.parentNode.replaceChild(newConfirmBtn, confirmDeleteBtn);
    
    // Добавляем новый обработчик
    newConfirmBtn.addEventListener('click', function() {
        // Скрываем модальное окно
        modal.hide();
        
        // Показываем индикатор загрузки
        showToast('Удаление маршрута...', 'info');
        
        // Отправить запрос на сервер
        fetch(`/api/custom-routes/${routeId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            // Удалить из localStorage
            const savedRoutes = JSON.parse(localStorage.getItem('customRoutes') || '[]');
            const updatedRoutes = savedRoutes.filter(r => r.id !== routeId);
            localStorage.setItem('customRoutes', JSON.stringify(updatedRoutes));
            
            // Обновить список маршрутов
            loadCustomRoutes();
            
            // Очистить слой карты, если отображался этот маршрут
            routesLayer.clearLayers();
            
            // Показываем уведомление об успешном удалении
            showToast('Маршрут успешно удален!', 'success');
        })
        .catch(error => {
            console.error('Error deleting route:', error);
            
            // Даже если запрос к серверу не удался, всё равно удаляем из localStorage
            // (т.к. у нас тестовый режим)
            const savedRoutes = JSON.parse(localStorage.getItem('customRoutes') || '[]');
            const updatedRoutes = savedRoutes.filter(r => r.id !== routeId);
            localStorage.setItem('customRoutes', JSON.stringify(updatedRoutes));
            
            loadCustomRoutes();
            routesLayer.clearLayers();
            
            // Показываем уведомление об успешном удалении
            showToast('Маршрут успешно удален!', 'success');
        });
    });
    
    // Показываем модальное окно
    modal.show();
}

// Загрузка достопримечательностей и сервисов для выбора
function loadAttractions() {
    const poiSelect = document.getElementById('poiSelect');
    
    // Очистить текущие опции, кроме первой (placeholder)
    while (poiSelect.options.length > 1) {
        poiSelect.remove(1);
    }
    
    // Загрузить списки точек
    fetch('/api/attractions')
        .then(response => response.json())
        .then(attractions => {
            // Сгруппировать по категориям
            const categories = {};
            
            attractions.forEach(attr => {
                if (!categories[attr.category]) {
                    categories[attr.category] = [];
                }
                categories[attr.category].push(attr);
            });
            
            // Добавить оптгруппы по категориям
            for (const category in categories) {
                const group = document.createElement('optgroup');
                group.label = getCategoryName(category);
                
                categories[category].forEach(attr => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({
                        id: attr.id,
                        name: attr.name,
                        lat: attr.lat,
                        lng: attr.lng
                    });
                    option.textContent = attr.name;
                    group.appendChild(option);
                });
                
                poiSelect.appendChild(group);
            }
        })
        .catch(error => {
            console.error('Error loading attractions:', error);
        });
}

// Переменная для хранения координат клика
let lastRightClickLatLng = null;

// Обработчик правого клика на карте
map.on('contextmenu', function(e) {
    if (isCustomRouteMode) return; // Не показываем модалку в режиме создания маршрута
    
    lastRightClickLatLng = e.latlng;
    const modal = new bootstrap.Modal(document.getElementById('addUserPoiModal'));
    document.getElementById('userPoiName').value = ''; // Очищаем поле ввода
    modal.show();
});

// Функция для добавления пользовательской метки
function addUserPoi(latlng, name) {
    const poiId = Date.now(); // Уникальный ID на основе времени
    
    const marker = L.marker([latlng.lat, latlng.lng], { icon: userPoiIcon })
        .addTo(userPoisLayer)
        .bindPopup(`
            <div class="popup-title">${name}</div>
            <button class="btn btn-sm btn-danger delete-user-poi mt-2" data-poi-id="${poiId}">Удалить</button>
        `);
    
    // Сохраняем метку в localStorage
    const userPois = JSON.parse(localStorage.getItem('userPois') || '[]');
    const newPoi = {
        id: poiId,
        name: name,
        lat: latlng.lat,
        lng: latlng.lng
    };
    userPois.push(newPoi);
    localStorage.setItem('userPois', JSON.stringify(userPois));
    
    // Обработчик открытия попапа для динамического добавления события удаления
    marker.on('popupopen', function() {
        const deleteBtn = document.querySelector(`.delete-user-poi[data-poi-id="${poiId}"]`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                // Удаляем метку с карты
                userPoisLayer.removeLayer(marker);
                
                // Удаляем из localStorage
                const updatedPois = userPois.filter(p => p.id !== poiId);
                localStorage.setItem('userPois', JSON.stringify(updatedPois));
                
                // Закрываем попап
                marker.closePopup();
                showToast('Метка удалена!', 'success');
            });
        }
    });
    
    showToast('Метка успешно добавлена!', 'success');
}

// Загрузка сохраненных пользовательских меток при старте
function loadUserPois() {
    const userPois = JSON.parse(localStorage.getItem('userPois') || '[]');
    userPois.forEach(poi => {
        const marker = L.marker([poi.lat, poi.lng], { icon: userPoiIcon })
            .addTo(userPoisLayer)
            .bindPopup(`
                <div class="popup-title">${poi.name}</div>
                <button class="btn btn-sm btn-danger delete-user-poi mt-2" data-poi-id="${poi.id}">Удалить</button>
            `);
        
        marker.on('popupopen', function() {
            const deleteBtn = document.querySelector(`.delete-user-poi[data-poi-id="${poi.id}"]`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    userPoisLayer.removeLayer(marker);
                    const updatedPois = userPois.filter(p => p.id !== poi.id);
                    localStorage.setItem('userPois', JSON.stringify(updatedPois));
                    marker.closePopup();
                    showToast('Метка удалена!', 'success');
                });
            }
        });
    });
}

// Вызов загрузки меток при инициализации
loadUserPois();

// Обработчик кнопки сохранения в модальном окне
document.getElementById('saveUserPoiBtn').addEventListener('click', function() {
    const name = document.getElementById('userPoiName').value.trim();
    if (!name) {
        showToast('Пожалуйста, введите название метки', 'warning');
        return;
    }
    if (lastRightClickLatLng) {
        addUserPoi(lastRightClickLatLng, name);
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserPoiModal'));
        modal.hide();
    }
});

function updateLayersVisibility() {
    if (layersVisibility.routes) {
        routesLayer.addTo(map);
        if (predefinedRouteControl) map.addControl(predefinedRouteControl);
        if (savedRouteControl) map.addControl(savedRouteControl);
    } else {
        routesLayer.remove();
        if (predefinedRouteControl) map.removeControl(predefinedRouteControl);
        if (savedRouteControl) map.removeControl(savedRouteControl);
    }

    if (layersVisibility.pois) {
        poisLayer.addTo(map);
    } else {
        poisLayer.remove();
    }

    if (layersVisibility.services) {
        servicesLayer.addTo(map);
    } else {
        servicesLayer.remove();
    }

    if (layersVisibility.customRoutes) {
        customRouteLayer.addTo(map);
        if (routingControl) map.addControl(routingControl);
    } else {
        customRouteLayer.remove();
        if (routingControl) map.removeControl(routingControl);
    }

    if (layersVisibility.userPois) {
        userPoisLayer.addTo(map);
    } else {
        userPoisLayer.remove();
    }
}

function showServicesByCategory(category) {
    servicesLayer.clearLayers();
    
    let url = '/api/services';
    if (category && category !== 'all') {
        url += `?category=${category}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(services => {
            services.forEach(service => {
                const serviceIcon = createServiceIcon(service.category);
                const marker = L.marker([service.lat, service.lng], { icon: serviceIcon })
                    .bindPopup(`
                        <div class="popup-title">${service.name}</div>
                        <div class="popup-category">${getCategoryName(service.category)}</div>
                        ${service.description ? `<div class="popup-description">${service.description}</div>` : ''}
                        ${service.address ? `<div class="popup-address"><i class="fas fa-map-marker-alt"></i> ${service.address}</div>` : ''}
                        ${service.phone ? `<div class="popup-phone"><i class="fas fa-phone"></i> ${service.phone}</div>` : ''}
                        ${service.working_hours ? `<div class="popup-hours"><i class="far fa-clock"></i> ${service.working_hours}</div>` : ''}
                    `)
                    .addTo(servicesLayer);
            });
            
            if (routesLayer.getLayers().length === 0 && services.length > 0) {
                const bounds = L.latLngBounds(services.map(service => [service.lat, service.lng]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        })
        .catch(error => console.error('Error fetching services:', error));
}


// Инициализация видимости слоев
showPointsOfInterest(); // Загружаем достопримечательности
showServicesByCategory('all'); // Загружаем все сервисы
loadUserPois(); // Уже есть
updateLayersVisibility();