
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

let direction: Map<Dirs, [number, number]> = new Map<Dirs, [number, number]>();
direction.set(Dirs.UP, [0, 1]);
direction.set(Dirs.LEFT, [-1, 0]);
direction.set(Dirs.DOWN, [0, -1]);
direction.set(Dirs.RIGHT,  [1, 0]);

class CompatibilityOracle {
    data: Set<string>;

    constructor (data: Set<[number, number, Dirs]>) {
        this.data = new Set<string>();
        for (let entry of data) {
            this.data.add(String(entry[0]) + "," + String(entry[1]) + "," + String(entry[2]));
        }
        
        
    }

    check (tile1: number, tile2: number, direction: Dirs): boolean {
        //let test: [number, number, Dirs] = [tile1, tile2, direction];
        return this.data.has(String(tile1) + "," + String(tile2) + "," + String(direction));
    }

}

class Wavefunction {

    coefficients: Set<number>[][];
    weights: Map<number, number>;
    establishedPathCoords: Set<[number, number]>;


    public static mk(size: [number, number], weights: Map<number, number>, buildingCount: number, buildingTiles: Set<number>, roadTiles: Set<number>): Wavefunction {
        let tiles: Set<number> = new Set<number>();
        
        for(var item of Array.from(weights.keys())) {
            
            if (!buildingTiles.has(item) && !roadTiles.has(item)) {
                tiles.add(item);
            }
                 
            
        }

        

        
        
        
        let coefficientsAndPaths: [Set<number>[][], Set<[number, number]>] = Wavefunction.init_coefficients(size, tiles, buildingCount, buildingTiles, roadTiles);
        return new Wavefunction(coefficientsAndPaths[0], coefficientsAndPaths[1], weights);
    }

    public static init_coefficients(size: [number, number], tiles: Set<number>, buildingCount: number, buildingTiles: Set<number>, roadTiles: Set<number>): [Set<number>[][], Set<[number, number]>] {
        let coefficients: Set<number>[][] = [];
        let validGrid: ValidGrid = new ValidGrid(size, buildingCount);
        validGrid.create_paths();
        ValidGrid.render(validGrid.grid); 

        console.log("///////////////////////////////////////////////////")
        let pathBuildingCoords = new Set<[number, number]>()
        

        for (let x = 0; x < size[0]; x++) {
            let row: Set<number>[] = [];
            for (let y = 0; y < size[1]; y++) {
                if (validGrid.grid[x][y] == 2) {
                    row.push(new Set(buildingTiles))
                    pathBuildingCoords.add([x, y]);
                } 
                else if (validGrid.grid[x][y] == 1) {
                    row.push(new Set(roadTiles))
                    pathBuildingCoords.add([x, y]);
                } 
                else {
                    row.push(new Set(tiles));
                }
                
            }
            coefficients.push(row);
        }
        
        return [coefficients, pathBuildingCoords];
    } 

    constructor(coefficients: Set<number>[][], establishedPathCoords: Set<[number, number]>, weights: Map<number, number>) {
        this.coefficients = coefficients;
        this.weights = weights;
        this.establishedPathCoords = establishedPathCoords
    }

    get(co_ords: [number, number]): Set<number> {
        return this.coefficients[co_ords[0]][co_ords[1]];
    }

