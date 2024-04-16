class World {
    constructor() {
        this.state = {};
    }

    cellIsAlive(cell) {
        return(this.state[cell.cellX] && this.state[cell.cellX].has(cell.cellY));
    }

    add(cell) {
        if( !this.state[cell.cellX] ) {
            this.state[cell.cellX] = new Set();
        }
        this.state[cell.cellX].add(cell.cellY);
    }

    remove(cell) {
        if(this.cellIsAlive(cell)) {
            this.state[cell.cellX].delete(cell.cellY);
        }
        if(this.state[cell.cellX].size == 0) {
            this.state[cell.cellX] = null;
        }
    }

    toggle(cell) {
        if(this.cellIsAlive(cell)) {
            this.remove(cell);
        } else {
            this.add(cell);
        }
    }

    neighbors(cell) {
        xBase = cell.cellX;
        yBase = cell.cellY;
        let n = [];
        for(let xMod in [-1, 0, 1]) {
            for(let yMod in [-1, 0, 1]) {
                if(xMod==0 && yMod==0) {
                    continue;
                } else {
                    n.push(new Cell(xBase + xMod, yBase + yMod));
                }
            }
        }
        return n;
    }

    iterate(){
        // calculate next state based on current grid
        let changes = {deaths:[], births:[]};
        let toExamine = [];

    }

}

class Cell {
    constructor(x, y, state = false, age=0) {
        this.cellX = x;
        this.cellY = y;
        this.age = age;
    }
    
    toString() {
        return "Cell(x,y): (" + this.cellX + "," + this.cellY + ")";
    }
}

class View {
    constructor(canvas, ctx, origin, cellSize) {
        this.origin = origin;
        this.context = ctx;
        this.cellSize = cellSize;
        this.updateCanvas(canvas);
    }
    
    updateCanvas(canvas) {
        this.canvas = canvas;
        this.rows = Math.floor(canvas.height / this.cellSize);
        this.cols = Math.floor(canvas.width / this.cellSize);
        this.width = canvas.width;
        this.height = canvas.height;
    }

    pixelToCell(pixelX, pixelY, cellSize) {
        let cellX = Math.floor(pixelX / cellSize);
        let cellY = Math.floor(pixelY / cellSize);
        return new Cell(cellX, cellY);
    }

    cellToPixel(cell) {
        let pixelX = cell.x * this.cellSize;
        let pixelY = cell.y * this.cellSize;
        return {x: pixelX, y: pixelY};
    }
    
}

// Define canvas and context variables
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

// Define grid properties
var cellSize = 25; // Size of each cell in pixels
var gridColor = "#222"; // Color of grid lines

// Define game properties
var currView;
var g = new World();



function handleMouseMove(e) {
    //console.log(e.clientX + ", " + e.clientY)
}

function handleMouseDown(e) {
    var cell = currView.pixelToCell(e.clientX, e.clientY, cellSize, currView)
    g.toggle(cell);
    console.log(g.state);
    renderFrame(g, currView);
}

// Initialize the canvas
function initCanvas() {
    document.body.appendChild(canvas);
    var view = new View(canvas=canvas, context=ctx, origin=new Cell(0, 0), cellSize=cellSize, marginLeft=0, marginTop=0)
    currView = resizeCanvas(view);
    renderFrame(g, currView);
    return currView
}

// Resize canvas while preserving aspect ratio
function resizeCanvas(view) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    view.updateCanvas(canvas);
    renderFrame(g, view);
    return view
}

function renderFrame(world, view) {
    renderGrid(view);
    renderCells(world, view);
}

function renderCells(world, view) {
    lX = view.origin.cellX;
    rX = lX + view.cols;
    tY = view.origin.cellY;
    bY = tY + view.rows;

    for(col=lX; col<=rX; col+=1) {
        if(world.state[col]) {
            world.state[col].forEach(function(row) {  renderCell({view: view, x: col, y: row})});
        }
    }
}

function renderCell(c) {
    let view = c.view;
    let coords = view.cellToPixel(c);
    view.context.fillStyle = "green";
    view.context.fillRect(coords.x, coords.y, view.cellSize, view.cellSize);

}

// Render the grid on the canvas
function renderGrid(view) {
    ctx.clearRect(0, 0, view.width, view.height);

    ctx.beginPath();
    for (var i = 0; i <= view.rows; i++) {
        ctx.moveTo(0, i * view.cellSize);
        ctx.lineTo(view.width, i * view.cellSize);
    }
    for (var j = 0; j <= view.cols; j++) {
        ctx.moveTo(j * view.cellSize, 0);
        ctx.lineTo(j * view.cellSize, view.height);
    }
    ctx.strokeStyle = gridColor;
    ctx.stroke();
}

// Handle zooming with mouse scroll wheel
function handleZoom(event) {
    var delta = event.deltaY || event.detail || event.wheelDelta;

    if (delta < 0) {
        scaleFactor += zoomSpeed;
    } else {
        scaleFactor -= zoomSpeed;
    }

    scaleFactor = Math.max(0.1, scaleFactor); // Limit zoom out
    renderFrame(g, currView);
}

// Initialize the game
function initGame(world, view) {
    // Add event listeners
    window.addEventListener("resize", function(){ resizeCanvas(currView) }, false);
    canvas.addEventListener("wheel", handleZoom);
    canvas.addEventListener('mousemove', handleMouseMove, false);
    canvas.addEventListener('mousedown', handleMouseDown, false);

    // Initialize grid with dead cells
    for (var i = 0; i < currView.rows; i++) {
        g[i] = [];
        for (var j = 0; j < currView.cols; j++) {
            g[i][j] = 0;
        }
    }
}

// Initialize the canvas and the game
v = initCanvas();
initGame(g, v);
