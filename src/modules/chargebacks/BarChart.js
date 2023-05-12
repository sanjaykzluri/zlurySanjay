import { React, useState } from "react";
import Highcharts from "highcharts";
import highchartsDrillDown from 'highcharts/modules/drilldown';
import HighchartsReact from "highcharts-react-official";


export const BatChart = () => {

    const donutChartOptions = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        title: {
            text: '$10K ',
            align: 'center',
            verticalAlign: 'middle',
            y: 70,
            margin: 20,
        },
        subtitle: {
            text: 'Total ChangeBook',
            align: 'center',
            verticalAlign: 'middle',
            y: 90,
            margin: 20,
        },
        tooltip: {
            pointFormat: '<b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: true,
                    distance: -50,
                    style: {
                        fontWeight: 'bold',
                        color: 'white'
                    }
                },
                startAngle: -90,
                endAngle: 90,
                center: ['50%', '75%'],
                size: '110%'
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            innerSize: '50%', borderWidth: 8,

            data: [
                {
                    name: 'Chrome',
                    y: 2.86,
                    dataLabels: {
                        enabled: false
                    },
                    color: " #484848"

                },
                {
                    name: 'Edge',
                    y: 1.9,
                    dataLabels: {
                        enabled: false
                    },
                    color: " #9E17FF"

                },

                {
                    name: 'Firefox',
                    y: 3,
                    dataLabels: {
                        enabled: false
                    },
                    color: "#FFA217"
                },
                {
                    name: 'Safari',
                    y: 6,
                    dataLabels: {
                        enabled: false
                    },
                    color: "#5FCF64"
                },
                {
                    name: 'Internet Explorer',
                    y: 7,
                    dataLabels: {
                        enabled: false
                    },
                    color: "#FE6955"
                },

                {
                    name: 'Other',
                    y: 3.77,
                    dataLabels: {
                        enabled: false
                    },
                    color: "#5ABAFF"
                }
            ]
        }]

    }
    const options = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'My chart'
        },
        xAxis: {
            categories: ["Apr'22", '', "June'22", '', "Aug'22", "", "Oct'22", "", "Dec'22", "", "Feb'23", "", "Apr'23"]
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Assists'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
            shared: true
        },

        plotOptions: {
            column: {
                stacking: 'percent'
            }
        },
        series: [{
            name: 'Kevin De Bruyne',
            data: [4, 4, 2, 4, 4, 9, 4, 4, 2, 4, 4, 9],
            color: "#FFDC7A"

        }, {
            name: 'Joshua Kimmich',
            data: [0, 4, 3, 2, 3, 6, 0, 4, 3, 2, 3, 6],
            color: "#C87AFF"

        }, {
            name: 'Sadio Mané',
            data: [1, 2, 2, 1, 2, 3, 1, 2, 2, 1, 2, 3],
            color: "#A0D8FF"


        },
        ],

    }
    return (
        <>
            <div className="row contaier1 marginTop">

                <div className="col-md-6">
                    <div className="">
                        <HighchartsReact highcharts={Highcharts} options={donutChartOptions} />
                    </div>

                </div>

                <div className="bar-chart col-md-6">
                    <div className="bar-chart-header">

                        <button className="actual-spend">
                            <img src="./icons/actual-spend.png" alt="actual-spend" /> &nbsp;
                            Actual Spend
                        </button>
                        <div className="bar-chart-header-right">
                            <div className="date-range">
                                <span className="date_range_text"> Apr 23 </span>
                                <img src="./icons/line.png" alt="" />
                                <span className="date_range_text"> May 23 </span>
                            </div>
                            <div className="forecasted"> ... </div>
                        </div>

                    </div>
                    <HighchartsReact highcharts={Highcharts} options={options} />
                    <div className="bar-chart-footer">
                        <div className="reset-btn"> Reset View </div>
                        <div className="legend-btn"> Legend </div>
                    </div>
                </div>

            </div>
        </>

    );
};





/*

import React, { useState } from 'react';

import Child from './Child';

export const BatChart = () => {
    const [chart, setChart] = useState(null);

    const handleDrillUp = () => {
        chart.drillUp();
    };

    const handleDrillDown = () => {
        chart.series[0].data[0].doDrilldown(); // you can chose the series and data
    };

    return (
        <div>
             <button onClick={handleDrillUp}> drill up</button>
            <button onClick={handleDrillDown}> drill down</button> 
            <Child setChart={setChart} />;
        </div>
    );
};

*/
