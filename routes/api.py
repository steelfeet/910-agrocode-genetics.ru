from flask import Blueprint, request, session, jsonify
from extensions import db
from models import User, Hive, Frame, Cell, CellType, FrameType, Inventory, Credit, Bank, Weather, NectarProfile
from datetime import datetime, date, timedelta
import json
import random

api_bp = Blueprint('api', __name__)

@api_bp.route('/next_day', methods=['POST'])
def next_day():
    """Функция пересчета "Следующий день" """
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима аутентификация'}), 401
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    try:
        # 1. Пересчет даты игры
        user.game_date += timedelta(days=1)
        
        # 2. Пересчет пчел по возрастам
        recalculate_bees(user_id)
        
        # Временно отключено: 3. Пересчет ячеек сот
        # recalculate_cells(user_id)
        
        # Временно отключено: 4. Пересчет взятка
        # recalculate_nectar(user_id)
        
        # Временно отключено: 5. Пересчет потребления корма
        # recalculate_consumption(user_id)
        
        # Временно отключено: 6. Пересчет отложенных яиц
        # recalculate_eggs(user_id)
        
        # 7. Пересчет кредитов
        recalculate_credits(user_id)
        
        # 8. Обновление банковских ставок
        update_bank_rates()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'new_date': user.game_date.isoformat(),
            'cash': user.cash,
            'debt': user.debt
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/hive/<int:hive_id>/stats')
def hive_stats(hive_id):
    """Получение статистики пчел улья"""
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима аутентификация'}), 401
    
    hive = Hive.query.get_or_404(hive_id)
    
    if hive.user_id != session['user_id']:
        return jsonify({'error': 'Нет доступа'}), 403
    
    # Получаем статистику пчел
    bees_by_age = json.loads(hive.bees_by_age) if hive.bees_by_age else {}
    
    # Группируем по стадиям развития
    stats = {
        'eggs': sum(bees_by_age.get(str(i), 0) for i in range(4)),  # 0-3 дня
        'larvae': sum(bees_by_age.get(str(i), 0) for i in range(4, 10)),  # 3-9 дней
        'pupae': sum(bees_by_age.get(str(i), 0) for i in range(10, 13)),  # 9-12 дней
        'non_flying': sum(bees_by_age.get(str(i), 0) for i in range(13, 15)),  # 0-14 дней (нелетные)
        'flying': sum(bees_by_age.get(str(i), 0) for i in range(15, 36))  # более 14 дней (летные)
    }
    
    return jsonify(stats)

@api_bp.route('/hive/<int:hive_id>/nectar_profile')
def nectar_profile(hive_id):
    """Получение профиля взятка улья"""
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима аутентификация'}), 401
    
    hive = Hive.query.get_or_404(hive_id)
    user = User.query.get(hive.user_id)
    
    if user.id != session['user_id']:
        return jsonify({'error': 'Нет доступа'}), 403
    
    # Получаем профиль взятка для города
    profile = NectarProfile.query.filter_by(city=user.city).first()
    
    if not profile:
        return jsonify({'error': 'Профиль взятка не найден'}), 404
    
    daily_profile = json.loads(profile.daily_profile)
    current_day_of_year = user.game_date.timetuple().tm_yday
    current_coefficient = daily_profile.get(str(current_day_of_year), 1.0)
    
    return jsonify({
        'base_nectar': profile.base_nectar,
        'current_coefficient': current_coefficient,
        'city': profile.city
    })

@api_bp.route('/user/nectar_profile')
def user_nectar_profile():
    """Получение профиля взятка для пользователя (для главного экрана)"""
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима аутентификация'}), 401
    
    user = User.query.get(session['user_id'])
    
    # Получаем профиль взятка для города пользователя
    profile = NectarProfile.query.filter_by(city=user.city).first()
    
    if not profile:
        return jsonify({'error': 'Профиль взятка не найден'}), 404
    
    daily_profile = json.loads(profile.daily_profile)
    current_day_of_year = user.game_date.timetuple().tm_yday
    current_coefficient = daily_profile.get(str(current_day_of_year), 1.0)
    
    # Подсчитываем общее количество летных пчел у пользователя
    total_flying_bees = 0
    total_bees = 0
    total_hives = len(user.hives)
    
    for hive in user.hives:
        bees_by_age = json.loads(hive.bees_by_age) if hive.bees_by_age else {}
        hive_flying_bees = sum(bees_by_age.get(str(age), 0) for age in range(15, 36))
        hive_total_bees = sum(bees_by_age.values())
        
        total_flying_bees += hive_flying_bees
        total_bees += hive_total_bees
    
    # Рассчитываем общий взяток для всех ульев
    total_nectar = profile.base_nectar * current_coefficient * total_flying_bees
    
    return jsonify({
        'base_nectar': profile.base_nectar,
        'current_coefficient': current_coefficient,
        'city': profile.city,
        'total_flying_bees': total_flying_bees,
        'total_bees': total_bees,
        'total_hives': total_hives,
        'total_nectar': total_nectar
    })

