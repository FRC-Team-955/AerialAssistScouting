// Header for writing files
var header = "TEAM #,A:HIGH HOT,A:HIGH,A:LOW HOT,A:LOW,HIGH,LOW,TRUSS,CATCH,PREF ZONE,BALL PASS,LEGIT PASS,DEFENSIVE,LEGIT DEFENSE,OFFENSIVE,LEGIT OFFENSIVE,BROKEN,GOOD WITH US";
        
// Keyboard keys
var tagKeys = ['1', '2', '3', '4', '5', '6', '7', '8'];
var teleopKeys = [['q', 'a', 'z', 'w', 's', 'x'], ['t', 'g', 'b', 'y', 'h', 'n'], ['o', 'l', '.', 'p', ';', '/']];
var autoKeys = [['q', 'a', 'z', 'w', 's'], ['t', 'g', 'b', 'y', 'h'], ['o', 'l', '.', 'p', ';']];

// Array lengths
var teleopLength = teleopKeys[0].length;
var autoLength = autoKeys[0].length;
var tagLength = tagKeys.length;
var robotLength = 3;
var totalLength = autoLength + teleopLength + tagLength + 2;

// Variables to hold DOM elements
var $teamNames = new Array(robotLength);
var $tags = new Array(robotLength);
var $comments = new Array(robotLength);
var $inputTeleop;
var $inputAuto;
var $matchNumber;

// Contains value in zone
var zones = new Array(robotLength);

// Robot array
var robots = new Array(robotLength);

// Current match number of the match
var matchNumber = 0; 

// Alliance color
var allianceColor = "";

// Master file name
var masterFileName = "MasterScouting.csv";

$(document).ready(function(){
    $("#files").change(getLoadedFiles);
    $("div").click(function(){
        setRadioInDiv(this.id);
    });
    init();
});

// Class to hold all the robot data
function Robot()
{
    this.matchesPlayed = 0;
    this.dataTeleop = new Array(teleopLength);
    this.dataAuto = new Array(autoLength);
    this.dataTag = new Array(tagLength);
    this.comment = "";
    this.teamName = "";
    this.zone = "";
    
    for(var i = 0; i < teleopLength; i++)
        this.dataTeleop[i] = 0;

    for(var i = 0; i < autoLength; i++)
        this.dataAuto[i] = 0;

    for(var i = 0; i < tagLength; i++)
        this.dataTag[i] = false;
}

// Resets all the members in robot
Robot.prototype.reset = function()
{
    this.dataTeleop = new Array(teleopLength);
    this.dataAuto = new Array(autoLength);
    this.dataTag = new Array(tagLength);
    this.comment = "";
    this.teamName = "";
    this.zone = "";
    
    for(var i = 0; i < teleopLength; i++)
        this.dataTeleop[i] = 0;

    for(var i = 0; i < autoLength; i++)
        this.dataAuto[i] = 0;

    for(var i = 0; i < tagLength; i++)
        this.dataTag[i] = false;
};

// Sets the robots properties
Robot.prototype.processData = function(teamName, tagData, comment, zone)
{
    this.teamName = removeCommas(teamName);
    this.comment = removeCommas(comment);
    this.zone = removeCommas(zone);

    for(var dataIndex = 0; dataIndex < tagData.length; dataIndex++)
        for(var keyIndex = 0; keyIndex < tagKeys.length; keyIndex++)
            if(tagData[dataIndex] === tagKeys[keyIndex])
                this.dataTag[dataIndex] = true;
};

// Converts the robots data to a string
Robot.prototype.getString = function()
{
    var ret = "";

    ret += this.teamName + ",";

    for(var i = 0; i < this.dataAuto.length; i++)
        ret += this.dataAuto[i] + ",";

    for(var i = 0; i < this.dataTeleop.length; i++)
        ret += this.dataTeleop[i] + ",";

    ret += this.zone + ",";

    for(var i = 0; i < this.dataTag.length; i++)
        ret  += this.dataTag[i] + ",";

   ret += this.comment + ",";
   
   return ret;
};

// Called when the app is first loaded
function init()
{
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
      // Great success! All the File APIs are supported.
      console.log("sup yo");
    } 
    
    else 
      alert('The File APIs are not fully supported in this browser.');
    
    console.log("init");
    console.log(split(header, ","));
    // Setting the variables to hold all the DOM elements
//    $teamNames = [$("teamName1"), $("teamName2"), $("teamName3")];
//    $tags = [$("tag1"), $("tag2"), $("tag3")];
//    zones = ["NONE", "NONE", "NONE"];
//    $comments = [$("comment1"), $("comment2"), $("comment3")];
//    $inputBoxTeleop = $("inputBoxTeleop");
//    $inputBoxAuto = $("inputBoxAuto");
//    $matchNumberBox = $("matchNumber")
}

// Resets everything
function reset()
{
    for(var i = 0; i < robotLength; i++)
    {
        $teamNames[i].val("Team " + (i + 1));
        $tags[i].val("");
        zones[i] = "NONE";
        $comments[i].val("");
        $inputAuto.val("");
        $inputTeleop.val("");
        
        if(!robots[i])
            robots[i] = new Robot();
        
        robots[i].reset();
    }
    
    resetZones();
}

