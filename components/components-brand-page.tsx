"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Highlight from "@tiptap/extension-highlight";

const TiptapEditor = ({
  content,
  onUpdate,
}: {
  content: string;
  onUpdate: (content: string) => void;
}) => {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageWidth, setImageWidth] = useState("100%");
  const [imageHeight, setImageHeight] = useState("auto");

  const editor = useEditor({
    extensions: [
      StarterKit,
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
      Highlight, // Add this line to include the Highlight extension
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  const addImage = () => {
    if (editor && imageUrl) {
      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
          // width: imageWidth,
          // height: imageHeight,
        })
        .run();
      setImageUrl("");
      setImageWidth("100%");
      setImageHeight("auto");
      setIsImageDialogOpen(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md p-2 flex flex-col h-[calc(100vh-200px)]">
      <div className="mb-2 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          Bold
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          Italic
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
        >
          Underline
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet List
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          Ordered List
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
        >
          Left
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
        >
          Center
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
        >
          Right
        </Button>
        <Select
          onValueChange={(value) =>
            editor.chain().focus().setFontFamily(value).run()
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier">Courier</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
          </SelectContent>
        </Select>

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
        />

        <Input
          type="color"
          onInput={(event) => {
            editor
              .chain()
              .focus()
              .toggleHighlight({
                color: (event.target as HTMLInputElement).value,
              })
              .run();
          }}
          value={editor.getAttributes("highlight").color || "#ffffff"}
        />

        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              Add Image
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
      </div>
      <EditorContent
        editor={editor}
        className="flex-grow overflow-y-auto prose max-w-none"
      />
    </div>
  );
};

async function saveBrandSettings(settings: {
  logo_url: string | null;
  palette: string;
  font: string;
  header: string;
  footer: string;
}) {
  const supabase = createClientComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("brand_settings")
    .upsert(
      {
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select();

  if (error) throw error;
  return data;
}

export function BrandPageComponent() {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [palette, setPalette] = useState("zinc");
  const [font, setFont] = useState("");
  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logo_url = null;
      if (logo) {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase.storage
          .from("logos")
          .upload(`${Date.now()}-${logo.name}`, logo);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("logos").getPublicUrl(data.path);

        logo_url = publicUrl;
      }

      await saveBrandSettings({
        logo_url,
        palette,
        font,
        header,
        footer,
      });

      toast.success("Brand settings saved successfully!");
    } catch (error) {
      console.error("Error saving brand settings:", error);
      toast.error("Failed to save brand settings. Please try again.");
    }
  };

  const shadcnPalettes = [
    {
      name: "zinc",
      colors: [
        "#18181b",
        "#27272a",
        "#3f3f46",
        "#52525b",
        "#71717a",
        "#a1a1aa",
        "#d4d4d8",
        "#e4e4e7",
        "#f4f4f5",
        "#fafafa",
      ],
    },
    {
      name: "slate",
      colors: [
        "#020617",
        "#0f172a",
        "#1e293b",
        "#334155",
        "#475569",
        "#64748b",
        "#94a3b8",
        "#cbd5e1",
        "#e2e8f0",
        "#f8fafc",
      ],
    },
    {
      name: "stone",
      colors: [
        "#1c1917",
        "#292524",
        "#44403c",
        "#57534e",
        "#78716c",
        "#a8a29e",
        "#d6d3d1",
        "#e7e5e4",
        "#f5f5f4",
        "#fafaf9",
      ],
    },
    {
      name: "gray",
      colors: [
        "#171717",
        "#262626",
        "#404040",
        "#525252",
        "#737373",
        "#a3a3a3",
        "#d4d4d4",
        "#e5e5e5",
        "#f5f5f5",
        "#fafafa",
      ],
    },
    {
      name: "neutral",
      colors: [
        "#171717",
        "#262626",
        "#404040",
        "#525252",
        "#737373",
        "#a3a3a3",
        "#d4d4d4",
        "#e5e5e5",
        "#f5f5f5",
        "#fafafa",
      ],
    },
    {
      name: "red",
      colors: [
        "#450a0a",
        "#7f1d1d",
        "#b91c1c",
        "#dc2626",
        "#ef4444",
        "#f87171",
        "#fca5a5",
        "#fecaca",
        "#fee2e2",
        "#fef2f2",
      ],
    },
    {
      name: "rose",
      colors: [
        "#4c0519",
        "#881337",
        "#be123c",
        "#e11d48",
        "#f43f5e",
        "#fb7185",
        "#fda4af",
        "#fecdd3",
        "#ffe4e6",
        "#fff1f2",
      ],
    },
    {
      name: "orange",
      colors: [
        "#431407",
        "#7c2d12",
        "#c2410c",
        "#ea580c",
        "#f97316",
        "#fb923c",
        "#fdba74",
        "#fed7aa",
        "#ffedd5",
        "#fff7ed",
      ],
    },
    {
      name: "green",
      colors: [
        "#052e16",
        "#14532d",
        "#166534",
        "#15803d",
        "#16a34a",
        "#22c55e",
        "#4ade80",
        "#86efac",
        "#bbf7d0",
        "#dcfce7",
      ],
    },
    {
      name: "blue",
      colors: [
        "#082f49",
        "#0c4a6e",
        "#075985",
        "#0369a1",
        "#0284c7",
        "#0ea5e9",
        "#38bdf8",
        "#7dd3fc",
        "#bae6fd",
        "#e0f2fe",
      ],
    },
    {
      name: "yellow",
      colors: [
        "#422006",
        "#713f12",
        "#a16207",
        "#ca8a04",
        "#eab308",
        "#facc15",
        "#fde047",
        "#fef08a",
        "#fef9c3",
        "#fefce8",
      ],
    },
    {
      name: "violet",
      colors: [
        "#2e1065",
        "#4c1d95",
        "#6d28d9",
        "#7c3aed",
        "#8b5cf6",
        "#a78bfa",
        "#c4b5fd",
        "#ddd6fe",
        "#ede9fe",
        "#f5f3ff",
      ],
    },
  ];

  const googleFonts = [
    "ABeeZee",
    "Abel",
    "Acme",
    "Alegreya",
    "Alegreya Sans",
    "Alfa Slab One",
    "Amatic SC",
    "Amiri",
    "Anton",
    "Archivo",
    "Archivo Black",
    "Archivo Narrow",
    "Arimo",
    "Arvo",
    "Asap",
    "Assistant",
    "Barlow",
    "Barlow Condensed",
    "Bitter",
    "Bree Serif",
    "Cabin",
    "Cardo",
    "Catamaran",
    "Cinzel",
    "Comfortaa",
    "Cormorant Garamond",
    "Courgette",
    "Crete Round",
    "Crimson Text",
    "Cuprum",
    "Dancing Script",
    "Domine",
    "Dosis",
    "Exo 2",
    "Fira Sans",
    "Fira Sans Condensed",
    "Fjalla One",
    "Francois One",
    "Hind",
    "Hind Siliguri",
    "IBM Plex Sans",
    "Inconsolata",
    "Inter",
    "Josefin Sans",
    "Kanit",
    "Karla",
    "Kaushan Script",
    "Lato",
    "Libre Baskerville",
    "Libre Franklin",
    "Lobster",
    "Merriweather",
    "Merriweather Sans",
    "Montserrat",
    "Mukta",
    "Nanum Gothic",
    "Noto Sans",
    "Noto Sans KR",
    "Noto Serif",
    "Nunito",
    "Nunito Sans",
    "Open Sans",
    "Orbitron",
    "Oswald",
    "Overpass",
    "Oxygen",
    "Pacifico",
    "Passion One",
    "Pathway Gothic One",
    "Patua One",
    "Permanent Marker",
    "Playfair Display",
    "Poppins",
    "Prompt",
    "PT Sans",
    "PT Serif",
    "Quattrocento Sans",
    "Questrial",
    "Quicksand",
    "Raleway",
    "Righteous",
    "Roboto",
    "Roboto Condensed",
    "Roboto Mono",
    "Roboto Slab",
    "Rokkitt",
    "Rubik",
    "Satisfy",
    "Shadows Into Light",
    "Sigmar One",
    "Signika",
    "Source Sans Pro",
    "Teko",
    "Titillium Web",
    "Ubuntu",
    "Varela Round",
    "Vollkorn",
    "Work Sans",
    "Yanone Kaffeesatz",
    "Zilla Slab",
  ];

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Brand Page</CardTitle>
          <CardDescription>
            Customize your SaaS application's brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleLogoChange}
                />
                {logoPreview && (
                  <div className="mt-2">
                    <Image
                      src={logoPreview}
                      alt="Logo Preview"
                      width={200}
                      height={100}
                      objectFit="contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="palette">Color Palette</Label>
                <Select value={palette} onValueChange={setPalette}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color palette" />
                  </SelectTrigger>
                  <SelectContent>
                    {shadcnPalettes.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        <div className="flex items-center">
                          <span className="mr-2">{p.name}</span>
                          <div className="flex">
                            {p.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 mr-1"
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="font">Font</Label>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {googleFonts.map((fontName) => (
                      <SelectItem
                        key={fontName}
                        value={fontName.toLowerCase().replace(" ", "-")}
                      >
                        {fontName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="header">Custom Header</Label>
                <TiptapEditor content={header} onUpdate={setHeader} />
              </div>

              <div>
                <Label htmlFor="footer">Custom Footer</Label>
                <TiptapEditor content={footer} onUpdate={setFooter} />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" onClick={handleSave}>
            Save Brand Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
