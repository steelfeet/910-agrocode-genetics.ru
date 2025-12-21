from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify, flash
from extensions import db
from models import User, Hive, Frame, Cell, CellType, FrameType, Inventory, Bank, Credit, NectarProfile, Weather
from datetime import datetime, date, timedelta
import json
import random

game_bp = Blueprint('game', __name__)

# Декоратор для проверки аутентификации
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print(f"Проверка аутентификации для {f.__name__}")
        print(f"Сессия: {dict(session)}")
        
        if 'user_id' not in session:
            print("Пользователь не аутентифицирован, перенаправление на главную")
            return redirect(url_for('auth.index'))
        
        user = User.query.get(session['user_id'])
        if not user:
            print("Пользователь не найден в базе данных")
            session.clear()
            return redirect(url_for('auth.index'))
        
        print(f"Пользователь {user.username} аутентифицирован")
        return f(*args, **kwargs)
    return decorated_function

@game_bp.route('/new_game')
@login_required
def new_game():
    """Начало новой игры - теперь выбор местности происходит в модальном окне"""
    # Поскольку выбор местности теперь происходит в модальном окне,
    # эта страница используется только как fallback
    return render_template('game_main.html')

@game_bp.route('/reset_game', methods=['POST'])
@login_required
def reset_game():
    """Сброс текущей игры и начало новой"""
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    try:
        # Удаляем все улья пользователя
        Hive.query.filter_by(user_id=user_id).delete()
        
        # Удаляем инвентарь пользователя полностью
        Inventory.query.filter_by(user_id=user_id).delete()
        
        # Удаляем кредиты пользователя
        Credit.query.filter_by(user_id=user_id).delete()
        
        # Сбрасываем игровые данные пользователя
        user.latitude = None
        user.longitude = None
        user.city = None
        user.year = None
        user.game_date = None
        user.cash = 10000  # Возвращаем стартовый капитал
        user.debt = 0
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Игра сброшена. Начинаем новую игру!'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при сбросе игры: {str(e)}'}), 500

@game_bp.route('/select_location', methods=['POST'])
@login_required
def select_location():
    """Сохранение выбранного места и переход к настройкам - Сцена 3"""
    data = request.get_json()
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    city = data.get('city', 'Неизвестный город')
    
    user = User.query.get(session['user_id'])
    user.latitude = latitude
    user.longitude = longitude
    user.city = city
    
    db.session.commit()
    
    return jsonify({'success': True})

@game_bp.route('/settings')
@login_required
def settings():
    """Настройки игры - Сцена 3"""
    user = User.query.get(session['user_id'])
    return render_template('settings.html', user=user)

@game_bp.route('/save_settings', methods=['POST'])
@login_required
def save_settings():
    """Сохранение настроек игры"""
    print("Сохранение настроек игры")
    data = request.get_json()
    city = data.get('city')
    year = data.get('year', 2015)
    
    user = User.query.get(session['user_id'])
    print(f"Обновляем настройки для пользователя {user.username}")
    
    user.city = city
    user.year = int(year)
    user.game_date = date(int(year), 4, 1)  # Начинаем с 1 апреля
    
    db.session.commit()
    print("Настройки сохранены")
    
    # Создаем начальные улья
    print("Создаем начальные улья")
    create_initial_hives(user.id)
    
    # Проверяем количество созданных ульев
    hives_count = len(user.hives)
    print(f"У пользователя теперь {hives_count} ульев")
    
    return jsonify({'success': True, 'hives_count': hives_count})

@game_bp.route('/main')
@login_required
def main_game():
    """Основное окно игры - Сцена 4"""
    user = User.query.get(session['user_id'])
    hives_count = len(user.hives)
    
    return render_template('game_main.html', 
                         user=user, 
                         hives_count=hives_count)

@game_bp.route('/bank')
@login_required
def bank():
    """Банк - Сцена 5"""
    user = User.query.get(session['user_id'])
    banks = Bank.query.all()
    user_credits = Credit.query.filter_by(user_id=user.id, is_active=True).all()
    
    return render_template('bank.html', user=user, banks=banks, credits=user_credits)

@game_bp.route('/take_credit', methods=['POST'])
@login_required
def take_credit():
    """Взять кредит"""
    data = request.get_json()
    bank_id = data.get('bank_id')
    amount = float(data.get('amount'))
    
    bank = Bank.query.get(bank_id)
    user = User.query.get(session['user_id'])
    
    # Создаем новый кредит
    credit = Credit(
        user_id=user.id,
        bank_id=bank_id,
        amount=amount,
        interest_rate=bank.base_rate,
        remaining_amount=amount
    )
    
    db.session.add(credit)
    db.session.commit()
    
    # Добавляем деньги пользователю
    user.cash += amount
    
    return jsonify({'success': True})

