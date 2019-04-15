import ExpansionRule from './ExpansionRule';
import DrawRule from './DrawRule';
import {vec3, mat4, mat3} from 'gl-matrix';
import Turtle from './Turtle';

class LSystem {
    axiom: string;
    expansion: string;
    angleMod: number;
    expansionRules : Map<string, ExpansionRule> = new Map();
    drawRules: Map<string, DrawRule> = new Map();

    constructor (axiom: string, angle: number) {
        this.axiom = axiom;
        this.angleMod = angle;
        /*
        this.expansionRules.set('A', new ExpansionRule("A"));
        this.expansionRules.set('B', new ExpansionRule("B"));
        this.expansionRules.set('C', new ExpansionRule("C"));
        this.expansionRules.set('E', new ExpansionRule("E"));
        this.expansionRules.set('D', new ExpansionRule("D"));
        this.expansionRules.set('S', new ExpansionRule("S"));
        this.expansionRules.set('[', new ExpansionRule("["));
        this.expansionRules.set(']', new ExpansionRule("]"));
        this.expansionRules.set('F', new ExpansionRule("[FA[ECSF][DECSF][DDECSF][DDDECSF]]"));
        */
       this.expansionRules.set('A', new ExpansionRule("A"));
       this.expansionRules.get('A').addExpansion('AFA');

       this.expansionRules.set('B', new ExpansionRule("B"));
       this.expansionRules.get('B').addExpansion('D');
       this.expansionRules.get('B').addExpansion('G');
       this.expansionRules.get('B').addExpansion('C');

       this.expansionRules.set('C', new ExpansionRule("C"));
       this.expansionRules.get('C').addExpansion('E');
       this.expansionRules.get('C').addExpansion('H');
       this.expansionRules.get('C').addExpansion('B');
       
       this.expansionRules.set('D', new ExpansionRule("D"));
       this.expansionRules.get('D').addExpansion('B');
       this.expansionRules.get('D').addExpansion('G');
       this.expansionRules.get('D').addExpansion('E');

       this.expansionRules.set('E', new ExpansionRule("E"));
       this.expansionRules.get('E').addExpansion('H');
       this.expansionRules.get('E').addExpansion('C');
       this.expansionRules.get('E').addExpansion('D');
    
       this.expansionRules.set('G', new ExpansionRule("G"));
       this.expansionRules.get('G').addExpansion('B');
       this.expansionRules.get('G').addExpansion('D');
       this.expansionRules.get('G').addExpansion('H');

       this.expansionRules.set('H', new ExpansionRule("H"));
       this.expansionRules.get('H').addExpansion('E');
       this.expansionRules.get('H').addExpansion('G');
       this.expansionRules.get('H').addExpansion('C');


       this.expansionRules.set('S', new ExpansionRule("SS"));
       this.expansionRules.set('[', new ExpansionRule("["));
       this.expansionRules.set(']', new ExpansionRule("]"));
       this.expansionRules.set('F', new ExpansionRule("FAFAB[BFACFA]C[CFABFA]"));
       this.expansionRules.get('F').addExpansion("FAFAG[DFAHFA]B[BFAEFA]");
       this.expansionRules.set('X', new ExpansionRule("FFB[BFACF]C[CFABFA]"));
       this.expansionRules.get('X').addExpansion("FFG[DFAHF]C[DFAEFA]");
       this.expansionRules.get('X').addExpansion("FFE[DFADF]B[CFAHFA]");
        
        let identity: mat4 = mat4.create();
        let translate: mat4 =  mat4.create();
        let translateDown: mat4 =  mat4.create();
        let translateSlightly: mat4 = mat4.create();
        let rotateXPos: mat4 =  mat4.create();
        let rotateXNeg: mat4 =  mat4.create();
        let rotateYPos: mat4 = mat4.create();
        let rotateYNeg: mat4 = mat4.create();
        let rotateZPos: mat4 = mat4.create();
        let rotateZNeg: mat4 = mat4.create();

        let scaleXZ: mat4 = mat4.create();
        let scaleLarge: mat4 = mat4.create()
        
        mat4.identity(identity);
        mat4.identity(translate);
        mat4.identity(translateDown);
        mat4.identity(rotateXPos);
        mat4.identity(rotateXNeg);
        mat4.identity(rotateYPos);
        mat4.identity(rotateYNeg);
        mat4.identity(rotateZPos);
        mat4.identity(rotateZNeg);
        mat4.identity(scaleXZ);
        mat4.identity(scaleLarge);
        
        mat4.identity(translateSlightly)
        mat4.translate(translate, translate, vec3.fromValues(0.0, 1.0, 0.0));
        mat4.translate(translateDown, translateDown, vec3.fromValues(0.0, -10.0, 0.0));
        mat4.translate(translateSlightly, translateSlightly, vec3.fromValues(0.2, 0.0, 0.2));
        mat4.rotateX(rotateXPos, rotateXPos, this.angleMod * 0.75708);
        mat4.rotateX(rotateXNeg, rotateXNeg, this.angleMod * -0.75708);
        mat4.rotateY(rotateYPos, rotateYPos, this.angleMod * 0.75708);
        mat4.rotateY(rotateYNeg, rotateYNeg, this.angleMod * -0.75708);
        mat4.rotateZ(rotateZPos, rotateZPos, this.angleMod * 0.75708);
        mat4.rotateZ(rotateZNeg, rotateZNeg, this.angleMod * -0.75708);
        mat4.scale(scaleXZ, scaleXZ, vec3.fromValues(0.75, 0.75, 0.75));
        mat4.scale(scaleLarge, scaleLarge, vec3.fromValues(3.1, 3.1, 3.1));

        //this.drawRules.set('A', new DrawRule(mat4.fromValues(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)));
        //this.drawRules.set('B', new DrawRule(mat4.fromValues(2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0)));
        //this.drawRules.set('C', new DrawRule(mat4.fromValues(3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0)));
        this.drawRules.set('A', new DrawRule(translate));

        this.drawRules.set('B', new DrawRule(rotateXNeg));
        mat4.identity(rotateXNeg)
        mat4.rotateX(rotateXNeg, rotateXNeg, this.angleMod * -0.5708);
        this.drawRules.get('B').addExpansion(rotateXNeg);

        this.drawRules.set('C', new DrawRule(rotateXPos));
        mat4.identity(rotateXPos)
        mat4.rotateX(rotateXPos, rotateXPos, this.angleMod * 0.5708);
        this.drawRules.get('C').addExpansion(rotateXPos);

        this.drawRules.set('D', new DrawRule(rotateYNeg));
        mat4.identity(rotateYNeg)
        mat4.rotateY(rotateYNeg, rotateYNeg, this.angleMod * -0.5708);
        this.drawRules.get('D').addExpansion(rotateYNeg);

        this.drawRules.set('E', new DrawRule(rotateYPos));
        mat4.identity(rotateYPos)
        mat4.rotateY(rotateYPos, rotateYPos, this.angleMod * 0.5708);
        this.drawRules.get('E').addExpansion(rotateYPos);
        
        this.drawRules.set('G', new DrawRule(rotateZNeg));
        mat4.identity(rotateZNeg)
        mat4.rotateZ(rotateZNeg, rotateZNeg, this.angleMod * -0.5708);
        this.drawRules.get('G').addExpansion(rotateZNeg);

        this.drawRules.set('H', new DrawRule(rotateZPos));
        mat4.identity(rotateZPos)
        mat4.rotateZ(rotateZPos, rotateZPos, this.angleMod * 0.5708);
        this.drawRules.get('H').addExpansion(rotateZPos);
        

        this.drawRules.set('S', new DrawRule(scaleLarge));
        this.drawRules.set('X', new DrawRule(scaleXZ));

        this.drawRules.set('T', new DrawRule(translateDown));
        

    }

    expand(n: number): string {
        let a = this.axiom
        
        for (var i = 0; i < n; i++) {
            let newString: string = "";
            for (let character of a) {
                newString = newString + this.expansionRules.get(character).getExpansion();
            }
    
            a = newString
        }
        

        return a
    }

    drawMatrices (axiom: string): mat4[] {
        let output: mat4[] = new Array<mat4>();
        let stack: Turtle[] = new Array<Turtle>();
        let identity: mat4 = mat4.create();
        mat4.identity(identity);
        let currentTurtle: Turtle = new Turtle(identity)

        
        for (let character of axiom) {
            if (character == 'F') {
                output = output.concat(mat4.clone(currentTurtle.transformation));
            } else
            if (character == '[') {
                stack.push(new Turtle(mat4.clone(currentTurtle.transformation)));
            } else 
            if (character == ']') {
                mat4.copy(currentTurtle.transformation, stack.pop().transformation);
            } else {
                mat4.multiply(currentTurtle.transformation, currentTurtle.transformation,  this.drawRules.get(character).getExpansion())
            }


            //output = output.concat(this.drawRules.get(character).getExpansion());
        
        } 
        return output
    }



}

export default LSystem;