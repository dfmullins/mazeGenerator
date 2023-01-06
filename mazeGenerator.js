
document.addEventListener('DOMContentLoaded', (event) => {
	// row, col
  (new MazeSetup('divContainer', 10, 10)).setupGrid();
});

class Utilities {
	static tableProperties = {
		id: "mazeTable",
		marginLeft: "auto",
		marginRight: "auto",
		containerId: "",
		col: "",
		row: ""
	};
	static firstCell      = "0_0";
	static cellWidth      = "50px";
	static cellHeight     = "50px";
	static borderConfig   = 'solid 5px black';
	static cellBorders    = [
		'borderTop', 
		'borderRight', 
		'borderBottom', 
		'borderLeft', 
		'none'
	];
	static directions     = [
		'down', 
		'right', 
		'up', 
		'left'
	];
	static noBorder       = ["", "none"];
	static cellProperties = {
		count: 0
	};
	static eachPattern    = [
			[0,1,2,3],
			[0,1,3,2],
			[1,0,2,3],
			[1,0,3,2]
		];
	
	createNewCellId(row, col, newRow = 0, newCol = 0) {
		return (Number(row) + Number(newRow)) + "_" + (Number(col) + Number(newCol));
	}
	
	generateRandomNumber(count, offset = 0) {
		return Math.floor(Math.random() * (count + offset));
	}
}

class MazeRoute extends Utilities {
	constructor(lastCell, row, col) {
		super();
		this.path             = [Utilities.firstCell];
		this.walls            = [];
		this.wallCount        = 0;
		this.direction        = "";
		this.lastCell         = lastCell;
		this.lastSide 		  = "";
		this.row              = row;
		this.col              = col;
		this.currentPattern   = [];
		this.routeFlag        = 1;
		this.lastMazeState    = '';
		this.randomWallCount  = 1;
	}
	
	checkAdjacentWall(row, col, randomSide) {
		let sideToCheck = "";
		let cellId = "";
		let obj = {
			borderTop: () => {
				sideToCheck = Utilities.cellBorders[2];
				cellId = this.createNewCellId(row, col, -1, 0);
			},
			borderLeft: () => {
				sideToCheck = Utilities.cellBorders[1];
				cellId = this.createNewCellId(row, col, 0, -1);
			},
			borderRight: () => {
				sideToCheck = Utilities.cellBorders[3];
				cellId = this.createNewCellId(row, col, 0, 1);
			},
			borderBottom: () => {
				sideToCheck = Utilities.cellBorders[0];
				cellId = this.createNewCellId(row, col, 1, 0);
			}
		}
		
		if (typeof obj[Utilities.cellBorders[randomSide]] === "function") {
			obj[Utilities.cellBorders[randomSide]]();
		} else {
			return false;
		}
		
		let adjacentCell = document
			.querySelector('[data-cell="' + cellId + '"]');
		
		if ("" === adjacentCell.style[sideToCheck]) {
			return true;
		}
		
		return false;
	}
	
	checkIfMazeBorder(randomRow, randomCol, randomSide) {
		if (
			0 === randomCol && Utilities.cellBorders[3] === randomSide
			|| 0 === randomRow && Utilities.cellBorders[0] === randomSide
			|| this.col === randomCol && Utilities.cellBorders[1] === randomSide
			|| this.row === randomRow && Utilities.cellBorders[2] === randomSide
		) {
			return true;
		}
		
		return false;
	}
	
	randomWallConditional(
		randomCellElement, 
		randomSide,
		randomCellId,
		randomRow, 
		randomCol
	) {
		return Utilities.noBorder
			.includes(randomCellElement.style[Utilities.cellBorders[randomSide]]) // does not have border there
			&& Utilities.firstCell !== randomCellId // not the first cell
			&& this.createNewCellId(this.row, this.col) !== randomCellId // not the last cell
			&& false === this.walls.includes(randomCellId + "-" + randomSide) // not a duplicate wall
			&& false === this.checkIfMazeBorder(randomRow, randomCol, randomSide); // not part of maze border
	}
	
