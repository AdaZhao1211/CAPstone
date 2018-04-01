var RegisterFile = {
    A1: null,
    A2: null,
    A3: null,
    WD3: null,
    WE3: null,
    RD1: null,
    RD2: null,

    run: function() {
        this.RD1 = Registers.get(parseInt(this.A1, 2));
        this.RD2 = Registers.get(parseInt(this.A2, 2));

        this.A3 = parseInt(this.A3, 2);
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

        var render_paths = {
            PATH: [0, 1, 2],
            POLY: []
        }

        if (this.WE3 == 1) {
            //Light up write path
        }

        return render_paths;

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
    set: function(A, WD, WE) {
        this.A = A;
        this.WD = WD;
        this.WE = WE;
    },

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

        var render_paths = {
            PATH: [],
            POLY: []
        }

        if (this.WE == 1) {
            render_paths.PATH = [10];
            render_paths.POLY = [4]
        } else if (this.WE == 0) {
            render_paths.PATH = [9, 10];
            render_paths.POLY = []
        }

        return render_paths;
    }

}

var SignExtend = {
    // TODO: sign extension
    input: null,
    output: null,

    set: function(num) {
        this.input = num
    },
    run: function() {
        this.output = this.input
        return this.output
    },

    print: function() {
        var render_paths = {
            PATH: [5],
            POLY: [2]
        }
        return render_paths;
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
        return "";
    }

    set: function(opcode, func) {
        this.opcode = opcode;
        this.func = func;

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

        }else if(this.opcode === "100011"){
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
        }else if(this.opcode === "101011"){
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
        }else if(this.opcode === "000100"){
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
        }else if(this.opcode === "001000"){
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
        }else if(this.opcode === "000010"){
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
    }
}

function Multiplexer(){
    this.D0 = null;
    this.D1 = null;
    this.S = null;
    this.Y = null;
}
Multiplexer.prototype.run = function(){
    if(this.S == 0){
        return this.D0;
    }else if(this.S == 1){
        return this.D1;
    }
}

var MUX1 = new Multiplexer()
var MUX2 = new Multiplexer()
var MUX3 = new Multiplexer()


var ALU = {
    sa: null,
    sb: null,
    control: null,
    zero: null,
    output: null,

    run: function() {
        this.sa = parseInt(this.sa, 2)
        this.sb = parseInt(this.sb, 2)
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
        return this.output.toString(2);

    },

    print: function() {
        console.log("ALU")
        console.log("sa, sb, control, output")
        console.log(this.sa, this.sb, this.control, this.output)
        console.log("----------")
        var render_paths = {
            PATH: [7, 8, 10],
            POLY: []
        }

        return render_paths;
    }

}


var MIPS = {
    //For lw
    code: null,
    set: function(code) {
        this.code = code
        RegisterFile.A1 = code.substring(6, 11)
        RegisterFile.A3 = code.substring(11, 16)
        RegisterFile.WE3 = 1;

        // RegisterFile.print()

        ALU.sa = RegisterFile.A1;

        SignExtend.set(code.substring(16, 32))

        ALU.sb = SignExtend.run()

        // ALU.sb = SignExtend(code.substring(16, 32))
        ALU.control = "010";



        DataMemory.WE = 0
        DataMemory.A = ALU.run()

        ALU.print()

        RegisterFile.WD3 = DataMemory.run()

        // RegisterFile.print()
        // ALU.print()
        // DataMemory.print()
    },

    run: function() {

        resetPaths();

        var paths = [];
        var polys = [];

        RegisterFile.run()

        RegisterFile.print()

        var result = RegisterFile.print();
        paths = paths.concat(result.PATH);
        polys = polys.concat(result.POLYS);

        var result = ALU.print();
        console.log(result.PATH)
        paths = paths.concat(result.PATH);
        polys = polys.concat(result.POLY);


        var result = SignExtend.print();
        paths = paths.concat(result.PATH);
        polys = polys.concat(result.POLYS);

        var result = DataMemory.print();
        paths = paths.concat(result.PATH);
        polys = polys.concat(result.POLYS);

        console.log("PATHS", paths)
        console.log("POLYS", polys)



        for (var i = 0; i < paths.length; i++) {
            console.log(paths[i])
            renderDatapath(paths[i])
        }


        for (var i = 0; i < polys.length; i++) {
            renderDatapathPoly(polys[i])
        }


        // RegisterFile.print()
    }
}


// console.log("lw $2,8($fp)")
// console.log(Registers.values)
// MIPS.set("10001111110000100000000000000010")
// MIPS.run()
// console.log(Registers.values)