@api_bp.route('/feed_hive', methods=['POST'])
def feed_hive():
    """Подкормка улья"""
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима аутентификация'}), 401
    
    data = request.get_json()
    hive_id = data.get('hive_id')
    sugar_amount = float(data.get('sugar_amount', 0))
    
    hive = Hive.query.get_or_404(hive_id)
    user = User.query.get(hive.user_id)
    inventory = user.inventory
    
    if user.id != session['user_id']:
        return jsonify({'error': 'Нет доступа'}), 403
    
    if sugar_amount <= inventory.sugar:
        # Добавляем подкормку (временно храним в honey_amount ячеек)
        inventory.sugar -= sugar_amount
        
        # Распределяем сахар как мед по ячейкам
        distribute_sugar_as_honey(hive.id, sugar_amount * 1000)  # кг -> граммы
        
        db.session.commit()
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Недостаточно сахара'}), 400

def recalculate_bees(user_id):
    """Пересчет пчел по возрастам"""
    user = User.query.get(user_id)
    
    # Определяем максимальный возраст пчел в зависимости от сезона
    current_month = user.game_date.month
    max_age = 45 if current_month in [4, 5, 6, 7, 8, 9] else 180  # Весна-лето: 45 дней, зима: 180 дней
    
    print(f"Пересчет пчел для пользователя {user_id}, месяц: {current_month}, max_age: {max_age}")
    
    for hive in user.hives:
        if not hive.bees_by_age:
            # Инициализация для нового улья
            hive.bees_by_age = json.dumps({str(i): random.randint(200, 500) for i in range(36)})
            print(f"Улей {hive.id}: инициализация новой статистики")
            continue
        
        bees_by_age = json.loads(hive.bees_by_age)
        print(f"Улей {hive.id}: исходная статистика: {bees_by_age}")
        
        new_bees_by_age = {}
        
        # Увеличиваем возраст пчел
        for age, count in bees_by_age.items():
            new_age = int(age) + 1
            # Пчелы могут жить до максимального возраста (45 дней в апреле)
            if new_age <= max_age:
                new_bees_by_age[str(new_age)] = count
                print(f"  Возраст {age} -> {new_age}, количество: {count}")
            else:
                print(f"  Пчелы возрастом {age} удалены (превышают max_age {max_age})")
        
        print(f"Улей {hive.id}: новая статистика: {new_bees_by_age}")
        print(f"Улей {hive.id}: всего пчел до: {sum(bees_by_age.values())}, после: {sum(new_bees_by_age.values())}")
        
        hive.bees_by_age = json.dumps(new_bees_by_age)

def recalculate_cells(user_id):
    """Пересчет ячеек сот"""
    user = User.query.get(user_id)
    
    for hive in user.hives:
        for frame in hive.frames:
            for cell in frame.cells:
                if cell.egg_date:
                    days_since_egg = (user.game_date - cell.egg_date).days
                    
                    if cell.cell_type == CellType.OPEN_BROOD and days_since_egg >= 9:
                        cell.cell_type = CellType.CLOSED_BROOD
                    elif cell.cell_type == CellType.CLOSED_BROOD and days_since_egg >= 12:
                        cell.cell_type = CellType.EMPTY
                        # Добавляем новую пчелу первого дня
                        add_new_bee(hive, 1)

def add_new_bee(hive, count):
    """Добавление новых пчел первого дня"""
    bees_by_age = json.loads(hive.bees_by_age) if hive.bees_by_age else {}
    bees_by_age['1'] = bees_by_age.get('1', 0) + count
    hive.bees_by_age = json.dumps(bees_by_age)

