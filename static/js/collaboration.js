// JavaScript для функций коллабораций

/**
 * Функция для создания контента модального окна "Коллаборации"
 */
function getCollaborationContent() {
    return `
        <h4>Коллаборации</h4>
        <div class="collaboration-summary">
            <div class="summary-row">
                <strong>Суммарно:</strong> 
                <span id="total-cost">0</span> р. в месяц; 
                <span id="total-effort">0</span> ч.в сутки
            </div>
        </div>
        
        <div class="collaboration-table">
            <div class="table-header">
                <div class="col-description">Описание маркетинговых работ</div>
                <div class="col-cost">Стоимость работы (руб.)</div>
                <div class="col-effort">Трудозатраты (часы)</div>
            </div>
            
            <div class="table-section">
                <div class="section-title">Свой сайт:</div>
                <div class="table-row">
                    <div class="col-description">создание</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="50000" data-effort="6" onchange="updateCollaborationTotals()">
                            50 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>6 ч.</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">администрирование</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="8000" data-effort="1" onchange="updateCollaborationTotals()">
                            8 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>1 ч.</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">наполнение</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="20000" data-effort="3" onchange="updateCollaborationTotals()">
                            20 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>3 ч.</span>
                    </div>
                </div>
            </div>
            
            <div class="table-section">
                <div class="section-title">Контент:</div>
                <div class="table-row">
                    <div class="col-description">текст</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="20000" data-effort="28" onchange="updateCollaborationTotals()">
                            20 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>28 ч.</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">видео</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="50000" data-effort="56" onchange="updateCollaborationTotals()">
                            50 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>56 ч.</span>
                    </div>
                </div>
            </div>
            
            <div class="table-section">
                <div class="section-title">Группы в соцсетях:</div>
                <div class="table-row">
                    <div class="col-description">1. Красота без границ (1,1 млн)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="50000" data-effort="0" onchange="updateCollaborationTotals()">
                            50 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">2. Идеал красоты (720 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="30000" data-effort="0" onchange="updateCollaborationTotals()">
                            30 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">3. Магия макияжа (340 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="35000" data-effort="0" onchange="updateCollaborationTotals()">
                            35 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">4. Стильные метаморфозы (320 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="12000" data-effort="0" onchange="updateCollaborationTotals()">
                            12 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">5. Искусство быть красивой (32 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="1000" data-effort="0" onchange="updateCollaborationTotals()">
                            1 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
            </div>
            
            <div class="table-section">
                <div class="section-title">Посты у блогеров:</div>
                <div class="table-row">
                    <div class="col-description">1. FitLife_Guru (1,2 млн)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="70000" data-effort="0" onchange="updateCollaborationTotals()">
                            70 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">2. EcoEnergie (840 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="20000" data-effort="6" onchange="updateCollaborationTotals()">
                            20 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>6 ч.</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">3. ZOJ_Power (510 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="10000" data-effort="18" onchange="updateCollaborationTotals()">
                            10 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>18 ч.</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">4. HealthyHarmony (40 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="2000" data-effort="6" onchange="updateCollaborationTotals()">
                            2 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>6 ч.</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">5. GreenBodyMind (30 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="20000" data-effort="0" onchange="updateCollaborationTotals()">
                            20 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
            </div>
            
            <div class="table-section">
                <div class="section-title">Местные СМИ:</div>
                <div class="table-row">
                    <div class="col-description">1. Маяк (20 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="7000" data-effort="0" onchange="updateCollaborationTotals()">
                            7 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">2. Зов Ильича (2 т.)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="70000" data-effort="36" onchange="updateCollaborationTotals()">
                            70 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>36 ч.</span>
                    </div>
                </div>
            </div>
            
            <div class="table-section">
                <div class="section-title">Всероссийские СМИ:</div>
                <div class="table-row">
                    <div class="col-description">1. RBC (3,2 млн)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="170000" data-effort="0" onchange="updateCollaborationTotals()">
                            170 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">2. Lenta.ru (23,7 млн)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="200000" data-effort="0" onchange="updateCollaborationTotals()">
                            200 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">3. Panorama (15,6 млн)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="10000" data-effort="0" onchange="updateCollaborationTotals()">
                            10 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">4. Yaplakal (56 млн)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="20000" data-effort="0" onchange="updateCollaborationTotals()">
                            20 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
                <div class="table-row">
                    <div class="col-description">5. Habr.com (7 млн)</div>
                    <div class="col-cost">
                        <label class="checkbox-label">
                            <input type="checkbox" data-cost="120000" data-effort="0" onchange="updateCollaborationTotals()">
                            120 000 р.
                        </label>
                    </div>
                    <div class="col-effort">
                        <span>-</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Функция для обновления суммарных значений коллабораций
 */
function updateCollaborationTotals() {
    let totalCost = 0;
    let totalEffort = 0;
    
    // Получаем все чекбоксы в таблице коллабораций
    const checkboxes = document.querySelectorAll('.collaboration-table input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        totalCost += parseInt(checkbox.getAttribute('data-cost')) || 0;
        totalEffort += parseInt(checkbox.getAttribute('data-effort')) || 0;
    });
    
    // Обновляем отображение суммарных значений
    const totalCostElement = document.getElementById('total-cost');
    const totalEffortElement = document.getElementById('total-effort');
    
    if (totalCostElement) {
        totalCostElement.textContent = totalCost.toLocaleString('ru-RU');
    }
    
    if (totalEffortElement) {
        totalEffortElement.textContent = totalEffort;
    }
}

/**
 * Инициализация обработчиков событий для коллабораций
 */
document.addEventListener('DOMContentLoaded', function() {
    // Если модальное окно коллабораций открывается, инициализируем обработчики
    $(document).on('shown.bs.modal', '.modal', function() {
        const modalTitle = $('.modal-title').text();
        if (modalTitle.includes('Коллаборации')) {
            // Пересчитываем суммарные значения при открытии модального окна
            setTimeout(updateCollaborationTotals, 100);
        }
    });
});