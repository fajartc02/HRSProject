import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { OrbitControls } from 'three/examples/jsm/Addons.js';


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// for free scroll and zoom
const controls = new OrbitControls(camera, renderer.domElement);

// Enable scrolling & zooming
controls.enableZoom = true;   // Allow zooming with scroll
controls.enablePan = true;    // Allow moving the scene
controls.enableRotate = true; // Allow rotating the view

// Adjust damping for smooth movement
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;

// Create a floor using PlaneGeometry
const floorGeometry = new THREE.PlaneGeometry(1000, 1000); // Width & height
// const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide });
// const floor = new THREE.Mesh(floorGeometry, floorMaterial);

const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('floor.jpg'); // Replace with your texture file

const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorTexture, // Apply texture
  roughness: 0.8, // Adjust surface properties
});
// console.log('mass')
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
scene.add(floor);

// Rotate the floor to be horizontal
floor.rotation.x = -Math.PI / 2; // Rotate 90 degrees
floor.position.y = -4; // Set ground level

scene.add(floor);

// Load GLTF model
const loader = new GLTFLoader();
let mixer, actions = {}, activeAction, buttonMesh, buttonRMesh;

loader.load('Robot.glb', function (gltf) {
  const model = gltf.scene;
  // console.log('mass')
  // get all object name
  getAllObjectNames(model);
  scene.add(model);
  // Get all object names

  // Directional Light (Sun-like effect)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft light
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  // Set up animation mixer
  mixer = new THREE.AnimationMixer(model);
  buttonMesh = model.getObjectByName("HandL_1");
  buttonRMesh = model.getObjectByName("HandR_1");

  if (buttonMesh) {
    console.log("Button L found in model!");
  }
  if (buttonRMesh) {
    console.log('Button R found in model!')
  }
  gltf.animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    actions[clip.name] = action; // Store actions by name
  });

  // Start default animation
  if (actions['Walking']) {
    activeAction = actions['Walking'];
    activeAction.play();
  }
});

// Lighting
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);
camera.position.z = 10;
camera.position.y = 2;
camera.position.x = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(0.01);
  controls.update(); // Important for damping/smooth motion
  renderer.render(scene, camera);
}
animate();


function switchAnimation(newAction) {
  if (!newAction) {
    console.warn("Animation not found!");
    return;
  }
  if (activeAction !== newAction) {
    activeAction.fadeOut(0.5); // Smooth transition
    newAction.reset().fadeIn(0.5).play();
    activeAction = newAction;
  }
}

// Add event listeners
document.getElementById('idleBtn').addEventListener('click', () => switchAnimation(actions['Idle']));
document.getElementById('walkBtn').addEventListener('click', () => switchAnimation(actions['Walking']));
document.getElementById('runBtn').addEventListener('click', () => switchAnimation(actions['Running']));


function moveCamera(x, y, z) {
  gsap.to(camera.position, { x, y, z, duration: 1, ease: "power2.inOut" });
  gsap.to(camera, { onUpdate: () => camera.lookAt(0, 0, 0) });
}

document.getElementById('frontView').addEventListener('click', () => moveCamera(0, 0, 20));
document.getElementById('sideView').addEventListener('click', () => moveCamera(15, 2, 0));
document.getElementById('topView').addEventListener('click', () => moveCamera(0, 10, 0));

window.addEventListener("click", onClick);

function onClick(event) {
  // Convert mouse position to normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Cast a ray from the camera to the clicked point
  raycaster.setFromCamera(mouse, camera);

  const buttonMeshIntersects = raycaster.intersectObject(buttonMesh, true);
  const buttonRMeshIntersects = raycaster.intersectObject(buttonRMesh, true);
  changeObjectColor(buttonMesh, 0x00ff00);
  function changeObjectColor(object, color) {
    if (object && object.material) {
      object.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color) });
    }
  }
  if (buttonMeshIntersects.length > 0) {
    console.log("Button L clicked!");
    switchAnimation(actions['Running']);
    // triggerAnimation();
  }

  if (buttonRMeshIntersects.length > 0) {
    console.log("Button R clicked!");
    switchAnimation(actions['Idle']);
  }
}

import { gsap } from "gsap";
import { mod } from 'three/tsl';

function animateObject(expression) {
  switchAnimation(actions[expression]);
  // make zoom to object
  // gsap.to(camera.position, { x: 0, y: 0, z: 5, duration: 1, ease: "power2.inOut" });
  // gsap.to(camera, { onUpdate: () => camera.lookAt(0, 0, 5) });
  // gsap.to(object.rotation, { y: object.rotation.y + Math.PI, duration: 1 });
}

function getAllObjectNames(object) {
  // console.log('obj', object);
  object.traverse((child) => {
    // console.log(child)
    if (child.isMesh) {
      console.log("Object Name:", child.name);
    }
  });
}