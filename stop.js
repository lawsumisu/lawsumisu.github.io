var seriesData;
var runningData;

function loadPacingData() {
  num = Number(num);
  runningData = runs[num];

  if (num == 0) {
    runningData = getCurrentRunZero(stopwatch.elapsedTime()/1000, split);
  }

  if (num >= 5) {
    var currentView = window.name.split("&");
    var reviewSplit = currentView[num];
    if (reviewSplit == "") {
      reviewSplit = null;
    }
    else {
      reviewSplit = Number(reviewSplit);
    }

    var reviewPace = currentView[num+1];
    if (reviewPace == "") {
      reviewPace = null;
    }
    else {
      reviewPace = Number(reviewPace);
    }
    customizeRecordedRun(reviewSplit, reviewPace);
    runningData = getCurrentRunZero(Number(currentView[num+2]), reviewSplit);
  }

  var dataPacing = [];
  var dataRun = [];
  var colors = [];

  var hasPacing = (runningData.pacing.length !== 0);
  
  if (hasPacing) {
    dataPacing = getDataBetween(runningData.distance, runningData.pacing, 0, runningData.distance.length);

    var previousEnd = 0;
    var currentColor = "green";
    var index = 1;
    while (index < runningData.time.length) {
      if (currentColor == "green") {
        while (index < runningData.time.length && runningData.time[index] <= runningData.pacing[index]) {
          index++;
        }
        dataRun.push(getDataBetween(runningData.distance, runningData.time, previousEnd, index));
        colors.push(currentColor);
        previousEnd = index;
        currentColor = "red";
      }
      else if (currentColor == "red") {
        while (index < runningData.time.length && runningData.time[index] > runningData.pacing[index]) {
          index++;
        }
        dataRun.push(getDataBetween(runningData.distance, runningData.time, previousEnd, index));
        colors.push(currentColor);
        previousEnd = index;
        currentColor = "green";
      }
    }
    /*
    if (previousEnd != runningData.distance.length) {
      dataRun.push(getDataBetween(runningData.distance, runningData.time, previousEnd, runningData.distance.length));
      colors.push(currentColor);
    }
    */
  }
  else {
    dataRun.push(getDataBetween(runningData.distance, runningData.time, 0, runningData.distance.length));
    colors.push("green");
  }

  seriesData = [];
  for (var i=0; i<dataRun.length; i++) {
    var colorStr;
    if (colors[i] == "red") {
      colorStr = 'rgb(227,163,163)';
    }
    else if (colors[i] == "green") {
      colorStr = 'rgb(153,222,126)';
    }
    seriesData.push({data: dataRun[i], color: colorStr});
  }

  if (hasPacing) {
    seriesData.push({data: dataPacing, color: 'rgb(100,100,100)', dashStyle: 'ShortDot', marker: {enabled: false}, fillOpacity: 0})
  }

  var splits = document.getElementById("splitTable");
  for (var i=splits.rows.length-1; i>=0; i--) {
    splits.deleteRow(i);
  }
  var row = splits.insertRow(0);
  var cell1 = row.insertCell(0); cell1.innerHTML = "Split Number";
  var cell2 = row.insertCell(1); cell2.innerHTML = "Overall Distance";
  var cell3 = row.insertCell(2); cell3.innerHTML = "Split Time";
  if (hasPacing) {
    var cell4 = row.insertCell(3); cell4.innerHTML = "Time Differential";
  }

  if (!runningData.split) {
    var row = splits.insertRow(1);
    var cell1 = row.insertCell(0); cell1.innerHTML = "1";
    var cell2 = row.insertCell(1); cell2.innerHTML = (runningData.distance[runningData.distance.length-1]).toFixed(2);
    var cell3 = row.insertCell(2); cell3.innerHTML = formatTime(runningData.time[runningData.time.length-1]);
    row.className = "aheadRow";
  }
  else {
    for (var i=runningData.distance.length-1; i>0; i--) {
      var row = splits.insertRow(1);
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);

      cell1.innerHTML = i;
      cell2.innerHTML = (runningData.distance[i]).toFixed(2);
      cell3.innerHTML = getSplitTime(runningData.time[i], runningData.time[i-1]);

      if (hasPacing) {
        var cell4 = row.insertCell(3);
        cell4.innerHTML = getDifferential(runningData.time[i], runningData.pacing[i]);
        if (runningData.time[i] > runningData.pacing[i]) {
          row.className = "behindRow";
        }
        else {
          row.className = "aheadRow";
        }
      }
      else {
        row.className = "aheadRow";
      }
    }
  }

  $('#totalDistLabel').text((runningData.distance[runningData.distance.length-1]).toFixed(2));
  $('#totalTimeLabel').text(formatTime(runningData.time[runningData.time.length-1]));
}