	addRandomWall(rowRange = this.row, colRange = this.col, flag = 0) {
		let randomRow = this.generateRandomNumber(rowRange, 1);
		let randomCol = this.generateRandomNumber(colRange, 1);
		let randomCellId = this.createNewCellId(randomRow, randomCol);
		let randomSide = this.generateRandomNumber(4); // 0-3 (i.e. 4 sides)
		let randomCellElement = document.querySelector('[data-cell="' + randomCellId + '"]');

		if (
			this.randomWallConditional(randomCellElement, randomSide, randomCellId, randomRow, randomCol)
		) {
			// not a touching wall (i.e. borderRight-borderLeft)
			if (this.checkAdjacentWall(randomRow, randomCol, randomSide)) { 
				this.createWall(randomCellElement, randomCellId, randomSide);
			} else {
				this.addRandomWall();
			}
		} else {
			this.addRandomWall();
		}
	}
	
	createWall(randomCellElement, randomCellId, randomSide) {
		this.walls.push(randomCellId + "-" + randomSide);
		randomCellElement.style[Utilities.cellBorders[randomSide]] = Utilities.borderConfig;
		this.lastSide = Utilities.cellBorders[randomSide];
		this.wallCount = this.wallCount + 1;
	}
	
	adjacentCellHasNoTouchingBorder(row, col, side) {
		let cellId = this.createNewCellId(row, col);
		let adjacentCell = document.querySelector('[data-cell="' + cellId + '"]');
	
		if (
			null !== adjacentCell 
			&& null !== adjacentCell.style[side] 
			&& "" === adjacentCell.style[side]
		) {
			return true;
		}
		
		return false;
	}
	
	moveDown(currentCellElement, currentRow, currentCol) {
		return Utilities.noBorder.includes(currentCellElement.style.borderBottom)
			&& true === this.adjacentCellHasNoTouchingBorder((currentRow + 1), currentCol, Utilities.cellBorders[0])
			&& !this.isPreviousCell((currentRow + 1), currentCol);
	}
	
	moveRight(currentCellElement, currentRow, currentCol) {
		return Utilities.noBorder.includes(currentCellElement.style.borderRight)
			&& true === this.adjacentCellHasNoTouchingBorder(currentRow, (currentCol + 1), Utilities.cellBorders[3])
			&& !this.isPreviousCell(currentRow, (currentCol + 1));
	}
	
	moveUp(currentCellElement, currentRow, currentCol, currentCell) {
		return Utilities.noBorder.includes(currentCellElement.style.borderTop)
			&& true === this.adjacentCellHasNoTouchingBorder((currentRow - 1), currentCol, Utilities.cellBorders[2])
			&& Utilities.firstCell !== currentCell
			&& !this.isPreviousCell((currentRow - 1), currentCol);
	}
	
	moveLeft(currentCellElement, currentRow, currentCol) {
		return Utilities.noBorder.includes(currentCellElement.style.borderLeft)
			&& true === this.adjacentCellHasNoTouchingBorder(currentRow, (currentCol - 1), Utilities.cellBorders[1])
			&& !this.isPreviousCell(currentRow, (currentCol - 1));
	}
	
	doneMoving() {
		try {
			if (false === this.initiateMaze()) {
				this.restartMaze();
			}
		} catch (e) {
			this.initiateMaze(true);
		}
	}
	
	restartMaze() {
		if (document.querySelector('#mazeTable')) {
			document.querySelector('#mazeTable').remove();
		}
		
		(new MazeSetup(
				Utilities.tableProperties.containerId, 
				Number(Utilities.tableProperties.col), 
				Number(Utilities.tableProperties.row)
			)
		).setupGrid();
	}
	
	initiateMaze(bypass = false) {
		if ((this.randomWallCount >= 10 && false === bypass) || true === bypass) {
			document.querySelector('#mazeTable').innerHTML = this.lastMazeState;
			this.createEventListeners();
			
			return true;
		}
		
		return false;
	}
	
	moveDownConditional(currentCellElement, currentRow, currentCol) {
		if (
			this.direction === Utilities.directions[0] 
			&& this.moveDown(currentCellElement, currentRow, currentCol)
			|| this.moveDown(currentCellElement, currentRow, currentCol)
		) {
			return this.move((currentRow + 1), currentCol, 0);
		}
		
		return false;
	}
	
