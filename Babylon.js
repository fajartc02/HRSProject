import * as BABYLON from "babylonjs";
import "babylonjs-loaders";

// Setup Engine & Scene
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Camera
const camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Light
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

// Load Model
BABYLON.SceneLoader.ImportMesh("", "", "test.glb", scene, (meshes) => {
  console.log("Model Loaded:", meshes);
});

// Handle Click
canvas.addEventListener("dblclick", function (evt) {
  const pickResult = scene.pick(evt.clientX, evt.clientY);
  if (pickResult.hit) {
    const targetObject = pickResult.pickedMesh;

    console.log("Clicked on:", targetObject.name); // Debug log

    // Move camera in front of object
    const frontPosition = targetObject.position.add(targetObject.forward.scale(-5));

    // Smooth transition
    BABYLON.Animation.CreateAndStartAnimation(
      "cameraMove",
      camera,
      "position",
      60,
      60,
      camera.position,
      frontPosition,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    camera.setTarget(targetObject.position);
  }
});

// Render Loop
engine.runRenderLoop(() => scene.render());
