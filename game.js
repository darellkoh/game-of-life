var gameOfLife = {

    width: 32,
    height: 32,
    stepInterval: null,

    // Utility functions
    getCellCoords: function (cellElement) {
        var splitId = cellElement.id.split('-');
        return [+splitId[0], +splitId[1]];
    },

    selectCell: function (x, y) {
        return this.cells[x.toString() + '-' + y.toString()];
    },

    getCellNeighbors: function (cell) {

        var coords = this.getCellCoords(cell);
        var x = coords[0];
        var y = coords[1];

        var neighbors = [];

        // Direct left and right
        neighbors.push(this.selectCell(x - 1, y));
        neighbors.push(this.selectCell(x + 1, y));

        // Row above
        neighbors.push(this.selectCell(x - 1, y - 1));
        neighbors.push(this.selectCell(x, y - 1));
        neighbors.push(this.selectCell(x + 1, y - 1));

        // Row below
        neighbors.push(this.selectCell(x - 1, y + 1));
        neighbors.push(this.selectCell(x, y + 1));
        neighbors.push(this.selectCell(x + 1, y + 1));

        return neighbors.filter(function (cell) {
            return !!cell;
        });

    },

    getAliveNeighbors: function (cell) {

        var self = this;
        var allNeighbors = this.getCellNeighbors(cell);

        return allNeighbors.filter(function (neighbor) {
            return self.getCellStatus(neighbor) === 'alive';
        });

    },

    getCellStatus: function (cell) {
        return cell.getAttribute('data-status');
    },

    setCellStatus: function (cell, status) {
        cell.setAttribute('data-status', status);
        cell.className = status;
    },

    toggleCellStatus: function (cell) {
        if (this.getCellStatus(cell) === 'dead') {
            this.setCellStatus(cell, 'alive');
        } else {
            this.setCellStatus(cell, 'dead');
        }
    },

    forEachCell: function (iteratorFunc) {
        var self = this;
        [].slice.call(this.cells).forEach(function (cell) {
            var cellCoords = self.getCellCoords(cell);
            iteratorFunc(cell, cellCoords[0], cellCoords[1]);
        });
    },

    // Initialization and gameplay functions

    createAndShowBoard: function () {
        // create <table> element
        var goltable = document.createElement("tbody");

        // build Table HTML
        var tablehtml = '';
        for (var h = 0; h < this.height; h++) {
            tablehtml += "<tr id='row+" + h + "'>";
            for (var w = 0; w < this.width; w++) {
                tablehtml += "<td data-status='dead' id='" + w + "-" + h + "'></td>";
            }
            tablehtml += "</tr>";
        }
        goltable.innerHTML = tablehtml;

        // add table to the #board element
        var board = document.getElementById('board');
        board.appendChild(goltable);

        this.cells = document.getElementsByTagName('td');

        // once html elements are added to the page, attach events to them
        this.setupBoardEvents();
    },


    setupBoardEvents: function () {

        var self = this;

        this.forEachCell(function (cell) {
            cell.addEventListener('click', self.toggleCellStatus.bind(self, cell));
        });

        document.getElementById('step_btn').addEventListener('click', this.step.bind(this));
        document.getElementById('play_btn').addEventListener('click', this.enableAutoPlay.bind(this));
        document.getElementById('clear_btn').addEventListener('click', this.clearBoard.bind(this));
        document.getElementById('reset_btn').addEventListener('click', this.randomBoard.bind(this));
        document.getElementById('shape_input').addEventListener('change', this.insertShape.bind(this));

    },

    insertShape: function (changeEvent) {

        var self = this;
        var fileReader = new FileReader();

        self.clearBoard();

        fileReader.readAsText(changeEvent.target.files[0]);

        fileReader.onloadend = function () {

            var shape = fileReader.result.split('\n').slice(2);
            var shapeHeight = shape.length;
            var shapeWidth = shape[0].length;

            var startX = Math.floor(self.width / 2) - Math.floor(shapeWidth / 2);
            var startY = Math.floor(self.height / 2) - Math.floor(shapeHeight / 2);

            shape.forEach(function (row, rowIndex) {

                row = row.split('');

                row.forEach(function (cell, columnIndex) {
                    if (cell === 'O') {
                        self.setCellStatus(self.selectCell(startX + columnIndex, startY + rowIndex), 'alive');
                    }
                });

            });

        };

    },

    step: function () {
        // Here is where you want to loop through all the cells
        // on the board and determine, based on it's neighbors,
        // whether the cell should be dead or alive in the next
        // evolution of the game.
        //
        // You need to:
        // 1. Count alive neighbors for all cells
        // 2. Set the next state of all cells based on their alive neighbors

        var self = this;
        var cellsToToggle = [];

        this.forEachCell(function (cell) {

            var aliveNeighborsCount = self.getAliveNeighbors(cell).length;

            if (self.getCellStatus(cell) === 'dead') {
                if (aliveNeighborsCount === 3) {
                    cellsToToggle.push(cell);
                }
            } else {
                if (aliveNeighborsCount !== 2 && aliveNeighborsCount !== 3) {
                    cellsToToggle.push(cell);
                }
            }

        });

        // Not using bind
        /*
         cellsToToggle.forEach(function (cell) {
            self.toggleCellStatus(cell);
         });
         */

        // Using bind
        cellsToToggle.forEach(self.toggleCellStatus.bind(self));

    },

    enableAutoPlay: function () {
        // Start Auto-Play by running the 'step' function
        // automatically repeatedly every fixed time interval

        if (this.stepInterval) {
            return this.stopAutoPlay();
        }

        this.stepInterval = setInterval(this.step.bind(this), 100);

    },

    stopAutoPlay: function () {
        if (!this.stepInterval) return;
        clearInterval(this.stepInterval);
        this.stepInterval = null;
    },

    clearBoard: function () {
        var self = this;
        this.forEachCell(function (cell) {
            self.setCellStatus(cell, 'dead');
        });
    },

    randomBoard: function () {
        var self = this;
        this.forEachCell(function (cell) {
            if (Math.random() > .5) {
                self.setCellStatus(cell, 'alive');
            } else {
                self.setCellStatus(cell, 'dead');
            }
        });
    }

};

gameOfLife.createAndShowBoard();
