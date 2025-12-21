// Глобальные переменные
let currentUser = null;
let gameState = {};
let currentSeason = 'spring';
let seasonalEffects = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    initializeSeasonalSystem();
});

// Инициализация игры
async function initializeGame() {
    try {
        // Проверяем аутентификацию
        const authResponse = await fetch('/auth/check_auth');
        const authData = await authResponse.json();
        
        if (authData.authenticated) {
            currentUser = authData;
            gameState = {
                authenticated: true,
                username: authData.username,
                hasGame: authData.has_game
            };
        } else {
            gameState = { authenticated: false };
        }
        
        // Настраиваем интерфейс
        setupUI();
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showNotification('Ошибка загрузки игры', 'error');
    }
}

// Инициализация системы сезонов
function initializeSeasonalSystem() {
    console.log('=== initializeSeasonalSystem() вызвана ===');
    console.log('Стек вызовов:', new Error().stack);
    
    const gameDate = getCurrentGameDate();
    console.log('Инициализация системы сезонов...');
    console.log('Текущая игровая дата:', gameDate);
    
    if (gameDate) {
        const month = gameDate.getMonth();
        const season = getSeasonByMonth(month);
        console.log(`Месяц: ${month}, Определенный сезон: ${season}`);
        applySeason(season);
    } else {
        console.log('Игровая дата не найдена, сезон не применен');
    }
    
    console.log('=== initializeSeasonalSystem() завершена ===');
}

// Определение сезона по месяцу (0-11)
function getSeasonByMonth(month) {
    // Весна: март-май (2,3,4)
    // Лето: июнь-август (5,6,7) 
    // Осень: сентябрь-ноябрь (8,9,10)
    // Зима: декабрь-февраль (11,0,1)
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
}

// Получение текущей игровой даты
function getCurrentGameDate() {
    const dateElement = document.querySelector('.date');
    if (dateElement) {
        const dateText = dateElement.textContent.replace('Дата: ', '');
        return new Date(dateText);
    }
    return null;
}

// Применение сезонных стилей
function applySeason(season) {
    // Удаляем предыдущие сезонные классы
    document.body.classList.remove('spring', 'summer', 'autumn', 'winter');
    
    // Добавляем новый сезонный класс
    document.body.classList.add(season);
    currentSeason = season;
    
    // Обновляем сезонные эффекты
    updateSeasonalEffects(season);
    
    console.log(`Применен сезон: ${season}`);
}

// Обновление сезонных эффектов
function updateSeasonalEffects(season) {
    // Удаляем старые эффекты
    removeSeasonalEffects();
    
    // Создаем новые эффекты
    createSeasonalEffects(season);
}

// Создание сезонных эффектов
function createSeasonalEffects(season) {
    console.log(`createSeasonalEffects() вызвана для сезона: ${season}`);
    
    const field = document.querySelector('.field');
    console.log('Элемент .field найден:', !!field);
    
    if (!field) {
        console.log('ERROR: Элемент .field не найден!');
        return;
    }
    
    switch (season) {
        case 'spring':
            console.log('Весенний сезон: создаем пчел и цветы');
            initializeBeeFlightSystem(); // Новая система пчел
            createFieldFlowers(field);
            break;
        case 'summer':
            console.log('Летний сезон: создаем пчел и цветы');
            initializeBeeFlightSystem(); // Новая система пчел
            createFieldFlowers(field);
            break;
        case 'autumn':
            console.log('Осенний сезон: создаем падающие листья');
            stopBeeFlight(); // Останавливаем пчел осенью
            createFallingLeaves(field);
            break;
        case 'winter':
            console.log('Зимний сезон: создаем снежинки');
            stopBeeFlight(); // Останавливаем пчел зимой
            createSnowflakes(field);
            break;
        default:
            console.log(`Неизвестный сезон: ${season}`);
            break;
    }
}

// Система управления полетом пчел
let beeFlightSystem = {
    bees: [],
    isActive: false,
    eclipseActive: false,
    lastSpawnTime: 0,
    spawnInterval: 333, // миллисекунды между вылетами (3 в секунду)
    maxBees: 20,
    baseFlightSpeed: 2, // базовая скорость полета
    eclipseSpeedMultiplier: 0.5, // множитель скорости при затмении (50% от базовой)
    brightSunSpeedMultiplier: 1.5, // множитель скорости при ярком солнце (150% от базовой)
    currentSpeedMultiplier: 1.5 // текущий множитель скорости
};

// Инициализация системы полета пчел с учетом ветра
function initializeBeeFlightSystem() {
    console.log('=== Инициализация системы полета пчел ===');
    
    // Создаем контейнер для пчел
    createBeeContainer();
    
    // Запускаем систему в весенне-летний период
    if (currentSeason === 'spring' || currentSeason === 'summer') {
        startBeeFlight();
    }
    
    // Отслеживаем состояние затмения солнца
    monitorSolarEclipse();
    
    // Применяем эффекты погоды к системе пчел
    if (typeof weatherSystem !== 'undefined') {
        weatherSystem.applyWeatherEffects();
        console.log('🌪️ Эффекты погоды применены к системе пчел');
    }
    
    console.log('Система полета пчел инициализирована');
}

// Создание контейнера для пчел
function createBeeContainer() {
    const field = document.querySelector('.field');
    if (!field) return;
    
    let beeContainer = field.querySelector('.bee-flight-container');
    if (!beeContainer) {
        beeContainer = document.createElement('div');
        beeContainer.className = 'bee-flight-container';
        beeContainer.style.position = 'absolute';
        beeContainer.style.top = '0';
        beeContainer.style.left = '0';
        beeContainer.style.width = '100%';
        beeContainer.style.height = '100%';
        beeContainer.style.pointerEvents = 'none';
        beeContainer.style.zIndex = '15';
        field.appendChild(beeContainer);
    }
}

// Запуск системы полета пчел
function startBeeFlight() {
    beeFlightSystem.isActive = true;
    console.log('Система полета пчел запущена');
    
    // Запускаем основной цикл
    requestAnimationFrame(beeFlightLoop);
}

// Остановка системы полета пчел
function stopBeeFlight() {
    beeFlightSystem.isActive = false;
    console.log('Система полета пчел остановлена');
}

// Основной цикл полета пчел
function beeFlightLoop() {
    if (!beeFlightSystem.isActive) return;
    
    const currentTime = Date.now();
    
    // Спавним новых пчел в зависимости от освещенности
    if (currentTime - beeFlightSystem.lastSpawnTime > beeFlightSystem.spawnInterval) {
        spawnBee();
        beeFlightSystem.lastSpawnTime = currentTime;
    }
    
    // Обновляем существующих пчел
    updateBees();
    
    // Продолжаем цикл
    requestAnimationFrame(beeFlightLoop);
}

// Спавн новой пчелы с учетом ветра
function spawnBee() {
    if (beeFlightSystem.bees.length >= beeFlightSystem.maxBees) return;
    
    const hives = document.querySelectorAll('.hive');
    if (hives.length === 0) return;
    
    // Выбираем случайный улей
    const randomHive = hives[Math.floor(Math.random() * hives.length)];
    const hiveRect = randomHive.getBoundingClientRect();
    const fieldRect = document.querySelector('.field').getBoundingClientRect();
    
    // Создаем пчелу
    const bee = {
        id: Date.now() + Math.random(),
        element: createBeeElement(),
        state: 'flying', // flying, sitting, returning
        hiveX: hiveRect.left - fieldRect.left + hiveRect.width / 2,
        hiveY: hiveRect.top - fieldRect.top + hiveRect.height / 2,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        speed: 2 + Math.random() * 2, // скорость полета
        visitedFlowers: 0,
        maxFlowers: 3 + Math.floor(Math.random() * 3), // 3-5 цветков
        currentFlower: null,
        sitTimer: 0,
        color: '#FFD700', // золотистый цвет пчелы (будет меняться на цвет цветка)
        windAffected: false // флаг влияния ветра на эту пчелу
    };
    
    // Устанавливаем начальную позицию у входа в улей
    bee.x = bee.hiveX;
    bee.y = bee.hiveY;
    
    // Применяем эффекты ветра при создании пчелы
    if (typeof weatherSystem !== 'undefined' && weatherSystem.wind.isActive) {
        bee.windAffected = true;
        bee.element.classList.add('wind-affected');
        
        // Добавляем начальное смещение от ветра
        bee.x += beeFlightSystem.windOffset?.x || 0;
        bee.y += beeFlightSystem.windOffset?.y || 0;
    }
    
    // Добавляем в систему
    beeFlightSystem.bees.push(bee);
    
    // Устанавливаем первую цель
    setRandomTarget(bee);
    
    const windInfo = (typeof weatherSystem !== 'undefined') ? 
        `, ветер: ${weatherSystem.wind.direction} (${weatherSystem.wind.force}/10)` : '';
    console.log(`Спавн пчелы ${bee.id}, всего пчел: ${beeFlightSystem.bees.length}${windInfo}`);
}

// Создание DOM элемента пчелы
function createBeeElement() {
    const beeContainer = document.querySelector('.bee-flight-container');
    const beeElement = document.createElement('div');
    beeElement.className = 'bee-flight';
    beeElement.style.position = 'absolute';
    beeElement.style.width = '10px';
    beeElement.style.height = '10px';
    beeElement.style.backgroundColor = '#FFD700';
    beeElement.style.borderRadius = '50%';
    beeElement.style.border = '1px solid #000';
    beeElement.style.transform = 'translate(-50%, -50%)';
    beeElement.style.zIndex = '15';
    
    // Добавляем анимацию полета
    beeElement.style.animation = 'bee-wing-flutter 0.1s ease-in-out infinite alternate';
    
    // Применяем визуальный эффект в зависимости от текущего состояния солнца
    applyVisualEffect(beeElement);
    
    beeContainer.appendChild(beeElement);
    return beeElement;
}

