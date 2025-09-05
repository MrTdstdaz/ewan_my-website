document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('start-button');
    const gameOverMessage = document.getElementById('game-over-message');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    const playerWidth = 30;
    const playerHeight = 30;
    const gameWidth = 300;
    const gameHeight = 400;
    const platformWidth = 80;
    const platformHeight = 10;
    const numberOfPlatforms = 5; // عدد المنصات الظاهرة في الشاشة
    const platformGap = gameHeight / numberOfPlatforms; // المسافة بين المنصات

    let playerLeft = gameWidth / 2 - playerWidth / 2;
    let playerBottom = 0;
    let score = 0;
    let isGameOver = true;
    let platforms = [];
    let upTimerId;
    let downTimerId;
    let leftTimerId;
    let rightTimerId;
    let isJumping = false;
    let isGoingLeft = false;
    let isGoingRight = false;
    let gameInterval; // لتحديث اللعبة باستمرار
    let platformSpawnInterval; // لتوليد منصات جديدة

    class Platform {
        constructor(bottom) {
            this.bottom = bottom;
            this.left = Math.random() * (gameWidth - platformWidth);
            this.visual = document.createElement('div');

            const visual = this.visual;
            visual.classList.add('platform');
            visual.style.left = this.left + 'px';
            visual.style.bottom = this.bottom + 'px';
            gameBoard.appendChild(visual);
        }
    }

    function createPlatforms() {
        for (let i = 0; i < numberOfPlatforms; i++) {
            let platformBottom = 100 + i * platformGap;
            let newPlatform = new Platform(platformBottom);
            platforms.push(newPlatform);
        }
    }

    function movePlatforms() {
        if (!isGameOver) {
            platforms.forEach(platform => {
                platform.bottom -= 2; // سرعة تحرك المنصات لأسفل
                platform.visual.style.bottom = platform.bottom + 'px';

                if (platform.bottom < 0) {
                    let firstPlatform = platforms[0].visual;
                    firstPlatform.remove();
                    platforms.shift(); // إزالة أقدم منصة

                    // إضافة منصة جديدة في الأعلى
                    let newPlatform = new Platform(gameHeight);
                    platforms.push(newPlatform);
                    score++;
                    scoreDisplay.textContent = score;
                }
            });
        }
    }

    function fall() {
        isJumping = false;
        clearInterval(upTimerId);
        downTimerId = setInterval(function () {
            playerBottom -= 5; // سرعة سقوط اللاعب
            player.style.bottom = playerBottom + 'px';

            if (playerBottom <= 0) {
                // اللاعب سقط خارج اللوحة
                gameOver();
            }

            // تحقق من الاصطدام بالمنصات عند السقوط
            platforms.forEach(platform => {
                if (
                    (playerBottom >= platform.bottom && playerBottom <= platform.bottom + platformHeight) &&
                    ((playerLeft + playerWidth) >= platform.left && playerLeft <= (platform.left + platformWidth)) &&
                    !isJumping // يتفاعل مع المنصة فقط إذا كان يسقط
                ) {
                    playerBottom = platform.bottom + platformHeight; // ضع اللاعب فوق المنصة
                    player.style.bottom = playerBottom + 'px';
                    jump(); // اقفز مرة أخرى
                }
            });

        }, 20);
    }

    function jump() {
        isJumping = true;
        clearInterval(downTimerId);
        upTimerId = setInterval(function () {
            playerBottom += 10; // سرعة القفز لأعلى
            player.style.bottom = playerBottom + 'px';
            if (playerBottom > gameHeight) { // إذا وصل لأعلى اللوحة
                fall();
            }
        }, 20);
    }

    function control(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            moveLeft();
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            moveRight();
        }
    }

    function moveLeft() {
        if (!isGoingLeft && !isGameOver) {
            clearInterval(rightTimerId);
            isGoingRight = false;
            isGoingLeft = true;
            leftTimerId = setInterval(function () {
                if (playerLeft > 0) {
                    playerLeft -= 5;
                    player.style.left = playerLeft + 'px';
                }
            }, 20);
        }
    }

    function moveRight() {
        if (!isGoingRight && !isGameOver) {
            clearInterval(leftTimerId);
            isGoingLeft = false;
            isGoingRight = true;
            rightTimerId = setInterval(function () {
                if (playerLeft < gameWidth - playerWidth) {
                    playerLeft += 5;
                    player.style.left = playerLeft + 'px';
                }
            }, 20);
        }
    }

    function stopMoving() {
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
        isGoingLeft = false;
        isGoingRight = false;
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(upTimerId);
        clearInterval(downTimerId);
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
        clearInterval(gameInterval);
        clearInterval(platformSpawnInterval);

        finalScoreDisplay.textContent = score;
        gameOverMessage.classList.remove('hidden'); // إظهار رسالة انتهاء اللعبة

        // إزالة جميع المنصات من اللوحة
        while (gameBoard.firstChild) {
            gameBoard.removeChild(gameBoard.firstChild);
        }
        player.remove(); // إزالة اللاعب
    }

    function startGame() {
        if (isGameOver) {
            // إعادة تعيين اللعبة
            gameBoard.innerHTML = ''; // مسح لوحة اللعبة
            platforms = [];
            score = 0;
            scoreDisplay.textContent = score;
            playerLeft = gameWidth / 2 - playerWidth / 2;
            playerBottom = 0;
            player.style.left = playerLeft + 'px';
            player.style.bottom = playerBottom + 'px';
            gameBoard.appendChild(player); // إعادة إضافة اللاعب

            createPlatforms();
            jump();
            isGameOver = false;
            gameOverMessage.classList.add('hidden'); // إخفاء رسالة انتهاء اللعبة
            startButton.classList.add('hidden'); // إخفاء زر البدء

            // بدء حركة المنصات وتوليدها
            gameInterval = setInterval(movePlatforms, 20);
            document.addEventListener('keydown', control);
            document.addEventListener('keyup', stopMoving);
        }
    }

    // الأزرار
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', () => {
        gameOverMessage.classList.add('hidden');
        startButton.classList.remove('hidden'); // إظهار زر البدء مرة أخرى
        // إعادة تهيئة المتغيرات الأساسية لبدء لعبة جديدة بالكامل
        isGameOver = true; // نضعها true لكي يسمح الـ startGame بالتشغيل
        platforms = [];
        score = 0;
        playerBottom = 0;
        playerLeft = gameWidth / 2 - playerWidth / 2;
        // قم بإعادة إضافة اللاعب إلى اللوحة إذا تمت إزالته
        if (!gameBoard.contains(player)) {
            gameBoard.appendChild(player);
        }
        player.style.left = playerLeft + 'px';
        player.style.bottom = playerBottom + 'px';
        scoreDisplay.textContent = score;
    });

    // إظهار اللاعب في البداية حتى قبل بدء اللعبة
    player.style.left = playerLeft + 'px';
    player.style.bottom = playerBottom + 'px';

    // أضف هذه الأسطر لإظهار اللاعب في البداية
    gameBoard.appendChild(player);
});