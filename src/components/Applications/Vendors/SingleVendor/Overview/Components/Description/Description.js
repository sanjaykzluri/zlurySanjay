import React, {
	Component,
	useState,
	useEffect,
	useContext,
	useRef,
} from "react";
import "./Description.css";
import { NameBadge } from "../../../../../../../common/NameBadge";
import useOutsideClick from "../../../../../../../common/OutsideClick/OutsideClick";
import check from "../../../../../../../assets/applications/check.svg";
import inactivecheck from "../../../../../../../assets/applications/inactivecheck.svg";
import EllipsisSVG from "../../../../../../../assets/applications/vendorsvg1.svg";
import { ChangeStatus } from "../../../../../Overview/ChangeStatus";
import ContentLoader from "react-content-loader";
import { EditVendor } from "../../../EditVendor";
import { Dropdown } from "react-bootstrap";
import { deleteVendor } from "../../../../../../../services/api/applications";
import { useHistory } from "react-router-dom";
import { TriggerIssue } from "../../../../../../../utils/sentry";
import { unescape } from "../../../../../../../utils/common";
import UserInfoTableComponent from "../../../../../../../common/UserInfoTableComponent";
import RoleContext from "../../../../../../../services/roleContext/roleContext";
const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		<img src={EllipsisSVG} width="20" />
	</a>
));
export default function Description(props) {
	let history = useHistory();
	const vendor = props.vendor;
	const [ellipsisclicked, setEllipsisClicked] = useState(false);
	const [editVendorOpen, setEditVendorOpen] = useState(false);
	const closeEditVendor = () => {
		setEditVendorOpen(false);
	};
	const { isViewer } = useContext(RoleContext);
	const getvendorLogo = () => {
		if (!vendor) return;
		const logo = vendor.logo;

		if (logo && logo !== "") {
			return (
				<img
					style={{
						height: "48px",
						width: "48px",
						borderRadius: "50%",
					}}
					alt={""}
					src={unescape(vendor.logo)}
				/>
			);
		} else {
			return (
				<NameBadge
					className="mr-2"
					fontSize={18}
					name={vendor.name}
					borderRadius={50}
					width={48}
				></NameBadge>
			);
		}
	};
	const getownerLogo = () => {
		if (!vendor) return;
		const logo = vendor.owner?.owner_profile;
		if (logo) {
			return (
				<img
					src={unescape(logo)}
					width={26}
					height={26}
					className="rounded-circle"
				/>
			);
		} else {
			return (
				<NameBadge
					name={vendor.owner?.owner_name}
					width={26}
					height={26}
					className="rounded-circle"
				/>
			);
		}
	};
	function statusFormatter() {
		if (!vendor) return;
		const status = vendor.status === "active" ? "active" : "inactive";
		return (
			<div className="vendordescription__status">
				{status === "active" ? (
					<img src={check} width={6}></img>
				) : (
					<img src={inactivecheck} width={6}></img>
				)}
				<span
					style={{ marginLeft: "4px", textTransform: "capitalize" }}
				>
					{status}
				</span>
			</div>
		);
	}
	function ownerFormatter() {
		if (!vendor || !vendor.owner) return;
		return (
			<UserInfoTableComponent
				user_account_type={vendor.owner?.owner_account_type}
				user_profile={vendor.owner?.owner_profile}
				row={vendor.owner}
				user_id={vendor.owner?.owner_id}
				user_name={vendor.owner?.owner_name}
			></UserInfoTableComponent>
		);
	}
	const removeVendor = () => {
		deleteVendor(vendor._id)
			.then((res) => {
				if (res.status === "success") {
					history.push("/licenses/vendors");
				}
			})
			.catch((err) => {
				TriggerIssue("Error in deleting the vendor", err);
			});
	};
	return (
		<>
			{props.loading ? (
				<div className="vendordescription__cont">
					<div className="vendordescription__cont__d1">
						<ContentLoader
							style={{ marginRight: 8 }}
							width={48}
							height={48}
							viewBox="0 0 48 48"
						>
							<circle cx="24" cy="24" r="24" fill="#EBEBEB" />
						</ContentLoader>
						<div className="vendordescription__cont__d1__d2">
							<div className="vendordescription__cont__d1__d2__d1">
								<ContentLoader width={108} height={12}>
									<rect
										width={108}
										height={12}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							{/* need this property */}
							<div className="vendordescription__cont__d1__d2__d2">
								<ContentLoader width={76} height={9}>
									<rect
										width={76}
										height={9}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</div>
						<img
							className="vendordescription__cont__d1__d3"
							src={EllipsisSVG}
						></img>
					</div>
					<hr style={{ margin: "21px 0px 0px 0px" }}></hr>
					<div className="vendordescription__cont__d2">
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								<ContentLoader width={69} height={10}>
									<rect
										width={69}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								<ContentLoader width={143} height={10}>
									<rect
										width={143}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</div>
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								<ContentLoader width={69} height={10}>
									<rect
										width={69}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								<ContentLoader width={109} height={10}>
									<rect
										width={143}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</div>
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								<ContentLoader width={69} height={10}>
									<rect
										width={69}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								<ContentLoader width={143} height={10}>
									<rect
										width={143}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</div>
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								<ContentLoader width={69} height={10}>
									<rect
										width={69}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								<ContentLoader width={95} height={10}>
									<rect
										width={143}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</div>
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								<ContentLoader width={69} height={10}>
									<rect
										width={69}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								<ContentLoader width={143} height={10}>
									<rect
										width={143}
										height={10}
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						</div>
					</div>
					<hr className="mr-0"></hr>
				</div>
			) : (
				<div className="vendordescription__cont">
					<div className="vendordescription__cont__d1">
						<div className="d-flex flex-row">
							<div className="vendordescription__cont__d1__d2">
								{getvendorLogo()}
							</div>
							<div className="vendordescription__cont__d1__d2">
								<div className="vendordescription__cont__d1__d2__d1 truncate_name">
									{vendor.name}
								</div>
							</div>
						</div>
						{!isViewer && (
							<div>
								<Dropdown className="ml-2">
									<Dropdown.Toggle as={ellipsis} />
									<Dropdown.Menu>
										<Dropdown.Item
											onClick={() =>
												setEditVendorOpen(true)
											}
										>
											Edit Vendor
										</Dropdown.Item>
										<Dropdown.Divider className="mx-3 my-1" />
										<Dropdown.Item
											onClick={() => removeVendor()}
										>
											Delete Vendor
										</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</div>
						)}
					</div>
					<hr style={{ margin: "21px 0px 0px 0px" }}></hr>
					<div className="vendordescription__cont__d2">
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								TYPE
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								{vendor && vendor?.type === "reseller"
									? "Reseller"
									: "Direct Seller"}
							</div>
						</div>
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								STATUS
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								{vendor && vendor.status && statusFormatter()}
							</div>
						</div>
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								OWNER
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								{vendor && vendor.owner && ownerFormatter()}
							</div>
						</div>
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								CATEGORY
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								{`${
									Array.isArray(vendor?.category) &&
									vendor?.category?.slice(0, 2)?.join(", ")
								} ${vendor?.category?.length > 2 ? "..." : ""}`}
								{Array.isArray(vendor?.category) &&
									vendor?.category?.length > 2 && (
										<div className="nav-item">
											<div
												className={`cursor-pointer glow_blue font-12`}
												onClick={() =>
													setEditVendorOpen(true)
												}
											>
												View More
											</div>
										</div>
									)}
							</div>
						</div>
						<div className="vendordescription__cont__d2__row">
							<div className="vendordescription__cont__d2__row__d1">
								WEBSITE
							</div>
							<div className="vendordescription__cont__d2__row__d2">
								<a
									className="d-inline-block"
									href={
										vendor &&
										vendor.website &&
										`https://${vendor.website}`
									}
									target="_blank"
									rel="noreferrer"
								>
									<span>
										{vendor &&
											vendor.website &&
											unescape(vendor.website)}
									</span>
								</a>
							</div>
						</div>
						{vendor && vendor.custom && (
							<div className="vendordescription__cont__d2__row">
								<div className="vendordescription__cont__d2__row__d1">
									CUSTOM
								</div>
								<div className="vendordescription__cont__d2__row__d2">
									{vendor.custom}
								</div>
							</div>
						)}
					</div>
					<hr className="mr-0"></hr>
				</div>
			)}
			{editVendorOpen && (
				<>
					<div className="modal-backdrop show"></div>
					<div style={{ display: "block" }} className="modal"></div>
					<EditVendor
						vendor={vendor}
						show={editVendorOpen}
						onHide={closeEditVendor}
						fetchVendorOverview={props.fetchVendorOverview}
					/>
				</>
			)}
		</>
	);
}