// Gets all the data, processes it, and saves it
function processInputData()
{
    var inputAuto = $inputAuto.val();
    var inputTeleop = $inputTeleop.val();
    
    for(var inputIndex = 0; inputIndex < inputAuto.length(); inputIndex++)
        for(var robotIndex = 0; robotIndex < robotLength; robotIndex++)
            for(var keyIndex = 0; keyIndex < autoLength; keyIndex++)
                if(inputAuto[inputIndex] === autoKeys[robotIndex][keyIndex])
                    robots[robotIndex].dataAuto[keyIndex]++;
    
    for(var inputIndex = 0; inputIndex < inputTeleop.length(); inputIndex++)
        for(var robotIndex = 0; robotIndex < robotLength; robotIndex++)
            for(var keyIndex = 0; keyIndex < teleopLength; keyIndex++)
                if(inputTeleop[inputIndex] === teleopKeys[robotIndex][keyIndex])
                    robots[robotIndex].dataTeleop[keyIndex]++;
    
    var data = "";
    
    for(var robotIndex = 0; robotIndex < robotLength; robotIndex++)
    { 
        robots[robotIndex].processData($teamNames[robotIndex].val(), $tags[robotIndex].val(), $comments[robotIndex].val(), zones[robotIndex]); // TODO: FIXZ THISZ
        data += robots[robotIndex].getString() + "\n";
    }
    
    writeToFile(data, matchNumber + allianceColor + ".csv");
    reset();
}

// Stringify all data and writes it
function writeToFile(data, fileName)
{
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, fileName);
}

// Reads all files
function getLoadedFiles(evt)
{
    var files = evt.target.files;
    var data = [];
    var filesLoaded = 0;
    var filesLength = files.length;
    
    for (var i = 0, f; (f = files[i]); i++)
    {   
        var reader = new FileReader();

        reader.onload = function()
        {
            data = data.concat(split(this.result, ","));
            
            if(++filesLoaded === filesLength)
                processLoadedData(data);
        };

        reader.readAsText(f);
    }
}

// Process and write to master file
function processLoadedData(data)
{
    var newRobots = [];
    var curRobot = 0;
    
    for(var dataIndex = 0; dataIndex < data.length; dataIndex++)
    {
        if(dataIndex % totalLength === 0)   // Means new robot, we're at the name
        {
            var foundRobot = false;
            
            for(var robotIndex = 0; robotIndex < newRobots.length; robotIndex++)
            {
                if(newRobots[robotIndex].teamName === data[dataIndex])
                {
                    curRobot = robotIndex;
                    foundRobot = true;
                    break;
                }
            }
            
            if(!foundRobot)
            {
                newRobots.push(new Robot());
                curRobot = newRobots.length - 1;
                newRobots[curRobot].teamName = data[dataIndex];
            }
            
            newRobots[curRobot].matches++;
        }
        
        else if(dataIndex % totalLength <= autoLength)
            newRobots.dataAuto[(dataIndex % totalLength) - 1]++;
        
        else if(dataIndex % totalLength <= teleopLength + autoLength)
            newRobots.dataTeleop[(dataIndex % totalLength) - 1]++;
        
        else if(dataIndex % totalLength === autoLength + teleopLength + 1)
            newRobots.zone = data[dataIndex];
        
        else if(dataIndex % totalLength === totalLength - 1)
            newRobots.comment = data[dataIndex];
        
        else
            newRobots.dataTag[data % totalLength] = data[dataIndex];
    }
    
    var data = "";
    
    for(var robotIndex = 0; robotIndex < newRobots.length; robotIndex++)
        data += newRobots[robotIndex].getString + "/n";
    
    writeToFile(data, masterFileName);
}

// Removes commas from strings
function removeCommas(data)
{
    var ret = "";
    
    for(var i = 0; i < data.length; i++)
        if(data[i] !== ',')
            ret += data[i];
    
    return ret;
}

// Resets zones to false
function resetZones()
{
    $('input[name="zone1"]').prop('checked', false);
    $('input[name="zone2"]').prop('checked', false);
    $('input[name="zone3"]').prop('checked', false);
}

// Sets the radio button to true if its parent div has been clicked
function setRadioInDiv(divName)
{
    switch(divName)
    {
        case "blue1": $("#btBlue1").prop("checked", true); break;
        case "white1": $("#btWhite1").prop("checked", true); break;
        case "red1": $("#btRed1").prop("checked", true); break;
            
        case "blue2": $("#btBlue2").prop("checked", true); break;
        case "white2": $("#btWhite2").prop("checked", true); break;
        case "red2": $("#btRed2").prop("checked", true); break;
        
        case "blue3": $("#btBlue3").prop("checked", true); break;
        case "white3": $("#btWhite3").prop("checked", true); break;
        case "red3": $("#btRed3").prop("checked", true); break;
    }
    
    console.log($("#btBlue1").val());
}

// Gets the value of the selected button in specified zone
function getZoneVal(index)
{
    var ret = $("input:radio[name=zone" + (index + 1) + "]:checked").val();
    
    if(ret === "undefined")
        ret = "NONE";
    
    return ret;
}

// Splits the string
function split(str, delim)
{
    var index = 0; 
    var delimIndex = 0;
    var delimLen = delim.length;
    var ret = [];
    
    while((delimIndex = str.indexOf(delim, index)) !== -1)
    {
        if(delimIndex !== index)
            ret.push(str.substring(index, delimIndex));
        
        index = delimIndex + delimLen;
    }
    
    if(index !== str.length)
        ret.push(str.substring(index, str.length));
    
    return ret;
}