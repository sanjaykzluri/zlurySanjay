import React from "react";
import PropTypes from "prop-types";
import "./Header.css";
import {
	LineChart,
	AreaChart,
	Area,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
class CustomizedDot extends React.Component {
	render() {
		const { cx, cy, stroke, payload, value, dotname } = this.props;

		if (payload.month_id === dotname) {
			return (
				<svg
					x={cx - 4.5}
					y={cy - 2}
					width="5"
					height="6"
					viewBox="0 0 5 6"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g filter="url(#filter0_d)">
						<circle cx="3" cy="2" r="2" fill="white" />
						<circle cx="3" cy="2" r="1.5" stroke="#2266E2" />
					</g>
					<defs>
						<filter
							id="filter0_d"
							x="0"
							y="0"
							width="6"
							height="6"
							filterUnits="userSpaceOnUse"
							colorInterpolationFilters="sRGB"
						>
							<feFlood
								floodOpacity="0"
								result="BackgroundImageFix"
							/>
							<feColorMatrix
								in="SourceAlpha"
								type="matrix"
								values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
							/>
							<feOffset dy="1" />
							<feGaussianBlur stdDeviation="0.5" />
							<feColorMatrix
								type="matrix"
								values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0"
							/>
							<feBlend
								mode="normal"
								in2="BackgroundImageFix"
								result="effect1_dropShadow"
							/>
							<feBlend
								mode="normal"
								in="SourceGraphic"
								in2="effect1_dropShadow"
								result="shape"
							/>
						</filter>
					</defs>
				</svg>
			);
		}

		return <div></div>;
	}
}
export default function HeaderGraph(props) {
	const { data, dataKey } = props;
	let dotname;
	if (data && data.length > 0) {
		data.sort((a, b) => {
			return a.year_id - b.year_id || a.month_id - b.month_id;
		});
		dotname = data[data.length - 1].month_id;
	}
	
	return (
		<ResponsiveContainer width="99%" height="100%">
			<AreaChart
				width={70}
				data={data}
				margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
			>
				<defs>
					<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="5%"
							stopColor="#2266E2"
							stopOpacity={0.2}
						/>
						<stop
							offset="60%"
							stopColor="#2266E2"
							stopOpacity={0}
						/>
					</linearGradient>
				</defs>
				{/* <CartesianGrid
						strokeDasharray="1 1"
						vertical={false}
						width={70}
						height={28}
					/> */}
				<YAxis
					width={0}
					tickCount={4}
					tick={false}
					domain={[0, (dataMax) => dataMax * 1.15]}
				/>
				<XAxis
					dataKey="month_id"
					tick={false}
					axisLine={false}
					hide={true}
				/>

				<Area
					type="monotone"
					dataKey={dataKey}
					stroke="#2266E2"
					fillOpacity={1}
					dot={<CustomizedDot dotname={dotname} />}
					fill="url(#colorPv)"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}

HeaderGraph.propTypes = {
	dataKey: PropTypes.string.isRequired,
}
