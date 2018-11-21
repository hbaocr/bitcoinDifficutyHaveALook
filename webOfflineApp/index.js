window.addEventListener("load", load, true);
var chart1Instance;
var chart2Instance;
var papaCSV1Instance;
var papaCSV2Instance;
function load() {
    var mychart1 = document.getElementById('myChart');
    chart1Instance = new ChartHandle(mychart1, Chart, 'BTC chart');
    chart1Instance.updateDisplayUI();

    var mychart2 = document.getElementById('myChart2');
    chart2Instance = new ChartHandle(mychart2, Chart, 'BCH chart');
    chart2Instance.updateDisplayUI();

    papaCSV1Instance = new PapaCSVWraper(20, Papa);
    papaCSV2Instance = new PapaCSVWraper(20, Papa);
}


var onComplete = function (results, file) {
    console.log("Parsing complete:", results, file);
}

var onRowCb1 = function (results, parser) // run each parsed row
{
    let papaIns = papaCSV1Instance;
    let chartIns =chart1Instance;

    if (!results)
        return;

    papaIns.chunks++;
    let row = results.data[0];
    if (row) {
        papaIns.dataChunk.push(row);
    }
    if (papaIns.chunks >= papaIns.chunkSz) {
        papaIns.chunks = 0;
        parser.pause();
        chartIns.insertDataToChartCb(papaIns.dataChunk);
        chartIns.updateDisplayUI();
        //Conitnue to parse -->resume
        papaIns.dataChunk = [];
        parser.resume();
    }
}
var onRowCb2 = function (results, parser) // run each parsed row
{
    let papaIns = papaCSV2Instance;
    let chartIns =chart2Instance;

    if (!results)
        return;

    papaIns.chunks++;
    let row = results.data[0];
    if (row) {
        papaIns.dataChunk.push(row);
    }
    if (papaIns.chunks >= papaIns.chunkSz) {
        papaIns.chunks = 0;
        parser.pause();
        chartIns.insertDataToChartCb(papaIns.dataChunk);
        chartIns.updateDisplayUI();
        //Conitnue to parse -->resume
        papaIns.dataChunk = [];
        parser.resume();
    }
}
function uploadCSV() {
    let csvfile = document.getElementById('csvFileUpload');
    let fname = csvfile.files[0];
    papaCSV1Instance.readData(fname,onRowCb1,onComplete);
}
function uploadCSV2() {
    let csvfile = document.getElementById('csvFileUpload2');
    let fname = csvfile.files[0];
    papaCSV1Instance.readData(fname,onRowCb2,onComplete);
}