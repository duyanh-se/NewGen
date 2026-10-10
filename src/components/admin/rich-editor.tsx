"use client";
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { RichDocument } from "@/lib/content/model";

export default function RichEditor({
  initial,
  onChange,
  disabled,
}: {
  initial: RichDocument;
  disabled: boolean;
  onChange: (value: RichDocument) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: false,
        underline: false,
      }),
    ],
    content: initial,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": "Nội dung chi tiết",
        class: "content-prose",
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    // Tiptap attributes may have a null prototype; normalize before React action serialization.
    onUpdate: ({ editor }) =>
      onChange(JSON.parse(JSON.stringify(editor.getJSON())) as RichDocument),
  });
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);
  if (!editor) return <p>Đang mở trình soạn thảo…</p>;
  const controls = [
    {
      label: "Đậm",
      active: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Nghiêng",
      active: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Tiêu đề",
      active: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Danh sách",
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Đánh số",
      active: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Trích dẫn",
      active: editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Hoàn tác",
      active: false,
      run: () => editor.chain().focus().undo().run(),
    },
    {
      label: "Làm lại",
      active: false,
      run: () => editor.chain().focus().redo().run(),
    },
  ];
  return (
    <div className="admin-editor">
      <div
        className="admin-toolbar"
        role="toolbar"
        aria-label="Định dạng nội dung"
      >
        {controls.map((c) => (
          <button
            key={c.label}
            type="button"
            aria-pressed={c.active}
            onClick={c.run}
          >
            {c.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
