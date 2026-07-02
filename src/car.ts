import * as THREE from 'three';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const boxGeo = new THREE.BoxGeometry(10, 10, 5);
const boxMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
const box = new THREE.Mesh(boxGeo, boxMat);

let controlObject: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> = box;

let speed = 0;
const acceleration = 10;
const turnSpeed = 2;
const decceleration = 8;
const drag = 16;
const maxSpeed = 20;

export async function loadControlObject(): Promise<THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>> {
    try {
        const gltf = await loader.loadAsync("/scene.gltf");

        controlObject = gltf.scene;

        controlObject.scale.set(100, 100, 100);

        controlObject.rotation.y = Math.PI;

        // controlObject.position.y = 2;

    } catch (error) {
        console.log(error);
    } finally {
        return controlObject;
    }
}

const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    brake: false,
};

function onKeydown(e: KeyboardEvent) {
    switch (e.code) {
        case "ArrowUp":
            keys.up = true;
            break;
        case "ArrowDown":
            keys.down = true;
            break;
        case "ArrowLeft":
            keys.left = true;
            break;
        case "ArrowRight":
            keys.right = true;
            break;
        case "KeyB":
            keys.brake = true;
            break;
    }
}

function onKeyup(e: KeyboardEvent) {
    switch (e.code) {
        case "ArrowUp":
            keys.up = false;
            break;
        case "ArrowDown":
            keys.down = false;
            break;
        case "ArrowLeft":
            keys.left = false;
            break;
        case "ArrowRight":
            keys.right = false;
            break;
        case "KeyB":
            keys.brake = false;
            break;
    }
}

window.addEventListener("keydown", (e) => onKeydown(e));
window.addEventListener("keyup", (e) => onKeyup(e));

const dir = new THREE.Vector3();


export function updateControlObject(delta: number) {
    if (keys.up) {
        speed += acceleration * delta;
        speed = Math.min(speed, maxSpeed);
        dir.set(0, 0, 1);
        dir.applyQuaternion(controlObject.quaternion);
    } else if (keys.down) {
        speed += acceleration * delta;
        speed = Math.min(speed, maxSpeed);
        dir.set(0, 0, -1);
        dir.applyQuaternion(controlObject.quaternion);
    } else {
        speed -= decceleration * delta;
        speed = Math.max(0, speed);
    }

    if (speed !== 0) {
        if (keys.left) {
            controlObject.rotation.y += turnSpeed * delta;
        }
        if (keys.right) {
            controlObject.rotation.y -= turnSpeed * delta;
        }
    }

    if (keys.brake) {
        speed -= drag * delta;
        speed = Math.max(0, speed);
    }

    // console.log(speed);
    controlObject.position.addScaledVector(dir, speed * delta);
}