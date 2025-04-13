import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"; // Use lil-gui (recommended)

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Default Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);
scene.add(camera);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Load GLB Model
const loader = new GLTFLoader();
let mixer, model;
loader.load("ToyotaHRIS10.glb", (gltf) => {
  model = gltf.scene;
  model.scale.set(1, 1, 1);
  scene.add(model);

  // Setup Animation
  mixer = new THREE.AnimationMixer(model);
  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });

  console.log("GLB Loaded:", gltf);
});

// GUI Controls
const gui = new GUI();
const modelFolder = gui.addFolder("Model");
modelFolder.add(camera.position, "x", -10, 10, 0.1).name("Camera X");
modelFolder.add(camera.position, "y", -10, 10, 0.1).name("Camera Y");
modelFolder.add(camera.position, "z", -10, 10, 0.1).name("Camera Z");
modelFolder.open();

const lightFolder = gui.addFolder("Lighting");
lightFolder.add(directionalLight, "intensity", 0, 5, 0.1).name("Light Intensity");
lightFolder.open();

const animationFolder = gui.addFolder("Animation");
const settings = { speed: 1 };
animationFolder.add(settings, "speed", 0, 2, 0.01).name("Animation Speed");
animationFolder.open();

// Handle Window Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  if (mixer) mixer.update(0.016 * settings.speed); // Adjust animation speed

  controls.update();
  renderer.render(scene, camera);
}

animate();