// Применение визуального эффекта в зависимости от освещенности и ветра
function applyVisualEffect(beeElement) {
    // Убираем предыдущие классы
    beeElement.classList.remove('eclipse-mode', 'bright-sun-mode', 'wind-mode');
    
    // Добавляем класс в зависимости от освещенности
    if (beeFlightSystem.eclipseActive) {
        beeElement.classList.add('eclipse-mode');
    } else {
        beeElement.classList.add('bright-sun-mode');
    }
    
    // Добавляем эффект ветра если он активен
    if (typeof weatherSystem !== 'undefined' && weatherSystem.wind.isActive) {
        beeElement.classList.add('wind-mode');
        
        // Добавляем CSS переменные для динамических эффектов
        const windIntensity = weatherSystem.wind.force / 10;
        beeElement.style.setProperty('--wind-intensity', windIntensity);
        
        // Добавляем наклон от ветра
        let tilt = weatherSystem.wind.force * 2; // до 20 градусов наклона
        if (weatherSystem.wind.directionGroup === 'right-to-left') {
            tilt = -tilt;
        }
        beeElement.style.setProperty('--wind-tilt', `${tilt}deg`);
    } else {
        beeElement.style.removeProperty('--wind-intensity');
        beeElement.style.removeProperty('--wind-tilt');
    }
}

// Установка случайной цели для пчелы
function setRandomTarget(bee) {
    const fieldRect = document.querySelector('.field').getBoundingClientRect();
    
    // Случайная цель в пределах поля
    bee.targetX = Math.random() * (fieldRect.width - 20) + 10;
    bee.targetY = Math.random() * (fieldRect.height - 20) + 10;
}

// Поиск ближайшего цветка
function findNearestFlower(bee) {
    const flowers = document.querySelectorAll('.flower');
    let nearestFlower = null;
    let minDistance = Infinity;
    
    flowers.forEach(flower => {
        const flowerRect = flower.getBoundingClientRect();
        const fieldRect = document.querySelector('.field').getBoundingClientRect();
        
        const flowerX = flowerRect.left - fieldRect.left + flowerRect.width / 2;
        const flowerY = flowerRect.top - fieldRect.top + flowerRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(bee.x - flowerX, 2) + Math.pow(bee.y - flowerY, 2)
        );
        
        // Проверяем расстояние 2-5px как указано в требованиях
        if (distance >= 2 && distance <= 5 && distance < minDistance) {
            minDistance = distance;
            nearestFlower = {
                element: flower,
                x: flowerX,
                y: flowerY,
                color: getFlowerColor(flower)
            };
        }
    });
    
    return nearestFlower;
}

// Получение цвета цветка
function getFlowerColor(flower) {
    // Извлекаем цвет из CSS классов или стилей
    if (flower.classList.contains('flower-daisy')) return '#FFFFFF';
    if (flower.classList.contains('flower-tulip')) return '#FF69B4';
    if (flower.classList.contains('flower-poppy')) return '#DC143C';
    if (flower.classList.contains('flower-cornflower')) return '#4169E1';
    if (flower.classList.contains('flower-lavender')) return '#9370DB';
    
    // По умолчанию желтый
    return '#FFFF00';
}

// Обновление пчел
function updateBees() {
    beeFlightSystem.bees = beeFlightSystem.bees.filter(bee => {
        switch (bee.state) {
            case 'flying':
                updateFlyingBee(bee);
                break;
            case 'sitting':
                updateSittingBee(bee);
                break;
            case 'returning':
                updateReturningBee(bee);
                break;
        }
        
        // Удаляем пчелу если она достигла улья
        if (bee.state === 'returning' && 
            Math.abs(bee.x - bee.hiveX) < 5 && 
            Math.abs(bee.y - bee.hiveY) < 5) {
            removeBee(bee);
            return false;
        }
        
        return true;
    });
}

// Обновление летящей пчелы
function updateFlyingBee(bee) {
    // Проверяем есть ли рядом цветок
    const nearbyFlower = findNearestFlower(bee);
    
    if (nearbyFlower) {
        // Садимся на цветок
        bee.state = 'sitting';
        bee.currentFlower = nearbyFlower;
        bee.targetX = nearbyFlower.x;
        bee.targetY = nearbyFlower.y;
        bee.sitTimer = 2000 + Math.random() * 3000; // 2-5 секунд
        
        // Меняем цвет пчелы на цвет цветка
        bee.color = nearbyFlower.color;
        bee.element.style.backgroundColor = bee.color;
        
        console.log(`Пчела ${bee.id} села на цветок, цвет: ${bee.color}`);
    } else {
        // Продолжаем лететь к цели
        flyToTarget(bee);
        
        // Если достигли цели, ставим новую
        if (Math.abs(bee.x - bee.targetX) < 5 && Math.abs(bee.y - bee.targetY) < 5) {
            setRandomTarget(bee);
        }
    }
}

// Обновление сидящей пчелы
function updateSittingBee(bee) {
    bee.sitTimer -= 16; // примерно 60 FPS
    
    if (bee.sitTimer <= 0) {
        // Время истекло, летим дальше
        bee.visitedFlowers++;
        bee.currentFlower = null;
        bee.state = 'flying';
        
        // Цвет пчелы остается как у последнего посещенного цветка
        // Не восстанавливаем оригинальный цвет
        
        console.log(`Пчела ${bee.id} покинула цветок, посещено цветков: ${bee.visitedFlowers}`);
        
        // Проверяем нужно ли возвращаться в улей
        if (bee.visitedFlowers >= bee.maxFlowers) {
            bee.state = 'returning';
            bee.targetX = bee.hiveX;
            bee.targetY = bee.hiveY;
            console.log(`Пчела ${bee.id} начинает возвращение в улей`);
        } else {
            // Ставим новую случайную цель
            setRandomTarget(bee);
        }
    }
}

// Обновление возвращающейся пчелы
function updateReturningBee(bee) {
    flyToTarget(bee);
}

// Полет к цели с учетом ветра
function flyToTarget(bee) {
    const dx = bee.targetX - bee.x;
    const dy = bee.targetY - bee.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0.1) {
        // Используем базовую скорость пчелы умноженную на текущий множитель
        const currentSpeed = bee.speed * beeFlightSystem.currentSpeedMultiplier;
        let moveX = (dx / distance) * currentSpeed;
        let moveY = (dy / distance) * currentSpeed;
        
        // Применяем эффект ветра к траектории полета
        if (typeof weatherSystem !== 'undefined' && weatherSystem.wind.isActive) {
            // Добавляем смещение в зависимости от ветра
            moveX += beeFlightSystem.windOffset?.x || 0;
            moveY += beeFlightSystem.windOffset?.y || 0;
            
            // Влияние ветра на скорость полета (сильный ветер замедляет)
            const windSpeedReduction = weatherSystem.wind.force * 0.02; // 2% замедления за каждый балл
            moveX *= (1 - windSpeedReduction);
            moveY *= (1 - windSpeedReduction);
        }
        
        bee.x += moveX;
        bee.y += moveY;
        
        // Обновляем позицию элемента
        bee.element.style.left = `${bee.x}px`;
        bee.element.style.top = `${bee.y}px`;
        
        // Поворачиваем пчелу в направлении движения с учетом ветра
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        let visualAngle = angle;
        
        // Добавляем наклон от ветра к визуальному эффекту
        if (typeof weatherSystem !== 'undefined' && weatherSystem.wind.isActive) {
            const windTilt = weatherSystem.wind.force * 2; // наклон до 20 градусов
            if (weatherSystem.wind.directionGroup === 'right-to-left') {
                visualAngle -= windTilt;
            } else {
                visualAngle += windTilt;
            }
        }
        
        bee.element.style.transform = `translate(-50%, -50%) rotate(${visualAngle}deg)`;
    }
}

// Удаление пчелы
function removeBee(bee) {
    if (bee.element && bee.element.parentNode) {
        bee.element.parentNode.removeChild(bee.element);
    }
    console.log(`Пчела ${bee.id} удалена из системы`);
}

// Отслеживание затмения солнца
function monitorSolarEclipse() {
    setInterval(() => {
        const eclipseOverlay = document.querySelector('.eclipse-overlay');
        const wasActive = beeFlightSystem.eclipseActive;
        const wasSpeedMultiplier = beeFlightSystem.currentSpeedMultiplier;
        beeFlightSystem.eclipseActive = eclipseOverlay && eclipseOverlay.classList.contains('active');
        
        // Изменяем интервал спавна и скорость полета в зависимости от освещенности
        if (beeFlightSystem.eclipseActive) {
            beeFlightSystem.spawnInterval = 1000; // 1 пчела в секунду при затмении
            beeFlightSystem.currentSpeedMultiplier = beeFlightSystem.eclipseSpeedMultiplier; // 0.5x скорость
        } else {
            beeFlightSystem.spawnInterval = 333; // 3 пчелы в секунду при ярком солнце
            beeFlightSystem.currentSpeedMultiplier = beeFlightSystem.brightSunSpeedMultiplier; // 1.5x скорость
        }
        
        // Логируем изменения и обновляем визуальные эффекты
        if (wasActive !== beeFlightSystem.eclipseActive || wasSpeedMultiplier !== beeFlightSystem.currentSpeedMultiplier) {
            const sunState = beeFlightSystem.eclipseActive ? 'ЗАТМЕНИЕ' : 'ЯРКОЕ СОЛНЦЕ';
            const spawnRate = (1000 / beeFlightSystem.spawnInterval).toFixed(1);
            const speedPercent = (beeFlightSystem.currentSpeedMultiplier * 100).toFixed(0);
            console.log(`☀️ Состояние солнца: ${sunState}`);
            console.log(`🐝 Скорость спавна: ${spawnRate} пчел/сек`);
            console.log(`🚀 Скорость полета: ${speedPercent}% от базовой`);
            
            // Обновляем визуальные эффекты у всех пчел
            updateAllBeesVisualEffects();
        }
    }, 100); // Проверяем каждые 100мс
}

