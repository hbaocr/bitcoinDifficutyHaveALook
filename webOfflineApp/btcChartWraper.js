class ChartHandle {
    constructor(eID, chartJsLib, chartTitle = "Display") {
       
        var chartColors = {
            red: 'rgb(255, 99, 132)',
            orange: 'rgb(255, 159, 64)',
            yellow: 'rgb(255, 205, 86)',
            green: 'rgb(75, 192, 192)',
            blue: 'rgb(54, 162, 235)',
            purple: 'rgb(153, 102, 255)',
            grey: 'rgb(201, 203, 207)'
        };
        this.chartTitle = chartTitle;
        this.chartColors = chartColors;
        this.eID = eID;

        this.chartJS = chartJsLib;
       
       

        this.toolTipData = [];

        // this.parserhdl = {};
        // this.rows = 0;
        // this.chunks = 0;
        // this.chunkSz = 100;
        // this.dataChunk = [];
        this.chartTitle = chartTitle;
        this.last_utc_recs=0;

        this.chartObj = this.create_chartjs_obj();//chart Data
        this.displayChart= new chartJsLib.Line(eID,this.chartObj);// to handle chartGUI
        this.displayChart.toolTipData=this.toolTipData;//add more field to ChartJs to handle ToolTip
        this.displayChart.update();
    }
    create_line_template(lengend_name, y_name, chartColor) {
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

        let yConfig = {
            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
            display: true,
            position: 'left',
            id: y_name,
        }

        let line = {
            datset: ydata,
            yAxiz: yConfig,
        };
        return line;
    }

    create_chartjs_obj() {
        let create_line_template = this.create_line_template;
        let chartColors= this.chartColors;
        let tooltipHdl = {
            callbacks: {
                label: function (tooltipItem, data) {
                    let dataset_idx = tooltipItem.datasetIndex;
                    let toolTipData = this._chart.toolTipData;//read custom toolTipData field

                    let idx = tooltipItem.index;
                    var label = data.datasets[dataset_idx].label + '= ' + tooltipItem.yLabel || '';

                    if (label) {
                        label += ' @ ';
                    }
                    if (toolTipData[idx]) {
                        label += toolTipData[idx];
                    }
                    return label;
                }
            }
        }
        let optionCfg = {
            tooltips: tooltipHdl,
            responsive: true,
            hoverMode: 'index',
            maintainAspectRatio: false,//fixed height
            stacked: false,
            title: {
                display: true,
                text: this.chartTitle
            },
            scales: {
                //yAxes: [],
                yAxes: [],
            }
        }
        let lineChartData = {
            labels: [], /* x data */
            datasets: [],
        };

        let line0 = create_line_template('hash_pwr', 'hashrate', chartColors.red);
        lineChartData.datasets.push(line0.datset);//add new line
        optionCfg.scales.yAxes.push(line0.yAxiz);//add config for line0

        let line1 = create_line_template('tx', 'tx_in_blocks', chartColors.blue);
        lineChartData.datasets.push(line1.datset);//add new line
        optionCfg.scales.yAxes.push(line1.yAxiz);//add config for line0

        let line3 = create_line_template('blocktimes', 'blockstime_sec', chartColors.green);
        lineChartData.datasets.push(line3.datset);//add new line
        optionCfg.scales.yAxes.push(line3.yAxiz);//add config for line0


        let chartjs_Obj = {
            data: lineChartData,
            options: optionCfg
        }
        return chartjs_Obj;
    }

    updateDisplayUI() {
        this.displayChart.update();
    }

    insertDataToChartCb(chunks) {
        let dh = 1;
         //this.last_utc_recs;
        let chartObj=this.chartObj;
        let toolTipData = this.toolTipData;

        if (chunks.length >= 2) {
            dh = parseInt(chunks[chunks.length - 1].height) - parseInt(chunks[chunks.length - 2].height)
        }
        for(let i=0;i<chunks.length;i++){
            let xdata = parseInt(chunks[i].height);
            let y1data =parseInt(chunks[i].average_hash_calcualtions);
            let y2data =parseInt(chunks[i].numberTXs);
            let gmtime=chunks[i].date_str;
            
            let y3data=600;
            let ntime =parseInt(chunks[i].nTime);
            if(this.last_utc_recs!=0){
                y3data=ntime-this.last_utc_recs;
                if(y3data>1231006000){
                    y3data=600;
                }
            }
          
            this.last_utc_recs=ntime;
            chartObj.data.labels.push(xdata);
            chartObj.data.datasets[0].data.push(y1data);
            chartObj.data.datasets[1].data.push(y2data);
            chartObj.data.datasets[2].data.push(y3data/dh/60);
            toolTipData.push(gmtime);
        }
        //this.displayChart.update();
    }


}

