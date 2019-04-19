# 566-final-project
Currently I have a working version of a wavefunction collapse function. I copied all the base code from the l system 
hw assignment, but only to run the code that I have written in a browser. The entirety of wave function collapse is 
within the Model.ts file. The code is broken up into 4 components CompatibilityOracle, Wavefunction, Model, and ValidGrid.

The CompatibilityOracle, Wavefunction, and Model classes are related to the wavefunction collapse functionality. A simple
explanation of how wavefunction collapse works is that a wave a grid, with each location in the grid having a set of tiles
that each location can be. We pick a spot in the grid that has the fewest possible out comes, and set that spot to a specific
tile. We then check all neighbors and eliminate all tile possibilities that can't occur next to the tile we just picked. We 
then continue this for that neighbor's neighbors and so on until there are no other tiles to eliminate from the remaining 
locations. We continue to do this over and over again until the whole grid has only a single tile in each coordinate 
combination. The CompatibilityOracle class stores all the adjacency rules for all tiles, ie what tiles can be next to each
other. This info is stored in a set consisting of a string of the two tiles and the direction that they are in relation to
each other. I wanted to make the set of tuples but was running into issues of checking the set and the set not returning 
whether or not that rule was in the set or not. The Wavefunction class is a wrapper class for the grid of tile sets at all
coordinate combination. It also has all of the functions related to the wavefunction algorithm such as the collapsing of 
each coordinate(ie eliminating tiles from the set) and finding the coordinate in the grid with the least number of 
possibilities. The model class is a wrapper class for both the CompatibilityOracle and Wavefunction classes. It uses
instances of both of these classes to actually carry out the running of the wavefunction collapse model. This is 
seen in the run function which essentially continues the wavefunction collapse methods until the grid is fully collapsed.
What I have working right now is a basic version of the wavefunction collapse. It takes in a grid that is 2d array of numbers.
The numbers act as individual possible tiles, and the grid is laid out such that it contains all the rules that we want in 
the function, ie the tiles are next to other tiles we want to allow for. The example grid that it takes in is parsed over
and all the rules are created and stored in the compatiblity oracle, and we then execute the wavefunction collapse. It 
returns a grid of a specified size and prints it out to the console of the browser when its loaded up. If you want to 
see the example grid look at the test function of the method class. The printed out grid in the console follows all rules
given in the example grid.

For the final project, since i wanted to make playable 2d pokemon area, I wanted to incorporate some graph theory in order 
to guarantee the placement of buildings makes sense, ie a pokemon center or gym is in a place that can be walked to. This
is what the ValidGrid class is for. The valid grid class creates a grid with randomly placed points that will dictate where
buildings are to be built and create paths between them so that they are all connected. How this works is that a 2d array of
numbers is created to represent the grid filled with zeros, and random buildings are placed in the grid, dictated by 2s. The
number of buildings placed is a variable of the constructor of ValidGrid. It then picks one of the random points and finds 
the shortest path to the other building locations. It does this with a breadth first search and after it finds a path, it 
marks that paths with ones. Right now I have it that it creates a test grid and prints it out to the console as well when
running in a browser. What I plan to do next with this is to incorporate valid grid into the model class. What I will do
is create a ValidGrid of the same size as the one for the Wavefunction grid. Once I do this, I will make separate tile sets
for buildings, one for roads, and one for all tiles. I will then crosscheck the Wavefunction grid with that of the ValidGrid,
and for all spots where a 2 is in the grid (buildings) I will assign only building tiles as the possible choices for that 
location in the wavefunction grid, and do the same for roads but with the set of road tiles. Every where else will have the 
set that has all the possible tiles. This way I can guarantee that all notable parts of the level are connected properly and 
makes sense. Once I do this I can then move on to actually rendering the map based of a visual tile set I still need to 
create. Each of the numbers in the grid of the wavefunction class will correspond to a unique tile.