// Обновление визуальных эффектов у всех пчел с учетом ветра
function updateAllBeesVisualEffects() {
    beeFlightSystem.bees.forEach(bee => {
        if (bee.element) {
            applyVisualEffect(bee.element);
            
            // Дополнительные эффекты ветра для каждой пчелы
            if (typeof weatherSystem !== 'undefined' && weatherSystem.wind.isActive) {
                // Добавляем дрожание от ветра
                const windShake = weatherSystem.wind.force * 0.5;
                const shakeX = (Math.random() - 0.5) * windShake;
                const shakeY = (Math.random() - 0.5) * windShake;
                
                bee.element.style.filter = `drop-shadow(${shakeX}px ${shakeY}px 1px rgba(255, 215, 0, 0.6))`;
            } else {
                bee.element.style.filter = '';
            }
        }
    });
    
    // Логирование состояния ветра для отладки
    if (typeof weatherSystem !== 'undefined') {
        const windData = weatherSystem.getWindData();
        console.log(`🌪️ Ветер: ${windData.direction} (${windData.force}/10), пчел: ${beeFlightSystem.bees.length}`);
    }
}

// Очистка всех пчел
function clearAllBees() {
    beeFlightSystem.bees.forEach(bee => removeBee(bee));
    beeFlightSystem.bees = [];
    console.log('Все пчелы очищены');
}

// Интеграция с существующей системой сезонов
function createBeeAnimations(container) {
    // Инициализируем новую систему полета пчел
    initializeBeeFlightSystem();
}

// Создание падающих листьев (осень)
function createFallingLeaves(container) {
    const trees = container.querySelectorAll('.tree');
    trees.forEach((tree, index) => {
        const leafCount = Math.floor(Math.random() * 4) + 2;
        
        for (let i = 0; i < leafCount; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'falling-leaves';
            leaf.style.left = `${Math.random() * 40 + 25}%`;
            leaf.style.animationDelay = `${Math.random() * 6}s`;
            leaf.style.animationDuration = `${6 + Math.random() * 4}s`;
            
            tree.appendChild(leaf);
            seasonalEffects.push(leaf);
        }
    });
}

// Создание снежинок (зима)
function createSnowflakes(container) {
    const trees = container.querySelectorAll('.tree');
    trees.forEach((tree, index) => {
        const snowflakeCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflakes';
            snowflake.style.left = `${Math.random() * 60 + 10}%`;
            snowflake.style.animationDelay = `${Math.random() * 8}s`;
            snowflake.style.animationDuration = `${8 + Math.random() * 6}s`;
            
            tree.appendChild(snowflake);
            seasonalEffects.push(snowflake);
        }
    });
}

// Создание случайных цветков на поле (весна-лето) с улучшенным позиционированием
function createFieldFlowers(container) {
    console.log('=== createFieldFlowers() вызвана ===');
    console.log('Контейнер поля найден:', !!container);
    console.log('Размеры контейнера:', container.offsetWidth, 'x', container.offsetHeight);
    
    const flowerCount = Math.floor(Math.random() * 6) + 10; // 10-15 цветков
    const flowerTypes = ['daisy', 'tulip', 'poppy', 'cornflower', 'lavender']; // Убран clover
    
    console.log(`Будет создано ${flowerCount} цветков`);
    
    // Создаем контейнер для цветков, если его нет
    let flowersContainer = container.querySelector('.field-flowers');
    if (!flowersContainer) {
        console.log('Создаем новый контейнер для цветков');
        flowersContainer = document.createElement('div');
        flowersContainer.className = 'field-flowers';
        // Принудительно устанавливаем стили для контейнера
        flowersContainer.style.position = 'absolute';
        flowersContainer.style.top = '0';
        flowersContainer.style.left = '0';
        flowersContainer.style.width = '100%';
        flowersContainer.style.height = '100%';
        flowersContainer.style.pointerEvents = 'none';
        flowersContainer.style.zIndex = '5';
        container.appendChild(flowersContainer);
        console.log('Контейнер создан и добавлен. Размеры:', flowersContainer.offsetWidth, 'x', flowersContainer.offsetHeight);
    } else {
        console.log('Контейнер для цветков уже существует');
        console.log('Размеры существующего контейнера:', flowersContainer.offsetWidth, 'x', flowersContainer.offsetHeight);
        // Принудительно обновляем стили для существующего контейнера
        flowersContainer.style.position = 'absolute';
        flowersContainer.style.top = '0';
        flowersContainer.style.left = '0';
        flowersContainer.style.width = '100%';
        flowersContainer.style.height = '100%';
        flowersContainer.style.pointerEvents = 'none';
        flowersContainer.style.zIndex = '5';
        // Очищаем старые цветки
        flowersContainer.innerHTML = '';
        console.log('Старые цветки очищены');
    }
    
    // Получаем позиции ульев для избежания пересечений
    const hives = container.querySelectorAll('.hive');
    const hivePositions = Array.from(hives).map(hive => {
        const rect = hive.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            right: rect.right - containerRect.left,
            bottom: rect.bottom - containerRect.top,
            width: rect.width,
            height: rect.height
        };
    });
    
    console.log('Найдено ульев для избежания пересечений:', hivePositions.length);
    
    for (let i = 0; i < flowerCount; i++) {
        const flower = document.createElement('div');
        const flowerType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        const size = Math.floor(Math.random() * 46) + 5; // 5-50px
        
        flower.className = `flower flower-${flowerType}`;
        flower.style.width = `${size}px`;
        flower.style.height = `${size}px`;
        
        // Улучшенное позиционирование - только на земле и без пересечений с ульями
        let leftPercent, topPercent;
        let attempts = 0;
        const maxAttempts = 20;
        
        do {
            // Цветки размещаются только в нижней части экрана (на земле)
            leftPercent = Math.random() * 80 + 10; // 10-90% от ширины
            topPercent = Math.random() * 30 + 65; // 65-95% от высоты (только на земле)
            
            attempts++;
        } while (attempts < maxAttempts && isFlowerIntersectingWithHive(leftPercent, topPercent, size, hivePositions, container));
        
        // Если не удалось найти подходящее место, размещаем в случайном месте на земле
        if (attempts >= maxAttempts) {
            leftPercent = Math.random() * 80 + 10;
            topPercent = Math.random() * 30 + 65;
            console.warn(`Не удалось найти место без пересечений для цветка ${i+1}, размещаем случайно`);
        }
        
        flower.style.left = `${leftPercent}%`;
        flower.style.top = `${topPercent}%`;
        flower.style.position = 'absolute';
        flower.style.display = 'block';
        
        // Случайная задержка анимации для естественного эффекта
        flower.style.animationDelay = `${Math.random() * 2}s`;
        
        flowersContainer.appendChild(flower);
        seasonalEffects.push(flower);
        
        // Проверяем, правильно ли создался элемент
        console.log(`Цветок ${i+1} создан:`, {
            тип: flowerType,
            размер: size + 'px',
            позиция: `${leftPercent}%, ${topPercent}%`,
            попытки: attempts,
            computedWidth: window.getComputedStyle(flower).width,
            computedHeight: window.getComputedStyle(flower).height,
            computedLeft: window.getComputedStyle(flower).left,
            computedTop: window.getComputedStyle(flower).top,
            display: window.getComputedStyle(flower).display,
            visibility: window.getComputedStyle(flower).visibility
        });
    }
    
    console.log(`Создано ${flowerCount} цветков на поле (только на земле, без пересечений с ульями)`);
    console.log('Общее количество сезонных эффектов:', seasonalEffects.length);
    console.log('=== createFieldFlowers() завершена ===');
}

// Функция проверки пересечения цветка с ульями
function isFlowerIntersectingWithHive(flowerLeftPercent, flowerTopPercent, flowerSize, hivePositions, container) {
    const containerRect = container.getBoundingClientRect();
    const flowerWidth = (flowerSize / containerRect.width) * 100;
    const flowerHeight = (flowerSize / containerRect.height) * 100;
    
    const flowerRect = {
        left: flowerLeftPercent,
        top: flowerTopPercent,
        right: flowerLeftPercent + flowerWidth,
        bottom: flowerTopPercent + flowerHeight
    };
    
    // Проверяем пересечение с каждым ульем
    for (const hive of hivePositions) {
        const hivePercent = {
            left: (hive.left / containerRect.width) * 100,
            top: (hive.top / containerRect.height) * 100,
            right: (hive.right / containerRect.width) * 100,
            bottom: (hive.bottom / containerRect.height) * 100
        };
        
        // Добавляем отступ для избежания близкого расположения
        const padding = 5; // 5% отступ
        hivePercent.left -= padding;
        hivePercent.top -= padding;
        hivePercent.right += padding;
        hivePercent.bottom += padding;
        
        // Проверяем пересечение
        if (flowerRect.left < hivePercent.right &&
            flowerRect.right > hivePercent.left &&
            flowerRect.top < hivePercent.bottom &&
            flowerRect.bottom > hivePercent.top) {
            return true; // Пересечение найдено
        }
    }
    
    return false; // Пересечений нет
}

// Удаление сезонных эффектов
function removeSeasonalEffects() {
    // Останавливаем систему полета пчел
    stopBeeFlight();
    clearAllBees();
    
    // Удаляем старые эффекты
    seasonalEffects.forEach(effect => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    });
    seasonalEffects = [];
}

