import {vec3, vec4, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Mesh from './geometry/Mesh';
import {readTextFile} from './globals';
import LSystem from './LSystem'
import {CompatibilityOracle, Wavefunction, Model} from './Model'

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let cylinder: Mesh;
let wahoo: Mesh;

let obj0: string = readTextFile('./src/cylinder.obj');
let obj1: string = readTextFile('./src/wahoo.obj');
let lSystem: LSystem;


class Parameters {
  iterations: number;
  angle: number;
  constructor(it: number, spd: number) {
    this.iterations = it;
    this.angle = spd;
  }

}


let parameters = new Parameters(1.0, 1.0);



function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  cylinder = new Mesh(obj0, vec3.fromValues(0.0, 0.0, 0.0));
  cylinder.create();

  wahoo = new Mesh(obj1, vec3.fromValues(0.0, -10.0, 0.0));
  wahoo.create();



  lSystem = new LSystem("X", parameters.angle);
   
  let array: mat4[] = lSystem.drawMatrices("TSFAAXFAAXFAAXFA" + lSystem.expand(parameters.iterations));
  console.log(array.length)
  console.log(array[0]);
  console.log(array[1]);
  console.log(array[2]);
  console.log(array[3]);

  let transformArray0 = [];
  let transformArray1 = [];
  let transformArray2 = [];
  let transformArray3 = [];

  for (let mat of array) {
    console.log(mat);
    for (let i = 0; i <  4;  i++) {
      let colVec = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
      for (let j = 0; j < 4; j++) {
        let idx = 4 * i + j;
        colVec[j] = mat[idx];
        //for (let x = 0; x < 4; x++) {
          if (i == 0) {
            transformArray0.push(colVec[j]);
          }
  
          if (i == 1) {
            transformArray1.push(colVec[j]);
          }
  
          if (i == 2) {
            transformArray2.push(colVec[j]);
          }
  
          if (i == 3) {
            transformArray3.push(colVec[j]);
          }
        //}
      }
      console.log(colVec);
      
    }
  }

  let transforms0: Float32Array = new Float32Array(transformArray0);
  let transforms1: Float32Array = new Float32Array(transformArray1);
  let transforms2: Float32Array = new Float32Array(transformArray2);
  let transforms3: Float32Array = new Float32Array(transformArray3);

  cylinder.setInstanceVBOs(transforms0, transforms1, transforms2, transforms3);
  cylinder.setNumInstances(array.length);
 
  






  lSystem = new LSystem("TTTTSSF", 1.0);
  //lSystem = new LSystem("ABC");
  //console.log(lSystem.expand(3));
  
  let arrayWahoo: mat4[] = lSystem.drawMatrices(lSystem.expand(0));
  console.log(array.length)
  console.log(array[0]);
  console.log(array[1]);
  console.log(array[2]);
  console.log(array[3]);

  let transformArray0Wahoo = [];
  let transformArray1Wahoo = [];
  let transformArray2Wahoo = [];
  let transformArray3Wahoo = [];

  for (let mat of arrayWahoo) {
    console.log(mat);
    for (let i = 0; i <  4;  i++) {
      let colVec = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
      for (let j = 0; j < 4; j++) {
        let idx = 4 * i + j;
        colVec[j] = mat[idx];
        //for (let x = 0; x < 4; x++) {
          if (i == 0) {
            transformArray0Wahoo.push(colVec[j]);
          }
  
          if (i == 1) {
            transformArray1Wahoo.push(colVec[j]);
          }
  
          if (i == 2) {
            transformArray2Wahoo.push(colVec[j]);
          }
  
          if (i == 3) {
            transformArray3Wahoo.push(colVec[j]);
          }
        //}
      }
      console.log(colVec);
      
    }
  }

  let transforms0Wahoo: Float32Array = new Float32Array(transformArray0Wahoo);
  let transforms1Wahoo: Float32Array = new Float32Array(transformArray1Wahoo);
  let transforms2Wahoo: Float32Array = new Float32Array(transformArray2Wahoo);
  let transforms3Wahoo: Float32Array = new Float32Array(transformArray3Wahoo);

  wahoo.setInstanceVBOs(transforms0Wahoo, transforms1Wahoo, transforms2Wahoo, transforms3Wahoo);
  wahoo.setNumInstances(arrayWahoo.length);
 

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 100.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {
      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      colorsArray.push(i / n);
      colorsArray.push(j / n);
      colorsArray.push(1.0);
      colorsArray.push(1.0); // Alpha channel
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(n * n); // grid of "particles"
}

function main() {
  // testing wfc
  console.log("Starting model test");
  Model.test();
  console.log("concluding model test");
  
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  gui.add(parameters, 'iterations', 1.0,5.0).onChange(function(val: number) {
    parameters.iterations = Math.floor(val);
    loadScene();
    //lambert.setTerrain(val);
    console.log(val);
  }); // Min and max
  gui.add(parameters, 'angle', 0.5, 1.5).onChange(function(val: number) {
    parameters.angle = val;
    loadScene();
    //lambert.setRoad(val);
  }); // Min and max

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();



  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [cylinder]);
    renderer.render(camera, instancedShader, [wahoo]);
    //renderer.render(camera, instancedShader, [
      //square,
    //]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