@game_bp.route('/repay_credit', methods=['POST'])
@login_required
def repay_credit():
    """Погасить кредит"""
    data = request.get_json()
    credit_id = data.get('credit_id')
    amount = float(data.get('amount'))
    
    credit = Credit.query.get(credit_id)
    user = User.query.get(session['user_id'])
    
    if amount <= user.cash and amount <= credit.remaining_amount:
        user.cash -= amount
        credit.remaining_amount -= amount
        
        if credit.remaining_amount <= 0:
            credit.is_active = False
        
        db.session.commit()
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Недостаточно средств'}), 400

@game_bp.route('/hive/<int:hive_id>')
@login_required
def hive_view(hive_id):
    """Просмотр улья - Сцена 9"""
    print(f"Попытка доступа к улью {hive_id}")
    print(f"ID пользователя в сессии: {session.get('user_id')}")
    
    hive = Hive.query.get_or_404(hive_id)
    print(f"Найден улей: {hive.name} (ID: {hive.id}, владелец: {hive.user_id})")
    
    # Проверяем, что улей принадлежит пользователю
    if hive.user_id != session['user_id']:
        print(f"Отказ в доступе: улей принадлежит {hive.user_id}, а не {session['user_id']}")
        return jsonify({'error': 'Нет доступа к этому улью'}), 403
    
    print(f"Доступ разрешен к улью {hive.name}")
    return render_template('hive_view.html', hive=hive)

@game_bp.route('/check_hives')
@login_required
def check_hives():
    """Проверка и создание ульев для пользователя"""
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    # Проверяем, есть ли у пользователя улья
    if len(user.hives) == 0:
        # Создаем начальные улья
        create_initial_hives(user_id)
        return jsonify({'message': 'Созданы начальные улья', 'hives_count': len(user.hives)})
    else:
        return jsonify({'message': f'У пользователя уже есть {len(user.hives)} ульев', 'hives_count': len(user.hives)})

@game_bp.route('/create_hives_for_user', methods=['POST'])
def create_hives_for_user():
    """Создание ульев для конкретного пользователя (для тестирования)"""
    data = request.get_json()
    username = data.get('username', 'ypv')
    
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': f'Пользователь {username} не найден'}), 404
    
    # Проверяем, есть ли уже улья
    if len(user.hives) > 0:
        return jsonify({'message': f'У пользователя {username} уже есть {len(user.hives)} ульев'})
    
    # Создаем улья
    create_initial_hives(user.id)
    
    return jsonify({'message': f'Созданы улья для пользователя {username}', 'hives_count': len(user.hives)})

def create_initial_hives(user_id):
    """Создание начальных ульев для нового игрока"""
    try:
        # Проверяем, есть ли уже улья у пользователя
        existing_hives = Hive.query.filter_by(user_id=user_id).count()
        if existing_hives > 0:
            print(f"У пользователя {user_id} уже есть {existing_hives} ульев")
            return
        
        print(f"Создаем 4 улья для пользователя {user_id}")
        
        for i in range(4):  # 4 улья в начале
            hive = Hive(user_id=user_id, name=f'Улей {i+1}')
            
            # Новая матка (возраст 0 дней)
            hive.queen_age = 0
            
            # Создаем статистику 2000 разновозрастных пчел
            # Распределяем пчел по возрастам с уменьшением к старшему возрасту
            bees_distribution = {}
            total_bees = 0
            # Молодые пчелы (1-14 дней) - большее количество
            for age in range(1, 15):
                if age <= 7:
                    bees_distribution[str(age)] = 150 - (age - 1) * 10  # 150, 140, 130, ... 80
                else:
                    bees_distribution[str(age)] = 80 - (age - 7) * 5    # 75, 70, 65, ... 45
                total_bees += bees_distribution[str(age)]
            
            # Летные пчелы (15-35 дней) - меньшее количество
            for age in range(15, 36):
                bees_distribution[str(age)] = max(1, 45 - (age - 15) * 2)  # 45, 43, 41, ... 1
                total_bees += bees_distribution[str(age)]
            
            # Корректируем, чтобы получить ровно 2000 пчел
            if total_bees != 2000:
                adjustment = 2000 - total_bees
                bees_distribution['1'] += adjustment  # Добавляем/убираем из молодых пчел
            
            hive.bees_by_age = json.dumps(bees_distribution)
            hive.frames_count = 3  # Устанавливаем количество рамок = 3
            
            db.session.add(hive)
            db.session.flush()  # Получаем ID улья
            
            print(f"Создан улей {hive.id} с именем {hive.name}")
            print(f"Матка возрастом {hive.queen_age} дней")
            print(f"Всего пчел: {sum(bees_distribution.values())}")
            
            # Создаем 3 рамки для каждого улья: 2 медовых, 1 с расплодом в центре
            frame_configs = [
                {'position': 0, 'type': FrameType.HONEY, 'description': 'Медовая рамка 1'},
                {'position': 1, 'type': FrameType.BROOD, 'description': 'Расплод (центральная)'},
                {'position': 2, 'type': FrameType.HONEY, 'description': 'Медовая рамка 2'}
            ]
            
            for frame_config in frame_configs:
                frame = Frame(
                    hive_id=hive.id, 
                    position=frame_config['position'],
                    frame_type=frame_config['type']
                )
                db.session.add(frame)
                db.session.flush()
                
                print(f"Создана {frame_config['description']} (позиция {frame_config['position']})")
                
                # Создаем ячейки в зависимости от типа рамки
                if frame_config['type'] == FrameType.BROOD:
                    # Рамка с расплодом - создаем разновозрастный расплод
                    create_brood_frame_cells(frame.id)
                else:
                    # Медовая рамка
                    create_honey_frame_cells(frame.id)
        
        db.session.commit()
        print(f"Успешно созданы улья для пользователя {user_id}")
        
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка при создании ульев: {e}")
        raise