def recalculate_nectar(user_id):
    """Пересчет взятка"""
    user = User.query.get(user_id)
    
    # Получаем погоду
    weather = Weather.query.filter_by(date=user.game_date, city=user.city).first()
    if not weather:
        # Создаем базовую погоду если нет данных
        weather = Weather(
            date=user.game_date,
            city=user.city,
            temperature=20.0,
            is_rainy=False,
            effective_temperature=18.0
        )
        db.session.add(weather)
    
    # Если дождь, взятка нет
    if weather.is_rainy:
        return
    
    # Получаем профиль взятка
    profile = NectarProfile.query.filter_by(city=user.city).first()
    if not profile:
        return
    
    daily_profile = json.loads(profile.daily_profile)
    day_of_year = user.game_date.timetuple().tm_yday
    coefficient = daily_profile.get(str(day_of_year), 1.0)
    
    # Подсчитываем летных пчел
    total_flying_bees = 0
    for hive in user.hives:
        bees_by_age = json.loads(hive.bees_by_age) if hive.bees_by_age else {}
        flying_bees = sum(bees_by_age.get(str(age), 0) for age in range(15, 36))
        total_flying_bees += flying_bees
    
    # Рассчитываем взяток
    nectar_amount = profile.base_nectar * coefficient * total_flying_bees
    
    # Добавляем мед в ячейки
    distribute_nectar_to_cells(user_id, nectar_amount)

def distribute_nectar_to_cells(user_id, nectar_amount):
    """Распределение взятка по ячейкам"""
    user = User.query.get(user_id)
    
    for hive in user.hives:
        # Ищем пустые ячейки или ячейки с медом
        honey_cells = Cell.query.filter(
            Cell.frame_id.in_([f.id for f in hive.frames]),
            Cell.cell_type == CellType.HONEY
        ).limit(int(nectar_amount / 0.2)).all()  # 0.2г на ячейку
        
        for cell in honey_cells:
            if nectar_amount >= 0.2:
                cell.honey_amount = 0.2
                nectar_amount -= 0.2

def distribute_sugar_as_honey(hive_id, sugar_grams):
    """Распределение сахара как меда по ячейкам"""
    honey_cells = Cell.query.filter(
        Cell.frame_id.in_([f.id for f in Hive.query.get(hive_id).frames]),
        Cell.cell_type == CellType.HONEY
    ).limit(int(sugar_grams / 0.2)).all()
    
    for cell in honey_cells:
        if sugar_grams >= 0.2:
            cell.honey_amount = 0.2
            sugar_grams -= 0.2

def recalculate_consumption(user_id):
    """Пересчет потребления корма"""
    user = User.query.get(user_id)
    total_consumption = 0
    
    for hive in user.hives:
        # Подсчитываем открытый расплод
        open_brood_cells = Cell.query.filter(
            Cell.frame_id.in_([f.id for f in hive.frames]),
            Cell.cell_type == CellType.OPEN_BROOD
        ).count()
        
        # Подсчитываем пчел по возрастам
        bees_by_age = json.loads(hive.bees_by_age) if hive.bees_by_age else {}
        non_flying_bees = sum(bees_by_age.get(str(i), 0) for i in range(15))
        flying_bees = sum(bees_by_age.get(str(i), 0) for i in range(15, 36))
        
        # Потребление (в мг)
        consumption = open_brood_cells * 25 + non_flying_bees * 7 + flying_bees * 15
        total_consumption += consumption
    
    # Проверяем достаточность корма
    available_nectar = get_available_nectar(user_id)
    
    if available_nectar < total_consumption:
        # Временно отключено: Нехватка корма - погибают пчелы
        bee_loss = (total_consumption - available_nectar) / 15  # 15мг на пчелу
        print(f"Нехватка корма: потребление={total_consumption}, доступно={available_nectar}, потеря пчел={bee_loss}")
        # apply_bee_mortality(user_id, bee_loss)  # Временно отключено

def get_available_nectar(user_id):
    """Получение доступного нектара"""
    user = User.query.get(user_id)
    total_nectar = 0
    
    for hive in user.hives:
        honey_cells = Cell.query.filter(
            Cell.frame_id.in_([f.id for f in hive.frames]),
            Cell.cell_type == CellType.HONEY
        ).all()
        
        total_nectar += sum(cell.honey_amount for cell in honey_cells)
    
    return total_nectar

