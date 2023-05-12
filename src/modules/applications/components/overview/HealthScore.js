import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { Label, Legend, RadialBar, RadialBarChart, Tooltip } from "recharts";
import { Button } from "UIComponents/Button/Button";
import { capitalizeFirstLetter } from "utils/common";
import Gauge from "./Gauge";

export default function HealthScore(props) {
	const [value, setValue] = useState("");
	const [isCustom, setIsCustom] = useState(isCustom);
	const [customValue, setCustomValue] = useState("");
	return (
            <Gauge radius={10}  {...props}/>
	);
}
