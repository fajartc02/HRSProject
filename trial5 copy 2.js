import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import gsap from "gsap";
let originalPosition = new THREE.Vector3(); // Store original position
function detailsComponent() {
  console.log('detailsComponent call')
  // playAnimation('Partisioff_ON')

  playAnimation('PartisiOff_ON')
}

function homeAnimation() {
  settings.selectedAnimation = 'None'
  updateAnimationGUI()
  settings.selectedCamera = 'Default'
  updateCameraGUI()

  changeCamera('CameraRound')
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
}
document.getElementById('btn-details').onclick = detailsComponent;
document.getElementById('btn-home').onclick = homeAnimation;
// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
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
  selectedCamera: "Default"
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
  console.log(focusedObject)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

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
    }
  }
  if (!focusedObject) return;

  zoomLevel = 2; // Set closer zoom for double-click
  zoomToObject(focusedObject, 0.8); // Faster zoom-in
}

// 📷 Smooth zoom-in function
function zoomToObject(object, duration = 1.2) {
  const lookAtTarget = object.position.clone();
  // ✅ Get camera forward direction
  const cameraDirection = new THREE.Vector3();
  activeCamera.getWorldDirection(cameraDirection); // Get current forward direction
  cameraDirection.normalize();

  // ✅ Move camera along its current forward direction
  const targetPosition = lookAtTarget.clone().sub(cameraDirection.multiplyScalar(zoomLevel));


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
    },
  });

  setTimeout(() => {
    controls.target.copy(lookAtTarget);
    // controls.update();
  }, duration * 1000);
}

// 🎡 Handle scroll to zoom in/out
function onScroll(event) {
  console.log('wheel')
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
loader.load("ToyotaHRIS26.glb", (gltf) => {
  console.log(gltf.parser.json, 'gltf.parser.json')
  const model = gltf.scene;
  scene.add(model);

  const courtLight = new THREE.DirectionalLight(0xffffff, 2);
  courtLight.position.set(0, 0, 10); // Simulate stadium lights from above
  scene.add(courtLight);

  // 🔹 Add shadows for realism
  courtLight.castShadow = true;
  courtLight.shadow.mapSize.width = 2048;
  courtLight.shadow.mapSize.height = 2048;
  courtLight.shadow.camera.near = 0.5;
  courtLight.shadow.camera.far = 50;

  // 🔥 Collect all Mesh objects for Raycasting
  model.traverse((child) => {
    console.log(child.isLight)
    if (child.isLight) {
      scene.add(child.clone()); // Add the light to the scene
    }
    // console.log(child)
    if (child.isMesh) {
      loadedObjects.push(child.material);
      console.log("Mesh Found:", child.material);
      // const materialLoader = new THREE.MeshStandardMaterial(child.material);
      // child.material = materialLoader
      if (child.name === 'Object002001' || child.name === 'node2_m0mat_0004_2') {
        child.material.color = new THREE.Color(0x0a74ff);
        child.material.emissive = new THREE.Color(0x0a74ff);
        child.material.roughness = 0.5;
        child.material.metalness = 0.5;
        child.material.aoMapIntensity = 0.5;
      }

      // if (child.name === 'PartisiBiru001') {
      //   child.material.color = new THREE.Color(0xFFFFFF);
      //   child.material.emissive = new THREE.Color(0xFFFFFF);
      //   child.material.roughness = 0.5;
      //   child.material.metalness = 0.5;
      //   child.material.aoMapIntensity = 0.5;
      // }

      if (child.name === 'node2_m0mat_0004_1') {
        child.material.color = new THREE.Color(0x000000);
        child.material.emissive = new THREE.Color(0x000000);
        child.material.roughness = 0.5;
        child.material.metalness = 0.5;
        child.material.aoMapIntensity = 0.5;
      }

      if (child.name === 'Object009') {
        child.material.color = new THREE.Color(0xffe60a);
        child.material.emissive = new THREE.Color(0xffe60a);
        child.material.roughness = 0.5;
        child.material.metalness = 0.5;
        child.material.aoMapIntensity = 0.5;
      }
      if (child.name === '013_14078_01_01_01_________8189813_001') {
        child.material.color = new THREE.Color(0xFFFFFF);
        child.material.emissive = new THREE.Color(0xFFFFFF);
        child.material.roughness = 0.5;
        child.material.metalness = 0.5;
        child.material.aoMapIntensity = 0.5;
      }

    }
  });



  scene.add(gltf.scene);
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

    clip.tracks.forEach(track => {
      // // console.log(track)
      const totalTimeframe = track.times.reduce((total, time) => total + time, 0) / 100;
      // // console.log(totalTimeframe)
      // // console.log(tracks[clip.name] < totalTimeframe)
      // 🔥 Keep track of longest animation
      if (!tracks[clip.name]) {
        tracks[clip.name] = totalTimeframe
      }
      if (tracks[clip.name] < totalTimeframe) {
        tracks[clip.name] = totalTimeframe
      }
    });

    // console.log(tracks, 'tracks')

    if (`${clip.name}`.toLowerCase().includes('_on')) {
      animations[clip.name] = mixer.clipAction(clip);
      animations[clip.name].setLoop(THREE.LoopOnce);
      // Keep in last frame
      animations[clip.name].clampWhenFinished = true;
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
        element.reset()

      }
    }
    if (`${animationName}`.toUpperCase().includes('_ON')) {
      console.log(cameras['CameraZoomOut_ON'], 'cameras[CameraZoomOut_ON]')
      await changeCamera('CameraZoomOut_ON')
      // await changeCamera('CameraZoomIn_ON')
      // PartisiFront
      for (const key in animations) {
        if (Object.prototype.hasOwnProperty.call(animations, key)) {
          const element = animations[key];
          // console.log(element)
          animations[key].play(THREE.LoopRepeat)
        }
      }
      // currentAnimation.reset().play();
    } else {
      currentAnimation.play();
    }
  } else {
    console.warn("❌ Animation not found:", animationName);
  }


  if (cameraAnimation) {
    // // console.log("🎥 Playing Camera Animation");
    cameraAnimation.reset().play();
  }
}


function changeCamera(cameraName) {
  if (!cameras[cameraName]) return;

  const newCamera = cameras[cameraName];

  // ✅ Preserve the last position smoothly
  gsap.to(activeCamera.position, {
    x: newCamera.position.x,
    y: newCamera.position.y,
    z: newCamera.position.z,
    duration: 2, // Adjust speed
    ease: "power2.inOut",

  });

  // ✅ Smoothly transition rotation using quaternions
  gsap.to(activeCamera.quaternion, {
    x: newCamera.quaternion.x,
    y: newCamera.quaternion.y,
    z: newCamera.quaternion.z,
    w: newCamera.quaternion.w,
    duration: 2,
    ease: "power2.inOut",
    // onComplete
  });
  activeCamera = newCamera;
  activeCamera.updateProjectionMatrix();

  // ✅ Do NOT recreate controls, just update them
  controls.object = activeCamera;
  controls.update(); // Keep last position
  settings.selectedCamera = cameraName;
  updateCameraGUI()
  // ✅ Wait until transition completes before switching controls
  // setTimeout(() => {
  //   activeCamera = newCamera;
  //   activeCamera.updateProjectionMatrix();

  //   // ✅ Do NOT recreate controls, just update them
  //   controls.object = activeCamera;
  //   controls.update(); // Keep last position
  //   settings.selectedCamera = cameraName;
  //   updateCameraGUI()
  // }, 1000); // Match gsap duration
}

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(0.016);
  controls.update();
  renderer.render(scene, activeCamera);
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
    }
  });
}
