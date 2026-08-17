// Ждём, пока загрузится весь HTML
document.addEventListener('DOMContentLoaded', function() {

    // ----- 1. Переключение страниц по кнопкам с data-target -----
    document.querySelectorAll('[data-target]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var targetId = this.getAttribute('data-target');
            var targetPage = document.getElementById(targetId);
            if (targetPage) {
                // Запоминаем выбор торта, если мы на second-question
                var currentPage = document.querySelector('.page.active');
                if (currentPage && currentPage.id === 'second-question') {
                    var choice = this.getAttribute('data-choice');
                    if (choice) {
                        var bakingPage = document.getElementById('baking');
                        if (bakingPage) {
                            bakingPage.dataset.selectedChoice = choice;
                        }
                    }
                }

                // Если уходим со страницы baking, очищаем таймер
                if (currentPage && currentPage.id === 'baking') {
                    if (bakingTimer) {
                        clearTimeout(bakingTimer);
                        bakingTimer = null;
                    }
                }

                // Скрываем все страницы
                document.querySelectorAll('.page').forEach(function(page) {
                    page.classList.remove('active');
                });
                // Показываем целевую
                targetPage.classList.add('active');

                // Если перешли на baking, запускаем таймер выпечки
                if (targetId === 'baking') {
                    startBakingTimer();
                }

                // Если перешли на timer-to-present, запускаем таймер
                if (targetId === 'timer-to-present') {
                    startTimer();
                }
            }
        });
    });

    // ----- 2. Обработка неправильных ответов в первом вопросе -----
    document.querySelectorAll('.wrong-answer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var message = this.getAttribute('data-message') || 'Неверный ответ! Попробуйте ещё раз.';
            alert(message);
            this.style.display = 'none';
        });
    });

    // ----- 3. Подстановка имени на страницу вопроса -----
    var confirmBtn = document.querySelector('#enter-name button');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            var nameInput = document.getElementById('name');
            var name = nameInput.value.trim();
            if (name === '') {
                name = 'Дорогой папа';
            }
            var nameSpan = document.querySelector('#first-question h2');
            if (nameSpan) {
                nameSpan.innerHTML = nameSpan.innerHTML.replace('*имя*', name);
            }
        });
    }

    // ----- 4. Таймер на странице с подарком -----
    var timerInterval = null;
    var timeLeft = 5;

    function startTimer() {
        if (timerInterval !== null) return;

        var timerDisplay = document.getElementById('timerDisplay');
        if (!timerDisplay) return;

        timeLeft = 5;
        timerDisplay.textContent = timeLeft;

        var questionBlock = document.getElementById('questionBlock');
        if (questionBlock) questionBlock.style.display = 'none';

        timerInterval = setInterval(function() {
            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerDisplay.textContent = '0';
                if (questionBlock) questionBlock.style.display = 'block';
                alert('Время вышло! Теперь вы можете ответить на вопрос.');
            }
        }, 1000);
    }

    // ----- Таймер для страницы baking (автопереход) -----
    var bakingTimer = null;

    function startBakingTimer() {
        if (bakingTimer) {
            clearTimeout(bakingTimer);
            bakingTimer = null;
        }

        var bakingPage = document.getElementById('baking');
        var choice = bakingPage ? bakingPage.dataset.selectedChoice : null;

        bakingTimer = setTimeout(function() {
            bakingTimer = null;
            var target = (choice === '3') ? 'success' : 'fail';
            // Переключаем страницу
            var targetPage = document.getElementById(target);
            if (targetPage) {
                document.querySelectorAll('.page').forEach(function(page) {
                    page.classList.remove('active');
                });
                targetPage.classList.add('active');
                // Если перешли на timer-to-present, запускаем таймер
                if (target === 'timer-to-present') {
                    startTimer();
                }
            }
        }, 5000);
    }

    // ----- 5. Модальное окно для просмотра картинки (с проверками) -----
    var modal = document.getElementById('imageModal');
    var modalImg = document.getElementById('modalImage');
    var closeBtn = document.getElementById('modalClose');
    var zoomInBtn = document.getElementById('zoomIn');
    var zoomOutBtn = document.getElementById('zoomOut');
    var downloadBtn = document.getElementById('downloadBtn');

    // Если модальное окно не найдено – просто выходим
    if (!modal || !modalImg) {
        console.warn('Модальное окно не найдено. Пропускаем настройку.');
    } else {
        var currentScale = 1;
        var currentSrc = 'images/coffee.png';

        function openModal(imageSrc) {
            currentSrc = imageSrc;
            modalImg.src = imageSrc;
            currentScale = 1;
            modalImg.style.transform = 'scale(1)';
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }

        if (closeBtn) closeBtn.onclick = closeModal;
        if (modal) {
            modal.onclick = function(event) {
                if (event.target === modal) closeModal();
            };
        }
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modal && modal.classList.contains('open')) {
                closeModal();
            }
        });

        if (downloadBtn) {
            downloadBtn.onclick = function() {
                if (currentSrc) {
                    var link = document.createElement('a');
                    link.href = currentSrc;
                    link.download = currentSrc.split('/').pop() || 'image.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };
        }

        // ----- 6. Обработчик клика по картинке в блоке postcard -----
        var postcardImg = document.querySelector('#postcard img');
        if (postcardImg) {
            postcardImg.style.cursor = 'pointer';
            postcardImg.addEventListener('click', function() {
                var src = this.getAttribute('src');
                if (src) openModal(src);
            });
        }
    }

}); // конец DOMContentLoaded