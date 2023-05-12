import React, { Fragment, useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { Button } from "../../../../UIComponents/Button/Button";
import warning from "../../../../assets/warning.svg";

export default function AccountForm(props) {
    const [validated, setValidated] = useState(false);
    const [accountName, setAccountName] = useState();
    const [accountDescription, setAccountDescription] = useState(
        props.accountDescription
    );

    useEffect(() => {
        if (props.accountName) {
            setAccountName(props.accountName);
        }
    }, [props.accountName]);

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            props.onSave && props.onSave({ accountName, accountDescription });
            event.preventDefault();
            event.stopPropagation();
        }
        setValidated(true);
    };

    return (
        <Fragment>
            <Form
                noValidate
                validated={validated}
                onSubmit={(e) => handleSubmit(e)}
            >
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Control
                        defaultValue={props.accountName}
                        type="text"
                        placeholder="Name"
                        required
                        onChange={(e) => setAccountName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicDescription">
                    <Form.Control
                        defaultValue={props.accountDescription}
                        as="textarea"
                        placeholder="Description (Optional)"
                        rows={3}
                        onChange={(e) => setAccountDescription(e.target.value)}
                    />
                </Form.Group>
                {
                    props.isFailedMsg &&
                    <div className="d-flex warningMessage w-100 p-2 mb-3">
                        <img src={warning} />
                        <div className="font-12 ml-1">
                            We could not save your info due to {props.isFailedMsg}. Please
                            try again.
                        </div>
                    </div>
                }
                {props.isFailedMsg ? (
                    <Button
                        type="submit"
                        className="d-flex m-auto justify-content-center btn btn-outline-danger"
                        style={{ width: "92px" }}
                        disabled={!accountName || props.isLoading}
                    >
                        Retry
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        type="submit"
                        className="d-flex m-auto justify-content-center"
                        style={{ width: "92px" }}
                        disabled={!accountName || props.isLoading}
                    >
                        Save
                    </Button>
                )}
            </Form>
        </Fragment>
    );
}
