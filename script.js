// BANCO DE DADOS DE ITENS
const MM2_DATABASE = {
    knives: [
        { id: "niks_scythe", name: "Nik's Scythe", rarity: "ancient", price: 5000 },
        { id: "chroma_fang", name: "Chroma Fang", rarity: "godly", price: 2500 },
        { id: "seer", name: "Seer", rarity: "godly", price: 1000 }
    ],
    guns: [
        { id: "chroma_luger", name: "Chroma Luger", rarity: "godly", price: 2500 },
        { id: "darkbringer", name: "Darkbringer", rarity: "godly", price: 1800 }
    ],
    gamepasses: [
        { id: "radio", name: "Radio / Boombox", price: 475 },
        { id: "elite", name: "Elite Status", price: 499 }
    ]
};

// ESTADO DO JOGADOR
let playerData = {
    level: 1,
    coins: 5000,
    inventory: ["seer", "chroma_luger"]
};

// ESTADO DO JOGO E MAPAS
let gameState = {
    phase: "LOBBY",
    timer: 15,
    maps: ["Bank", "Hospital", "Mansion"],
    currentMapMesh: null
};

let moveState = { forward: false, backward: false, left: false, right: false };
let scene, camera, renderer, controls, playerGroup;

// SELEÇÃO DE DISPOSITIVO (INTRO)
function selectDevice(device) {
    document.getElementById("device-screen").classList.add("hidden");
    init3D();
    renderInventory();
    renderShop();
    renderGamepasses();
    startTimer();
}

// INICIALIZAÇÃO 3D E CÂMERA
function init3D() {
    const container = document.getElementById("canvas-container");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111115);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // ORBIT CONTROLS (Permite girar a câmera segurando e arrastando com o mouse)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Não atravessar o chão

    // LUZES
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // NAVEGAÇÃO / MAPA INICIAL (LOBBY)
    loadMap("Lobby");

    // PERSONAGEM ROBLOX R6
    playerGroup = createRobloxAvatar();
    scene.add(playerGroup);
    playerGroup.position.set(0, 1.2, 0);

    // CONTROLES DE TECLADO
    window.addEventListener("keydown", (e) => handleKey(e.code, true));
    window.addEventListener("keyup", (e) => handleKey(e.code, false));
    window.addEventListener("resize", onWindowResize);

    animate();
}

// CARREGAR E TROCAR MAPAS (Lobby, Bank, Hospital, Mansion)
function loadMap(mapName) {
    if (gameState.currentMapMesh) {
        scene.remove(gameState.currentMapMesh);
    }

    const mapGroup = new THREE.Group();

    if (mapName === "Lobby") {
        const floorGeo = new THREE.BoxGeometry(60, 1, 60);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x222225 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.y = -0.5;
        mapGroup.add(floor);
    } else {
        // Mapa temático (Bank, Hospital, Mansion)
        const mapColors = { Bank: 0x8c7853, Hospital: 0xdddddd, Mansion: 0x4a2e2b };
        const color = mapColors[mapName] || 0x444444;

        const floorGeo = new THREE.BoxGeometry(80, 1, 80);
        const floorMat = new THREE.MeshStandardMaterial({ color: color });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.y = -0.5;
        mapGroup.add(floor);

        // Adiciona alguns blocos/obstáculos no mapa
        for (let i = 0; i < 6; i++) {
            const blockGeo = new THREE.BoxGeometry(4, 6, 4);
            const blockMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f });
            const block = new THREE.Mesh(blockGeo, blockMat);
            block.position.set((Math.random() - 0.5) * 40, 3, (Math.random() - 0.5) * 40);
            mapGroup.add(block);
        }
    }

    gameState.currentMapMesh = mapGroup;
    scene.add(mapGroup);
}

// CRIAR AVATAR ROBLOX R6
function createRobloxAvatar() {
    const avatar = new THREE.Group();
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x00a2ff });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe5c158 });
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.6), torsoMat);
    torso.position.y = 0.6;
    avatar.add(torso);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), headMat);
    head.position.y = 1.55;
    avatar.add(head);

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.2, 0.55), limbMat);
    legL.position.set(-0.3, -0.6, 0);
    avatar.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.2, 0.55), limbMat);
    legR.position.set(0.3, -0.6, 0);
    avatar.add(legR);

    return avatar;
}

