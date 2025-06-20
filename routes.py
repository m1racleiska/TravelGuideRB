from flask import render_template, jsonify, request
from app import app, db
from models import Route, Waypoint, PointOfInterest, Service
from data import (
    routes, 
    points_of_interest, 
    services, 
    service_categories, 
    get_route_by_id, 
    get_pois_by_category, 
    get_services_by_category
)
import json

# Main route for the application
@app.route('/')
def index():
    return render_template('index.html', 
                          routes=routes, 
                          service_categories=service_categories)

# API route to get all routes
@app.route('/api/routes')
def get_routes():
    return jsonify(routes)

# API route to get a specific route by ID
@app.route('/api/routes/<int:route_id>')
def get_route(route_id):
    route = get_route_by_id(route_id)
    if route:
        return jsonify(route)
    return jsonify({"error": "Route not found"}), 404

# API route to get all points of interest
@app.route('/api/pois')
def get_pois():
    category = request.args.get('category')
    pois = get_pois_by_category(category)
    return jsonify(pois)

# API route to get all services
@app.route('/api/services')
def get_services():
    category = request.args.get('category')
    all_services = get_services_by_category(category)
    return jsonify(all_services)

# API route to get all service categories
@app.route('/api/service-categories')
def get_service_categories():
    return jsonify(service_categories)

# Search API
@app.route('/api/search')
def search():
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify([])
    
    results = []
    
    # Search in POIs
    for poi in points_of_interest:
        if query in poi['name'].lower() or (poi.get('description') and query in poi['description'].lower()):
            results.append({
                'type': 'poi',
                'id': poi['id'],
                'name': poi['name'],
                'category': poi['category'],
                'lat': poi['lat'],
                'lng': poi['lng']
            })
    
    # Search in services
    for service in services:
        if query in service['name'].lower() or (service.get('address') and query in service['address'].lower()):
            results.append({
                'type': 'service',
                'id': service['id'],
                'name': service['name'],
                'category': service['category'],
                'lat': service['lat'],
                'lng': service['lng']
            })
    
    return jsonify(results)

# API для работы с пользовательскими маршрутами
@app.route('/api/custom-routes', methods=['GET'])
def get_custom_routes():
    """Получение всех пользовательских маршрутов"""
    custom_routes = []
    
    # В финальном приложении здесь будет запрос к БД
    # Пока используем локальное хранилище, имитируя работу с БД
    # В дальнейшем это можно заменить на работу с базой данных
    
    # Получаем маршруты из localStorage через JavaScript
    # Для демонстрации просто вернем пустой список
    return jsonify(custom_routes)

@app.route('/api/custom-routes', methods=['POST'])
def create_custom_route():
    """Создание нового пользовательского маршрута"""
    data = request.json
    
    if not data or 'name' not in data or 'waypoints' not in data:
        return jsonify({"error": "Не указаны обязательные поля"}), 400
    
    # Генерация ID на стороне сервера
    # В реальном приложении ID будет генерироваться базой данных
    route_id = len(routes) + 1
    
    new_route = {
        "id": route_id,
        "name": data["name"],
        "description": data.get("description", ""),
        "distance": data.get("distance", 0),
        "duration": data.get("duration", 0),
        "custom": True,
        "waypoints": data["waypoints"]
    }
    
    # В реальном приложении здесь будет сохранение в БД
    # Для демонстрации сохраняем в список routes
    # В JavaScript-коде будем сохранять маршрут в localStorage
    
    return jsonify(new_route)

@app.route('/api/custom-routes/<int:route_id>', methods=['GET'])
def get_custom_route(route_id):
    """Получение пользовательского маршрута по ID"""
    # В реальном приложении здесь будет запрос к БД
    # Для демонстрации возвращаем 404, так как маршруты хранятся в localStorage
    return jsonify({"error": "Маршрут не найден"}), 404

@app.route('/api/custom-routes/<int:route_id>', methods=['PUT'])
def update_custom_route(route_id):
    """Обновление пользовательского маршрута"""
    data = request.json
    
    if not data:
        return jsonify({"error": "Данные для обновления не предоставлены"}), 400
    
    # В реальном приложении здесь будет запрос к БД
    # Для демонстрации просто возвращаем обновленные данные
    updated_route = {
        "id": route_id,
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "distance": data.get("distance", 0),
        "duration": data.get("duration", 0),
        "custom": True,
        "waypoints": data.get("waypoints", [])
    }
    
    return jsonify(updated_route)

@app.route('/api/custom-routes/<int:route_id>', methods=['DELETE'])
def delete_custom_route(route_id):
    """Удаление пользовательского маршрута"""
    # В реальном приложении здесь будет запрос к БД
    # Для демонстрации просто возвращаем успешный ответ
    return jsonify({"success": True})

@app.route('/api/attractions', methods=['GET'])
def get_attractions():
    """Получение списка всех точек (POI и сервисы) для выбора в маршруте"""
    attractions = []
    
    # Добавляем POI
    for poi in points_of_interest:
        attractions.append({
            'id': f"poi-{poi['id']}",
            'name': poi['name'],
            'type': 'attraction',
            'category': poi['category'],
            'lat': poi['lat'],
            'lng': poi['lng']
        })
    
    # Добавляем сервисы
    for service in services:
        attractions.append({
            'id': f"service-{service['id']}",
            'name': service['name'],
            'type': 'service',
            'category': service['category'],
            'lat': service['lat'],
            'lng': service['lng']
        })
    
    return jsonify(attractions)
