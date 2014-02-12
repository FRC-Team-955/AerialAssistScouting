// Header for writing files
var header = "TEAM #,A:HIGH HOT,A:HIGH,A:LOW HOT,A:LOW,HIGH,LOW,TRUSS,CATCH,PREF ZONE,BALL PASS,LEGIT PASS,DEFENSIVE,LEGIT DEFENSE,OFFENSIVE,LEGIT OFFENSIVE,BROKEN,GOOD WITH US,COMMENTS";
        
// Keyboard keys
var tagKeys = ['1', '2', '3', '4', '5', '6'];
var teleopKeys = [['q', 'a', 'z', 'w', 's', 'x'], ['t', 'g', 'b', 'y', 'h', 'n'], ['o', 'l', '.', 'p', ';', '/']];
var autoKeys = [['q', 'a', 'z', 'w'], ['t', 'g', 'b', 'y'], ['o', 'l', '.', 'p']];

// Array lengths
var teleopLength = teleopKeys[0].length;
var autoLength = autoKeys[0].length;
var tagLength = tagKeys.length;
var robotLength = 3;
var totalLength = split(header, ",").length;//autoLength + teleopLength + tagLength + 3;

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

// Loads the string data into the robot data
Robot.prototype.loadData = function(data)
{
    console.log("Robot Load: " + data);
    var dataLen = data.length;
    
    for(var dataIndex = 0; dataIndex < dataLen; dataIndex++)
    {
        if(dataIndex < autoLength)
            this.dataAuto[dataIndex] += convertToNumber(data[dataIndex]);
        
        else if(dataIndex < autoLength + teleopLength)
            this.dataTeleop[dataIndex - autoLength] += convertToNumber(data[dataIndex]);
        
        else if(dataIndex < autoLength + teleopLength + 1)
            this.zone = data[dataIndex];
        
        else if(dataIndex < autoLength + teleopLength + 1 + tagLength)
            this.dataTag[dataIndex - (autoLength + teleopLength + 1)] = data[dataIndex];
        
        else
            this.comment = data[dataIndex];
    }
};

// Called when the app is first loaded
function init()
{
    // Check for the various File API support.
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob)
      alert('The File APIs are not fully supported in this browser.');
    
    console.log("init");
    var tmp = split(header, ',');
    console.log(tmp + " " + tmp.length);
    // Setting the variables to hold all the DOM elements
//    $teamNames = [$("teamName1"), $("teamName2"), $("teamName3")];
//    $tags = [$("tag1"), $("tag2"), $("tag3")];
//    zones = ["NONE", "NONE", "NONE"];
//    $comments = [$("comment1"), $("comment2"), $("comment3")];
//    $inputBoxTeleop = $("inputTeleop");
//    $inputBoxAuto = $("inputAuto");
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
    
    var fileData = "";
    
    for(var robotIndex = 0; robotIndex < robotLength; robotIndex++)
    { 
        robots[robotIndex].processData($teamNames[robotIndex].val(), $tags[robotIndex].val(), $comments[robotIndex].val(), zones[robotIndex]); // TODO: FIXZ THISZ
        fileData += robots[robotIndex].getString() + "\n";
    }
    
    writeToFile(fileData, matchNumber + allianceColor + ".csv");
    reset();
}

// Writes the data to the users computer with the specified name
function writeToFile(data, fileName)
{
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, fileName);
}

// Reads all files
function getLoadedFiles(evt)
{
    console.log("getLoadedFiles()");
    
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
    
    for(var dataIndex = 0; dataIndex < data.length; dataIndex += totalLength)
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
        console.log((dataIndex + 1) + " " + (dataIndex + totalLength) + " " + data.length);
        newRobots[curRobot].loadData(data.slice(dataIndex + 1, dataIndex + totalLength));
    }
    
    var fileData = "";
    
    for(var robotIndex = 0; robotIndex < newRobots.length; robotIndex++)
        fileData += newRobots[robotIndex].getString() + "/n";
    
    writeToFile(fileData, masterFileName);
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
        case "blue1": $("#btBlue1").prop("checked", !$("#btBlue1").is(":checked")); break;
        case "white1": $("#btWhite1").prop("checked", !$("#btWhite1").is(":checked")); break;
        case "red1": $("#btRed1").prop("checked", !$("#btRed1").is(":checked")); break;
            
        case "blue2": $("#btBlue2").prop("checked", !$("#btBlue2").is(":checked")); break;
        case "white2": $("#btWhite2").prop("checked", !$("#btWhite2").is(":checked")); break;
        case "red2": $("#btRed2").prop("checked", !$("#btRed2").is(":checked")); break;
        
        case "blue3": $("#btBlue3").prop("checked", !$("#btBlue3").is(":checked")); break;
        case "white3": $("#btWhite3").prop("checked", !$("#btWhite3").is(":checked")); break;
        case "red3": $("#btRed3").prop("checked", !$("#btRed3").is(":checked")); break;
    }
}

// Gets the value of the selected button in specified zone
function getZoneVal(index)
{
    var ret = $("input:radio[name=zone" + (index + 1) + "]:checked").val();
    
    if(!ret)
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

// Converts the string to a number, retursn 0 if can't find number
function convertToNumber(str)
{
    var ret = parseInt(str);
    
    if(!ret)
    {
        console.log("ERROR, CAN'T CONVERT '" + str + "' TO A NUMBER.");
        ret = 0;
    }
    
    return ret;
}