    get_collapsed(co_ords: [number, number]): number {
        let opts: Set<number> = this.get(co_ords);
        if (opts.size != 1) {
            console.log("size of tile is %d", opts.size);
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

    shannon_entropy(co_ord: [number, number]): number {
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
        if (opts.size == 1) {
            return;
        }

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

    constructor(output_size: [number, number], weights: Map<number, number>, compatibility_oracle: CompatibilityOracle, buildingTiles: Set<number>, roadTiles: Set<number> ) {
        this.output_size = output_size;
        this.compatibility_oracle = compatibility_oracle;
        this.wavefunction = Wavefunction.mk(output_size, weights, 4, buildingTiles, roadTiles);
        
    }

    run(): number[][] {
        for (let coords of this.wavefunction.establishedPathCoords) {
            this.propagate(coords)
        }


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
                let other_coords: [number, number] = [cur_coords[0] + direction.get(d)[0], cur_coords[1] + direction.get(d)[1]];

                for(let other_tile of this.wavefunction.get(other_coords)) {
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
            let output: string = "";
            for (let char of row) {
                output = output + char;
            }
            console.log(output)
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
                    weights.set(matrix[x][y], 1); // set the 1 to 0 if you want weight influce
                }
                //weights.set(matrix[x][y], weights.get(matrix[x][y]) + 1);  //uncomment this if you want weight influence

                for (let d of this.valid_dirs([x, y], [matrix_width, matrix_height])) {
                    let other_tile: number = matrix[x + direction.get(d)[0]][y + direction.get(d)[1]];
                    if (!compatibilities.has([matrix[x][y], other_tile, d])) {
                        compatibilities.add([matrix[x][y], other_tile, d]);
                    }
                    
                }

            }
        }
        return [compatibilities, weights];
    }

    public static test(): number[][] {
        // 1 is land
        // 2 is coast 
        // 3 is sea
        let input_matrix_1: number[][] = [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 2],
            [1, 2, 2, 3],
            [2, 3, 3, 3],
            [3, 3, 3, 3],
            [3, 3, 3, 3],
        ]

        let input_matrix_2: number[][] = [
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 0, 0, 0, 0, 0, 0, 3, 3],
            [3, 3, 0, 1, 1, 1, 1, 0, 3, 3],
            [3, 3, 0, 1, 1, 1, 1, 0, 3, 3],
            [3, 3, 0, 1, 1, 1, 1, 0, 3, 3],
            [3, 3, 0, 1, 1, 1, 1, 0, 3, 3],
            [3, 3, 0, 0, 0, 0, 0, 0, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        ]
        
        let input_matrix_3: number[][] = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 0, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [6, 3, 3, 7, 0, 6, 3, 3, 10, 10, 3],
            [5, 9, 9, 8, 3, 5, 9, 9, 9, 9, 9],
            [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
            [4, 4, 9, 9, 4, 9, 9, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
        ]

        let comp_and_weights: [Set<[number, number, Dirs]>, Map<number, number>] = this.parse_example_matrix(input_matrix_3);
        let compatibilities: Set<[number, number, Dirs]> = comp_and_weights[0];
        
        let weights: Map<number, number> = comp_and_weights[1];
        
        let buildingTiles: Set<number> = new Set<number>();
        buildingTiles.add(2);
    
        let roadTiles: Set<number> = new Set<number>();
        roadTiles.add(1);
        
        /*
        for(var item of Array.from(weights.keys())) {
            
            buildingTiles.add(item); 
            roadTiles.add(item)
        }
        */
        
        let compatibility_oracle: CompatibilityOracle = new CompatibilityOracle(compatibilities);
        while(true) {
            try {
                let model: Model = new Model([25, 40], weights, compatibility_oracle, buildingTiles, roadTiles);
                let output: number[][] = model.run();
                this.render(output);
                return output;
            }
            catch (e) {
                continue;
            }
        }

        
    }
}






class ValidGrid {
    grid: number[][]
    building_location: Set<[number, number]>

    constructor(matrix_size: [number, number], buildings: number) {
        this.building_location = new Set<[number, number]>();
        let width: number = matrix_size[0];
        let height: number = matrix_size[1];

        let matrix: number[][] = []

        
        // initializes grid based off matrix_size dimensions 
        

        for (let x = 0; x <width; x++) {
            let row: number[] = [];
            for (let y = 0; y < height; y++) {
                row.push(0);
            }
            matrix.push(row);
        }

        // create coordinates of builidings randomly
        // places a total number of buildings specified
        // by buildings, with no duplicate coords
        // seen by the while loop 

        let build_coords: Set<string> = new Set<string>();
        let build_space: Set<string> = new Set<string>();

        for (let i = 0; i < buildings; i++) {
            let x: number = Math.floor(Math.random() * width);
            let y: number = Math.floor(Math.random() * height);

            function isValidLocation(x: number, y: number) {
                for (let testX = x; testX > x - 4; testX--) {
                    for (let testY = y - 1; testY < y + 3; testY++) {
                        if (build_space.has(String(testX) + "," + String(testY))) {
                            return false;
                        }
                    }
                }
                return true;
            }

            //while (build_coords.has(String(x) + "," + String(y))) {
            while(!isValidLocation(x, y)) {
                x = Math.floor(Math.random() * width);
                y = Math.floor(Math.random() * height);
            }

            build_coords.add(String(x) + "," + String(y));

            for (let testX = x; testX > x - 4; testX--) {
                for (let testY = y - 1; testY < y + 3; testY++) {
                    build_space.add(String(testX) + "," + String(testY))  
                }
            }
            build_space.add(String(x) + "," + String(y));
            this.building_location.add([x, y]);
            matrix[x][y] = 2;
        }
 
        this.grid = matrix
    }