// LÓGICA DO TEMPO E TROCA DE PARTIDAS
function startTimer() {
    setInterval(() => {
        if (gameState.timer > 0) {
            gameState.timer--;
        } else {
            if (gameState.phase === "LOBBY") {
                gameState.phase = "IN_GAME";
                const selectedMap = gameState.maps[Math.floor(Math.random() * gameState.maps.length)];
                document.getElementById("game-state").textContent = selectedMap.toUpperCase();
                loadMap(selectedMap);
                gameState.timer = 60;
            } else {
                gameState.phase = "LOBBY";
                document.getElementById("game-state").textContent = "LOBBY";
                loadMap("Lobby");
                gameState.timer = 15;
            }
        }
        let mins = String(Math.floor(gameState.timer / 60)).padStart(2, '0');
        let secs = String(gameState.timer % 60).padStart(2, '0');
        document.getElementById("game-timer").textContent = `${mins}:${secs}`;
    }, 1000);
}

// MOVIMENTAÇÃO DO PERSONAGEM
function handleKey(code, isDown) {
    if (code === "KeyW" || code === "ArrowUp") moveState.forward = isDown;
    if (code === "KeyS" || code === "ArrowDown") moveState.backward = isDown;
    if (code === "KeyA" || code === "ArrowLeft") moveState.left = isDown;
    if (code === "KeyD" || code === "ArrowRight") moveState.right = isDown;
}

function updatePhysics() {
    if (!playerGroup) return;

    const speed = 0.2;
    if (moveState.forward) playerGroup.position.z -= speed;
    if (moveState.backward) playerGroup.position.z += speed;
    if (moveState.left) playerGroup.position.x -= speed;
    if (moveState.right) playerGroup.position.x += speed;

    // A câmera acompanha a posição do personagem mantendo a rotação do OrbitControls
    controls.target.copy(playerGroup.position);
    controls.update();
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// INTERFACE DE LOJA & INVENTÁRIO
function openTab(tabName) {
    document.getElementById("modal-screen").classList.remove("hidden");
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.getElementById(`tab-${tabName}`).classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal-screen").classList.add("hidden");
}

function renderInventory() {
    const grid = document.getElementById("inventory-grid");
    grid.innerHTML = "";
    
    const allItems = [...MM2_DATABASE.knives, ...MM2_DATABASE.guns];
    const userItems = allItems.filter(item => playerData.inventory.includes(item.id));

    userItems.forEach(item => {
        const card = document.createElement("div");
        card.className = `item-card ${item.rarity}`;
        card.innerHTML = `<strong>${item.name}</strong><p>${item.rarity.toUpperCase()}</p>`;
        grid.appendChild(card);
    });
}

function renderShop() {
    const grid = document.getElementById("shop-grid");
    grid.innerHTML = "";

    const allItems = [...MM2_DATABASE.knives, ...MM2_DATABASE.guns];
    allItems.forEach(item => {
        const card = document.createElement("div");
        card.className = `item-card ${item.rarity}`;
        card.innerHTML = `
            <strong>${item.name}</strong>
            <p>${item.price} Moedas</p>
            <button onclick="buyItem('${item.id}', ${item.price})" style="margin-top:5px; padding:4px 8px; cursor:pointer;">Comprar</button>
        `;
        grid.appendChild(card);
    });
}

function renderGamepasses() {
    const grid = document.getElementById("gamepass-grid");
    grid.innerHTML = "";

    MM2_DATABASE.gamepasses.forEach(gp => {
        const card = document.createElement("div");
        card.className = "item-card legendary";
        card.innerHTML = `<strong>${gp.name}</strong><p>${gp.price} Robux</p>`;
        grid.appendChild(card);
    });
}

function buyItem(itemId, price) {
    if (playerData.inventory.includes(itemId)) {
        alert("Você já possui este item!");
        return;
    }
    if (playerData.coins >= price) {
        playerData.coins -= price;
        playerData.inventory.push(itemId);
        document.getElementById("player-coins").textContent = playerData.coins;
        renderInventory();
        alert("Item comprado com sucesso!");
    } else {
        alert("Moedas insuficientes!");
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}