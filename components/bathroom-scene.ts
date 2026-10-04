import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type BathroomScene = {
  update: (progress: number) => void;
  resize: () => void;
  dispose: () => void;
};

const clamp = THREE.MathUtils.clamp;
const ease = (p: number, start: number, end: number) => {
  const t = clamp((p - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
};

/** A real, reversible 3D assembly. All geometry is local; no remote model or textures. */
export function createBathroomScene(host: HTMLDivElement): BathroomScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4.5, 4.5, 4.5, -4.5, 0.1, 80);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, 0.04);
  scene.environment = environmentMap.texture;
  scene.environmentIntensity = 0.55;
  environment.dispose();
  pmrem.dispose();

  const ambient = new THREE.HemisphereLight(0xf5e4ff, 0x51315d, 1.4);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xfff2da, 2.7);
  sun.position.set(2, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 20 });
  sun.shadow.normalBias = 0.035;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xbc8dde, 2);
  rim.position.set(-6, 4, -4);
  scene.add(rim);

  const room = new THREE.Group();
  scene.add(room);
  const mat = (color: string, roughness = 0.55, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const materials = {
    slab: mat("#8c7598"), stone: mat("#d8d0c6", 0.78), wall: mat("#e5ddd7", 0.9),
    purple: mat("#663675", 0.45), dark: mat("#302537", 0.32, 0.5), copper: mat("#cb8754", 0.3, 0.72),
    ceramic: mat("#faf7ef", 0.2), grout: mat("#c2b7b4", 0.85), wood: mat("#b79269", 0.65),
    leaf: mat("#49715b", 0.72), leafLight: mat("#729376", 0.72), towel: mat("#c6abc9", 0.95),
    water: new THREE.MeshPhysicalMaterial({ color: "#92d9de", transparent: true, opacity: 0.58, roughness: 0.1, metalness: 0.12 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#d8eaed", transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.05, depthWrite: false, side: THREE.DoubleSide }),
  };
  const box = (parent: THREE.Object3D, size: [number, number, number], position: [number, number, number], material: THREE.Material, radius = 0.025) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 2, Math.min(radius, ...size.map((v) => v / 3))), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const cylinder = (parent: THREE.Object3D, r1: number, r2: number, height: number, position: [number, number, number], material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, height, 32), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const tube = (parent: THREE.Object3D, points: number[][], radius: number, material: THREE.Material, smooth = false) => {
    const curve = smooth ? new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))) : new THREE.CurvePath<THREE.Vector3>();
    if (curve instanceof THREE.CurvePath) {
      for (let i = 1; i < points.length; i++) curve.add(new THREE.LineCurve3(new THREE.Vector3(...points[i - 1]), new THREE.Vector3(...points[i])));
    }
    const geometry = new THREE.TubeGeometry(curve, Math.max(32, points.length * 10), radius, 8, false);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const blueprintMaterial = new THREE.LineBasicMaterial({ color: "#855391", transparent: true, opacity: 0.8 });
  const blueprint = new THREE.Group();
  room.add(blueprint);
  function outline(size: [number, number, number], position: [number, number, number]) {
    const geometry = new THREE.BoxGeometry(...size);
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), blueprintMaterial);
    geometry.dispose();
    line.position.set(...position);
    blueprint.add(line);
  }
  outline([5.4, 0.12, 4.4], [0, 0, 0]);
  outline([5.4, 3.1, 0.05], [0, 1.6, -2.15]);
  outline([0.05, 3.1, 4.4], [-2.7, 1.6, 0]);
  outline([1.8, 0.8, 0.8], [-0.85, 0.9, -1.65]);
  outline([1.65, 2.6, 1.8], [1.65, 1.4, -1.15]);
  outline([2.2, 0.7, 1.1], [-1.2, 0.5, 0.7]);
  const grid = new THREE.GridHelper(7.5, 24, 0xb993cd, 0x705780);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.25;
  grid.position.y = -0.17;
  room.add(grid);

  const slab = box(room, [5.5, 0.2, 4.5], [0, -0.07, 0], materials.slab, 0.06);
  const plumbing = new THREE.Group();
  room.add(plumbing);
  const pipeMeshes: THREE.Mesh[] = [];
  // The loops sit below the finished floor; risers connect to actual fixtures.
  const heatingPoints = [[-2.35, 0.10, -1.85]];
  for (let row = 0; row < 9; row++) {
    const z = -1.85 + row * 0.44;
    const x = row % 2 === 0 ? 2.35 : -2.35;
    heatingPoints.push([x, 0.10, z]);
    if (row < 8) heatingPoints.push([x, 0.10, z + 0.44]);
  }
  const heatingMaterial = mat("#eac186", 0.4, 0.35);
  heatingMaterial.emissive.set("#b96b28");
  pipeMeshes.push(tube(plumbing, heatingPoints, 0.035, heatingMaterial));
  pipeMeshes.push(tube(plumbing, [[-2.45, 0.13, 1.8], [-2.45, 0.13, -1.92], [-0.85, 0.13, -1.92], [-0.85, 1.25, -1.92]], 0.045, materials.copper));
  pipeMeshes.push(tube(plumbing, [[-2.2, 0.14, 1.8], [-2.2, 0.14, -1.8], [1.8, 0.14, -1.8], [1.8, 2.8, -1.8]], 0.045, materials.copper));
  pipeMeshes.push(tube(plumbing, [[-1.7, 0.13, 1.8], [-1.7, 0.13, 0.6], [-1.7, 0.75, 0.6]], 0.05, materials.copper));
  for (const x of [-2.45, -2.2]) cylinder(plumbing, 0.08, 0.08, 0.12, [x, 0.14, 1.8], materials.copper).rotation.x = Math.PI / 2;

  const tiles: THREE.Mesh[] = [];
  for (let x = 0; x < 6; x++) for (let z = 0; z < 5; z++) {
    const tile = box(room, [0.885, 0.065, 0.866], [-2.25 + x * 0.9, 0.2, -1.76 + z * 0.88], materials.stone, 0.008);
    tile.userData.order = (x + z) / 10;
    tiles.push(tile);
  }
  const walls = new THREE.Group();
  room.add(walls);
  box(walls, [5.5, 3.15, 0.12], [0, 1.79, -2.2], materials.wall);
  box(walls, [0.12, 3.15, 4.5], [-2.75, 1.79, 0], materials.wall);
  // Fine tile joints make the cutaway read as a room, not a generic cube.
  for (let i = 0; i < 6; i++) box(walls, [5.38, 0.008, 0.008], [0, 0.3 + i * 0.6, -2.131], materials.grout, 0);
  for (let i = 0; i < 8; i++) box(walls, [0.008, 3.1, 0.008], [-2.6 + i * 0.75, 1.8, -2.131], materials.grout, 0);
  // A simple framed window on the left wall.
  box(walls, [0.03, 1.42, 1.48], [-2.673, 2.04, -0.38], materials.wood);
  const windowGlass = mat("#c4d8dc", 0.25, 0.25);
  box(walls, [0.038, 1.23, 1.28], [-2.645, 2.04, -0.38], windowGlass);
  box(walls, [0.045, 1.25, 0.035], [-2.62, 2.04, -0.38], materials.ceramic);
  box(walls, [0.045, 0.035, 1.28], [-2.62, 2.04, -0.38], materials.ceramic);

  const vanity = new THREE.Group();
  room.add(vanity);
  box(vanity, [1.8, 0.64, 0.82], [-0.86, 0.83, -1.57], materials.purple, 0.045);
  box(vanity, [1.85, 0.085, 0.87], [-0.86, 1.2, -1.57], materials.ceramic);
  box(vanity, [1.7, 0.012, 0.012], [-0.86, 0.84, -1.151], materials.dark, 0);
  for (const y of [0.67, 0.99]) box(vanity, [0.47, 0.02, 0.035], [-0.86, y, -1.13], materials.copper);
  const basinProfile = [[0,0], [.4,0], [.46,.03], [.51,.19], [.5,.23], [.46,.23], [.42,.08], [0,.06]].map(([x,y])=>new THREE.Vector2(x,y));
  const basin = new THREE.Mesh(new THREE.LatheGeometry(basinProfile, 48), materials.ceramic);
  basin.position.set(-0.86, 1.25, -1.48); basin.scale.z = 0.7; basin.castShadow = true; vanity.add(basin);
  tube(vanity, [[-.86,1.26,-1.87],[-.86,1.67,-1.87],[-.86,1.7,-1.75],[-.86,1.7,-1.51]],.028, materials.dark, true);
  cylinder(vanity, .06,.06,.012,[-.86,1.315,-1.48],materials.dark);
  const mirror = new THREE.Mesh(new THREE.CircleGeometry(.63, 64), mat("#bed0d5",0.09,0.8));
  mirror.position.set(-.86,2.35,-2.12); vanity.add(mirror);
  const mirrorRing = new THREE.Mesh(new THREE.TorusGeometry(.665,.023,8,64),materials.copper);
  mirrorRing.position.set(-.86,2.35,-2.105); vanity.add(mirrorRing);
  const mirrorGlowMaterial = new THREE.MeshBasicMaterial({color:"#ffdda9",transparent:true,opacity:0});
  const glow = new THREE.Mesh(new THREE.RingGeometry(.66,.72,64),mirrorGlowMaterial);
  glow.position.set(-.86,2.35,-2.12); vanity.add(glow);

  const bath = new THREE.Group(); room.add(bath);
  const bathProfile = [[0,0],[.52,0],[.65,.05],[.78,.38],[.79,.66],[.76,.72],[.71,.72],[.68,.65],[.65,.35],[.50,.15],[0,.14]].map(([x,y])=>new THREE.Vector2(x,y));
  const tub = new THREE.Mesh(new THREE.LatheGeometry(bathProfile,64),materials.ceramic);
  tub.position.set(-1.15,.25,.8); tub.scale.set(1.45,1,.83); tub.castShadow=true; tub.receiveShadow=true; bath.add(tub);
  tube(bath,[[-2.18,.25,.75],[-2.18,1.22,.75],[-2.04,1.35,.75],[-1.86,1.35,.75],[-1.8,1.23,.75]],.035,materials.dark,true);
  const bathWater = new THREE.Mesh(new THREE.CircleGeometry(.62,64),materials.water);
  bathWater.rotation.x=-Math.PI/2; bathWater.scale.set(1.45,.83,1); bathWater.position.set(-1.15,.8,.8); bath.add(bathWater);
  const bathShelf = box(bath,[.25,.045,1.3],[-1.15,.98,.8],materials.wood);
  bathShelf.rotation.y=.08;

  const shower = new THREE.Group(); room.add(shower);
  box(shower,[1.6,.07,1.72],[1.72,.27,-1.19],materials.ceramic);
  box(shower,[.8,.015,.08],[1.72,.31,-1.84],materials.dark);
  // A straight riser and bounded elbows keep the whole pipe in front of the tiles.
  // Interpolating the entire path as a spline bowed the riser into the wall.
  const showerPipePath = new THREE.CurvePath<THREE.Vector3>();
  showerPipePath.add(new THREE.LineCurve3(new THREE.Vector3(1.75,1.1,-2.08),new THREE.Vector3(1.75,2.7,-2.08)));
  showerPipePath.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(1.75,2.7,-2.08),new THREE.Vector3(1.75,2.9,-2.08),new THREE.Vector3(1.75,2.9,-1.88)));
  showerPipePath.add(new THREE.LineCurve3(new THREE.Vector3(1.75,2.9,-1.88),new THREE.Vector3(1.75,2.9,-1.34)));
  showerPipePath.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(1.75,2.9,-1.34),new THREE.Vector3(1.75,2.9,-1.28),new THREE.Vector3(1.75,2.85,-1.28)));
  const showerPipe = new THREE.Mesh(new THREE.TubeGeometry(showerPipePath,64,.025,8,false),materials.dark);
  showerPipe.castShadow = true;
  shower.add(showerPipe);
  cylinder(shower,.24,.24,.035,[1.75,2.85,-1.28],materials.dark);
  box(shower,[.35,.08,.07],[1.75,1.25,-2.07],materials.dark);
  box(shower,[.025,2.55,1.75],[.9,1.58,-1.18],materials.glass,0.004);
  box(shower,[.035,2.6,.035],[.9,1.58,-.30],materials.dark);
  box(shower,[.035,2.6,.035],[.9,1.58,-2.06],materials.dark);
  box(shower,[.035,.035,1.8],[.9,2.9,-1.18],materials.dark);

  const finishing = new THREE.Group(); room.add(finishing);
  // Towels, soap, and a plant arrive last, giving the same room a lived-in finish.
  for (let i=0;i<3;i++) box(finishing,[.43,.065,.27],[-.18,1.28+i*.067,-1.55],i===1?materials.ceramic:materials.towel,.028);
  cylinder(finishing,.055,.055,.2,[-1.52,1.35,-1.78],materials.purple);
  box(finishing,[.1,.025,.035],[-1.50,1.46,-1.78],materials.dark);
  cylinder(finishing,.24,.17,.45,[2.12,.48,1.48],materials.ceramic);
  cylinder(finishing,.20,.20,.012,[2.12,.709,1.48],materials.dark);
  for(let i=0;i<9;i++) {
    const angle=i*2.4;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1,12,8),i%2?materials.leaf:materials.leafLight);
    leaf.scale.set(.11,.45,.035);
    leaf.position.set(2.12+Math.sin(angle)*.2,1.03+(i%3)*.16,1.48+Math.cos(angle)*.2);
    leaf.rotation.set(Math.cos(angle)*.5,angle,Math.sin(angle)*.55);
    leaf.castShadow=true; finishing.add(leaf);
    tube(finishing,[[2.12,.7,1.48],[leaf.position.x,leaf.position.y,leaf.position.z]],.01,materials.leaf);
  }
  box(finishing,[1.25,.023,.72],[.6,.255,1.1],materials.towel,.01);
  const waterLines = new THREE.Group(); room.add(waterLines);
  const rainMaterial = new THREE.MeshBasicMaterial({color:"#b5e7f5",transparent:true,opacity:.55});
  for(let i=0;i<22;i++) {
    const a=i*2.4, r=.19*Math.sqrt(i/22);
    tube(waterLines,[[1.75+Math.sin(a)*r,2.81,-1.28+Math.cos(a)*r],[1.75+Math.sin(a)*r,.33,-1.28+Math.cos(a)*r]],.004,rainMaterial);
  }
  const warmLight=new THREE.PointLight(0xffd59d,0,5);warmLight.position.set(-.8,2.4,-1.5);room.add(warmLight);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({color:0x170d20,opacity:.2}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-.22;shadow.receiveShadow=true;scene.add(shadow);

  let currentProgress=0;
  const assemble=(object:THREE.Object3D, amount:number, height:number)=>{
    object.visible=amount>.001;
    object.position.y=(1-amount)*height;
    object.scale.setScalar(.94+.06*amount);
  };
  function render(progress:number) {
    currentProgress=progress;
    const pipes=ease(progress,.08,.36), surfaces=ease(progress,.40,.62), fittings=ease(progress,.56,.78), finish=ease(progress,.79,.94);
    blueprintMaterial.opacity=(1-ease(progress,.45,.68))*.65;
    blueprint.visible=progress<.68;
    (grid.material as THREE.Material).opacity=.3*(1-ease(progress,.55,.85));
    slab.material=materials.slab;
    materials.slab.color.set(progress<.4?"#8c7598":"#bba9c4");
    plumbing.visible=pipes>0 && progress<.67;
    for(const pipe of pipeMeshes){const count=pipe.geometry.index?.count||0;pipe.geometry.setDrawRange(0,Math.floor(count*pipes/3)*3);}
    heatingMaterial.emissiveIntensity=.4*(1-surfaces);
    walls.visible=surfaces>0; walls.scale.y=Math.max(.001,surfaces);
    for(const tile of tiles){const t=ease(progress,.38+tile.userData.order*.13,.56+tile.userData.order*.13);tile.visible=t>0;tile.position.y=.2+(1-t)*1.8;tile.scale.setScalar(Math.max(.001,t));}
    assemble(vanity,fittings,1.7);
    assemble(bath,ease(progress,.61,.8),1.3);
    assemble(shower,ease(progress,.57,.77),2);
    assemble(finishing,finish,.8);
    bathWater.visible=finish>.5;
    waterLines.visible=finish>.6;
    rainMaterial.opacity=finish*.5;
    mirrorGlowMaterial.opacity=finish;
    warmLight.intensity=finish*7;
    // A small, continuous orbit reveals the depth without moving the visitor's scroll.
    const angle=.56+progress*.24;
    camera.position.set(Math.sin(angle)*12,8.2-progress*1.3,Math.cos(angle)*12);
    camera.lookAt(0,1.25,0);
    room.rotation.y=-.10+progress*.08;
    renderer.render(scene,camera);
  }
  function resize() {
    const width=host.clientWidth,height=host.clientHeight;
    if(!width||!height)return;
    renderer.setSize(width,height,false);
    const aspect=width/height;
    const vertical=Math.max(6.5,7.4/aspect);
    camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;
    camera.updateProjectionMatrix();render(currentProgress);
  }
  resize();
  return {
    update:render,resize,
    dispose() {
      const geometries=new Set<THREE.BufferGeometry>();
      const sceneMaterials=new Set<THREE.Material>(Object.values(materials));
      scene.traverse((object)=>{
        const mesh=object as THREE.Mesh;
        if(mesh.geometry)geometries.add(mesh.geometry);
        if(mesh.material)(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>sceneMaterials.add(m));
      });
      geometries.forEach(g=>g.dispose());sceneMaterials.forEach(m=>m.dispose());environmentMap.dispose();
      renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    },
  };
}
