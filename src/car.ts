import * as THREE from 'three';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { meterNeedle } from './camera';
import { carPhyBody } from './main';

const loader = new GLTFLoader();

const boxGeo = new THREE.BoxGeometry(3, 0.5, 4);
const boxMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
const box = new THREE.Mesh(boxGeo, boxMat);
// box.castShadow = true;

let controlObject: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> = box;

let speed = 0;
const acceleration = 25;
const turnSpeed = 2;
const decceleration = 8;
const drag = 50;
const maxSpeed = 50;

export async function loadControlObject(): Promise<THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>> {
    // return controlObject;
    try {
        const gltf = await loader.loadAsync("/scene.gltf");

        controlObject = gltf.scene;

        controlObject.scale.set(100, 100, 100);

        controlObject.rotation.y = Math.PI;

        // controlObject.castShadow = true;
        // controlObject.receiveShadow = true;

        // controlObject.position.y = 2;

        controlObject.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
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
    const pos = carPhyBody.translation();
    const rot = carPhyBody.rotation();

    controlObject.position.set(pos.x, pos.y, pos.z);
    controlObject.quaternion.set(rot.x, rot.y, rot.z, rot.w);

    if (keys.up) {
        speed += acceleration * delta;
        speed = Math.min(speed, maxSpeed);
        dir.set(0, 0, 1);
        dir.applyQuaternion(controlObject.quaternion);
        // carPhyBody.setTranslation(controlObject.position.addScaledVector(dir, speed * delta), true);
    } else if (keys.down) {
        speed += acceleration * delta;
        speed = Math.min(speed, maxSpeed);
        dir.set(0, 0, -1);
        dir.applyQuaternion(controlObject.quaternion);
        // carPhyBody.setTranslation(controlObject.position.addScaledVector(dir, speed * delta), true);
    } else {
        speed -= decceleration * delta;
        speed = Math.max(0, speed);
    }

    if (speed !== 0) {
        // if (keys.left) {
        //     // controlObject.rotation.y += turnSpeed * delta;
        //     const rot = carPhyBody.rotation();
        //     rot.y += turnSpeed * delta;
        //     carPhyBody.setRotation(rot, true);
        // }
        // if (keys.right) {
        //     // controlObject.rotation.y -= turnSpeed * delta;
        //     const rot = carPhyBody.rotation();
        //     rot.y -= turnSpeed * delta;
        //     carPhyBody.setRotation(rot, true);
        // }

        if (keys.left) {
            carPhyBody.setAngvel({ x: 0, y: turnSpeed, z: 0 }, true);
        } else if (keys.right) {
            carPhyBody.setAngvel({ x: 0, y: -turnSpeed, z: 0 }, true);
        } else {
            carPhyBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
    }

    if (keys.brake) {
        speed -= drag * delta;
        speed = Math.max(0, speed);
    }

    const angle = -(speed / maxSpeed) * Math.PI;

    meterNeedle.rotateZ(angle + 90.3);

    const vel = {
        x: dir.x * speed,
        y: carPhyBody.linvel().y,
        z: dir.z * speed,
    };

    carPhyBody.setLinvel(vel, true);
    
}