    public static render(matrix: number[][]) {
        
        for (let row of matrix) {
            let output: string = "";
            for (let char of row) {
                output = output + char;
            }
            console.log(output)
        }
    }

    create_paths() {
        let someBuilding: [number, number] = null;
        let otherBuildings: Set<[number, number]> = new Set<[number, number]>();
        let gotBuilding: boolean = false;
        for (let building of this.building_location) {
            if (!gotBuilding && building[0] != this.grid.length) {
                someBuilding = building;
                gotBuilding = true
            } else {
                otherBuildings.add(building);
            }
            
        }
        if (someBuilding == null) {
            throw new Error("No building given for someBuilding in create_paths()");
        }
        let width: number = this.grid.length;
        let height: number = this.grid[0].length;

        let gridCopy: number[][] = this.grid;

        function bfs_util(source: [number, number] , target: [number, number], buildings: Set<[number, number]>): Set<[number, number]> {
            let visited: Set<string> = new Set<string>()
            for (let building of buildings) {
                if (building[0] == target[0] && building[1] == building[1]) {
                    continue
                }
                visited.add(String(building[0]) + "," + String(building[1]));
            }

            let q: Array<[number, number, Set<[number, number]>]> = [];
            visited.add(String(source[0]) + "," + String(source[1]));
            let sourceSet: Set<[number, number]> = new Set<[number, number]>();
            sourceSet.add([source[0], source[1]]);
            q.push([source[0], source[1], sourceSet]);

            while (q.length != 0) {
                let p: [number, number, Set<[number, number]>] = q.shift()

                let x: number = p[0];
                let y: number = p[1];
                //console.log("current location is %d, %d", x, y);

                if (x == target[0] && y == target[1]) { 
                    console.log("we found the point")
                    return p[2]
                }

                for (let d of direction.values()) {
                    let newX: number = x + d[0]
                    let newY: number = y + d[1];

                    if (newX < 0 || newX >= width || newY < 0 || newY >= height)  {
                        continue
                    }
                    if (!visited.has(String(newX) + "," + String(newY))) {
                        let copiedSet: Set<[number, number]> = new Set<[number, number]>();
                        for (let co_ord of p[2]) {
                            copiedSet.add([co_ord[0], co_ord[1]])
                        }
                        copiedSet.add([newX, newY])
                        visited.add(String(newX) + "," + String(newY));
                        q.push([newX, newY, copiedSet])
                    }
                }

            }
            return null;


        }

        /*
        function dfs_util(co_ord: [number, number], target: [number, number], visited: Set<string>): Boolean {
            let x: number = co_ord[0];
            let y: number = co_ord[1];
            
            if (target[0] == x && target[1] == y) {
                console.log("enter the true statment")
                console.log("we get to %d, %d with a true", x, y)
                return true
            }

            if (x < 0 || x >= width || y < 0 || y >= height || gridCopy[x][y] == 2)  {
                return false
            }
            console.log("current x and y are %d, %d", x, y);
            
  
            visited.add(String(x) + "," + String(y));
            //console.log("we get to the for loop")
            for (let d of direction.values()) {
                let newX: number = x + d[0]
                let newY: number = y + d[1];
                if (!visited.has(String(newX) + "," + String(newY))) {
                    if (dfs_util([newX, newY], target, visited)) {
                        gridCopy[x][y] = 1;
                        return true
                    }
                    
                }
            }

            return false
        }
        */
        console.log("the source building is %d, %d", someBuilding[0], someBuilding[1])
        for (let otherBuilding of otherBuildings) {
            //console.log("/////////////////////////////////////////////")
            console.log("other building coords are %d, %d", otherBuilding[0], otherBuilding[1]);
            //dfs_util([someBuilding[0] + 1, someBuilding[1]], otherBuilding, new Set<string>());
            let path: Set<[number, number]> = bfs_util([someBuilding[0] + 1, someBuilding[1]] , otherBuilding, this.building_location);
            if (path == null) {
                console.log("path is null")
            }
            if (!(path == null)) {
                //console.log("we have a path")
                for (let p of path) {
                    if (p[0] == otherBuilding[0] && p[1] == otherBuilding[1]) {
                        continue
                    }
                    this.grid[p[0]][p[1]] = 1;
                }
            }
        }
        



        //this.grid = gridCopy;

    }


    
    public static test() {
        let testGrid: ValidGrid = new ValidGrid([10, 50], 4);
        testGrid.create_paths();
        ValidGrid.render(testGrid.grid); 
    }
}

export {CompatibilityOracle, Wavefunction, Model, ValidGrid}

