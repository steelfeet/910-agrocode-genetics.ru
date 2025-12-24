from extensions import db
from datetime import datetime, date
from enum import Enum

class CellType(Enum):
    EMPTY = 'empty'
    OPEN_BROOD = 'open_brood'
    CLOSED_BROOD = 'closed_brood'
    HONEY = 'honey'

class FrameType(Enum):
    EMPTY = 'empty'
    BROOD = 'brood'
    HONEY = 'honey'

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Игровые характеристики
    cash = db.Column(db.Float, default=10000.0)  # Наличные деньги
    debt = db.Column(db.Float, default=0.0)      # Долг банку
    game_date = db.Column(db.Date, default=date.today)  # Текущая игровая дата
    year = db.Column(db.Integer, default=2015)   # Год в игре
    city = db.Column(db.String(100))             # Город расположения пасеки
    latitude = db.Column(db.Float)               # Координаты пасеки
    longitude = db.Column(db.Float)
    
    # Связи
    hives = db.relationship('Hive', backref='owner', lazy=True, cascade='all, delete-orphan')
    inventory = db.relationship('Inventory', backref='owner', lazy=True, uselist=False)
    credits = db.relationship('Credit', backref='owner', lazy=True)

class Hive(db.Model):
    __tablename__ = 'hives'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(50), default='Улей')
    location = db.Column(db.String(50), default='пасека')  # пасека или инвентарь
    
    # Характеристики улья
    queen_productivity = db.Column(db.Float, default=1500.0)  # Базовая продуктивность матки (яиц/сутки)
    queen_age = db.Column(db.Integer, default=0)              # Возраст матки в днях
    frames_count = db.Column(db.Integer, default=36)          # Количество рамок (3 магазина по 12)
    
    # Статистика пчел по дням жизни (словарь JSON)
    bees_by_age = db.Column(db.Text)  # JSON строка с количеством пчел каждого возраста
    
    # Связи
    frames = db.relationship('Frame', backref='hive', lazy=True, cascade='all, delete-orphan')

class Frame(db.Model):
    __tablename__ = 'frames'
    
    id = db.Column(db.Integer, primary_key=True)
    hive_id = db.Column(db.Integer, db.ForeignKey('hives.id'), nullable=False)
    frame_type = db.Column(db.Enum(FrameType), default=FrameType.EMPTY)
    position = db.Column(db.Integer)  # Позиция в улье (0-35)
    
    # Связи
    cells = db.relationship('Cell', backref='frame', lazy=True, cascade='all, delete-orphan')

class Cell(db.Model):
    __tablename__ = 'cells'
    
    id = db.Column(db.Integer, primary_key=True)
    frame_id = db.Column(db.Integer, db.ForeignKey('frames.id'), nullable=False)
    cell_type = db.Column(db.Enum(CellType), default=CellType.EMPTY)
    egg_date = db.Column(db.Date)  # Дата откладки яйца маткой
    honey_amount = db.Column(db.Float, default=0.0)  # Количество меда в ячейке (граммы)
    x = db.Column(db.Integer)  # Координата X на рамке
    y = db.Column(db.Integer)  # Координата Y на рамке

class Inventory(db.Model):
    __tablename__ = 'inventory'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Ресурсы
    sugar = db.Column(db.Float, default=0.0)      # Сахар в кг
    honey = db.Column(db.Float, default=0.0)      # Мед в кг
    wax = db.Column(db.Float, default=0.0)        # Воск в кг
    
    # Инструменты
    honey_extractor = db.Column(db.Boolean, default=False)  # Медогонка
    wax_melter = db.Column(db.Boolean, default=False)       # Воскотопка
    
    # Рамки в инвентаре
    empty_frames = db.Column(db.Integer, default=0)         # Пустые рамки
    honey_frames = db.Column(db.Integer, default=0)         # Медовые рамки

class Bank(db.Model):
    __tablename__ = 'banks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    base_rate = db.Column(db.Float, nullable=False)  # Базовая процентная ставка
    
    # Связи
    credits = db.relationship('Credit', backref='bank', lazy=True)

class Credit(db.Model):
    __tablename__ = 'credits'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bank_id = db.Column(db.Integer, db.ForeignKey('banks.id'), nullable=False)
    
    amount = db.Column(db.Float, nullable=False)  # Сумма кредита
    interest_rate = db.Column(db.Float, nullable=False)  # Процентная ставка
    remaining_amount = db.Column(db.Float, nullable=False)  # Оставшаяся сумма
    created_date = db.Column(db.Date, default=date.today)
    is_active = db.Column(db.Boolean, default=True)

class NectarProfile(db.Model):
    __tablename__ = 'nectar_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Базовые параметры взятка
    base_nectar = db.Column(db.Float, default=17.0)  # Базовый взяток (мг/сутки)
    
    # Профиль взятка по дням года (JSON)
    daily_profile = db.Column(db.Text)  # JSON с коэффициентами для каждого дня года
    
    # Медоносы региона (JSON)
    honey_plants = db.Column(db.Text)  # JSON с информацией о медоносах

class Weather(db.Model):
    __tablename__ = 'weather'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    city = db.Column(db.String(100), nullable=False)
    temperature = db.Column(db.Float)
    is_rainy = db.Column(db.Boolean, default=False)
    effective_temperature = db.Column(db.Float)  # Эффективная температура для цветения
    
    __table_args__ = (db.UniqueConstraint('date', 'city'),)