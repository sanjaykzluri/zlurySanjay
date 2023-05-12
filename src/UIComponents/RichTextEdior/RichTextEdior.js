import React, { useCallback, useEffect } from "react";
import richTextEditorTheme from "./themes/richTextEditorTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import "./richTextEditorStyle.css";
// import onChange from "./onChange";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot, $getSelection } from "lexical";

function Placeholder() {
	return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorConfig = {
	namespace: "HTMLEditor",
	// The editor theme
	theme: richTextEditorTheme,
	editable: true,
	// Handling of errors during update
	onError(error) {
		throw error;
	},
	// Any custom nodes go here
	nodes: [
		HeadingNode,
		ListNode,
		ListItemNode,
		QuoteNode,
		CodeNode,
		CodeHighlightNode,
		TableNode,
		TableCellNode,
		TableRowNode,
		AutoLinkNode,
		LinkNode,
	],
};

export default function RichTextEdior(props) {
	const { value, onChange } = props;
	return (
		<>
			<LexicalComposer initialConfig={editorConfig}>
				<Editor value={value} onChange={onChange} />
			</LexicalComposer>
		</>
	);
}

export const Editor = (props) => {
	const { value, onChange } = props;
	const [editor] = useLexicalComposerContext();

	// set defaultValue and register onChange
	useEffect(() => {
		// if (!value || !editor) {
		// 	return;
		// }

		// editor.registerUpdateListener(() => {
		// 	editor.update(() => {
		// 		const html = $generateHtmlFromNodes(editor, null);
		// 		// use `onChange` from props
		// 		onChange && onChange(html);
		// 	});
		// });

		editor.update(() => {
			const parser = new DOMParser();
			const dom = parser.parseFromString(value, "text/html");
			const nodes = $generateNodesFromDOM(editor, dom);
			$getRoot().select();
			const selection = $getSelection();
			selection.insertNodes(nodes);
		});
	}, [editor]);

	const onStateChange = (editorState, editor) => {
		editor.update(() => {
			const raw = $generateHtmlFromNodes(editor, null);
			onChange && onChange(raw);
		});
	};

	return (
		<>
			<div className="editor-container">
				<ToolbarPlugin />
				<div className="editor-inner">
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								autoFocus={false}
								className="editor-input"
							/>
						}
						placeholder={<Placeholder />}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<OnChangePlugin
						onChange={onStateChange}
						ignoreHistoryMergeTagChange
						ignoreInitialChange
						ignoreSelectionChange
					/>
					<HistoryPlugin />
					{/* <TreeViewPlugin /> */}
					{/* <AutoFocusPlugin /> */}
					<CodeHighlightPlugin />
					<ListPlugin />
					<LinkPlugin />
					<AutoLinkPlugin />
					<ListMaxIndentLevelPlugin maxDepth={7} />
					<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
				</div>
			</div>
		</>
	);
};
