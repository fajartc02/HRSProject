import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import gsap from "gsap";
const clock = new THREE.Clock();
let model;
let originalPosition = new THREE.Vector3(); // Store original position
let objectTransparent, isFadingOut = true;
document.getElementById('btn-details').innerHTML = isFadingOut ? 'Hide Barier' : 'Visible Barier'
let arrObjNameTransparent = ['Group_254__721539_', 'Vert003', 'triangle__3972290_', 'triangle__3972254_', 'Group_64__3972536_', 'Group_104__8308394_', '__3246508_001', 'Group_397__3939351_']
let arrMeshTrasnparent = [], arrMeshInfo = []
let time = 0
let objWater;
let pipe;

const strObjNameCradle = 'CraddleInfo_RON'
const domCardCradle = document.getElementById('cardCradle')
const btnCardClose = document.getElementById('btn-close')

const strObjNameStorage = 'StorageInfo_RON'
const domCardStorage = document.getElementById('cardStorage')
const btnCardCloseStorage = document.getElementById('btn-close-storage')

const strObjNameDispenser = 'DispencerInfo_RON'
const domCardDispenser = document.getElementById('cardDispenser')
const btnCardCloseDispenser = document.getElementById('btn-close-dispenser')

const strObjNameCompressor = 'CompressorInfo_RON'
const domCardCompressor = document.getElementById('cardCompressor')
const btnCardCloseCompressor = document.getElementById('btn-close-compressor')

const strObjNameChiller = 'ChillerInfo_RON'
const domCardChiller = document.getElementById('cardChiller')
const btnCardCloseChiller = document.getElementById('btn-close-chiller')

const strObjNamePanel = 'ControlPanelInfo_RON'
const domCardPanel = document.getElementById('cardPanel')
const btnCardClosePanel = document.getElementById('btn-close-panel')

const strObjNameBabyComp = 'BabyCompInfo_RON'
const domCardBabyComp = document.getElementById('cardBabyComp')
const btnCardCloseBabyComp = document.getElementById('btn-close-babyComp')

btnCardClose.addEventListener('click', () => {
  domCardCradle.classList.remove('visible')
  isFadingOut = false
  detailsComponent()
  zoomLevel = 20
  zoomToObject(focusedObject, 1.2);
})

btnCardCloseStorage.addEventListener('click', () => {
  domCardStorage.classList.remove('visible')
  isFadingOut = false
  detailsComponent()
  zoomLevel = 20
  zoomToObject(focusedObject, 1.2);
})

btnCardCloseDispenser.addEventListener('click', () => {
  domCardDispenser.classList.remove('visible')
  zoomLevel = 20
  zoomToObject(focusedObject, 1.2);
})

btnCardCloseCompressor.addEventListener('click', () => {
  domCardCompressor.classList.remove('visible')
  isFadingOut = false
  detailsComponent()
  zoomLevel = 20
  zoomToObject(focusedObject, 1.2);
})

btnCardCloseChiller.addEventListener('click', () => {
  domCardChiller.classList.remove('visible')
  zoomLevel = 20
  zoomToObject(focusedObject, 1.2);
})

btnCardClosePanel.addEventListener('click', () => {
  domCardPanel.classList.remove('visible')
  zoomLevel = 20
  zoomToObject(focusedObject, 1.2);
})

btnCardCloseBabyComp.addEventListener('click', () => {
  domCardBabyComp.classList.remove('visible')
  isFadingOut = false
  detailsComponent()
  zoomLevel = 20
  zoomToObject(focusedObject, 1.2);
})

function removeAllCardDom() {
  domCardDispenser.classList.remove('visible')
  domCardStorage.classList.remove('visible')
  domCardCradle.classList.remove('visible')
  domCardCompressor.classList.remove('visible')
  domCardChiller.classList.remove('visible')
  domCardPanel.classList.remove('visible')
  domCardBabyComp.classList.remove('visible')
}

