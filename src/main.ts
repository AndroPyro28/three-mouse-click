import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas') as HTMLCanvasElement
})
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,0.1, 1000)
camera.position.set(0, 6, 6);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF)
scene.add(directionalLight);

const axesHelper = new THREE.AxesHelper(110);
scene.add(axesHelper)

const animate = (time: number) => {
  renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate)

const mouse = new THREE.Vector2()
const intersectionPoint = new THREE.Vector3()
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane()
const rayCaster = new THREE.Raycaster()

window.addEventListener('mousemove', (e: MouseEvent) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 -1 
  mouse.y = -(e.clientY / window.innerHeight) * 2  + 1 
  planeNormal.copy(camera.position).normalize();
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
  rayCaster.setFromCamera(mouse, camera);
  rayCaster.ray.intersectPlane(plane,intersectionPoint);
})

window.addEventListener('click', () => {
  const sphereGeometry = new THREE.SphereGeometry(0.125,30, 30);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFEA00,
    metalness: 0,
    roughness: 0,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere)
  sphere.position.copy(intersectionPoint)
})
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})
