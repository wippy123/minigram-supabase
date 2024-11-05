import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import { BackgroundColor } from "./extensions/BackgroundColor";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Code,
  Highlighter,
  Table as TableIcon,
} from "lucide-react";

export const TiptapEditor = ({
  content,
  onUpdate,
}: {
  content: string;
  onUpdate: (content: string) => void;
}) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isHtmlDialogOpen, setIsHtmlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageWidth, setImageWidth] = useState("100%");
  const [imageHeight, setImageHeight] = useState("auto");
  const [htmlContent, setHtmlContent] = useState("");
  const [highlightColor, setHighlightColor] = useState("#ffff00"); // Default yellow
  const [tableBordersEnabled, setTableBordersEnabled] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link,
      TiptapImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "resize-handle",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
      TextStyle,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      BackgroundColor.configure({
        HTMLAttributes: {
          class: "bg-color",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: tableBordersEnabled ? "table-borders" : "",
        },
      }),
      TableRow.extend({
        renderHTML({ HTMLAttributes }) {
          const attrs = { ...HTMLAttributes };
          if (tableBordersEnabled) {
            attrs.class = (attrs.class || "") + " table-row-border";
          }
          return ["tr", attrs, 0];
        },
      }),
      TableHeader,
      TableCell,
    ],
    content: content,
  });

  useEffect(() => {
    if (editor) {
      editor
        .chain()
        .focus()
        .updateAttributes("table", {
          class: tableBordersEnabled ? "table-borders" : "",
        })
        .run();
    }
  }, [tableBordersEnabled, editor]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const newContent = editor.getHTML();
      if (newContent !== content) {
        onUpdate(newContent);
      }
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, content, onUpdate]);

  const addImage = () => {
    if (editor && imageUrl) {
      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
        })
        .run();
      setImageUrl("");
      setImageWidth("100%");
      setImageHeight("auto");
      setIsImageDialogOpen(false);
    }
  };

  const insertHtml = () => {
    if (editor && htmlContent) {
      editor.commands.insertContent(htmlContent);
      setHtmlContent("");
      setIsHtmlDialogOpen(false);
    }
  };

  const applyHighlight = () => {
    if (editor) {
      editor.chain().focus().toggleHighlight({ color: highlightColor }).run();
    }
  };

  const insertTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const addColumnBefore = () => {
    editor?.chain().focus().addColumnBefore().run();
  };

  const addColumnAfter = () => {
    editor?.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor?.chain().focus().deleteColumn().run();
  };

  const addRowBefore = () => {
    editor?.chain().focus().addRowBefore().run();
  };

  const addRowAfter = () => {
    editor?.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor?.chain().focus().deleteRow().run();
  };

  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
  };

  const toggleTableBorders = () => {
    setTableBordersEnabled(!tableBordersEnabled);
    if (editor) {
      editor
        .chain()
        .focus()
        .updateAttributes("table", {
          class: !tableBordersEnabled ? "table-borders" : "",
        })
        .run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md p-2 flex flex-col h-[200px]">
      <div className="mb-2 flex flex-wrap gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 })
              ? "bg-accent text-accent-foreground"
              : ""
          }
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 })
              ? "bg-accent text-accent-foreground"
              : ""
          }
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Input
          type="color"
          onInput={(event) =>
            editor
              .chain()
              .focus()
              .setColor((event.target as HTMLInputElement).value)
              .run()
          }
          value={editor.getAttributes("textStyle").color}
          className="w-8 h-8 p-0 border-none"
        />
        <Input
          type="color"
          onInput={(event) =>
            editor
              .chain()
              .focus()
              .setHighlight({ color: (event.target as HTMLInputElement).value })
              .run()
          }
          value={editor.getAttributes("textStyle").backgroundColor || "#ffffff"}
          className="w-8 h-8 p-0 border-none"
        />

        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Image className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-url" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-width" className="text-right">
                  Width
                </Label>
                <Input
                  id="image-width"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-height" className="text-right">
                  Height
                </Label>
                <Input
                  id="image-height"
                  value={imageHeight}
                  onChange={(e) => setImageHeight(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={addImage}>Insert Image</Button>
          </DialogContent>
        </Dialog>

        <Dialog open={isHtmlDialogOpen} onOpenChange={setIsHtmlDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Code className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert HTML</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="html-content" className="text-right">
                  HTML Content
                </Label>
                <Textarea
                  id="html-content"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="col-span-3"
                  rows={5}
                />
              </div>
            </div>
            <Button onClick={insertHtml}>Insert HTML</Button>
          </DialogContent>
        </Dialog>

        <Button
          size="icon"
          variant="outline"
          onClick={insertTable}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        {editor.isActive("table") && (
          <>
            <Button
              size="sm"
              variant={tableBordersEnabled ? "secondary" : "outline"}
              onClick={toggleTableBorders}
            >
              {tableBordersEnabled ? "Disable Borders" : "Enable Borders"}
            </Button>
            <Button size="sm" variant="outline" onClick={addColumnBefore}>
              Add Column Before
            </Button>
            <Button size="sm" variant="outline" onClick={addColumnAfter}>
              Add Column After
            </Button>
            <Button size="sm" variant="outline" onClick={deleteColumn}>
              Delete Column
            </Button>
            <Button size="sm" variant="outline" onClick={addRowBefore}>
              Add Row Before
            </Button>
            <Button size="sm" variant="outline" onClick={addRowAfter}>
              Add Row After
            </Button>
            <Button size="sm" variant="outline" onClick={deleteRow}>
              Delete Row
            </Button>
            <Button size="sm" variant="outline" onClick={deleteTable}>
              Delete Table
            </Button>
          </>
        )}
      </div>
      <EditorContent
        editor={editor}
        className="flex-grow overflow-y-auto prose max-w-none"
      />
    </div>
  );
};