function detailsComponent() {

  console.log('detailsComponent call')
  console.log(isFadingOut)

  if (arrMeshTrasnparent.length > 0) {
    for (let index = 0; index < arrMeshTrasnparent.length; index++) {
      const meshElement = arrMeshTrasnparent[index];
      if (meshElement?.traverse) {
        meshElement.traverse((child) => {
          console.log(child)
          if (child.isMesh) {
            child.material.transparent = isFadingOut ? true : false; // must be true to use opacity
            gsap.to(child.material, {
              opacity: isFadingOut ? 0.1 : 1,
              duration: 3,
              // ease: "power2.inOut",
            });
          }
        });
      }
    }
  }
  isFadingOut = !isFadingOut;
  document.getElementById('btn-details').innerHTML = isFadingOut ? 'Hide Barier' : 'Visible Barier'
  return
}

function homeAnimation() {
  // settings.selectedAnimation = 'None'
  // updateAnimationGUI()
  isFadingOut = false;
  const intersects = raycaster.intersectObjects(scene.children, true);
  for (let index = 0; index < intersects.length; index++) {
    const element = intersects[index];
    stopAnimation(element.object); // Stop animation & return smoothly
  }
  for (const key in animations) {
    if (Object.prototype.hasOwnProperty.call(animations, key)) {
      const element = animations[key];
      element.stop()
    }
  }
  changeCamera('Camera', true)
  settings.selectedCamera = 'Camera'
  updateCameraGUI()

  detailsComponent()
  return
}
let isAnimating = false; // Track animation state
// 📌 Function to start animation (moves object up & down)
function startAnimation(object) {
  if (!isAnimating) {
    originalPosition.copy(object.position); // Store original position
    isAnimating = true;

    gsap.to(object.position, {
      // y: object.position.y + 2, // Move up
      duration: 1,
      repeat: -1, // Loop animation
      yoyo: true, // Go up & down
      ease: "power1.inOut"
    });
  }
}

// 🛑 Function to stop animation & return smoothly
function stopAnimation(object) {
  if (isAnimating) {
    isAnimating = false;

    gsap.killTweensOf(object.position); // Stop GSAP animations

    // 🔹 Smoothly return to original position
    gsap.to(object.position, {
      x: originalPosition.x,
      y: originalPosition.y,
      z: originalPosition.z,
      duration: 1.5,
      ease: "power2.inOut"
    });
  }
  return
}
document.getElementById('btn-details').onclick = detailsComponent;
document.getElementById('btn-home').onclick = homeAnimation;
// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 150);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Orbit Controls
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Animation & Camera Variables
let mixer, animations = {}, currentAnimation = null, animationDropdown, cameraDropdown, cameraAnimation, lights = {}, loadedObjects = [], tracks = [];
let activeCamera = camera;
const cameras = { Default: camera };

// GUI Setup
const gui = new GUI();
const settings = {
  selectedAnimation: "None",
  selectedCamera: "Camera"
};

// Add GUI Controls
animationDropdown = gui.add(settings, "selectedAnimation", ["None"]).name("Active Animation").onChange(playAnimation);
cameraDropdown = gui.add(settings, "selectedCamera", Object.keys(cameras)).name("Active Camera").onChange(changeCamera);

// Raycaster & Mouse Vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let focusedObject = null;
let zoomLevel = 3; // Closer zoom for double-click


// 🎯 Handle double-click for instant zoom-in
function onDoubleClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  console.log(mouse.x, ',', mouse.y)

  raycaster.setFromCamera(mouse, activeCamera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    // 🔹 Get the closest mesh (most precise hit)
    let closestObject = null;
    for (let i = 0; i < intersects.length; i++) {

      if (intersects[i].object.isMesh) {
        closestObject = intersects[i].object;
        break; // Stop at first mesh
      }
    }

    if (closestObject) {
      focusedObject = closestObject;
      console.log("🎯 Clicked on:", focusedObject.name || "Unnamed Object");
      toggleVisibleCard(focusedObject.name)
    }
  }
  if (!focusedObject) return;

  zoomLevel = 5; // Set closer zoom for double-click
  zoomToObject(focusedObject, 0.8); // Faster zoom-in
}

