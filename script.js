// DADOS DO JOGO
const MM2_DATABASE = {
    knives: [{ id: "seer", name: "Seer", rarity: "godly" }],
    guns: [{ id: "luger", name: "Luger", rarity: "godly" }],
    gamepasses: [{ id: "radio", name: "Radio", price: 475 }]
};

let playerData = { level: 1, coins: 250, inventory: ["seer", "luger"] };
let moveState = { forward: false, backward: false, left: false, right: false };

// SELEÇÃO DE DISPOSITIVO
function selectDevice(device) {
    document.getElementById("device-screen").classList.add("hidden");
    init3D();
}

// LÓGICA DAS MODAIS
function openTab(tabName) {
    document.getElementById("modal-screen").classList.remove("hidden");
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.getElementById(`tab-${tabName}`).classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal-screen").classList.add("hidden");
}

// INICIALIZAÇÃO O MUNDO 3D (THREE.JS)
let scene, camera, renderer, playerGroup;

function init3D() {
    const container = document.getElementById("canvas-container");

    // Cenário & Câmara
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111115);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // MUNDO: LOBBY
    createLobby();

    // PERSONAGEM: AVATAR ROBLOX (R6)
    playerGroup = createRobloxAvatar();
    scene.add(playerGroup);
    playerGroup.position.set(0, 1.5, 0);

    // CONFIGURAR CONTROLES
    window.addEventListener("keydown", (e) => handleKey(e.code, true));
    window.addEventListener("keyup", (e) => handleKey(e.code, false));
    window.addEventListener("resize", onWindowResize);

    // LOOP DE ANIMAÇÃO
    animate();
}

// CRIAR LOBBY DO JOGO
function createLobby() {
    // Chão do Lobby
    const floorGeo = new THREE.BoxGeometry(60, 1, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Paredes do Lobby
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1f1f24 });
    
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(60, 10, 1), wallMat);
    wall1.position.set(0, 5, -30);
    scene.add(wall1);

    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(60, 10, 1), wallMat);
    wall2.position.set(0, 5, 30);
    scene.add(wall2);

    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 60), wallMat);
    wall3.position.set(-30, 5, 0);
    scene.add(wall3);

    const wall4 = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 60), wallMat);
    wall4.position.set(30, 5, 0);
    scene.add(wall4);
}

// CRIAR O PERSONAGEM ROBLOX R6 EM BLOCOS
function createRobloxAvatar() {
    const avatar = new THREE.Group();

    // Material Azul Estilo Roblox
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x00a2ff });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe5c158 });
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.6), torsoMat);
    torso.position.y = 0.6;
    avatar.add(torso);

    // Cabeça
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), headMat);
    head.position.y = 1.55;
    avatar.add(head);

    // Perna Esquerda
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.2, 0.55), limbMat);
    legL.position.set(-0.3, -0.6, 0);
    avatar.add(legL);

    // Perna Direita
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.2, 0.55), limbMat);
    legR.position.set(0.3, -0.6, 0);
    avatar.add(legR);

    // Braço Esquerdo
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.2, 0.55), torsoMat);
    armL.position.set(-0.9, 0.6, 0);
    avatar.add(armL);

    // Braço Direito
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.2, 0.55), torsoMat);
    armR.position.set(0.9, 0.6, 0);
    avatar.add(armR);

    return avatar;
}

// MOVIMENTAÇÃO DO TECLADO
function handleKey(code, isDown) {
    if (code === "KeyW" || code === "ArrowUp") moveState.forward = isDown;
    if (code === "KeyS" || code === "ArrowDown") moveState.backward = isDown;
    if (code === "KeyA" || code === "ArrowLeft") moveState.left = isDown;
    if (code === "KeyD" || code === "ArrowRight") moveState.right = isDown;
}

function updatePhysics() {
    if (!playerGroup) return;

    const speed = 0.15;
    if (moveState.forward) playerGroup.position.z -= speed;
    if (moveState.backward) playerGroup.position.z += speed;
    if (moveState.left) playerGroup.position.x -= speed;
    if (moveState.right) playerGroup.position.x += speed;

    // Limites de colisão das paredes do Lobby
    playerGroup.position.x = Math.max(-28, Math.min(28, playerGroup.position.x));
    playerGroup.position.z = Math.max(-28, Math.min(28, playerGroup.position.z));

    // A câmara segue o jogador em 3ª pessoa
    camera.position.set(playerGroup.position.x, playerGroup.position.y + 6, playerGroup.position.z + 10);
    camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1, playerGroup.position.z);
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}