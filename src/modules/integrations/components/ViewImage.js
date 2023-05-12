import React, { useCallback, useState } from "react";
import ReactSimpleImageViewer from "react-simple-image-viewer";

const ViewImage = ({ imageSrc }) => {
	const [currentImage, setCurrentImage] = useState(0);
	const [isViewerOpen, setIsViewerOpen] = useState(false);

	const openImageViewer = useCallback((image) => {
		setCurrentImage([image]);
		setIsViewerOpen(true);
	}, []);

	const closeImageViewer = () => {
		setCurrentImage([]);
		setIsViewerOpen(false);
	};

	return (
		<div>
			<img
				width={"200px"}
				height="150px"
				src={imageSrc}
				className="cursor-pointer"
				onClick={() => openImageViewer(imageSrc)}
			/>
			{isViewerOpen && (
				<ReactSimpleImageViewer
					src={currentImage}
					currentIndex={0}
					disableScroll={true}
					closeOnClickOutside={true}
					onClose={closeImageViewer}
					leftArrowComponent={null}
					rightArrowComponent={null}
				/>
			)}
		</div>
	);
};

export default ViewImage;
