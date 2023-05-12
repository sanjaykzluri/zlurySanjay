export const segmentAnalytics = function () {
	var analytics = (window.analytics = window.analytics || []);
	if (!analytics.initialize)
		if (analytics.invoked)
			window.console &&
				console.error &&
				console.error("Segment snippet included twice.");
		else {
			analytics.invoked = !0;
			analytics.methods = [
				"trackSubmit",
				"trackClick",
				"trackLink",
				"trackForm",
				"pageview",
				"identify",
				"reset",
				"group",
				"track",
				"ready",
				"alias",
				"debug",
				"page",
				"once",
				"off",
				"on",
				"addSourceMiddleware",
				"addIntegrationMiddleware",
				"setAnonymousId",
				"addDestinationMiddleware",
			];
			analytics.factory = function (e) {
				return function () {
					var t = Array.prototype.slice.call(arguments);
					t.unshift(e);
					analytics.push(t);
					return analytics;
				};
			};
			for (var e = 0; e < analytics.methods.length; e++) {
				var key = analytics.methods[e];
				analytics[key] = analytics.factory(key);
			}
			analytics.load = function (key, e) {
				var t = document.createElement("script");
				t.type = "text/javascript";
				t.async = !0;
				t.src =
					"https://cdn.segment.com/analytics.js/v1/" +
					key +
					"/analytics.min.js";
				var n = document.getElementsByTagName("script")[0];
				n.parentNode.insertBefore(t, n);
				analytics._loadOptions = e;
			};
			analytics._writeKey = process.env.REACT_APP_SEGMENT_WRITE_KEY;
			analytics.SNIPPET_VERSION = "4.13.2";
			analytics.load(process.env.REACT_APP_SEGMENT_WRITE_KEY);
		}
};

export function identifyAndGroup(user, userInfo, enableIntercom = true) {
	if (window.Intercom && enableIntercom) {
		window.Intercom("boot", {
			alignment: "left",
			hide_default_launcher: true,
		});
	}

	window.analytics.ready(function () {
		window.analytics.identify(
			userInfo.user_id,
			{
				name: user.name || "",
				email: user.email || "",
				email_verified: user.email_verified || "",
				orgId: userInfo.org_id || "",
				org_name: userInfo.org_name || "",
				plan: userInfo.org_plan.name || "",
				user_role: userInfo.user_role || "",
				user_status: userInfo.user_status || "",
				plan_expiry: userInfo.org_plan.trial_expires || "",
				org_beta_features: userInfo.org_beta_features || [],
			},
			{
				Intercom: {
					hideDefaultLauncher: true,
					alignment: "left",
					hide_default_launcher: true,
				},
			},
			function () {
				window.analytics.group(userInfo.org_id, {
					new: userInfo.new,
					fy_start_month: userInfo.org_fy_start_month || 1,
					id: userInfo.org_id,
					name: userInfo.org_name,
					status: userInfo.org_status,
					onboarding_status: userInfo.org_onboarding_status,
					user_id: userInfo.user_id,
					user_role: userInfo.user_role,
					user_status: userInfo.user_status,
					plan: userInfo.org_plan?.name,
					plan_expiry: userInfo.org_plan?.trial_expires,
					org_beta_features: userInfo.org_beta_features,
				});
			}
		);
	});
}

export function identifyUser(userEmail, userObj) {
	window.analytics.ready(function () {
		window.analytics.reset(window.analytics.identify(userEmail, userObj));
	});
}

export function onLogOut() {
	window.analytics?.reset(console.log("logged out"));
}
