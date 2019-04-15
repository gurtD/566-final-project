import {vec3, vec4, mat4} from 'gl-matrix';
class DrawRule {
    rules: mat4[] = [];

    constructor (rule: mat4) {
        this.rules = this.rules.concat(rule);
    }

    addExpansion (rule: mat4) {
        this.rules = this.rules.concat(rule);
    }

    getExpansion (): mat4 {
        return this.rules[0];
    }
}

export default DrawRule;