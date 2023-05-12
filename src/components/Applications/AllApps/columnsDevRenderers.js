const columns = [
	{
		dataField: "app_name",
		text: "Application",
		displayName: "a",
		formatter: (row, data, rowindex) => (
			<Link
				to={`/applications/${encodeURI(data.app_id)}#overview`}
				style={{ textDecoration: "none" }}
				className="custom__app__name__css"
			>
				<div className="flex flex-row align-items-center">
					{data.app_logo && (
						<img
							src={data.app_logo}
							alt={data.app_name}
							style={{
								height: "auto",
								width: "28px",
							}}
						/>
					)}
					{!data.app_logo && (
						<NameBadge width={28} name={data.app_name} />
					)}
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{row}</Tooltip>}
					>
						<div
							className="truncate_10vw"
							style={{ marginLeft: "8px" }}
						>
							{row}
						</div>
					</OverlayTrigger>
					<div
						className="d-flex badge badge-pill badge-light align-items-center ml-1 p-1"
						role="alert"
					>
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
									<div className="text-muted m-1">
										{data.app_auth_status === "authorized"
											? "Authorised"
											: data.app_auth_status ===
											  "restricted"
											? "Restricted"
											: "Needs Review"}
									</div>
								</Tooltip>
							}
						>
							{data.app_auth_status === "authorized" ? (
								<img className="m-auto" src={authorised}></img>
							) : data.app_auth_status === "restricted" ? (
								<img className="m-auto" src={restricted}></img>
							) : (
								<img className="m-auto" src={needsreview}></img>
							)}
						</OverlayTrigger>
					</div>
				</div>
			</Link>
		),
	},
	{
		dataField: "app_owner_name",
		text: "Owner",
		displayName: "b",
		formatter: (data, row) => (
			<ChangeOwner
				fieldName="owner"
				updateFunc={(appId, patchObj) =>
					updateAppOwner(
						appId,
						Array.isArray(patchObj?.patches)
							? patchObj.patches[0].value
							: ""
					)
				}
				userId={row.app_owner_id}
				userName={row.app_owner_name}
				userImage={row.app_owner_profile}
				idFromTable={row._id}
				isAppTable={true}
				ownerNameStyle="truncate_10vw"
				refreshReduxState={() => {
					setChecked([]);
					dispatch({
						type: applicationConstants.DELETE_APPLICATIONS_CACHE,
					});
					setRefreshTable(true);
				}}
			/>
		),
	},
	{
		dataField: "app_type",
		text: "Type",
		formatter: (row, data) => (
			<span style={{ textTransform: "capitalize" }}>
				{data?.app_type}
			</span>
		),
	},
	{
		dataField: "app_user_count",
		text: "Users",
		formatter: (cell) => <span>{cell ? cell : 0}</span>,
	},
	{
		dataField: "app_spend",
		text: "Spend(YTD)",
		formatter: kFormatter,
	},
	{
		dataField: "app_usage",
		text: "Usage",
		formatter: (row, data) => (
			<DottedProgress value={data.app_usage || 0}></DottedProgress>
		),
	},
	{
		dataField: "app_category_name",
		text: "Category",
		formatter: (row, data) => (
			<>
				{row && row.length > 0 ? (
					<>
						{data.app_is_custom ? (
							<ChangeCategory
								categoryId={data.app_category_id || ""}
								categoryName={data.app_category_name || ""}
								idFromTable={data._id}
							/>
						) : (
							<div className="font-weight-normal">
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{data.app_category_name || ""}
										</Tooltip>
									}
								>
									<div className="truncate_10vw">
										{data.app_category_name || ""}
									</div>
								</OverlayTrigger>
							</div>
						)}
					</>
				) : (
					<>
						{data.app_is_custom && (
							<ChangeCategory idFromTable={data._id} />
						)}
					</>
				)}
			</>
		),
	},
	{
		dataField: "app_status",
		text: "Status",
		displayName: "c",
		formatter: statusFormatter,
	},
];
