import { FragmentSchema } from '@/lib/schema'
import { ExecutionResultInterpreter, ExecutionResultWeb } from '@/lib/types'
import { Sandbox } from '@e2b/code-interpreter'

const sandboxTimeout = 30 * 60 * 1000 // 30 minute in ms

export const maxDuration = 60

export async function POST(req: Request) {
  const {
    fragment,
    userID,
    apiKey,
  }: { fragment: FragmentSchema; userID: string; apiKey?: string } =
    await req.json()

    const sbx = await Sandbox.create('ckqy8rppy986dt8b20o6', {
      metadata: { template: 'minigram-app', userID: userID },
      timeoutMs: sandboxTimeout,
      apiKey,
    })

  // Wait for Next.js server to start (typically takes a few seconds)
  await new Promise(resolve => setTimeout(resolve, 3000))
  
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
  
  // Execute code or return a URL to the running sandbox
  if (fragment.template === 'code-interpreter-v1') {
    const { logs, error, results } = await sbx.runCode(fragment.code || '')
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
