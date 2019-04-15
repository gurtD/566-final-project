
const UP: [number, number] = [0, 1];
const LEFT: [number, number] = [-1, 0]
const DOWN: [number, number] = [0, -1]
const RIGHT: [number, number] = [1, 0]

enum Dirs {
    UP,
    LEFT,
    DOWN,
    RIGHT
}

class CompatibilityOracle {
    data: Set<[number, number, Dirs]>;

    constructor (data: Set<[number, number, Dirs]>) {
        this.data = new Set<[number, number, Dirs]>();
        this.data = data;
    }

    check (tile1: number, tile2: number, direction: Dirs): boolean {
        let test: [number, number, Dirs] = [tile1, tile2, direction];
        return this.data.has(test);
    }

}

class Wavefunction {

    coefficients: Set<number>[][];
    weights: Map<number, number>;

    public static mk(size: [number, number], weights: Map<number, number>): Wavefunction {
        let tiles: Set<number> = new Set<number>();
        for(var item of new Set(Object.keys(weights))) {
            tiles.add(Number(item));
        }
        
        let coefficients: Set<number>[][] = Wavefunction.init_coefficients(size, tiles);
        return new Wavefunction(coefficients, weights);
    }

    public static init_coefficients(size: [number, number], tiles: Set<number>): Set<number>[][] {
        let coefficients: Set<number>[][] = [];

        for (let x = 0; x < size[0]; x++) {
            let row: Set<number>[] = [];
            for (let y = 0; y < size[1]; y++) {
                row.push(new Set<number>(tiles));
            }
            coefficients.push(row);
        }

        return coefficients;
    } 

    constructor(coefficients: Set<number>[][], weights: Map<number, number>) {
        this.coefficients = coefficients;
        this.weights = weights;
    }

    get(co_ords: [number, number]): Set<number> {
        return this.coefficients[co_ords[0]][co_ords[1]];
    }

    get_collapsed(co_ords: [number, number]): number {
        let opts: Set<number> = this.get(co_ords);
        if (opts.size != 1) {
            throw new Error("get_collapsed co_ord does not have a single tile");
        } 
        else {
            for (let tile of opts) {
                return tile;
            }
        }
    }

    get_all_collapsed(): number[][] {
        let width: number = this.coefficients.length;
        let height: number = this.coefficients[0].length;

        let collapsed: number[][] = []

        for (let x = 0; x < width; x++) {
            let row: number[] = [];
            for (let y = 0; y < height; y++) {
                row.push(this.get_collapsed([x, y]));
            }
            collapsed.push(row);
        }
        return collapsed;
    }

    shannon_entropy(co_ord): number {
        let x: number = co_ord[0];
        let y: number = co_ord[1];

        let sum_of_weights: number = 0;
        let sum_of_weight_log_weights: number = 0;

        for (let opt of this.coefficients[x][y]) {
            let weight: number = this.weights.get(opt);
            sum_of_weights += weight;
            sum_of_weight_log_weights += weight * Math.log(weight);
        }

        return Math.log(sum_of_weights) - (sum_of_weight_log_weights / sum_of_weights);

    }

    is_fully_collapsed(): boolean {
        let width: number = this.coefficients.length;
        let height: number = this.coefficients[0].length;

        for (let x = 0; x < width; x++) {
            
            for (let y = 0; y < height; y++) {
                if (this.coefficients[x][y].size > 1) {
                    return false;
                }
            }
            
        }
        return true;
    } 

    collapse(co_ords: [number, number]) {
        let x: number = co_ords[0];
        let y: number = co_ords[1];
        let opts: Set<number> = this.coefficients[x][y];

        let valid_weights: Map<number, number> = new Map<number, number>();

        for(let tile of opts.values()) {
            valid_weights.set(tile, this.weights.get(tile));
        }

        let total_weights: number = 0

        for (let weight of valid_weights.values()) {
            total_weights += weight;
        }

        let rnd: number = Math.random() * total_weights;
        let chosen: number = null;

        for (let tile of valid_weights.keys()) {
            rnd -= valid_weights.get(tile);
            if (rnd < 0) {
                chosen = tile;
                break;
            }
        }

        this.coefficients[x][y] = new Set().add(chosen);

    }

    constrain(co_ords: [number, number], forbidden_tile: number) {
        let x: number = co_ords[0];
        let y: number = co_ords[1];

        this.coefficients[x][y].delete(forbidden_tile);
    }

}

class Model {
    output_size: [number, number];
    compatibility_oracle: CompatibilityOracle;
    wavefunction: Wavefunction;

    constructor(output_size: [number, number], weights: Map<number, number>, compatibility_oracle: CompatibilityOracle) {
        this.output_size = output_size;
        this.compatibility_oracle = compatibility_oracle;
        this.wavefunction = Wavefunction.mk(output_size, weights);
    }

