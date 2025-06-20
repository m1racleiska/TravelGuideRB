
routes = [
    {
        "id": 1,
        "name": "Маршрут - 1",
        "description": "Обзорный маршрут по центру города с посещением основных достопримечательностей.",
        "distance": 5.2,
        "duration": 120,
        "waypoints": [
            {"lat": 51.8335, "lng": 107.5840, "name": "Старт маршрута"},
            {"lat": 51.834501173387174, "lng": 107.58474793207365, "name": "Площадь Советов"},
            {"lat": 51.8223323068605, "lng": 107.58482232173932, "name": "Одигитриевский собор"},
            {"lat": 51.88447692254969, "lng": 107.65140330155307, "name": "Этнографический музей"},
            {"lat": 51.8291806154626, "lng": 107.5844294749645, "name": "Арбат"},
            {"lat": 51.82176432137756, "lng": 107.5839960319459, "name": "Набережная р. Уда"},
            {"lat": 51.8305, "lng": 107.5810, "name": "Завершение маршрута"}
        ]
    },
    {
        "id": 2,
        "name": "Маршрут - 2",
        "description": "Маршрут по историческим местам города с посещением музеев и памятников.",
        "distance": 4.8,
        "duration": 150,
        "waypoints": [
            {"lat": 51.83353620254808, "lng": 107.58334277680017, "name": "Старт у Театральной площади"},
            {"lat": 51.83482714160404, "lng": 107.58522682204115, "name": "Памятник Ленину"},
            {"lat": 51.83187393707182, "lng": 107.58857816647904, "name": "Национальный музей"},
            {"lat": 51.843530026284206, "lng": 107.60742347338021, "name": "Парк им. Орешкова"},
            {"lat": 51.759027978795054, "lng": 107.20381908281178, "name": "Иволгинский дацан"},
            {"lat": 51.8325, "lng": 107.5940, "name": "Конечная точка"}
        ]
    }
]

points_of_interest = [
    {"id": 1, "name": "Одигитриевский собор", "category": "historical", "lat": 51.822376516543734, "lng": 107.58481235644051, 
     "description": "Исторический православный собор, один из старейших храмов города."},
    {"id": 2, "name": "ФСК", "category": "sport", "lat": 51.846574578118336, "lng": 107.60517577086576, 
     "description": "Физкультурно-спортивный комплекс для активного отдыха."},
    {"id": 3, "name": "City Park", "category": "leisure", "lat": 51.84474151234966, "lng": 107.60888222548462, 
     "description": "Городской парк с аттракционами и зоной отдыха."},
    {"id": 4, "name": "Бурятский театр оперы и балета", "category": "cultural", "lat": 51.83291655130214, "lng": 107.58337006926533, 
     "description": "Театр оперы и балета, культурный центр города."},
    {"id": 5, "name": "ТЦ Пионер", "category": "shopping", "lat": 51.83473376483648, "lng": 107.57302398331768, 
     "description": "Торговый центр с разнообразными магазинами."}
]

services = [
    {"id": 1, "name": "Байкал Плаза", "category": "hotel", "lat": 51.83334789587223, "lng": 107.58612389214639, 
     "address": "ул. Ербанова, 12", "phone": "+7 (3012) 58-01-11", "working_hours": "Круглосуточно"},
    {"id": 3, "name": "Аптека", "category": "pharmacy", "lat": 51.82246500449422, "lng": 107.59171500781964, 
     "address": "пр. Победы, 10", "phone": "+7 (3012) 45-23-76", "working_hours": "08:00-20:00"},
    {"id": 4, "name": "Супермаркет 'Титан'", "category": "shop", "lat": 51.82648659964492, "lng": 107.58884898700968, 
     "address": "ул. Гагарина, 5", "phone": "+7 (3012) 44-32-99", "working_hours": "09:00-22:00"},
    {"id": 5, "name": "Фитнес-центр 'Олимп'", "category": "sport", "lat": 51.8360, "lng": 107.5950, 
     "address": "ул. Спортивная, 8", "phone": "+7 (3012) 56-21-88", "working_hours": "07:00-23:00"},
    {"id": 6, "name": "Салон красоты 'Элегант'", "category": "beauty", "lat": 51.8315, "lng": 107.5870, 
     "address": "ул. Цветочная, 12", "phone": "+7 (3012) 21-56-78", "working_hours": "09:00-20:00"},
    {"id": 7, "name": "Автосервис 'Механик'", "category": "auto", "lat": 51.8280, "lng": 107.5910, 
     "address": "ул. Автомобильная, 22", "phone": "+7 (3012) 65-43-21", "working_hours": "08:00-18:00"},
    {"id": 8, "name": "Почтовое отделение №1", "category": "post", "lat": 51.8320, "lng": 107.5920, 
     "address": "ул. Почтовая, 3", "phone": "+7 (3012) 32-10-55", "working_hours": "09:00-18:00"},
    {"id": 9, "name": "Торговый центр 'Меркурий'", "category": "shopping", "lat": 51.8345, "lng": 107.5925, 
     "address": "пр. Коммерческий, 15", "phone": "+7 (3012) 43-21-54", "working_hours": "10:00-22:00"},
    {"id": 10, "name": "Гостиница 'Бурятия'", "category": "hotel", "lat": 51.8340, "lng": 107.5830, 
     "address": "ул. Коммунистическая, 47", "phone": "+7 (3012) 21-02-02", "working_hours": "Круглосуточно"}
]

service_categories = [
    {"id": "hotel", "name": "Гостиница", "color": "#3366cc"},
    {"id": "restaurant", "name": "Ресторан", "color": "#dc3545"},
    {"id": "pharmacy", "name": "Аптека", "color": "#28a745"},
    {"id": "shop", "name": "Магазин", "color": "#fd7e14"},
    {"id": "sport", "name": "Спорт", "color": "#6f42c1"},
    {"id": "beauty", "name": "Салоны красоты", "color": "#e83e8c"},
    {"id": "auto", "name": "Авто", "color": "#17a2b8"},
    {"id": "post", "name": "Почта", "color": "#6c757d"},
    {"id": "shopping", "name": "ТЦ", "color": "#20c997"}
]

def get_route_by_id(route_id):
    for route in routes:
        if route["id"] == route_id:
            return route
    return None

def get_pois_by_category(category=None):
    if category:
        return [poi for poi in points_of_interest if poi["category"] == category]
    return points_of_interest

def get_services_by_category(category=None):
    if category:
        return [service for service in services if service["category"] == category]
    return services

def get_service_category(category_id):
    for category in service_categories:
        if category["id"] == category_id:
            return category
    return None
