import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Create Scene and Renderer
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Default Camera (Used if animated camera is missing)
const defaultCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
defaultCamera.position.set(0, 2, 5);
scene.add(defaultCamera);

// OrbitControls for Default Camera
const controls = new OrbitControls(defaultCamera, renderer.domElement);
controls.enableDamping = true;

// Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft global light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 2, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffaa00, 1, 10);
pointLight.position.set(0, 2, 5);
scene.add(pointLight);

// Load GLB Model
const loader = new GLTFLoader();
let mixer, animatedCamera;

loader.load("ToyotaHRIS10.glb", (gltf) => {
  scene.add(gltf.scene);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e0e0);
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

  // Log Animations
  console.log("Animations:", gltf.animations.map(a => a.name));

  // Setup Animation Mixer
  mixer = new THREE.AnimationMixer(gltf.scene);
  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });

  // Get Animated Camera (If Available)
  console.log('camera', gltf.cameras)
  if (gltf.cameras.length > 0) {
    animatedCamera = gltf.cameras[0];
    scene.add(animatedCamera);
    console.log("Animated Camera Found:", animatedCamera);
  } else {
    console.warn("No animated camera found. Using default camera.");
  }
}, undefined, (error) => {
  console.error("Error loading GLB file:", error);
});

// Handle Window Resize
window.addEventListener("resize", () => {
  const currentCamera = animatedCamera || defaultCamera;
  currentCamera.aspect = window.innerWidth / window.innerHeight;
  currentCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  if (mixer) mixer.update(0.016); // Update animation
  controls.update(); // Update controls

  const currentCamera = animatedCamera || defaultCamera;
  renderer.render(scene, currentCamera);
}

animate();