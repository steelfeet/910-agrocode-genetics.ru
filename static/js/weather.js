// Система управления погодой и ветром
let weatherSystem = {
    wind: {
        force: 0,           // Сила ветра (1-10)
        direction: '',      // Направление ветра
        directionGroup: '', // Группа направлений (left-to-right или right-to-left)
        isActive: false     // Активен ли ветер
    },
    weather: {
        type: 'sunny',      // Тип погоды: 'sunny', 'cloudy', 'rainy'
        name: 'Ясно'        // Название погоды для отображения
    },
    
    // Инициализация системы ветра
    initialize() {
        this.generateDailyWind();
        this.generateDailyWeather();
        this.updateWeatherDisplay();
        this.applyWeatherEffects();
        console.log('🌪️ Система погоды инициализирована:', { wind: this.wind, weather: this.weather });
    },
    
    // Генерация случайного ветра на день
    generateDailyWind() {
        // Случайная сила ветра от 1 до 10
        this.wind.force = Math.floor(Math.random() * 10) + 1;
        
        // Случайное направление из списка
        const directions = ['С', 'С/З', 'С/В', 'Ю', 'Ю/З', 'Ю/В'];
        this.wind.direction = directions[Math.floor(Math.random() * directions.length)];
        
        // Определяем группу направлений
        const leftToRight = ['С', 'С/З', 'С/В']; // Справа налево
        const rightToLeft = ['Ю', 'Ю/З', 'Ю/В']; // Слева направо
        
        if (leftToRight.includes(this.wind.direction)) {
            this.wind.directionGroup = 'right-to-left';
        } else {
            this.wind.directionGroup = 'left-to-right';
        }
        
        // Ветер активен только если сила больше 3
        this.wind.isActive = this.wind.force > 3;
        
        console.log(`🌪️ Новый ветер: ${this.wind.direction} (${this.wind.directionGroup}), сила: ${this.wind.force}`);
    },
    
    // Генерация случайного типа погоды на день
    generateDailyWeather() {
        const weatherTypes = [
            { type: 'sunny', name: 'Ясно', weight: 60 },  // 60% вероятность
            { type: 'cloudy', name: 'Пасмурно', weight: 30 }, // 30% вероятность
            { type: 'rainy', name: 'Дождь', weight: 10 }  // 10% вероятность
        ];
        
        // Выбираем случайный тип погоды с учетом веса
        const totalWeight = weatherTypes.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const weather of weatherTypes) {
            if (random < weather.weight) {
                this.weather.type = weather.type;
                this.weather.name = weather.name;
                break;
            }
            random -= weather.weight;
        }
        
        console.log(`🌤️ Новая погода: ${this.weather.name} (${this.weather.type})`);
    },
    
    // Обновление отображения погоды в интерфейсе
    updateWeatherDisplay() {
        const gameInfo = document.querySelector('.game-info');
        if (!gameInfo) return;
        
        // Обновляем отображение ветра
        this.updateWindDisplay();
        
        // Проверяем, есть ли уже элемент погоды
        let weatherElement = gameInfo.querySelector('.weather-info');
        if (!weatherElement) {
            weatherElement = document.createElement('span');
            weatherElement.className = 'weather-info';
            gameInfo.appendChild(weatherElement);
        }
        
        // Формируем текст отображения погоды
        const weatherIcon = this.getWeatherIcon(this.weather.type);
        const weatherText = `${weatherIcon} ${this.weather.name}`;
        
        weatherElement.textContent = weatherText;
        weatherElement.title = `Тип погоды: ${this.weather.name}\nВлияние на игру:\n- Облака: ${this.getCloudMultiplier()}x\n- Пчелы: ${this.getBeeActivity()}`;
        
        // Добавляем CSS класс в зависимости от типа погоды
        weatherElement.className = `weather-info weather-${this.weather.type}`;
    },

    // Обновление отображения ветра в интерфейсе
    updateWindDisplay() {
        const gameInfo = document.querySelector('.game-info');
        if (!gameInfo) return;
        
        // Проверяем, есть ли уже элемент ветра
        let windElement = gameInfo.querySelector('.wind-info');
        if (!windElement) {
            windElement = document.createElement('span');
            windElement.className = 'wind-info';
            gameInfo.appendChild(windElement);
        }
        
        // Формируем текст отображения ветра
        const directionSymbol = this.getWindDirectionSymbol(this.wind.direction);
        const forceText = `Ветер: ${directionSymbol} ${this.wind.direction} ${this.wind.force}/10`;
        
        windElement.textContent = forceText;
        windElement.title = `Направление: ${this.wind.direction}\nСила: ${this.wind.force} из 10\nГруппа: ${this.wind.directionGroup}`;
        
        // Добавляем CSS класс в зависимости от силы ветра
        windElement.className = `wind-info wind-force-${this.wind.force}`;
    },
    
    // Получение символа для направления ветра
    getWindDirectionSymbol(direction) {
        const symbols = {
            'С': '↓',     // Север - вниз (справа налево)
            'С/З': '↙',   // Северо-запад - вниз-влево (справа налево)
            'С/В': '↘',   // Северо-восток - вниз-вправо (справа налево)
            'Ю': '↑',     // Юг - вверх (слева направо)
            'Ю/З': '↖',   // Юго-запад - вверх-влево (слева направо)
            'Ю/В': '↗'    // Юго-восток - вверх-вправо (слева направо)
        };
        return symbols[direction] || '↔';
    },
    
    // Получение иконки для типа погоды
    getWeatherIcon(weatherType) {
        const icons = {
            'sunny': '☀️',   // Ясно
            'cloudy': '☁️',  // Пасмурно
            'rainy': '🌧️'   // Дождь
        };
        return icons[weatherType] || '☀️';
    },
    
    // Получение множителя количества облаков
    getCloudMultiplier() {
        const multipliers = {
            'sunny': 1,     // Ясно - обычное количество
            'cloudy': 5,    // Пасмурно - в 5 раз больше (было 3)
            'rainy': 10     // Дождь - в 10 раз больше
        };
        return multipliers[this.weather.type] || 1;
    },
    
    // Получение информации о активности пчел
    getBeeActivity() {
        const activities = {
            'sunny': 'нормальная',
            'cloudy': 'сниженная',
            'rainy': 'отсутствует'
        };
        return activities[this.weather.type] || 'нормальная';
    },
    
    // Применение всех эффектов погоды
    applyWeatherEffects() {
        this.applyWindToTrees();
        this.applyWindToBees();
        this.applyWindToClouds();
        this.applyWeatherToClouds();
        this.applyWeatherToBees();
        this.applyWeatherVisualEffects();
    },

    // Применение визуальных эффектов погоды
    applyWeatherVisualEffects() {
        this.createRainEffect();
    },
    
    // Применение эффектов ветра к деревьям и пчелам
    applyWindEffects() {
        this.applyWindToTrees();
        this.applyWindToBees();
        this.applyWindToClouds();
    },
    
    // Применение ветра к деревьям (изменение анимаций раскачивания от основания)
    applyWindToTrees() {
        const trees = document.querySelectorAll('.tree');
        trees.forEach((tree, index) => {
            const crown = tree.querySelector('.tree-crown');
            if (!crown) return;
            
            if (this.wind.isActive) {
                // Усиливаем анимацию в зависимости от силы ветра
                const windIntensity = this.wind.force / 10; // 0.1 - 1.0
                const swayAmplitude = this.wind.force * 0.5; // Усиление амплитуды
                const swayOffset = this.wind.force * 0.8; // Смещение от ветра
                
                // Расссинхронизация качания при сильном ветре
                const windForce = this.wind.force;
                let animationDelay = '0s';
                let animationDuration = '6s';
                
                if (windForce >= 6) {
                    // При сильном ветре (6+) добавляем случайную задержку и вариацию скорости
                    const randomDelay = (Math.random() * 3 - 1.5).toFixed(1); // Уменьшено до -1.5 до +1.5 секунд
                    const randomDuration = (5.8 + Math.random() * 1.4).toFixed(1); // 5.8-7.2 секунд (меньше вариации)
                    animationDelay = `${randomDelay}s`;
                    animationDuration = `${randomDuration}s`;
                    
                    // Дополнительная расссинхронизация для очень сильного ветра
                    if (windForce >= 8) {
                        const additionalPhase = Math.random() * 0.2; // Еще больше уменьшено до 0-0.2 градусов
                        crown.style.setProperty('--phase-offset', `${additionalPhase}deg`);
                    }
                }
                
                crown.style.setProperty('--wind-intensity', windIntensity);
                crown.style.setProperty('--sway-amplitude', `${swayAmplitude}deg`);
                crown.style.setProperty('--sway-offset', `${swayOffset}px`);
                crown.style.setProperty('--sway-direction', this.wind.directionGroup === 'right-to-left' ? '-1' : '1');
                crown.style.setProperty('--animation-delay', animationDelay);
                crown.style.setProperty('--animation-duration', animationDuration);
                
                // Убеждаемся, что точка вращения - основание дерева
                crown.style.transformOrigin = '50% 100%';
                
                // Применяем стили расссинхронизации
                if (windForce >= 6) {
                    // Проверяем корректность значений перед применением
                    const delayValue = parseFloat(animationDelay);
                    const durationValue = parseFloat(animationDuration);
                    
                    if (Math.abs(delayValue) <= 2 && durationValue >= 4 && durationValue <= 10) {
                        crown.style.animationDelay = animationDelay;
                        crown.style.animationDuration = animationDuration;
                        
                        // Логирование для отладки
                        if (windForce >= 8) {
                            console.log(`🌳 Дерево ${index + 1}: ветер ${windForce}, задержка ${animationDelay}, длительность ${animationDuration}s`);
                        }
                    } else {
                        console.warn(`⚠️ Некорректные значения анимации для дерева ${index + 1}: задержка ${animationDelay}, длительность ${animationDuration}s`);
                    }
                    
                    crown.classList.add('wind-desync');
                } else {
                    crown.classList.remove('wind-desync');
                    crown.style.removeProperty('--phase-offset');
                    // Сбрасываем анимацию к базовым значениям при слабом ветре
                    crown.style.animationDelay = '0s';
                    crown.style.animationDuration = '';
                }
                
                crown.classList.add('wind-affected');
            } else {
                crown.classList.remove('wind-affected');
                crown.classList.remove('wind-desync');
                crown.style.removeProperty('--wind-intensity');
                crown.style.removeProperty('--sway-amplitude');
                crown.style.removeProperty('--sway-offset');
                crown.style.removeProperty('--sway-direction');
                crown.style.removeProperty('--animation-delay');
                crown.style.removeProperty('--animation-duration');
                crown.style.removeProperty('--phase-offset');
                crown.style.animationDelay = '0s';
                crown.style.animationDuration = '';
            }
        });
        
        console.log(`🌳 Применены эффекты ветра к ${trees.length} деревьям с расссинхронизацией`);
    },
    
    // Применение ветра к пчелам (изменение количества и траектории полета)
    applyWindToBees() {
        if (typeof beeFlightSystem !== 'undefined') {
            // Изменяем максимальное количество пчел в зависимости от ветра
            // Чем сильнее ветер, тем меньше пчел вылетает
            const baseMaxBees = 20;
            const windReduction = this.wind.force * 1.5; // Снижение на 1.5 пчелы за каждый балл ветра
            beeFlightSystem.maxBees = Math.max(5, baseMaxBees - windReduction);
            
            // Добавляем смещение траектории полета в зависимости от направления ветра
            beeFlightSystem.windOffset = {
                x: this.getWindOffsetX(),
                y: this.getWindOffsetY()
            };
            
            console.log(`🐝 Применены эффекты ветра к пчелам: max=${beeFlightSystem.maxBees}, offset=${JSON.stringify(beeFlightSystem.windOffset)}`);
        }
    },
    
    // Применение ветра к облакам (изменение скорости движения)
    applyWindToClouds() {
        const clouds = document.querySelectorAll('.cloud');
        if (clouds.length === 0) return;
        
        // Базовые скорости движения облаков (в секундах)
        const baseDurations = [60, 70, 80]; // для cloud-1, cloud-2, cloud-3
        
        clouds.forEach((cloud, index) => {
            if (index < baseDurations.length) {
                const baseDuration = baseDurations[index];
                const windForce = this.wind.force;
                
                if (this.wind.isActive && windForce >= 4) {
                    // При активном ветре (4+) изменяем скорость
                    // При сильном ветре облака движутся значительно быстрее (до 5 раз)
                    // При умеренном ветре - медленнее (больше времени)
                    const windMultiplier = 1 + (windForce - 5) * 0.8; // Увеличенный разброс: до 5x при ветре 10
                    const newDuration = Math.max(12, baseDuration / windMultiplier); // Минимум 12 секунд (5x быстрее)
                    
                    // Применяем новую скорость
                    cloud.style.animationDuration = `${newDuration.toFixed(1)}s`;
                    
                    // Логирование при сильном ветре для отладки
                    if (windForce >= 7) {
                        const speedIncrease = (baseDuration / newDuration).toFixed(1);
                        console.log(`☁️ Облако ${index + 1}: ветер ${windForce}, скорость ${newDuration.toFixed(1)}s (базовая: ${baseDuration}s, ускорение: ${speedIncrease}x)`);
                    }
                } else {
                    // При слабом ветре возвращаем к базовой скорости
                    cloud.style.animationDuration = `${baseDuration}s`;
                }
            }
        });
        
        console.log(`☁️ Применены эффекты ветра к ${clouds.length} облакам`);
    },
    
    // Применение погоды к облакам (изменение количества)
    applyWeatherToClouds() {
        const sky = document.querySelector('.sky');
        if (!sky) return;
        
        // Удаляем существующие дополнительные облака
        const extraClouds = sky.querySelectorAll('.cloud-extra');
        extraClouds.forEach(cloud => cloud.remove());
        
        // Создаем дополнительные облака в зависимости от погоды
        const multiplier = this.getCloudMultiplier();
        const baseCloudCount = 3; // У нас уже есть 3 базовых облака
        const extraCount = (baseCloudCount * multiplier) - baseCloudCount;
        
        for (let i = 0; i < extraCount; i++) {
            this.createExtraCloud(sky, i + 1);
        }
        
        console.log(`☁️ Погода "${this.weather.name}": ${extraCount} дополнительных облаков (всего: ${baseCloudCount + extraCount})`);
    },
    
    // Создание дополнительного облака
    createExtraCloud(sky, index) {
        const cloud = document.createElement('div');
        cloud.className = `cloud cloud-extra cloud-extra-${index}`;
        
        // Случайные размеры и позиция
        const width = Math.floor(Math.random() * 80) + 60; // 60-140px
        const height = Math.floor(Math.random() * 30) + 40; // 40-70px
        const top = Math.floor(Math.random() * 30) + 20; // 20-50% от верха
        
        cloud.style.width = `${width}px`;
        cloud.style.height = `${height}px`;
        cloud.style.top = `${top}%`;
        cloud.style.left = '-200px';
        cloud.style.opacity = '0.8';
        
        // Случайная скорость движения
        const duration = Math.floor(Math.random() * 40) + 40; // 40-80 секунд
        const delay = Math.floor(Math.random() * 60) - 30; // -30 до +30 секунд задержки
        cloud.style.animationDuration = `${duration}s`;
        cloud.style.animationDelay = `${delay}s`;
        
        // Добавляем базовые стили облака
        cloud.style.position = 'absolute';
        cloud.style.background = 'white';
        cloud.style.borderRadius = '50px';
        cloud.style.animation = 'cloud-move linear infinite';
        
        sky.appendChild(cloud);
    },
    
    // Применение погоды к пчелам (изменение активности)
    applyWeatherToBees() {
        if (typeof beeFlightSystem === 'undefined') return;
        
        const multiplier = this.getCloudMultiplier();
        
        // Изменяем максимальное количество пчел в зависимости от погоды
        let beeMultiplier = 1;
        if (this.weather.type === 'cloudy') {
            beeMultiplier = 0.3; // При пасмурной погоде пчел в 3 раза меньше
        } else if (this.weather.type === 'rainy') {
            beeMultiplier = 0; // При дожде пчелы не вылетают
        }
        
        // Применяем множитель к базовому максимуму
        const baseMaxBees = 20;
        const windReduction = this.wind.force * 1.5;
        const windAdjustedMax = Math.max(5, baseMaxBees - windReduction);
        beeFlightSystem.maxBees = Math.floor(windAdjustedMax * beeMultiplier);
        
        // При дожде полностью останавливаем систему
        if (this.weather.type === 'rainy') {
            this.stopBeeFlight();
        } else {
            this.startBeeFlightIfNeeded();
        }
        
        console.log(`🐝 Погода "${this.weather.name}": множитель пчел ${beeMultiplier}, максимум ${beeFlightSystem.maxBees}`);
    },
    
    // Остановка полета пчел (для дождя)
    stopBeeFlight() {
        if (typeof beeFlightSystem !== 'undefined') {
            beeFlightSystem.isActive = false;
        }
    },

    // Запуск полета пчел при необходимости
    startBeeFlightIfNeeded() {
        if (typeof beeFlightSystem !== 'undefined' && 
            beeFlightSystem.maxBees > 0 && 
            (currentSeason === 'spring' || currentSeason === 'summer')) {
            beeFlightSystem.isActive = true;
        }
    },
    
    // Создание эффекта дождя
    createRainEffect() {
        // Удаляем существующий эффект дождя
        this.removeRainEffect();
        
        // Создаем эффект дождя только при дожде
        if (this.weather.type === 'rainy') {
            const rainContainer = document.createElement('div');
            rainContainer.className = 'rain-effect';
            
            // Создаем капли дождя
            const dropCount = 100; // Количество капель
            for (let i = 0; i < dropCount; i++) {
                const raindrop = document.createElement('div');
                raindrop.className = 'raindrop';
                
                // Случайная позиция по горизонтали
                raindrop.style.left = Math.random() * 100 + '%';
                
                // Случайная задержка анимации
                raindrop.style.animationDelay = Math.random() * 2 + 's';
                
                // Случайная длительность анимации
                raindrop.style.animationDuration = (Math.random() * 1 + 1.5) + 's';
                
                // Случайная высота капли
                raindrop.style.height = (Math.random() * 10 + 15) + 'px';
                
                rainContainer.appendChild(raindrop);
            }
            
            // Добавляем эффект ряби на земле
            const ripple = document.createElement('div');
            ripple.className = 'rain-ripple';
            rainContainer.appendChild(ripple);
            
            // Добавляем контейнер в body
            document.body.appendChild(rainContainer);
            
            console.log('🌧️ Эффект дождя создан');
        }
    },
    
    // Удаление эффекта дождя
    removeRainEffect() {
        const existingRain = document.querySelector('.rain-effect');
        if (existingRain) {
            existingRain.remove();
            console.log('🌧️ Эффект дождя удален');
        }
    },
    
    // Получение смещения по X в зависимости от направления ветра
    getWindOffsetX() {
        if (!this.wind.isActive) return 0;
        
        const force = this.wind.force;
        switch (this.wind.directionGroup) {
            case 'right-to-left': // Северные направления - ветер справа налево
                return -force * 0.5; // Смещение влево
            case 'left-to-right': // Южные направления - ветер слева направо  
                return force * 0.5;  // Смещение вправо
            default:
                return 0;
        }
    },
    
    // Получение смещения по Y в зависимости от направления ветра
    getWindOffsetY() {
        if (!this.wind.isActive) return 0;
        
        const force = this.wind.force;
        switch (this.wind.direction) {
            case 'С':
                return force * 0.3;  // Север - ветер вниз
            case 'Ю':
                return -force * 0.3; // Юг - ветер вверх
            case 'С/З':
            case 'Ю/З':
                return -force * 0.2; // Западные направления - легкий ветер вверх
            case 'С/В':
            case 'Ю/В':
                return force * 0.2;  // Восточные направления - легкий ветер вниз
            default:
                return 0;
        }
    },
    
    // Получение текущих данных о ветре
    getWindData() {
        return { ...this.wind };
    },
    
    // Принудительное обновление ветра (для тестирования)
    setWindData(force, direction) {
        this.wind.force = force;
        this.wind.direction = direction;
        
        // Пересчитываем группу направлений
        const leftToRight = ['С', 'С/З', 'С/В'];
        this.wind.directionGroup = leftToRight.includes(direction) ? 'right-to-left' : 'left-to-right';
        this.wind.isActive = force > 3;
        
        this.updateWeatherDisplay();
        this.applyWeatherEffects();
    }
};

// Инициализация системы ветра при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    if (typeof weatherSystem !== 'undefined') {
        weatherSystem.initialize();
    }
});

// Экспорт для использования в других скриптах
window.weatherSystem = weatherSystem;