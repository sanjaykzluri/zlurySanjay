import { SuggestionMenu } from "common/SuggestionMenu/SuggestionMenu";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkSpecialCharacters, searchUsers } from "services/api/search";
import RoleContext from "services/roleContext/roleContext";
import { debounce } from "underscore";
import { client } from "utils/client";
import { TriggerIssue } from "utils/sentry";
import { Button } from "../../../../UIComponents/Button/Button";
import { getValueFromLocalStorage } from "../../../../utils/localStorage";
import {
	refreshPRState,
	resetIntegration,
	updateRequestForIntegrations,
} from "../../redux/integrations";
import { SendInvitationToCoworker } from "../../service/api";

export function IntegrationRequestCoworker(props) {
	const dispatch = useDispatch();
	const [onSending, setOnSending] = useState(false);
	const { partner } = useContext(RoleContext);
	const [formDetails, setFormDetails] = useState({
		name: null,
		email: null,
		message: `Hi, I was trying to set up ${partner?.name} for our organization. It needs authorization from the ${props.integration.name} administrator. Can you please help me with this?`,
	});
	const [isFormValidated, setIsFormValidated] = useState(false);
	const [showAccountForm, setShowAccountForm] = useState(false);

	const cancelToken = useRef();
	const [userSuggestions, setUserSuggestions] = useState([]);
	const [metadata, setMetadata] = useState({});
	const [userSuggestionsLoading, setUserSuggestionsLoading] = useState(true);
	const [value, setValue] = useState([]);
	const router = useSelector((state) => state.router);

	const { pathname } = router.location;

	const [showUserSuggestions, setShowUserSuggestions] = useState(false);
	const path = pathname.split("/");
	let pathName = path[1];

	const sendToCoworker = () => {
		setOnSending(true);
		const data = {
			org_id: getValueFromLocalStorage("userInfo").org_id,
			integration_id: props.integration.id,
			message: formDetails.message,
			to_email: formDetails.email,
			to_name: formDetails.name,
			sender_email: getValueFromLocalStorage("user").email,
			sender_name: getValueFromLocalStorage("user").name,
			integration_name: props.integration.name,
			user_id: getValueFromLocalStorage("userInfo").user_id,
			new_scopes: props.scopes,
			orgIntegrationId: props.addScopesToOrgID,
		};
		SendInvitationToCoworker(data).then((res) => {
			if (res?.orgInviteId) {
				props.onConnectionSuccessfull &&
					props.onConnectionSuccessfull();
				props.onRequestSent({
					...data,
					...{
						orgInviteId: res?.orgInviteId,
						orgInviteName: res?.name,
					},
				});
			}
		});
	};

	const generateUserSuggestions = useCallback(
		debounce((query, reqCancelToken) => {
			if (query && query.length >= 1) {
				if (checkSpecialCharacters(query, true)) {
					setUserSuggestions([]);
					setUserSuggestionsLoading(false);
				} else {
					searchUsers(
						query,
						reqCancelToken,
						true,
						props.field_id,
						pathName === "users" ? "users" : "applications"
					)
						.then((res) => {
							if (
								res.results ||
								res.data ||
								res[0].custom_fields
							) {
								setUserSuggestions(
									res.results ||
										res.data ||
										res[0].custom_fields
								);
							} else if (res.error) {
								setUserSuggestions([]);
							}
							setUserSuggestionsLoading(false);
						})
						.catch((err) => {
							if (!client.isCancel(err)) {
								if (metadata.label) {
									TriggerIssue(
										`Error while searching users`,
										err
									);
								} else {
									TriggerIssue(`Error while searching`, err);
								}
								setUserSuggestionsLoading(false);
								setUserSuggestions([]);
							}
						});
				}
			}
		}, 300)
	);

	const handleAppOwnerChange = (query) => {
		query = query?.trimStart();
		setValue(query);
		setFormDetails(
			Object.assign({}, formDetails, {
				name: query,
			})
		);

		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);

		if (query.length === 0) {
			setShowUserSuggestions(false);
			setUserSuggestionsLoading(false);
			return;
		}

		setUserSuggestionsLoading(true);
		setShowUserSuggestions(true);
		cancelToken.current = client.CancelToken.source();
		generateUserSuggestions(query, cancelToken.current);
	};

	const handleAppOwnerSelect = (respObj) => {
		setFormDetails(
			Object.assign({}, formDetails, {
				name: respObj.user_name,
				email: respObj.user_email,
			})
		);
		setShowUserSuggestions(false);
		setUserSuggestions([]);
	};

	useEffect(() => {
		validation();
	}, [formDetails.name, formDetails.email, formDetails.message]);

	const handleInputChange = (name, value) => {
		setFormDetails(Object.assign({}, formDetails, { [name]: value }));
	};

	const validation = () => {
		let flag = false;
		for (const item in formDetails) {
			if (!formDetails[item] || formDetails[item] === "") {
				flag = true;
				break;
			}
		}
		flag ? setIsFormValidated(false) : setIsFormValidated(true);
	};

	return (
		<div className="pl-6 pr-6">
			<p className="font-12 bold-400 grey">
				Enter a coworker’s email and we’ll send them everything they
				need to complete this step.
			</p>
			<div className="mb-2">
				<label className="pl-2 d-block font-12 black o-8">Name</label>
				<input
					className="w-100 pl-2"
					type="text"
					placeholder="Name"
					name="name"
					value={formDetails.name}
					onChange={(e) =>
						handleAppOwnerChange(e.target.value, e.target.name)
					}
				/>
			</div>
			<div className="position-relative w-100 mb-2">
				<SuggestionMenu
					className="position-static"
					show={showUserSuggestions}
					loading={userSuggestionsLoading}
					options={userSuggestions}
					onSelect={handleAppOwnerSelect}
					dataKeys={{
						image: "profile_img",
						text: "user_name",
						email: "user_email",
					}}
				/>
			</div>
			<div className="mb-3">
				<label className="pl-2 d-block font-12 black o-8">Email</label>
				<input
					className="w-100 pl-2"
					type="email"
					name="email"
					placeholder="Email"
					value={formDetails.email}
					onClick={() => {
						setShowUserSuggestions(false);
					}}
					onChange={(e) =>
						handleInputChange(e.target.name, e.target.value)
					}
				/>
			</div>
			<div className="mb-3">
				<label className="pl-2 d-block font-12 black o-8">
					Message
				</label>
				<textarea
					className="w-100 p-2"
					rows="5"
					name="message"
					value={formDetails.message}
					onChange={(e) =>
						handleInputChange(e.target.name, e.target.value)
					}
				/>
			</div>
			<div className="mb-4 text-center">
				<Button
					onClick={() => sendToCoworker()}
					style={{ width: "227px" }}
					className="text-center"
					disabled={!isFormValidated}
				>
					{!onSending ? "Send" : "Requesting..."}
				</Button>
			</div>
		</div>
	);
}