// Обновление сезонных деревьев с учетом ветра
function updateSeasonalTrees() {
    const gameDate = getCurrentGameDate();
    if (!gameDate) return;
    
    const season = getSeasonByMonth(gameDate.getMonth());
    if (season !== currentSeason) {
        applySeason(season);
    }
    
    // Применяем эффекты ветра к деревьям после обновления сезонов
    if (typeof weatherSystem !== 'undefined') {
        weatherSystem.applyWindToTrees();
        console.log('🌳 Эффекты ветра применены к деревьям');
    }
}

// Настройка интерфейса
function setupUI() {
    if (gameState.authenticated) {
        setupAuthenticatedUI();
    } else {
        setupGuestUI();
    }
}

// Интерфейс для аутентифицированных пользователей
function setupAuthenticatedUI() {
    const loginButtons = document.querySelector('.login-buttons');
    const gameButtons = document.querySelector('.game-buttons');
    
    if (loginButtons) loginButtons.style.display = 'none';
    if (gameButtons) gameButtons.style.display = 'block';
}

// Интерфейс для гостей
function setupGuestUI() {
    const loginButtons = document.querySelector('.login-buttons');
    const gameButtons = document.querySelector('.game-buttons');
    
    if (loginButtons) loginButtons.style.display = 'block';
    if (gameButtons) gameButtons.style.display = 'none';
}

// Регистрация пользователя
async function registerUser(username, email, password) {
    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Регистрация успешна!', 'success');
            location.reload();
        } else {
            showNotification(data.error || 'Ошибка регистрации', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showNotification('Ошибка соединения', 'error');
    }
}

// Вход пользователя
async function loginUser(username, password) {
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Вход выполнен!', 'success');
            location.reload();
        } else {
            showNotification(data.error || 'Ошибка входа', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        showNotification('Ошибка соединения', 'error');
    }
}

// Функция "Следующий день" с обновлением ветра
async function nextDay() {
    try {
        showNotification('Переход к следующему дню...', 'info');
        
        const response = await fetch('/api/next_day', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            updateGameInfo(data);
            showNotification('День прошел успешно!', 'success');
            
            // Обновляем систему ветра и погоды для нового дня
            if (typeof weatherSystem !== 'undefined') {
                weatherSystem.generateDailyWind();
                weatherSystem.generateDailyWeather();
                weatherSystem.updateWeatherDisplay();
                weatherSystem.applyWeatherEffects();
                console.log('🌪️ Система погоды обновлена для нового дня');
            }
            
            // Обновляем сезонные изменения
            updateSeasonalTrees();
            
            // Обновляем информацию на странице
            updatePageInfo();
        } else {
            showNotification(data.error || 'Ошибка перехода', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка перехода:', error);
        showNotification('Ошибка соединения', 'error');
    }
}

// Обновление информации об игре
function updateGameInfo(data) {
    const dateElement = document.querySelector('.date');
    const cashElement = document.querySelector('.cash');
    const debtElement = document.querySelector('.debt');
    
    if (dateElement) dateElement.textContent = `Дата: ${data.new_date}`;
    if (cashElement) cashElement.textContent = `Наличные: ${data.cash.toFixed(2)}`;
    if (debtElement) debtElement.textContent = `Кредит: ${data.debt.toFixed(2)}`;
}

// Обновление информации на странице
async function updatePageInfo() {
    try {
        const response = await fetch('/auth/check_auth');
        const data = await response.json();
        
        if (data.authenticated) {
            // Перезагружаем страницу для обновления UI
            location.reload();
        }
    } catch (error) {
        console.error('Ошибка обновления:', error);
    }
}

// Выбор места на карте
function selectLocation(latitude, longitude, city) {
    // Здесь можно интегрировать Яндекс.Карты
    fetch('/game/select_location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude, city })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/game/settings';
        }
    })
    .catch(error => {
        console.error('Ошибка выбора места:', error);
        showNotification('Ошибка выбора места', 'error');
    });
}

