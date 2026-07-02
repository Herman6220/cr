import * as THREE from 'three';
import { loadControlObject, updateControlObject } from './car';
import { camera as c, updateCamera } from './camera';
// import { OrbitControls } from 'three/examples/jsm/Addons.js';

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const camera: THREE.PerspectiveCamera = c;

const scene = new THREE.Scene();

const car: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> = await loadControlObject();
scene.add(car);

scene.background = new THREE.Color(0x8888aa);

// const light = new THREE.AmbientLight(0x888888, 1);
// scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(20, 20, 20);
scene.add(directionalLight);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 3);
dirLight2.position.set(-20, 20, -20);
scene.add(dirLight2);

const carDirLight = new THREE.DirectionalLight(0xffffff)
scene.add(carDirLight);
scene.add(carDirLight.target);


// const cdlh = new THREE.DirectionalLightHelper(carDirLight, 0.01);
// scene.add(cdlh);


const hemLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 2);
scene.add(hemLight);

const currPos = new THREE.Vector3();
const currLA = new THREE.Vector3();


camera.position.z = 5;
camera.position.y = 2;


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const controls = new OrbitControls( camera, renderer.domElement );

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

// const clock = new THREE.Timer();

const clock = new THREE.Timer();

const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 50),
    new THREE.Vector3(30, 0, 45),
    new THREE.Vector3(55, 0, 20),
    new THREE.Vector3(60, 0, -20),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-10, 0, -50),
    new THREE.Vector3(-60, 0, -20),
    new THREE.Vector3(-55, 0, 20),
    new THREE.Vector3(-30, 0, 45),
],
    true
);

const length = 1, width = 10;
const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(0, width);
shape.lineTo(length, width);
shape.lineTo(length, 0);
shape.lineTo(0, 0);
shape.closePath();

const loader = new THREE.TextureLoader();
const roadTex = await loader.loadAsync('/roadTex/roadtex.jpg');
const roadBorderTex = await loader.loadAsync('/roadTex/roadBorderTex.jpg');
const roadFinishTex = await loader.loadAsync('/roadTex/roadFinishTex.png');

roadFinishTex.wrapS = THREE.RepeatWrapping;
roadFinishTex.wrapT = THREE.RepeatWrapping;

roadFinishTex.repeat.set(1, 1);


roadTex.rotation = -Math.PI / 2;

roadTex.wrapS = THREE.RepeatWrapping;
roadTex.wrapT = THREE.RepeatWrapping;

roadTex.repeat.set(1, 1);

const planeGeo = new THREE.PlaneGeometry(10, 2);
const planeMat = new THREE.MeshStandardMaterial({ map: roadTex, color: 0x333333 });

const roadBorderGeo = new THREE.BoxGeometry(1, 1, 2);
const roadBorderMat = new THREE.MeshStandardMaterial({ map: roadBorderTex, color: 0x333333 });
const roadFinishMat = new THREE.MeshStandardMaterial({ map: roadFinishTex, color: 0x333333 });

for (let i = 0; i < 500; i++) {
    const t = i / 500;

    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    const mesh = new THREE.Mesh(planeGeo, i > 10 ? planeMat : roadFinishMat);

    const border1 = new THREE.Mesh(roadBorderGeo, roadBorderMat);
    const border2 = new THREE.Mesh(roadBorderGeo, roadBorderMat);
    
    
    mesh.position.copy(pos);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

    border1.position.copy(pos);
    border1.applyQuaternion(mesh.quaternion);
    border1.translateX(5);

    border2.position.copy(pos);
    border2.applyQuaternion(mesh.quaternion);
    border2.translateX(-5);
    
    mesh.rotateX(-Math.PI / 2);
    
    scene.add(mesh);
    scene.add(border1);
    scene.add(border2);
}

function animate() {
    requestAnimationFrame(animate);
    // controls.update();

    if (!car) {
        return;
    }

    clock.update();
    // const delta = clock.getDelta();
    const delta = 1 / 60;

    updateControlObject(delta);

    updateCamera(car, currPos, currLA, carDirLight);

    renderer.render(scene, camera);
}

animate();

