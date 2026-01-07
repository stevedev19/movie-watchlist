import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, extname } from 'path'

export const dynamic = 'force-dynamic'

const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params?.filename

  if (!filename || filename.includes('..') || filename.includes('/')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  const filepath = join(uploadsDir, filename)

  if (!existsSync(filepath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const buffer = await readFile(filepath)
  const ext = extname(filename).toLowerCase()
  const contentType = contentTypes[ext] || 'application/octet-stream'

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
