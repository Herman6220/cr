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

function calculateIdealOffset(item: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>) {
    // const idealOffset = new THREE.Vector3(0, 0.52, -0.3);
    const idealOffset = new THREE.Vector3(0, 2, -4);
    idealOffset.applyQuaternion(item.quaternion);
    idealOffset.add(item.position);
    return idealOffset;
}

function calculateIdealLookat(item: THREE.Group<THREE.Object3DEventMap> | THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>) {
    const idealLookat = new THREE.Vector3(0, 0, 10);
    idealLookat.applyQuaternion(item.quaternion);
    idealLookat.add(item.position);
    return idealLookat;
}

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

    carDirLight.position.copy(idealLightOffset);
    carDirLight.target.position.copy(idealLightLookat);
}