function formatTime(given) {
  var minutes = Math.floor(given/60);
  var seconds = Math.round(given % 60);
  return minutes + ":" + ('0' + seconds).slice(-2);
}

function loadGraph() {
  $('#graphDisplay').highcharts({
      chart: {
          type: 'area',
          marginBottom: 20
      },
      credits: {
        enabled: false
      },
      title: {
        text: null
      },
      xAxis: {
          tickPositioner: function(e) {
              var totalDist = runningData.distance[runningData.distance.length-1];
              var numLabels = 6;
              var graphSplit = runningData.split;
              if (!graphSplit) {
                graphSplit = 0.25;
              }
              var factor = Math.max(1,Math.round(totalDist/graphSplit/numLabels));
        
              var ticks = [0];
              var nextIndex = 0;
              while (factor*graphSplit*nextIndex < totalDist) {
                nextIndex++;
                ticks.push(factor*graphSplit*nextIndex);
              }
              if (ticks.length == 2) {
                ticks.pop();
                ticks.push(totalDist);
              }
              return ticks;
          },
          labels: {
              formatter: function () {
                  return Math.round(this.value*100)/100;
              }
          },
          endOnTick: true
      },
      yAxis: {
          title: null,
          tickPositioner: function(e) {
            var totalTime = runningData.time[runningData.time.length-1];
            var numLabels = 5;
            var splitTime = 20;
            var factor = Math.max(1,Math.round(totalTime/splitTime/numLabels));

            var ticks = [0];
            var nextIndex = 0;
            while (factor*splitTime*nextIndex < totalTime) {
              nextIndex++;
              ticks.push(factor*splitTime*nextIndex);
            }
            if (ticks.length == 2) {
              ticks.pop();
              ticks.push(totalTime);
            }
            return ticks;
          },
          labels: {
              formatter: function () {
                  var minutes = Math.floor(this.value/60);
                  var seconds = Math.round(this.value % 60);
                  return minutes + ":" + ('0' + seconds).slice(-2);
              }
          },
          endOnTick: true
      },
      tooltip: {
          enabled: false
      },
      plotOptions: {
          area: {
              marker: {
                  enabled: true,
                  symbol: 'circle',
                  radius: 3,
                  states: {
                      hover: {
                          enabled: false
                      }
                  }
              },
              fillOpacity: 0.75,
              enableMouseTracking: false
          }
      },
      series: seriesData,
      legend: {enabled: false},
  });
}

function getDataBetween(dataA, dataB, start, end) {
  var result = [];
  for (var i=Math.max(0,start-1); i<end; i++) {
    result.push([dataA[i], dataB[i]]);
  }
  return result;
}

function getSplitTime(current, prev) {
  var elapsed = current-prev;
  return formatTime(elapsed);
}

function getDifferential(current, pacing) {
  var diff = current-pacing;
  return getDifferentialGivenDiff(diff)
}

function getDifferentialGivenDiff(diff) {
  var minutes = Math.floor(Math.abs(diff)/60);
  var seconds = Math.round(Math.abs(diff) % 60);
  var symbol = "";
  if (diff > 0) {
    symbol = "+ ";
  }
  else {
    symbol = "- ";
  }
  return symbol + minutes + ':' + ('0' + seconds).slice(-2);
}