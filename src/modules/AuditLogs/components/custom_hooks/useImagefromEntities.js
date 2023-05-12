import { useState, useEffect } from "react";
import { TriggerIssue } from "../../../../utils/sentry";
export const useImagefromEntities = (entity, isCancelled) => {
	const [image, setImage] = useState(null);
	useEffect(() => {
		if (!isCancelled.current) {
			const fetchImage = async () => {
				try {
					if (entity) {
						const response = await import(
							`assets/auditlogs/entities/${entity}.svg`
						);
						setImage(response.default);
					}
				} catch (err) {
					TriggerIssue(
						`Error in importing the entity image - ${entity}`,
						err
					);
				}
			};

			fetchImage();
		}
	}, [entity]);
	return [image];
};
