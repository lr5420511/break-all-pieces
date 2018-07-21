'use strict';

const assert = require('assert');

const Matrix = module.exports = function(
    src, concat = '+', row = '-', col = '|', fill = ' '
) {
    this.source = src;
    this.chars = {
        concat: concat,
        row: row,
        col: col,
        fill: fill
    };
};

Matrix.prototype = {
    constructor: Matrix,
    getFillCoors: function() {
        return [
            [], ...this.source
        ].reduce((ctx, row, i) => [ctx, ...row].reduce(
            (ctx, cur, j) => {
                cur === this.chars.fill &&
                    (ctx.push([i - 1, j - 1]));
                return ctx;
            }
        ));
    },
    closurable: function(coor) {
        assert(this.source[coor[0]][coor[1]] === this.chars.fill,
            'coor is invaild.'
        );
        const ar = [
            [
                [],
                [],
                [],
                []
            ], ...this.source[coor[0]]
        ].reduce((ctx, cur, i) => {
            i - 1 < coor[1] && (ctx[0].push(cur));
            i - 1 > coor[1] && (ctx[1].push(cur));
            return ctx;
        });
        [
            ar,
            ...this.source.map(row => row[coor[1]])
        ].reduce((ctx, cur, i) => {
            i - 1 < coor[0] && (ctx[2].push(cur));
            i - 1 > coor[0] && (ctx[3].push(cur));
            return ctx;
        });
        return ar.map(cur =>
            !cur.every(me => !(me !== this.chars.fill))
        ).every(cur => cur);
    },
    getExtends: function(coor, piece) {
        const ar = [
            coor,
            ...[
                [coor[0] - 1, coor[1] - 1],
                [coor[0] + 1, coor[1] - 1],
                [coor[0] + 1, coor[1] + 1],
                [coor[0] - 1, coor[1] + 1],
                [coor[0] - 1, coor[1]],
                [coor[0], coor[1] - 1],
                [coor[0] + 1, coor[1]],
                [coor[0], coor[1] + 1]
            ].filter(cur =>
                this.source[cur[0]] &&
                this.source[cur[0]][cur[1]] !== undefined
            )
        ];
        return Matrix.getSupers((fir, sec) =>
            (fir[0] === sec[0] && fir[1] === sec[1]),
            false, ar, piece
        )[0];
    },
    builder: function(coors, back = ' ') {
        const chars = this.chars;
        let max, min;
        return [
            [], ...coors
        ].reduce((ctx, coor) => {
            let val = this.source[coor[0]][coor[1]];
            if (val === chars.concat) {
                const rounds = [
                    [coor[0] - 1, coor[1]],
                    [coor[0] + 1, coor[1]],
                    [coor[0], coor[1] - 1],
                    [coor[0], coor[1] + 1]
                ].filter(cur =>
                    this.source[cur[0]] &&
                    this.source[cur[0]][cur[1]] !== chars.fill &&
                    !coors.every(me =>
                        !(me[0] === cur[0] && me[1] === cur[1])
                    )
                );
                rounds.length === 2 && (
                    (rounds[0][0] === rounds[1][0] && (val = chars.row)) ||
                    (rounds[0][1] === rounds[1][1] && (val = chars.col))
                );
            }
            (ctx[coor[0]] || (ctx[coor[0]] = [])) &&
            (ctx[coor[0]][coor[1]] = val);
            return ctx;
        }).filter(row => {
            for (let i = 0; i < row.length; i++) {
                if (row[i]) {
                    min = i >= min ? min : i;
                    max = i <= max ? max : i;
                    continue;
                }
                row[i] = back;
            }
            return true;
        }).map(cur => [
            ...cur.slice(min, cur.length),
            ...Array(max - cur.length + 1).fill(back)
        ]);
    }
};

Matrix.getSupers = function(callback, both) {
    return [].slice.call(arguments, 2).map((cur, i, ar) => {
        const temp = [
            ...(ar[i - 1] && both ? ar[i - 1] : []),
            ...(ar[i + 1] ? ar[i + 1] : [])
        ];
        if (!temp.length) return cur;
        return cur.filter(me =>
            temp.every(cur => !callback(me, cur))
        );
    });
};

Matrix.go = function(back, callback) {
    const cache = [];
    let temp, fills = this.getFillCoors();
    while (temp = fills.pop()) {
        if (!this.closurable(temp)) continue;
        let path = [],
            closable = true,
            coors = [temp];
        while (temp = coors.shift()) {
            let exts = this.getExtends(temp, path);
            path = [...path, ...exts];
            exts = exts.filter(cur =>
                this.source[cur[0]][cur[1]] === this.chars.fill
            );
            closable = closable &&
                exts.every(coor => this.closurable(coor));
            coors = [...coors, ...exts];
        }
        fills = Matrix.getSupers((fir, sec) =>
            (fir[0] === sec[0] && fir[1] === sec[1]),
            false, fills, path
        )[0];
        if (closable) cache.push(path);
    }
    return cache.map(cur =>
        callback(this.builder(cur, back))
    );
};