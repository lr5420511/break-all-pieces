'use strict';

const Matrix = require('./entities/matrix');

function breakPieces(shape) {
    const matrix = new Matrix(
        shape.match(/(^|\n)[^\n$]+/g).map(cur =>
            cur.replace(/\n/, '').split('')
        )
    );
    return Matrix.go.call(matrix, ' ', res =>
        res.map(cur => cur.join('')).join('\n')
    );
}

breakPieces(
    `
      
     +---+
     |   |
     |   +-----+
+ ---+         |
|    + -+-+    |
|    |  | |    |
|    +--+-+    |
+----+    |    |
     |   ++----+
     |   |
     +---+    
`
).forEach(cur => console.log(cur));