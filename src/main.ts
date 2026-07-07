import * as THREE from 'three';
import { loadControlObject, updateControlObject } from './car';
import { camera as c, calculateIdealLookat, calculateIdealOffset, meter, meterNeedle, updateCamera } from './camera';
// import { OrbitControls } from 'three/examples/jsm/Addons.js';
// import * as RAPIER from "@dimforge/rapier3d";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";



document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const camera: THREE.PerspectiveCamera = c;

const scene = new THREE.Scene();

const cubeTexLoader = new THREE.CubeTextureLoader();
const bgTex = cubeTexLoader.load([
    "/sky/right.jpg",
    "/sky/left.jpg",
    "/sky/top.jpg",
    "/sky/bottom3.jpg",
    "/sky/front.jpg",
    "/sky/behind.jpg",
])
scene.background = bgTex;
// scene.background = new THREE.Color(0x8888aa);

const car: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> = await loadControlObject();
scene.add(car);
car.position.x = -250;
car.position.z = -100;
car.position.y = 10;


scene.add(meter);
scene.add(meterNeedle);


const light = new THREE.AmbientLight(0xaaaaff, 2);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(-400, 50, -80);
dirLight.castShadow = true;

dirLight.shadow.mapSize.set(512, 512);

dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 800;
scene.add(dirLight);
dirLight.target = car;

const carDirLight = new THREE.DirectionalLight(0xffffff)
scene.add(carDirLight);
scene.add(carDirLight.target);


// const cdlh = new THREE.DirectionalLightHelper(dirLight2, 5);
// scene.add(cdlh);

const helper = new THREE.CameraHelper(dirLight.shadow.camera);
scene.add(helper);


// const hemLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 2);
// scene.add(hemLight);

const currPos = new THREE.Vector3();
currPos.copy(calculateIdealOffset(car));
const currLA = new THREE.Vector3();
currLA.copy(calculateIdealLookat(car));


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// camera.position.y = 100;
// camera.position.x = -250;
// camera.position.z = -100;
// camera.rotateX(-Math.PI/2);

renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// const controls = new OrbitControls(camera, renderer.domElement);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

// const clock = new THREE.Timer();

const clock = new THREE.Timer();

export const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-250, 0, -100),
    new THREE.Vector3(80, 0, -260),
    new THREE.Vector3(300, 0, -280),
    new THREE.Vector3(400, 0, -100),
    new THREE.Vector3(400, 0, 0),
    new THREE.Vector3(250, 0, 20),
    new THREE.Vector3(200, 0, -20),
    new THREE.Vector3(240, 0, -140),
    new THREE.Vector3(200, 0, -200),
    new THREE.Vector3(140, 0, -200),
    new THREE.Vector3(120, 0, -180),
    new THREE.Vector3(120, 0, -80),
    new THREE.Vector3(80, 0, -40),
    new THREE.Vector3(50, 0, -50),
    new THREE.Vector3(30, 0, -120),
    new THREE.Vector3(0, 0, -130),
    new THREE.Vector3(-90, 0, -90),
    new THREE.Vector3(-40, 0, 90),
    new THREE.Vector3(300, 0, 140),
    new THREE.Vector3(380, 0, 300),
    new THREE.Vector3(370, 0, 360),
    new THREE.Vector3(360, 0, 370),
    new THREE.Vector3(-10, 0, 340),
    new THREE.Vector3(-10, 0, 320),
    new THREE.Vector3(-10, 0, 300),
    new THREE.Vector3(70, 0, 250),
    new THREE.Vector3(70, 0, 180),
    new THREE.Vector3(60, 0, 160),
    new THREE.Vector3(30, 0, 160),
    new THREE.Vector3(-30, 0, 160),
    new THREE.Vector3(-60, 0, 120),
    new THREE.Vector3(-100, 0, 100),
    new THREE.Vector3(-130, 0, 180),
    new THREE.Vector3(-130, 0, 200),
    new THREE.Vector3(-80, 0, 240),
    new THREE.Vector3(-100, 0, 340),
    new THREE.Vector3(-120, 0, 350),
    new THREE.Vector3(-300, 0, 350),
    new THREE.Vector3(-310, 0, 340),
    new THREE.Vector3(-340, 0, 0),
],
    true
);

const loader = new THREE.TextureLoader();
const roadTex = await loader.loadAsync('/roadTex/roadtex.jpg');
roadTex.wrapS = THREE.RepeatWrapping;
roadTex.wrapT = THREE.RepeatWrapping;
roadTex.repeat.set(50, 2);
roadTex.colorSpace = THREE.SRGBColorSpace;
roadTex.offset.y += 0.5;

const roadGeo = new THREE.TubeGeometry(curve, 700, 10, 10, true);
roadGeo.scale(1, 0.01, 1);
const roadMat = new THREE.MeshStandardMaterial({ map: roadTex });
const road = new THREE.Mesh(roadGeo, roadMat);
road.receiveShadow = true;
// road.position.y = 1;
scene.add(road);

const terrainDisplacementMap = await loader.loadAsync("/terrain/terrainNoise.png");
const terrainTex = await loader.loadAsync("/terrain/terrainMap.jpg");
terrainTex.colorSpace = THREE.SRGBColorSpace;

terrainTex.wrapS = THREE.RepeatWrapping;
terrainTex.wrapT = THREE.RepeatWrapping;
terrainTex.repeat.set(20, 20);

const terrainGeo = new THREE.PlaneGeometry(1000, 1000, 200, 200);
terrainGeo.rotateX(-Math.PI / 2);
const terrainMat = new THREE.MeshStandardMaterial({ flatShading: true, map: terrainTex });
const terrain = new THREE.Mesh(terrainGeo, terrainMat);
terrain.receiveShadow = true;
terrain.castShadow = true;
scene.add(terrain);


