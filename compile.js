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
    "asm": [{ "text": "main:", "source": null }, { "text": "  addiu $sp,$sp,-24", "source": { "file": null, "line": 1 } }, { "text": "  sw $fp,20($sp)", "source": { "file": null, "line": 1 } }, { "text": "  move $fp,$sp", "source": { "file": null, "line": 1 } }, { "text": "  li $2,5 # 0x5", "source": { "file": null, "line": 2 } }, { "text": "  sw $2,8($fp)", "source": { "file": null, "line": 2 } }, { "text": "  lw $2,8($fp)", "source": { "file": null, "line": 3 } }, { "text": "  nop", "source": { "file": null, "line": 3 } }, { "text": "  addiu $2,$2,5", "source": { "file": null, "line": 3 } }, { "text": "  sw $2,8($fp)", "source": { "file": null, "line": 3 } }, { "text": "  move $2,$0", "source": { "file": null, "line": 4 } }, { "text": "  move $sp,$fp", "source": { "file": null, "line": 4 } }, { "text": "  lw $fp,20($sp)", "source": { "file": null, "line": 4 } }, { "text": "  addiu $sp,$sp,24", "source": { "file": null, "line": 4 } }, { "text": "  j $31", "source": { "file": null, "line": 4 } }, { "text": "  nop", "source": { "file": null, "line": 4 } }, { "text": "", "source": null }]
}



/*
Register
get(reg)
set(reg,val)
*/
var Registers;

Registers = function() {
    "use strict";
    this.values = [1, 2, 3, 4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3];

    this.table = ["$zero", "$at", "$v0", "$v1", "$a0", "$a1", "$a2", "$a3",
        "$t0", "$t1", "$t2", "$t3", "$t4", "$t5", "$t6", "$t7",
        "$s0", "$s1", "$s2", "$s3", "$s4", "$s5", "$s6", "$s7",
        "$t8", "$t9",
        "$k0", "$k1", "$gp", "$sp", "$fp", "$ra"
    ]

    this.index = function(r_name) {
        if (this.table.indexOf(r_name) != -1) {
            return this.table.indexOf(r_name);
        } else {
            // console.log(r_name.slice(1))
            return +r_name.slice(1);
        }
        // switch (r_name) {
        //     //Todo: corresponding number
        //     case "$sp":
        //         return 3;
        //         break;
        //     case "$fp":
        //         return 5;
        //         break;
        //     default:
        //         //return the number in the r_name
        //         return +r_name.slice(1);
        // }

    }
    this.parse = function(r_name) {
        if (r_name.indexOf("(") != -1) {
            // console.log("shift", r_name.slice(0, r_name.indexOf("(")))
            // console.log("value", this.values[this.index(r_name.slice(r_name.indexOf("(") + 1, r_name.length - 1))])
            var shifter = parseInt(r_name.slice(0, r_name.indexOf("("))) / 4;
            var nb = this.values[this.index(r_name.slice(r_name.indexOf("(") + 1, r_name.length - 1))];
            // if (shifter + nb >= 30) {
            // console.log("Index greater than 31")
            // }
            return shifter + nb;
        } else {
            return this.values[this.index(r_name)];
        }
    }

    this.get = function(r_name) {
        return this.parse(r_name);
    }
    this.set = function(r_name, value) {
        // console.log(parseString(d_name))
        // console.log("set",r_name,value)
        // console.log(this.parse(r_name))
        this.values[this.index(r_name)] = value
        // if (String(d_name).indexOf('$') != -1) {
        //     console.log(this.parse(d_name))
        //     this.values[this.index(r_name)] = this.parse(d_name);
        // } else {
        //     console.log(this.index(r_name))
        //     this.values[this.index(r_name)] = d_name;
        // }

    }
}


r = new Registers()
// r.set("$1", 5)
// console.log(r.values)

/*
instruction = {operation:, rs:$2 rt:$sp,addr:}
 case: lw 
 registers[rs] = registers.get(rt)

 registers = {$1:,$2,$sp:}
 registers.get("$2")
*/


function recognize(str) {
    if (str.indexOf('#') != -1) {
        str = str.slice(0, str.indexOf('#') - 1)
    }
    var instruction = { operation: null }

    if (str.indexOf(' ') == -1) {
        instruction.operation = str;
        return instruction;
    }
    instruction.operation = str.slice(0, str.indexOf(' '))


    var para = str.slice(str.indexOf(' ') + 1)


    if (para.indexOf(',') != -1) {
        instruction.rs = para.slice(0, para.indexOf(','))
        para = para.slice(para.indexOf(',') + 1)
        if (para.indexOf(',') != -1) {
            instruction.rt = para.slice(0, para.indexOf(','))
            para = para.slice(para.indexOf(',') + 1)
            instruction.addr = para
        } else {
            instruction.rt = para
        }
        ra = para.slice(para.indexOf(',') + 1)

    } else {
        instruction.addr = para
    }

    return instruction
}

function analyze(data, nbline) {
    var arr = [];
    for (var i = 0; i < data.asm.length; i++) {
        var item = data.asm[i];
        if (item.source != null && item.source.line == nbline) {
            console.log(item.text)
            var instruction = recognize(item.text.trim())
            arr.push(instruction)
        }
    }
    return arr;
}
//Input:json compile data,line number
//Output: analyzed instruction code
arr = analyze(data, 3)
console.log("Analyzed instructions")
console.log(arr)





/*Simulator*/
/*
instruction = {operation:, rs:$2 rt:$sp,addr:}
 case: lw 
 registers[rs] = registers.get(rt)

 registers = {$1:,$2,$sp:}
 registers.get("$2")
*/



function simulate(instr) {
    console.log(instr);
    if (instr.operation === "lw") {
        console.log("set ",instr.rs, r.get(instr.rt))
        r.set(instr.rs, r.get(instr.rt));
    } else if (instr.operation === "sw") {
        // console.log(instr.rt)
        r.set(instr.rt, r.get(instr.rs));
    } else if (instr.operation.indexOf("add") != -1) {
        r.set(instr.rs, r.get(instr.rt) + parseInt(instr.addr));
    } else {
        console.log("Irrecognizable operation")
    }
}

console.log(r.values)
// for (var i = 0; i < arr.length; i++) {

simulate(arr[3])
console.log(r.values)
// }

// console.log(r.values)