import { FragmentSchema } from '@/lib/schema'
import { ExecutionResultInterpreter, ExecutionResultWeb } from '@/lib/types'
import { Sandbox } from '@e2b/code-interpreter'

const sandboxTimeout = 10 * 60 * 1000 // 10 minute in ms

export const maxDuration = 60

const header = `\n\nimport Link from \"next/link\";\n\nimport Image from \"next/image\";\n\n export function MinigramHeader() {\n  return (\n    <header className=\"bg-white py-6\">\n      <div className=\"container mx-auto px-4 py-2 flex flex-col items-center\">\n        <Link href=\"/\">\n          <Image\n            src=\"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-yWyeIMkcrSjECPa5qh7OEQU5JEmIQw.png\"\n            alt=\"Monogram Logo\"\n            width={220}\n            height={36}\n            className=\"w-[180px] h-auto\"\n          />\n        </Link>\n        <h1\n          className=\"text-3xl md:text-4xl lg:text-5xl font-semibold text-center mb-2\"\n          style={{ fontFamily: \"'IvyPresto Display', serif\" }}\n        >\n          Monogram Moment\n        </h1>\n        <p className=\"text-sm text-center text-gray-600 max-w-2xl\">\n          As an entreprenur you work very hard. Rememeber to take a break.\n          Minesweeper was originally released for Windows in the 1980's and\n          became a favourite for people who needed a short break at work. Clear\n          the minefield without hitting a mine.\n        </p>\n      </div>\n    </header>\n  );\n}`

export async function POST(req: Request) {
  const {
    fragment,
    userID,
    apiKey,
  }: { fragment: FragmentSchema; userID: string; apiKey?: string } =
    await req.json()

  // Create a interpreter or a sandbox
  const sbx = await Sandbox.create(fragment.template, {
    metadata: { template: fragment.template, userID: userID },
    timeoutMs: sandboxTimeout,
    apiKey,
  })

  await sbx.files.write('next.config.js', `module.exports = {\n  images: {\n    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com'],\n  },\n}`)
  const headerResponse = await sbx.files.write('components/header.tsx', header)
  console.log('headerResponse', headerResponse)
  // Install packages
  if (fragment.has_additional_dependencies) {
    await sbx.commands.run(fragment.install_dependencies_command)
    console.log(
      `Installed dependencies: ${fragment.additional_dependencies.join(', ')} in sandbox ${sbx.sandboxId}`,
    )
  }

  // Copy code to fs
  if (fragment.code && Array.isArray(fragment.code)) {
    fragment.code.forEach(async (file) => {
      const fileResponse = await sbx.files.write(file.file_path, file.file_content)
      console.log(`Copied file to ${file.file_path} in ${sbx.sandboxId}`, fileResponse)
    })
  } else {
    const fileResponse = await sbx.files.write(fragment.file_path, fragment.code)
    console.log(`Copied file to ${fragment.file_path} in ${sbx.sandboxId}`, fileResponse)
  }

  const files = await sbx.files.list('/home/user')
  console.log('files', files)
  
  // Execute code or return a URL to the running sandbox
  if (fragment.template === 'code-interpreter-v1') {
    const { logs, error, results } = await sbx.runCode(fragment.code || '')
    console.log('logs', { logs, error, results })
    return new Response(
      JSON.stringify({
        sbxId: sbx?.sandboxId,
        template: fragment.template,
        stdout: logs.stdout,
        stderr: logs.stderr,
        runtimeError: error,
        cellResults: results,
      } as ExecutionResultInterpreter),
    )
  }

  return new Response(
    JSON.stringify({
      sbxId: sbx?.sandboxId,
      template: fragment.template,
      url: `https://${sbx?.getHost(fragment.port || 80)}`,
    } as ExecutionResultWeb),
  )
}
