/*
import React, { useState, useEffect, useRef } from 'react';

import Highcharts from 'highcharts';
import highchartsDrillDown from 'highcharts/modules/drilldown';

import HighchartsReact from 'highcharts-react-official';

const Child = ({ setChart }) => {
    const [options, setOptions] = useState({
        chart: {
            type: 'column',
        },
        title: {
            text: 'Drilldown label styling',
        },
        xAxis: {
            type: 'category',
        },

        legend: {
            enabled: false,
        },

        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                },
            },
        },

        series: [
            {
                name: 'Things',
                colorByPoint: true,
                data: [
                    {
                        name: 'Dieren',
                        y: 5,
                        drilldown: 'animals',
                    },
                    {
                        name: 'Fruit',
                        y: 2,
                        drilldown: 'fruits',
                    },
                    {
                        name: "Auto's",
                        y: 4,
                    },
                ],
            },
        ],
        drilldown: {
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: 0,
                },
                theme: {
                    fill: 'white',
                    'stroke-width': 1,
                    stroke: 'silver',
                    r: 0,
                    style: {
                        color: 'red',
                    },
                    states: {
                        hover: {
                            fill: '#a4edba',
                        },
                        select: {
                            stroke: '#039',
                            fill: '#a4edba',
                        },
                    },
                },
            },
            series: [
                {
                    id: 'animals',
                    data: [
                        ['Katten', 4],
                        ['Honden', 2],
                        ['Koeien', 1],
                        ['Schapen', 2],
                        ['Varkens', 1],
                    ],
                },
                {
                    id: 'fruits',
                    data: [
                        ['Appels', 4],
                        ['Sinaasappels', 2],
                    ],
                },
            ],
        },
    });
    const chartComponent = useRef(null);

    useEffect(() => {
        setChart(chartComponent.current.chart);
    }, []);

    highchartsDrillDown(Highcharts);

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={chartComponent}
        />
    );
};

export default Child;

*/


import React, { useState, useEffect, useRef } from 'react';

import Highcharts from 'highcharts';
import highchartsDrillDown from 'highcharts/modules/drilldown';

import HighchartsReact from 'highcharts-react-official';