def apply_bee_mortality(user_id, bee_loss):
    """Применение смертности пчел из-за нехватки корма"""
    user = User.query.get(user_id)
    
    for hive in user.hives:
        bees_by_age = json.loads(hive.bees_by_age) if hive.bees_by_age else {}
        
        # Уменьшаем количество пчел пропорционально
        total_bees = sum(bees_by_age.values())
        if total_bees > 0:
            # Ограничиваем reduction_rate максимумом 0.9 (90% пчел могут погибнуть)
            reduction_rate = min(0.9, bee_loss / total_bees)
            
            for age in bees_by_age:
                bees_by_age[age] = max(0, int(bees_by_age[age] * (1 - reduction_rate)))
        
        hive.bees_by_age = json.dumps(bees_by_age)

def recalculate_eggs(user_id):
    """Пересчет отложенных яиц"""
    user = User.query.get(user_id)
    
    for hive in user.hives:
        # Проверяем наличие пустых яиц
        empty_cells = Cell.query.filter(
            Cell.frame_id.in_([f.id for f in hive.frames]),
            Cell.cell_type == CellType.EMPTY
        ).count()
        
        if empty_cells > 0:
            # Рассчитываем количество яиц для откладки
            eggs_to_lay = calculate_queen_eggs(hive, user.game_date)
            eggs_to_lay = min(eggs_to_lay, empty_cells)
            
            # Откладываем яйца в центральные рамки
            brood_frames = Frame.query.filter(
                Frame.hive_id == hive.id,
                Frame.frame_type == FrameType.BROOD
            ).order_by(Frame.position).all()
            
            eggs_laid = 0
            for frame in brood_frames:
                if eggs_laid >= eggs_to_lay:
                    break
                
                frame_empty_cells = Cell.query.filter(
                    Cell.frame_id == frame.id,
                    Cell.cell_type == CellType.EMPTY
                ).limit(eggs_to_lay - eggs_laid).all()
                
                for cell in frame_empty_cells:
                    cell.cell_type = CellType.OPEN_BROOD
                    cell.egg_date = user.game_date
                    eggs_laid += 1

def calculate_queen_eggs(hive, current_date):
    """Расчет количества яиц для откладки маткой"""
    # Базовая продуктивность
    base_productivity = hive.queen_productivity
    
    # Коэффициенты влияния
    # Температура (упрощенно)
    temp_coef = 1.0  # Можно получить из Weather
    
    # Питание (упрощенно)
    nutrition_coef = 1.0  # Можно рассчитать на основе доступного корма
    
    # Возраст матки
    age_coef = max(0.5, 1.0 - (hive.queen_age / 365))  # Снижение на 0.5 за год
    
    # Световой день (упрощенно)
    day_length_coef = 1.0
    
    # Сила улья
    bees_by_age = json.loads(hive.bees_by_age) if hive.bees_by_age else {}
    total_bees = sum(bees_by_age.values())
    hive_strength_coef = min(1.4, total_bees / (3 * 3956))  # Норма: 3 рамки нелетных пчел
    
    eggs_count = base_productivity * temp_coef * nutrition_coef * age_coef * day_length_coef * hive_strength_coef
    
    return int(eggs_count)

def recalculate_credits(user_id):
    """Пересчет кредитов"""
    user = User.query.get(user_id)
    total_debt = 0
    
    for credit in user.credits:
        if credit.is_active:
            # Начисляем проценты
            daily_rate = credit.interest_rate / 365 / 100
            interest = credit.remaining_amount * daily_rate
            credit.remaining_amount += interest
            total_debt += credit.remaining_amount
    
    user.debt = total_debt

def update_bank_rates():
    """Обновление банковских ставок"""
    banks = Bank.query.all()
    
    for bank in banks:
        # С вероятностью 0.01 предлагается рекламная ставка
        if random.random() < 0.01:
            # Случайная пониженная ставка
            bank.base_rate = max(5.0, bank.base_rate * random.uniform(0.7, 0.9))
        else:
            # Небольшие колебания обычной ставки
            bank.base_rate += random.uniform(-0.5, 0.5)
            bank.base_rate = max(5.0, min(25.0, bank.base_rate))  # Ограничиваем 5-25%

