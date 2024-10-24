"use client";

import { useState, useEffect } from "react";
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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import { TiptapEditor } from "@/components/tiptap-editor";
import { shadcnPalettes, googleFonts } from "@/constants/brand-page-constants";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrandSettings = async () => {
      const supabase = createClientComponentClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("brand_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching brand settings:", error);
          toast.error("Failed to load brand settings.");
        } else if (data) {
          setLogoPreview(data.logo_url);
          setPalette(data.palette || "zinc");
          setFont(data.font || "");
          setHeader(data.header || "");
          setFooter(data.footer || "");
        }
      }
      setIsLoading(false);
    };

    fetchBrandSettings();
  }, []);

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
      let logo_url = logoPreview;
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
