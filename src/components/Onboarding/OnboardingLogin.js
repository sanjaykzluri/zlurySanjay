import React, { useState, Component } from "react";
import "./Onboarding.css";
import { Link } from "react-router-dom";
import zluri from "./zluri.svg";
import google from "./google.svg";
import background from "./background.svg";
import { Form, Button } from "react-bootstrap";

import carouselimage1 from "./carouselimage1.svg";
import Slides from "./slides.js";

export class OnboardingLogin extends React.Component {
	render() {
		return (
			<>
				{/* style={{backgroundImage:`url(${background})`,
      backgroundPosition:"center",backgroundSize:"cover",backgroundRepeat:"no-repeat"
    }} */}
				<div className="onbl__cont">
					<div className="onbl__cont__l">
						<div className="onbl__l__div1">
							<img src={zluri} />
							<button type="submit">Log In</button>
						</div>
						<div className="onbl__l__div2">
							<div className="onbl__box__d1">Start for free</div>
							<div
								className="onbl__box__d2"
								style={{ marginTop: "6px" }}
							>
								Create an account
							</div>
							<div
								className="onbl__box__d3"
								style={{ marginTop: "29px" }}
							>
								<Form>
									<Form.Group controlId="formBasicName">
										<Form.Label bsPrefix="onbl__labelform">
											Your Name
										</Form.Label>
										<Form.Control
											bsPrefix="onbl__controlform"
											type="email"
											placeholder="Name"
											className="onbl__form__text"
										/>
									</Form.Group>

									<Form.Group controlId="formBasicEmail">
										<Form.Label bsPrefix="onbl__labelform">
											Your Work E-mail
										</Form.Label>
										<Form.Control
											bsPrefix="onbl__controlform"
											type="password"
											placeholder="name@company.com"
										/>
									</Form.Group>
									<Form.Group controlId="formBasicPassword">
										<Form.Label bsPrefix="onbl__labelform">
											Password
										</Form.Label>
										<Form.Control
											bsPrefix="onbl__controlform"
											type="password"
											placeholder="at least 8 characters"
										/>
									</Form.Group>
									<Form.Group controlId="formBasicCheckbox">
										<Form.Check
											type="checkbox"
											label="By creating an account you agree to the Terms of Use
and our Privacy Policy "
										/>
									</Form.Group>
									<Link to="/steps">
										<Button
											variant="primary"
											type="submit"
											style={{
												width: "100%",
												height: "48px",
											}}
										>
											Sign Up
										</Button>
									</Link>
								</Form>
							</div>
							<div
								className="onbl__box__d4"
								style={{ marginTop: "24px" }}
							>
								<div>Sign Up with SSO</div>
								<button type="submit">
									<img src={google}></img>
								</button>
								<button type="submit">
									<img src={google}></img>
								</button>
								<button type="submit">
									<img src={google}></img>
								</button>
							</div>
						</div>
					</div>
					<div className="onbl__cont__r">
						<Slides></Slides>
					</div>
				</div>
			</>
		);
	}
}
