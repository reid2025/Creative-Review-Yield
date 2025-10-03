import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Validate that the URL is a valid image URL
    if (!isValidImageUrl(imageUrl)) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      )
    }

    console.log('🖼️ Fetching image through proxy:', imageUrl)

    // Fetch the image from the external source
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status, imageResponse.statusText)
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}` },
        { status: imageResponse.status }
      )
    }

    // Get the image content type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Check if it's actually an image
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL does not point to a valid image' },
        { status: 400 }
      )
    }

    // Get the image data as array buffer
    const imageBuffer = await imageResponse.arrayBuffer()

    // Convert to base64 for the AI service
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const dataUrl = `data:${contentType};base64,${base64Image}`

    console.log('✅ Image fetched successfully, size:', imageBuffer.byteLength, 'bytes')

    return NextResponse.json({
      success: true,
      dataUrl,
      contentType,
      size: imageBuffer.byteLength
    })

  } catch (error: any) {
    console.error('Error in image proxy:', error)
    return NextResponse.json(
      { error: `Failed to fetch image: ${error.message}` },
      { status: 500 }
    )
  }
}

// Helper function to validate image URLs
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)

    // Allow common image hosting domains
    const allowedDomains = [
      'facebook.com',
      'fbcdn.net',
      'scontent.com',
      'scontent-',  // For scontent-xxx.xx.fbcdn.net
      'googleapis.com',
      'googleusercontent.com',
      'firebase.com',
      'firebasestorage.googleapis.com'
    ]

    const hostname = parsedUrl.hostname.toLowerCase()
    const isAllowedDomain = allowedDomains.some(domain =>
      hostname.includes(domain) || hostname.endsWith(domain)
    )

    // Check for common image file extensions or known image URLs
    const pathname = parsedUrl.pathname.toLowerCase()
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(pathname)
    const isFacebookImage = hostname.includes('facebook') || hostname.includes('fbcdn')

    return isAllowedDomain && (hasImageExtension || isFacebookImage)
  } catch {
    return false
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Image proxy endpoint. Use POST with { imageUrl } to fetch images.',
    usage: 'POST /api/fetch-image with body: { "imageUrl": "https://..." }'
  })
}