// Взять кредит
async function takeCredit(bankId, amount) {
    try {
        const response = await fetch('/game/take_credit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bank_id: bankId, amount: parseFloat(amount) })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Кредит взят!', 'success');
            updatePageInfo();
        } else {
            showNotification(data.error || 'Ошибка получения кредита', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка кредита:', error);
        showNotification('Ошибка соединения', 'error');
    }
}

// Погасить кредит
async function repayCredit(creditId, amount) {
    try {
        const response = await fetch('/game/repay_credit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credit_id: creditId, amount: parseFloat(amount) })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Кредит погашен!', 'success');
            updatePageInfo();
        } else {
            showNotification(data.error || 'Ошибка погашения', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка погашения:', error);
        showNotification('Ошибка соединения', 'error');
    }
}

// Подкормка улья
async function feedHive(hiveId, sugarAmount) {
    try {
        const response = await fetch('/api/feed_hive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                hive_id: hiveId, 
                sugar_amount: parseFloat(sugarAmount) 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Улей подкормлен!', 'success');
        } else {
            showNotification(data.error || 'Ошибка подкормки', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка подкормки:', error);
        showNotification('Ошибка соединения', 'error');
    }
}

// Получение статистики улья
async function getHiveStats(hiveId) {
    try {
        const response = await fetch(`/api/hive/${hiveId}/stats`);
        const data = await response.json();
        
        if (response.ok) {
            return data;
        } else {
            showNotification(data.error || 'Ошибка получения статистики', 'error');
            return null;
        }
        
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        showNotification('Ошибка соединения', 'error');
        return null;
    }
}

// Получение профиля взятка
async function getNectarProfile(hiveId) {
    try {
        const response = await fetch(`/api/hive/${hiveId}/nectar_profile`);
        const data = await response.json();
        
        if (response.ok) {
            return data;
        } else {
            showNotification(data.error || 'Ошибка получения профиля взятка', 'error');
            return null;
        }
        
    } catch (error) {
        console.error('Ошибка профиля взятка:', error);
        showNotification('Ошибка соединения', 'error');
        return null;
    }
}

// Модальные окна
function showModal(title, content) {
    const overlay = document.getElementById('modal-overlay');
    const titleElement = document.getElementById('modal-title');
    const bodyElement = document.getElementById('modal-body');
    
    if (overlay && titleElement && bodyElement) {
        titleElement.textContent = title;
        bodyElement.innerHTML = content;
        overlay.classList.remove('hidden');
        overlay.classList.add('show');
    }
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('show');
    }
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Цвета для разных типов уведомлений
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Обработка кликов по ульям и деревьям
document.addEventListener('click', function(e) {
    if (e.target.closest('.hive')) {
        const hiveElement = e.target.closest('.hive');
        const hiveId = hiveElement.dataset.hiveId;
        
        if (hiveId) {
            window.location.href = `/game/hive/${hiveId}`;
        }
    }
    
    if (e.target.closest('.tree')) {
        // Показываем информацию о дереве с учетом сезона
        const element = e.target.closest('.tree');
        const elementName = getElementName(element);
        const seasonalInfo = getSeasonalTreeInfo(element, currentSeason);
        
        showModal(`Информация о ${elementName}`, seasonalInfo);
    }
});

// Получение названия элемента
function getElementName(element) {
    if (element.classList.contains('apple-tree')) return 'яблоне';
    if (element.classList.contains('cherry-tree')) return 'вишне';
    if (element.classList.contains('pear-tree')) return 'груше';
    return 'растении';
}

// Получение информации о растении в зависимости от сезона
function getSeasonalTreeInfo(element, season) {
    const elementName = getElementName(element);
    let content = `<h4>${elementName.charAt(0).toUpperCase() + elementName.slice(1)}</h4>`;
    
    const seasonalDescriptions = {
        spring: {
            'apple-tree': 'Весеннее цветение яблони. Белые и розовые цветы привлекают пчел для опыления. Взяток: высокий.',
            'cherry-tree': 'Весеннее цветение вишни. Нежно-розовые цветы - отличный источник нектара. Взяток: очень высокий.',
            'pear-tree': 'Весеннее цветение груши. Белые цветы с легким ароматом. Взяток: средний.'
        },
        summer: {
            'apple-tree': 'Летняя зеленая листва яблони. Формируются завязи плодов. Взяток: низкий.',
            'cherry-tree': 'Летняя зеленая листва вишни. Плоды начинают созревать. Взяток: низкий.',
            'pear-tree': 'Летняя зеленая листва груши. Активный рост плодов. Взяток: низкий.'
        },
        autumn: {
            'apple-tree': 'Осенняя окраска листьев яблони. Желтые и красные тона. Листья начинают опадать. Взяток: отсутствует.',
            'cherry-tree': 'Осенняя окраска листьев вишни. Золотисто-желтые листья. Взяток: отсутствует.',
            'pear-tree': 'Осенняя окраска листьев груши. Бронзово-желтые тона. Взяток: отсутствует.'
        },
        winter: {
            'apple-tree': 'Зимний покой яблони. Голые ветки покрыты инеем. Почки находятся в спящем состоянии.',
            'cherry-tree': 'Зимний покой вишни. Темные голые ветки. Почки ждут весеннего тепла.',
            'pear-tree': 'Зимний покой груши. Ветки покрыты снегом или инеем. Период глубокого покоя.'
        }
    };
    
    const description = seasonalDescriptions[season][element.classList[1]] || 'Неизвестное растение';
    content += `<p>${description}</p>`;
    
    // Добавляем информацию о взятке
    content += `<div class="stat-card mt-20">
        <div class="stat-value">${getNectarValue(season, element.classList[1])}</div>
        <div class="stat-label">Взяток (мг/день)</div>
    </div>`;
    
    return content;
}

// Получение значения взятка в зависимости от сезона и растения
function getNectarValue(season, plantType) {
    const nectarValues = {
        spring: {
            'apple-tree': '150-200',
            'cherry-tree': '180-250',
            'pear-tree': '120-180'
        },
        summer: {
            'apple-tree': '20-40',
            'cherry-tree': '15-35',
            'pear-tree': '25-45'
        },
        autumn: {
            'apple-tree': '0',
            'cherry-tree': '0',
            'pear-tree': '0'
        },
        winter: {
            'apple-tree': '0',
            'cherry-tree': '0',
            'pear-tree': '0'
        }
    };
    
    return nectarValues[season][plantType] || '0';
}

// Функции для работы с формами
function validateForm(formData) {
    const errors = [];
    
    for (let [key, value] of formData.entries()) {
        if (!value.trim()) {
            errors.push(`Поле "${key}" не может быть пустым`);
        }
    }
    
    return errors;
}

// Создание новой игры
function startNewGame() {
    showLocationSelectionModal();
}

// Модальное окно выбора местности
function showLocationSelectionModal() {
    const modalContent = `
        <div class="location-selection-modal">
            <div class="modal-tabs">
                <button class="tab-button active" onclick="switchLocationTab('map')">Карта</button>
                <button class="tab-button" onclick="switchLocationTab('info')">Информация</button>
            </div>
            
            <div id="location-map-tab" class="tab-content active">
                <div class="location-map-container">
                    <div class="map-grid" id="location-map-grid">
                        <!-- Ячейки карты будут сгенерированы JavaScript -->
                    </div>
                    <div class="map-legend">
                        <div class="legend-item">
                            <div class="legend-color excellent"></div>
                            <span>Отличные места</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color good"></div>
                            <span>Хорошие места</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color average"></div>
                            <span>Средние места</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color poor"></div>
                            <span>Слабые места</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="location-info-tab" class="tab-content">
                <div class="location-info-container" id="location-info-content">
                    <p class="text-center">Выберите место на карте для просмотра информации</p>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-primary" id="confirm-location-btn" onclick="confirmLocationSelection()" disabled>
                    Подтвердить выбор
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    Отмена
                </button>
            </div>
        </div>
    `;
    
    showModal('Выбор места для пасеки', modalContent);
    initializeLocationMap();
}

// Переключение вкладок в модальном окне
function switchLocationTab(tabName) {
    // Убираем активные классы
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Активируем выбранную вкладку
    document.querySelector(`[onclick="switchLocationTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`location-${tabName}-tab`).classList.add('active');
}

// Инициализация карты выбора местности
function initializeLocationMap() {
    const mapGrid = document.getElementById('location-map-grid');
    if (!mapGrid) return;
    
    const locations = [
        { lat: 55.7558, lon: 37.6176, city: 'Москва', quality: 'good' },
        { lat: 59.9311, lon: 30.3609, city: 'Санкт-Петербург', quality: 'excellent' },
        { lat: 56.8431, lon: 53.2041, city: 'Ижевск', quality: 'average' },
        { lat: 54.7431, lon: 55.9678, city: 'Уфа', quality: 'good' },
        { lat: 51.5331, lon: 46.0340, city: 'Саратов', quality: 'average' },
        { lat: 55.0084, lon: 82.9357, city: 'Новосибирск', quality: 'excellent' },
        { lat: 53.3494, lon: 83.7639, city: 'Барнаул', quality: 'good' },
        { lat: 56.4747, lon: 84.9878, city: 'Томск', quality: 'average' },
        { lat: 57.1530, lon: 65.5343, city: 'Тюмень', quality: 'good' }
    ];
    
    mapGrid.innerHTML = '';
    
    locations.forEach((location, index) => {
        const mapCell = document.createElement('div');
        mapCell.className = `map-cell ${location.quality}`;
        mapCell.onclick = () => selectLocationOnMap(location);
        mapCell.innerHTML = `<div class="cell-content"></div>`;
        mapGrid.appendChild(mapCell);
    });
}

// Выбор местности на карте
function selectLocationOnMap(location) {
    // Убираем предыдущий выбор
    document.querySelectorAll('.map-cell').forEach(cell => cell.classList.remove('selected'));
    
    // Подсвечиваем выбранную ячейку
    event.target.classList.add('selected');
    
    // Сохраняем выбранную местность
    window.selectedLocation = location;
    
    // Обновляем информацию о местности
    updateLocationInfo(location);
    
    // Включаем кнопку подтверждения
    document.getElementById('confirm-location-btn').disabled = false;
}

// Обновление информации о местности
function updateLocationInfo(location) {
    const infoContainer = document.getElementById('location-info-content');
    if (!infoContainer) return;
    
    const nectarInfo = getNectarInfo(location.quality);
    const climateInfo = getClimateInfo(location.lat, location.lon);
    
    infoContainer.innerHTML = `
        <div class="location-summary">
            <h5>${location.city}</h5>
            <p><strong>Координаты:</strong> ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}</p>
        </div>
        
        <div class="location-stats">
            <div class="stat-item">
                <span class="stat-label">Качество местности:</span>
                <span class="stat-value nectar-${location.quality}">${nectarInfo.title}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Климатическая зона:</span>
                <span class="stat-value">${climateInfo.zone}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Средняя температура:</span>
                <span class="stat-value">${climateInfo.temperature}°C</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Осадки в год:</span>
                <span class="stat-value">${climateInfo.precipitation} мм</span>
            </div>
        </div>
        
        <div class="nectar-plants">
            <h6>Основные медоносы:</h6>
            <div class="plants-grid">
                ${nectarInfo.plants.map(plant => `
                    <div class="plant-item">
                        <span class="plant-name">${plant.name}</span>
                        <span class="plant-value">${plant.nectar}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="location-recommendations">
            <h6>Рекомендации:</h6>
            <ul>
                ${nectarInfo.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="location-quality-score">
            <h6>Оценка местности: ${nectarInfo.score}/10</h6>
            <div class="quality-bar">
                <div class="quality-fill ${location.quality}" style="width: ${nectarInfo.score * 10}%"></div>
            </div>
        </div>
    `;
}

// Переключение между вкладками прогноза сбыта
function switchForecastTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.forecast-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Добавляем активный класс к нажатой кнопке
    event.target.classList.add('active');
    
    // Пересоздаем график для активной вкладки
    setTimeout(() => {
        if (tabName === 'wolf-honey') {
            createWolfHoneyChart();
        } else if (tabName === 'desnyansky-honey') {
            createDesnyanskyHoneyChart();
        }
    }, 100);
}

// Создание обоих графиков прогноза сбыта
function createSalesForecastCharts() {
    console.log('=== СОЗДАНИЕ ОБОИХ ГРАФИКОВ ПРОГНОЗА СБЫТА ===');
    createWolfHoneyChart();
    createDesnyanskyHoneyChart();
    setupForecastControls();
    console.log('=== ГРАФИКИ И ОБРАБОТЧИКИ СОЗДАНЫ ===');
}

// Создание графика для "Волчьего меда"
function createWolfHoneyChart() {
    console.log('=== СОЗДАНИЕ ГРАФИКА ВОЛЧЬЕГО МЕДА ===');
    const ctx = document.getElementById('wolfHoneyChart');
    if (!ctx) {
        console.error('❌ Canvas wolfHoneyChart не найден');
        return;
    }
    console.log('✅ Canvas wolfHoneyChart найден');
    
    // Получаем текущие значения ползунков
    const price = parseInt(document.getElementById('wolf-honey-price').value);
    const brandLevel = parseInt(document.getElementById('wolf-honey-brand-level').value);
    const hivesCount = parseInt(document.getElementById('wolf-honey-hives').value);
    
    console.log('Wolf Honey - Цена:', price, 'Уровень бренда:', brandLevel, 'Ульи:', hivesCount);
    
    // Базовые данные для "Волчьего меда" - ТОЧНО по ТЗ
    const baseData = [50, 30, 20, 10, 30, 40, 50, 60, 70, 30, 30, 30]; // апрель-март
    const months = ['Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь', 'Январь', 'Февраль', 'Март'];
    
    // Пересчитываем данные в зависимости от цены и уровня бренда
    const recalculatedData = recalculateWolfHoneyData(baseData, price, brandLevel);
    console.log('Wolf Honey - Пересчитанные данные:', recalculatedData);
    
    // Уничтожаем предыдущий график если существует
    if (window.wolfHoneyChartInstance) {
        window.wolfHoneyChartInstance.destroy();
    }
    
    // Создаем график с увеличенной шириной
    window.wolfHoneyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Потенциальный спрос (кг)',
                data: recalculatedData,
                borderColor: '#8B4513',
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Потенциальный спрос по месяцам'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 200, // Фиксированный максимум для оси Y
                    title: {
                        display: true,
                        text: 'Спрос (кг)'
                    },
                    ticks: {
                        stepSize: 20 // Шаг сетки 20 кг
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Месяцы'
                    }
                }
            }
        }
    });
    
    // Обновляем сводные данные
    updateWolfHoneySummary(recalculatedData, price, brandLevel, hivesCount);
}

