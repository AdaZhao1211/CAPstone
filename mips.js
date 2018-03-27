var RegisterFile = {
    A1: null,
    A2: null,
    A3: null,
    WD3: null,
    WE3: null,
    RD1: null,
    RD2: null,

    run: function() {
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
    }
}

var DataMemory = {
    A: null,
    WD: null,
    WE: null,
    RD: null,
    memory: {"100000":20},

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
    }

}

function SignExtend(num) {
    // TODO: sign extension
    return num
}


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

    print:function(){
        console.log("ALU")
        console.log("sa, sb, control, output")
        console.log(this.sa, this.sb, this.control, this.output)
        console.log("----------")
    }

}


var MIPS = {
    //For lw
    set: function(code) {

        RegisterFile.A1 = code.substring(6, 11)
        RegisterFile.A3 = code.substring(11, 16)
        RegisterFile.WE3 = 1;

        RegisterFile.print()

        ALU.sa = RegisterFile.A1;
        ALU.sb = SignExtend(code.substring(16, 32))
        ALU.control = "010";



        DataMemory.WE = 0
        DataMemory.A = ALU.run()

        ALU.print()

        RegisterFile.WD3 = DataMemory.run()

        RegisterFile.print()
        ALU.print()
        DataMemory.print()
    },
    run: function() {
        RegisterFile.run()
        RegisterFile.print()
    }
}


console.log("lw $2,8($fp)")
console.log(Registers.values)
MIPS.set("10001111110000100000000000000010")
MIPS.run()
console.log(Registers.values)