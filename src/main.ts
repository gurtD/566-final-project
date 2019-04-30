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
import {CompatibilityOracle, Wavefunction, Model, ValidGrid} from './Model'
import Texture from './rendering/gl/Texture';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
};

let square: Mesh;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let cylinder: Mesh;
let wahoo: Mesh;

let obj0: string = readTextFile('./src/cylinder.obj');
let obj1: string = readTextFile('./src/wahoo.obj');
let obj2: string = readTextFile('./src/square.obj');

let noiseTex1: Texture;
let noiseTex2: Texture;
let flameSource: Texture;


class Parameters {
  iterations: number;
  angle: number;
  constructor(it: number, spd: number) {
    this.iterations = it;
    this.angle = spd;
  }

}


let parameters = new Parameters(1.0, 1.0);

function tileOffsets(tileNum: number): [number, number] {
  switch(tileNum) {
    case 0.0: {
      // grass tile
      return [ 16.0 / 1408.0, 0.0]; 
      break;
    } 

    //road tile
    case 1.0: {
      return [18.0 * 16.0 / 1408.0, 18.0 * 16.0 / 1104.0]
        break;
        
    } 
    case 2.0: {
        //fs_Col = vec4(1.0, 0.0, 0.0, 1.0);
        return [0.0, 0.0]
    }
     // horizontal water below cliff tile
    case 3.0: {
       
        return [16.0 / 1408.0, 18.0 * 16.0 / 1104.0]
        break;
    }
    case 4.0: {
        // water tile
        return [38.0 * 16.0 / 1408.0, 0.0];
        break;
    }
    case 5.0: {
        // horizontal water to cliff corner tile, bottom right of square corner
        return [7.0 * 16.0 / 1408.0, 45.0 * 16.0 / 1104.0]
        break;
    }
    case 6.0: {
        // horizontal water to cliff corner tile, top left of square corner
        return [4.0 * 16.0 / 1408.0, 14.0 * 16.0 / 1104.0]
        break
    }
    case 7.0: {
        // horizontal water to cliff corner tile, top right of square corner
        return [16.0 / 1408.0,  17.0 * 16.0 / 1104.0]
        break
    }
    case 8.0: {
        // horizontal water to cliff corner tile, bottom left of square corner
        return [6.0 * 16.0 / 1408.0, 45.0 * 16.0 / 1104.0]
        break

    }
    case 9.0: {
        // shallow water
        return [6.0 * 16.0 / 1408.0, 51.0 * 16.0 / 1104.0]
        break
    }
    case 10.0: {
        // stairs
        return [7.0 * 16.0 / 1408.0, 25.0 * 16.0 / 1104.0]
        break;
    }
    //////////////// pokemart tiles 
    case 11.0: {
        // stairs
        return [0.0 * 16.0 / 1408.0, 12.0 * 16.0 / 1104.0]
        break
    }
    case 12.0: {
        // stairs
        return [1.0 * 16.0 / 1408.0, 8.0 * 16.0 / 1104.0]
        break
    }
    case 13.0: {
        // stairs
        return [2.0 * 16.0 / 1408.0, 8.0 * 16.0 / 1104.0]
        break
    }
    case 14.0: {
        // stairs
        return [3.0 * 16.0 / 1408.0, 8.0 * 16.0 / 1104.0]
        break
    }
    case 15.0: {
        // stairs
        return [0.0 * 16.0 / 1408.0, 7.0 * 16.0 / 1104.0]
        break
    }
    case 16.0: {
        // stairs
        return [1.0 * 16.0 / 1408.0, 7.0 * 16.0 / 1104.0]
        break
    }
    case 17.0: {
        // stairs
        return [2.0 * 16.0 / 1408.0, 7.0 * 16.0 / 1104.0]
        break
    }
    case 18.0: {
        // stairs
        return [ 3.0 * 16.0 / 1408.0, 7.0 * 16.0 / 1104.0]
        break
    }
    case 19.0: {
        // stairs
        return [0.0 * 16.0 / 1408.0, 6.0 * 16.0 / 1104.0]
        break
    }
    case 20.0: {
      return [1.0 * 16.0 / 1408.0, 6.0 * 16.0 / 1104.0]
        break
    }
    case 21.0: {
        return [2.0 * 16.0 / 1408.0, 6.0 * 16.0 / 1104.0]
        break
    }
    case 22.0: {
        return [3.0 * 16.0 / 1408.0, 6.0 * 16.0 / 1104.0]
        break
    }
    case 23.0: {
        // stairs
        return [0.0 * 16.0 / 1408.0, 5.0 * 16.0 / 1104.0]
        break
    }
    case 24.0: {
        // stairs
        return [1.0 * 16.0 / 1408.0, 5.0 * 16.0 / 1104.0]
        break
    }
    case 25.0: {
        // stairs
        return [1.0 * 16.0 / 1408.0, 5.0 * 16.0 / 1104.0]
        break;
    }
    case 26.0: {
        // stairs
        return [3.0 * 16.0 / 1408.0, 5.0 * 16.0 / 1104.0];
        break;
    }

    /////////////////////// pokecenter
    case 27.0: {
      // stairs
      return [0.0 * 16.0 / 1408.0, 12.0 * 16.0 / 1104.0];
      break;
    }
    case 28.0: {
      // stairs
      return [1.0 * 16.0 / 1408.0, 12.0 * 16.0 / 1104.0];
      break;
    }
    case 29.0: {
      // stairs
      return [2.0 * 16.0 / 1408.0, 12.0 * 16.0 / 1104.0];
      break;
    }
    case 30.0: {
      // stairs
      return [3.0 * 16.0 / 1408.0, 12.0 * 16.0 / 1104.0];
      break;
    }
    case 31.0: {
      // stairs
      return [0.0 * 16.0 / 1408.0, 11.0 * 16.0 / 1104.0];
      break;
    }
    case 32.0: {
      // stairs
      return [1.0 * 16.0 / 1408.0, 11.0 * 16.0 / 1104.0];
      break;
    }
    case 33.0: {
      // stairs
      return [2.0 * 16.0 / 1408.0, 11.0 * 16.0 / 1104.0];
      break;
    }
    case 34.0: {
      // stairs
      return [3.0 * 16.0 / 1408.0, 11.0 * 16.0 / 1104.0];
      break;
    }
    case 35.0: {
      // stairs
      return [0.0 * 16.0 / 1408.0, 10.0 * 16.0 / 1104.0];
      break;
    }
    case 36.0: {
      // stairs
      return [1.0 * 16.0 / 1408.0, 10.0 * 16.0 / 1104.0];
      break;
    }
    case 37.0: {
      // stairs
      return [2.0 * 16.0 / 1408.0, 10.0 * 16.0 / 1104.0];
      break;
    }
    case 38.0: {
      // stairs
      return [3.0 * 16.0 / 1408.0, 10.0 * 16.0 / 1104.0];
      break;
    }
    case 39.0: {
      // stairs
      return [0.0 * 16.0 / 1408.0, 9.0 * 16.0 / 1104.0];
      break;
    }
    case 40.0: {
      // stairs
      return [1.0 * 16.0 / 1408.0, 9.0 * 16.0 / 1104.0];
      break;
    }
    case 41.0: {
      // stairs
      return [2.0 * 16.0 / 1408.0, 9.0 * 16.0 / 1104.0];
      break;
    }
    case 42.0: {
      // stairs
      return [3.0 * 16.0 / 1408.0, 9.0 * 16.0 / 1104.0];
      break;
    }
    //////////////// house
    case 43.0: {
      // stairs
      return [72.0 * 16.0 / 1408.0, 2.0 * 16.0 / 1104.0];
      break;
    }
    case 44.0: {
      // stairs
      return [73.0 * 16.0 / 1408.0, 2.0 * 16.0 / 1104.0];
      break;
    }
    case 45.0: {
      // stairs
      return [74.0 * 16.0 / 1408.0, 2.0 * 16.0 / 1104.0];
      break;
    }
    case 46.0: {
      // stairs
      return [75.0 * 16.0 / 1408.0, 2.0 * 16.0 / 1104.0];
      break;
    }
    case 47.0: {
      // stairs
      return [72.0 * 16.0 / 1408.0, 1.0 * 16.0 / 1104.0];
      break;
    }
    case 48.0: {
      // stairs
      return [73.0 * 16.0 / 1408.0, 1.0 * 16.0 / 1104.0];
      break;
    }

    case 49.0: {
      // stairs
      return [74.0 * 16.0 / 1408.0, 1.0 * 16.0 / 1104.0];
      break;
    }
    case 50.0: {
      // stairs
      return [75.0 * 16.0 / 1408.0, 1.0 * 16.0 / 1104.0];
      break;
    }
    case 51.0: {
      // stairs
      return [72.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
      break;
    }
    case 52.0: {
      // stairs
      return [73.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
      break;
    }
    case 53.0: {
      // stairs
      return [74.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
      break;
    }
    case 54.0: {
      // stairs
      return [75.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
      break;
    }
    case 55.0: {
      // stairs
      return [76.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
      break;
    }
    case 56.0: {
      // stairs
      return [77.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
      break;
    }
    case 57.0: {
      // stairs
      return [78.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
      break;
    }
    case 58.0: {
      // stairs
      return [79.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
      break;
    }

    // coast vertical water to land
    case 59.0: {
      // stairs
      return [6.0 * 16.0 / 1408.0, 44.0 * 16.0 / 1104.0];
      break;
    }

    // coast vertical land to water
    case 60.0: {
      // stairs
      return [7.0 * 16.0 / 1408.0, 44.0 * 16.0 / 1104.0];
      break;
    }
    case 61.0: {
      // shore to shallow, back, top left corner
      return [6.0 * 16.0 / 1408.0, 43.0 * 16.0 / 1104.0];
      break;
    }

    case 62.0: {
      // shore to shallow, back, top right corner
      return [7.0 * 16.0 / 1408.0, 43.0 * 16.0 / 1104.0];
      break;
    }
    case 63.0: {
      // shore to shallow, water above land, horizontal
      return [2.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
      break;
    }

    case 64.0: {
      // cliff to land, top left corner
      return [0.0 * 16.0 / 1408.0, 13.0 * 16.0 / 1104.0];
      break;
    }
    case 65.0: {
      // cliff to land, top horizontal
      return [1.0 * 16.0 / 1408.0, 13.0 * 16.0 / 1104.0];
      break;
    }
    case 66.0: {
      // cliff to land, bottom horizontal
      return [1.0 * 16.0 / 1408.0, 15.0 * 16.0 / 1104.0];
      break;
    }
    case 67.0: {
      // cliff to land, top right corner
      return [2.0 * 16.0 / 1408.0, 13.0 * 16.0 / 1104.0];
      break;
    }
    case 68.0: {
      // cliff to land, bottom left corner
      return [0.0 * 16.0 / 1408.0, 15.0 * 16.0 / 1104.0];
      break;
    }
    case 69.0: {
      // cliff to land, bottom right corner
      return [2.0 * 16.0 / 1408.0, 15.0 * 16.0 / 1104.0];
      break;
    }
    case 70.0: {
      // cliff to land, vertical left side
      return [0.0 * 16.0 / 1408.0, 14.0 * 16.0 / 1104.0];
      break;
    }
    case 71.0: {
      // cliff to land, vertical right side
      return [2.0 * 16.0 / 1408.0, 14.0 * 16.0 / 1104.0];
      break;
    }
    case 72.0: {
      // cliff to land, bottom horizontal
      return [1.0 * 16.0 / 1408.0, 14.0 * 16.0 / 1104.0];
      break;
    }
    case 73.0: {
      // cliff to sand, top left corner
      return [0.0 * 16.0 / 1408.0, 16.0 * 16.0 / 1104.0];
      break;
    }
    case 74.0: {
      // cliff to sand, top horizontal
      return [1.0 * 16.0 / 1408.0, 16.0 * 16.0 / 1104.0];
      break;
    }
    case 75.0: {
      // cliff to sand, bottom horizontal
      return [1.0 * 16.0 / 1408.0, 18.0 * 16.0 / 1104.0];
      break;
    }
    case 76.0: {
      // cliff to sand, top right corner
      return [2.0 * 16.0 / 1408.0, 16.0 * 16.0 / 1104.0];
      break;
    }
    case 77.0: {
      // cliff to sand, bottom left corner
      return [0.0 * 16.0 / 1408.0, 18.0 * 16.0 / 1104.0];
      break;
    }
    case 78.0: {
      // cliff to sand, bottom right corner
      return [2.0 * 16.0 / 1408.0, 18.0 * 16.0 / 1104.0];
      break;
    }
    case 79.0: {
      // cliff to sand, vertical left side
      return [0.0 * 16.0 / 1408.0, 17.0 * 16.0 / 1104.0];
      break;
    }
    case 80.0: {
      // cliff to sand, vertical right side
      return [2.0 * 16.0 / 1408.0, 17.0 * 16.0 / 1104.0];
      break;
    }
    case 81.0: {
      // sand
      return [1.0 * 16.0 / 1408.0, 36.0 * 16.0 / 1104.0];
      break;
    }
    case 82.0: {
      // sand to shallow, top left corner
      return [5.0 * 16.0 / 1408.0, 50.0 * 16.0 / 1104.0];
      break;
    }
    case 83.0: {
      // sand to shallow, vertical left
      return [5.0 * 16.0 / 1408.0, 51.0 * 16.0 / 1104.0];
      break;
    }
    case 84.0: {
      // sand to shallow, bottom left corner
      return [5.0 * 16.0 / 1408.0, 52.0 * 16.0 / 1104.0];
      break;
    }
    case 85.0: {
      // sand to shallow, horizontal up
      return [6.0 * 16.0 / 1408.0, 50.0 * 16.0 / 1104.0];
      break;
    }
    case 86.0: {
      // sand to shallow, horizontal bottom
      return [6.0 * 16.0 / 1408.0, 52.0 * 16.0 / 1104.0];
      break;
    }
    case 87.0: {
      // sand to shallow, top right corner
      return [7.0 * 16.0 / 1408.0, 50.0 * 16.0 / 1104.0];
      break;
    }
    case 88.0: {
      // sand to shallow, vertical right
      return [7.0 * 16.0 / 1408.0, 51.0 * 16.0 / 1104.0];
      break;
    }
    case 89.0: {
      // sand to shallow, bottom right corner
      return [7.0 * 16.0 / 1408.0, 52.0 * 16.0 / 1104.0];
      break;
    }
    case 90.0: {
      // shallow to deep, top left corner
      return [5.0 * 16.0 / 1408.0, 53.0 * 16.0 / 1104.0];
      break;
    }
    case 91.0: {
      // shallow to deep, vertical left
      return [5.0 * 16.0 / 1408.0, 54.0 * 16.0 / 1104.0];
      break;
    }
    case 92.0: {
      // shallow to deep, bottom left corner
      return [5.0 * 16.0 / 1408.0, 55.0 * 16.0 / 1104.0];
      break;
    }
    case 93.0: {
      // shallow to deep, horizontal up
      return [6.0 * 16.0 / 1408.0, 53.0 * 16.0 / 1104.0];
      break;
    }
    case 94.0: {
      // shallow to deep, horizontal bottom
      return [6.0 * 16.0 / 1408.0, 55.0 * 16.0 / 1104.0];
      break;
    }
    case 95.0: {
      // shallow to deep, top right corner
      return [7.0 * 16.0 / 1408.0, 53.0 * 16.0 / 1104.0];
      break;
    }
    case 96.0: {
      // shallow to deep, vertical right
      return [7.0 * 16.0 / 1408.0, 54.0 * 16.0 / 1104.0];
      break;
    }
    case 97.0: {
      // shallow to deep, bottom right corner
      return [7.0 * 16.0 / 1408.0, 55.0 * 16.0 / 1104.0];
      break;
    }
    case 98.0: {
      // shallow to deep, water  _| shallow
      return [3.0 * 16.0 / 1408.0, 51.0 * 16.0 / 1104.0];
      break;
    }

    case 99.0: {
      //                        __shallow
      // shallow to deep, water  | 
      return [3.0 * 16.0 / 1408.0, 52.0 * 16.0 / 1104.0];
      break;
    }

    case 100.0: {
      // shallow to deep, shallow  |_ deep
      return [4.0 * 16.0 / 1408.0, 51.0 * 16.0 / 1104.0];
      break;
    }

    case 101.0: {
      //                 shallow __
      // shallow to deep,        | water
      return [4.0 * 16.0 / 1408.0, 52.0 * 16.0 / 1104.0];
      break;
    }

    case 102.0: {
      // flower
      return [70.0 * 16.0 / 1408.0, 0.0 * 16.0 / 1104.0];
    }

    // pokemon gym
    case 103.0: {
      return [0.0 * 16.0 / 1408.0, 57.0 * 16.0 / 1104.0];
    }
    case 104.0: {
      return [1.0 * 16.0 / 1408.0, 57.0 * 16.0 / 1104.0];
    }
    case 105.0: {
      return [2.0 * 16.0 / 1408.0, 57.0 * 16.0 / 1104.0];
    }
    case 106.0: {
      return [5.0 * 16.0 / 1408.0, 57.0 * 16.0 / 1104.0];
    }
    case 107.0: {
      return [3.0 * 16.0 / 1408.0, 57.0 * 16.0 / 1104.0];
    }
    case 108.0: {
      return [4.0 * 16.0 / 1408.0, 57.0 * 16.0 / 1104.0];
    }
    case 109.0: {
      return [0.0 * 16.0 / 1408.0, 56.0 * 16.0 / 1104.0];
    }
    case 110.0: {
      return [1.0 * 16.0 / 1408.0, 56.0 * 16.0 / 1104.0];
    }
    case 111.0: {
      return [2.0 * 16.0 / 1408.0, 56.0 * 16.0 / 1104.0];
    }
    case 112.0: {
      return [5.0 * 16.0 / 1408.0, 56.0 * 16.0 / 1104.0];
    }
    case 113.0: {
      return [3.0 * 16.0 / 1408.0, 56.0 * 16.0 / 1104.0];
    }
    case 114.0: {
      return [4.0 * 16.0 / 1408.0, 56.0 * 16.0 / 1104.0];
    }
    case 115.0: {
      return [0.0 * 16.0 / 1408.0, 55.0 * 16.0 / 1104.0];
    }
    case 116.0: {
      return [1.0 * 16.0 / 1408.0, 55.0 * 16.0 / 1104.0];
    }
    case 117.0: {
      return [2.0 * 16.0 / 1408.0, 55.0 * 16.0 / 1104.0];
    }
    case 118.0: {
      return [3.0 * 16.0 / 1408.0, 54.0 * 16.0 / 1104.0];
    }
    case 119.0: {
      return [3.0 * 16.0 / 1408.0, 55.0 * 16.0 / 1104.0];
    }
    case 120.0: {
      return [4.0 * 16.0 / 1408.0, 55.0 * 16.0 / 1104.0];
    }
    case 121.0: {
      return [2.0 * 16.0 / 1408.0, 54.0 * 16.0 / 1104.0];
    }
    case 122.0: {
      return [3.0 * 16.0 / 1408.0, 54.0 * 16.0 / 1104.0];
    }
    case 123.0: {
      return [3.0 * 16.0 / 1408.0, 54.0 * 16.0 / 1104.0];
    }
    case 124.0: {
      return [3.0 * 16.0 / 1408.0, 54.0 * 16.0 / 1104.0];
    }
    case 125.0: {
      return [3.0 * 16.0 / 1408.0, 54.0 * 16.0 / 1104.0];
    }
    case 126.0: {
      return [4.0 * 16.0 / 1408.0, 54.0 * 16.0 / 1104.0];
    }
    case 127.0: {
      return [2.0 * 16.0 / 1408.0, 53.0 * 16.0 / 1104.0];
    }

    case 128.0: {
      return [3.0 * 16.0 / 1408.0, 53.0 * 16.0 / 1104.0];
    }
    case 129.0: {
      return [3.0 * 16.0 / 1408.0, 53.0 * 16.0 / 1104.0];
    }
    case 130.0: {
      return [3.0 * 16.0 / 1408.0, 53.0 * 16.0 / 1104.0];
    }
    case 131.0: {
      return [3.0 * 16.0 / 1408.0, 53.0 * 16.0 / 1104.0];
    }
    case 132.0: {
      return [4.0 * 16.0 / 1408.0, 53.0 * 16.0 / 1104.0];
    }
    case 133.0: {
      // flower 
      return [5.0 * 16.0 / 1408.0, 1.0 * 16.0 / 1104.0];
    }
    case 134.0: {
      // rock in shallow
      return [4.0 * 16.0 / 1408.0, 50.0 * 16.0 / 1104.0];
    }

    case 135.0: {
      // rock in deep, top left
      return [0.0 * 16.0 / 1408.0, 42.0 * 16.0 / 1104.0];
    }
    case 136.0: {
      // rock in deep, bottom left
      return [0.0 * 16.0 / 1408.0, 43.0 * 16.0 / 1104.0];
    }
    case 137.0: {
      // rock in deep, top right
      return [1.0 * 16.0 / 1408.0, 42.0 * 16.0 / 1104.0];
    }
    case 138.0: {
      // rock in deep, bottom right
      return [1.0 * 16.0 / 1408.0, 43.0 * 16.0 / 1104.0];
    }

    case 139.0: {
      // tree, top left
      return [74.0 * 16.0 / 1408.0, 17.0 * 16.0 / 1104.0];
    }
    case 140.0: {
      // tree, bottom left
      return [74.0 * 16.0 / 1408.0, 18.0 * 16.0 / 1104.0];
    }

    case 141.0: {
      // tree, top right
      return [75.0 * 16.0 / 1408.0, 17.0 * 16.0 / 1104.0];
    }
    case 142.0: {
      // tree, bottom right
      return [75.0 * 16.0 / 1408.0, 18.0 * 16.0 / 1104.0];
    }
    
    

    





    default: {
        
        return [0.0, 0.0]

      
    }
  }
}



function loadScene() {
  square = new Mesh(obj2, vec3.fromValues(0.0, 0.0, 0.0));;
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  cylinder = new Mesh(obj0, vec3.fromValues(0.0, 0.0, 0.0));
  cylinder.create();

  wahoo = new Mesh(obj1, vec3.fromValues(0.0, -10.0, 0.0));
  wahoo.create();

  noiseTex1 = new Texture('../resources/pokemonEmeraldTileset.png', 0) /// this is the texture that instanced is using
  noiseTex2 = new Texture('../resources/fbmRep2.png', 0)
  flameSource = new Texture('../resources/minecraft_textures_all.png', 1)


  /*
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
 
  
  */


  // testing wfc
  console.log("Starting model test");
  let grid: number[][] = Model.test();

  let array: mat4[] = []

  let rowMove: number = 2.0 / grid.length;
  let rowStart: number = 1.0 - rowMove / 2.0;
  let rowScale: number = 1.0 / grid.length;
  let colMove: number = 2.0 / grid[0].length;
  let colStart: number = -1.0 + colMove / 2.0;
  let colScale: number = 1.0 / grid[0].length;

  let currentRow: number = rowStart;

  for (let row = 0; row < grid.length; row++) {
    let currentCol: number = colStart;
    for (let col = 0; col < grid[0].length; col++) {
      //console.log('fuck');
      let info: mat4 = mat4.create();
      let offset: [number, number] = tileOffsets(grid[row][col]);
      info = mat4.fromValues(currentCol, grid[row][col], 1, 1, currentRow, offset[0], 1, 1, colScale, offset[1], 1, 1, rowScale, 1, 1, 1);

      array.push(info)
      currentCol += colMove;
    }
    currentRow -= rowMove
  }

  //console.log("testings valid grid initialization");
  //ValidGrid.test();
  console.log("concluding model test");

  let matrix: mat4 = mat4.create();
  mat4.scale(matrix, matrix, vec3.fromValues(0.5, 0.5, 1.0));
  //matrix = mat4.fromValues(-0.5, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 1, 1)
  matrix = mat4.fromValues(0.5, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 1, 1)
  
  //array = [matrix]

  let transformArray0 = [];
  let transformArray1 = [];
  let transformArray2 = [];
  let transformArray3 = [];

  for (let mat of array) {
    //console.log(mat);
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
      //console.log(colVec);
      
    }
  }

  let transforms0: Float32Array = new Float32Array(transformArray0);
  let transforms1: Float32Array = new Float32Array(transformArray1);
  let transforms2: Float32Array = new Float32Array(transformArray2);
  let transforms3: Float32Array =  new Float32Array(transformArray3);

  square.setInstanceVBOs(transforms0, transforms1, transforms2, transforms3);
  square.setNumInstances(array.length);
 
  /*
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

*/
}

function main() {
  
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
    //console.log(val);
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

  instancedShader.bindTexToUnit(flat.unifSampler1, noiseTex1, 0);
  instancedShader.bindTexToUnit(flat.unifSampler2, noiseTex2, 1);
  instancedShader.bindTexToUnit(flat.unifSampler3, flameSource, 2);


  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    //renderer.render(camera, instancedShader, [cylinder]);
    //renderer.render(camera, instancedShader, [wahoo]);
    renderer.render(camera, instancedShader, [
      square,
    ]);
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