function toggleVisibleCard(objName) {

  switch (objName) {
    case strObjNameCradle:
      domCardCradle.classList.toggle('visible')
      domCardDispenser.classList.remove('visible')
      domCardStorage.classList.remove('visible')
      domCardCompressor.classList.remove('visible')
      domCardChiller.classList.remove('visible')
      domCardPanel.classList.remove('visible')
      domCardBabyComp.classList.remove('visible')
      isFadingOut = true
      detailsComponent()
      break;
    case strObjNameStorage:
      domCardStorage.classList.toggle('visible')
      domCardDispenser.classList.remove('visible')
      domCardCradle.classList.remove('visible')
      domCardCompressor.classList.remove('visible')
      domCardChiller.classList.remove('visible')
      domCardPanel.classList.remove('visible')
      domCardBabyComp.classList.remove('visible')
      isFadingOut = true
      detailsComponent()
      break;
    case strObjNameDispenser:
      domCardDispenser.classList.toggle('visible')
      domCardStorage.classList.remove('visible')
      domCardCradle.classList.remove('visible')
      domCardCompressor.classList.remove('visible')
      domCardChiller.classList.remove('visible')
      domCardPanel.classList.remove('visible')
      domCardBabyComp.classList.remove('visible')
      isFadingOut = false
      detailsComponent()
      break;
    case strObjNameCompressor:
      domCardCompressor.classList.toggle('visible')
      domCardDispenser.classList.remove('visible')
      domCardStorage.classList.remove('visible')
      domCardCradle.classList.remove('visible')
      domCardChiller.classList.remove('visible')
      domCardPanel.classList.remove('visible')
      domCardBabyComp.classList.remove('visible')
      isFadingOut = true
      detailsComponent()
      break;
    case strObjNameChiller:
      domCardChiller.classList.toggle('visible')
      domCardDispenser.classList.remove('visible')
      domCardStorage.classList.remove('visible')
      domCardCradle.classList.remove('visible')
      domCardCompressor.classList.remove('visible')
      domCardPanel.classList.remove('visible')
      domCardBabyComp.classList.remove('visible')
      isFadingOut = false
      detailsComponent()
      break;
    case strObjNamePanel:
      domCardPanel.classList.toggle('visible')
      domCardChiller.classList.remove('visible')
      domCardDispenser.classList.remove('visible')
      domCardStorage.classList.remove('visible')
      domCardCradle.classList.remove('visible')
      domCardCompressor.classList.remove('visible')
      domCardBabyComp.classList.remove('visible')
      isFadingOut = false
      detailsComponent()
      break;
    case strObjNameBabyComp:
      domCardBabyComp.classList.toggle('visible')
      domCardPanel.classList.remove('visible')
      domCardChiller.classList.remove('visible')
      domCardDispenser.classList.remove('visible')
      domCardStorage.classList.remove('visible')
      domCardCradle.classList.remove('visible')
      domCardCompressor.classList.remove('visible')
      isFadingOut = true
      detailsComponent()
      break;
    default:
      break;
  }
}

