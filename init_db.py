from app import create_app, db
from models import Bank, NectarProfile, Weather
from datetime import date, timedelta
import json
import random

def init_database():
    """Инициализация базы данных с начальными данными"""
    app = create_app()
    
    with app.app_context():
        # Создаем таблицы
        db.create_all()
        
        # Создаем банки
        create_banks()
        
        # Создаем профили взятка для городов
        create_nectar_profiles()
        
        # Создаем базовые погодные данные
        create_weather_data()
        
        print("База данных успешно инициализирована!")

def create_banks():
    """Создание банков с различными условиями"""
    banks_data = [
        {
            "name": "Сбербанк",
            "base_rate": 15.5,
            "description": "Крупнейший банк России с стабильными условиями"
        },
        {
            "name": "ВТБ",
            "base_rate": 16.0,
            "description": "Государственный банк с умеренными ставками"
        },
        {
            "name": "Альфа-Банк",
            "base_rate": 17.5,
            "description": "Частный банк с гибкими условиями кредитования"
        },
        {
            "name": "Тинькофф Банк",
            "base_rate": 18.0,
            "description": "Цифровой банк с быстрым оформлением"
        },
        {
            "name": "Россельхозбанк",
            "base_rate": 14.0,
            "description": "Специализированный банк для сельского хозяйства"
        }
    ]
    
    for bank_data in banks_data:
        bank = Bank(
            name=bank_data["name"],
            base_rate=bank_data["base_rate"]
        )
        db.session.add(bank)
    
    db.session.commit()
    print(f"Создано {len(banks_data)} банков")

def create_nectar_profiles():
    """Создание профилей взятка для различных городов"""
    cities_data = [
        {
            "city": "Москва",
            "latitude": 55.7558,
            "longitude": 37.6176,
            "base_nectar": 18.5,
            "honey_plants": [
                {"name": "Липа", "bloom_start": 150, "bloom_end": 180, "nectar_value": 0.8},
                {"name": "Акация белая", "bloom_start": 140, "bloom_end": 160, "nectar_value": 0.9},
                {"name": "Гречиха", "bloom_start": 180, "bloom_end": 220, "nectar_value": 0.7},
                {"name": "Подсолнух", "bloom_start": 190, "bloom_end": 230, "nectar_value": 0.6},
                {"name": "Клен", "bloom_start": 120, "bloom_end": 140, "nectar_value": 0.5}
            ]
        },
        {
            "city": "Санкт-Петербург",
            "latitude": 59.9311,
            "longitude": 30.3609,
            "base_nectar": 16.8,
            "honey_plants": [
                {"name": "Ива", "bloom_start": 110, "bloom_end": 130, "nectar_value": 0.6},
                {"name": "Липа", "bloom_start": 155, "bloom_end": 185, "nectar_value": 0.8},
                {"name": "Малина", "bloom_start": 140, "bloom_end": 170, "nectar_value": 0.7},
                {"name": "Гречиха", "bloom_start": 185, "bloom_end": 225, "nectar_value": 0.7},
                {"name": "Кипрей", "bloom_start": 150, "bloom_end": 200, "nectar_value": 0.9}
            ]
        },
        {
            "city": "Новосибирск",
            "latitude": 55.0084,
            "longitude": 82.9357,
            "base_nectar": 15.2,
            "honey_plants": [
                {"name": "Ива", "bloom_start": 115, "bloom_end": 135, "nectar_value": 0.6},
                {"name": "Липа", "bloom_start": 160, "bloom_end": 190, "nectar_value": 0.8},
                {"name": "Донник", "bloom_start": 160, "bloom_end": 220, "nectar_value": 0.8},
                {"name": "Гречиха", "bloom_start": 190, "bloom_end": 230, "nectar_value": 0.7},
                {"name": "Подсолнух", "bloom_start": 200, "bloom_end": 240, "nectar_value": 0.6}
            ]
        },
        {
            "city": "Екатеринбург",
            "latitude": 56.8389,
            "longitude": 60.6057,
            "base_nectar": 17.1,
            "honey_plants": [
                {"name": "Ива", "bloom_start": 112, "bloom_end": 132, "nectar_value": 0.6},
                {"name": "Липа", "bloom_start": 158, "bloom_end": 188, "nectar_value": 0.8},
                {"name": "Акация", "bloom_start": 145, "bloom_end": 165, "nectar_value": 0.9},
                {"name": "Гречиха", "bloom_start": 185, "bloom_end": 225, "nectar_value": 0.7},
                {"name": "Донник", "bloom_start": 165, "bloom_end": 225, "nectar_value": 0.8}
            ]
        },
        {
            "city": "Сочи",
            "latitude": 43.6028,
            "longitude": 39.7342,
            "base_nectar": 22.3,
            "honey_plants": [
                {"name": "Акация", "bloom_start": 120, "bloom_end": 140, "nectar_value": 0.9},
                {"name": "Липа", "bloom_start": 140, "bloom_end": 170, "nectar_value": 0.8},
                {"name": "Каштан", "bloom_start": 130, "bloom_end": 150, "nectar_value": 0.7},
                {"name": "Цитрусовые", "bloom_start": 100, "bloom_end": 120, "nectar_value": 0.6},
                {"name": "Эвкалипт", "bloom_start": 200, "bloom_end": 300, "nectar_value": 0.8}
            ]
        },
        {
            "city": "Казань",
            "latitude": 55.7887,
            "longitude": 49.1221,
            "base_nectar": 16.9,
            "honey_plants": [
                {"name": "Липа", "bloom_start": 152, "bloom_end": 182, "nectar_value": 0.8},
                {"name": "Ива", "bloom_start": 108, "bloom_end": 128, "nectar_value": 0.6},
                {"name": "Клен", "bloom_start": 118, "bloom_end": 138, "nectar_value": 0.5},
                {"name": "Гречиха", "bloom_start": 182, "bloom_end": 222, "nectar_value": 0.7},
                {"name": "Подсолнух", "bloom_start": 192, "bloom_end": 232, "nectar_value": 0.6}
            ]
        },
        {
            "city": "Нижний Новгород",
            "latitude": 56.2965,
            "longitude": 43.9361,
            "base_nectar": 17.4,
            "honey_plants": [
                {"name": "Липа", "bloom_start": 154, "bloom_end": 184, "nectar_value": 0.8},
                {"name": "Ива", "bloom_start": 109, "bloom_end": 129, "nectar_value": 0.6},
                {"name": "Малина", "bloom_start": 142, "bloom_end": 172, "nectar_value": 0.7},
                {"name": "Гречиха", "bloom_start": 184, "bloom_end": 224, "nectar_value": 0.7},
                {"name": "Кипрей", "bloom_start": 155, "bloom_end": 205, "nectar_value": 0.9}
            ]
        }
    ]
    
    for city_data in cities_data:
        # Создаем профиль взятка для города
        profile = NectarProfile(
            city=city_data["city"],
            latitude=city_data["latitude"],
            longitude=city_data["longitude"],
            base_nectar=city_data["base_nectar"],
            honey_plants=json.dumps(city_data["honey_plants"]),
            daily_profile=json.dumps(generate_daily_profile())
        )
        db.session.add(profile)
    
    db.session.commit()
    print(f"Создано профилей взятка для {len(cities_data)} городов")

