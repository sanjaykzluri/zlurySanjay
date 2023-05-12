import React from "react";
import { useContext } from "react";
import ContentLoader from "react-content-loader";
import RoleContext from "services/roleContext/roleContext";
import { getValueFromLocalStorage } from "utils/localStorage";
import howToInstallStep1 from "../../../../assets/agents/howToInstallStep1.svg";
import howToInstallStep2 from "../../../../assets/agents/howToInstallStep2.svg";
import howToInstallStep3 from "../../../../assets/agents/howToInstallStep3.svg";
import howToInstallStep4 from "../../../../assets/agents/howToInstallStep4.svg";
import NumberPill from "../../../../UIComponents/NumberPill/NumberPill";

const partner = getValueFromLocalStorage("partner");

const howToInstallContent = [
	{
		title: "Add in Seconds",
		content: "Install the agent.",
		img: howToInstallStep1,
		imgHeight: 137,
		imgWidth: 219,
	},
	{
		title: "Enter your work email",
		content: "You will get an OTP on your email address.",
		img: howToInstallStep2,
		imgHeight: 135,
		imgWidth: 177,
	},
	{
		title: "Verification",
		content: "Enter the OTP & you will be signed in.",
		img: howToInstallStep3,
		imgHeight: 145,
		imgWidth: 175,
	},
	{
		title: "All Set",
		content: `The application will continue to send data to ${partner?.name} servers in the background.`,
		img: howToInstallStep4,
		imgHeight: 139,
		imgWidth: 175,
	},
];

export default function HowToInstall({ loading, step_images }) {
	return (
		<>
			{loading ? (
				<HowToInstallLoader />
			) : (
				<div className="d-flex flex-column">
					<div className="font-18" style={{ marginTop: "30px" }}>
						How to install
					</div>
					<div className="how-to-install-grid">
						{howToInstallContent.map((item, index) => (
							<div className="how-to-install-step" key={index}>
								<img src={step_images?.[index]} height={200} />
								<div
									className="d-flex w-100"
									style={{ marginTop: "5px" }}
								>
									<NumberPill number={index + 1} />
									<div
										className="d-flex flex-column"
										style={{ marginLeft: "12px" }}
									>
										<div className="font-12 bold-600">
											{item.title}
										</div>
										<div className="font-10 grey-1">
											{item.content}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</>
	);
}

function HowToInstallLoader() {
	return (
		<div className="how-to-install-grid">
			{howToInstallContent.map((item, index) => (
				<div className="how-to-install-step" key={index}>
					<div className="d-flex w-100">
						<ContentLoader width={270} height={225}>
							<rect
								y={175}
								width={270}
								height={10}
								fill="#EBEBEB"
							/>
							<rect
								y={200}
								width={196}
								height={10}
								fill="#EBEBEB"
							/>
						</ContentLoader>
					</div>
				</div>
			))}
		</div>
	);
}