// 📷 Smooth zoom-in function
function zoomToObject(object, duration = 1.2) {
  if (object.name == 'CraddleInfo_RON') {
    object = model.getObjectByName('triangle__3972407_')
  } else if (object.name === 'StorageInfo_RON') {
    object = model.getObjectByName('Cylinder_Bottle_40L_1_solid2042')
  } else if (object.name === strObjNameDispenser) {
    object = model.getObjectByName('Text002')
  } else if (object.name === strObjNameCompressor) {
    // Group_254__721539_001
    object = model.getObjectByName('Group_254__721539_003')
  } else if (object.name === strObjNameChiller) {
    object = model.getObjectByName('013_14078_01_03____________6520666_')
  } else if (object.name === strObjNamePanel) {
    // Plane013
    object = model.getObjectByName('Plane013')
  } else if (object.name === strObjNameBabyComp) {
    // Component_18__6520764_001
    object = model.getObjectByName('Component_18__6520764_001')
  }
  const lookAtTarget = object.position.clone();
  // ✅ Get camera forward direction
  const cameraDirection = new THREE.Vector3();
  activeCamera.getWorldDirection(cameraDirection); // Get current forward direction
  cameraDirection.normalize();

  // ✅ Move camera along its current forward direction
  const targetPosition = lookAtTarget.clone().sub(cameraDirection.multiplyScalar(zoomLevel));
  console.log('x: ', targetPosition.x, 'y: ', targetPosition.y, 'z: ', targetPosition.z)
  // craddle
  // x:  -3.610395930517333 y:  1.8507272607836192 z:  -5.011521275801057
  // storage // Cylinder_Bottle_40L_1_solid2042
  // x:  4.362000930784829 y:  3.2276520278716676 z:  -2.5216019029213035
  if (object.name == 'CraddleInfo_RON') {
    targetPosition.x = -3.610395930517333
    targetPosition.y = 1.8507272607836192
    targetPosition.z = -5.011521275801057
  } else if (object.name === 'StorageInfo_RON') {
    targetPosition.x = 4.362000930784829
    targetPosition.y = 3.2276520278716676
    targetPosition.z = -2.5216019029213035
  } else if (object.name === 'DispenserInfo_RON') {
    // x:  2.028997333100852 y:  1.2099324396511464 z:  0.6010403437301974
    targetPosition.x = 2.028997333100852
    targetPosition.y = 1.2099324396511464
    targetPosition.z = 0.6010403437301974
  } else if (object.name === 'CompressorInfo_RON') {
    // x:  6.294828336499499 y:  3.1483483712761124 z:  4.16958220468211
    targetPosition.x = 6.294828336499499
    targetPosition.y = 3.1483483712761124
    targetPosition.z = 4.16958220468211
  } else if (object.name === 'ChillerInfo_RON') {
    // x:  12.944325854270112 y:  3.155044874773254 z:  13.769290516470978
    targetPosition.x = 12.944325854270112
    targetPosition.y = 3.155044874773254
    targetPosition.z = 13.769290516470978
  } else if (object.name === 'PanelInfo_RON') {
    // x:  5.451029596814941 y:  2.830353369908016 z:  1.4461866261003653
    targetPosition.x = 5.451029596814941
    targetPosition.y = 2.830353369908016
    targetPosition.z = 1.4461866261003653
  } else if (object.name === 'BabyCompInfo_RON') {
    // x:  9.750547738465427 y:  4.111642844855265 z:  6.043436560382151
    targetPosition.x = 9.750547738465427
    targetPosition.y = 4.111642844855265
    targetPosition.z = 6.043436560382151
  }
  gsap.to(activeCamera.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: duration,
    ease: "power2.inOut",
  });

  gsap.to(activeCamera.rotation, {
    duration: duration,
    ease: "power2.inOut",
    onUpdate: () => {
      activeCamera.lookAt(lookAtTarget);
      controls.target.copy(lookAtTarget);
    },
  });

  // setTimeout(() => {
  //   controls.target.copy(lookAtTarget);
  //   // controls.update();
  // }, duration * 1000);
}

// 🎡 Handle scroll to zoom in/out
function onScroll(event) {
  console.log('wheel')
  // x, y, z log
  console.log('x: ', activeCamera.position.x, 'y: ', activeCamera.position.y, 'z: ', activeCamera.position.z)
  if (!focusedObject) return;

  const zoomAmount = event.deltaY > 0 ? 1 : -1; // Scroll direction
  zoomLevel = Math.max(2, Math.min(15, zoomLevel + zoomAmount)); // Clamp zoom

  // zoomToObject(focusedObject, 1.2);
}

// 🚀 Add event listeners
window.addEventListener("dblclick", onDoubleClick);
window.addEventListener("wheel", onScroll);

