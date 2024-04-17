class World {
    constructor() {
        this.state = {};
    }

    cellIsAlive(cell) {
        return(this.state[cell.x] && this.state[cell.x].has(cell.y));
    }

    add(cell) {
        if( !this.state[cell.x] ) {
            this.state[cell.x] = new Set();
        }
        this.state[cell.x].add(cell.y);
    }

    remove(cell) {
        if(this.cellIsAlive(cell)) {
            this.state[cell.x].delete(cell.y);
        }
        if(this.state[cell.x].size == 0) {
            this.state[cell.x] = null;
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
        xBase = cell.x;
        yBase = cell.y;
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
        this.x = x;
        this.y = y;
        this.age = age;
    }
    
    toString() {
        return "Cell(x,y): (" + this.x + "," + this.y + ")";
    }
}

class View {
    constructor(canvas, ctx, origin, cellSize) {
        this.origin = origin;
        this.context = ctx;
        this.shiftX = 0;
        this.shiftY = 0;
        this.cellSize = cellSize;
        // Define zoom properties
        this.scaleFactor = 1;
        this.zoomSpeed = 0.1;
        this.updateCanvas(canvas);
    }
    
    updateCanvas(canvas=null) {
        if(canvas) { this.canvas = canvas; }
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    shift(x, y) {
        this.shiftX -= x;
        this.shiftY -= y;
        let func = this.shiftX < 0 ? Math.ceil : Math.floor;
        this.origin.x += func(this.shiftX / this.cellSize);
        func = this.shiftY < 0 ? Math.ceil : Math.floor;
        this.origin.y += func(this.shiftY / this.cellSize);
        this.shiftX = this.shiftX % this.cellSize;
        this.shiftY = this.shiftY % this.cellSize;
    }

    pixelToCell(pixelX, pixelY) {
        let cellX = Math.floor((pixelX + this.shiftX) / this.cellSize) + this.origin.x;
        let cellY = Math.floor((pixelY + this.shiftY) / this.cellSize) + this.origin.y;
        return new Cell(cellX, cellY);
    }

    cellToPixel(cell) {
        let pixelX = (cell.x - this.origin.x) * this.cellSize - this.shiftX;
        let pixelY = (cell.y - this.origin.y) * this.cellSize - this.shiftY;
        return {x: pixelX, y: pixelY};
    }

    zoom(delta) {
        if (delta > 0) {
            this.cellSize = Math.max(this.cellSize *= .9, 1);
        }else{
            this.cellSize = Math.min(this.cellSize /= .9, 100);
        }
        this.updateCanvas();
    }
}

function handleMouseDown(e) {
    lastMouseX = e.x;
    lastMouseY = e.y;
    // ctrl + left mouse click enables grid movement
    if(e.buttons == 1 && e.ctrlKey) return; 
    var cell = currView.pixelToCell(e.clientX, e.clientY)
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
    ctx.clearRect(0, 0, view.width, view.height);
    if(view.cellSize > 15) {
        renderGrid(view);
    }
    renderCells(world, view);
}

function renderCells(world, view) {
    lX = view.origin.x;
    rX = lX + view.cols;
    tY = view.origin.y;
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
    ctx.beginPath();
    for (var i = 0; i <= view.rows; i++) {
        ctx.moveTo(0, i * view.cellSize - view.shiftY);
        ctx.lineTo(view.width, i * view.cellSize - view.shiftY);
    }
    for (var j = 0; j <= view.cols; j++) {
        ctx.moveTo(j * view.cellSize - view.shiftX, 0);
        ctx.lineTo(j * view.cellSize - view.shiftX, view.height);
    }
    ctx.strokeStyle = gridColor;
    ctx.stroke();
}

// Handle zooming with mouse scroll wheel
function handleZoom(event) {
    console.log('zoom' + event);
    var delta = event.deltaY || event.detail || event.wheelDelta;
    currView.zoom(delta);
    renderFrame(g, currView);
}

function advanceFrame(event) {
    console.log('advance');
}

function onViewMove(event) {
    let dX = event.x - lastMouseX;
    let dY = event.y - lastMouseY;
    currView.shift(dX, dY);
    renderFrame(g, currView);
    lastMouseX = event.x;
    lastMouseY = event.y;
}

// Initialize the game
function initGame(world, view) {
    // Add event listeners
    window.addEventListener("resize", function(){ resizeCanvas(currView) }, false);
    
    canvas.addEventListener("wheel", handleZoom);
    canvas.addEventListener('mousedown', handleMouseDown, false);
    canvas.addEventListener("mousemove", function(e) {
        if (e.ctrlKey && e.buttons === 1) { // Check for Ctrl key and left mouse button
            onViewMove(e);
        }
    });
    window.addEventListener("keypress", function(e) {
        if (e.key === "n") {
            advanceFrame(g, currView);
        }
    });


    // Initialize grid with dead cells
    for (var i = 0; i < currView.rows; i++) {
        g[i] = [];
        for (var j = 0; j < currView.cols; j++) {
            g[i][j] = 0;
        }
    }
}

// Define canvas and context variables
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

// Define grid properties
var cellSize = 50; // Size of each cell in pixels
var gridColor = "#222"; // Color of grid lines

// Define game properties
var currView;
var g = new World();

var lastMouseX, lastMouseY;

// Initialize the canvas and the game
v = initCanvas();
initGame(g, v);
