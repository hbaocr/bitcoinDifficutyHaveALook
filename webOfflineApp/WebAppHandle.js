// red: 'rgb(255, 99, 132)',
// orange: 'rgb(255, 159, 64)',
// yellow: 'rgb(255, 205, 86)',
// green: 'rgb(75, 192, 192)',
// blue: 'rgb(54, 162, 235)',
// purple: 'rgb(153, 102, 255)',
// grey: 'rgb(201, 203, 207)'

// For display
var displayChart;// to handle chartGUI
var chartObj;// variable to handle data in chart
var toolTipData=[];
//======Data CSV==========

var parserhdl;
var rows=0;
var chunks=0;
var chunkSz=100;
var dataChunk=[];


//==================For Chart Js ==================
var chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

function create_line_template(lengend_name,y_name, chartColor) {
    let ydata = {
        label: lengend_name,
        fill: false,
        lineTension: 0.1,
        backgroundColor: chartColor/*"rgba(75,192,192,0.4)"*/,
        borderColor: chartColor/*"rgba(75,192,192,1)"*/,

        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: chartColor/*"rgba(75,192,192,1)"*/,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: chartColor /*"rgba(75,192,192,1)"*/,
        pointHoverBorderColor: chartColor/*"rgba(220,220,220,1)"*/,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 1,
        data: [],
        yAxisID: y_name,
    };

    let yConfig= {
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'left',
        id: y_name,  
    }
    
    let line={
        datset :ydata,
        yAxiz:yConfig,
    };
    return line;
}
/*
To get a fixed height and variable width chart…

1. remove width or height attributes from the canvas element.
2. set the desired css height on the canvas element's parent html element.
3. set chart options to include maintainAspectRatio: false,
*/
function create_chartjs_obj(){

    let tooltipHdl= {
        callbacks: {
            label: function(tooltipItem, data) {
                let idx =tooltipItem.datasetIndex;
                var label = data.datasets[idx].label +'= '+tooltipItem.yLabel|| '';

                if (label) {
                    label += ' @ ';
                }
                if(toolTipData[idx]){
                    label += toolTipData[idx];
                }
                return label;
            }
        }
    }
   let optionCfg= {
        tooltips:tooltipHdl,
        responsive: true,
        hoverMode: 'index',
        maintainAspectRatio: false,//fixed height
        stacked: false,
        title: {
            display: true,
            text: 'Bitcoin Investigate'
        },
        scales: {
            yAxes: [],
        }
    }
    let lineChartData = {
        labels: [], /* x data */
        datasets: [],
    };

    let line0= create_line_template('hash_pwr','hashrate',chartColors.red);
    lineChartData.datasets.push(line0.datset);//add new line
    optionCfg.scales.yAxes.push(line0.yAxiz);//add config for line0

    let line1= create_line_template('tx','tx_in_blocks',chartColors.blue);
    lineChartData.datasets.push(line1.datset);//add new line
    optionCfg.scales.yAxes.push(line1.yAxiz);//add config for line0

    let line3= create_line_template('blocktimes','blockstime_sec',chartColors.green);
    lineChartData.datasets.push(line3.datset);//add new line
    optionCfg.scales.yAxes.push(line3.yAxiz);//add config for line0


    let chartjs_Obj={
        data:lineChartData,
        options:optionCfg
    }
    return chartjs_Obj;
}

function update_data(chartObj){
    chartObj.data.datasets[0].data=[1,2,3,4,4,3,2,1];
    chartObj.data.datasets[1].data=[2,200,3,7,4,3,5,1];
    chartObj.data.labels=[1,2,3,4,5,6,7,8];
    return chartObj;
}

var last_utc_recs=0; 
function update_chart_data(chartObj,chunks){
    for(let i=0;i<chunks.length;i++){
        let xdata = parseInt(chunks[i].height);
        let y1data =parseInt(chunks[i].average_hash_calcualtions);
        let y2data =parseInt(chunks[i].numberTXs);
        let gmtime=chunks[i].date_str;
        
        let y3data=600;
        let ntime =parseInt(chunks[i].nTime);
        if(last_utc_recs!=0){
            y3data=ntime-last_utc_recs;
            if(y3data>1231006000){
                y3data=600;
            }
        }
        last_utc_recs=ntime;

        chartObj.data.labels.push(xdata);
        chartObj.data.datasets[0].data.push(y1data);
        chartObj.data.datasets[1].data.push(y2data);
        chartObj.data.datasets[2].data.push(y3data);
        toolTipData.push(gmtime);
    }
    displayChart.update(); 
    return chartObj;
}

//===========For parse CSV

function stepRowFn(results, parser) // run each parsed row
{
    parserhdl=parser;
	if (!results)
        return;
    
    chunks++;
    let row=results.data[0];
    if(row){
        dataChunk.push(row);
    }
    if(chunks>=chunkSz){
        chunks=0;
       parserhdl.pause();
       //pause parse to Handle and render chart 
      // console.log("chunk of data",dataChunk);
        chartObj=update_chart_data(chartObj,dataChunk);
      //Conitnue to parse -->resume
       dataChunk=[];
       parserhdl.resume();
    } 
}

function uploadCSV(){  
    let csvfile = document.getElementById('csvFileUpload');
    let fname =csvfile.files[0];
    //https://www.papaparse.com/docs#config
    let config={
        delimiter: ",",	// auto-detect
        newline: "/n",	// auto-detect
        quoteChar: '"',
        escapeChar: '"',
        header: true,
        transformHeader: undefined,
        dynamicTyping: false,
        preview: 0,
        encoding: "",
        worker: false,
        comments: false,
        step: undefined,
        complete: undefined,
        error: undefined,
        download: false,
        skipEmptyLines: true,
        chunk: undefined,
        fastMode: undefined,
        beforeFirstChunk: undefined,
        withCredentials: undefined,
        transform: undefined
    };
    
    config.complete=function(results, file) {
        console.log("Parsing complete:", results, file);
    }
    config.step=stepRowFn;

      Papa.parse(fname, config)
}


window.addEventListener("load",load,true);
 function load(){
     
    chartObj =create_chartjs_obj();
    var canvas = document.getElementById('myChart');
    //Code to execute when the document is loaded.
    displayChart = new Chart.Line(canvas,chartObj);
    displayChart.update(); 
 }