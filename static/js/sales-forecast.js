// JavaScript код для функции прогноза сбыта
// Отделен от main.js для лучшей архитектуры

// Функция отображения прогноза сбыта
async function showSalesForecast() {
    console.log('=== ОТКРЫТИЕ ПРОГНОЗА СБЫТА ===');
    try {
        const forecastContent = getSalesForecastContent();
        showModal('Прогноз сбыта', forecastContent);
        
        // Создаем графики после загрузки модального окна
        setTimeout(() => {
            console.log('Создаем графики прогноза сбыта...');
            createSalesForecastCharts();
        }, 100);
    } catch (error) {
        console.error('Ошибка при загрузке прогноза сбыта:', error);
        showModal('Прогноз сбыта', '<div class="error-message"><p>Ошибка загрузки прогноза сбыта. Попробуйте позже.</p></div>');
    }
}

// HTML контент для прогноза сбыта
function getSalesForecastContent() {
    console.log('Генерируем HTML контент для прогноза сбыта');
    return `
        <h4>Прогноз сбыта меда</h4>
        <div class="sales-forecast">
            <div class="forecast-tabs">
                <button class="tab-button active" onclick="switchForecastTab('wolf-honey')">
                    Бренд "Волчий мед"
                </button>
                <button class="tab-button" onclick="switchForecastTab('desnyansky-honey')">
                    Бренд "Деснянский мед"
                </button>
            </div>
            
            <!-- График 1: Волчий мед -->
            <div id="wolf-honey-tab" class="forecast-tab active">
                <div class="brand-header">
                    <h5>Бренд "Волчий мед"</h5>
                    <p class="brand-slogan">Собран там, где волки ходить боятся</p>
                </div>
                
                <div class="chart-container">
                    <canvas id="wolfHoneyChart" width="800" height="200"></canvas>
                    <div class="summary-panel">
                        <div class="summary-item">
                            <span class="summary-label">Меда собрано:</span>
                            <span id="wolf-honey-collected" class="summary-value">80 кг</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Заработано за год:</span>
                            <span id="wolf-honey-earned" class="summary-value">48,000 руб.</span>
                        </div>
                    </div>
                </div>
                
                <div class="controls-section">
                    <div class="control-group">
                        <label for="wolf-honey-price">Цена меда:</label>
                        <input type="range" id="wolf-honey-price" min="100" max="5000" value="600" class="slider">
                        <span id="wolf-honey-price-value" class="slider-value">600 руб.</span>
                    </div>
                    
                    <div class="control-group">
                        <label for="wolf-honey-brand-level">Уровень бренда:</label>
                        <input type="range" id="wolf-honey-brand-level" min="-10" max="100" value="30" class="slider">
                        <span id="wolf-honey-brand-value" class="slider-value">30</span>
                    </div>
                    
                    <div class="control-group">
                        <label for="wolf-honey-hives">Количество ульев:</label>
                        <input type="range" id="wolf-honey-hives" min="4" max="30" value="4" class="slider">
                        <span id="wolf-honey-hives-value" class="slider-value">4</span>
                    </div>
                </div>
                <p>&nbsp;<p>&nbsp;<p>&nbsp;<p>&nbsp;<p>&nbsp;<p>&nbsp;<p>&nbsp;<p>&nbsp;<p>&nbsp;

            </div>
            
            <!-- График 2: Деснянский мед -->
            <div id="desnyansky-honey-tab" class="forecast-tab">
                <div class="brand-header">
                    <h5>Бренд "Деснянский мед"</h5>
                    <p class="brand-slogan">Собран в экологически чистых местах</p>
                </div>
                
                <div class="chart-container">
                    <canvas id="desnyanskyHoneyChart" width="800" height="300"></canvas>
                    <div class="summary-panel">
                        <div class="summary-item">
                            <span class="summary-label">Меда собрано:</span>
                            <span id="desnyansky-honey-collected" class="summary-value">240 кг</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Заработано за год:</span>
                            <span id="desnyansky-honey-earned" class="summary-value">48,000 руб.</span>
                        </div>
                    </div>
                </div>
                
                <div class="controls-section">
                    <div class="control-group">
                        <label for="desnyansky-honey-price">Цена меда:</label>
                        <input type="range" id="desnyansky-honey-price" min="100" max="1000" value="200" class="slider">
                        <span id="desnyansky-honey-price-value" class="slider-value">200 руб.</span>
                    </div>
                    
                    <div class="control-group">
                        <label for="desnyansky-honey-brand-level">Уровень бренда:</label>
                        <input type="range" id="desnyansky-honey-brand-level" min="-30" max="30" value="0" class="slider">
                        <span id="desnyansky-honey-brand-value" class="slider-value">0</span>
                    </div>
                    
                    <div class="control-group">
                        <label for="desnyansky-honey-hives">Количество ульев:</label>
                        <input type="range" id="desnyansky-honey-hives" min="4" max="30" value="4" class="slider">
                        <span id="desnyansky-honey-hives-value" class="slider-value">4</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Переключение между вкладками прогноза сбыта
function switchForecastTab(tabName) {
    console.log('Переключение на вкладку:', tabName);
    
    // Скрываем все вкладки
    document.querySelectorAll('.forecast-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    const tabElement = document.getElementById(tabName + '-tab');
    if (tabElement) {
        tabElement.classList.add('active');
        console.log('Активирована вкладка:', tabName + '-tab');
    }
    
    // Добавляем активный класс к нажатой кнопке
    if (event && event.target) {
        event.target.classList.add('active');
        console.log('Активирована кнопка:', event.target.textContent);
    }
    
    // Пересоздаем график для активной вкладки
    setTimeout(() => {
        if (tabName === 'wolf-honey') {
            console.log('Создаем график Волчьего меда...');
            createWolfHoneyChart();
        } else if (tabName === 'desnyansky-honey') {
            console.log('Создаем график Деснянского меда...');
            createDesnyanskyHoneyChart();
        }
    }, 100);
}

// Создание обоих графиков прогноза сбыта
function createSalesForecastCharts() {
    console.log('=== СОЗДАНИЕ ОБОИХ ГРАФИКОВ ПРОГНОЗА СБЫТА ===');
    
    console.log('📊 Создаем график Волчьего меда...');
    createWolfHoneyChart();
    
    console.log('📊 Создаем график Деснянского меда...');
    createDesnyanskyHoneyChart();
    
    console.log('⚙️ Настраиваем обработчики ползунков...');
    setupForecastControls();
    
    console.log('=== ГРАФИКИ ПРОГНОЗА СБЫТА СОЗДАНЫ ===');
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
        console.log('Предыдущий график Волчьего меда уничтожен');
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
                    max: 840, // Фиксированный максимум для оси Y
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
    
    console.log('✅ График Волчьего меда создан');
    
    // Обновляем сводные данные
    updateWolfHoneySummary(recalculatedData, price, brandLevel, hivesCount);
}

// Пересчет данных для "Волчьего меда"
function recalculateWolfHoneyData(baseData, price, brandLevel) {
    const basePrice = 600;
    const criticalPrice = brandLevel * 30;
    
    console.log('Wolf Honey recalculation - Price:', price, 'Brand Level:', brandLevel, 'Critical Price:', criticalPrice);
    
    /* const baseData = [50, 30, 20, 10, 30, 40, 50, 60, 70, 30, 30, 30]; // апрель-март */
    return baseData.map(value => {
        /* кто-то отравился медом */
        if (brandLevel < 0) {
            if (price <= 200) {
                const result = 5 /* хоть кому-то продаст */
                return result;
            } else {
                const result = 0
                return result;
            }
        /* Санька-долбоеб, продаст половину от среднего, при половинной цене */
        } else if (brandLevel < 20) {
            if (price <= 300) {
                const result = value / 2;
                return result;
            } else {
                const result = value / 5; //соседка купит, в благодарность
                return result;
            }
        /* Петрович из Савички, самый обычный пчеловод "для себя"*/
        } else if (brandLevel < 40) {
            // демпинг
            if (price <= 300) {
                const result = value * 5; // никто особо Петровича не знает, но слухи о дешевом меде пошли, надо брать
                return result;
            } else if (price <= 600) { // обычные продажи Петровича
                const result = value;
                return result;
            } else if (price <= 1200) { // конечно немного дороговато, но это-же Петрович
                const result = value / 3;
                return result;
            } else if (price <= 2500) { // случайно заглянувшие москвичи
                const result = value / 6;
                return result;
            } else { // 
                const result = value / 10; // внуки: дед сбрендил, пусть копеечку какую заработает
                return result;
            }

        /* муниципальный уровень спроса - провоцируем на переход на этот уровень, немножко в рекламу вложились */
        } else if (brandLevel < 60) {
            // демпинг
            if (price <= 300) {
                const result = value * 10; // Петровича знают, видимо распродает, надо брать, брать
                return result;
            } else if (price <= 600) { // обычные продажи Петровича с рекламой
                const result = value * 3;
                return result;
            } else if (price <= 1200) { // реальная цена Петровича
                const result = value * 15;
                return result;
            } else if (price <= 2500) { // заинтересованные москвичи
                const result = value * 4;
                return result;
            } else { // 
                const result = value / 10; // случайно заглянувшие богатые москвичи
                return result;
            }

        /* региональный уровень спроса */
        } else if (brandLevel < 80) {
            // демпинг
            if (price <= 300) {
                const result = value * 15; // оптовики у Николая Петровича берут на перепродажу
                return result;
            } else if (price <= 600) { // обычные продажи Петровича с рекламой
                const result = value * 10;
                return result;
            } else if (price <= 1200) { // реальная цена бренда "Волчий мед"
                const result = value * 14;
                return result;
            } else if (price <= 2500) { // заинтересованные богатые москвичи, московские кофейни и магазины ЗОЖ
                const result = value * 5;
                return result;
            } else { // 
                const result = value; // не, товар видимо хорош, но не по такой цене
                return result;
            }
        /* всероссийский уровень*/
        } else if (brandLevel < 90) {
            // демпинг
            if (price <= 300) {
                const result = value * 5; // не может быть такая цена, ладно, а вдруг скидка какая
                return result;
            } else if (price <= 600) { // оптовики берут на перепродажу бренда "Волчий мед"
                const result = value * 15;
                return result;
            } else if (price <= 1200) { // розничная цена бренда "Волчий мед"
                const result = value * 16;
                return result;
            } else if (price <= 2500) { // розничная цена бренда "Волчий мед" для пафосных ребят
                const result = value * 10;
                return result;
            } else if (price <= 4000) { // на стол губернатора
                const result = value;
                return result;
            } else { // 
                const result = value; // я хз, кто такое покупает
                return result;
            }        
        //международный уровень, наш мед хвалят английские короли и бывшие королевы, 6 звезд
        } else {
            // демпинг
            if (price <= 1000) {
                const result = 0; // нет таких цен
                return result;
            } else if (price <= 2000) { // оптовики и рестораны "Мишлен" берут на перепродажу VIP бренд "Волчий мед"
                const result = value * 15;
                return result;
            } else if (price <= 3000) { // розничная цена VIP бренда "Волчий мед"
                const result = value * 10;
                return result;
            } else if (price <= 4000) { // бьюти-блогеры делятся с девочками секретами успешного успеха, с чашечкой зеленого малазийского чая и ложечкой меда VIP бренда "Волчий мед" 
                const result = value * 5;
                return result;
            } else { // 
                const result = value; // мы едем в Дубай презентовать "Gold Wolf Honey 1889"
                return result;
            }        


        }

    });
}


// Обновление сводных данных для "Волчьего меда"
function updateWolfHoneySummary(chartData, price, brandLevel, hivesCount) {
    // собрано с ульев
    const honeyCollected = hivesCount * 20;
    // может продать
    const totalDemand = chartData.reduce((sum, value) => sum + value, 0);
    console.log('может продать:', totalDemand);
    
    let earned;
    // все продаст
    if (totalDemand > honeyCollected) {
        earned = honeyCollected * price - hivesCount * 2000;
    } else {
        earned = totalDemand * price - hivesCount * 2000;
    }
    
    if (brandLevel < 60) {
        earned = earned - brandLevel * 100
    } else if (brandLevel < 80){
        earned = earned - brandLevel * 500
    } else {
        earned = earned - brandLevel * 1000
    }
    const collectedElement = document.getElementById('wolf-honey-collected');
    const earnedElement = document.getElementById('wolf-honey-earned');
    
    if (collectedElement) {
        collectedElement.textContent = `${honeyCollected} кг`;
    }
    if (earnedElement) {
        earnedElement.textContent = `${earned.toLocaleString()} руб.`;
    }
    
    console.log('Wolf Honey Summary - Собрано:', honeyCollected, 'Заработано:', earned);
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
        console.log('Предыдущий график Деснянского меда уничтожен');
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
    
    console.log('✅ График Деснянского меда создан');
    
    // Обновляем сводные данные
    updateDesnyanskyHoneySummary(recalculatedData, price, brandLevel, hivesCount);
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
    
    const collectedElement = document.getElementById('desnyansky-honey-collected');
    const earnedElement = document.getElementById('desnyansky-honey-earned');
    
    if (collectedElement) {
        collectedElement.textContent = `${honeyCollected} кг`;
    }
    if (earnedElement) {
        earnedElement.textContent = `${earned.toLocaleString()} руб.`;
    }
    
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

// Экспорт функций в глобальную область видимости для доступности из HTML
window.showSalesForecast = showSalesForecast;