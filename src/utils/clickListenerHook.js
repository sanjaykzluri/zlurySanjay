import { useEffect } from "react";

export function useOutsideClickListener(
	refs,
	callBack,
	deps = [],
	ignoreClasses = []
) {
	useEffect(() => {
		function handleClickOutside(event) {
			let ignore = false;
			ignoreClasses.forEach((res) => {
				const element = document.getElementsByClassName(res);
				if (
					element.length &&
					element[0].parentNode.contains(event.target)
				) {
					ignore = true;
				}
			});
			if (!ignore) {
				if (Array.isArray(refs)) {
					if (
						!refs.find(
							(ref) =>
								ref.current &&
								ref.current.contains(event.target)
						)
					)
						callBack();
				} else if (
					refs.current &&
					!refs.current.contains(event.target)
				) {
					callBack();
				}
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [refs, ...deps]);
}
