const Pemain = (nama, energi, maxEnergi, inventory = []) => {
    let currentEnergi = energi;
    let equippedWeapon = null; // {name, type:'weapon', dmgBonus}

    // local makan implementation so closures can call it safely
    const makanFn = (porsi) => {
        currentEnergi += porsi;
        if (currentEnergi > maxEnergi) currentEnergi = maxEnergi;
        return currentEnergi;
    };

    const damageFn = (hit) => {
        currentEnergi -= hit;
        if (currentEnergi < 0) currentEnergi = 0;
        return currentEnergi;
    };

    const useItemFn = (index) => {
        const item = inventory[index];
        if (!item) return { ok: false, reason: 'not found' };
        if (item.type === 'food') {
            const healed = makanFn(item.healAmount);
            inventory.splice(index, 1);
            return { ok: true, action: 'heal', amount: item.healAmount, newEnergi: healed };
        }
        if (item.type === 'weapon') {
            equippedWeapon = item;
            return { ok: true, action: 'equip', weapon: item };
        }
        return { ok: false, reason: 'unknown type' };
    };

    return {
        nama,
        getEnergi: () => currentEnergi,
        maxEnergi,
        makan: makanFn,
        damage: damageFn,
        isAlive: () => currentEnergi > 0,
        // Inventory related
        inventory,
        getInventory: () => inventory,
        getEquipped: () => equippedWeapon,
        equipWeapon: (index) => {
            const item = inventory[index];
            if (!item) return false;
            if (item.type !== 'weapon') return false;
            equippedWeapon = item;
            return true;
        },
        useItem: useItemFn
    };
};

// initial inventories: weapons increase damage, food heals bigger amounts
let pemain1 = Pemain('Cantarella', 100, 100, [
    { name: 'Dagger', type: 'weapon', dmgBonus: 5 },
    { name: 'Iron Sword', type: 'weapon', dmgBonus: 12 },
    { name: 'Apple', type: 'food', healAmount: 20 },
    { name: 'Stew', type: 'food', healAmount: 30 }
]);

let pemain2 = Pemain('Charlotta', 100, 100, [
    { name: 'Claw', type: 'weapon', dmgBonus: 6 },
    { name: 'Warhammer', type: 'weapon', dmgBonus: 15 },
    { name: 'Bread', type: 'food', healAmount: 18 },
    { name: 'Elixir', type: 'food', healAmount: 35 }
]);
let currentTurn = 1; // 1 untuk pemain1, 2 untuk pemain2

function attack(attacker, defender) {
    // enforce turn: attacker must match currentTurn
    if ((currentTurn === 1 && attacker !== pemain1) || (currentTurn === 2 && attacker !== pemain2)) {
        // ignore or flash; simply return
        return;
    }

    let damage = Math.floor(Math.random() * 20) + 10; // base damage 10-30
    const weapon = attacker.getEquipped();
    if (weapon && weapon.dmgBonus) {
        damage += weapon.dmgBonus;
    }

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
    // enforce turn: pemain must match currentTurn
    if ((currentTurn === 1 && pemain !== pemain1) || (currentTurn === 2 && pemain !== pemain2)) {
        return;
    }

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

    // Update equipped weapon display
    const eq1 = pemain1.getEquipped();
    const eq2 = pemain2.getEquipped();
    document.getElementById('equipped1').textContent = eq1 ? eq1.name + ' (+' + (eq1.dmgBonus || 0) + ')' : 'None';
    document.getElementById('equipped2').textContent = eq2 ? eq2.name + ' (+' + (eq2.dmgBonus || 0) + ')' : 'None';

    // Render inventory lists
    const inv1 = document.getElementById('inventory1');
    const inv2 = document.getElementById('inventory2');
    inv1.innerHTML = '';
    inv2.innerHTML = '';

    pemain1.getInventory().forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.className = item.type === 'weapon' ? 'attack-btn' : 'heal-btn';
        btn.style.padding = '6px 10px';
        btn.style.fontSize = '0.85em';
        btn.textContent = item.type === 'weapon' ? `${item.name} (+${item.dmgBonus})` : `${item.name} (+${item.healAmount} HP)`;
        btn.onclick = () => useInventory(1, idx);
        inv1.appendChild(btn);
    });

    pemain2.getInventory().forEach((item, idx) => {
        const btn = document.createElement('button');
        btn.className = item.type === 'weapon' ? 'attack-btn' : 'heal-btn';
        btn.style.padding = '6px 10px';
        btn.style.fontSize = '0.85em';
        btn.textContent = item.type === 'weapon' ? `${item.name} (+${item.dmgBonus})` : `${item.name} (+${item.healAmount} HP)`;
        btn.onclick = () => useInventory(2, idx);
        inv2.appendChild(btn);
    });
}

// Use inventory item for playerId (1 or 2)
function useInventory(playerId, index) {
    const player = playerId === 1 ? pemain1 : pemain2;
    // only allow using on player's turn
    if ((currentTurn === 1 && player !== pemain1) || (currentTurn === 2 && player !== pemain2)) return;

    const result = player.useItem(index);
    if (!result.ok) return;

    if (result.action === 'equip') {
        // equipped a weapon
        updateUI();
    } else if (result.action === 'heal') {
        updateUI();
    }

    // after using an item, change turn
    currentTurn = currentTurn === 1 ? 2 : 1;
    updateTurnIndicator();
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
    pemain1 = Pemain('Cantarella', 100, 100, [
        { name: 'Dagger', type: 'weapon', dmgBonus: 5 },
        { name: 'Iron Sword', type: 'weapon', dmgBonus: 12 },
        { name: 'Apple', type: 'food', healAmount: 20 },
        { name: 'Stew', type: 'food', healAmount: 30 }
    ]);

    pemain2 = Pemain('Charlotta', 100, 100, [
        { name: 'Claw', type: 'weapon', dmgBonus: 6 },
        { name: 'Warhammer', type: 'weapon', dmgBonus: 15 },
        { name: 'Bread', type: 'food', healAmount: 18 },
        { name: 'Elixir', type: 'food', healAmount: 35 }
    ]);
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