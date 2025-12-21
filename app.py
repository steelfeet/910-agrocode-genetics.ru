from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

from extensions import db
migrate = Migrate()

app = Flask(__name__)

# Конфигурация базы данных
current_directory = os.getcwd()
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{current_directory}/db1.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key'

# Инициализация расширений
db.init_app(app)
migrate.init_app(app, db)

# Регистрация Blueprint'ов
from routes.auth import auth_bp
from routes.game import game_bp
from routes.api import api_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(game_bp, url_prefix='/game')
app.register_blueprint(api_bp, url_prefix='/api')

# Главная страница - перенаправляем на страницу аутентификации
@app.route('/')
def main_page():
    from flask import redirect, url_for
    return redirect(url_for('auth.index'))


# Создание таблиц
with app.app_context():
    db.create_all()
    
if __name__ == "__main__":
    # app.run('192.168.26.75', "5006", debug=True)
    app.run('localhost', "5000", debug=True)