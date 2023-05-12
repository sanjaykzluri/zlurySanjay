import React from "react";

export function Logo({ light, viewBox }) {
	const fill = light ? "white" : "#2D2828";

	return (
		<svg
			className="logo"
			width="75"
			height="32"
			viewBox={viewBox || "0 0 75 32"}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="66.1829" cy="7.96449" r="7.96449" fill="#57E1FF" />
			<circle cx="66.1829" cy="7.96449" r="6.73919" fill="#D3FF57" />
			<circle cx="66.1829" cy="7.96449" r="5.10544" fill="#FF5757" />
			<path
				d="M47.1906 31.8253V13.3379H52.0135V21.3759L51.9465 18.9253C51.9465 16.3352 52.8817 15.5476 53.5214 14.9079C54.7467 13.6826 56.2111 13.0699 58.2429 13.0699H58.9797V18.2946H57.5731C56.2111 18.2946 55.1505 18.6631 54.3914 19.3999C53.6545 20.1367 53.2861 21.1973 53.2861 22.5816V31.8253H47.1906Z"
				fill={fill}
			/>
			<path
				d="M33.7752 31.9968C31.6764 31.9968 30.0464 31.3158 28.8854 29.9538C27.7467 28.5695 27.1773 26.868 27.1773 24.0324V13.315H33.2728V24.1998C33.2728 25.0259 33.5184 25.6958 34.0096 26.2093C34.5008 26.7229 35.1595 26.9796 35.9856 26.9796C36.8118 26.9796 37.4816 26.7229 37.9951 26.2093C38.5087 25.6958 38.7654 25.0036 38.7654 24.1328V13.315H44.8609V31.8024H40.0381V30.0046C39.3139 30.7386 38.8669 30.9825 37.7966 31.4904C36.5713 32.0719 35.4274 31.9968 34.0431 31.9968H33.7752Z"
				fill={fill}
			/>
			<path
				d="M63.7503 31.858V13.3705H69.8458V31.858H63.7503ZM61.4058 17.7915V13.3705H69.8458V17.7915H61.4058Z"
				fill={fill}
			/>
			<circle cx="66.1829" cy="7.96449" r="3.4717" fill="#2D2828" />
			<path
				d="M0 31.858V28.0734L8.20547 18.1934V18.7292L7.33469 17.6575L8.00452 17.9924H0.0669834V13.3705H15.0713V17.1551L6.8658 27.0352V26.4993L7.73659 27.571L7.06675 27.2361H15.2722V31.858H0Z"
				fill={fill}
			/>
			<path
				d="M18.4157 31.858V7.40902H24.5112V31.858H18.4157ZM16.3392 11.8299V7.40902H24.5112V11.8299H16.3392Z"
				fill={fill}
			/>
		</svg>
	);
}