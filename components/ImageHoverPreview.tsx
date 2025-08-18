'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageHoverPreviewProps {
  src: string
  alt?: string
  className?: string
  previewSize?: { width: number; height: number }
}

export function ImageHoverPreview({ 
  src, 
  alt = 'Image', 
  className = 'h-12 w-12 object-cover rounded cursor-pointer border hover:border-blue-500',
  previewSize = { width: 400, height: 400 }
}: ImageHoverPreviewProps) {
  const [hoveredImage, setHoveredImage] = useState<{ url: string; x: number; y: number } | null>(null)
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredImage({
      url: src,
      x: rect.left,
      y: rect.top
    })
  }
  
  const handleMouseLeave = () => {
    setHoveredImage(null)
  }
  
  const handleClick = () => {
    window.open(src, '_blank')
  }
  
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={className}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const fallback = target.nextSibling as HTMLElement
          if (fallback) fallback.style.display = 'block'
        }}
      />
      
      {/* Floating Image Preview */}
      {hoveredImage && (
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${Math.min(hoveredImage.x + 60, window.innerWidth - previewSize.width - 20)}px`,
            top: `${Math.min(hoveredImage.y, window.innerHeight - previewSize.height - 20)}px`,
          }}
        >
          <div className="bg-white p-3 rounded-lg shadow-2xl border-2 border-gray-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hoveredImage.url}
              alt={`${alt} Preview`}
              className="object-contain"
              style={{
                maxWidth: `${previewSize.width}px`,
                maxHeight: `${previewSize.height}px`
              }}
              onError={() => {
                setHoveredImage(null)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ImageHoverPreview