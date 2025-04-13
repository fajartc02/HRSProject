import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'


let container, stats, clock, gui, mixer, actions, activeAction, previousAction;
let camera, scene, renderer, model, face, animatedCamera;

const api = { state: 'KotakGerak' };



init()
function init(selectedState) {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
  camera.position.set(0, 3, 10);
  // camera.position.set(- 5, 20, 60);
  camera.lookAt(0, 2, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e0e0);
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

  clock = new THREE.Clock();

  // lights

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
  hemiLight.position.set(0, 0, 10);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(0, 5, 10);
  scene.add(dirLight);

  // ground

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0xe0e0e0, depthWrite: true, side: THREE.DoubleSide }));
  mesh.rotation.x = - Math.PI / 2;
  scene.add(mesh);

  const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
  grid.material.opacity = 0.3;
  grid.material.transparent = true;
  scene.add(grid);

  // model

  const loader = new GLTFLoader();
  loader.load('./ToyotaHRIS10.glb', function (gltf) {
    // loader.load('./Robot.glb', function (gltf) {
    model = gltf.scene;
    getAllObjectNames(model);
    scene.add(model);

    // ✅ Check if animations exist
    console.log('LOAD action', gltf.animations)
    if (gltf.animations.length > 0) {
      console.log('gltf.animations', gltf.animations)
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]); // Play first animation

      action.play();
    }

    animatedCamera = gltf.cameras[1]; // Assuming your glb has an animated camera
    console.log('animatedCamera', gltf.cameras)
    if (animatedCamera) {
      scene.add(animatedCamera);
    }

    createGUI(model, gltf.animations, selectedState);

  }, undefined, function (e) {

    console.error(e);

  });

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.setAnimationLoop(animate);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);

}


function createGUI(model, animations, selectedState = null) {
  const states = ['KotakGerak', 'CameraBake']
  // const states = ['KotakGerak', 'Circlecam', 'beneran1', 'KotakGerak'];
  // const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing', 'TEST'];
  gui = new GUI();

  mixer = new THREE.AnimationMixer(model);

  actions = {};
  console.log('createGUI', animations)
  for (let i = 0; i < animations.length; i++) {

    const clip = animations[i];
    const action = mixer.clipAction(clip);
    actions[clip.name] = action;
    if (states.indexOf(clip.name)) {
      console.log(clip.name, 'clip.name')
      action.clampWhenFinished = true;
      action.loop = THREE.LoopRepeat;
    }
  }

  // states

  const statesFolder = gui.addFolder('States');

  const clipCtrl = statesFolder.add(api, 'state').options(states);
  console.log(clipCtrl, 'clipCtrl')
  clipCtrl.onChange(function () {
    console.log('Changes state', api.state)
    fadeToAction(api.state, 0.5);

  });

  statesFolder.open();

  activeAction = actions['KotakGerak'];
  console.log(activeAction);
  activeAction.play();

}


function fadeToAction(name, duration) {

  previousAction = activeAction;
  activeAction = actions[name];

  if (previousAction !== activeAction) {

    previousAction.fadeOut(duration);

  }

  activeAction
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(duration)
    .play();

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {
  requestAnimationFrame(animate);
  mixer.update(0.016);
  renderer.render(scene, animatedCamera || camera);

  // stats.update();

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