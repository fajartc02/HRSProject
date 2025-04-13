import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import gsap from "gsap";
function detailsComponent() {
  console.log('detailsComponent call')
  // playAnimation('Partisioff_ON')

  playAnimation('PartisiOff_ON')
}
document.getElementById('btn-details').onclick = detailsComponent;
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


// 🔹 Mouse Click Event
window.addEventListener("click", (event) => {
  // Convert Mouse Position to NDC (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycast from Camera to Click Position
  raycaster.setFromCamera(mouse, activeCamera);
  const intersects = raycaster.intersectObjects(loadedObjects);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    console.log("✅ Clicked on:", clickedObject.name);
    zoomToObject(clickedObject);
  }
});

function zoomToObject(object) {
  const targetPosition = object.position.clone().add(new THREE.Vector3(0, 2, 5)); // Adjust zoom offset
  const lookAtTarget = object.position.clone();

  // Animate camera position
  gsap.to(activeCamera.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: 1.5,
    ease: "power2.inOut",
  });

  // Animate camera rotation to look at the object
  gsap.to(activeCamera.rotation, {
    x: lookAtTarget.x,
    y: lookAtTarget.y,
    z: lookAtTarget.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => {
      activeCamera.lookAt(lookAtTarget);
    },
  });

  // Update controls to new camera position
  setTimeout(() => {
    controls.target.copy(lookAtTarget);
    controls.update();
  }, 1500); // Sync with gsap duration
}

// Load GLB Model
const loader = new GLTFLoader();
// _ON
loader.load("ToyotaHRIS20.glb", (gltf) => {

  const model = gltf.scene;
  scene.add(model);

  // 🔥 Collect all Mesh objects for Raycasting
  model.traverse((child) => {
    if (child.isMesh) {
      loadedObjects.push(child);
      // // console.log("Mesh Found:", child.name);
      if (child.name == 'Plane') {
        // Load Texture
        const textureLoader = new THREE.TextureLoader();
        // const texture = textureLoader.load("./textures/texture2.jpg"); // Replace with your image path
        // child.material.color = new THREE.Color(0x6d6d6d);
        // const backgroundTexture = textureLoader.load("./background2.jpeg"); // Replace with your image path
        // scene.background.color = new THREE.Color(0x3a3a3a); // ✅ Set image as background
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

function onMouseWheel(event) {
  // event.preventDefault();

  raycaster.setFromCamera(mouse, camera); // Cast ray from mouse position
  const targetPoint = new THREE.Vector3();
  raycaster.ray.at(1, targetPoint); // Get point along ray

  const zoomFactor = event.deltaY * 0.01; // Adjust zoom speed
  camera.position.lerp(targetPoint, zoomFactor); // Move camera toward target point

  controls.target.lerp(targetPoint, zoomFactor); // Move focus point
  controls.update();
}
// changes point camera
window.addEventListener('wheel', onMouseWheel);

async function playAnimation(animationName) {
  console.log("🎬 Playing Animation:", animationName);
  console.log('animations', animations)
  for (const key in animations) {
    if (Object.prototype.hasOwnProperty.call(animations, key)) {
      const element = animations[key];
      element.reset()
    }
  }
  if (currentAnimation) currentAnimation.stop();

  if (animationName !== "None" && animations[animationName]) {
    currentAnimation = animations[animationName];
    console.log(animationName, 'animationName')
    console.log(animations)
    if (`${animationName}`.toUpperCase().includes('_ON')) {
      console.log(cameras['CameraZoomOut_ON'], 'cameras[CameraZoomOut_ON]')
      await changeCamera('CameraZoomOut_ON')
      // await changeCamera('CameraZoomIn_ON')
      // PartisiFront
      for (const key in animations) {
        if (Object.prototype.hasOwnProperty.call(animations, key)) {
          const element = animations[key];
          // console.log(element)
          animations[key].play()
        }
      }
      currentAnimation.reset().play();
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

// function changeCamera(cameraName) {
//   // // console.log("📷 Switching to Camera:", cameraName);
//   if (cameras[cameraName]) {
//     gsap.to(cameras[cameraName].position, { duration: 1, ease: "power2.inOut" });
//     activeCamera = cameras[cameraName];
//     // activeCamera.aspect = window.innerWidth / window.innerHeight;
//     activeCamera.updateProjectionMatrix();
//     // ✅ Fix: Update Controls Target
//     setTimeout(() => {
//       // activeCamera = camera; // Fully switch to new camera
//       // controls.dispose(); // Remove old controls
//       controls = new OrbitControls(activeCamera, renderer.domElement); // Create new controls
//       // true = keep last position
//       controls.enableDamping = true;
//     }, tracks[cameraName]); // Wait for smooth transition before updating controls
//   }
// }


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
  });

  // ✅ Wait until transition completes before switching controls
  setTimeout(() => {
    activeCamera = newCamera;
    activeCamera.updateProjectionMatrix();

    // ✅ Do NOT recreate controls, just update them
    controls.object = activeCamera;
    controls.update(); // Keep last position
  }, 2000); // Match gsap duration
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