// Создание графика для "Деснянского меда"
function createDesnyanskyHoneyChart() {
    console.log('=== СОЗДАНИЕ ГРАФИКА ДЕСНЯНСКОГО МЕДА ===');
    const ctx = document.getElementById('desnyanskyHoneyChart');
    if (!ctx) {
        console.error('❌ Canvas desnyanskyHoneyChart не найден');
        return;
    }
    console.log('✅ Canvas desnyanskyHoneyChart найден');
    
    // Получаем текущие значения ползунков
    const price = parseInt(document.getElementById('desnyansky-honey-price').value);
    const brandLevel = parseInt(document.getElementById('desnyansky-honey-brand-level').value);
    const hivesCount = parseInt(document.getElementById('desnyansky-honey-hives').value);
    
    console.log('Desnyansky Honey - Цена:', price, 'Уровень бренда:', brandLevel, 'Ульи:', hivesCount);
    
    // Базовые данные для "Деснянского меда" - ТОЧНО по ТЗ
    const baseData = [100, 60, 80, 90, 60, 40, 60, 80, 120, 60, 80, 80]; // апрель-март
    const months = ['Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь', 'Январь', 'Февраль', 'Март'];
    
    // Пересчитываем данные в зависимости от цены и уровня бренда
    const recalculatedData = recalculateDesnyanskyHoneyData(baseData, price, brandLevel);
    console.log('Desnyansky Honey - Пересчитанные данные:', recalculatedData);
    
    // Уничтожаем предыдущий график если существует
    if (window.desnyanskyHoneyChartInstance) {
        window.desnyanskyHoneyChartInstance.destroy();
    }
    
    // Создаем график с увеличенной шириной
    window.desnyanskyHoneyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Потенциальный спрос (кг)',
                data: recalculatedData,
                borderColor: '#4169E1',
                backgroundColor: 'rgba(65, 105, 225, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Потенциальный спрос по месяцам'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 200, // Фиксированный максимум для оси Y
                    title: {
                        display: true,
                        text: 'Спрос (кг)'
                    },
                    ticks: {
                        stepSize: 20 // Шаг сетки 20 кг
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Месяцы'
                    }
                }
            }
        }
    });
    
    // Обновляем сводные данные
    updateDesnyanskyHoneySummary(recalculatedData, price, brandLevel, hivesCount);
}

// Пересчет данных для "Волчьего меда"
function recalculateWolfHoneyData(baseData, price, brandLevel) {
    const basePrice = 600;
    const criticalPrice = brandLevel * 30;
    
    console.log('Wolf Honey recalculation - Price:', price, 'Brand Level:', brandLevel, 'Critical Price:', criticalPrice);
    
    return baseData.map(value => {
        if (price < basePrice) {
            // При уменьшении цены значения растут
            const result = value * (brandLevel / 30);
            console.log('Price < basePrice:', value, '->', result);
            return result;
        } else if (price <= criticalPrice) {
            // В пределах критического значения значения падают
            const result = value * brandLevel * 0.57;
            console.log('Price <= critical:', value, '->', result);
            return result;
        } else {
            // После критического значения значения падают еще больше
            const result = value * brandLevel * 0.17;
            console.log('Price > critical:', value, '->', result);
            return result;
        }
    });
}

// Пересчет данных для "Деснянского меда"
function recalculateDesnyanskyHoneyData(baseData, price, brandLevel) {
    const basePrice = 200;
    const criticalPrice = brandLevel * 10;
    
    console.log('Desnyansky Honey recalculation - Price:', price, 'Brand Level:', brandLevel, 'Critical Price:', criticalPrice);
    
    return baseData.map(value => {
        if (price < basePrice) {
            // При уменьшении цены значения растут
            const result = value * (brandLevel / 30);
            console.log('Price < basePrice:', value, '->', result);
            return result;
        } else if (price <= criticalPrice) {
            // В пределах критического значения значения падают
            const result = value * brandLevel * 0.37;
            console.log('Price <= critical:', value, '->', result);
            return result;
        } else {
            // После критического значения значения падают еще больше
            const result = value * brandLevel * 0.17;
            console.log('Price > critical:', value, '->', result);
            return result;
        }
    });
}

// Обновление сводных данных для "Волчьего меда"
function updateWolfHoneySummary(chartData, price, brandLevel, hivesCount) {
    const honeyCollected = hivesCount * 20;
    const totalDemand = chartData.reduce((sum, value) => sum + value, 0);
    
    let earned;
    if (totalDemand > honeyCollected) {
        earned = hivesCount * price - hivesCount * 2000;
    } else {
        earned = totalDemand * price - hivesCount * 2000;
    }
    
    document.getElementById('wolf-honey-collected').textContent = `${honeyCollected} кг`;
    document.getElementById('wolf-honey-earned').textContent = `${earned.toLocaleString()} руб.`;
    
    console.log('Wolf Honey Summary - Собрано:', honeyCollected, 'Заработано:', earned);
}

// Обновление сводных данных для "Деснянского меда"
function updateDesnyanskyHoneySummary(chartData, price, brandLevel, hivesCount) {
    const honeyCollected = hivesCount * 60;
    const totalDemand = chartData.reduce((sum, value) => sum + value, 0);
    const sugarCost = hivesCount * 30 * 50;
    
    let earned;
    if (totalDemand > honeyCollected) {
        earned = hivesCount * price - hivesCount * 2000 - sugarCost;
    } else {
        earned = totalDemand * price - hivesCount * 2000 - sugarCost;
    }
    
    document.getElementById('desnyansky-honey-collected').textContent = `${honeyCollected} кг`;
    document.getElementById('desnyansky-honey-earned').textContent = `${earned.toLocaleString()} руб.`;
    
    console.log('Desnyansky Honey Summary - Собрано:', honeyCollected, 'Заработано:', earned);
}

// Настройка обработчиков событий для ползунков
function setupForecastControls() {
    console.log('=== НАСТРОЙКА ОБРАБОТЧИКОВ ПОЛЗУНКОВ ===');
    
    // Обработчики для "Волчьего меда"
    const wolfPriceSlider = document.getElementById('wolf-honey-price');
    const wolfBrandSlider = document.getElementById('wolf-honey-brand-level');
    const wolfHivesSlider = document.getElementById('wolf-honey-hives');
    
    console.log('Wolf sliders found:', {
        price: !!wolfPriceSlider,
        brand: !!wolfBrandSlider,
        hives: !!wolfHivesSlider
    });
    
    if (wolfPriceSlider) {
        wolfPriceSlider.addEventListener('input', function() {
            console.log('🔥 Wolf price slider changed to:', this.value);
            document.getElementById('wolf-honey-price-value').textContent = `${this.value} руб.`;
            createWolfHoneyChart();
        });
        console.log('✅ Wolf price slider event listener added');
    } else {
        console.error('❌ Wolf price slider not found');
    }
    
    if (wolfBrandSlider) {
        wolfBrandSlider.addEventListener('input', function() {
            console.log('🔥 Wolf brand slider changed to:', this.value);
            document.getElementById('wolf-honey-brand-value').textContent = this.value;
            createWolfHoneyChart();
        });
        console.log('✅ Wolf brand slider event listener added');
    } else {
        console.error('❌ Wolf brand slider not found');
    }
    
    if (wolfHivesSlider) {
        wolfHivesSlider.addEventListener('input', function() {
            console.log('🔥 Wolf hives slider changed to:', this.value);
            document.getElementById('wolf-honey-hives-value').textContent = this.value;
            createWolfHoneyChart();
        });
        console.log('✅ Wolf hives slider event listener added');
    } else {
        console.error('❌ Wolf hives slider not found');
    }
    
    // Обработчики для "Деснянского меда"
    const desnyanskyPriceSlider = document.getElementById('desnyansky-honey-price');
    const desnyanskyBrandSlider = document.getElementById('desnyansky-honey-brand-level');
    const desnyanskyHivesSlider = document.getElementById('desnyansky-honey-hives');
    
    console.log('Desnyansky sliders found:', {
        price: !!desnyanskyPriceSlider,
        brand: !!desnyanskyBrandSlider,
        hives: !!desnyanskyHivesSlider
    });
    
    if (desnyanskyPriceSlider) {
        desnyanskyPriceSlider.addEventListener('input', function() {
            console.log('🔥 Desnyansky price slider changed to:', this.value);
            document.getElementById('desnyansky-honey-price-value').textContent = `${this.value} руб.`;
            createDesnyanskyHoneyChart();
        });
        console.log('✅ Desnyansky price slider event listener added');
    } else {
        console.error('❌ Desnyansky price slider not found');
    }
    
    if (desnyanskyBrandSlider) {
        desnyanskyBrandSlider.addEventListener('input', function() {
            console.log('🔥 Desnyansky brand slider changed to:', this.value);
            document.getElementById('desnyansky-honey-brand-value').textContent = this.value;
            createDesnyanskyHoneyChart();
        });
        console.log('✅ Desnyansky brand slider event listener added');
    } else {
        console.error('❌ Desnyansky brand slider not found');
    }
    
    if (desnyanskyHivesSlider) {
        desnyanskyHivesSlider.addEventListener('input', function() {
            console.log('🔥 Desnyansky hives slider changed to:', this.value);
            document.getElementById('desnyansky-honey-hives-value').textContent = this.value;
            createDesnyanskyHoneyChart();
        });
        console.log('✅ Desnyansky hives slider event listener added');
    } else {
        console.error('❌ Desnyansky hives slider not found');
    }
    
    console.log('=== ОБРАБОТЧИКИ ПОЛЗУНКОВ НАСТРОЕНЫ ===');
}

