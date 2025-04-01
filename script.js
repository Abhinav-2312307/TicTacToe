let currentPlayer = 'X';
let gameActive = false;
let gameState = ['', '', '', '', '', '', '', '', ''];
let scores = { X: 0, O: 0 };
let playerNames = { X: '', O: '' };
let gameStarted = false;
let isVsComputer = false;
let difficulty = 'easy';

// Show difficulty selector when computer is selected
document.getElementById('vsComputer').addEventListener('change', function() {
    const difficultySelector = document.getElementById('difficultySelector');
    if (this.checked) {
        difficultySelector.style.display = 'block';
    } else {
        difficultySelector.style.display = 'none';
    }
});

document.getElementById('startButton').addEventListener('click', function() {
    const player1 = document.getElementById('player1').value;
    const player2 = document.getElementById('player2').value;
    isVsComputer = document.getElementById('vsComputer').checked;
    difficulty = document.getElementById('difficulty').value;
    
    if (player1) {
        if (isVsComputer) {
            playerNames = { X: player1, O: 'Computer' };
        } else {
            if (!player2) {
                alert('Please enter player 2 name');
                return;
            }
            playerNames = { X: player1, O: player2 };
        }
        
        document.querySelector('.player-input').classList.add('hidden');
        document.querySelector('.new-game').style.display = 'block';
        document.querySelector('.reset').style.display = 'block';
        updateScoreBoard();
        resetBoard();
        gameStarted = true;
        updateStatus(`${playerNames[currentPlayer]}, it's your turn`);
        document.getElementById('startSound').play();
    } else {
        alert('Please enter player 1 name');
    }
});

function handleCellClick(clickedCellEvent) {
    if (!gameStarted) return;
    
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '') {
        document.getElementById('occupiedSound').play();
        return;
    }

    if (!gameActive || (currentPlayer === 'O' && isVsComputer)) {
        return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    document.getElementById('tapSound').currentTime = 0;
    document.getElementById('tapSound').play();

    if (checkWin()) {
        gameActive = false;
        scores[currentPlayer]++;
        updateScoreBoard();
        document.getElementById('winSound').play();
        updateStatus(`${playerNames[currentPlayer]} wins!`);
        return;
    }

    if (!gameState.includes('')) {
        gameActive = false;
        updateStatus("Game ended in a draw!");
        document.getElementById('drawSound').play();
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`${playerNames[currentPlayer]}, it's your turn`);

    if (isVsComputer && currentPlayer === 'O') {
        setTimeout(computerMove, 500);
    }
}

function computerMove() {
    if (!gameStarted || !gameActive || currentPlayer !== 'O') return;
    
    let moveIndex;
    
    if (difficulty === 'easy') {
        moveIndex = getRandomMove();
    } else if (difficulty === 'medium') {
        if (Math.random() < 0.7) {
            moveIndex = minimax(gameState, 'O').index;
        } else {
            moveIndex = getRandomMove();
        }
    } else if (difficulty === 'hard') {
        moveIndex = minimax(gameState, 'O').index;
    }
    
    gameState[moveIndex] = currentPlayer;
    document.querySelector(`.cell[data-index="${moveIndex}"]`).textContent = currentPlayer;
    document.querySelector(`.cell[data-index="${moveIndex}"]`).classList.add(currentPlayer.toLowerCase());
    document.getElementById('tapSound').currentTime = 0;
    document.getElementById('tapSound').play();
    
    if (checkWin()) {
        gameActive = false;
        scores[currentPlayer]++;
        updateScoreBoard();
        document.getElementById('winSound').play();
        updateStatus(`${playerNames[currentPlayer]} wins!`);
        return;
    }
    
    if (!gameState.includes('')) {
        gameActive = false;
        updateStatus("Game ended in a draw!");
        document.getElementById('drawSound').play();
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`${playerNames[currentPlayer]}, it's your turn`);
}

function getRandomMove() {
    const emptyCells = gameState.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function minimax(board, player) {
    const availableSpots = board.filter(cell => cell === '').length;
    
    if (checkWinForPlayer(board, 'O')) {
        return { score: 10 };
    } else if (checkWinForPlayer(board, 'X')) {
        return { score: -10 };
    } else if (availableSpots === 0) {
        return { score: 0 };
    }
    
    let moves = [];
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = player;
            
            const move = {
                index: i,
                score: minimax(board, player === 'O' ? 'X' : 'O').score
            };
            
            board[i] = '';
            moves.push(move);
        }
    }
    
    let bestMove;
    
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    
    return moves[bestMove];
}

function checkWinForPlayer(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    return winPatterns.some(pattern => {
        return pattern.every(index => {
            return board[index] === player;
        });
    });
}

function checkWin() {
    return checkWinForPlayer(gameState, currentPlayer);
}

function resetBoard() {
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    updateStatus(`${playerNames[currentPlayer]}, it's your turn`);
}

function newGame() {
    resetBoard();
    scores = { X: 0, O: 0 };
    updateScoreBoard();
    document.querySelector('.player-input').classList.remove('hidden');
    document.querySelector('.new-game').style.display = 'none';
    document.querySelector('.reset').style.display = 'none';
    gameStarted = false;
    isVsComputer = false;
    document.getElementById('difficultySelector').style.display = 'none';
    updateStatus('Enter player names and start game');
}

function updateScoreBoard() {
    document.querySelector('.score-board').innerHTML = `
        <div class="score">${playerNames.X}: <span id="score1">${scores.X}</span></div>
        <div class="score">${playerNames.O}: <span id="score2">${scores.O}</span></div>
    `;
}

function updateStatus(message = '') {
    document.getElementById('status').textContent = message;
}

// Initial setup
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});