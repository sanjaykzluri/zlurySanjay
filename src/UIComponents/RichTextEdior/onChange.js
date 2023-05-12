import { $getRoot, $getSelection } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
export default function onChange(editorState) {
	console.log("editorState", editorState);

	editorState.read(() => {
		const selection = $getSelection();
		const html = $generateHtmlFromNodes(editorState, selection);
		// use `onChange` from props
		console.log("onChange html", html); // gives error Cannot use method in read-only mode.
	});

	// editorState.update(() => {
	// 	// Read the contents of the EditorState here.
	// 	const root = $getRoot();
	// 	const selection = $getSelection();

	// 	const htmlString = $generateHtmlFromNodes(
	// 		editorState,
	// 		selection | null
	// 	);

	// 	console.log("htmlString", htmlString);
	// 	// console.log(root, selection);
	// });
}