// Получение информации о взятке для типа местности
function getNectarInfo(quality) {
    const nectarData = {
        excellent: {
            title: 'Отличное',
            score: 9,
            plants: [
                { name: 'Липа', nectar: '200-300 мг/день' },
                { name: 'Акация', nectar: '180-250 мг/день' },
                { name: 'Гречиха', nectar: '150-220 мг/день' },
                { name: 'Подсолнух', nectar: '120-200 мг/день' }
            ],
            recommendations: [
                'Идеальное место для коммерческого пчеловодства',
                'Высокая продуктивность в течение всего сезона',
                'Минимальные затраты на подкормку',
                'Отличные условия для зимовки пчел'
            ]
        },
        good: {
            title: 'Хорошее',
            score: 7,
            plants: [
                { name: 'Ива', nectar: '100-180 мг/день' },
                { name: 'Клен', nectar: '90-150 мг/день' },
                { name: 'Малина', nectar: '80-140 мг/день' },
                { name: 'Яблоня', nectar: '70-120 мг/день' }
            ],
            recommendations: [
                'Хорошие условия для пчеловодства',
                'Стабильный взяток весной и летом',
                'Рекомендуется дополнительная подкормка',
                'Подходит для начинающих пчеловодов'
            ]
        },
        average: {
            title: 'Среднее',
            score: 5,
            plants: [
                { name: 'Одуванчик', nectar: '40-80 мг/день' },
                { name: 'Клевер', nectar: '30-70 мг/день' },
                { name: 'Луговые травы', nectar: '20-60 мг/день' },
                { name: 'Дикорастущие', nectar: '10-40 мг/день' }
            ],
            recommendations: [
                'Приемлемые условия для пчеловодства',
                'Требуется интенсивная подкормка пчел',
                'Рекомендуется дополнительный взяток',
                'Подходит для хобби-пчеловодства'
            ]
        },
        poor: {
            title: 'Слабое',
            score: 3,
            plants: [
                { name: 'Редкие растения', nectar: '5-20 мг/день' },
                { name: 'Сорные травы', nectar: '0-15 мг/день' },
                { name: 'Хвойные', nectar: '0-10 мг/день' }
            ],
            recommendations: [
                'Не рекомендуется для коммерческого пчеловодства',
                'Обязательна постоянная подкормка',
                'Высокие затраты на содержание',
                'Подходит только для опытных пчеловодов'
            ]
        }
    };
    
    return nectarData[quality] || nectarData.average;
}

// Получение климатической информации
function getClimateInfo(lat, lon) {
    const climates = [
        { zone: 'Умеренно-континентальный', temperature: '15-18°C', precipitation: '600-700 мм' },
        { zone: 'Континентальный', temperature: '12-16°C', precipitation: '400-600 мм' },
        { zone: 'Умеренно-морской', temperature: '18-22°C', precipitation: '700-800 мм' },
        { zone: 'Резко-континентальный', temperature: '8-14°C', precipitation: '300-500 мм' }
    ];
    
    // Простая логика определения климата по координатам
    const hash = Math.abs(Math.sin(lat) * Math.cos(lon) * 1000);
    return climates[Math.floor(hash) % climates.length];
}

// Подтверждение выбора местности
function confirmLocationSelection() {
    if (window.selectedLocation) {
        // Сохраняем выбранную местность
        selectLocation(
            window.selectedLocation.lat,
            window.selectedLocation.lon,
            window.selectedLocation.city
        );
        closeModal();
    }
}

// Сохранение настроек
async function saveSettings(settings) {
    try {
        const response = await fetch('/game/save_settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Настройки сохранены!', 'success');
            window.location.href = '/game/main';
        } else {
            showNotification(data.error || 'Ошибка сохранения', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
        showNotification('Ошибка соединения', 'error');
    }
}

// Определение изображения вишни по месяцу
function getCherryImageByMonth(month) {
    // Март - весеннее пробуждение
    if (month === 2) return '/static/img/cherry-spring-removebg-preview.png';
    
    // Апрель/Май - цветение
    if (month === 3 || month === 4) return '/static/img/cherry-blooming-removebg-preview.png';
    
    // Июнь - раннее лето
    if (month === 5) return '/static/img/cherry-summer-removebg-preview.png';
    
    // Июль/Август - зрелое лето
    if (month === 6 || month === 7) return '/static/img/cherry-summer-1-removebg-preview.png';
    
    // Осень/Зима - период покоя
    return '/static/img/cherry-winter-removebg-preview.png';
}

// Обновление изображения вишни
function updateCherryImage() {
    const gameDate = getCurrentGameDate();
    if (!gameDate) return;
    
    const month = gameDate.getMonth();
    const cherryTree = document.querySelector('.cherry-tree');
    if (!cherryTree) return;
    
    const crown = cherryTree.querySelector('.tree-crown');
    if (!crown) return;
    
    const imageUrl = getCherryImageByMonth(month);
    crown.style.backgroundImage = `url(${imageUrl})`;
    crown.style.backgroundSize = 'cover';
    crown.style.backgroundPosition = 'center';
    crown.style.backgroundRepeat = 'no-repeat';
    
    console.log(`Обновлено изображение вишни для месяца ${month}: ${imageUrl}`);
}

// Инициализация системы сезонов
function initializeSeasonalSystem() {
    const gameDate = getCurrentGameDate();
    if (gameDate) {
        const season = getSeasonByMonth(gameDate.getMonth());
        applySeason(season);
        
        // Специально обновляем изображение вишни
        updateCherryImage();
    }
}

// Обновление сезонных деревьев
function updateSeasonalTrees() {
    const gameDate = getCurrentGameDate();
    if (!gameDate) return;
    
    const season = getSeasonByMonth(gameDate.getMonth());
    if (season !== currentSeason) {
        applySeason(season);
    }
    
    // Всегда обновляем изображение вишни
    updateCherryImage();
}

// Функция расчета пересечения прямоугольников
function getIntersectionArea(rect1, rect2) {
    const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
    const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
    return xOverlap * yOverlap;
}

// Функция расчета процента перекрытия солнца облаками
function calculateEclipsePercentage() {
    const sun = document.querySelector('.sun');
    const clouds = document.querySelectorAll('.cloud');
    const eclipseOverlay = document.querySelector('.eclipse-overlay');
    
    if (!sun || !eclipseOverlay) return;
    
    const sunRect = sun.getBoundingClientRect();
    const sunArea = (sunRect.right - sunRect.left) * (sunRect.bottom - sunRect.top);
    
    let totalIntersectionArea = 0;
    
    clouds.forEach(cloud => {
        const cloudRect = cloud.getBoundingClientRect();
        const intersectionArea = getIntersectionArea(sunRect, cloudRect);
        totalIntersectionArea += intersectionArea;
    });
    
    // Рассчитываем процент перекрытия (максимум 100%)
    const eclipsePercentage = Math.min(100, (totalIntersectionArea / sunArea) * 100);
    
    // Применяем плавное затемнение (максимум 85% затемнения)
    const maxDarkness = 0.85;
    const darkness = (eclipsePercentage / 100) * maxDarkness;
    
    if (eclipsePercentage > 0) {
        eclipseOverlay.style.opacity = darkness;
        eclipseOverlay.style.visibility = 'visible';
    } else {
        eclipseOverlay.style.opacity = 0;
        eclipseOverlay.style.visibility = 'hidden';
    }
}

// Запуск отслеживания затмения
function startEclipseTracking() {
    // Проверяем каждые 100 миллисекунд
    setInterval(calculateEclipsePercentage, 100);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    startEclipseTracking();
    initializeSeasonalSystem();
});

// Экспорт функций для глобального использования
window.GameAPI = {
    nextDay,
    takeCredit,
    repayCredit,
    feedHive,
    getHiveStats,
    getNectarProfile,
    showModal,
    closeModal,
    showNotification,
    startNewGame,
    saveSettings,
    updateCherryImage,
    registerUser,
    loginUser,
    openSettingsModalFromGame,
    showSettingsInfo,
    saveGameSettings
};

// Сохранение настроек из модального окна
function saveGameSettings(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const settings = {
        city: formData.get('city'),
        year: formData.get('year'),
        autoSave: document.getElementById('auto-save')?.checked || false,
        weatherReal: document.getElementById('weather-real')?.checked || false,
        showTutorials: document.getElementById('show-tutorials')?.checked || false,
        gameSpeed: formData.get('game-speed')
    };
    
    // Сохраняем настройки
    saveSettings(settings);
}

// Функция открытия модального окна настроек из основной игры
function openSettingsModalFromGame() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modal = modalOverlay.querySelector('.modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    // Устанавливаем класс для широкого модального окна
    modal.classList.add('settings-modal');
    
    // Устанавливаем заголовок
    modalTitle.textContent = 'Настройки пасеки';
    
    // Создаем содержимое модального окна
    modalBody.innerHTML = getSettingsModalContent();
    
    // Показываем модальное окно
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('show');
    
    // Инициализируем обработчики событий в модальном окне
    initializeSettingsModalHandlers();
}

// Функция показа информации о настройках
function showSettingsInfo() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modal = modalOverlay.querySelector('.modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    // Убираем класс широкого модального окна для информации
    modal.classList.remove('settings-modal');
    
    modalTitle.textContent = 'О настройках игры';
    modalBody.innerHTML = getSettingsInfoContent();
    
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('show');
}

