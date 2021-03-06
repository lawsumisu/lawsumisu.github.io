var recordedDist = [0,0.25,0.5,0.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.25,3.5,3.75,4,4.25,4.5,4.75,5,5.25,5.5,5.75,6,6.25];
var recordedTime = [0,135,262,372,486,596,715,825,942,1049,1161,1269,1381,1479,1584,1708,1830,1965,2087,2229,2364,2483,2626,2776,2936,3101];

var run0 = new Object();

function customizeRecordedRun(split, pacing) {
  run0.split = split;

  if (!split) {
    run0.distance = recordedDist;
    run0.distance.push(6.5);
    run0.time = recordedTime;
    run0.time.push(3236);
  }
  else {
    run0.distance = [];
    var totalDist = recordedDist[recordedDist.length-1];
    for (var i=0; i<=totalDist/split; i++) {
      run0.distance.push(split*i);
    }

    run0.time = [];
    for (var i=0; i<run0.distance.length; i++) {
      run0.time.push(interpolate(run0.distance[i], recordedDist, recordedTime));
    }

    var disLength = run0.distance.length;
    run0.distance.push(2*run0.distance[disLength-1] - run0.distance[disLength-2]);
    run0.time.push(2*run0.time[disLength-1] - run0.time[disLength-2]);
  }

  run0.pacing = [];
  if (pacing) {
    for (var i=0; i<run0.time.length; i++) {
      run0.pacing.push(pacing*(i));
    }
  }
}

function getCurrentRunZero(time, currentSplit) {
  modifiedZeroRun = new Object();
  var finalDist = interpolate(time, run0.time, run0.distance);

/*  if (currentSplit === null) {
    currentSplit = run0.distance[1]-run0.distance[0];
  }
  */
  modifiedZeroRun.split = currentSplit;
  if (!currentSplit) {
    currentSplit = 0.25;
  }

  modifiedZeroRun.distance = [];
  for (var i=0; i<finalDist/currentSplit; i++) {
    modifiedZeroRun.distance.push(i*currentSplit);
  }
  modifiedZeroRun.distance.push(finalDist);

  modifiedZeroRun.time = [];
  for (var i=0; i<modifiedZeroRun.distance.length; i++) {
    modifiedZeroRun.time.push(interpolate(modifiedZeroRun.distance[i], run0.distance, run0.time));
  }

  modifiedZeroRun.pacing = [];
  if (run0.pacing.length > 0) {
    for (var i=0; i<modifiedZeroRun.distance.length; i++) {
      modifiedZeroRun.pacing.push(interpolate(modifiedZeroRun.distance[i], run0.distance, run0.pacing));
    }
  }

  var d = new Date();
  modifiedZeroRun.date = (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear().toString().substring(2);

  return modifiedZeroRun;
}

//passes back object with following parameters; they are null if invalid
//  distance
//  splitDistance
//  splitTime
//  pacingDiff
function getCurrentStats(time) {
  var stats = new Object();

  stats.distance = interpolate(time, run0.time, run0.distance);

  if (run0.split !== null) {
    stats.splitDistance = stats.distance % run0.split;
    stats.splitTime = time - interpolate(stats.distance-stats.splitDistance, run0.distance, run0.time);
  }
  else {
    stats.splitDistance = null;
    stats.splitTime = null;
  }

  if (run0.pacing.length !== 0) {
    stats.pacingDiff = time - interpolate(stats.distance, run0.distance, run0.pacing);
  }
  else {
    stats.pacingDiff = null;
  }

  return stats;
}

//given value in array1, interpolate into array2
function interpolate(value, array1, array2) {
  var index = 0;
  var numComplete = 0;
  var complete = array1[array1.length-2];
  while (array1[index+1] + numComplete*complete < value) {
    index++;
    if (index >= array1.length-1) {
      index = 0;
      numComplete++;
    }
  }

  var frac = (value-numComplete*complete-array1[index])/(array1[index+1]-array1[index]);
  var fracElapsed = frac*(array2[index+1]-array2[index]);
  return fracElapsed + array2[index] + numComplete*array2[array2.length-2];
}

var run1 = {
  date: "4/2/15",
  split: 0.1,
  distance: [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2,2.1,2.2,2.3],
  time: [0,45,88,138,192,242,312,380,442,500,552,594,634,674,719,771,825,883,933,984,1043,1105,1163,1217],
  pacing: [0,47,94,141,188,235,282,329,376,423,470,517,564,611,658,705,752,799,846,893,940,987,1034,1081]
};
var run2 = {
  date: "3/30/15", 
  split: 0.5, 
  distance: [0,0.5,1,1.5,2,2.5,3,3.5,4,4.5,5], 
  time: [0,210,415,628,869,1077,1347,1577,1819,2054,2293], 
  pacing: [0,225,450,675,900,1125,1350,1575,1800,2025,2250]
};
var run3 = {
  date: "3/28/15", 
  split: 0.1, 
  distance: [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2], 
  time: [0,49,99,149,203,253,301,345,388,435,487,529,569,609,654,706,760,818,868,919,978],
  pacing: [0,47,94,141,188,235,282,329,376,423,470,517,564,611,658,705,752,799,846,893,940]
};
var run4 = {
  date: "3/24/15", 
  split: 1.0, 
  distance: [0,1,2,3,4,5], 
  time: [0,430,858,1280,1680,2082], 
  pacing: [0,420,840,1260,1680,2100]
};

var runs = [run0, run1, run2, run3, run4];