def create_brood_frame_cells(frame_id):
    """Создание ячеек для рамки с расплодом согласно ТЗ:
    - 1/3 сверху состоит из медовых сот
    - В центре рамки самый ранний расплод, к краям рамки возраст расплода уменьшается
    - Размер рамки: 86x46 ячеек (горизонтальная)
    """
    frame_width = 86
    frame_height = 46
    
    # 1/3 сверху - медовые соты (примерно 15 ячеек по высоте)
    honey_section_height = frame_height // 3  # 15 ячеек
    
    for x in range(frame_width):
        for y in range(frame_height):
            if y < honey_section_height:
                # Верхняя треть - медовые соты
                cell = Cell(
                    frame_id=frame_id,
                    cell_type=CellType.HONEY,
                    x=x,
                    y=y,
                    honey_amount=0.2  # 0.2 грамма меда в ячейке
                )
            else:
                # Нижние 2/3 - расплод с градиентом возраста
                # В центре рамки самый ранний расплод, к краям возраст уменьшается
                
                # Вычисляем расстояние от центра рамки
                center_x = frame_width // 2  # 43
                distance_from_center = abs(x - center_x)
                
                # Чем ближе к центру, тем раньше расплод (больше дней назад отложено яйцо)
                # Максимальное расстояние от центра: 43 ячейки
                # Минимальный возраст расплода: 0 дней (только что отложенные яйца)
                # Максимальный возраст расплода: 10 дней (куколки)
                max_distance = center_x
                age_factor = distance_from_center / max_distance  # 0 в центре, 1 у краев
                
                # Возраст расплода в днях (0-10)
                brood_age_days = int(age_factor * 10)
                
                # Определяем тип расплода в зависимости от возраста
                if brood_age_days <= 2:
                    # Яйца (0-2 дня)
                    cell_type = CellType.OPEN_BROOD
                elif brood_age_days <= 6:
                    # Личинки (3-6 дней)
                    cell_type = CellType.OPEN_BROOD
                else:
                    # Куколки (7-10 дней)
                    cell_type = CellType.CLOSED_BROOD
                
                # Дата откладки яйца
                egg_date = datetime.now().date() - timedelta(days=brood_age_days)
                
                cell = Cell(
                    frame_id=frame_id,
                    cell_type=cell_type,
                    egg_date=egg_date,
                    x=x,
                    y=y,
                    honey_amount=0.0
                )
            
            db.session.add(cell)

def create_honey_frame_cells(frame_id):
    """Создание ячеек для медовой рамки согласно ТЗ:
    - Верхние 3/4 медом состоит из медовых сот
    - Размер рамки: 86x46 ячеек (горизонтальная)
    """
    frame_width = 86
    frame_height = 46
    
    # Верхние 3/4 - медовые соты (примерно 34-35 ячеек по высоте)
    honey_section_height = (frame_height * 3) // 4  # 34 ячейки
    
    for x in range(frame_width):
        for y in range(frame_height):
            if y < honey_section_height:
                # Верхние 3/4 - медовые соты
                cell = Cell(
                    frame_id=frame_id,
                    cell_type=CellType.HONEY,
                    x=x,
                    y=y,
                    honey_amount=0.2  # 0.2 грамма меда в ячейке
                )
            else:
                # Нижняя 1/4 - может быть пустой или с небольшим количеством меда
                # Для реалистичности добавим немного меда в некоторые ячейки
                if random.random() < 0.3:  # 30% ячеек с небольшим количеством меда
                    cell_type = CellType.HONEY
                    honey_amount = 0.1  # Меньше меда в нижней части
                else:
                    cell_type = CellType.EMPTY
                    honey_amount = 0.0
                
                cell = Cell(
                    frame_id=frame_id,
                    cell_type=cell_type,
                    x=x,
                    y=y,
                    honey_amount=honey_amount
                )
            
            db.session.add(cell)