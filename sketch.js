function testButtonClicked(){

  renderRegisterFile(3, 21);

}

function assembleButtonClicked(){

    var editorText = codeEditor.getValue();
    callAssemblyAPI(editorText);
}

function stepButtonClicked(){
  var b = document.getElementById("square");
  for(var i = 0; i <b.children.length; i++){
    b.children[i].style.stroke = "red";
  }
}

function resetButtonClicked(){
  d3.select("#svgTemp").remove();
  resetRegisterDivs();

}

function callAssemblyAPI(editorText){
  var url = "https://godbolt.org/api/compiler/mips5/compile";
  var myJSON = {
    "source":editorText,
    "compiler":"mips5",
    "options":{
      "userArguments":"",
      "compilerOptions":{
        "produceGccDump":{},
        "produceCfg":false
      },
      "filters":{
        "binary":false,
        "execute":false,
        "labels":true,
        "directives":true,
        "commentOnly":true,
        "trim":true,
        "intel":true,
        "demangle":true
      }
    },
    "lang":"c++"
  }

  //call assembly language api
  $.ajax({
    type: "POST",
    contentType: "application/json",
    url: url,
    dataType:"json",
    data: JSON.stringify(myJSON),
    success: function(result){
      console.log(result);
      console.log(result.asm);
      var resultString = "";
      for(var i = 0; i < result.asm.length; i++){
        resultString +=result.asm[i].text;
        resultString += "\n";
      }
      assemblyEditor.setValue(resultString);
    }
  })
}

function renderRegisterFile(registerNumber, registerValue){
  var frame = $("#registerFrame").children()[0];
  console.log(frame.width);
  drawSVGRect(frame.x.animVal.value, frame.y.animVal.value, frame.width.animVal.value, frame.height.animVal.value);


  var registerFile = $("#registerFile").children()[registerNumber];
  drawSVGRect(registerFile.x.animVal.value, registerFile.y.animVal.value, registerFile.width.animVal.value, registerFile.height.animVal.value);
  var registerDiv = $(".svgDiv").children()[registerNumber];
  registerDiv.innerHTML = registerValue;
}

function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function drawSVGRect(x,y,w,h) {
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

function createRegisterDivs(){
  var registerFile = document.getElementById("registerFile");
  var startX = $( window ).width()*0.3 + 10+registerFile.children[0].x.animVal.value;
  var startY = 62+registerFile.children[0].y.animVal.value;
  var svgContainer = $(".svgDiv");
  for(var i = 7; i >= 0; i--){
    for(var j = 3; j >= 0; j--){
      var myX = startX + j*40;
      var myY = startY + i*20;
      $("<div/>",{
        "class": "register",
        text: "000",
        style: "position:absolute; left:"+myX+"px; top:"+myY+"px; width:30px;"
      }).prependTo(svgContainer);
    }
  }
}

function resetRegisterDivs(){
  var svgContainer = $(".svgDiv").children();
  for(var i = 0; i < svgContainer.length; i++){
    svgContainer[i].innerHTML = "000";
  }
}


$(document).ready(function(){
  console.log("ready!");
  createRegisterDivs();
})
