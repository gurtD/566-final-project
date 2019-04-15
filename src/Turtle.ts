import {vec3, mat4} from 'gl-matrix';

class Turtle {
    transformation: mat4 = mat4.create()
    recursionDepth: number = 0;

    constructor(transformation: mat4) {
        this.transformation = transformation;
        
    }
};

export default Turtle

// transform rotation scale