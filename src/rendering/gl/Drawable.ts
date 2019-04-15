import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufNor: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufTransformation0: WebGLBuffer;
  bufTransformation1: WebGLBuffer;
  bufTransformation2: WebGLBuffer;
  bufTransformation3: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufUV: WebGLBuffer;

  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  norGenerated: boolean = false;
  colGenerated: boolean = false;
  translateGenerated: boolean = false;
  transformationGenerated0: boolean = false;
  transformationGenerated1: boolean = false;
  transformationGenerated2: boolean = false;
  transformationGenerated3: boolean = false;
  uvGenerated: boolean = false;

  numInstances: number = 0; // How many instances of this Drawable the shader program should draw

  abstract create() : void;

  destory() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufNor);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufTranslate);
    gl.deleteBuffer(this.bufTransformation0);
    gl.deleteBuffer(this.bufTransformation1);
    gl.deleteBuffer(this.bufTransformation2);
    gl.deleteBuffer(this.bufTransformation3);
    gl.deleteBuffer(this.bufUV);
  }

  generateIdx() {
    this.idxGenerated = true;
    this.bufIdx = gl.createBuffer();
  }

  generatePos() {
    this.posGenerated = true;
    this.bufPos = gl.createBuffer();
  }

  generateNor() {
    this.norGenerated = true;
    this.bufNor = gl.createBuffer();
  }

  generateCol() {
    this.colGenerated = true;
    this.bufCol = gl.createBuffer();
  }

  generateTranslate() {
    this.translateGenerated = true;
    this.bufTranslate = gl.createBuffer();
  }

  generateTransformation0() {
    this.transformationGenerated0 = true;
    this.bufTransformation0 = gl.createBuffer();
  }

  generateTransformation1() {
    this.transformationGenerated1 = true;
    this.bufTransformation1 = gl.createBuffer();
  } 

  generateTransformation2() {
    this.transformationGenerated2 = true;
    this.bufTransformation2 = gl.createBuffer();
  }

  generateTransformation3() {
    this.transformationGenerated3 = true;
    this.bufTransformation3 = gl.createBuffer();
  }
  generateUV() {
    this.uvGenerated = true;
    this.bufUV = gl.createBuffer();
  }

  bindIdx(): boolean {
    if (this.idxGenerated) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    }
    return this.idxGenerated;
  }

  bindPos(): boolean {
    if (this.posGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    }
    return this.posGenerated;
  }

  bindNor(): boolean {
    if (this.norGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    }
    return this.norGenerated;
  }

  bindCol(): boolean {
    if (this.colGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }
    return this.colGenerated;
  }

  bindTranslate(): boolean {
    if (this.translateGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    }
    return this.translateGenerated;
  }

  bindTransformation0(): boolean {
    if (this.transformationGenerated0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformation0);
    }
    return this.transformationGenerated0;
  }

  bindTransformation1(): boolean {
    if (this.transformationGenerated1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformation1);
    }
    return this.transformationGenerated1;
  }

  bindTransformation2(): boolean {
    if (this.transformationGenerated2) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformation2);
    }
    return this.transformationGenerated2;
  }

  bindTransformation3(): boolean {
    if (this.transformationGenerated3) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransformation3);
    }
    return this.transformationGenerated3;
  }

  bindUV(): boolean {
    if (this.uvGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    }
    return this.uvGenerated;
  }

  elemCount(): number {
    return this.count;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }

  setNumInstances(num: number) {
    this.numInstances = num;
  }
};

export default Drawable;
