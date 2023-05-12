import React from "react";
import { Modal as BootstrapModal, Spinner } from "react-bootstrap";
import close from "../../assets/close.svg";
import { Button } from "../Button/Button";

import "./Modal.css";
export function Modal(props) {
	return (
		<BootstrapModal
			drawer={props.drawer}
			contentClassName={props.className || props.contentClassName}
			show={props.show}
			size={props.size}
			backdrop={props.backdrop || true}
			centered
			dialogClassName={props.dialogClassName}
			onHide={() => {
				if (props.onHide) {
					props.onHide();
				} else {
					props.onClose();
				}
			}}
		>
			{!props.hideCloseImage && !props.title && (
				<img
					width={12}
					className={`z_modal_close cursor-pointer ${props.imgClassName}`}
					alt="Close"
					src={close}
					onClick={() => {
						props.onClose();
					}}
				/>
			)}
			{props.title && (
				<BootstrapModal.Header
					className={props.headerStyle}
					closeButton={false}
				>
					{!props.hideCloseImage && (
						<img
							width={18}
							className="z_modal_close cursor-pointer"
							alt="Close"
							src={close}
							onClick={() => props.onClose()}
						/>
					)}
					<BootstrapModal.Title className={props?.titleClass}>
						<h3 className={`z__block-header font-18 bold-600`}>
							{props.title}
						</h3>
					</BootstrapModal.Title>
				</BootstrapModal.Header>
			)}
			<BootstrapModal.Body>{props.children}</BootstrapModal.Body>
			{!!props.footer && (
				<BootstrapModal.Footer>
					{!props.cancelNotPresent && (
						<Button type="link" onClick={() => props.onClose()}>
							{props.cancel}
						</Button>
					)}

					<Button
						onClick={() => props.onOk()}
						disabled={
							props.disableOkButton || props.submitInProgress
						}
					>
						{props.submitInProgress ? (
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
						) : (
							props.ok
						)}
					</Button>
				</BootstrapModal.Footer>
			)}
		</BootstrapModal>
	);
}

Modal.defaultProps = {
	cancel: "Cancel",
	ok: "Ok",
	size: "lg",
};
