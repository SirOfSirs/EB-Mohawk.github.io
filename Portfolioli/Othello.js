/**
 * @author Elyon Brown
 * A simple game of othello
 */

//Svg
const svg = "http://www.w3.org/2000/svg";
//Player turn
let turn = "black";
//Disks placed on the board
let disks = [];

//Page load
window.addEventListener("load", (event) =>{
    //Board Element
    let board = document.getElementById("board");
    console.log("Started");

    //Draw the board
    drawGrid(board);
});

/**
 * Resets the game to the state it started in
 */
function reset(){
    let board = document.getElementById("board");
    let turnDisplay = document.getElementById("turn");
    turn = "black";
    disks = [];
    drawGrid(board);
    turnDisplay.textContent = turn;
}

/**
 * Draws the board
 * @param {*} board  The div element
 */
function drawGrid(board){
    //Dimensions
    let width = board.getAttribute("width")/8;
    let height = board.getAttribute("height")/8;

    for(let x = 0; x < 8; x++){
        let column = [];
        for(let y = 0; y < 8; y++){
            //Adds a tile and its corresponding disk to the board
            let tile = drawTile(width, height, x*width, y*height);
            board.appendChild(tile.tile);
            board.appendChild(tile.disk);
            //Sets disk id to its position, then pushes it to a temporary array
            tile.disk.setAttribute("id", `{"x" : ${x}, "y" : ${y}}`);
            column.push(tile.disk);
        }
        //Pushes the tmep array to the disks array
        disks.push(column);
    }
}

/**
 * Draws a tile and a disk
 * @param {*} width tile width
 * @param {*} height tile height
 * @param {*} x tile x position
 * @param {*} y tile y position
 * @returns JSON of a tile and disk object
 */
function drawTile(width, height, x, y){
    //Create tile
    let tile = document.createElementNS(svg, "rect");
    tile.setAttribute("width", width);
    tile.setAttribute("height", height);
    tile.setAttribute("x", x);
    tile.setAttribute("y", y);
    tile.setAttribute("style", 'fill:darkgreen; stroke:black;');

    //Create disk
    let disk = document.createElementNS(svg, "circle");
    disk.setAttribute("cx", x + width/2);
    disk.setAttribute("cy", y + height/2);
    disk.setAttribute("r", Math.floor(width/2));
    disk.setAttribute("value", "darkgreen");
    disk.setAttribute("style", "fill:darkgreen;");

    //Add hover and click events to disk
    disk.addEventListener("click", (event) => {playMove(disk)});
    disk.addEventListener("mouseover", (event) => {showPlacements(disk)});

    //Return tile and disk objects
    return {"tile": tile, "disk" : disk};
}

/**
 * Places a disk on the board
 * @param {*} disk 
 */
function playMove(disk){
    //Displays whose turn it is
    let turnDisplay = document.getElementById("turn");

    //Only place it if it's not already placed
    if(disk.getAttribute("value") == "darkgreen"){
        //Sets the value to either black or white, once it's placed
        disk.setAttribute("value", turn);
        //Flips disks to the opposite colour
        convert(disk);

        //Check if the player wins
        if(checkWin() != null){
            turnDisplay.textContent = `${checkWin()} wins`
        }
        else{
            //Switch turns to the other player
            switchTurn();
            turnDisplay.textContent = turn;
        }
    }

    //Colour disks based on its value
    colorDisks();
    
}

/**
 * Switches the player
 */
function switchTurn(){
    if(turn == "black")
        turn = "white";
    else
        turn = "black";
}

/**
 * Highlights possible placements
 * @param {*} disk The chosen disk
 */
function showPlacements(disk){
    //Possible disks
    let candidates = [];
    
    //Goes through disks array
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            disks[x][y].setAttribute("style",  "fill:darkgreen;");

            //Added to possible disks if it's eligible
            if(eligible(disk, disks[x][y]) )
                candidates.push(disks[x][y]);
        }
    }

    //Changes disk colour to a yellowish-green
    candidates.forEach(disk =>{
        disk.setAttribute("style", "fill:darkolivegreen;");
        colorDisks();
    });
}

/**
 * Checks if the disk is vertically, horizontally, or diagonally aligned with the placed disk
 * @param {*} placedDisk The placed disk
 * @param {*} disk The disk it's being compared to
 * @returns Whether the disks are aligned
 */
function eligible(placedDisk, disk){
    //Both disk positions
    let thisPosition = JSON.parse(placedDisk.id);
    let position = JSON.parse(disk.id);

    //Boolean variables checking if the positions are directly horizontal, vertical, or diagonal to eachother
    let vertical = position.y == thisPosition.y;
    let horizontal = position.x == thisPosition.x;
    let diff = thisPosition.x - position.x;
    let leftDiagonal = position.x + diff == thisPosition.x && position.y + diff == thisPosition.y;
    let rightDiagonal = thisPosition.x - diff == position.x && thisPosition.y + diff == position.y;
    
    return vertical || horizontal || leftDiagonal || rightDiagonal;
}

/**
 * Colours disks depending on their value
 */
function colorDisks(){
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            switch(disks[x][y].getAttribute("value")){
                case "black":
                    disks[x][y].setAttribute("style",  "fill:black;");
                    break;
                case "white":
                    disks[x][y].setAttribute("style",  "fill:white;");
                    break;
            }
        }
    }
}

/**
 * Switches the disks colours to the current player's, when aligned to the placed disk
 * @param {*} disk The disk being placed
 */
function convert(disk){
    //Possible disks to flip
    let candidates = []
    //Every direction from the current disk
    let directions = [{"x" : 1,"y" : 1}, {"x" : 1,"y" : 0}, {"x" : 1,"y" : -1}, {"x" : 0,"y" : 1}, {"x" : 0,"y" : -1}, {"x" : -1,"y" : 1}, {"x" : -1,"y" : 0}, {"x" : -1,"y" : -1}];

    directions.forEach(direction =>{
        //Possible disks per direction
        let local = [];
        //The position of the placed disk
        let position = JSON.parse(disk.id);

        //Continues along each direction until it reached the ends of the board
        for(let i = 0; 
            position.x + (direction.x * i) < 8 &&
            position.x + (direction.x * i) >= 0 && 
            position.y + (direction.y * i) < 8 &&
            position.y + (direction.y * i) >= 0;
            i++){
            //Gets the current disk from calculated values
            let nextPos = {"x": position.x + (direction.x * i), "y" : position.y + (direction.y * i)};
            let currentDisk = disks[nextPos.x][nextPos.y];
            
            //Breaks loop if there's an empty space
            if(currentDisk.getAttribute("value") == "darkgreen"){
                break;
            }
            //Pushes current disk to local array, if it's the opposite colour
            else if(currentDisk.getAttribute("value") != turn){
                local.push(currentDisk);
            }
            //Adds found disks to candidates array, if the same colour is reached
            else if(currentDisk != disk){
                local.forEach(cand =>{
                    candidates.push(cand);
                })
                break;
            }
        }
    });

    //Changes the values of candidate disks
    candidates.forEach(disk =>{
        disk.setAttribute("value", turn);
    });
}

/**
 * Checks if there's a winner
 * @returns the player who won
 */
function checkWin(){
    //Scores
    let black = 0;
    let white = 0;

    //Checks the value of each disk to be scored
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            black += disks[x][y].getAttribute("value") == "black" ? 1 : 0;
            white += disks[x][y].getAttribute("value") == "white" ? 1 : 0;
        }
    }

    //Returns winner, once the board is filled
    if(white + black == 64)
        return white > black ? "White" : "Black";
    else
        return null;
}