    run(): number[][] {
        while (!this.wavefunction.is_fully_collapsed()) {
            this.iterate();
        }
        return this.wavefunction.get_all_collapsed();
    }

    iterate() {
        let co_ords: [number, number] = this.min_entropy_co_ords();

        this.wavefunction.collapse(co_ords);
        this.propagate(co_ords);
    }

    propagate(co_ords: [number, number]) {
        let stack: Array<[number, number]> = [co_ords];
        while (stack.length > 0) {
            let cur_coords: [number, number] = stack.pop();
            let cur_possible_tiles: Set<number> = this.wavefunction.get(cur_coords);

            for (let d of Model.valid_dirs(cur_coords, this.output_size)) {
                let other_coords: [number, number] = [cur_coords[0] + d[0], cur_coords[1] + d[1]];

                for(let other_tile of new Set(this.wavefunction.get(other_coords))) {
                    let other_tile_is_possible: boolean = false;
                    for (let cur_tile of cur_possible_tiles) {
                        if (this.compatibility_oracle.check(cur_tile, other_tile, d)) {
                            other_tile_is_possible = true;
                            break
                        }
                    }
                    if (!other_tile_is_possible) {
                        this.wavefunction.constrain(other_coords, other_tile);
                        stack.push(other_coords);
                    }
                }
            }
        } 
    }


    min_entropy_co_ords(): [number, number] {
        let min_entropy: number = null;
        let min_entropy_coords: [number, number] = null;

        let width: number = this.output_size[0];
        let height: number = this.output_size[1];

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (this.wavefunction.get([x, y]).size == 1) {
                    continue;
                }
                let entropy: number = this.wavefunction.shannon_entropy([x, y]);

                let entropy_plus_noise = entropy - (Math.random() / 1000);

                if (min_entropy == null || entropy_plus_noise < min_entropy) {
                    min_entropy = entropy_plus_noise;
                    min_entropy_coords = [x, y];
                }
            }
        }
        return min_entropy_coords;
    }

    public static valid_dirs(cur_co_ord: [number, number], matrix_size: [number, number]): Array<Dirs> {
        let x: number = cur_co_ord[0];
        let y: number = cur_co_ord[1];
        
        let width: number = matrix_size[0];
        let height: number = matrix_size[1];

        let dirs: Array<Dirs> = []

        if (x > 0) {
            dirs.push(Dirs.LEFT);
        }
        if (x < width - 1) {
            dirs.push(Dirs.RIGHT);
        }
        if (y > 0) {
            dirs.push(Dirs.DOWN);
        }
        if (y < height - 1) {
            dirs.push(Dirs.UP);
        }

        return dirs
    }

    public static render(matrix: number[][]) {
        for (let row of matrix) {
            console.log(row)
        }
    } 

    public static parse_example_matrix(matrix: number[][]): [Set<[number, number, Dirs]>, Map<number, number>] {
        let compatibilities: Set<[number, number, Dirs]> = new Set<[number, number, Dirs]>();
        let matrix_width: number = matrix.length;
        let matrix_height: number = matrix[0].length;

        let weights: Map<number, number> = new Map<number, number>();

        for (let x = 0; x < matrix_width; x++) {
            for (let y = 0; y < matrix_height; y++) {
                if (!weights.has(matrix[x][y])) {
                    weights.set(matrix[x][y], 0);
                }
                weights.set(matrix[x][y], weights.get(matrix[x][y]) + 1);

                for (let d of this.valid_dirs([x, y], [matrix_width, matrix_height])) {
                    let other_tile: number = matrix[x + d[0]][y + d[1]];
                    compatibilities.add([matrix[x][y], other_tile, d]);
                }

            }
        }
        return [compatibilities, weights];
    }

    public static test() {
        // 1 is land
        // 2 is coast 
        // 3 is sea
        let input_matrix: number[][] = [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 2, 2, 1],
            [2, 3, 3, 2],
            [3, 3, 3, 3],
            [3, 3, 3, 3],
        ]


        let comp_and_weights: [Set<[number, number, Dirs]>, Map<number, number>] = this.parse_example_matrix(input_matrix);
        let compatibilities: Set<[number, number, Dirs]> = comp_and_weights[0];
        let weights: Map<number, number> = comp_and_weights[1];
        let compatibility_oracle: CompatibilityOracle = new CompatibilityOracle(compatibilities);
        let model: Model = new Model([10, 50], weights, compatibility_oracle);
        let output: number[][] = model.run();
        this.render(output);
    }
}

export {CompatibilityOracle, Wavefunction, Model}