	moveRightConditional(currentCellElement, currentRow, currentCol) {
		if (
			this.direction === Utilities.directions[1] 
			&& this.moveRight(currentCellElement, currentRow, currentCol)
			|| this.moveRight(currentCellElement, currentRow, currentCol)
		) {
			return this.move(currentRow, (currentCol + 1), 1);
		}
		
		return false;
	}
	
	moveUpConditional(currentCellElement, currentRow, currentCol, currentCell) {
		if (
			this.direction === Utilities.directions[2] 
			&& this.moveUp(currentCellElement, currentRow, currentCol, currentCell)
			|| this.moveUp(currentCellElement, currentRow, currentCol, currentCell)
		) {
			return this.move((currentRow - 1), currentCol, 2);
		}
		
		return false;
	}
	
	moveLeftConditional(currentCellElement, currentRow, currentCol) {
		if (
			this.direction === Utilities.directions[3] 
			&& this.moveLeft(currentCellElement, currentRow, currentCol)
			|| this.moveLeft(currentCellElement, currentRow, currentCol)
		) {
			return this.move(currentRow, (currentCol - 1), 3);
		}
		
		return false;
	}
	
	runPatterns(array) {
		array.some((func) => {
			return func();
		});
	}
	
	setupPattern(currentCell, currentCellElement, currentRow, currentCol, routeArray) {
		let newArray = [];
		let array = [
			() => {return this.moveDownConditional(currentCellElement, currentRow, currentCol);},
			() => {return this.moveRightConditional(currentCellElement, currentRow, currentCol);},
			() => {return this.moveUpConditional(currentCellElement, currentRow, currentCol, currentCell);},
			() => {return this.moveLeftConditional(currentCellElement, currentRow, currentCol);},
			() => {return this.nextRouteOrDone();}
		];
		
		routeArray.forEach((index) => {
			newArray.push(array[index]);
		});
		newArray.push(array.slice(-1)[0]);
		this.runPatterns(newArray);
	}

	runRoute(patterArray) {
		this.currentPattern = patterArray;
		let currentCell = this.path.slice(-1)[0];
		let currentCellElement = document.querySelector('[data-cell="' + currentCell + '"]');
		let cellObject  = currentCell.split("_");
		let currentRow  = Number(cellObject[0]);
		let currentCol  = Number(cellObject[1]);	
		
		this.setupPattern(currentCell, currentCellElement, currentRow, currentCol, this.currentPattern);
	}
	
	nextRouteOrDone() { 
		const obj = {
			1: () => {
				this.routeFlag = 2;
				this.setupForNextRoute(1);
			},
			2: () => {
				this.routeFlag = 3;
				this.setupForNextRoute(2);
			},
			3: () => {
				this.routeFlag = 4;
				this.setupForNextRoute(3);
			}
		};
		
		if (typeof obj[this.routeFlag] === "function") {
			obj[this.routeFlag]();
			
			return true;
		}
		
		this.routeFlag = 1;
		this.doneMoving();
		
		return true;
	}
	
	setupForNextRoute(index) {
		let lastWallComposite = this.walls.slice(-1)[0];
		let lastWall = lastWallComposite.split("-")[0];
		document
			.querySelector('[data-cell="' + lastWall + '"]')
			.style[this.lastSide] = Utilities.cellBorders[4];
		this.path = [Utilities.firstCell];
		this.direction = '';
		this.runRoute(Utilities.eachPattern[index]);
	}
	
	move(row, col, dir) {
		this.direction = Utilities.directions[dir];
		this.logPath(row, col);
		
		return true;
	}
	
	createEventListeners() {
		let cells = document.querySelectorAll(".cell");
		
		cells.forEach((cell) => {
			cell.addEventListener('mouseover', (element) => {
				(new UserInterface()).mouseOverCell(element.target);
			});
		});
	}
	
	isPreviousCell(row, col) {
		let cell = this.createNewCellId(row, col);
		
		return this.path.includes(cell);
	}
	
