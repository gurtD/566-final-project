# 566-final-project

https://gurtd.github.io/566-final-project/

My final project is a use case of wavefunction collapse function. What I created is a pokemon world generator that utilizes
wavefunction collapse in order to create a layout that makes sense in terms of asset location, and also in terms of path layout
for the building that exist in the world. The entirety of wave function collapse is within the Model.ts file. The code is
broken up into 4 components CompatibilityOracle, Wavefunction, Model, and ValidGrid.

The CompatibilityOracle, Wavefunction, and Model classes are related to the wavefunction collapse functionality. A simple
explanation of how wavefunction collapse works is that the wavefunction collapse is represented as a grid, with each 
location in the grid having a set of tiles that each location can be. We pick a spot in the grid that has the fewest
possible out comes, and set that spot to a specific tile. We then check all neighbors and eliminate all tile possibilities 
that can't occur next to the tile we just picked. We then continue this for that neighbor's neighbors and so on until 
there are no other tiles to eliminate from the remaining locations. We continue to do this over and over again until 
the whole grid has only a single tile in each coordinate combination. 

The CompatibilityOracle class stores all the adjacency rules for all tiles, ie what tiles can be next to each
other. This info is stored in a set consisting of a string of the two tiles and the direction that they are in relation to
each other. I wanted to make the set of tuples but was running into issues of checking the set and the set not returning 
whether or not that rule was in the set or not. The Wavefunction class is a wrapper class for the grid of tile sets at all
coordinate combination. It also has all of the functions related to the wavefunction algorithm such as the collapsing of 
each coordinate(ie eliminating tiles from the set) and finding the coordinate in the grid with the least number of 
possibilities. 

The model class is a wrapper class for both the CompatibilityOracle and Wavefunction classes. It uses
instances of both of these classes to actually carry out the running of the wavefunction collapse model. This is 
seen in the run function which essentially continues the wavefunction collapse methods until the grid is fully collapsed.
What I have now is a basic version of the wavefunction collapse. It takes in a grid that is 2d array of numbers.
The numbers act as individual possible tiles, and the grid is laid out such that it contains all the rules that we want in 
the function, ie the tiles are next to other tiles we want to allow for. The example grid that it takes in is parsed over
and all the rules are created and stored in the compatibility oracle, and we then execute the wavefunction collapse. It 
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
marks that paths with ones. For the building placement, I had to be concerned about making sure that roads didn't overlap
with buildings and vice versa. To deal with this, when a building was placed, I would check to make sure that the surrounding
area was free of all other buildings. Once this was confirmed, the tiles that would create the building were marked as tiles
that could not have roads built on them. Thus when the paths were created the bfs treated those marked tiles as ones that 
could not be visited and thus the paths went around the buildings and looked normal.

In order to incorporate these two components into one, I would create a ValidGrid of the same size as the grid of the wave
function class. We would then generate the ValidGrid, and initialize each of the coordinates of the wavefunction grid that
corresponded with the ValidGrid, ie areas with buildings would only have the tiles for the respective buildings, and the 
areas with roads would only have road tiles, and anything else could be any tile of all our possible tiles. We would then collapse all the tiles that
we had decided were either buildings or roads, and then run the model as normal. We needed to collapse the building and road
tiles due to the fact that if we didn't, we could accidentally pick an adjacent tile that wasn't a building/road and assign
it to a tile that can't be near a building or road, thus creating a contradiction and forcing us to start the collapse over.

I assigned each tile to a unique int identifier, and we would use this to render the tile appropriately. After we run the model
class to completion (all tiles have been collapsed to only a single choice) we then return the model as a grid of ints and 
send this to our instance renderer. We then create an instance for each tile and render a square. The squares are then
translated and scaled appropriately based off the dimensions of the grid given to it and the location of the tile in the grid
that that instance is rendering. For each instance we send the unique tile identifier to the shader that will color the tile.
As for coloring the tiles, I send a png of textures to the shader and with the unique tile identifier we can grab the right 
uv coordinates to draw the appropriate tile (a single png has all the tiles on it with each tile being a 16 by 16 pixel square).

On the page of the project is a gui to adjust the number of buildings, and the dimensions of the grid





source based off 
https://gist.github.com/selfsame/e7ff11205c316888977f9cac04fe4035