def generate_daily_profile():
    """Генерация профиля взятка по дням года"""
    daily_profile = {}
    
    for day in range(1, 367):  # Дни года
        coefficient = 0.1  # Минимальный коэффициент зимой
        
        if 90 <= day <= 120:  # Весна (апрель-май)
            coefficient = 0.3 + (day - 90) * 0.02
        elif 120 <= day <= 180:  # Лето (июнь)
            coefficient = 0.9 + (day - 120) * 0.005
            coefficient = min(coefficient, 1.2)  # Максимум летом
        elif 180 <= day <= 270:  # Конец лета-осень
            coefficient = 1.2 - (day - 180) * 0.01
        elif 270 <= day <= 365:  # Осень-зима
            coefficient = 0.1
        
        # Добавляем случайные колебания
        coefficient += random.uniform(-0.1, 0.1)
        coefficient = max(0.1, min(1.2, coefficient))  # Ограничиваем диапазон
        
        daily_profile[str(day)] = round(coefficient, 3)
    
    return daily_profile

def create_weather_data():
    """Создание базовых погодных данных"""
    cities = ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Сочи", "Казань", "Нижний Новгород"]
    start_date = date(2015, 4, 1)  # Начало игрового периода
    
    for city in cities:
        # Создаем погоду на 30 дней вперед
        for i in range(30):
            weather_date = start_date + timedelta(days=i)
            
            # Базовые температуры по сезонам
            if weather_date.month in [4, 5]:  # Весна
                base_temp = 15 + random.uniform(-5, 10)
            elif weather_date.month in [6, 7, 8]:  # Лето
                base_temp = 25 + random.uniform(-5, 8)
            elif weather_date.month in [9, 10]:  # Осень
                base_temp = 10 + random.uniform(-5, 5)
            else:  # Зима
                base_temp = -5 + random.uniform(-10, 5)
            
            # Вероятность дождя (меньше летом, больше весной и осенью)
            rain_probability = 0.2
            if weather_date.month in [4, 5, 9, 10]:
                rain_probability = 0.4
            elif weather_date.month in [6, 7, 8]:
                rain_probability = 0.1
            
            is_rainy = random.random() < rain_probability
            
            weather = Weather(
                date=weather_date,
                city=city,
                temperature=round(base_temp, 1),
                is_rainy=is_rainy,
                effective_temperature=round(base_temp - 2 if is_rainy else base_temp, 1)
            )
            db.session.add(weather)
    
    db.session.commit()
    print(f"Создана погодная информация для {len(cities)} городов на 30 дней")

def reset_database():
    """Сброс базы данных (для разработки)"""
    app = create_app()
    
    with app.app_context():
        db.drop_all()
        db.create_all()
        init_database()
        print("База данных сброшена и инициализирована заново!")

if __name__ == '__main__':
    init_database()