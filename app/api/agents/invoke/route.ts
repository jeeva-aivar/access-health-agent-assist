import { NextRequest, NextResponse } from 'next/server'
import { SignatureV4 } from '@smithy/signature-v4'
import { HttpRequest } from '@smithy/protocol-http'
import { Sha256 } from '@aws-crypto/sha256-js'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

const AGENT_ARNS: Record<string, string> = {
  pitch_builder:     'arn:aws:bedrock-agentcore:us-east-1:646731024209:runtime/pitch_builder-5izhaw4oB7',
  meeting_preparer:  'arn:aws:bedrock-agentcore:us-east-1:646731024209:runtime/meeting_preparer-GlEUwZCPBB',
  earnings_reviewer: 'arn:aws:bedrock-agentcore:us-east-1:646731024209:runtime/earnings_reviewer-jB93znBSo7',
  model_builder:     'arn:aws:bedrock-agentcore:us-east-1:646731024209:runtime/model_builder-MH0oy6Gyhx',
  memo_maker:        'arn:aws:bedrock-agentcore:us-east-1:646731024209:runtime/memo_maker-w2T7hc8rZS',
}

export async function POST(req: NextRequest) {
  try {
    const { agent, payload } = await req.json()

    const arn = AGENT_ARNS[agent]
    if (!arn) return NextResponse.json({ error: `Unknown agent: ${agent}` }, { status: 400 })

    const credentials = await defaultProvider()()

    const sessionId = `rm-${crypto.randomUUID().replace(/-/g, '')}-${Date.now()}`
    const encodedArn = encodeURIComponent(arn)
    const url = `https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/${encodedArn}/invocations`
    const bodyStr = JSON.stringify(payload)

    const parsed = new URL(url)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': sessionId,
      'host': parsed.host,
    }

    const request = new HttpRequest({
      method: 'POST',
      protocol: 'https:',
      hostname: parsed.host,
      path: parsed.pathname,
      query: { qualifier: 'DEFAULT' },
      headers,
      body: bodyStr,
    })

    const signer = new SignatureV4({
      credentials,
      region: 'us-east-1',
      service: 'bedrock-agentcore',
      sha256: Sha256,
    })

    const signed = await signer.sign(request)

    const response = await fetch(`${url}?qualifier=DEFAULT`, {
      method: 'POST',
      headers: signed.headers as Record<string, string>,
      body: bodyStr,
    })

    const text = await response.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    if (!response.ok) {
      return NextResponse.json({ error: `Agent returned HTTP ${response.status}`, detail: data }, { status: response.status })
    }

    return NextResponse.json({ ok: true, agent, sessionId, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
