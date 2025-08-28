// Application Data - Enhanced with detailed environments
const appData = {
  scenarios: {
    public_spaces: [
      {
        id: "subway_3d",
        name: "Realistic Subway Station",
        description: "Navigate a detailed 3D subway environment with interactive elements",
        difficulty: "Intermediate",
        duration: "10-15 min",
        vr_features: ["3D Navigation", "Spatial Audio", "Crowd Simulation", "Haptic Feedback"],
        accessibility: {
          wheelchair: "Elevator access, platform edge alerts, gap assistance",
          visual: "Audio cues, tactile navigation, voice guidance", 
          hearing: "Visual alerts, vibration feedback, captions"
        }
      }
    ],
    social_events: [
      {
        id: "shopping_mall_3d",
        name: "Shopping Mall Food Court",
        description: "Navigate and interact in a realistic shopping mall environment",
        difficulty: "Advanced",
        duration: "15-20 min",
        vr_features: ["Multi-vendor Navigation", "Ordering Systems", "Crowd Interaction"],
        accessibility: {
          wheelchair: "Accessible seating, counter heights, clear pathways",
          visual: "Audio menus, spatial navigation aids",
          hearing: "Visual ordering systems, digital displays"
        }
      }
    ],
    daily_activities: [
      {
        id: "hospital_3d",
        name: "Hospital Reception Area",
        description: "Practice navigating healthcare facilities independently",
        difficulty: "Beginner",
        duration: "12-18 min",
        vr_features: ["Reception Interaction", "Wayfinding", "Appointment Systems"],
        accessibility: {
          wheelchair: "Accessible layouts, lowered counters, wide corridors",
          visual: "Audio announcements, tactile guidance systems",
          hearing: "Visual paging systems, text-based communication"
        }
      }
    ]
  }
};

// Application State
let appState = {
  currentScreen: 'welcome-screen',
  currentStep: 1,
  selectedDevice: null,
  selectedNeeds: [],
  selectedGoals: [],
  vrSession: null,
  vrSupported: false,
  is3DMode: false,
  currentScenario: null,
  interactiveObjects: new Map(),
  audioContext: null,
  userProgress: {
    scenariosCompleted: 0,
    practiceTime: 0,
    achievements: 0
  },
  settings: {
    teleportation: true,
    snapTurning: true,
    comfortVignette: true,
    voiceGuidance: true,
    highContrast: false,
    hapticFeedback: true,
    fieldOfView: 90,
    audioVolume: 75,
    spatialAudio: true
  }
};

// Three.js Scene Variables
let heroScene, heroCamera, heroRenderer;
let vrScene, vrCamera, vrRenderer;
const scenes = new Map();
const materials = new Map();
let raycaster, mouse;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing Enhanced AccessibilityVR...');
  
  try {
    initializeApp();
    setupEventListeners();
    checkVRSupport();
    initializeAudioSystem();
    initializeThreeJS();
    createRealisticMaterials();
    
    console.log('✅ Application initialized successfully');
    announceToScreenReader('AccessibilityVR platform loaded with realistic environments');
  } catch (error) {
    console.error('❌ Error initializing application:', error);
    showError('Failed to initialize application. Please refresh the page.');
  }
});

// App Initialization
function initializeApp() {
  showScreen('welcome-screen');
  updateProgressStats();
  
  // Initialize interaction system
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
}

// Audio System Initialization
function initializeAudioSystem() {
  try {
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      appState.audioContext = new AudioCtx();
      
      const gainNode = appState.audioContext.createGain();
      gainNode.gain.value = appState.settings.audioVolume / 100;
      gainNode.connect(appState.audioContext.destination);
      window.audioGainNode = gainNode;
      
      console.log('✅ Audio system initialized');
    }
  } catch (error) {
    console.warn('⚠️ Audio system not available:', error);
  }
}

// Event Listeners Setup
function setupEventListeners() {
  console.log('🔧 Setting up event listeners...');
  
  // Welcome Screen buttons
  const tryVRDemoBtn = document.getElementById('try-vr-demo-btn');
  if (tryVRDemoBtn) {
    tryVRDemoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Try VR Demo clicked');
      addEnhancedButtonFeedback(this);
      playInteractionSound('button_press');
      startVRDemo();
    });
    console.log('Try VR Demo button listener attached');
  }
  
  const getStartedBtn = document.getElementById('get-started-btn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Get Started clicked');
      addEnhancedButtonFeedback(this);
      playInteractionSound('button_press');
      showScreen('setup-screen');
    });
    console.log('Get Started button listener attached');
  }
  
  // Setup screen buttons
  const setupNextBtn = document.getElementById('setup-next');
  if (setupNextBtn) {
    setupNextBtn.addEventListener('click', handleSetupNext);
  }
  
  const setupBackBtn = document.getElementById('setup-back');
  if (setupBackBtn) {
    setupBackBtn.addEventListener('click', handleSetupBack);
  }
  
  // Device cards
  document.querySelectorAll('.device-card').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Device card clicked:', this.dataset.device);
      selectDevice(this.dataset.device);
      addCardSelectionFeedback(this);
      playInteractionSound('select');
    });
  });
  
  // Dashboard buttons
  const vrModeToggleBtn = document.getElementById('vr-mode-toggle');
  if (vrModeToggleBtn) {
    vrModeToggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('VR Mode Toggle clicked');
      addEnhancedButtonFeedback(this);
      playInteractionSound('vr_activate');
      toggleVRMode();
    });
  }
  
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showScreen('settings-screen');
    });
  }
  
  // Scenario categories
  document.querySelectorAll('.scenario-category').forEach(category => {
    category.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Scenario category clicked:', this.dataset.category);
      addScenarioSelectionFeedback(this);
      playInteractionSound('scenario_select');
      enterScenario(this.dataset.category);
    });
  });
  
  // VR Experience controls
  const exitVRBtn = document.getElementById('exit-vr');
  if (exitVRBtn) {
    exitVRBtn.addEventListener('click', function(e) {
      e.preventDefault();
      exitVRExperience();
    });
  }
  
  // VR control buttons
  document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      addControlButtonFeedback(this);
      playInteractionSound('control_activate');
      handleVRControl(this.dataset.action);
    });
  });
  
  // Spatial buttons
  document.querySelectorAll('.spatial-button').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      handleSpatialAction(this.dataset.action);
    });
  });
  
  // Settings
  const backToDashboardBtn = document.getElementById('back-to-dashboard');
  if (backToDashboardBtn) {
    backToDashboardBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showScreen('dashboard-screen');
    });
  }
  
  // Settings toggles
  document.querySelectorAll('.setting-toggle').forEach(toggle => {
    toggle.addEventListener('change', function() {
      handleSettingChange(this.id, this.checked);
      addToggleFeedback(this);
      playInteractionSound(this.checked ? 'toggle_on' : 'toggle_off');
    });
  });
  
  // Modal buttons
  const try3DModeBtn = document.getElementById('try-3d-mode');
  if (try3DModeBtn) {
    try3DModeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Try 3D Mode clicked');
      addEnhancedButtonFeedback(this);
      enable3DMode();
    });
  }
  
  const closeVRModalBtn = document.getElementById('close-vr-modal');
  if (closeVRModalBtn) {
    closeVRModalBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }
  
  // Add hover effects to all buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      addHoverEffect(this);
      playInteractionSound('hover');
    });
    
    btn.addEventListener('mouseleave', function() {
      removeHoverEffect(this);
    });
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);
  
  console.log('✅ Event listeners set up successfully');
}