	logPath(row, col) {
		let newCell = this.createNewCellId(row, col);
		this.path.push(newCell);
		this.continuePath(newCell);
	}
	
	continuePath(newCell) {
		try {
			if (this.lastCell === newCell) {
				this.highlightCell();
				this.lastMazeState = document.querySelector('#mazeTable').innerHTML;
				this.randomWallGenerator(this.randomWallCount);
				this.path = [Utilities.firstCell];
				this.direction = '';
			}
			
			this.runRoute(this.currentPattern);
		} catch (e) {
			this.doneMoving();
		}
	}
	
	highlightCell() {
		// touch little things randomly in cells
	}
	
	randomWallGenerator(count) {
		for (let i = 0; i <= count; i++) {
			this.addRandomWall(); // add a random wall anywhere
		}
		this.randomWallCount = this.randomWallCount + 1;
	}
}

class UserInterface extends Utilities {
	resetCellBgColors() {
		let cells = document.querySelectorAll(".cell");
		
		cells.forEach((cell) => {
			if (1 === Number(cell.dataset.player)) {
				cell.dataset.player = 0;
				cell.style.backgroundColor = "inherit";
			}
		});
	}
	
	mouseOverCell(element) { 
		if (true === this.mouseOverCellConditions(element, false)) {
			this.resetCellBgColors();
			let newCount = Number(Utilities.cellProperties.count) + 1;
			element.dataset.count = newCount;
			element.dataset.player = 1;
			element.style.backgroundColor = "red";
			Utilities.cellProperties.count = newCount;
		}
	}
	
	isTouchingCell(element) { 
		let cellId = element.dataset.cell;
		let cellIdArray = cellId.split("_");
		let row = Number(cellIdArray[0]);
		let col = Number(cellIdArray[1]);
		let otherCellObj = {
			topCell: this.createNewCellId(row, col, -1, 0),
		    rightCell: this.createNewCellId(row, col, 0, 1),
		    bottomCell: this.createNewCellId(row, col, 1, 0),
			leftCell: this.createNewCellId(row, col, 0, -1)
		}
		
		for (const [key, value] of Object.entries(otherCellObj)) { 
			let checkCell = document.querySelector('[data-cell="' + value + '"]');
			
			if (checkCell) {
				let datasetCountType = checkCell.dataset.count;
	
				if (
					checkCell 
					&& typeof datasetCountType !== "undefined" 
					&& Number(Utilities.cellProperties.count) === Number(checkCell.dataset.count) 
				) {
					return this.checkForWall(element, checkCell);
				}
			}
		}

		return false;
	}
	
	cellBelow(prevCellRow, prevCellCol, element, checkCell, newCell) {
		if (
			newCell === this.createNewCellId(prevCellRow, prevCellCol, 1, 0)
			&& Utilities.noBorder.includes(element.style.borderTop) 
			&& Utilities.noBorder.includes(checkCell.style.borderBottom)
		) {
			return true;
		}
	}
	
	cellRight(prevCellRow, prevCellCol, element, checkCell, newCell) {
		if (
			newCell === this.createNewCellId(prevCellRow, prevCellCol, 0, 1)
			&& Utilities.noBorder.includes(element.style.borderLeft) 
			&& Utilities.noBorder.includes(checkCell.style.borderRight)
		) {
			return true;
		}
	}
	
	cellLeft(prevCellRow, prevCellCol, element, checkCell, newCell) {
		if (
			newCell === this.createNewCellId(prevCellRow, prevCellCol, 0, -1)
			&& Utilities.noBorder.includes(element.style.borderRight) 
			&& Utilities.noBorder.includes(checkCell.style.borderLeft)
		) {
			return true;
		}
	}
	
	cellAbove(prevCellRow, prevCellCol, element, checkCell, newCell) {
		if (
			newCell === this.createNewCellId(prevCellRow, prevCellCol, -1, 0)
			&& Utilities.noBorder.includes(element.style.borderBottom) 
			&& Utilities.noBorder.includes(checkCell.style.borderTop)
		) {
			return true;
		}
	}
	
