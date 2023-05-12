import React, { createRef, useEffect, useRef, useState } from "react";
import { Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Slider from "react-slick";
import { getAppHealthCards, getCards } from "services/api/applications";
import HealthCardContainer from "./HealthCardContainer";
import {
	fetchAppHealthCards,
	fetchGlobalCards,
	fetchGlobalHealthCards,
	resetAppHealthCards,
	selectAppHealthCards,
	selectGlobalHealthCards,
} from "./redux";
import leftarrow from "components/Transactions/Recognised/leftarrow.svg";
import rightarrow from "components/Transactions/Recognised/rightarrow.svg";
import cardsRefresh from "assets/cards_refresh.svg";
import _, { isEmpty } from "underscore";
import ContentLoader from "react-content-loader";
import { useWindowSize } from "utils/common";

const cardProps = {
	title: "Add App Owner",
	description: "some description",
	metaData: {
		icon: "edit",
	},
	action: {
		label: "Add App owner",
		type: "search",
	},
};

export default function HealthCardsSlider({
	app,
	recommandedCards,
	fetchAppDetails,
	tab,
}) {
	let sliderRef = createRef();
	const containerRef = useRef(null);
	const [activePage, setActivePage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [slidesPerPage, setSlidesPerPage] = useState(null);
	const dispatch = useDispatch();
	const { data: appHealthCards, loading } = useSelector(selectAppHealthCards);
	const [cards, setCards] = useState([]);
    const { width } = useWindowSize();
	useEffect(() => {
		if (recommandedCards && appHealthCards?.length > 0) {
			setCards([...appHealthCards, ...recommandedCards]);
		} else if (Array.isArray(appHealthCards)) {
			setCards(appHealthCards);
		}
	}, [appHealthCards, recommandedCards]);

	useEffect(() => {
		if (app?.app_id) dispatch(fetchAppHealthCards(app?.app_id, true, tab));
		return () => dispatch(resetAppHealthCards());
	}, [app?.app_id]);

	const settings = {
		appendDots: (dots) => {
			setTotalPages(dots.length);
			return <ul>{dots}</ul>;
		},
		rows: 1,
		dots: true,
		autoplay: false,
		infinite: false,
		// slidesToScroll: 3,
		// slidesToShow: 3,
		variableWidth: true,
		afterChange: (i) => {
			setActivePage(Math.ceil(i / 3) + 1);
		},
		ref: (r) => (sliderRef = r),
	};
useEffect(() => {

	const updatedSlidesPerPage = Math.floor(containerRef.current?.getBoundingClientRect().width/218);
	
	setSlidesPerPage(updatedSlidesPerPage);
	
	// setTotalPages
}, [width, containerRef.current])
	return (
		<>
			{(loading || cards?.length > 0) && (
				<div className="healthcardsslider__container" ref={containerRef}>
					<div className="d-flex justify-content-end">
						<div
							className="cursor-pointer card__refresh"
							onClick={() =>
								dispatch(
									fetchAppHealthCards(app?.app_id, true, tab)
								)
							}
						>
							<img src={cardsRefresh} />{" "}
							<span className="card__refresh m-2">Refresh</span>
						</div>
						<img
							src={leftarrow}
							className="cursor-pointer"
							onClick={() => {
								sliderRef.slickPrev();
							}}
						/>
						<span className="healthcardsslider__paginationtext">
							{`${parseInt(activePage)} of ${parseInt(
								totalPages
							)}`}
						</span>
						<img
							src={rightarrow}
							className="cursor-pointer"
							onClick={() => {
								const lastPage = totalPages/slidesPerPage;
								
								sliderRef.slickNext();
							}}
						/>
					</div>
						{loading
							? 
							<Slider>{[1, 2, 3].map(() => (
									<div className="card__container">
										<ContentLoader width={150} height={239}>
											<rect
												y={0}
												width={150}
												height={15}
												fill="#EBEBEB"
											/>
											<rect
												y={40}
												width={150}
												height={15}
												fill="#EBEBEB"
											/>
											<rect
												y={80}
												width={150}
												height={15}
												fill="#EBEBEB"
											/>
											<rect
												y={120}
												width={150}
												height={15}
												fill="#EBEBEB"
											/>
										</ContentLoader>{" "}
									</div>
							  ))}
							  </Slider>
							: 
					slidesPerPage && <Slider {...settings}  slidesToScroll={slidesPerPage} slidesToShow={slidesPerPage > 1 ? slidesPerPage -1 : 1}>
					{cards?.map((item) => (
									<div
										key={item?.card_id}
										className="health__slide__wrapper"
									>
										<HealthCardContainer
											{...item}
											app={app}
											fetchAppDetails={fetchAppDetails}
											tab={tab}
										/>
									</div>
							  ))}
					</Slider>}

				</div>
			)}
		</>
	);
}