// Load GLB Model
const loader = new GLTFLoader();
// _ON
loader.load("assets/ToyotaHRIS43.glb", (gltf) => {
  console.log(gltf.parser.json, 'gltf.parser.json')
  model = gltf.scene;

  // background image
  scene.fog = new THREE.Fog(0x0565555, 0, 200);
  scene.background = new THREE.TextureLoader().load("./assets/cloud.png");
  // scene.background = new THREE.Color(0xffffff)
  scene.add(model);

  model.traverse((child) => {
    if (child.isMesh && child.name.includes("Craddle_2ON")) {
      console.log(child, 'isSphere');
      // child.material = child.material.clone();
      // child.material.color.set(0x0007ef);
      child.material = new THREE.MeshBasicMaterial({ color: 0x00ed27 });

      // child.material.color.set(0x0007ef);
    }
    if (child.isMesh && child.name.includes("Storage_2ON")) {
      console.log(child, 'isSphere');
      // child.material = child.material.clone();
      // child.material.color.set(0x0005ff);
      child.material = new THREE.MeshBasicMaterial({ color: 0x0007ef });

      // child.material.color.set(0x0007ef);
    }
  });


  const courtLight = new THREE.DirectionalLight(0xffffff, 2);
  courtLight.position.set(0, 0, 10); // Simulate stadium lights from above
  scene.add(courtLight);

  // 🔹 Add shadows for realism
  courtLight.castShadow = true;
  courtLight.shadow.mapSize.width = 2048;
  courtLight.shadow.mapSize.height = 2048;
  courtLight.shadow.camera.near = 0.5;
  courtLight.shadow.camera.far = 5000;
  objWater = model.getObjectByName('ocean');
  const bubble = model.getObjectByName('PipeSt3_2ON');
  console.log(bubble, 'bubbtle')


  if (objWater) {
    // 5. Load texture
    // Load a water texture (tileable normal map or stylized)
    const waterTexture = new THREE.TextureLoader().load('./assets/water2.png', (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4); // optional tiling
    });

    // Create new material or reuse existing one
    objWater.material = new THREE.MeshStandardMaterial({
      map: waterTexture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    });

    // Save the texture so we can animate it
    objWater.userData.map = waterTexture;
  }

  const objRemove1 = model.getObjectByName('Sphere');
  const objRemove2 = model.getObjectByName('Group_104__8308394_');
  objectTransparent = model.getObjectByName('Group_254__721539_');

  // Loop for identify selection object
  for (let index = 0; index < arrObjNameTransparent.length; index++) {
    const meshElementObjName = arrObjNameTransparent[index];
    objectTransparent = model.getObjectByName(meshElementObjName);
    console.log(objectTransparent, 'MODEL')
    arrMeshTrasnparent.push(objectTransparent)
  }

  for (let idx = 0; idx < model.children.length; idx++) {
    const meshElem = model.children[idx];
    if (meshElem.name.includes('_RON')) {
      console.log(meshElem, 'MODEL')

      arrMeshInfo.push(meshElem)
    }
  }

  if (objRemove2) {
    // objRemove1.parent.remove(objRemove1); // Remove from parent
    objRemove2.parent.remove(objRemove2); // Remove from parent
  }



  // scene.add(gltf.scene);
  mixer = new THREE.AnimationMixer(gltf.scene);
  // get object name
  getAllObjectNames(gltf.scene)
  // Load Cameras from GLTF
  gltf.cameras.forEach((cam, index) => {
    // // console.log('cam', cam)
    const name = cam.name || `Camera${index + 1}`;
    cameras[name] = cam;
  });

  setLightConfig(gltf, scene)
  // Update Camera Dropdown
  updateCameraGUI();

  // Extract animations
  gltf.animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    action.play();
    // clip.tracks.forEach(track => {
    //   // // console.log(track)
    //   const totalTimeframe = track.times.reduce((total, time) => total + time, 0) / 100;
    //   // // console.log(totalTimeframe)
    //   // // console.log(tracks[clip.name] < totalTimeframe)
    //   // 🔥 Keep track of longest animation
    //   if (!tracks[clip.name]) {
    //     tracks[clip.name] = totalTimeframe
    //   }
    //   if (tracks[clip.name] < totalTimeframe) {
    //     tracks[clip.name] = totalTimeframe
    //   }
    // });

    // console.log(tracks, 'tracks')
    console.log(clip.name, 'clip.name')
    if (`${clip.name}`.toUpperCase().includes('_ON') || `${clip.name}`.toUpperCase().includes('_2ON') || `${clip.name}`.toUpperCase().includes('EMPTY')) {
      animations[clip.name] = mixer.clipAction(clip);
      // animations[clip.name].loop = THREE.LoopOnce
      // Keep in last frame
      // animations[clip.name].clampWhenFinished = true;
    }
    // 🔥 Detect Camera Animation
    if (clip.tracks.some(track => track.name.includes("_ON"))) {
      // // console.log("🎥 Camera Animation Found:", clip.name);
      cameraAnimation = mixer.clipAction(clip);
    }
  });
  // // console.log(tracks, 'tracks')

  // // console.log("🎬 Available Animations:", Object.keys(animations));
  updateAnimationGUI();
  changeCamera('Camera')
}, undefined, (error) => console.error("❌ Error loading GLB:", error));

