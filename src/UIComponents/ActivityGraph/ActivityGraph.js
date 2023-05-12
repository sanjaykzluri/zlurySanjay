import React from "react";
import {
    AreaChart,
    ResponsiveContainer,
    linearGradient,
    YAxis,
    XAxis,
    Area,
    CartesianGrid,
} from "recharts";

export default function ActivityGraph(props) {

    return (
        <div style={{ width: "115px", height: "30px" }}>
            <ResponsiveContainer>
                <AreaChart
                    width={70}
                    height={30}
                    data={props.data}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2266E2" stopOpacity={0.2} />
                            <stop offset="60%" stopColor="#2266E2" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid horizontal={false} vertical={false} />
                    <XAxis tick={false} axisLine={false} hide={true} dataKey="timestamp" />
                    <YAxis
                        width={0}
                        tickCount={4}
                        tick={false}
                        domain={[0, (dataMax) => dataMax * 1.15]}
                    />
                    <Area isAnimationActive={true} dot={false} type="monotone" dataKey="count" stroke="#2266E2" fill="url(#colorPv)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
