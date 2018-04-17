String.prototype.getbit = function(st, ed) {
    return this.substring(31 - st, 32 - ed);
}


var RegisterFile = {
    A1: null,
    A2: null,
    A3: null,
    WD3: null,
    WE3: null,
    RD1: null,
    RD2: null,

    set: function(prop, val) {
        //TODO:optimization and dynamics
        var flag = false;
        if (["A1", "A2", "A3", "WD3", "WE3"].indexOf(prop) != -1) {
            this[prop] = val;
            if (prop != "WD3" & prop != "WE3") {
                flag = true;
            }
        }

        //If valid change, update output
        if (flag) {
            this.update();
        }
    },

    update: function() {
        this.RD1 = Registers.get(parseInt(this.A1, 2));
        this.RD2 = Registers.get(parseInt(this.A2, 2));
        if (this.RD2 != undefined) {
            MUX2.set("D0", this.RD2);
        }
        if (this.RD1 != undefined) {
            ALU.set("sa", this.RD1);
        }
        if (this.RD2 != undefined) {
            DataMemory.set("WD", this.RD2);
        }


    },

    run: function() {
        // this.RD1 = Registers.get(parseInt(this.A1, 2));
        // this.RD2 = Registers.get(parseInt(this.A2, 2));
        if (!Number.isInteger(this.A3)) {
            this.A3 = parseInt(this.A3, 2);
        }
        if (this.WE3 == 1) {
            //RegWrite
            Registers.set(this.A3, this.WD3);
        }
    },

    print: function() {
        console.log("RegisterFile")
        console.log("A1, A2, A3, WD3, WE3, RD1, RD2")
        console.log(this.A1, this.A2, this.A3, this.WD3, this.WE3, this.RD1, this.RD2)
        console.log("----------")

        // var render_paths = {
        //     PATH: [0, 1, 2],
        //     POLY: []
        // }

        // if (this.WE3 == 1) {
        //     //Light up write path
        // }

        // return render_paths;

    }
}

var DataMemory = {
    A: null,
    WD: null,
    WE: null,
    RD: null,
    memory: { "100000": 20 },

    clear: function() {
        this.A = null;
        this.WD = null;
        this.WE = null;
        this.RD = null;

    },

    set: function(prop, val) {
        var flag = false;
        if (["A", "WD", "WE"].indexOf(prop) != -1) {
            DataMemory[prop] = val;
            if (prop == "A") {
                flag = true;

            }
        }
        if (flag) {
            DataMemory.update()
        }

    },

    update: function() {
        this.RD = this.A;
        MUX3.set("D1", this.RD)
    },

    // set: function(A, WD, WE) {
    //     this.A = A;
    //     this.WD = WD;
    //     this.WE = WE;
    // },

    run: function() {
        if (this.WE == 1) {
            //Writes WD into address A
            // Registers.set(Registers.get(this.RD), Registers.get(this.A))

            this.memory[this.A] = this.WD

        } else if (this.WE == 0) {
            //Reads address A onto RD
            // Registers.set(this.RD, Registers.get(this.A))

            this.RD = this.memory[this.A] | 0
        }
        return this.RD
    },
    print: function() {
        console.log("DataMemory")
        console.log("A, WD, WE, RD")
        console.log(this.A, this.WD, this.WE, this.RD)
        console.log("----------")

        // var render_paths = {
        //     PATH: [],
        //     POLY: []
        // }

        // if (this.WE == 1) {
        //     render_paths.PATH = [10];
        //     render_paths.POLY = [4]
        // } else if (this.WE == 0) {
        //     render_paths.PATH = [9, 10];
        //     render_paths.POLY = []
        // }

        // return render_paths;
    }

}

var SignExtend = {
    // TODO: sign extension
    input: null,
    output: null,

    set: function(num) {
        this.input = num
        this.update()
    },
    update: function() {
        // this.output = this.input
        this.run()
//         int main(){
//   int x = 5;
// }
        console.log("SignExtend", this.output)
        MUX2.set("D1", this.output)
    },
    run: function() {
        pre = String(this.input.charAt(0))
        this.output = this.input
        for (var i = 0; i < 15; i++) {
            this.output = pre + this.output
        }
        // this.output = this.input
        return this.output
    },

    print: function() {
        console.log("SignExtend")
        console.log("Input:", this.input)
        console.log("Output", this.output)
        console.log("----------")
    }
}


