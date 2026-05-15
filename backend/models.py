from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Agent(db.Model):
    __tablename__ = 'agents'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    instagram_handle = db.Column(db.String(255))
    email = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'instagram_handle': self.instagram_handle,
            'email': self.email,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ScrapeLog(db.Model):
    __tablename__ = 'scrape_logs'

    id = db.Column(db.Integer, primary_key=True)
    accounts_scraped = db.Column(db.String(500))
    properties_found = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50))  # 'success', 'failed', 'partial'
    error_message = db.Column(db.Text)
    scraped_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'accounts_scraped': self.accounts_scraped,
            'properties_found': self.properties_found,
            'status': self.status,
            'error_message': self.error_message,
            'scraped_at': self.scraped_at.isoformat() if self.scraped_at else None,
        }


class Property(db.Model):
    __tablename__ = 'properties'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    price = db.Column(db.String(100))
    location = db.Column(db.String(255))
    address = db.Column(db.String(255))
    land_area = db.Column(db.String(100))
    building_area = db.Column(db.String(100))
    building_condition = db.Column(db.String(100))
    documents = db.Column(db.Text)
    property_type = db.Column(db.String(100))
    year_built = db.Column(db.Integer)
    bedrooms = db.Column(db.String(50))
    bathrooms = db.Column(db.String(50))
    floors = db.Column(db.String(20))
    electricity = db.Column(db.String(50))
    water_source = db.Column(db.String(100))
    agent_phone = db.Column(db.String(50))
    description = db.Column(db.Text)
    agent_name = db.Column(db.String(255))
    post_url = db.Column(db.String(512))
    scraped_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'price': self.price,
            'location': self.location,
            'address': self.address,
            'land_area': self.land_area,
            'building_area': self.building_area,
            'building_condition': self.building_condition,
            'documents': self.documents,
            'property_type': self.property_type,
            'year_built': self.year_built,
            'bedrooms': self.bedrooms,
            'bathrooms': self.bathrooms,
            'floors': self.floors,
            'electricity': self.electricity,
            'water_source': self.water_source,
            'agent_phone': self.agent_phone,
            'description': self.description,
            'agent_name': self.agent_name,
            'post_url': self.post_url,
            'scraped_at': self.scraped_at.isoformat() if self.scraped_at else None,
        }

