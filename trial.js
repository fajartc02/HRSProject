import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Setup Scene
const scene = new THREE.Scene();

// Setup Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Setup Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft global light
scene.add(ambientLight);

// Add Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 5, 5);
scene.add(light);


// Load GLB Model
const loader = new GLTFLoader();

loader.load("ToyotaHRIS2.glb", (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  console.log("Model Loaded:", model);
}, undefined, (error) => {
  console.error("Error loading GLB:", error);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});