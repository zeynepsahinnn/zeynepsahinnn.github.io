/**
 * Memory Game - Flip Card Matching Game
 */

(function() {
  "use strict";

  // Game dataset with unique items (Bootstrap Icons)
  const gameDataset = [
    { id: 1, icon: 'bi-heart-fill', name: 'Heart' },
    { id: 2, icon: 'bi-star-fill', name: 'Star' },
    { id: 3, icon: 'bi-lightning-fill', name: 'Lightning' },
    { id: 4, icon: 'bi-gem', name: 'Gem' },
    { id: 5, icon: 'bi-moon-fill', name: 'Moon' },
    { id: 6, icon: 'bi-sun-fill', name: 'Sun' },
    { id: 7, icon: 'bi-flower1', name: 'Flower' },
    { id: 8, icon: 'bi-balloon-fill', name: 'Balloon' },
    { id: 9, icon: 'bi-rainbow', name: 'Rainbow' },
    { id: 10, icon: 'bi-bicycle', name: 'Bicycle' },
    { id: 11, icon: 'bi-airplane-fill', name: 'Airplane' },
    { id: 12, icon: 'bi-car-front-fill', name: 'Car' }
  ];

  // Game state
  let gameState = {
    difficulty: 'easy',
    cards: [],
    flippedCards: [],
    moves: 0,
    matches: 0,
    gameStarted: false,
    canFlip: true,
    totalPairs: 0,
    timer: 0,
    timerInterval: null
  };

  // Difficulty configurations
  const difficulties = {
    easy: { rows: 3, cols: 4, pairs: 6 },  // 4×3 grid = 12 cards = 6 pairs
    hard: { rows: 4, cols: 6, pairs: 12 }  // 6×4 grid = 24 cards = 12 pairs
  };

  // DOM elements
  const gameBoard = document.getElementById('game-board');
  const difficultySelect = document.getElementById('difficulty');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const playAgainBtn = document.getElementById('play-again-btn');
  const movesCount = document.getElementById('moves-count');
  const matchesCount = document.getElementById('matches-count');
  const timerDisplay = document.getElementById('timer-display');
  const bestTimeDisplay = document.getElementById('best-time-display');
  const winMessage = document.getElementById('win-message');
  const finalMoves = document.getElementById('final-moves');
  const finalTime = document.getElementById('final-time');

  /**
   * Format time in seconds to MM:SS format
   */
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get best score from localStorage
   */
  function getBestScore(difficulty) {
    const key = `memoryGameBestTime_${difficulty}`;
    const bestTime = localStorage.getItem(key);
    return bestTime ? parseInt(bestTime, 10) : null;
  }

  /**
   * Save best score to localStorage
   */
  function saveBestScore(difficulty, time) {
    const key = `memoryGameBestTime_${difficulty}`;
    const currentBest = getBestScore(difficulty);
    if (!currentBest || time < currentBest) {
      localStorage.setItem(key, time.toString());
      return true; // New best score!
    }
    return false;
  }

  /**
   * Update best score display
   */
  function updateBestScoreDisplay() {
    const bestTime = getBestScore(gameState.difficulty);
    if (bestTime !== null) {
      bestTimeDisplay.textContent = formatTime(bestTime);
    } else {
      bestTimeDisplay.textContent = '--:--';
    }
  }

  /**
   * Start timer
   */
  function startTimer() {
    gameState.timer = 0;
    updateTimerDisplay();
    gameState.timerInterval = setInterval(() => {
      gameState.timer++;
      updateTimerDisplay();
    }, 1000);
  }

  /**
   * Stop timer
   */
  function stopTimer() {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
      gameState.timerInterval = null;
    }
  }

  /**
   * Reset timer
   */
  function resetTimer() {
    stopTimer();
    gameState.timer = 0;
    updateTimerDisplay();
  }

  /**
   * Update timer display
   */
  function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(gameState.timer);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate cards based on difficulty
   */
  function generateCards() {
    const config = difficulties[gameState.difficulty];
    const cards = [];
    const selectedItems = gameDataset.slice(0, config.pairs);
    
    // Create pairs
    selectedItems.forEach(item => {
      cards.push({ ...item, pairId: item.id });
      cards.push({ ...item, pairId: item.id });
    });

    return shuffleArray(cards);
  }

  /**
   * Create card element
   */
  function createCardElement(card, index) {
    const cardElement = document.createElement('div');
    cardElement.className = 'memory-card';
    cardElement.dataset.index = index;
    cardElement.dataset.pairId = card.pairId;
    
    cardElement.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <i class="bi bi-question-circle-fill"></i>
        </div>
        <div class="card-back">
          <i class="bi ${card.icon}"></i>
        </div>
      </div>
    `;

    cardElement.addEventListener('click', () => handleCardClick(index));
    
    return cardElement;
  }

  /**
   * Initialize game board
   */
  function initializeBoard() {
    gameBoard.innerHTML = '';
    gameState.cards = generateCards();
    gameState.totalPairs = difficulties[gameState.difficulty].pairs;
    
    const config = difficulties[gameState.difficulty];
    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
    
    gameState.cards.forEach((card, index) => {
      const cardElement = createCardElement(card, index);
      gameBoard.appendChild(cardElement);
    });
  }

  /**
   * Handle card click
   */
  function handleCardClick(index) {
    if (!gameState.gameStarted || !gameState.canFlip) return;
    
    const card = gameState.cards[index];
    const cardElement = gameBoard.children[index];
    
    // Check if card is already flipped or matched
    if (cardElement.classList.contains('flipped') || 
        cardElement.classList.contains('matched')) {
      return;
    }

    // Don't allow clicking the same card twice
    if (gameState.flippedCards.length === 1 && 
        gameState.flippedCards[0].index === index) {
      return;
    }

    // Flip the card
    flipCard(cardElement);
    gameState.flippedCards.push({ index, card });

    // Check if two cards are flipped
    if (gameState.flippedCards.length === 2) {
      gameState.canFlip = false;
      gameState.moves++;
      updateStats();

      // Check for match
      setTimeout(() => {
        checkMatch();
      }, 1000);
    }
  }

  /**
   * Flip card animation
   */
  function flipCard(cardElement) {
    cardElement.classList.add('flipped');
  }

  /**
   * Unflip card
   */
  function unflipCard(cardElement) {
    cardElement.classList.remove('flipped');
  }

  /**
   * Check if flipped cards match
   */
  function checkMatch() {
    const [first, second] = gameState.flippedCards;
    
    if (first.card.pairId === second.card.pairId) {
      // Match found!
      const firstCard = gameBoard.children[first.index];
      const secondCard = gameBoard.children[second.index];
      
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      
      gameState.matches++;
      updateStats();

      // Check for win
      if (gameState.matches === gameState.totalPairs) {
        setTimeout(() => {
          showWinMessage();
        }, 500);
      } else {
        gameState.flippedCards = [];
        gameState.canFlip = true;
      }
    } else {
      // No match - flip back
      const firstCard = gameBoard.children[first.index];
      const secondCard = gameBoard.children[second.index];
      
      unflipCard(firstCard);
      unflipCard(secondCard);
      
      gameState.flippedCards = [];
      gameState.canFlip = true;
    }
  }

  /**
   * Update statistics display
   */
  function updateStats() {
    movesCount.textContent = gameState.moves;
    matchesCount.textContent = gameState.matches;
  }

  /**
   * Show win message
   */
  function showWinMessage() {
    stopTimer();
    finalMoves.textContent = gameState.moves;
    finalTime.textContent = formatTime(gameState.timer);
    
    // Save best score if applicable
    const isNewBest = saveBestScore(gameState.difficulty, gameState.timer);
    updateBestScoreDisplay();
    
    winMessage.classList.remove('hidden');
    restartBtn.disabled = true;
  }

  /**
   * Hide win message
   */
  function hideWinMessage() {
    winMessage.classList.add('hidden');
  }

  /**
   * Start game
   */
  function startGame() {
    gameState.gameStarted = true;
    gameState.moves = 0;
    gameState.matches = 0;
    gameState.flippedCards = [];
    gameState.canFlip = true;
    
    initializeBoard();
    updateStats();
    hideWinMessage();
    resetTimer();
    startTimer();
    
    startBtn.disabled = true;
    restartBtn.disabled = false;
  }

  /**
   * Restart game
   */
  function restartGame() {
    stopTimer();
    gameState.gameStarted = true;
    gameState.moves = 0;
    gameState.matches = 0;
    gameState.flippedCards = [];
    gameState.canFlip = true;
    
    initializeBoard();
    updateStats();
    hideWinMessage();
    resetTimer();
    startTimer();
    
    startBtn.disabled = true;
    restartBtn.disabled = false;
  }

  /**
   * Reset game (to initial state)
   */
  function resetGame() {
    stopTimer();
    gameState.gameStarted = false;
    gameState.moves = 0;
    gameState.matches = 0;
    gameState.flippedCards = [];
    gameState.canFlip = true;
    
    gameBoard.innerHTML = '';
    updateStats();
    hideWinMessage();
    resetTimer();
    
    startBtn.disabled = false;
    restartBtn.disabled = true;
    difficultySelect.disabled = false;
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', () => {
      hideWinMessage();
      resetGame();
      startGame();
    });
    
    difficultySelect.addEventListener('change', () => {
      // When difficulty changes, reinitialize the board
      gameState.difficulty = difficultySelect.value;
      updateBestScoreDisplay();
      
      if (gameState.gameStarted) {
        // If game is in progress, restart with new difficulty
        restartGame();
      } else {
        // If game hasn't started, just reset
        resetGame();
      }
    });
  }

  /**
   * Initialize game
   */
  function init() {
    updateStats();
    updateBestScoreDisplay();
    resetTimer();
    initEventListeners();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