function updateAnimationGUI() {
  if (animationDropdown) animationDropdown.destroy();
  animationDropdown = gui.add(settings, "selectedAnimation", ["None", ...Object.keys(animations)])
    .name("Active Animation")
    .onChange(playAnimation);
}

function setLightConfig(gltf, scene) {
  if (!gltf.parser.json.extensions || !gltf.parser.json.extensions.KHR_lights_punctual) {
    console.error("❌ KHR_lights_punctual is missing!");
  } else {
    // // console.log("✅ KHR_lights_punctual found:", gltf.parser.json.extensions);
    const lightDefs = gltf.parser.json.extensions.KHR_lights_punctual.lights;
    // // console.log('gltf.parser.json.extensions', gltf.parser.json.extensions)
    gltf.scene.traverse((node) => {
      if (node.userData && node.userData.gltfExtensions && node.userData.gltfExtensions.KHR_lights_punctual) {
        const lightIndex = node.userData.gltfExtensions.KHR_lights_punctual.light;
        const lightDef = lightDefs[lightIndex];

        let light;
        switch (lightDef.type) {
          case "point":
            light = new THREE.PointLight(lightDef.color, lightDef.intensity);
            light.distance = lightDef.range || 0;
            break;
          case "spot":
            light = new THREE.SpotLight(lightDef.color, lightDef.intensity);
            light.angle = lightDef.spot.outerConeAngle || Math.PI / 4;
            light.penumbra = lightDef.spot.innerConeAngle || 0;
            break;
          case "directional":
            light = new THREE.DirectionalLight(lightDef.color, lightDef.intensity);
            break;
          case "ambient":
            light = new THREE.AmbientLight(lightDef.color, lightDef.intensity);
            break;
          default:
            console.warn("Unknown light type:", lightDef.type);
            return;
        }

        light.position.copy(node.position);
        scene.add(light);
        lights[lightDef.name || `Light${Object.keys(lights).length + 1}`] = light;
      }
    });
  }
}

function updateCameraGUI() {
  if (cameraDropdown) cameraDropdown.destroy();
  cameraDropdown = gui.add(settings, "selectedCamera", Object.keys(cameras))
    .name("Active Camera")
    .onChange(changeCamera);
  return
}

