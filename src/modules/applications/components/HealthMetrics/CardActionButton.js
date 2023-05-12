import React, { useState } from "react";
import { Spinner } from "react-bootstrap";

export default function CardActionButton({onSubmit, updateStep, label, type, field, setValue, submitting}) {
   const handleClick = () => {
       setValue(true);
       updateStep();
   }
    return <div
        className="card__action_button cursor-pointer"
        onClick={handleClick}
    >
        {submitting ? "Updating..." : label}
							{submitting && (
								<Spinner
									animation="border"
									role="status"
									variant="primary"
									size="sm"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							)}
    </div>;
}