const image = terrainDisplacementMap.image;
const canvas = document.createElement("canvas");
canvas.width = image.width;
canvas.height = image.height;
const ctx = canvas.getContext("2d");
ctx?.drawImage(image, 0, 0);
const imageData = ctx?.getImageData(0, 0, image.width, image.height);

const pos = terrainGeo.attributes.position;

const pixels = imageData?.data || [];


function getPixelAsFloat(x: number, y: number) {
    const pos = (y * image.width + x) * 4;
    return pixels[pos] / 255.0;
}

const vertex = new THREE.Vector3();
const roadPoints = curve.getPoints(1000);

const stride = 201;
const terrainHeights = new Float32Array(stride * stride);

for (let row = 0; row < stride; row++) {
    for (let col = 0; col < stride; col++) {
        const i = row * stride + col;

        vertex.set(pos.getX(i), 0, pos.getZ(i));

        let minDist = Infinity;
        for (const p of roadPoints) {
            minDist = Math.min(minDist, vertex.distanceTo(p));
        }

        const w = image.width - 1;
        const h = image.height - 1;

        const x = pos.getX(i);
        const z = pos.getZ(i);

        const u = (x + 500) / 1000;
        const v = (z + 500) / 1000;

        const x1 = Math.floor(u * w);
        const z1 = Math.floor(v * h);
        const x2 = THREE.MathUtils.clamp(x1 + 1, 0, w);
        const z2 = THREE.MathUtils.clamp(z1 + 1, 0, h);

        const xp = u * w - x1;
        const zp = v * h - z1;

        const p11 = getPixelAsFloat(x1, z1);
        const p21 = getPixelAsFloat(x2, z1);
        const p12 = getPixelAsFloat(x1, z2);
        const p22 = getPixelAsFloat(x2, z2);

        const px1 = THREE.MathUtils.lerp(p11, p21, xp);
        const px2 = THREE.MathUtils.lerp(p12, p22, xp);

        let height = THREE.MathUtils.lerp(px1, px2, zp);

        const roadHalfWidth = 15;
        const blendWidth = 20;

        if (minDist < roadHalfWidth) {
            height = 0;
        } else if (minDist < roadHalfWidth + blendWidth) {
            const t = (minDist - roadHalfWidth) / blendWidth;
            height = THREE.MathUtils.lerp(0, height, t);
        }

        if (isNaN(height)) {
            throw new Error("height is not a number.");
        }

        height *= 10;

        pos.setY(i, height);

        const rapierHeight = col * stride + row;
        terrainHeights[rapierHeight] = height;
    }
}

const RAPIER = await import("@dimforge/rapier3d");

let gravity = { x: 0.0, y: -9.81, z: 0.0 };
let world = new RAPIER.World(gravity);

const fixedBodyType = RAPIER.RigidBodyDesc.fixed();
const terrainPhyBody = world.createRigidBody(fixedBodyType);
const terrainColliderType = RAPIER.ColliderDesc.heightfield(
    200,
    200,
    terrainHeights,
    { x: 1000, y: 1, z: 1000 }
)
world.createCollider(terrainColliderType, terrainPhyBody);

const positions = roadGeo.attributes.position.array as Float32Array<ArrayBufferLike>;
const indices = roadGeo.index!.array as Uint32Array<ArrayBufferLike>;

const roadPhyBody = world.createRigidBody(fixedBodyType);
const roadColliderType = RAPIER.ColliderDesc.trimesh(positions, indices);
world.createCollider(roadColliderType, roadPhyBody);


const dynamicBodyType = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(-250, 10, -100);
export const carPhyBody = world.createRigidBody(dynamicBodyType);
const carColliderType = RAPIER.ColliderDesc.cuboid(1.5, 0.05, 2);
// const carColliderType = RAPIER.ColliderDesc.roundCuboid(1.5, 0.25, 2, 0);
world.createCollider(carColliderType, carPhyBody);

const gltfLoader = new GLTFLoader();
const gltf = await gltfLoader.loadAsync("/road/guardrail_road.glb");
const guardrail = gltf.scene;
guardrail.traverse((child) => {
    if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
    }
});

for (let i = 0; i < 400; i++) {
    const t = i / 400;
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    const guardrailColliderType = RAPIER.ColliderDesc.cuboid(0.15, 2, 5);
    const leftGuardrailPhyBody = world.createRigidBody(fixedBodyType);
    const rightGuardrailPhyBody = world.createRigidBody(fixedBodyType);

    const lg = guardrail.clone();
    const rg = guardrail.clone();
    lg.position.copy(pos);
    rg.position.copy(pos);
    lg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    rg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    lg.translateX(-10);
    rg.translateX(10);
    rg.rotateY(-Math.PI);

    leftGuardrailPhyBody.setTranslation(lg.position, true);
    leftGuardrailPhyBody.setRotation(lg.quaternion, true);
    rightGuardrailPhyBody.setTranslation(rg.position, true);
    rightGuardrailPhyBody.setRotation(rg.quaternion, true);

    scene.add(lg);
    scene.add(rg);
    world.createCollider(guardrailColliderType, leftGuardrailPhyBody);
    world.createCollider(guardrailColliderType, rightGuardrailPhyBody);
}

function animate() {
    requestAnimationFrame(animate);
    // controls.update();
    world.step();

    if (!car) {
        return;
    }

    clock.update();
    // const delta = clock.getDelta();
    const delta = 1 / 60;

    updateCamera(car, currPos, currLA, carDirLight);
    updateControlObject(delta);

    console.log(renderer.info.render.calls);      // draw calls
    console.log(renderer.info.render.triangles);  // triangles
    console.log(renderer.info.memory);

    renderer.render(scene, camera);
}

animate();