const Child = ({ setChart }) => {


    // round chart

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


    // bar chart

    const options = {
        chart: {
            type: 'column'
        },
        // chart: {
        //     type: 'pie'
        // },
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

        series: [

            {
                name: 'Level 1',
                colorByPoint: true,

                data: [
                    {
                        name: 'Level 2',
                        y: 5,
                        drilldown: 'java',
                        color: "#FFDC7A"
                    }, {
                        name: 'Food',
                        y: 4,
                        drilldown: 'food',
                        color: "#FFDC7A"
                    },
                    {
                        name: 'test',
                        y: 7,
                        drilldown: 'test',
                        color: "#FFDC7A"
                    },
                    {
                        name: 'other',
                        y: 7,
                        drilldown: 'other',
                        color: "#FFDC7A"
                    },
                    {
                        name: 'other',
                        y: 7,
                        drilldown: 'other',
                        color: "#FFDC7A"
                    },
                    {
                        name: 'other',
                        y: 7,
                        drilldown: 'other',
                        color: "#FFDC7A"
                    },
                    {
                        name: 'other',
                        y: 7,
                        drilldown: 'other',
                        color: "#FFDC7A"
                    },
                    {
                        name: 'other',
                        y: 7,
                        drilldown: 'other',
                        color: "#FFDC7A"
                    },
                ],

            },

            {
                name: 'Level 1',
                colorByPoint: true,

                data: [
                    {
                        name: 'Level 2',
                        y: 5,
                        drilldown: 'react',
                        color: "#C87AFF"
                    }, {
                        name: 'Food',
                        y: 4,
                        drilldown: 'food',
                        color: "#C87AFF"
                    },
                    {
                        name: 'test2',
                        y: 7,
                        drilldown: 'test2',
                        color: "#C87AFF"
                    },

                    {
                        name: 'other2',
                        y: 7,
                        drilldown: 'other2',
                        color: "#C87AFF"
                    },
                    {
                        name: 'other2',
                        y: 7,
                        drilldown: 'other2',
                        color: "#C87AFF"
                    },
                    {
                        name: 'other2',
                        y: 7,
                        drilldown: 'other2',
                        color: "#C87AFF"
                    },
                    {
                        name: 'other2',
                        y: 7,
                        drilldown: 'other2',
                        color: "#C87AFF"
                    },
                    {
                        name: 'other2',
                        y: 7,
                        drilldown: 'other2',
                        color: "#C87AFF"
                    },

                ],

            },

            {
                name: 'Level 1',
                colorByPoint: true,

                data: [
                    {
                        name: 'Level 2',
                        y: 5,
                        drilldown: 'node',
                        color: "#A0D8FF"
                    }, {
                        name: 'Food',
                        y: 4,
                        drilldown: 'food',
                        color: "#A0D8FF"
                    },
                    {
                        name: 'test3',
                        y: 7,
                        drilldown: 'test3',
                        color: "#A0D8FF"
                    },
                    {
                        name: 'other3',
                        y: 7,
                        drilldown: 'other3',
                        color: "#A0D8FF"
                    },
                    {
                        name: 'other3',
                        y: 7,
                        drilldown: 'other3',
                        color: "#A0D8FF"
                    },
                    {
                        name: 'other3',
                        y: 7,
                        drilldown: 'other3',
                        color: "#A0D8FF"
                    },
                    {
                        name: 'other3',
                        y: 7,
                        drilldown: 'other3',
                        color: "#A0D8FF"
                    },
                    {
                        name: 'other3',
                        y: 7,
                        drilldown: 'other3',
                        color: "#A0D8FF"
                    },
                ],

            },
        ],




        drilldown: {
            series: [

                {
                    id: 'java',
                    data: [{
                        name: 'Level 3',
                        y: 1.5,
                        drilldown: 'java-level-2'
                    },
                    ['one', 1],
                    ['two', 0.5],
                    ['three', 1],
                    ['four', 1],
                    ['five', 1],
                    ]
                },

                {

                    id: 'java-level-2',
                    data: [4, 4, 2, 4, 4, 9, 4, 4, 2, 4, 4, 9],
                },
                //   second level

                {
                    id: 'react',
                    data: [{
                        name: 'Level 3',
                        y: 1.5,
                        drilldown: 'react-level-2'
                    },
                    ['one', 1],
                    ['two', 0.5],
                    ['three', 1],
                    ['four', 1],
                    ['five', 1],
                    ]
                },
                {

                    id: 'react-level-2',
                    data: [0, 4, 3, 2, 3, 6, 0, 4, 3, 2, 3, 6],
                },

                //   third level

                {
                    id: 'node',
                    data: [{
                        name: 'Level 3',
                        y: 1.5,
                        drilldown: 'node-level-2'
                    },
                    ['one', 1],
                    ['two', 0.5],
                    ['three', 1],
                    ['four', 1],
                    ['five', 1],
                    ]
                },
                {

                    id: 'node-level-2',
                    data: [0, 4, 3, 2, 3, 6, 0, 4, 3, 2, 3, 6],
                },

                {
                    id: 'node-level-2',
                    data: [{
                        name: 'Level 4',
                        y: 1.5,
                        drilldown: 'node-level-3'
                    },
                    ['one', 1],
                    ['two', 0.5],
                    ['three', 1],
                    ['four', 1],
                    ['five', 1],
                    ]
                },
                {

                    id: 'node-level-3',
                    data: [0, 4, 3, 2, 3, 6, 0, 4, 3, 2, 3, 6],
                },

                {
                    id: 'node-level-3',
                    data: [{
                        name: 'Level 5',
                        y: 1.5,
                        drilldown: 'node-level-4'
                    },
                    ['one', 1],
                    ['two', 0.5],
                    ['three', 1],
                    ['four', 1],
                    ['five', 1],
                    ]
                },
                {

                    id: 'node-level-4',
                    data: [0, 4, 3, 2, 3, 6],
                }


                //    close  
            ]
        }



    }


    const chartComponent = useRef(null);

    useEffect(() => {
        setChart(chartComponent.current.chart);
    }, []);

    highchartsDrillDown(Highcharts);




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
                            <div className="date-range"> Date range </div>
                            <div className="forecasted"> Other </div>
                        </div>

                    </div>
                    {/* <HighchartsReact highcharts={Highcharts} options={options} /> */}
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={options}
                        ref={chartComponent}
                    />
                    <div className="bar-chart-footer">
                        <div className="reset-btn"> Reset View </div>
                        <div className="legend-btn"> Legend </div>
                    </div>
                </div>

            </div>
        </>

    );
};

export default Child;
