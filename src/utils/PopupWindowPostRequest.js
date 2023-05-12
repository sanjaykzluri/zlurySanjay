/**
 * http://www.xtf.dk/2011/08/center-new-popup-window-even-on.html
 * @param {*} url
 * @param {*} title
 * @param {*} w
 * @param {*} h
 */
export function PopupWindowPostRequest(url, title, formData) {
	/** Calculate window position and position it to center */
	let w = 900,
		h = 500;
	let screen;
	let dualScreenLeft =
		window.screenLeft != undefined ? window.screenLeft : screen.left;
	let dualScreenTop =
		window.screenTop != undefined ? window.screenTop : screen.top;

	let width = window.innerWidth
		? window.innerWidth
		: document.documentElement.clientWidth
		? document.documentElement.clientWidth
		: screen.width;
	let height = window.innerHeight
		? window.innerHeight
		: document.documentElement.clientHeight
		? document.documentElement.clientHeight
		: screen.height;

	let left = width / 2 - w / 2 + dualScreenLeft;
	let top = height / 2 - h / 2 + dualScreenTop;
	let features = `scrollbars=yes, width=${w}, height=${h}, top=${top}, left=${left}`;
	/**Create form to make POST request */
	var form = document.createElement("form");
	form.method = "POST";
	form.action = url;
	form.target = title;
	for (let i in formData) {
		var input = document.createElement("input");
		input.type = "hidden";
		input.name = i;
		input.value = formData[i];
		form.appendChild(input);
	}
	document.body.appendChild(form);
	let newWindow = window.open("", title, features);
	form.submit();
	document.body.removeChild(form);
	// Puts focus on the newWindow
	if (window.focus) {
		if (newWindow && newWindow.focus) newWindow.focus();
	}
	return newWindow;
}
