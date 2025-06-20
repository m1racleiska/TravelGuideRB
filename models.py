from app import db
from datetime import datetime
from geoalchemy2 import Geometry

class Route(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    distance = db.Column(db.Float, nullable=True)  
    duration = db.Column(db.Integer, nullable=True)  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    waypoints = db.relationship('Waypoint', backref='route', lazy=True, cascade="all, delete-orphan")

class Waypoint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey('route.id'), nullable=False)
    order = db.Column(db.Integer, nullable=False)  
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    name = db.Column(db.String(100), nullable=True)
    
class PointOfInterest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False)  
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  
    description = db.Column(db.Text, nullable=True)
    address = db.Column(db.String(200), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    website = db.Column(db.String(200), nullable=True)
    working_hours = db.Column(db.String(200), nullable=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