// Enhanced Button Feedback Functions
function addEnhancedButtonFeedback(button) {
  if (!button) return;
  
  button.style.transform = 'scale(0.95)';
  button.style.filter = 'brightness(1.1)';
  button.style.transition = 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Create ripple effect
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    left: 50%;
    top: 50%;
    width: 100px;
    height: 100px;
    margin-left: -50px;
    margin-top: -50px;
    pointer-events: none;
    z-index: 1;
  `;
  
  button.style.position = 'relative';
  button.appendChild(ripple);
  
  setTimeout(() => {
    button.style.transform = 'scale(1)';
    button.style.filter = 'brightness(1)';
    if (ripple.parentNode) {
      ripple.remove();
    }
  }, 150);
  
  // Haptic feedback
  if (navigator.vibrate && appState.settings.hapticFeedback) {
    navigator.vibrate(50);
  }
}

function addHoverEffect(element) {
  element.style.transform = 'translateY(-2px)';
  element.style.filter = 'brightness(1.05)';
  element.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
  element.style.transition = 'all 0.3s ease';
}

function removeHoverEffect(element) {
  element.style.transform = 'translateY(0)';
  element.style.filter = 'brightness(1)';
  element.style.boxShadow = '';
}

function addCardSelectionFeedback(card) {
  card.style.transform = 'scale(0.98)';
  card.style.borderColor = 'var(--color-primary)';
  card.style.backgroundColor = 'var(--color-bg-1)';
  card.style.boxShadow = '0 0 20px rgba(31, 184, 205, 0.4)';
  card.style.transition = 'all 0.2s ease';
  
  setTimeout(() => {
    card.style.transform = 'scale(1)';
  }, 200);
}

function addScenarioSelectionFeedback(scenario) {
  scenario.style.transform = 'translateY(-4px) scale(1.02)';
  scenario.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
  scenario.style.borderColor = 'var(--color-primary)';
  scenario.style.transition = 'all 0.3s ease';
  
  const arrow = scenario.querySelector('.action-arrow');
  if (arrow) {
    arrow.style.transform = 'translateX(8px) scale(1.2)';
    arrow.style.color = 'var(--color-primary)';
  }
  
  setTimeout(() => {
    scenario.style.transform = 'translateY(-2px) scale(1)';
    if (arrow) {
      arrow.style.transform = 'translateX(4px) scale(1)';
    }
  }, 300);
}

function addControlButtonFeedback(btn) {
  btn.style.transform = 'scale(0.9)';
  btn.style.background = 'rgba(31, 184, 205, 0.3)';
  btn.style.transition = 'all 0.15s ease';
  
  setTimeout(() => {
    btn.style.transform = 'scale(1)';
    btn.style.background = '';
  }, 150);
}

function addToggleFeedback(toggle) {
  toggle.style.transform = 'scale(1.1)';
  setTimeout(() => {
    toggle.style.transform = 'scale(1)';
  }, 150);
}

// Sound System
function playInteractionSound(soundType) {
  if (!appState.audioContext) return;
  
  try {
    // Resume audio context if suspended
    if (appState.audioContext.state === 'suspended') {
      appState.audioContext.resume();
    }
    
    const oscillator = appState.audioContext.createOscillator();
    const gainNode = appState.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(window.audioGainNode || appState.audioContext.destination);
    
    let frequency, duration, type = 'sine';
    
    switch (soundType) {
      case 'button_press':
        frequency = 800;
        duration = 0.1;
        break;
      case 'hover':
        frequency = 1000;
        duration = 0.05;
        break;
      case 'select':
        frequency = 600;
        duration = 0.2;
        break;
      case 'vr_activate':
        frequency = 500;
        duration = 0.3;
        type = 'square';
        break;
      case 'scenario_select':
        frequency = 400;
        duration = 0.25;
        break;
      case 'toggle_on':
        frequency = 700;
        duration = 0.15;
        break;
      case 'toggle_off':
        frequency = 500;
        duration = 0.15;
        break;
      default:
        frequency = 600;
        duration = 0.1;
    }
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, appState.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, appState.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, appState.audioContext.currentTime + duration);
    
    oscillator.start(appState.audioContext.currentTime);
    oscillator.stop(appState.audioContext.currentTime + duration);
    
  } catch (error) {
    console.warn('Could not play interaction sound:', error);
  }
}

// Create Realistic Materials
function createRealisticMaterials() {
  console.log('🎨 Creating realistic materials...');
  
  // Floor Materials
  materials.set('marble_floor', new THREE.MeshPhysicalMaterial({
    color: 0xe8e8e8,
    metalness: 0.1,
    roughness: 0.2,
    reflectivity: 0.8
  }));
  
  materials.set('concrete_floor', new THREE.MeshLambertMaterial({
    color: 0xcccccc
  }));
  
  // Wall Materials
  materials.set('painted_wall', new THREE.MeshLambertMaterial({
    color: 0xf5f5f5
  }));
  
  materials.set('tile_wall', new THREE.MeshLambertMaterial({
    color: 0x4a90e2
  }));
  
  // Interactive Materials
  materials.set('button_default', new THREE.MeshPhysicalMaterial({
    color: 0x666666,
    metalness: 0.8,
    roughness: 0.2
  }));
  
  materials.set('button_hover', new THREE.MeshPhysicalMaterial({
    color: 0x1fb8cd,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x1fb8cd,
    emissiveIntensity: 0.2
  }));
  
  materials.set('safety_yellow', new THREE.MeshLambertMaterial({
    color: 0xffff00
  }));
  
  materials.set('emergency_red', new THREE.MeshLambertMaterial({
    color: 0xff0000,
    emissive: 0x330000,
    emissiveIntensity: 0.3
  }));
  
  console.log('✅ Materials created');
}

// Three.js Initialization
function initializeThreeJS() {
  console.log('🎮 Initializing Three.js...');
  
  try {
    initializeHeroScene();
    initializeCategoryPreviews();
    console.log('✅ Three.js initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Three.js:', error);
  }
}

function initializeHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) {
    console.warn('Hero canvas not found');
    return;
  }
  
  console.log('Initializing hero scene...');
  
  // Scene setup
  heroScene = new THREE.Scene();
  heroScene.background = new THREE.Color(0x87ceeb);
  heroScene.fog = new THREE.Fog(0x87ceeb, 10, 100);
  
  // Camera
  heroCamera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  heroCamera.position.set(0, 3, 8);
  
  // Renderer
  heroRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  heroRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
  heroRenderer.shadowMap.enabled = true;
  heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Lighting
  setupRealisticLighting(heroScene);
  
  // Create demo environment
  createDetailedDemoEnvironment(heroScene);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.0002;
    heroCamera.position.x = Math.cos(time) * 8;
    heroCamera.position.z = Math.sin(time) * 8;
    heroCamera.position.y = 3 + Math.sin(time * 0.5) * 1;
    heroCamera.lookAt(0, 1, 0);
    
    // Animate interactive objects
    heroScene.children.forEach(child => {
      if (child.userData.animate) {
        child.userData.animate(time);
      }
    });
    
    heroRenderer.render(heroScene, heroCamera);
  }
  
  animate();
  
  console.log('Hero scene initialized successfully');
}

function setupRealisticLighting(scene) {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);
  
  // Main directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(20, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);
  
  // Point lights
  const pointLight1 = new THREE.PointLight(0xffffcc, 0.8, 30);
  pointLight1.position.set(5, 8, 5);
  pointLight1.castShadow = true;
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xffffcc, 0.8, 30);
  pointLight2.position.set(-5, 8, -5);
  pointLight2.castShadow = true;
  scene.add(pointLight2);
}

function createDetailedDemoEnvironment(scene) {
  // Platform
  const platformGeometry = new THREE.BoxGeometry(40, 0.5, 12);
  const platformMaterial = materials.get('concrete_floor') || new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.y = -0.25;
  platform.receiveShadow = true;
  platform.castShadow = true;
  scene.add(platform);
  
  // Train
  const trainGeometry = new THREE.BoxGeometry(25, 3, 2.8);
  const trainMaterial = new THREE.MeshLambertMaterial({ color: 0x1fb8cd });
  const train = new THREE.Mesh(trainGeometry, trainMaterial);
  train.position.set(0, 1.5, 4);
  train.castShadow = true;
  scene.add(train);
  
  // Safety line
  const lineGeometry = new THREE.BoxGeometry(40, 0.02, 0.4);
  const lineMaterial = materials.get('safety_yellow') || new THREE.MeshLambertMaterial({ color: 0xffff00 });
  const safetyLine = new THREE.Mesh(lineGeometry, lineMaterial);
  safetyLine.position.set(0, 0.01, 5.5);
  scene.add(safetyLine);
  
  // Interactive elements
  createInteractiveElements(scene);
  
  // Accessibility features
  createAccessibilityFeatures(scene);
}

function createInteractiveElements(scene) {
  // Ticket machines
  for (let i = 0; i < 3; i++) {
    const machine = createTicketMachine(scene, i);
    appState.interactiveObjects.set(`ticket_machine_${i}`, machine);
  }
  
  // Information kiosk
  const kiosk = createInformationKiosk(scene);
  appState.interactiveObjects.set('info_kiosk', kiosk);
  
  // Emergency box
  const emergencyBox = createEmergencyCallBox(scene);
  appState.interactiveObjects.set('emergency_box', emergencyBox);
}

function createTicketMachine(scene, index) {
  const group = new THREE.Group();
  
  // Main body
  const bodyGeometry = new THREE.BoxGeometry(1.2, 2, 0.6);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  group.add(body);
  
  // Screen
  const screenGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.05);
  const screenMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x000080, 
    emissive: 0x000040
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 0.4, 0.31);
  group.add(screen);
  
  // Buttons
  for (let j = 0; j < 4; j++) {
    const buttonGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05);
    const buttonMaterial = materials.get('button_default') || new THREE.MeshLambertMaterial({ color: 0x666666 });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(-0.3 + j * 0.2, -0.2, 0.31);
    button.userData = { 
      interactive: true, 
      type: 'ticket_button',
      machineIndex: index,
      buttonIndex: j
    };
    group.add(button);
    
    appState.interactiveObjects.set(`button_${index}_${j}`, button);
  }
  
  group.position.set(-15 + index * 2, 1, -5);
  group.userData = { 
    interactive: true, 
    type: 'ticket_machine',
    index: index
  };
  
  scene.add(group);
  return group;
}

function createInformationKiosk(scene) {
  const group = new THREE.Group();
  
  // Post
  const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5);
  const postMaterial = new THREE.MeshLambertMaterial({ color: 0x4169e1 });
  const post = new THREE.Mesh(postGeometry, postMaterial);
  post.castShadow = true;
  group.add(post);
  
  // Screen
  const screenGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.02);
  const screenMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x001144, 
    emissive: 0x001122
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 1.8, 0.16);
  screen.userData = { 
    interactive: true, 
    type: 'kiosk_screen',
    animate: (time) => {
      screen.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
    }
  };
  group.add(screen);
  
  group.position.set(8, 1.25, -3);
  group.userData = { 
    interactive: true, 
    type: 'information_kiosk'
  };
  
  scene.add(group);
  return group;
}

function createEmergencyCallBox(scene) {
  const group = new THREE.Group();
  
  // Main box
  const boxGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.4);
  const boxMaterial = materials.get('emergency_red') || new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.castShadow = true;
  group.add(box);
  
  // Button
  const buttonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05);
  const buttonMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button.position.set(0, 0.2, 0.21);
  button.userData = { 
    interactive: true, 
    type: 'emergency_button'
  };
  group.add(button);
  
  group.position.set(-8, 2, -5.5);
  group.userData = { 
    interactive: true, 
    type: 'emergency_box'
  };
  
  scene.add(group);
  return group;
}

function createAccessibilityFeatures(scene) {
  // Tactile strips
  for (let i = -18; i <= 18; i += 2) {
    const stripGeometry = new THREE.BoxGeometry(0.8, 0.03, 0.8);
    const stripMaterial = new THREE.MeshLambertMaterial({ color: 0xff6600 });
    const strip = new THREE.Mesh(stripGeometry, stripMaterial);
    strip.position.set(i, 0.015, 5);
    strip.receiveShadow = true;
    scene.add(strip);
  }
  
  // Grab bars
  for (let i = 0; i < 3; i++) {
    const barGeometry = new THREE.CylinderGeometry(0.04, 0.04, 2);
    const barMaterial = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.set(-10 + i * 5, 1.2, -5.8);
    bar.rotation.z = Math.PI / 2;
    bar.castShadow = true;
    scene.add(bar);
  }
}

function initializeCategoryPreviews() {
  const canvases = document.querySelectorAll('.category-canvas');
  console.log(`Found ${canvases.length} category canvases`);
  
  canvases.forEach((canvas, index) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    
    renderer.setSize(120, 90);
    renderer.setClearColor(0x000000, 0);
    
    // Create preview environments
    createPreviewEnvironment(scene, index);
    camera.position.set(0, 2, 3);
    camera.lookAt(0, 0, 0);
    
    // Animation
    function animate() {
      requestAnimationFrame(animate);
      scene.rotation.y += 0.005;
      renderer.render(scene, camera);
    }
    animate();
  });
}

function createPreviewEnvironment(scene, type) {
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  const colors = [0x1fb8cd, 0xffc185, 0xb4413c];
  const color = colors[type % colors.length] || 0x1fb8cd;
  
  // Create environment based on type
  if (type === 0) {
    createSubwayPreview(scene);
  } else if (type === 1) {
    createMallPreview(scene);
  } else {
    createHospitalPreview(scene);
  }
}

function createSubwayPreview(scene) {
  // Platform
  const platformGeometry = new THREE.BoxGeometry(3, 0.2, 2);
  const platformMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.y = -0.1;
  scene.add(platform);
  
  // Train
  const trainGeometry = new THREE.BoxGeometry(2, 0.8, 0.6);
  const trainMaterial = new THREE.MeshLambertMaterial({ color: 0x1fb8cd });
  const train = new THREE.Mesh(trainGeometry, trainMaterial);
  train.position.set(0, 0.4, 1.3);
  scene.add(train);
  
  // Safety line
  const lineGeometry = new THREE.BoxGeometry(3, 0.01, 0.1);
  const lineMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
  const line = new THREE.Mesh(lineGeometry, lineMaterial);
  line.position.set(0, 0.01, 0.5);
  scene.add(line);
}

function createMallPreview(scene) {
  // Table
  const tableGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1);
  const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  table.position.y = 0.5;
  scene.add(table);
  
  // Chairs
  for (let i = 0; i < 3; i++) {
    const chairGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const chair = new THREE.Mesh(chairGeometry, chairMaterial);
    chair.position.set(
      Math.cos(i * 2.1) * 1.2,
      0.15,
      Math.sin(i * 2.1) * 1.2
    );
    scene.add(chair);
  }
}

function createHospitalPreview(scene) {
  // Reception desk
  const deskGeometry = new THREE.BoxGeometry(2, 0.8, 1);
  const deskMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const desk = new THREE.Mesh(deskGeometry, deskMaterial);
  desk.position.set(0, 0.4, 0);
  scene.add(desk);
  
  // Chairs
  for (let i = 0; i < 4; i++) {
    const chairGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x4169e1 });
    const chair = new THREE.Mesh(chairGeometry, chairMaterial);
    chair.position.set(-1.5 + i * 1, 0.2, 1.5);
    scene.add(chair);
  }
}

// Screen Management
function showScreen(screenId) {
  console.log(`📱 Switching to screen: ${screenId}`);
  
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    appState.currentScreen = screenId;
    
    // Screen-specific initialization
    if (screenId === 'dashboard-screen') {
      initializeDashboard();
    } else if (screenId === 'vr-experience-screen') {
      initializeVRExperience();
    }
    
    announceToScreenReader(`Navigated to ${screenId.replace('-', ' ')}`);
  }
}

// Setup Functions
function handleSetupNext() {
  const currentStep = appState.currentStep;
  const maxSteps = 3;
  
  if (currentStep < maxSteps) {
    if (validateCurrentStep()) {
      appState.currentStep++;
      updateSetupStep();
      playInteractionSound('select');
    } else {
      announceToScreenReader('Please make a selection before continuing');
    }
  } else {
    completeSetup();
  }
}

function handleSetupBack() {
  if (appState.currentStep > 1) {
    appState.currentStep--;
    updateSetupStep();
    playInteractionSound('button_press');
  }
}

function updateSetupStep() {
  const steps = document.querySelectorAll('.step');
  const stepContents = document.querySelectorAll('.step-content');
  
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.toggle('active', stepNumber === appState.currentStep);
    step.classList.toggle('completed', stepNumber < appState.currentStep);
  });
  
  stepContents.forEach((content, index) => {
    content.classList.toggle('active', index + 1 === appState.currentStep);
  });
  
  const backBtn = document.getElementById('setup-back');
  const nextBtn = document.getElementById('setup-next');
  
  if (backBtn) backBtn.disabled = appState.currentStep === 1;
  if (nextBtn) {
    nextBtn.textContent = appState.currentStep === 3 ? 'Start Training' : 'Next';
  }
}

function validateCurrentStep() {
  switch (appState.currentStep) {
    case 1:
      return appState.selectedDevice !== null;
    case 2:
      return true;
    case 3:
      return true;
    default:
      return true;
  }
}

function selectDevice(deviceId) {
  appState.selectedDevice = deviceId;
  
  document.querySelectorAll('.device-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.device === deviceId);
  });
  
  const nextBtn = document.getElementById('setup-next');
  if (nextBtn) nextBtn.disabled = false;
  
  announceToScreenReader(`Selected ${deviceId.replace('_', ' ')} device`);
}

function completeSetup() {
  console.log('🎯 Setup completed');
  
  showLoadingScreen('Setting up your personalized VR experience...');
  
  setTimeout(() => {
    hideLoadingScreen();
    showScreen('dashboard-screen');
    announceToScreenReader('Setup complete! Welcome to your training dashboard.');
  }, 2000);
}

// Dashboard Functions
function initializeDashboard() {
  updateProgressStats();
  initializeProgressChart();
}

function updateProgressStats() {
  const stats = appState.userProgress;
  
  const scenariosElement = document.getElementById('scenarios-completed');
  const hoursElement = document.getElementById('hours-practiced');
  const achievementsElement = document.getElementById('achievements-count');
  
  if (scenariosElement) scenariosElement.textContent = stats.scenariosCompleted;
  if (hoursElement) hoursElement.textContent = `${Math.floor(stats.practiceTime / 60)}h`;
  if (achievementsElement) achievementsElement.textContent = stats.achievements;
}

function initializeProgressChart() {
  const canvas = document.getElementById('progress-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Subway Stations', 'Shopping Malls', 'Hospitals', 'Restaurants'],
      datasets: [{
        data: [25, 35, 20, 20],
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 11 }
          }
        }
      },
      cutout: '60%'
    }
  });
}

// VR Functions
function startVRDemo() {
  console.log('🚀 Starting VR demo...');
  
  showLoadingScreen('Initializing realistic VR environment...');
  
  setTimeout(() => {
    hideLoadingScreen();
    
    if (appState.vrSupported) {
      try {
        enterVRMode();
      } catch (error) {
        console.error('Failed to start VR:', error);
        showVRNotSupportedModal();
      }
    } else {
      showVRNotSupportedModal();
    }
  }, 1500);
}

async function toggleVRMode() {
  if (appState.vrSession) {
    await exitVRMode();
  } else {
    await enterVRMode();
  }
}

async function enterVRMode() {
  console.log('🥽 Entering VR mode...');
  
  showLoadingScreen('Loading realistic 3D environment...');
  
  try {
    if (appState.vrSupported) {
      const session = await navigator.xr.requestSession('immersive-vr');
      appState.vrSession = session;
      
      hideLoadingScreen();
      showScreen('vr-experience-screen');
    } else {
      hideLoadingScreen();
      enable3DMode();
    }
  } catch (error) {
    console.error('Failed to enter VR:', error);
    hideLoadingScreen();
    showVRNotSupportedModal();
  }
}

function enable3DMode() {
  console.log('🎮 Enabling 3D mode...');
  appState.is3DMode = true;
  closeModal();
  showScreen('vr-experience-screen');
  initializeVRExperience();
  announceToScreenReader('Entered enhanced 3D mode with realistic environments');
}

function initializeVRExperience() {
  const canvas = document.getElementById('vr-canvas');
  if (!canvas) return;
  
  // Create VR scene
  vrScene = new THREE.Scene();
  vrScene.background = new THREE.Color(0x87ceeb);
  vrScene.fog = new THREE.Fog(0x87ceeb, 20, 100);
  
  vrCamera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  vrRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  
  vrRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
  vrRenderer.shadowMap.enabled = true;
  vrRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  vrCamera.position.set(0, 1.7, -8);
  
  // Setup lighting and environment
  setupRealisticLighting(vrScene);
  createDetailedSubwayStation(vrScene);
  
  // Setup controls
  if (appState.is3DMode) {
    setupEnhancedMouseControls(vrCamera, canvas);
  }
  
  // Setup interactions
  setupEnhancedInteractions(vrScene, vrCamera, canvas);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Update interactive objects
    updateInteractiveObjects();
    
    vrRenderer.render(vrScene, vrCamera);
  }
  animate();
  
  // Start scenario
  startVRScenario('subway_3d');
  
  scenes.set('vr', { scene: vrScene, camera: vrCamera, renderer: vrRenderer });
}

function createDetailedSubwayStation(scene) {
  // Large platform
  const platformGeometry = new THREE.BoxGeometry(60, 0.5, 12);
  const platformMaterial = materials.get('concrete_floor') || new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.y = -0.25;
  platform.receiveShadow = true;
  scene.add(platform);
  
  // Walls
  const wallGeometry = new THREE.BoxGeometry(60, 8, 1);
  const wallMaterial = materials.get('painted_wall') || new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
  const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
  backWall.position.set(0, 4, -6);
  backWall.receiveShadow = true;
  scene.add(backWall);
  
  // Train
  const trainGeometry = new THREE.BoxGeometry(40, 3.5, 3.2);
  const trainMaterial = new THREE.MeshLambertMaterial({ color: 0x1fb8cd });
  const train = new THREE.Mesh(trainGeometry, trainMaterial);
  train.position.set(0, 1.75, 8);
  train.castShadow = true;
  scene.add(train);
  
  // Interactive elements
  createInteractiveStations(scene);
  createAccessibilityInfrastructure(scene);
}

function createInteractiveStations(scene) {
  // Ticket machines
  for (let i = 0; i < 3; i++) {
    const machine = createTicketMachine(scene, i);
    appState.interactiveObjects.set(`vr_ticket_machine_${i}`, machine);
  }
  
  // Information kiosk
  const kiosk = createInformationKiosk(scene);
  kiosk.position.set(10, 1.25, -4);
  appState.interactiveObjects.set('vr_info_kiosk', kiosk);
  
  // Emergency box
  const emergencyBox = createEmergencyCallBox(scene);
  emergencyBox.position.set(-15, 2, -5);
  appState.interactiveObjects.set('vr_emergency_box', emergencyBox);
}

function createAccessibilityInfrastructure(scene) {
  // Tactile warning strips
  for (let i = -25; i <= 25; i += 2) {
    const stripGeometry = new THREE.BoxGeometry(1, 0.03, 1);
    const stripMaterial = new THREE.MeshLambertMaterial({ color: 0xff6600 });
    const strip = new THREE.Mesh(stripGeometry, stripMaterial);
    strip.position.set(i, 0.015, 5);
    strip.receiveShadow = true;
    scene.add(strip);
  }
  
  // Safety line
  const lineGeometry = new THREE.BoxGeometry(60, 0.02, 0.5);
  const lineMaterial = materials.get('safety_yellow') || new THREE.MeshLambertMaterial({ color: 0xffff00 });
  const safetyLine = new THREE.Mesh(lineGeometry, lineMaterial);
  safetyLine.position.set(0, 0.01, 5.5);
  scene.add(safetyLine);
  
  // Wheelchair ramp
  const rampGeometry = new THREE.BoxGeometry(4, 0.3, 6);
  const rampMaterial = materials.get('safety_yellow') || new THREE.MeshLambertMaterial({ color: 0xffff00 });
  const ramp = new THREE.Mesh(rampGeometry, rampMaterial);
  ramp.position.set(-20, 0.15, -2);
  ramp.rotation.x = -0.1;
  ramp.castShadow = true;
  scene.add(ramp);
}

function setupEnhancedInteractions(scene, camera, canvas) {
  let hoveredObject = null;
  
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (hoveredObject && hoveredObject !== intersects[0]?.object) {
      handleObjectHoverExit(hoveredObject);
      hoveredObject = null;
    }
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.userData.interactive && object !== hoveredObject) {
        handleObjectHoverEnter(object);
        hoveredObject = object;
      }
    }
  });
  
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.userData.interactive) {
        handleVRInteraction(object);
      }
    }
  });
}

function handleObjectHoverEnter(object) {
  object.material.emissive.setHex(0x444444);
  
  const canvas = document.getElementById('vr-canvas');
  if (canvas) canvas.style.cursor = 'pointer';
  
  playInteractionSound('hover');
  updateInteractionFeedback(`Click to interact with ${object.userData.type || 'object'}`);
}

function handleObjectHoverExit(object) {
  object.material.emissive.setHex(0x000000);
  
  const canvas = document.getElementById('vr-canvas');
  if (canvas) canvas.style.cursor = 'default';
}

function handleVRInteraction(object) {
  const type = object.userData.type;
  let message = '';
  
  // Visual feedback
  object.material.emissive.setHex(0x888888);
  setTimeout(() => {
    object.material.emissive.setHex(0x000000);
  }, 300);
  
  switch (type) {
    case 'ticket_machine':
      message = 'Ticket machine activated. Processing your transaction...';
      showTicketMachineInterface();
      break;
    case 'ticket_button':
      message = `Button ${object.userData.buttonIndex + 1} pressed on machine ${object.userData.machineIndex + 1}`;
      break;
    case 'information_kiosk':
    case 'kiosk_screen':
      message = 'Information display activated. Showing subway map and schedules.';
      break;
    case 'emergency_box':
    case 'emergency_button':
      message = 'Emergency call box activated. Help is on the way.';
      break;
    default:
      message = `Interacted with ${type || 'object'}.`;
  }
  
  updateInteractionFeedback(message);
  announceToScreenReader(message);
  playInteractionSound('vr_activate');
  
  // Haptic feedback
  if (navigator.vibrate && appState.settings.hapticFeedback) {
    navigator.vibrate([100, 50, 100]);
  }
  
  updateVRProgress();
}

function showTicketMachineInterface() {
  const feedback = document.getElementById('interaction-feedback');
  if (feedback) {
    feedback.innerHTML = `
      <div class="ticket-interface">
        <h3>Metro Ticket System</h3>
        <p>Select your destination:</p>
        <div style="margin: 10px 0;">
          <strong>Downtown - $3.50</strong><br>
          <strong>Airport - $6.25</strong><br>
          <strong>University - $2.75</strong>
        </div>
        <p>Transaction complete! Ticket dispensed.</p>
      </div>
    `;
    
    setTimeout(() => {
      updateInteractionFeedback('Ticket purchased successfully! You can now board the train.');
    }, 3000);
  }
}

function setupEnhancedMouseControls(camera, canvas) {
  let isMouseDown = false;
  let mouseX = 0;
  let mouseY = 0;
  
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) { // Right click
      isMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
  
  canvas.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;
    
    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;
    
    camera.rotation.y -= deltaX * 0.002;
    camera.rotation.x -= deltaY * 0.002;
    
    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
    
    mouseX = event.clientX;
    mouseY = event.clientY;
  });
  
  // Keyboard movement
  const keys = {};
  document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
  document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
  
  function updateMovement() {
    const speed = 0.15;
    
    if (keys['w'] || keys['arrowup']) {
      camera.position.x -= Math.sin(camera.rotation.y) * speed;
      camera.position.z -= Math.cos(camera.rotation.y) * speed;
    }
    if (keys['s'] || keys['arrowdown']) {
      camera.position.x += Math.sin(camera.rotation.y) * speed;
      camera.position.z += Math.cos(camera.rotation.y) * speed;
    }
    if (keys['a'] || keys['arrowleft']) {
      camera.position.x -= Math.cos(camera.rotation.y) * speed;
      camera.position.z += Math.sin(camera.rotation.y) * speed;
    }
    if (keys['d'] || keys['arrowright']) {
      camera.position.x += Math.cos(camera.rotation.y) * speed;
      camera.position.z -= Math.sin(camera.rotation.y) * speed;
    }
    
    // Boundary checking
    camera.position.x = Math.max(-28, Math.min(28, camera.position.x));
    camera.position.z = Math.max(-30, Math.min(15, camera.position.z));
    camera.position.y = Math.max(0.5, Math.min(10, camera.position.y));
    
    requestAnimationFrame(updateMovement);
  }
  updateMovement();
}

function startVRScenario(scenarioId) {
  const scenario = findScenario(scenarioId);
  if (!scenario) return;
  
  appState.currentScenario = scenario;
  
  const titleElement = document.getElementById('vr-scenario-title');
  const progressTextElement = document.getElementById('vr-progress-text');
  const progressFillElement = document.getElementById('vr-progress-fill');
  
  if (titleElement) titleElement.textContent = scenario.name;
  if (progressTextElement) progressTextElement.textContent = 'Step 1 of 5';
  if (progressFillElement) progressFillElement.style.width = '20%';
  
  updateInteractionFeedback(`Welcome to the realistic ${scenario.name}. Use WASD keys to move, right-click and drag to look around, and click on interactive objects.`);
  
  setTimeout(() => {
    const spatialMenu = document.getElementById('spatial-menu');
    if (spatialMenu) {
      spatialMenu.classList.remove('hidden');
    }
  }, 2000);
  
  announceToScreenReader(`Started ${scenario.name} scenario with realistic environments`);
}

function findScenario(scenarioId) {
  for (const category of Object.values(appData.scenarios)) {
    const scenario = category.find(s => s.id === scenarioId);
    if (scenario) return scenario;
  }
  return appData.scenarios.public_spaces[0]; // Fallback
}

// Scenario Management
function enterScenario(categoryId) {
  console.log(`🎬 Entering scenario: ${categoryId}`);
  
  const scenarios = appData.scenarios[categoryId];
  if (scenarios && scenarios.length > 0) {
    const scenario = scenarios[0];
    appState.currentScenario = scenario;
    
    showLoadingScreen(`Loading realistic ${scenario.name}...`);
    
    setTimeout(() => {
      hideLoadingScreen();
      if (appState.vrSupported) {
        enterVRMode();
      } else {
        enable3DMode();
      }
    }, 1500);
  }
}

// VR Controls
function handleVRControl(action) {
  console.log(`🎮 VR Control: ${action}`);
  
  document.querySelectorAll('.control-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.action === action);
  });
  
  let message = '';
  
  switch (action) {
    case 'teleport':
      message = 'Teleportation mode activated. Click where you want to move.';
      enableTeleportation();
      break;
    case 'turn':
      message = 'Snap turning enabled. Use arrow keys to turn.';
      break;
    case 'grab':
      message = 'Grab mode activated. Click and hold to grab objects.';
      break;
    case 'point':
      message = 'Pointing mode activated. Point at objects for information.';
      break;
    case 'audio':
      message = 'Audio guidance enabled. Listen for spatial audio cues.';
      break;
    case 'contrast':
      message = 'High contrast mode toggled for better visibility.';
      toggleHighContrast();
      break;
  }
  
  updateInteractionFeedback(message);
  announceToScreenReader(message);
}

function enableTeleportation() {
  const canvas = document.getElementById('vr-canvas');
  const scene = scenes.get('vr');
  
  if (!canvas || !scene) return;
  
  canvas.style.cursor = 'crosshair';
  
  const teleportHandler = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const z = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const worldX = Math.max(-25, Math.min(25, x * 15));
    const worldZ = Math.max(-25, Math.min(10, z * 15));
    
    scene.camera.position.x = worldX;
    scene.camera.position.z = worldZ;
    
    updateInteractionFeedback('Teleportation successful!');
    playInteractionSound('vr_activate');
    
    canvas.style.cursor = 'default';
    canvas.removeEventListener('click', teleportHandler);
  };
  
  canvas.addEventListener('click', teleportHandler);
}

function toggleHighContrast() {
  const vrSceneData = scenes.get('vr');
  if (vrSceneData) {
    vrSceneData.scene.children.forEach(child => {
      if (child.material) {
        if (appState.settings.highContrast) {
          child.material.color.multiplyScalar(0.8);
        } else {
          child.material.color.multiplyScalar(1.2);
        }
      }
    });
  }
  appState.settings.highContrast = !appState.settings.highContrast;
}

function handleSpatialAction(action) {
  let message = '';
  
  switch (action) {
    case 'navigate':
      message = 'Navigation help: Use WASD keys to move, mouse to look around.';
      break;
    case 'interact':
      message = 'Interactive elements are now highlighted in blue.';
      highlightInteractiveObjects();
      break;
    case 'help':
      message = 'Help: Click on ticket machines, emergency boxes, and information kiosks to interact.';
      break;
  }
  
  updateInteractionFeedback(message);
  announceToScreenReader(message);
}

function highlightInteractiveObjects() {
  appState.interactiveObjects.forEach(object => {
    if (object.material) {
      object.material.emissive.setHex(0x0066cc);
      setTimeout(() => {
        object.material.emissive.setHex(0x000000);
      }, 3000);
    }
  });
}

// Settings
function handleSettingChange(settingId, value) {
  const settingKey = settingId.replace('-toggle', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  appState.settings[settingKey] = value;
  
  announceToScreenReader(`${settingKey} ${value ? 'enabled' : 'disabled'}`);
}

// Utility Functions
function updateInteractiveObjects() {
  appState.interactiveObjects.forEach((object) => {
    if (object.userData.animate) {
      object.userData.animate(Date.now() * 0.001);
    }
  });
}

function updateVRProgress() {
  const progressFill = document.getElementById('vr-progress-fill');
  const progressText = document.getElementById('vr-progress-text');
  
  if (progressFill && progressText) {
    const currentProgress = parseInt(progressFill.style.width) || 20;
    const newProgress = Math.min(currentProgress + 20, 100);
    
    progressFill.style.width = `${newProgress}%`;
    progressText.textContent = `Step ${Math.ceil(newProgress / 20)} of 5`;
    
    if (newProgress >= 100) {
      setTimeout(() => {
        updateInteractionFeedback('Scenario completed! Excellent navigation of the accessibility features.');
        appState.userProgress.scenariosCompleted++;
      }, 1000);
    }
  }
}

function updateInteractionFeedback(message) {
  const feedbackElement = document.getElementById('feedback-text');
  if (feedbackElement) {
    feedbackElement.textContent = message;
  }
}

async function exitVRExperience() {
  console.log('🚪 Exiting VR experience...');
  
  if (appState.vrSession) {
    await appState.vrSession.end();
    appState.vrSession = null;
  }
  
  appState.is3DMode = false;
  appState.userProgress.scenariosCompleted++;
  appState.userProgress.practiceTime += 10;
  
  showScreen('dashboard-screen');
  announceToScreenReader('VR experience completed! Returned to dashboard.');
}

async function exitVRMode() {
  if (appState.vrSession) {
    await appState.vrSession.end();
  }
}

// Loading and Modal Functions
function showLoadingScreen(message) {
  const loadingScreen = document.getElementById('loading-screen');
  const statusElement = document.getElementById('loading-status');
  const fillElement = document.getElementById('loading-fill');
  const percentElement = document.getElementById('loading-percent');
  
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
    
    if (statusElement) statusElement.textContent = message;
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 100) progress = 100;
      
      if (fillElement) fillElement.style.width = `${progress}%`;
      if (percentElement) percentElement.textContent = `${Math.round(progress)}%`;
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 150);
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
}

function showVRNotSupportedModal() {
  const modal = document.getElementById('vr-not-supported-modal');
  if (modal) {
    modal.classList.remove('hidden');
    announceToScreenReader('VR not supported. You can try enhanced 3D mode instead.');
  }
}

function closeModal() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.add('hidden');
  });
}

// VR Support Detection
async function checkVRSupport() {
  console.log('🥽 Checking VR support...');
  
  try {
    if ('xr' in navigator) {
      const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
      appState.vrSupported = isSupported;
      
      if (isSupported) {
        console.log('✅ WebXR VR is supported');
        updateDeviceStatus('headset', 'VR Ready');
      } else {
        console.log('⚠️ WebXR VR not supported, 3D mode available');
        updateDeviceStatus('headset', '3D Mode Available');
      }
    } else {
      console.log('⚠️ WebXR not supported, 3D mode available');
      updateDeviceStatus('headset', '3D Mode Available');
      appState.vrSupported = false;
    }
  } catch (error) {
    console.error('❌ Error checking VR support:', error);
    appState.vrSupported = false;
    updateDeviceStatus('headset', '3D Mode Available');
  }
}

function updateDeviceStatus(deviceId, status) {
  const statusElements = document.querySelectorAll(`[data-device="${deviceId}"] .device-status`);
  statusElements.forEach(element => {
    element.textContent = status;
  });
}

// Keyboard Navigation
function handleKeyboardNavigation(event) {
  const { key } = event;
  
  if (key === 'Escape') {
    if (document.querySelector('.modal:not(.hidden)')) {
      closeModal();
      return;
    }
    
    if (appState.currentScreen === 'vr-experience-screen') {
      exitVRExperience();
    }
  }
  
  if (appState.currentScreen === 'vr-experience-screen') {
    switch (key.toLowerCase()) {
      case 'h':
        updateInteractionFeedback('Help: Use WASD to move, right-click and drag to look around, click objects to interact');
        break;
      case 'i':
        updateInteractionFeedback('Info: You are in a realistic subway station with working interactive elements');
        break;
    }
  }
}

// Screen Reader Support
function announceToScreenReader(message) {
  const announcer = document.getElementById('sr-announcements');
  if (announcer) {
    announcer.textContent = message;
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
}

// Error Handling
function showError(message) {
  console.error('❌ Error:', message);
  announceToScreenReader(`Error: ${message}`);
}

// Initialize
console.log('🎮 Enhanced AccessibilityVR script loaded');