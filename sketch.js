function testButtonClicked() {

    // renderDatapath([3, 102]);
    resetButtonClicked()
    // var i = 4;
    arr = analyzeall(data)

    // MIPS.set(arr[i].bit)
    // MIPS.run()
    // MIPS.print()

    // var r = MIPS.render()
    // renderDatapath(r)


}

function assembleButtonClicked() {

    var editorText = codeEditor.getValue();
    callAssemblyAPI(editorText);
}

function stepButtonClicked() {
    if (PROGRAM_COUNTER < arr.length) {

        resetButtonClicked();

        MIPS.set(arr[PROGRAM_COUNTER].bit)
        MIPS.run()
        MIPS.print()

        var r = MIPS.render()
        renderDatapath(r)


        simulate(arr[PROGRAM_COUNTER]);
        renderRegisterValues(Registers.getRegs())
        PROGRAM_COUNTER++;
    } else {
        alert("pc!")
    }
}

function resetButtonClicked() {
    $("#svgTemp").children().remove();
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

            arr = analyze(result, 2);
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

function renderRegisterFile(registerNumber, registerValue) {
    var registerFile = $("#registerFile").children()[registerNumber];
    drawSVGRect(registerFile.x.animVal.value, registerFile.y.animVal.value, registerFile.width.animVal.value, registerFile.height.animVal.value);
    var registerDiv = $(".svgDiv").children()[registerNumber];
    registerDiv.innerHTML = registerValue;
}

function renderRegisterValues(registerValues) {
    var registerDiv = $(".svgDiv").children();
    for (var i = 0; i < registerDiv.length; i++) {
        registerDiv[i].innerHTML = registerValues[i];
    }
}

function renderDatapath(datapathArray) {
    for (var i = 0; i < datapathArray.length; i++) {
        var datapathIndex = datapathArray[i];
        if (datapathIndex > 99) {
            datapathIndex %= 100;
            forDatapathPoly(datapathIndex);
        } else {
            forDatapath(datapathIndex);
        }
    }
}

function forDatapath(lineindex) {
    var datapath = $("#lines").children()[lineindex];
    drawSVGLine(datapath.x1.animVal.value, datapath.y1.animVal.value, datapath.x2.animVal.value, datapath.y2.animVal.value)
}

function forDatapathPoly(polyindex) {
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
        .attr('stroke-width', 3)
        .attr('stroke-miterlimit', 10)
        .appendTo($svg);
};

function drawSVGPolyline(datapoints) {
    var $svg = $("#svgTemp");
    $(SVG('polyline'))
        .attr('points', datapoints)
        .attr('stroke', "red")
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('stroke-miterlimit', 10)
        .appendTo($svg);
}

function drawSVGLine(x1, y1, x2, y2) {
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