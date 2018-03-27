

var instruction_micro = null;

//Use for microstep 
function testButtonClicked() {
    //renderRegisterValues(3, 21);
    // for(var i = 0; i<arr.length; i++){
    //     if(arr[i].op === "lw"){
    //         MIPS.set(arr[i].bit)
    //         break;
    //     }
    // }

    // var f = new Format("lw $2,8($fp)")
    // MIPS.set(f.bit)
    // console.log(MIPS.code)

    MIPS.run();


}

function assembleButtonClicked() {

    var editorText = codeEditor.getValue();
    callAssemblyAPI(editorText);
}

function stepButtonClicked() {
    console.log(arr);
    if (PROGRAM_COUNTER < arr.length) {
        var changed_registers = simulate(arr[PROGRAM_COUNTER]);

        instruction_micro = arr[PROGRAM_COUNTER];
        MIPS.set(instruction_micro.bit)

        console.log("Step: ", instruction_micro.instr)
        if(instruction_micro.op === "lw"){
            console.log("Render: ",instruction_micro.instr)
            testButtonClicked()
        }


        var values = Registers.getRegs();
        console.log(changed_registers)
        console.log(changed_registers["READ"])

        for (var i = 0; i < changed_registers.READ.length; i++) {
            var index = changed_registers.READ[i]
            //Ada TODO:  render changed_registers
            renderRegisterFile(index, values[index])
        }

        for (var i = 0; i < changed_registers.WRITE.length; i++) {
            var index = changed_registers.WRITE[i]
            //Ada TODO:  render changed_registers
            renderRegisterFile(index, values[index])
        }

        // renderRegisterValues()
        PROGRAM_COUNTER++;
    } else {
        alert("pc!")
    }
}

function resetPaths(){
    // Reset paths
    $("#svgTemp").children().remove();
}

function resetButtonClicked() {
    resetPaths();

    // Reset numbers
    resetRegisterDivs();

}

function callAssemblyAPI(editorText) {
    var url = "https://godbolt.org/api/compiler/mips5/compile";
    var myJSON = {
        "source": editorText,
        "compiler": "mips5",
        "options": {
            "userArguments": "",
            "compilerOptions": {
                "produceGccDump": {},
                "produceCfg": false
            },
            "filters": {
                "binary": false,
                "execute": false,
                "labels": true,
                "directives": true,
                "commentOnly": true,
                "trim": true,
                "intel": true,
                "demangle": true
            }
        },
        "lang": "c++"
    }

    //call assembly language api
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: url,
        dataType: "json",
        data: JSON.stringify(myJSON),
        success: function(result) {
            //pru!
            console.log(result);
            console.log(result.asm);

            // arr = analyze(result, 2);
            arr = analyzeall(result)
            //ada display assembly code on screen
            var resultString = "";
            for (var i = 0; i < result.asm.length; i++) {
                resultString += result.asm[i].text;
                resultString += "\n";
            }
            assemblyEditor.setValue(resultString);
        }
    })
}

//@Input: the index of register, and its value
//Change one register's value
function renderRegisterFile(registerNumber, registerValue) {
    var registerFile = $("#registerFile").children()[registerNumber];
    drawSVGRect(registerFile.x.animVal.value, registerFile.y.animVal.value, registerFile.width.animVal.value, registerFile.height.animVal.value);
    var registerDiv = $(".svgDiv").children()[registerNumber];
    registerDiv.innerHTML = registerValue;
}

//@Input: Array of values
//Change register values
function renderRegisterValues(registerValues) {
    var registerDiv = $(".svgDiv").children();
    for (var i = 0; i < registerDiv.length; i++) {
        registerDiv[i].innerHTML = registerValues[i];
    }
}

//Highlight a path
function renderDatapath(lineindex) {
    console.log("render Datapath", lineindex)
    var datapath = $("#lines").children()[lineindex];
    drawSVGLine(datapath.x1.animVal.value, datapath.y1.animVal.value, datapath.x2.animVal.value, datapath.y2.animVal.value)
}

//Highlight a polypath
function renderDatapathPoly(polyindex) {
    var datapath = $("#polylines").children()[polyindex].points;
    //console.log(datapath);
    var datapoints = '';
    for (var i = 0; i < datapath.length; i++) {
        datapoints += datapath[i].x;
        datapoints += ",";
        datapoints += datapath[i].y;
        datapoints += " ";
    }
    drawSVGPolyline(datapoints);
    //drawSVGPolyline("20,30 400,200 300,100");


}



function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function drawSVGRect(x, y, w, h) {
    var $svg = $("#svgTemp");
    $(SVG('rect'))
        .attr('x', x)
        .attr('y', y)
        .attr('width', w)
        .attr('height', h)
        .attr('fill', "none")
        .attr('stroke', "red")
        .attr('stroke-miterlimit', 10)
        .appendTo($svg);
};

function drawSVGPolyline(datapoints){
  var $svg = $("#svgTemp");
  $(SVG('polyline'))
      .attr('points', datapoints)
      .attr('stroke', "red")
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr('stroke-miterlimit', 10)
      .appendTo($svg);
}

function drawSVGLine(x1,y1,x2,y2) {
        var $svg = $("#svgTemp");
        $(SVG('line'))
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', "red")
            .attr('stroke-miterlimit', 10)
            .attr('stroke-width', 3)
            .appendTo($svg);
};


function createRegisterDivs() {
    var registerFile = document.getElementById("registerFile");
    var startX = $(window).width() * 0.3 + 10 + registerFile.children[0].x.animVal.value;
    var startY = 62 + registerFile.children[0].y.animVal.value;
    var svgContainer = $(".svgDiv");
    for (var i = 7; i >= 0; i--) {
        for (var j = 3; j >= 0; j--) {
            var myX = startX + j * 40;
            var myY = startY + i * 20;
            $("<div/>", {
                "class": "register",
                text: "000",
                style: "position:absolute; left:" + myX + "px; top:" + myY + "px; width:30px;"
            }).prependTo(svgContainer);
        }
    }
}

function resetRegisterDivs() {
    var svgContainer = $(".svgDiv").children();
    for (var i = 0; i < svgContainer.length; i++) {
        svgContainer[i].innerHTML = "000";
    }
}


$(document).ready(function() {
    console.log("ready!");
    createRegisterDivs();
})