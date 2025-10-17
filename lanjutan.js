const Pemain = (nama, energi, maxEnergi) => {
    let currentEnergi = energi;
    return {
        nama,
        getEnergi: () => currentEnergi,
        maxEnergi,
        makan: (porsi) => {
            currentEnergi += porsi;
            if (currentEnergi > maxEnergi) currentEnergi = maxEnergi;
            return currentEnergi;
        },
        damage: (hit) => {
            currentEnergi -= hit;
            if (currentEnergi < 0) currentEnergi = 0;
            return currentEnergi;
        },
        isAlive: () => currentEnergi > 0
    };
};

let pemain1 = Pemain('Cantarella', 100, 100);
let pemain2 = Pemain('Charlotta', 100, 100);
let currentTurn = 1; // 1 untuk pemain1, 2 untuk pemain2

function attack(attacker, defender) {
    const damage = Math.floor(Math.random() * 20) + 10; // damage antara 10-30
    const newEnergi = defender.damage(damage);
    updateUI();
    
    if (!defender.isAlive()) {
        endGame(attacker.nama);
        return;
    }
    
    // Ganti turn
    currentTurn = currentTurn === 1 ? 2 : 1;
    updateTurnIndicator();
}

function heal(pemain) {
    const healAmount = Math.floor(Math.random() * 15) + 10; // heal antara 10-25
    pemain.makan(healAmount);
    updateUI();
    
    // Ganti turn
    currentTurn = currentTurn === 1 ? 2 : 1;
    updateTurnIndicator();
}

function updateUI() {
    // Update HP bars
    const energi1 = pemain1.getEnergi();
    const energi2 = pemain2.getEnergi();
    
    document.getElementById('hp1').style.width = energi1 + '%';
    document.getElementById('hp1-text').textContent = energi1 + ' / ' + pemain1.maxEnergi;
    
    document.getElementById('hp2').style.width = energi2 + '%';
    document.getElementById('hp2-text').textContent = energi2 + ' / ' + pemain2.maxEnergi;
}

function updateTurnIndicator() {
    const turn1 = document.getElementById('turn1');
    const turn2 = document.getElementById('turn2');
    
    if (currentTurn === 1) {
        turn1.style.display = 'block';
        turn2.style.display = 'none';
    } else {
        turn1.style.display = 'none';
        turn2.style.display = 'block';
    }
}

function endGame(winner) {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('winner-name').textContent = winner;
    document.getElementById('controls1').style.display = 'none';
    document.getElementById('controls2').style.display = 'none';
}

function resetGame() {
    pemain1 = Pemain('Cantarella', 100, 100);
    pemain2 = Pemain('Charlotta', 100, 100);
    currentTurn = 1;
    
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('controls1').style.display = 'block';
    document.getElementById('controls2').style.display = 'block';
    
    updateUI();
    updateTurnIndicator();
}

// Initialize game
window.onload = () => {
    updateUI();
    updateTurnIndicator();
};