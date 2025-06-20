document.addEventListener('DOMContentLoaded', function() {
    // Загрузка пользовательских маршрутов при запуске
    loadCustomRoutes();
    
    // Обработчики для кнопок управления слоями
    const toggleRoutesBtn = document.getElementById('toggleRoutesBtn');
    const togglePoisBtn = document.getElementById('togglePoisBtn');
    const toggleServicesBtn = document.getElementById('toggleServicesBtn');

    // Добавим отладку для проверки кнопок
    console.log('toggleRoutesBtn:', toggleRoutesBtn);
    console.log('togglePoisBtn:', togglePoisBtn);
    console.log('toggleServicesBtn:', toggleServicesBtn);

    toggleRoutesBtn.addEventListener('click', function() {
        console.log('Routes button clicked, current visibility:', layersVisibility.routes);
        layersVisibility.routes = !layersVisibility.routes;
        this.classList.toggle('active', layersVisibility.routes);
        updateLayersVisibility();
    });

    togglePoisBtn.addEventListener('click', function() {
        console.log('POIs button clicked, current visibility:', layersVisibility.pois);
        layersVisibility.pois = !layersVisibility.pois;
        this.classList.toggle('active', layersVisibility.pois);
        updateLayersVisibility();
    });

    toggleServicesBtn.addEventListener('click', function() {
        console.log('Services button clicked, current visibility:', layersVisibility.services);
        layersVisibility.services = !layersVisibility.services;
        this.classList.toggle('active', layersVisibility.services);
        updateLayersVisibility();
    });

    // Остальной код (поиск, маршруты, сервисы и т.д.) остается без изменений
    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchToggle.addEventListener('click', function() {
        searchContainer.classList.toggle('d-none');
        if (!searchContainer.classList.contains('d-none')) {
            searchInput.focus();
        }
    });
    
    searchInput.addEventListener('input', debounce(function() {
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }
        
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(results => {
                if (results.length === 0) {
                    searchResults.innerHTML = '<div class="p-2">Ничего не найдено</div>';
                } else {
                    searchResults.innerHTML = '';
                    results.forEach(result => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'search-result-item';
                        resultItem.textContent = result.name;
                        resultItem.addEventListener('click', function() {
                            showSearchResults([result]);
                            searchInput.value = '';
                            searchResults.style.display = 'none';
                        });
                        searchResults.appendChild(resultItem);
                    });
                }
                
                searchResults.style.display = 'block';
            })
            .catch(error => {
                console.error('Error searching:', error);
                searchResults.innerHTML = '<div class="p-2">Ошибка поиска</div>';
                searchResults.style.display = 'block';
            });
    }, 300));
    
    const routesToggle = document.getElementById('routesToggle');
    const routesContainer = document.querySelector('.routes-container');
    const routesList = document.getElementById('routesList');
    const routeDetails = document.getElementById('routeDetails');
    const routeName = document.getElementById('routeName');
    const routeDescription = document.getElementById('routeDescription');
    const routeDistance = document.getElementById('routeDistance');
    const routeDuration = document.getElementById('routeDuration');
    
    routesToggle.addEventListener('click', function() {
        routesContainer.classList.toggle('d-none');
    });
    
    routesList.addEventListener('click', function(event) {
        const routeItem = event.target.closest('.route-item');
        if (!routeItem) return;
    
        const routeId = parseInt(routeItem.dataset.routeId, 10);
        const isAlreadyActive = routeItem.classList.contains('active');
    
        document.querySelectorAll('.route-item').forEach(item => {
            item.classList.remove('active');
        });
    
        if (isAlreadyActive) {
            routesLayer.clearLayers();
            if (predefinedRouteControl) {
                map.removeControl(predefinedRouteControl);
                predefinedRouteControl = null;
            }
            routeDetails.classList.add('d-none');
            return;
        }
    
        routeItem.classList.add('active');
    
        fetch(`/api/routes/${routeId}`)
            .then(response => response.json())
            .then(route => {
                drawRoute(route);
                routeName.textContent = route.name;
                routeDescription.textContent = route.description || 'Нет описания';
                const distanceValue = routeDistance.querySelector('.value');
                const durationValue = routeDuration.querySelector('.value');
                distanceValue.textContent = `${route.distance} км`;
                durationValue.textContent = `${route.duration} мин`;
                routeDetails.classList.remove('d-none');
            })
            .catch(error => {
                console.error('Error fetching route:', error);
                showToast('Ошибка при загрузке маршрута', 'error');
            });
    });
    
    const poisToggle = document.getElementById('poisToggle');
    let poisActive = false;
    
    poisToggle.addEventListener('click', function() {
        poisActive = !poisActive;
        layersVisibility.pois = poisActive; // Синхронизируем с layersVisibility
        poisToggle.classList.toggle('active', poisActive);
        if (poisActive) {
            showPointsOfInterest();
        }
        updateLayersVisibility(); // Используем общую функцию
    });
    
    const servicesToggle = document.getElementById('servicesToggle');
    const servicesContainer = document.querySelector('.services-container');
    const serviceCategories = document.getElementById('serviceCategories');
    
    servicesToggle.addEventListener('click', function() {
        servicesContainer.classList.toggle('d-none');
        if (!servicesContainer.classList.contains('d-none')) {
            // При открытии панели сервисов можно автоматически показать сервисы
            if (layersVisibility.services) {
                showServicesByCategory('all');
            }
        }
    });
    
    serviceCategories.addEventListener('click', function(event) {
        const categoryButton = event.target.closest('.service-category');
        if (!categoryButton) return;
        
        document.querySelectorAll('.service-category').forEach(button => {
            button.classList.remove('active');
        });
        
        categoryButton.classList.add('active');
        const categoryId = categoryButton.dataset.category;
        showServicesByCategory(categoryId);
    });
    
    const createRouteBtn = document.getElementById('createRouteBtn');
    const customRouteBuilder = document.getElementById('customRouteBuilder');
    const saveRouteBtn = document.getElementById('saveRouteBtn');
    const cancelRouteBtn = document.getElementById('cancelRouteBtn');
    const poiSelect = document.getElementById('poiSelect');
    
    createRouteBtn.addEventListener('click', function() {
        customRouteBuilder.classList.remove('d-none');
        enableCustomRouteMode();
    });
    
    poiSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        if (!selectedValue) return;
        
        try {
            const waypointData = JSON.parse(selectedValue);
            const waypoint = {
                lat: waypointData.lat,
                lng: waypointData.lng,
                name: waypointData.name
            };
            addWaypointToCustomRoute(waypoint);
            this.value = '';
        } catch (error) {
            console.error('Error parsing POI selection:', error);
        }
    });
    
    saveRouteBtn.addEventListener('click', function() {
        saveCustomRoute();
    });
    
    cancelRouteBtn.addEventListener('click', function() {
        disableCustomRouteMode();
        customRouteBuilder.classList.add('d-none');
        document.getElementById('routeNameInput').value = '';
        document.getElementById('routeDescInput').value = '';
    });
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
});