async function playAnimation(animationName) {
  isAnimating = true
  console.log("🎬 Playing Animation:", animationName);
  console.log('animations', animations)
  settings.selectedAnimation = animationName;
  console.log(settings, 'settings')
  setTimeout(() => {
    updateAnimationGUI()
  }, 2000)

  isFadingOut = true
  detailsComponent()
  // for removing all dom card
  removeAllCardDom()
  if (currentAnimation) currentAnimation.stop();
  const intersects = raycaster.intersectObjects(scene.children, true);
  for (let index = 0; index < intersects.length; index++) {
    const element = intersects[index];
    startAnimation(element.object); // Start animation
  }
  if (animationName !== "None" && animations[animationName]) {
    for (const key in animations) {
      if (Object.prototype.hasOwnProperty.call(animations, key)) {
        const element = animations[key];
        element.stop()
      }
    }

    let filtered = {}
    let flagPlay = ''
    if (`${animationName}`.toUpperCase().includes('_2ON')) {
      console.log('filtered masuk _2ON')
      flagPlay = '_2ON'
      filtered = Object.entries(animations)
        .filter(([key, _]) => `${key}`.toUpperCase().includes('_2ON'))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
    } else if (`${animationName}`.toUpperCase().includes('_ON')) {

      console.log('filtered masuk _ON')
      flagPlay = '_ON'
      filtered = Object.entries(animations)
        .filter(([key, _]) => `${key}`.toUpperCase().includes('_ON'))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
    } else if (`${animationName}`.toUpperCase().includes('EMPTY')) {

      console.log('filtered masuk _ON')
      flagPlay = 'EMPTY'
      filtered = Object.entries(animations)
        .filter(([key, _]) => `${key}`.toUpperCase().includes('EMPTY'))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
    }


    console.log(filtered, 'filtered');

    for (const key in filtered) {
      if (Object.prototype.hasOwnProperty.call(filtered, key)) {
        const element = filtered[key];
        if (flagPlay === '_2ON' && key.includes('_2ON')) {
          element.loop = THREE.LoopRepeat
          element.timeScale = 1.5
          element.play()
        } else if (flagPlay === '_ON' && key.includes('_ON')) {
          changeCamera('Camera')
          element.loop = THREE.LoopOnce
          element.play()
        } else if (flagPlay === 'EMPTY' && key.includes('EMPTY')) {
          changeCamera('Camera2_2ON')
          element.loop = THREE.LoopOnce
          element.play()
        }
      }
    }
  } else {
    console.warn("❌ Animation not found:", animationName);
  }


  // if (cameraAnimation) {
  //   // // console.log("🎥 Playing Camera Animation");
  //   cameraAnimation.reset().play();
  // }
  return
}


function changeCamera(cameraName, originPosition = false) {
  if (!cameras[cameraName]) return;

  let targetCamera = cameras[cameraName];

  // Optional reset to known position
  if (originPosition) {
    targetCamera.position.set(
      50.30529309888162,
      12.404995859031795,
      3.865420323313467
    );
    isFadingOut = true;
    detailsComponent();
  }

  // ✅ Animate activeCamera's position & quaternion to match targetCamera
  gsap.to(activeCamera.position, {
    x: targetCamera.position.x,
    y: targetCamera.position.y,
    z: targetCamera.position.z,
    duration: 1,
    ease: "power2.inOut",
    overwrite: "auto",
  });

  gsap.to(activeCamera.quaternion, {
    x: targetCamera.quaternion.x,
    y: targetCamera.quaternion.y,
    z: targetCamera.quaternion.z,
    w: targetCamera.quaternion.w,
    duration: 2,
    ease: "power2.inOut",
    overwrite: "auto",
  });
  // activeCamera = targetCamera;
  activeCamera.updateProjectionMatrix();
  // ✅ Don't switch rendering camera!
  // Keep using activeCamera, just morph its transform

  controls.object = activeCamera;
  controls.update();
  settings.selectedCamera = cameraName;
  updateCameraGUI();
}

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  time += 0.08;
  arrMeshInfo.forEach(mesh => {
    if (mesh) {
      mesh.rotation.y += 0.05; // Adjust speed as needed
    }

    // blink effect
    if (mesh && mesh.material) {
      const blink = Math.abs(Math.sin(time)); // 0 to 1
      mesh.material.opacity = 0.5
      mesh.material.emissive = new THREE.Color(0xFFD746); // cyan glow
      mesh.material.emissiveIntensity = blink * 2; // adjust as needed
    }
  })

  // console.log('x: ', activeCamera.position.x, 'y: ', activeCamera.position.y, 'z: ', activeCamera.position.z)

  const delta = clock.getDelta();

  if (objWater && objWater.userData.map) {
    // Scroll the UVs to simulate flow
    objWater.userData.map.offset.y -= 0.002;
  }
  if (mixer) {
    mixer.update(delta)
    // mixer.update(0.016)
  };
  controls.update();
  renderer.render(scene, activeCamera);
  return
}

animate();

// Handle Window Resize
window.addEventListener("resize", () => {
  activeCamera.aspect = window.innerWidth / window.innerHeight;
  activeCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function getAllObjectNames(object) {
  // console.log('obj', object);
  object.traverse((child) => {
    // console.log(child)
    if (child.isMesh) {
      // console.log("Object Name:", child.name);
      child.material.transparent = true;
      child.material.opacity = 1;
    }
  });
  return
}
// BezierCurve003