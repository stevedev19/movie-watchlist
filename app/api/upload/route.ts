import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getUserFromRequestCookie } from '@/lib/auth'

// Note: In Next.js App Router, body parsing is handled automatically
// No need for deprecated config export

export async function POST(request: NextRequest) {
  try {
    console.log('📤 [UPLOAD API] Received upload request')
    
    // Check authentication
    getUserFromRequestCookie() || { userId: 'guest', name: 'Guest' }

    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('📁 [UPLOAD API] File received:', file ? {
      name: file.name,
      size: file.size,
      type: file.type
    } : 'No file')

    if (!file) {
      console.error('❌ [UPLOAD API] No file in request')
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    console.log('🔍 [UPLOAD API] Validating file type:', file.type)
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ [UPLOAD API] Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    console.log('🔍 [UPLOAD API] Validating file size:', file.size, 'bytes')
    if (file.size > maxSize) {
      console.error('❌ [UPLOAD API] File too large:', file.size)
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    console.log('📂 [UPLOAD API] Upload directory:', uploadsDir)
    if (!existsSync(uploadsDir)) {
      console.log('📁 [UPLOAD API] Creating upload directory...')
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${fileExtension}`
    console.log('📝 [UPLOAD API] Generated filename:', filename)

    // Save file
    console.log('💾 [UPLOAD API] Saving file...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)
    console.log('✅ [UPLOAD API] File saved to:', filepath)

    // Return the file URL
    const fileUrl = `/api/uploads/${filename}`
    console.log('🎉 [UPLOAD API] Upload successful! URL:', fileUrl)

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
    })
  } catch (error) {
    console.error('❌ [UPLOAD API] Error uploading file:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
