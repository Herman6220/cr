import * as THREE from 'three';

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

function calculateIdealLightOffset(item: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>) {
    const idealLightOffset = new THREE.Vector3(0, 0.5, -0.5);
    idealLightOffset.applyQuaternion(item.quaternion);
    idealLightOffset.add(item.position);
    return idealLightOffset;
}

function calculateIdealLightLookat(item: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>) {
    const idealLightLookat = new THREE.Vector3(0, 0, 10);
    idealLightLookat.applyQuaternion(item.quaternion);
    idealLightLookat.add(item.position);
    return idealLightLookat;
}

export function calculateIdealOffset(item: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>) {
    // const idealOffset = new THREE.Vector3(0, 0.52, -0.3);
    const idealOffset = new THREE.Vector3(0, 2, -4);
    idealOffset.applyQuaternion(item.quaternion);
    idealOffset.add(item.position);
    return idealOffset;
}

export function calculateIdealLookat(item: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>) {
    const idealLookat = new THREE.Vector3(0, 0, 10);
    idealLookat.applyQuaternion(item.quaternion);
    idealLookat.add(item.position);
    return idealLookat;
}

const texLoader = new THREE.TextureLoader();
const speedoMeterTex = await texLoader.loadAsync("/screen/speedoMeter.png");
speedoMeterTex.colorSpace = THREE.SRGBColorSpace;

const meterGeo = new THREE.CircleGeometry(0.2);
const meterMat = new THREE.MeshBasicMaterial({ map: speedoMeterTex});
export const meter = new THREE.Mesh(meterGeo, meterMat);

const needleShape = new THREE.Shape();
needleShape.moveTo(0, 0);
needleShape.lineTo(0.01, 0);
needleShape.lineTo(0, 0.11);
needleShape.lineTo(-0.01, 0);
needleShape.lineTo(0, -0.03);
needleShape.lineTo(0.01, 0);
needleShape.closePath();

// const meterNeedleGeo = new THREE.PlaneGeometry(0.02, 0.22);
const meterNeedleGeo = new THREE.ShapeGeometry(needleShape);
const meterNeedleMat = new THREE.MeshBasicMaterial({color: 0xff0000});
export const meterNeedle = new THREE.Mesh(meterNeedleGeo, meterNeedleMat);

const forward = new THREE.Vector3();
const left = new THREE.Vector3();
const down = new THREE.Vector3();

export function updateCamera(item: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>, currPosition: THREE.Vector3, currLookat: THREE.Vector3, carDirLight: THREE.DirectionalLight) {
    const idealOffset = calculateIdealOffset(item);
    const idealLookat = calculateIdealLookat(item);
    const idealLightOffset = calculateIdealLightOffset(item);
    const idealLightLookat = calculateIdealLightLookat(item);
    
    const t = 0.2;
    
    currPosition.lerp(idealOffset, t);
    currLookat.lerp(idealLookat, t);
    
    camera.position.copy(currPosition);
    camera.lookAt(currLookat);
    
    camera.getWorldDirection(forward);
    left.crossVectors(forward, camera.up).normalize();
    down.copy(camera.up).normalize();
    const meterPos = camera.position.clone().add(forward.multiplyScalar(1)).add(left.multiplyScalar(-1.2)).add(down.multiplyScalar(-0.4));
    // console.log(meterPos);
    meter.position.copy(meterPos);
    meter.quaternion.copy(camera.quaternion);
    meterNeedle.position.copy(meterPos);
    meterNeedle.quaternion.copy(camera.quaternion);

    carDirLight.position.copy(idealLightOffset);
    carDirLight.target.position.copy(idealLightLookat);
}