@api_bp.route('/hive/<int:hive_id>/historical_data')
def get_historical_data(hive_id):
    """Получение исторических данных пчел для графика"""
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима аутентификация'}), 401
    
    hive = Hive.query.get_or_404(hive_id)
    user = User.query.get(hive.user_id)
    
    if user.id != session['user_id']:
        return jsonify({'error': 'Нет доступа'}), 403
    
    # Получаем данные за последние 30 дней
    days_back = 30
    dates = []
    brood_counts = []
    bee_counts = []
    
    # Текущая статистика
    current_bees_by_age = json.loads(hive.bees_by_age) if hive.bees_by_age else {}
    current_date = user.game_date
    
    # Генерируем исторические данные на основе текущего состояния
    for i in range(days_back):
        date = current_date - timedelta(days=days_back-1-i)
        dates.append(date.strftime('%Y-%m-%d'))
        
        # Упрощенная генерация исторических данных
        # В реальном проекте эти данные должны сохраняться в базе
        variation_factor = 0.8 + (random.random() * 0.4)  # Вариация 0.8-1.2
        
        # Подсчет расплода (яйца + личинки + куколки)
        brood = (
            sum(current_bees_by_age.get(str(j), 0) for j in range(4)) +  # яйца
            sum(current_bees_by_age.get(str(j), 0) for j in range(4, 10)) +  # личинки
            sum(current_bees_by_age.get(str(j), 0) for j in range(10, 13))  # куколки
        ) * variation_factor
        
        # Подсчет общих пчел
        total_bees = sum(current_bees_by_age.values()) * variation_factor
        
        brood_counts.append(int(brood))
        bee_counts.append(int(total_bees))
    
    return jsonify({
        'dates': dates,
        'brood_counts': brood_counts,
        'bee_counts': bee_counts,
        'hive_name': hive.name
    })

@api_bp.route('/hive/<int:hive_id>/detailed_calculations')
def get_detailed_calculations(hive_id):
    """Получение детальных расчетов взятка и потребления"""
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима аутентификация'}), 401
    
    hive = Hive.query.get_or_404(hive_id)
    user = User.query.get(hive.user_id)
    
    if user.id != session['user_id']:
        return jsonify({'error': 'Нет доступа'}), 403
    
    # Получаем текущую статистику пчел
    bees_by_age = json.loads(hive.bees_by_age) if hive.bees_by_age else {}
    
    # Подсчет пчел по категориям
    eggs = sum(bees_by_age.get(str(i), 0) for i in range(4))  # 0-3 дня
    larvae = sum(bees_by_age.get(str(i), 0) for i in range(4, 10))  # 3-9 дней
    pupae = sum(bees_by_age.get(str(i), 0) for i in range(10, 13))  # 9-12 дней
    non_flying_bees = sum(bees_by_age.get(str(i), 0) for i in range(13, 15))  # 0-14 дней
    flying_bees = sum(bees_by_age.get(str(i), 0) for i in range(15, 36))  # более 14 дней
    
    total_bees = sum(bees_by_age.values())
    total_brood = eggs + larvae + pupae
    
    # Получаем профиль взятка
    profile = NectarProfile.query.filter_by(city=user.city).first()
    if profile:
        daily_profile = json.loads(profile.daily_profile)
        current_day_of_year = user.game_date.timetuple().tm_yday
        coefficient = daily_profile.get(str(current_day_of_year), 1.0)
        
        # Формула взятка: базовая величина * коэффициент * количество летных пчел
        base_nectar = profile.base_nectar
        current_nectar = base_nectar * coefficient * flying_bees
        
        nectar_formula = {
            'base_formula': 'базовая_величина × коэффициент_сезона × количество_летных_пчел',
            'base_nectar': base_nectar,
            'coefficient': coefficient,
            'flying_bees': flying_bees,
            'calculation': f'{base_nectar:.1f} × {coefficient:.2f} × {flying_bees} = {current_nectar:.1f} мг/сутки',
            'result': current_nectar
        }
    else:
        nectar_formula = {
            'error': 'Профиль взятка не найден'
        }
    
    # Подсчет потребления корма
    # Формула: ячейки_открытого_расплода * 25мг + пчелы_младше_14дней * 7мг + пчелы_старше_14дней * 15мг
    
    # Подсчет ячеек с открытым расплодом
    open_brood_cells = Cell.query.filter(
        Cell.frame_id.in_([f.id for f in hive.frames]),
        Cell.cell_type == CellType.OPEN_BROOD
    ).count()
    
    # Подсчет потребления
    brood_consumption = open_brood_cells * 25  # 25мг на ячейку с расплодом
    young_bees_consumption = non_flying_bees * 7  # 7мг на нелетную пчелу
    flying_bees_consumption = flying_bees * 15  # 15мг на летную пчелу
    total_consumption = brood_consumption + young_bees_consumption + flying_bees_consumption
    
    consumption_formula = {
        'base_formula': 'ячейки_открытого_расплода × 25мг + пчелы_младше_14дней × 7мг + пчелы_старше_14дней × 15мг',
        'open_brood_cells': open_brood_cells,
        'non_flying_bees': non_flying_bees,
        'flying_bees': flying_bees,
        'brood_consumption': brood_consumption,
        'young_bees_consumption': young_bees_consumption,
        'flying_bees_consumption': flying_bees_consumption,
        'calculation': f'{open_brood_cells} × 25 + {non_flying_bees} × 7 + {flying_bees} × 15 = {total_consumption} мг/сутки',
        'result': total_consumption
    }
    
    return jsonify({
        'current_stats': {
            'total_bees': total_bees,
            'total_brood': total_brood,
            'eggs': eggs,
            'larvae': larvae,
            'pupae': pupae,
            'non_flying_bees': non_flying_bees,
            'flying_bees': flying_bees
        },
        'nectar_calculation': nectar_formula,
        'consumption_calculation': consumption_formula,
        'balance': {
            'nectar_available': nectar_formula.get('result', 0) if 'error' not in nectar_formula else 0,
            'consumption_needed': total_consumption,
            'balance': (nectar_formula.get('result', 0) if 'error' not in nectar_formula else 0) - total_consumption
        }
    })

