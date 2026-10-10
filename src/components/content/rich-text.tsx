import { Fragment, type ReactNode } from "react";
import {
  validDocument,
  type RichDocument,
  type RichNode,
} from "@/lib/content/model";

function renderNode(node: RichNode, key: number): ReactNode {
  const children = node.content?.map(renderNode);
  if (node.type === "text") {
    let text: ReactNode = node.text ?? "";
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") text = <strong>{text}</strong>;
      if (mark.type === "italic") text = <em>{text}</em>;
      if (mark.type === "strike") text = <s>{text}</s>;
      if (mark.type === "code") text = <code>{text}</code>;
    }
    return <Fragment key={key}>{text}</Fragment>;
  }
  switch (node.type) {
    case "doc":
      return <Fragment key={key}>{children}</Fragment>;
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading":
      return node.attrs?.level === 2 ? (
        <h2 key={key}>{children}</h2>
      ) : node.attrs?.level === 3 ? (
        <h3 key={key}>{children}</h3>
      ) : (
        <h4 key={key}>{children}</h4>
      );
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return (
        <ol key={key} start={node.attrs?.start}>
          {children}
        </ol>
      );
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      );
    case "hardBreak":
      return <br key={key} />;
    case "horizontalRule":
      return <hr key={key} />;
    default:
      return null;
  }
}
export function RichText({ content }: { content: RichDocument }) {
  return (
    <div className="content-prose">
      {validDocument(content) ? (
        renderNode(content, 0)
      ) : (
        <p>Nội dung chưa sẵn sàng.</p>
      )}
    </div>
  );
}
