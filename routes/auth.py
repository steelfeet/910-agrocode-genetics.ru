from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, Inventory
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def index():
    print("""Главная страница - Сцена 1""")
    if 'user_id' in session:
        # Если пользователь залогинен, проверим есть ли у него игра
        user = User.query.get(session['user_id'])
        has_game = len(user.hives) > 0 if user else False
        
        if has_game:
            # Передаем все необходимые переменные в контекст шаблона
            return render_template('game_main.html', 
                                 user=user, 
                                 hives_count=len(user.hives))
        else:
            # Если пользователь залогинен, но игры нет, показываем login с кнопкой "Новая игра"
            game_state = {
                'authenticated': True,
                'hasGame': False,
                'username': session.get('username', '')
            }
            return render_template('login.html', game_state=game_state)
    else:
        # Если пользователь не залогинен
        game_state = {
            'authenticated': False,
            'hasGame': False,
            'username': ''
        }
        return render_template('login.html', game_state=game_state)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Регистрация нового пользователя"""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'error': 'Все поля обязательны'}), 400
    
    # Проверяем, что пользователь не существует
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Пользователь с таким именем уже существует'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Пользователь с таким email уже существует'}), 400
    
    # Создаем нового пользователя
    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Создаем начальный инвентарь
    inventory = Inventory(user_id=user.id)
    db.session.add(inventory)
    db.session.commit()
    
    # Автоматически логиним пользователя
    session['user_id'] = user.id
    session['username'] = username
    
    return jsonify({'success': True, 'message': 'Регистрация успешна'})

@auth_bp.route('/login', methods=['POST'])
def login():
    """Вход пользователя"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not all([username, password]):
        return jsonify({'error': 'Все поля обязательны'}), 400
    
    # Ищем пользователя
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Неверное имя пользователя или пароль'}), 401
    
    # Логиним пользователя
    session['user_id'] = user.id
    session['username'] = username
    
    return jsonify({'success': True, 'message': 'Вход выполнен успешно'})

@auth_bp.route('/logout')
def logout():
    """Выход пользователя"""
    session.clear()
    return redirect(url_for('auth.index'))

@auth_bp.route('/check_auth')
def check_auth():
    """Проверка аутентификации"""
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return jsonify({
            'authenticated': True,
            'username': user.username,
            'has_game': len(user.hives) > 0
        })
    else:
        return jsonify({'authenticated': False})