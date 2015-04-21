var seriesData;

function loadPacingData() {
  var dataPacing = getDataBetween(runningData.distance, runningData.pacing, 0, runningData.distance.length);

  var dataRun = [];
  var colors = [];
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
  if (previousEnd != runningData.distance.length) {
    dataRun.push(getDataBetween(runningData.distance, runningData.time, previousEnd, runningData.distance.length));
    colors.push(currentColor);
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
  seriesData.push({data: dataPacing, color: 'rgb(100,100,100)', dashStyle: 'ShortDot', marker: {enabled: false}, fillOpacity: 0})

  var splits = document.getElementById("splitTable");
  for (var i=runningData.distance.length-1; i>0; i--) {
    var row = splits.insertRow(1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);

    cell1.innerHTML = i;
    cell2.innerHTML = runningData.distance[i];
    cell3.innerHTML = getSplitTime(runningData.time[i], runningData.time[i-1]);
    cell4.innerHTML = getDifferential(runningData.time[i], runningData.pacing[i]);

    if (runningData.time[i] > runningData.pacing[i]) {
      row.className = "behindRow";
    }
    else {
      row.className = "aheadRow";
    }
  }
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
              var factor = Math.round(totalDist/runningData.split/numLabels);
        
              var ticks = [0];
              var nextIndex = 0;
              while (factor*runningData.split*nextIndex < totalDist) {
                nextIndex++;
                ticks.push(factor*runningData.split*nextIndex);
              }
              return ticks;
          },
          labels: {
              formatter: function () {
                  return Math.round(this.value*100)/100;
              }
          }
      },
      yAxis: {
          title: null,
          tickPositioner: function(e) {
            var totalTime = runningData.time[runningData.time.length-1];
            var numLabels = 5;
            var splitTime = 20;
            var factor = Math.round(totalTime/splitTime/numLabels);

            var ticks = [0];
            var nextIndex = 0;
            while (factor*splitTime*nextIndex < totalTime) {
              nextIndex++;
              ticks.push(factor*splitTime*nextIndex);
            }
            return ticks;
          },
          labels: {
              formatter: function () {
                  var minutes = Math.floor(this.value/60);
                  var seconds = this.value % 60;
                  return minutes + ":" + ('0' + seconds).slice(-2);
              }
          },
          endOnTick: false
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
  var minutes = Math.floor(elapsed/60);
  var seconds = elapsed % 60;
  return minutes + ":" + ("0" + seconds).slice(-2);
}

function getDifferential(current, pacing) {
  var diff = current-pacing;
  var minutes = Math.floor(Math.abs(diff)/60);
  var seconds = Math.abs(diff) % 60;
  var symbol = "";
  if (diff > 0) {
    symbol = "+ ";
  }
  else {
    symbol = "- ";
  }
  return symbol + minutes + ':' + ('0' + seconds).slice(-2);
}