var ControlUnit = {
    //Inputs
    opcode: null,
    func: null,

    //Outputs
    RegWrite: null,
    RegDst: null,
    ALUSrc: null,
    Branch: null,
    MemWrite: null,
    MemtoReg: null,
    ALUOp: null,
    Jump: null,
    ALUControl: null,

    setALUCon: function(func) {
        this.opcode = String(this.opcode)
        var aluop = String(digi(this.opcode.getbit(1, 0), 2))
        if (aluop == "00") {
            //add
            return "010";
        } else if (aluop.charAt(1) == "1") {
            //substract
            return "110";
        } else if (aluop.charAt(1) == "0") {
            if (func == "100000") {
                //add
                return "010"
            } else if (func == "100010") {
                //substract
                return "110"
            } else if (func == "100100") {
                //and
                return "000"
            } else if (func == "100101") {
                //or
                return "001"
            } else if (func == "101010") {
                //slt
                return "111"
            }
        }
        return null;
    },

    set: function(opcode, func) {
        this.opcode = opcode;
        this.func = func;
        this.run();
        this.update();

    },

    update: function() {
        RegisterFile.set("WE3", this.RegWrite);
        MUX1.set("S", this.RegDst);
        MUX2.set("S", this.ALUSrc);
        this.ALUControl = this.setALUCon(this.func);
        ALU.set("control", this.ALUControl)
        DataMemory.set("WE", this.MemWrite)
        MUX3.set("S", this.MemtoReg)

    },

    run: function() {
        if (this.opcode === "000000") {
            this.RegWrite = 1;
            this.RegDst = 1;
            this.ALUSrc = 0;
            this.Branch = 0;
            this.MemWrite = 0;
            this.MemtoReg = 0;
            this.ALUOp = "10";
            this.Jump = 0;
            this.ALUControl = this.setALUCon(this.func)

        } else if (this.opcode === "100011") {
            //lw
            this.RegWrite = 1;
            this.RegDst = 0;
            this.ALUSrc = 1;
            this.Branch = 0;
            this.MemWrite = 0;
            this.MemtoReg = 1;
            this.ALUOp = "00";
            this.Jump = 0;
            this.ALUControl = this.setALUCon(this.func)
        } else if (this.opcode === "101011") {
            //sw
            this.RegWrite = 0;
            this.RegDst = null;
            this.ALUSrc = 1;
            this.Branch = 0;
            this.MemWrite = 1;
            this.MemtoReg = null;
            this.ALUOp = "00";
            this.Jump = 0;
            this.ALUControl = this.setALUCon(this.func)
        } else if (this.opcode === "000100") {
            //beq
            this.RegWrite = 0;
            this.RegDst = null;
            this.ALUSrc = 0;
            this.Branch = 1;
            this.MemWrite = 0;
            this.MemtoReg = null;
            this.ALUOp = "01";
            this.Jump = 0;
            this.ALUControl = this.setALUCon(this.func)
        } else if (this.opcode === "001000") {
            //addi
            this.RegWrite = 1;
            this.RegDst = 0;
            this.ALUSrc = 1;
            this.Branch = 0;
            this.MemWrite = 0;
            this.MemtoReg = 0;
            this.ALUOp = "00";
            this.Jump = 0;
            this.ALUControl = this.setALUCon(this.func)
        } else if (this.opcode === "000010") {
            //j
            this.RegWrite = 0;
            this.RegDst = null;
            this.ALUSrc = null;
            this.Branch = null;
            this.MemWrite = 0;
            this.MemtoReg = null;
            this.ALUOp = null;
            this.Jump = 1;
            this.ALUControl = this.setALUCon(this.func)
        }

    },
    print: function() {
        console.log("Control Unit");
        console.log(this)
        console.log("----------")
    }
}

function Multiplexer() {
    this.D0 = null;
    this.D1 = null;
    this.S = null;
    this.Y = null;
    this.subject = {}; //Output Components:Ports
}

Multiplexer.prototype.set = function(prop, val) {
    //TODO:optimization and dynamics
    var flag = false;

    if (["D0", "D1", "S"].indexOf(prop) != -1) {
        this[prop] = val;
        flag = true;
    }

    //If valid change, update output
    if (flag) {
        this.update();
    }
}

Multiplexer.prototype.update = function() {
    var output = null;
    if (!Number.isInteger(this.D0)) {
        this.D0 = parseInt(this.D0, 2)
    }
    if (!Number.isInteger(this.D1)) {
        this.D1 = parseInt(this.D1, 2)
    }

    if (this.S == 0) {
        output = this.D0;
    } else if (this.S == 1) {
        output = this.D1;
    } else {
        //If S == null
        output = 0;
    }
    this.Y = output

    for (var key in this.subject) {
        if (key == "RegisterFile") {
            RegisterFile.set(this.subject[key], this.Y)
        } else if (key == "ALU") {
            ALU.set(this.subject[key], this.Y)
        }
    }

    return output;


}

Multiplexer.prototype.print = function() {
    console.log("Multiplexer")
    console.log(this)
    console.log("----------")
}

var MUX1 = new Multiplexer()
var MUX2 = new Multiplexer()
var MUX3 = new Multiplexer()

MUX1.subject = { RegisterFile: "A3" }
MUX2.subject = { ALU: "sb" }
MUX3.subject = { RegisterFile: "WD3" }