@api_bp.route('/frame/<int:frame_id>/cells')
def get_frame_cells(frame_id):
    """Получение детальной информации о ячейках рамки"""
    if 'user_id' not in session:
        return jsonify({'error': 'Необходима аутентификация'}), 401
    
    frame = Frame.query.get_or_404(frame_id)
    hive = Hive.query.get(frame.hive_id)
    user = User.query.get(hive.user_id)
    
    if user.id != session['user_id']:
        return jsonify({'error': 'Нет доступа'}), 403
    
    # Получаем все ячейки рамки
    cells = Cell.query.filter_by(frame_id=frame_id).all()
    
    # Подсчитываем статистику по типам ячеек
    cell_stats = {
        'empty': 0,
        'open_brood': 0,
        'closed_brood': 0,
        'honey': 0
    }
    
    # Подсчитываем возраст расплода
    brood_age_distribution = {
        'eggs': 0,  # 0-3 дня
        'larvae': 0,  # 3-9 дней
        'pupae': 0  # 9-12 дней
    }
    
    # Подсчитываем общее количество меда
    total_honey = 0.0
    
    cells_data = []
    
    for cell in cells:
        # Подсчет статистики
        cell_stats[cell.cell_type.value] += 1
        
        # Расчет возраста расплода
        brood_age = None
        if cell.cell_type in [CellType.OPEN_BROOD, CellType.CLOSED_BROOD] and cell.egg_date:
            brood_age = (user.game_date - cell.egg_date).days
            
            # Категоризация по возрасту
            if brood_age <= 3:
                brood_age_distribution['eggs'] += 1
            elif brood_age <= 9:
                brood_age_distribution['larvae'] += 1
            elif brood_age <= 12:
                brood_age_distribution['pupae'] += 1
        
        # Подсчет меда
        if cell.cell_type == CellType.HONEY:
            total_honey += cell.honey_amount
        
        cells_data.append({
            'id': cell.id,
            'x': cell.x,
            'y': cell.y,
            'cell_type': cell.cell_type.value,
            'egg_date': cell.egg_date.strftime('%Y-%m-%d') if cell.egg_date else None,
            'brood_age': brood_age,
            'honey_amount': cell.honey_amount
        })
    
    return jsonify({
        'frame_info': {
            'id': frame.id,
            'frame_type': frame.frame_type.value,
            'position': frame.position
        },
        'cell_stats': cell_stats,
        'brood_age_distribution': brood_age_distribution,
        'total_honey': total_honey,
        'total_cells': len(cells_data),
        'cells': cells_data
    })