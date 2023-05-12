import React from "react";
import { Spinner } from "react-bootstrap";
import { Button, BUTTON_TYPE } from "UIComponents/Button/Button";

export default function UpdateCardFooter({onCancel,onSubmit, className, submitting, disableSave}) {
	return (
		<div className={`d-flex health__card__footer ${className}`}>
			<Button className="card__button-save" onClick={onSubmit} disabled={disableSave}
						>
							{submitting ? "Saving" : "Save"}
							{submitting && (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							)}
						</Button>
			<Button type={BUTTON_TYPE.LINK} className="card__button-cancel" variant="light" onClick={onCancel}>
				Cancel
			</Button>
		</div>
	);
}
