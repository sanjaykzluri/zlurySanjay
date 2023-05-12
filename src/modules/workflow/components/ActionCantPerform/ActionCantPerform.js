import React, { useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import play from "../../../../assets/icons/play-yellow.svg";

export default function ActionCantPerform(props) {
	return (
		<>
			<Modal size="md" show={props.show} onClose={() => props.close()}>
				<div className="text-center p-4">
					<img
						src={play}
						width={46}
						height={46}
						className="mb-4 mt-3"
					/>
					<h3 className="bold-600 font-18 grey mb-2">
						Action can't be perform for multiple user.
					</h3>
					<p className="font-14 grey-1 mb-3">
						This action cannot be perform for multiple user, either
						select just one user or try creating different workflow
						for this task
					</p>
					<div className="mb-4">
						<Button
							onClick={() => {
								props.close();
							}}
						>
							{" "}
							Continue
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}
