'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const TiptapEditor = ({ content, onUpdate }: { content: string; onUpdate: (content: string) => void }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
  })

  return (
    <div className="border rounded-md p-2">
      <EditorContent editor={editor} />
    </div>
  )
}

export function BrandPageComponent() {
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [palette, setPalette] = useState('zinc')
  const [font, setFont] = useState('')
  const [header, setHeader] = useState('')
  const [footer, setFooter] = useState('')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      logo,
      palette,
      font,
      header,
      footer
    })
    // In a real application, you would send this data to your backend API
    alert('Brand settings saved!')
  }

  const shadcnPalettes = [
    { name: 'zinc', colors: ['#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7', '#f4f4f5', '#fafafa'] },
    { name: 'slate', colors: ['#020617', '#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f8fafc'] },
    { name: 'stone', colors: ['#1c1917', '#292524', '#44403c', '#57534e', '#78716c', '#a8a29e', '#d6d3d1', '#e7e5e4', '#f5f5f4', '#fafaf9'] },
    { name: 'gray', colors: ['#171717', '#262626', '#404040', '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5', '#f5f5f5', '#fafafa'] },
    { name: 'neutral', colors: ['#171717', '#262626', '#404040', '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5', '#f5f5f5', '#fafafa'] },
    { name: 'red', colors: ['#450a0a', '#7f1d1d', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#fef2f2'] },
    { name: 'rose', colors: ['#4c0519', '#881337', '#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6', '#fff1f2'] },
    { name: 'orange', colors: ['#431407', '#7c2d12', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#fff7ed'] },
    { name: 'green', colors: ['#052e16', '#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'] },
    { name: 'blue', colors: ['#082f49', '#0c4a6e', '#075985', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'] },
    { name: 'yellow', colors: ['#422006', '#713f12', '#a16207', '#ca8a04', '#eab308', '#facc15', '#fde047', '#fef08a', '#fef9c3', '#fefce8'] },
    { name: 'violet', colors: ['#2e1065', '#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'] }
  ]

  const googleFonts = [
    'ABeeZee', 'Abel', 'Acme', 'Alegreya', 'Alegreya Sans', 'Alfa Slab One', 'Amatic SC',
    'Amiri', 'Anton', 'Archivo', 'Archivo Black', 'Archivo Narrow', 'Arimo', 'Arvo',
    'Asap', 'Assistant', 'Barlow', 'Barlow Condensed', 'Bitter', 'Bree Serif', 'Cabin',
    'Cardo', 'Catamaran', 'Cinzel', 'Comfortaa', 'Cormorant Garamond', 'Courgette',
    'Crete Round', 'Crimson Text', 'Cuprum', 'Dancing Script', 'Domine', 'Dosis',
    'Exo 2', 'Fira Sans', 'Fira Sans Condensed', 'Fjalla One', 'Francois One',
    'Hind', 'Hind Siliguri', 'IBM Plex Sans', 'Inconsolata', 'Inter', 'Josefin Sans',
    'Kanit', 'Karla', 'Kaushan Script', 'Lato', 'Libre Baskerville', 'Libre Franklin',
    'Lobster', 'Merriweather', 'Merriweather Sans', 'Montserrat', 'Mukta', 'Nanum Gothic',
    'Noto Sans', 'Noto Sans KR', 'Noto Serif', 'Nunito', 'Nunito Sans', 'Open Sans',
    'Orbitron', 'Oswald', 'Overpass', 'Oxygen', 'Pacifico', 'Passion One', 'Pathway Gothic One',
    'Patua One', 'Permanent Marker', 'Playfair Display', 'Poppins', 'Prompt', 'PT Sans',
    'PT Serif', 'Quattrocento Sans', 'Questrial', 'Quicksand', 'Raleway', 'Righteous',
    'Roboto', 'Roboto Condensed', 'Roboto Mono', 'Roboto Slab', 'Rokkitt', 'Rubik',
    'Satisfy', 'Shadows Into Light', 'Sigmar One', 'Signika', 'Source Sans Pro',
    'Teko', 'Titillium Web', 'Ubuntu', 'Varela Round', 'Vollkorn', 'Work Sans',
    'Yanone Kaffeesatz', 'Zilla Slab'
  ]

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Brand Page</CardTitle>
          <CardDescription>Customize your SaaS application's brand</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <Input id="logo" type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} />
                {logoPreview && (
                  <div className="mt-2">
                    <Image src={logoPreview} alt="Logo Preview" width={200} height={100} objectFit="contain" />
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
                              <div key={index} className="w-4 h-4 mr-1" style={{ backgroundColor: color }}></div>
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
                      <SelectItem key={fontName} value={fontName.toLowerCase().replace(' ', '-')}>
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
          <Button type="submit" onClick={handleSave}>Save Brand Settings</Button>
        </CardFooter>
      </Card>
    </div>
  )
}