var ALU = {
    sa: undefined,
    sb: undefined,
    control: undefined,
    zero: undefined,
    output: undefined,

    set: function(prop, val) {
        if (["sa", "sb", "control"].indexOf(prop) != -1) {
            this[prop] = val;
            this.update();
        }
    },

    update: function() {
        var r = this.run();
        if (r != null) {
            DataMemory.set("A", this.output)
            MUX3.set("D0", this.output)
        }

    },

    run: function() {
        // console.log("sa sb", this.sa, this.sb)
        if (this.sa == undefined || this.sb == undefined || this.control == undefined) {
            return null
        }
        if (!Number.isInteger(this.sa)) {
            this.sa = parseInt(this.sa, 2)
        }
        if (!Number.isInteger(this.sb)) {
            // console.log("sb",this.sb)
            // this.sb = this.sb.slice(15)
            // if (this.sb.charAt(0) == '1') {
            //     this.sb = '0' + this.sb.slice(1)
            //     this.sb = parseInt(this.sb, 2)
            //     this.sb = -this.sb
            // } else {
                this.sb = parseInt(this.sb, 2)
            // }
        }
        // this.sb = parseInt(this.sb, 2)
        if (this.control === "000") {
            //AND
            this.output = this.sa & this.sb;
        } else if (this.control === "001") {
            //OR
            this.output = this.sa | this.sb;
        } else if (this.control === "010") {
            //Add
            this.output = this.sa + this.sb;
        } else if (this.control === "110") {
            //Sub
            this.output = this.sa - this.sb;
        } else if (this.control === "111") {
            this.output = (this.sa < this.sb) ? 1 : 0
        }
        this.zero = (this.output == 0)
        if (this.output == undefined) {
            return undefined
        }
        return this.output.toString(2);

    },

    print: function() {
        console.log("ALU")
        console.log("sa, sb, control, output")
        console.log(this.sa, this.sb, this.control, this.output)
        console.log("----------")
        // var render_paths = {
        //     PATH: [7, 8, 10],
        //     POLY: []
        // }

        // return render_paths;
    }

}


var MIPS = {
    //For lw
    code: null,


    set: function(code) {
        code = String(code);
        this.code = code;
        console.log(code)
        ControlUnit.set(code.getbit(31, 26), code.getbit(5, 0))

        RegisterFile.set("A1", code.getbit(25, 21));
        RegisterFile.set("A2", code.getbit(20, 16));

        MUX1.set("D0", code.getbit(20, 16));
        MUX1.set("D1", code.getbit(15, 11));

        SignExtend.set(code.getbit(15, 0));


    },

    run: function() {
        RegisterFile.run()
        DataMemory.run()

    },

    print: function() {
        ControlUnit.print()
        RegisterFile.print()
        MUX1.print()
        SignExtend.print()
        MUX2.print()
        ALU.print()
        DataMemory.print()
        MUX3.print()
        console.log(Registers.getRegs())
        console.log(DataMemory.memory)
    },

    renderpaths: function() {
        var paths = [];
        paths.push(5);
        if (MUX3.S != null && MUX3.S != undefined) {
            paths.push(101);
            if (MUX3.S == 0) {
                paths.push(103)

            } else if (MUX3.S == 1) {
                paths.push(3)
                paths.push(4)
            }
        }



        if (DataMemory.WE == 1) {
            paths.push(104)
            paths.push(4)
        }
        paths.push(1)
        paths.push(2)
        if (MUX2.S == 0) {
            paths.push(0)
        } else if (MUX2.S == 1) {
            paths.push(102)
            paths.push(110)
        }
        if (MUX1.S != null && MUX1.S != undefined) {
            paths.push(100);
            if (MUX1.S == 0) {
                paths.push(108)
            } else if (MUX1.S == 1) {
                paths.push(109)
            }
        }
        if (RegisterFile.WE == 0) {
            if (paths.indexOf(100) != -1) {
                paths.splice(paths.indexOf(100), 1)
            }
            if (paths.indexOf(101) == 0) {
                paths.splice(paths.indexOf(101), 1)
            }
        }
        paths.push(105)
        paths.push(106)
        paths.push(6)
        console.log("Paths", paths)
        return paths

    },

    rendernums: function() {
        var nums = [];
        var props = ["RegWrite", "RegDst", "ALUSrc", "ALUControl", "Branch", "MemWrite", "MemtoReg", "Jump"]
        for (var i in props) {
            var e = props[i]
            console.log(e, ":", ControlUnit[e])
            if (ControlUnit[e] == null) {
                nums.push('X');
            } else {
                nums.push(ControlUnit[e])
            }
        }
        return nums;
    }
}


// console.log("lw $2,8($fp)")
// console.log(Registers.values)
// MIPS.set("10001111110000100000000000000010")
// MIPS.run()
// console.log(Registers.values)