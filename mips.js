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

         var render_paths = {
            PATH: [0,1,2],
            POLY: []
        }
        return render_paths
        
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