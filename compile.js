//Prudence Mar 14
//Dissect the json data from godbolt.org

data = {
    "code": 0,
    "stdout": [],
    "stderr": [],
    "okToCache": true,
    "inputFilename": "/tmp/compiler-explorer-compiler118215-62-1nnqbp.wdb6k/example.cpp",
    "hasOptOutput": false,
    "asmSize": 3039,
    "asm": [{ "text": " add $2,$3,8($4)", "source": { "file": null, "line": 3 } }, { "text": "main:", "source": null }, { "text": "  addiu $sp,$sp,-24", "source": { "file": null, "line": 1 } }, { "text": "  sw $fp,20($sp)", "source": { "file": null, "line": 1 } }, { "text": "  move $fp,$sp", "source": { "file": null, "line": 1 } }, { "text": "  li $2,5 # 0x5", "source": { "file": null, "line": 2 } }, { "text": "  sw $2,8($fp)", "source": { "file": null, "line": 2 } }, { "text": "  lw $2,8($fp)", "source": { "file": null, "line": 3 } }, { "text": "  nop", "source": { "file": null, "line": 3 } }, { "text": "  addiu $2,$2,5", "source": { "file": null, "line": 3 } }, { "text": "  sw $2,8($fp)", "source": { "file": null, "line": 3 } }, { "text": "  move $2,$0", "source": { "file": null, "line": 4 } }, { "text": "  move $sp,$fp", "source": { "file": null, "line": 4 } }, { "text": "  lw $fp,20($sp)", "source": { "file": null, "line": 4 } }, { "text": "  addiu $sp,$sp,24", "source": { "file": null, "line": 4 } }, { "text": "  j $31", "source": { "file": null, "line": 4 } }, { "text": "  nop", "source": { "file": null, "line": 4 } }, { "text": "", "source": null }]
}

//Format a number to a fixed length
function digi(num, length) {
    num = num.toString(2)
    while (num.length < length) {
        num = "0" + num
    }
    return num
}


/*
Register
OpTable: instructions to opcoce
FuncTable: instructions to functio code (for R type)
index($sp): return the index of the register
parse(8($sp)): return the shift 2 and indexed register
getType(instr): return "R","I" or "J" based on the instruction
getOpcode(instr): return opcode according to the instruction
*/
var Registers = {
    // "use strict";
    values: [1, 2, 3, 4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3],

    table: ["$zero", "$at", "$v0", "$v1", "$a0", "$a1", "$a2", "$a3",
        "$t0", "$t1", "$t2", "$t3", "$t4", "$t5", "$t6", "$t7",
        "$s0", "$s1", "$s2", "$s3", "$s4", "$s5", "$s6", "$s7",
        "$t8", "$t9",
        "$k0", "$k1", "$gp", "$sp", "$fp", "$ra"
    ],

    RType: ["add", "addu", "sub", "subu", "div", "divu", "jr", "and", "or"],
    IType: ["addi", "addiu", "beq", "bne", "lw", "sw", "lui", "li"], //li is treated as lui
    JType: ["j", "jal"],

    OpTable: {
        "addiu": 0x09,
        "lw": 0x23,
        "sw": 0x2B,
        "lui": 0x0F,
        "li": 0x0F,
        "j": 0x02
    },

    FuncTable: {
        "add": 0x20,
        "addu": 0x21,
        "and": 0x24,
        "jr": 0x08,
        "or": 0x25
    },

    index: function(r_name) {
        if (r_name.indexOf('$') == -1) {
            return +r_name;
        }
        if (this.table.indexOf(r_name) != -1) {
            return this.table.indexOf(r_name);
        } else {
            return +r_name.slice(1);
        }
    },

    parse: function(r_name) {
        if (r_name.indexOf("(") != -1) {

            var shifter = parseInt(r_name.slice(0, r_name.indexOf("("))) / 4;
            var nb = this.index(r_name.slice(r_name.indexOf("(") + 1, r_name.length - 1));

            return [shifter, nb];
        } else {
            return [0, this.index(r_name)];
        }



    },

    // get: function(r_name) {
    //     return this.parse(r_name);
    // },
    // set: function(r_name, value) {
    //     this.values[this.index(r_name)] = value

    // },
    getType: function(op) {
        if (this.RType.indexOf(op) != -1) {
            return "R";
        } else if (this.IType.indexOf(op) != -1) {
            return "I";
        } else if (this.JType.indexOf(op) != -1) {
            return "J";
        }
    },

    getOpcode: function(op) {
        if (this.OpTable[op] != undefined) {
            return this.OpTable[op]
        } else {
            return 0x00;
        }
    }
}


