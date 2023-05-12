import React from "react";
import ContentLoader from "react-content-loader";
export function InstancesHeaderLoader() {
	return (
		<div className="d-flex align-items-center">
			<ContentLoader width={60} height={60}>
				<rect width="60" height="60" rx="2" fill="#EBEBEB" />
			</ContentLoader>

			<div className="d-flex flex-column ml-14 common-font-style">
				<div className="instance-title font-color-black">
					<ContentLoader width={160} height={25}>
						<rect width="300" height="15" rx="1" fill="#EBEBEB" />
					</ContentLoader>
				</div>
				<div className="common-font-style instance__font14 font-color-gray-2">
					<ContentLoader width={300} height={8}>
						<rect width="260" height="10" rx="1" fill="#EBEBEB" />
					</ContentLoader>
				</div>
			</div>
		</div>
	);
}
