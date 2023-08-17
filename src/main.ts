import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas') as HTMLCanvasElement,
  antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight -10);
renderer.shadowMap.enabled = true
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,0.1, 1000)
camera.position.set(6, 8, 14);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
const ambientLight = new THREE.AmbientLight(0x333333);
// ambientLight.castShadow = true
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF)
directionalLight.position.set(0,50,0)
directionalLight.castShadow = true
// to increase shadow
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
scene.add(directionalLight);

// const axesHelper = new THREE.AxesHelper(110);
// scene.add(axesHelper)

const world = new CANNON.World({gravity: new CANNON.Vec3(0, -9.81, 0)})
const planeGeo = new THREE.PlaneGeometry(15, 15);
const planeMat = new THREE.MeshStandardMaterial({
  color: 'white',
  side: THREE.DoubleSide
})

const planeMesh = new THREE.Mesh(planeGeo, planeMat);
planeMesh.receiveShadow = true
scene.add(planeMesh)

const planePhysMat = new CANNON.Material();
const planeBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Box(new CANNON.Vec3(7.5,7.5,0.001)),
  material: planePhysMat
})

world.addBody(planeBody)

planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

const mouse = new THREE.Vector2()
const intersectionPoint = new THREE.Vector3()
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane()
const rayCaster = new THREE.Raycaster()

window.addEventListener('mousemove', (e: MouseEvent) => {
  // getting mouse position
  mouse.x = (e.clientX / window.innerWidth) * 2 -1 
  mouse.y = -(e.clientY / window.innerHeight) * 2  + 1 
  console.log(intersectionPoint)
  planeNormal.copy(camera.position).normalize();
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
  rayCaster.setFromCamera(mouse, camera);
  rayCaster.ray.intersectPlane(plane,intersectionPoint);
})

const meshes:THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>[] = []
const bodies:CANNON.Body[] = []

window.addEventListener('click', () => {
  const sphereGeometry = new THREE.SphereGeometry(0.3,30, 30);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: Math.random() * 0xFFFFFF,
    metalness: 0,
    roughness: 0,
  });
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.castShadow = true
  sphereMesh.receiveShadow = true
  scene.add(sphereMesh)
  // sphereMesh.position.copy(intersectionPoint)
  const spherePhysMat = new CANNON.Material()
  const sphereBody = new CANNON.Body({
    mass:0.3,
    shape: new CANNON.Sphere(0.3),
    position: new CANNON.Vec3(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z),
    material: spherePhysMat
  })
  console.log("::",intersectionPoint.x, intersectionPoint.y, intersectionPoint.z)
  world.addBody(sphereBody)
  meshes.push(sphereMesh)
  bodies.push(sphereBody)

  const planeSphereContactMaterial = new CANNON.ContactMaterial(planePhysMat, spherePhysMat, {restitution: 0.8})

  world.addContactMaterial(planeSphereContactMaterial)
})

const timeStep = 1 / 60
const animate: XRFrameRequestCallback = (time, frame) => {
  world.step(timeStep)
  //@ts-expect-error
  planeMesh.position.copy(planeBody.position)
  //@ts-expect-error
  planeMesh.quaternion.copy(planeBody.quaternion)

  for(let i = 0; i < meshes.length; i++) {
    //@ts-expect-error
    meshes[i].position.copy(bodies[i].position)
    //@ts-expect-error
    meshes[i].quaternion.copy(bodies[i].quaternion)
  }
  renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})
