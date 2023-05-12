import React from "react";
import ReactDOM from "react-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import carouselimage2 from "./carouselimage2.svg";
import carouselimage1 from "./carouselimage1.svg";
export default class Slides extends React.Component {
	render() {
		let settings = {
			dots: true,
			arrows: false,
			appendDots: (dots) => (
				<div>
					<ul style={{ margin: "0px" }}> {dots} </ul>
				</div>
			),
		};
		return (
			<div
				className="container"
				style={{ maxWidth: "960px", height: "100vh", padding: "0px" }}
			>
				<Slider {...settings}>
					<div className="car__d1">
						<img src={carouselimage1} className="car__image1" />
						<img src={carouselimage2} className="car__image2" />
						<div className="car__text1">
							Get timely recommendations{" "}
						</div>
						<div className="car__text2">
							Get recommendations that’ll help your team optimize
							SaaS spendings and stick to the annual budget
						</div>
					</div>
				</Slider>
			</div>
		);
	}
}
