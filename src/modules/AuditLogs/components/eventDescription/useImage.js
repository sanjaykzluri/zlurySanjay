import needsreview from "assets/applications/needsreview.svg";
import restricted from "assets/applications/restricted.svg";
import unmanaged from "assets/applications/unmanaged.svg";
import teammanaged from "assets/applications/teammanaged.svg";
import individuallymanaged from "assets/applications/individuallymanaged.svg";
import centrally_managed from "assets/applications/authorised.svg";
import visa from "assets/transactions/visa.svg";
import mastercard from "assets/transactions/mastercard.svg";
import Amex from "assets/transactions/Amex.svg";
import other from "assets/transactions/otherpayment.svg";
import bank from "assets/transactions/bank.svg";
import arrow from "assets/auditlogs/arrow.svg";
import inactive from "assets/applications/inactivecheck.svg";
import active from "assets/applications/check.svg";
import { useState, useEffect } from "react";

const map = new Map();
map.set("centrally_managed", centrally_managed);
map.set("individually_managed", individuallymanaged);
map.set("arrow", arrow);
map.set("team_managed", teammanaged);
map.set("unmanaged", unmanaged);
map.set("restricted", restricted);
map.set("needs_review", needsreview);
map.set("active", active);
map.set("inactive", inactive);
map.set("mastercard", mastercard);
map.set("visa", visa);
map.set("american_express", Amex);
map.set("other", other);
map.set("bank", bank);
map.set("suspended", inactive);
const html_regex = new RegExp(/(<([^>]+)>)/i);
const useImage = (imgString, isCancelled) => {
	const [data, setData] = useState(null);
	useEffect(() => {
		if (!isCancelled.current) {
			let event_array = imgString.split(" ");
			for (let i = 0; i < event_array.length; i++) {
				if (
					event_array[i].includes("@") &&
					!html_regex.test(event_array[i])
				) {
					let str = event_array[i].substring(
						event_array[i].indexOf("@") + 1,
						event_array[i].lastIndexOf("@")
					);
					let imgsrc = map.get(str);
					event_array[i] = "<img src=" + imgsrc + ">";
				}
			}
			setData(event_array.join(" "));
		}
	}, [imgString]);

	return [data];
};

export default useImage;