// Содержимое модального окна настроек
function getSettingsModalContent() {
    return `
        <form id="settings-form" onsubmit="saveGameSettings(event)">
            <div class="form-group">
                <label for="city">Город:</label>
                <input type="text" id="city" name="city" class="form-control" 
                       value="${currentUser?.city || ''}" readonly>
                <small class="form-text">Город определяется по выбранному месту на карте</small>
            </div>
            
            <div class="form-group">
                <label for="year">Первый год игры:</label>
                <input type="number" id="year" name="year" class="form-control" 
                       value="${currentUser?.year || 2015}" min="2000" max="2030">
                <small class="form-text">Год начала игры (влияет на доступные технологии и условия)</small>
            </div>
            
            <div class="game-preview">
                <h4>Предварительный просмотр условий:</h4>
                <div class="preview-cards">
                    <div class="preview-card">
                        <h5>Климат и взяток</h5>
                        <div class="preview-stats">
                            <div class="stat">
                                <span class="stat-label">Базовый взяток:</span>
                                <span class="stat-value" id="preview-nectar">15-20 мг/сутки</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Сезон цветения:</span>
                                <span class="stat-value" id="preview-season">апрель-октябрь</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Основные медоносы:</span>
                                <span class="stat-value" id="preview-plants">липа, акация, гречиха</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preview-card">
                        <h5>Экономические условия</h5>
                        <div class="preview-stats">
                            <div class="stat">
                                <span class="stat-label">Стартовый капитал:</span>
                                <span class="stat-value">10,000 руб.</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Начальные улья:</span>
                                <span class="stat-value">4 улья</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Средняя цена меда:</span>
                                <span class="stat-value" id="preview-honey-price">400-600 руб/кг</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preview-card">
                        <h5>Технологии</h5>
                        <div class="preview-stats">
                            <div class="stat">
                                <span class="stat-label">Доступные инструменты:</span>
                                <span class="stat-value">медогонка, воскотопка</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Банковские услуги:</span>
                                <span class="stat-value">кредиты, депозиты</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Торговые площадки:</span>
                                <span class="stat-value">Авито, местные рынки</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="advanced-options">
                <h4>Дополнительные настройки:</h4>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="auto-save" checked>
                        Автосохранение каждый день
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="weather-real" checked>
                        Использовать реальные погодные данные
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="show-tutorials">
                        Показывать обучающие подсказки
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="game-speed">Скорость игры:</label>
                    <select id="game-speed" name="game-speed" class="form-control">
                        <option value="slow">Медленно (1 день = 30 сек)</option>
                        <option value="normal" selected>Нормально (1 день = 15 сек)</option>
                        <option value="fast">Быстро (1 день = 5 сек)</option>
                    </select>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    Сохранить настройки
                </button>
            </div>
        </form>
    `;
}

// Содержимое информационного окна
function getSettingsInfoContent() {
    return `
        <div class="info-content">
            <h4>О настройках игры</h4>
            <p><strong>Город</strong> определяет климатические условия и доступные медоносы для вашей пасеки.</p>
            
            <p><strong>Год начала игры</strong> влияет на доступные технологии, цены и экономические условия.</p>
            
            <p>Вы сможете изменить некоторые настройки позже в меню игры.</p>
            
            <div class="tips-panel">
                <h4>Советы для новичков</h4>
                <div class="tips-list">
                    <div class="tip">
                        <strong>Местоположение</strong>
                        <p>Выберите место с разнообразными медоносами для стабильного взятка.</p>
                    </div>
                    
                    <div class="tip">
                        <strong>Стартовый год</strong>
                        <p>Более ранние годы дают больше возможностей для развития, но меньше технологий.</p>
                    </div>
                    
                    <div class="tip">
                        <strong>Подготовка</strong>
                        <p>Изучите основы пчеловодства перед началом игры для лучших результатов.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Инициализация обработчиков событий в модальном окне настроек
function initializeSettingsModalHandlers() {
    const yearInput = document.getElementById('year');
    if (yearInput) {
        yearInput.addEventListener('change', function() {
            updatePreview();
        });
    }
    
    // Инициализация предварительного просмотра
    updatePreview();
}

// Обновление предварительного просмотра
function updatePreview() {
    const year = parseInt(document.getElementById('year')?.value || 2015);
    const city = document.getElementById('city')?.value || '';
    
    // Обновляем информацию о ценах в зависимости от года
    const honeyPrice = getHoneyPriceByYear(year);
    const priceElement = document.getElementById('preview-honey-price');
    if (priceElement) {
        priceElement.textContent = honeyPrice;
    }
    
    // Обновляем информацию о сезоне
    updateSeasonPreview(city);
}

function getHoneyPriceByYear(year) {
    if (year <= 1990) return "50-100 руб/кг";
    if (year <= 2000) return "100-200 руб/кг";
    if (year <= 2010) return "200-350 руб/кг";
    if (year <= 2020) return "350-500 руб/кг";
    return "500-800 руб/кг";
}

function updateSeasonPreview(city) {
    const seasonMap = {
        'Москва': 'май-сентябрь',
        'Сочи': 'апрель-октябрь',
        'Новосибирск': 'май-август',
        'Екатеринбург': 'май-сентябрь'
    };
    
    const season = seasonMap[city] || 'май-сентябрь';
    const seasonElement = document.getElementById('preview-season');
    if (seasonElement) {
        seasonElement.textContent = season;
    }
}

// Дополнительные стили для модального окна выбора местности
const locationModalStyles = `
<style>
.location-selection-modal {
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 2px solid #D2691E;
}

.tab-button {
    flex: 1;
    padding: 12px 20px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: 600;
    color: #8B4513;
    transition: all 0.3s ease;
}

.tab-button:hover {
    background: rgba(210, 105, 30, 0.1);
}

.tab-button.active {
    border-bottom-color: #D2691E;
    color: #D2691E;
    background: rgba(210, 105, 30, 0.1);
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.location-map-container {
    background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
    border: 3px solid #8B4513;
    border-radius: 15px;
    padding: 20px;
    text-align: center;
}

.map-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    background: #2F4F4F;
    padding: 8px;
    border-radius: 8px;
    margin: 0 auto 20px;
    max-width: 400px;
}

.map-cell {
    aspect-ratio: 1;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
}

.map-cell:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.map-cell.selected {
    transform: scale(1.1);
    box-shadow: 0 0 15px #FFD700;
    border: 2px solid #FFD700;
}

.map-cell.excellent {
    background: linear-gradient(45deg, #32CD32, #90EE90);
}

.map-cell.good {
    background: linear-gradient(45deg, #ADFF2F, #9ACD32);
}

.map-cell.average {
    background: linear-gradient(45deg, #DAA520, #F0E68C);
}

.map-cell.poor {
    background: linear-gradient(45deg, #DDA0DD, #DA70D6);
}

.cell-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
}

.map-legend {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    max-width: 400px;
    margin: 0 auto;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #2F4F4F;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid rgba(47, 79, 79, 0.3);
}

.legend-color.excellent {
    background: #32CD32;
}

.legend-color.good {
    background: #ADFF2F;
}

.legend-color.average {
    background: #DAA520;
}

.legend-color.poor {
    background: #DDA0DD;
}

.location-info-container {
    background: rgba(245, 230, 211, 0.9);
    border: 2px solid #8B4513;
    border-radius: 10px;
    padding: 20px;
    max-height: 500px;
    overflow-y: auto;
}

.location-summary {
    border-bottom: 2px solid #D2691E;
    padding-bottom: 15px;
    margin-bottom: 20px;
}

.location-summary h5 {
    color: #8B4513;
    margin-bottom: 10px;
    font-size: 20px;
}

.location-summary p {
    margin: 5px 0;
    color: #2F4F4F;
}

.location-stats {
    margin-bottom: 20px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(139, 69, 19, 0.2);
}

.stat-label {
    font-weight: 600;
    color: #2F4F4F;
}

.stat-value {
    color: #8B4513;
    font-weight: bold;
}

.nectar-excellent {
    color: #228B22;
}

.nectar-good {
    color: #32CD32;
}

.nectar-average {
    color: #DAA520;
}

.nectar-poor {
    color: #DC143C;
}

.nectar-plants {
    margin-bottom: 20px;
}

.nectar-plants h6 {
    color: #8B4513;
    margin-bottom: 15px;
    font-size: 16px;
}

.plants-grid {
    display: grid;
    gap: 8px;
}

.plant-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255,255,255,0.7);
    border: 1px solid #D2691E;
    border-radius: 6px;
}

.plant-name {
    font-weight: 600;
    color: #2F4F4F;
}

.plant-value {
    color: #8B4513;
    font-size: 12px;
}

.location-recommendations {
    background: rgba(255,255,255,0.7);
    border: 1px solid #D2691E;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.location-recommendations h6 {
    color: #8B4513;
    margin-bottom: 12px;
}

.location-recommendations ul {
    padding-left: 20px;
    margin: 0;
}

.location-recommendations li {
    margin: 8px 0;
    color: #2F4F4F;
    line-height: 1.4;
}

.location-quality-score {
    text-align: center;
}

.location-quality-score h6 {
    color: #8B4513;
    margin-bottom: 10px;
}

.quality-bar {
    width: 100%;
    height: 20px;
    background: rgba(255,255,255,0.7);
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #D2691E;
}

.quality-fill {
    height: 100%;
    transition: width 0.5s ease;
    border-radius: 10px;
}

.quality-fill.excellent {
    background: linear-gradient(90deg, #32CD32, #228B22);
}

.quality-fill.good {
    background: linear-gradient(90deg, #ADFF2F, #9ACD32);
}

.quality-fill.average {
    background: linear-gradient(90deg, #DAA520, #CD853F);
}

.quality-fill.poor {
    background: linear-gradient(90deg, #DDA0DD, #DA70D6);
}

.modal-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #D2691E;
}

.modal-actions .btn {
    min-width: 150px;
}

#confirm-location-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Устранение горизонтальной прокрутки */
body {
    overflow-x: hidden;
}

.location-selection-modal,
.location-map-container,
.location-info-container {
    max-width: 100%;
    box-sizing: border-box;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
    .location-selection-modal {
        margin: 10px;
        max-width: calc(100vw - 20px);
    }
    
    .map-grid {
        grid-template-columns: repeat(3, 1fr);
        max-width: 280px;
    }
    
    .map-legend {
        grid-template-columns: 1fr;
        gap: 8px;
    }
    
    .modal-tabs {
        flex-direction: column;
    }
    
    .tab-button {
        width: 100%;
    }
    
    .modal-actions {
        flex-direction: column;
    }
    
    .modal-actions .btn {
        width: 100%;
    }
}
</style>
`;

// Добавляем стили в head документа
document.head.insertAdjacentHTML('beforeend', locationModalStyles);