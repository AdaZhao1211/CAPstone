function testButtonClicked() {
  // F 2, F 1:0, output, carryon
  renderGateValue(["1", "01", "0", "125"]);

    // renderCUValues([0, 0, 0, 0, 0, 0, 0]);
    // // renderDatapath([3, 102]);
    // //resetButtonClicked()
    // // var i = 4;
    // arr = analyzeall(data)
    // console.log("arr set to ", arr)
    // PROGRAM_COUNTER = 0;
    // MIPS.set(arr[i].bit)
    // MIPS.run()
    // MIPS.print()

    // var r = MIPS.render()
    // renderDatapath(r)


}

function assembleButtonClicked() {

    var editorText = codeEditor.getValue();
    callAssemblyAPI(editorText);
    PROGRAM_COUNTER = 0;
}

function stepButtonClicked() {
    if (PROGRAM_COUNTER < arr.length) {

        resetButtonClicked();
        console.log("counter+", PROGRAM_COUNTER)

        MIPS.set(arr[PROGRAM_COUNTER].bit)
        MIPS.run()
        MIPS.print()

        simulate(arr[PROGRAM_COUNTER]);
        renderRegisterValues(Registers.getRegs())

        var r = MIPS.renderpaths()
        renderDatapath(r)

        var n = MIPS.rendernums()
        console.log("nums", n)
        renderCUValues(n)
        PROGRAM_COUNTER++;

        divIndex++;
        renderAssemblyHighlight(divIndex)

        renderGateDatapath(ALU.render())
        renderGateValue(ALU.render_value())

    } else {
        alert("pc!")
    }
}

function resetButtonClicked() {
    $("#svgTemp").children().remove();
    resetRegisterDivs();
    renderCUValues(['', '', '', '', '', '', '']);
    // PROGRAM_COUNTER = 0;

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
            //ada display assembly code on screen
            //undefined
            var resultString = "";
            for (var i = 0; i < result.asm.length; i++) {
                // if (result.asm[i].text != null) {
                if (result.asm[i].text) {
                    returnString = result.asm[i].text
                    tempstring = returnString.replace(/ /g, '');
                    if (tempstring != "nop") {
                        resultString += result.asm[i].text;
                        resultString += "\n";
                    }
                }
            }
            assemblyEditor.setValue(resultString);
            arr = analyzeall(result);
        }
    })
}


function renderGateValue(gateValues){
  var gateText = $("#gateText").children();
  for(var i = 0; i < gateValues.length; i++){
    gateText[i].innerHTML = gateValues[i];
  }

}
function renderAssemblyHighlight(divIndex){
  codeDivs = $('#assemblyEditor .CodeMirror-code').children();
  console.log(codeDivs);
  codeDivs.css("background-color", "white");
  $(codeDivs[divIndex]).css("background-color", "#FFF70A")
}

function renderRegisterFile(registerNumber, registerValue) {
    var registerFile = $("#registerFile").children()[registerNumber];
    drawSVGRect(registerFile.x.animVal.value, registerFile.y.animVal.value, registerFile.width.animVal.value, registerFile.height.animVal.value);
    var registerDiv = $(".svgDiv").children()[registerNumber];
    registerDiv.innerHTML = registerValue;
}

function renderRegisterValues(registerValues) {
    var registerDiv = $(".register");
    for (var i = 0; i < registerDiv.length; i++) {
        registerDiv[i].innerHTML = registerValues[i];
    }
}

function renderDatapath(datapathArray) {
    for (var i = 0; i < datapathArray.length; i++) {
        var datapathIndex = datapathArray[i];
        if (datapathIndex > 99) {
            datapathIndex %= 100;
            forDatapathPoly("polylines", "svgTemp", datapathIndex);
        } else {
            forDatapath("lines", "svgTemp", datapathIndex);
        }
    }
}

function forDatapath(divID, renderID, lineindex) {
    var datapath = $("#" + divID).children()[lineindex];
    drawSVGLine(renderID, datapath.x1.animVal.value, datapath.y1.animVal.value, datapath.x2.animVal.value, datapath.y2.animVal.value)
}

function forDatapathPoly(divID, renderID, polyindex) {
    var datapath = $("#" + divID).children()[polyindex].points;
    //console.log(datapath);
    var datapoints = '';
    for (var i = 0; i < datapath.length; i++) {
        datapoints += datapath[i].x;
        datapoints += ",";
        datapoints += datapath[i].y;
        datapoints += " ";
    }
    drawSVGPolyline(renderID, datapoints);
    //drawSVGPolyline("20,30 400,200 300,100");
}

function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function renderGateDatapath(datapathArray) {
    for (var i = 0; i < datapathArray.length; i++) {
        var datapathIndex = datapathArray[i];
        if (datapathIndex > 99) {
            datapathIndex %= 100;
            forDatapathPoly("gatePoly", "gateTemp", datapathIndex);
        } else {
            forDatapath("gateLine", "gateTemp", datapathIndex);
        }
    }
}

function drawSVGPolyline(ID, datapoints) {
    var $svg = $("#" + ID);
    $(SVG('polyline'))
        .attr('points', datapoints)
        .attr('stroke', "red")
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('stroke-miterlimit', 10)
        .appendTo($svg);
}

function drawSVGLine(ID, x1, y1, x2, y2) {
    var $svg = $("#" + ID);
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

function renderCUValues(CUValues) {
    var t = $(".CU");
    for (var i = 0; i < 7; i++) {
        t[i].innerHTML = CUValues[i];
    }
}

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
    var divPosX = [315, 455, 495, 529, 602, 671, 800]
    var divPosY = [209, 412, 319, 257, 169, 255, 345]
    for (var i = 0; i < 7; i++) {
        var myX = $(window).width() * 0.3 + divPosX[i];
        var myY = 55 + divPosY[i];
        $("<div/>", {
            "class": "CU",
            text: "",
            style: "position:absolute; left:" + myX + "px; top:" + myY + "px; width:30px;"
        }).appendTo(svgContainer);
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