	checkForWall(element, checkCell) {
		let prevCell = checkCell.dataset.cell;
		let newCell = element.dataset.cell;
		let prevCellArray = prevCell.split("_");
		let newCellArray  = newCell.split("_");
		let prevCellRow = Number(prevCellArray[0]);
		let prevCellCol = Number(prevCellArray[1]);
		let newCellRow = Number(newCellArray[0]);
		let newCellCol = Number(newCellArray[1]);
		
		let array = [
			() => { return this.cellBelow(prevCellRow, prevCellCol, element, checkCell, newCell); },
			() => { return this.cellRight(prevCellRow, prevCellCol, element, checkCell, newCell); },
			() => { return this.cellLeft(prevCellRow, prevCellCol, element, checkCell, newCell); },
			() => { return this.cellAbove(prevCellRow, prevCellCol, element, checkCell, newCell); },
		];
		
		if (true === array.some((func) => { return func(); })) {
			return true;
		}
		
		return false;
	}
	
	mouseOverCellConditions(element) {
		let canChangeBgColor = false;
		
		if (element
			&& (Utilities.firstCell === element.dataset.cell
			|| this.isTouchingCell(element))
		) {
			canChangeBgColor = true;
		}
		
		return canChangeBgColor;
	}
}

class MazeSetup extends Utilities {
	constructor(containerId, col, row) {
		super();
		this.containerId      = containerId;
		this.containerElement = document.querySelector("#" + this.containerId);
		this.col              = col;
		this.row              = row;
		this.lastCell         = this.createNewCellId(row, col);
		
		Utilities.tableProperties.containerId = this.containerId;
		Utilities.tableProperties.col = this.col;
		Utilities.tableProperties.row = this.row;
	}
	
	setupGrid() {
		this.createTable();
		if (true === this.createRowsAndCells()) {
			(new MazeRoute(this.lastCell, this.row, this.col)).runRoute(Utilities.eachPattern[0]);
		}
	}
	
	createTable() {
		const table                = document.createElement("table");
		table.id                   = Utilities.tableProperties.id;
		table.style.marginLeft     = Utilities.tableProperties.marginLeft;
		table.style.marginRight    = Utilities.tableProperties.marginRight;
		table.style.borderCollapse = "collapse";
		this.containerElement.append(table);
	}
	
	createRowsAndCells() {
		for (let rowCount = 0; rowCount <= this.row; rowCount++) {
			let row = this.createRow(rowCount);
			for (let colCount = 0; colCount <= this.col; colCount++) {
				this.createCell(row, colCount, rowCount);
			}
		}
		
		return true;
	}
	
	createRow(rowCount) {
		return document.querySelector("#" + Utilities.tableProperties.id).insertRow(rowCount);
	}
	
	createCell(row, colCount, rowCount) {
		let cell            = row.insertCell(colCount);
		cell.id             = this.createNewCellId(rowCount, colCount);
		cell.dataset.cell   = this.createNewCellId(rowCount, colCount);
		cell.dataset.player = 0;
		cell.classList.add("cell");
		cell.style.width    = Utilities.cellWidth;
		cell.style.height   = Utilities.cellHeight;
		this.setupBorder(cell, colCount, rowCount);
	}
	
	setupBorder(cell, colCount, rowCount) {
		const startCell = Utilities.firstCell;
		const endCell   = this.createNewCellId(this.row, this.col);
		
		this.borderLeft(colCount, cell);
		this.borderTop(rowCount, startCell, cell);
		this.borderRight(colCount, cell);
		this.borderBottom(rowCount, endCell, cell);
	}
	
	borderTop(rowCount, startCell, cell) {
		if (0 === rowCount && startCell !== cell.id) {
			cell.style.borderTop = Utilities.borderConfig;
		}
	}
	
	borderLeft(colCount, cell) {
		if (0 === colCount) {
			cell.style.borderLeft = Utilities.borderConfig;
		}
	}
	
	borderBottom(rowCount, endCell, cell) {
		if (this.row === rowCount && endCell !== cell.id) {
			cell.style.borderBottom = Utilities.borderConfig;
		}
	}
	
	borderRight(colCount, cell) {
		if (this.col === colCount) {
			cell.style.borderRight = Utilities.borderConfig;
		}
	}
}