/*
An object to simulate each instruction
Format(String), 
*/
function Format(instr) {
    //instr: "  addiu $sp,$sp,-24"
    this.instr = instr.trim();
    if (this.instr.indexOf('#') != -1) {
        this.instr = this.instr.slice(0, this.instr.indexOf('#') - 1)
    }
    
    this.recognize();
    this.bit = this.getBits(this.type);

}

//Analyze the elements of the string
Format.prototype.recognize = function() {
    // var format = { op: null }
    //If wrong format
    if (this.instr.indexOf(' ') == -1) {
        this.op = this.instr;
        // return format;
        return
    }
    this.op = this.instr.slice(0, this.instr.indexOf(' '))
    var para = this.instr.slice(this.instr.indexOf(' ') + 1)

    this.type = Registers.getType(this.op)
    if (this.type === "R") {
        this.rs = null;
        this.rt = null;
        this.rd = null;
        this.shift = null;
        this.func = null;

        this.rs = para.slice(0, para.indexOf(','))
        this.rs = Registers.index(this.rs)
        para = para.slice(para.indexOf(',') + 1)

        this.rt = para.slice(0, para.indexOf(','))
        this.rt = Registers.index(this.rt)
        para = para.slice(para.indexOf(',') + 1)


        //Need to confirm which among rs, rt and rd to shift
        var a = Registers.parse(para)
        this.rd = a[1]
        this.shift = a[0]
        this.func = this.op

    } else if (this.type === "I") {
        this.rs = null;
        this.rt = null;
        this.add = null;

        this.rs = para.slice(0, para.indexOf(','))
        this.rs = Registers.index(this.rs)
        para = para.slice(para.indexOf(',') + 1)
        if (para.indexOf(',') != -1) {
            this.rt = para.slice(0, para.indexOf(','))
            this.rt = Registers.index(this.rt)
            para = para.slice(para.indexOf(',') + 1)
            this.add = +para
        } else {
            this.rt = para
            var a = Registers.parse(this.rt)
            this.rt = a[1]
            this.add = a[0]
        }

    } else if (this.type === "J") {
        this.add = Registers.index(para)

        console.log("Add", this.add)
    }

}

//Transform the string to binary according to the instruction type
Format.prototype.getBits = function(type) {

    var opcode = Registers.getOpcode(this.op);
    opcode = digi(opcode, 6);
    var rs = this.rs | 0;
    var rt = this.rt | 0;
    var rd = this.rd | 0;
    var shift = this.shift | 0
    var func = Registers.FuncTable[this.func] | 0
    var add = this.add | 0;

    if (type === "R") {
        opcode += digi(rs, 5) + digi(rt, 5) + digi(rd, 5) + digi(shift, 5) + digi(func, 6)
    } else if (type === "I") {
        opcode += digi(rs, 5) + digi(rt, 5) + digi(add, 16)
    } else if (type === "J") {
        opcode += digi(add, 26);
    }

    return opcode;
}

//Run the instruction codes in the specified lines
function analyze(data, nbline) {
    var arr = [];
    for (var i = 0; i < data.asm.length; i++) {
        var item = data.asm[i];
        if (item.source != null && item.source.line == nbline) {
            console.log(item.text)
            var f = new Format(item.text)
            console.log("opcode", f.bit)
            console.log(" ")
            arr.push(f)
        }
    }
    return arr;
}
//Input:json compile data,line number
//Output: analyzed instruction code
arr = analyze(data, 3)
console.log("Analyzed instructions")
console.log(arr)




/*Simulator
Simulate the output of the MIPS architecture

instruction = {operation:, rs:$2 rt:$sp,addr:}
 case: lw 
 registers[rs] = registers.get(rt)

*/



// function simulate(instr) {
//     console.log(instr);
//     if (instr.operation === "lw") {
//         console.log("set ", instr.rs, r.get(instr.rt))
//         r.set(instr.rs, r.get(instr.rt));
//     } else if (instr.operation === "sw") {
//         // console.log(instr.rt)
//         r.set(instr.rt, r.get(instr.rs));
//     } else if (instr.operation.indexOf("add") != -1) {
//         r.set(instr.rs, r.get(instr.rt) + parseInt(instr.addr));
//     } else {
//         console.log("Irrecognizable operation")
//     }
// }

// console.log(r.values)

// simulate(arr[3])
// console.log(r.values)

// console.log(r.values)