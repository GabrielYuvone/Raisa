import { useState, useEffect, useRef } from 'react'
import './App.css'

const images = [
  { id: 1, src: '/images/bikini1.jpeg', alt: 'Bikini Punk 1' },
  { id: 2, src: '/images/bikini2.jpeg', alt: 'Bikini Punk 2' },
  { id: 3, src: '/images/bikini3.jpeg', alt: 'Bikini Punk 3' },
  { id: 4, src: '/images/bikini4.jpeg', alt: 'Bikini Punk 4' },
  { id: 5, src: '/images/bikini5.jpeg', alt: 'Bikini Punk 5' },
  { id: 6, src: '/images/bikini6.jpeg', alt: 'Bikini Punk 6' },
]

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [clickedImageRect, setClickedImageRect] = useState<DOMRect | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle speaker toggle
  const handleSpeakerToggle = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
        setIsMusicPlaying(false)
      } else {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err))
        setIsMusicPlaying(true)
      }
    }
  }

  const handleImageClick = (id: number) => {
    // Get the clicked image's position and size
    const imageElement = imageRefs.current.get(id)
    if (imageElement) {
      const rect = imageElement.getBoundingClientRect()
      setClickedImageRect(rect)
    }

    setSelectedImage(id)
    setIsClosing(false)
  }

  const closeModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedImage(null)
      setClickedImageRect(null)
      setIsClosing(false)
    }, 400)
  }

  // Window height
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  // Section 1: Cards (0 - 400vh) - reveals all 6 cards progressively
  const section1Progress = Math.min(Math.max(scrollY / (vh * 4), 0), 1)
  const visibleCount = Math.max(0, Math.ceil(section1Progress * images.length))
  const cardsComplete = section1Progress >= 1

  // Section 2: Logo SVG (400vh - 500vh) - EXTENDED to 600vh
  const section2Start = vh * 4
  const section2End = vh * 6  // Extended section 2
  const section2Progress = Math.min(Math.max((scrollY - section2Start) / (section2End - section2Start), 0), 1)
  const showSection2 = scrollY >= section2Start
  const section2Active = scrollY >= section2Start && scrollY < section2End

  // Section 3: Email with tartan (600vh - 700vh)
  const section3Start = vh * 6
  const section3Progress = Math.min(Math.max((scrollY - section3Start) / vh, 0), 1)
  const showSection3 = scrollY >= section3Start

  // Calculate modal image position for smooth transition
  const getModalImageStyle = () => {
    if (!clickedImageRect || selectedImage === null) return {}

    if (isClosing) {
      // Closing: animate back to original position
      return {
        position: 'fixed' as const,
        top: clickedImageRect.top,
        left: clickedImageRect.left,
        width: clickedImageRect.width,
        height: clickedImageRect.height,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }
    }

    // Opening: animate from original position to center
    const targetWidth = Math.min(window.innerWidth * 0.9, 768)
    const targetHeight = window.innerHeight * 0.85
    const targetLeft = (window.innerWidth - targetWidth) / 2
    const targetTop = (window.innerHeight - targetHeight) / 2

    return {
      position: 'fixed' as const,
      top: targetTop,
      left: targetLeft,
      width: targetWidth,
      height: targetHeight,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }

  return (
    <div className="relative">

      {/* Audio Element */}
      <audio ref={audioRef} loop>
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      {/* Speaker Icon - Toggle music on/off */}
      <button
        onClick={handleSpeakerToggle}
        className="fixed top-8 right-8 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 text-white text-2xl border border-white/30 transition-all duration-300 flex items-center justify-center rounded-full"
        style={{ backdropFilter: 'blur(10px)' }}
        aria-label={isMusicPlaying ? 'Mute music' : 'Unmute music'}
      >
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>

      {/* SECTION 1: Hero + Cards */}
      <div
        className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500"
        style={{
          opacity: showSection2 ? 0 : 1,
          pointerEvents: showSection2 ? 'none' : 'auto',
          zIndex: 10
        }}
      >
        {/* Brand Name with Glitch Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none glitch-container">
          <h1 className="text-[15vw] font-black text-white/10 tracking-tighter select-none glitch-layer main">
            R A I S A
          </h1>
          <h1 className="text-[15vw] font-black tracking-tighter select-none glitch-layer layer1 text-[#ff00ff]/20" aria-hidden="true">
            R A I S A
          </h1>
          <h1 className="text-[15vw] font-black tracking-tighter select-none glitch-layer layer2 text-[#00ffff]/20" aria-hidden="true">
            R A I S A
          </h1>
        </div>

        {/* Cards Container */}
        <div className="relative w-[320px] h-[480px] sm:w-[380px] sm:h-[570px]">
          {images.map((image, index) => {
            const isVisible = index < visibleCount
            const zIndex = index + 1

            const baseOffset = index * 8
            const scrollOffset = section1Progress * 30 * index
            const translateY = isVisible ? baseOffset - scrollOffset : 100
            const scale = isVisible ? 1 - index * 0.03 : 0.8
            const cardOpacity = isVisible ? 1 : 0
            const rotate = isVisible ? (index % 2 === 0 ? -2 : 2) : 0

            return (
              <div
                key={image.id}
                ref={(el) => {
                  if (el) imageRefs.current.set(image.id, el)
                }}
                onClick={() => handleImageClick(image.id)}
                className="absolute inset-0 cursor-pointer transition-all duration-500 ease-out"
                style={{
                  zIndex,
                  transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                  opacity: cardOpacity,
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-300"
          style={{ opacity: cardsComplete ? 0 : 0.5 }}
        >
          <p className="text-white/50 text-xs tracking-[0.3em] uppercase">
            Scroll
          </p>
        </div>
      </div>

      {/* Spacer for Section 1 */}
      <div style={{ height: '400vh' }} />

      {/* SECTION 2: Logo SVG */}
      <div
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
        style={{
          opacity: section2Active ? 1 : showSection3 ? 0 : 0,
          pointerEvents: section2Active ? 'auto' : 'none',
          zIndex: 20
        }}
      >
        <div
          className="transition-all duration-700 ease-out glitch-container"
          style={{
            transform: `scale(${0.5 + section2Progress * 0.5}) translateY(${(1 - section2Progress) * 50}px)`,
            opacity: section2Progress < 0.3 ? section2Progress / 0.3 : (section2Progress > 0.6 ? 1 - (section2Progress - 0.6) / 0.4 : 1)
          }}
        >
          {/* Main Layer */}
          <svg
            viewBox="0 0 400 120"
            className="w-[80vw] max-w-2xl glitch-layer main"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="white"
              className="text-6xl font-black tracking-tight"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              R A I S A
            </text>
            <text
              x="50%"
              y="85%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="white"
              className="text-xl font-light tracking-[0.5em]"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              BIKINIS
            </text>
          </svg>

          {/* Glitch Layer 1 */}
          <svg
            viewBox="0 0 400 120"
            className="w-[80vw] max-w-2xl glitch-layer layer1"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#ff00ff"
              className="text-6xl font-black tracking-tight"
              style={{ fontFamily: 'system-ui, sans-serif', opacity: 0.8 }}
            >
              R A I S A
            </text>
            <text
              x="50%"
              y="85%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#ff00ff"
              className="text-xl font-light tracking-[0.5em]"
              style={{ fontFamily: 'system-ui, sans-serif', opacity: 0.8 }}
            >
              BIKINIS
            </text>
          </svg>

          {/* Glitch Layer 2 */}
          <svg
            viewBox="0 0 400 120"
            className="w-[80vw] max-w-2xl glitch-layer layer2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#00ffff"
              className="text-6xl font-black tracking-tight"
              style={{ fontFamily: 'system-ui, sans-serif', opacity: 0.8 }}
            >
              R A I S A
            </text>
            <text
              x="50%"
              y="85%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#00ffff"
              className="text-xl font-light tracking-[0.5em]"
              style={{ fontFamily: 'system-ui, sans-serif', opacity: 0.8 }}
            >
              BIKINIS
            </text>
          </svg>
        </div>
      </div>

      {/* Spacer for Section 2 - EXTENDED */}
      <div style={{ height: '200vh' }} />

      {/* SECTION 3: Email with Tartan */}
      <div
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
        style={{
          opacity: showSection3 ? section3Progress : 0,
          pointerEvents: showSection3 ? 'auto' : 'none',
          zIndex: 30
        }}
      >
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/40" />

        <div
          className="relative z-10 text-center transition-transform duration-700 ease-out"
          style={{
            transform: `translateY(${(1 - section3Progress) * 100}px)`,
          }}
        >
          <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-6">
            Contacto
          </p>
          <a
            href="mailto:hello@raisa.com.ar"
            className="text-white text-2xl sm:text-4xl md:text-5xl font-light tracking-wide hover:text-white/80 transition-colors"
          >
            hello@raisa.com.ar
          </a>
        </div>
      </div>

      {/* Spacer for Section 3 */}
      <div style={{ height: '100vh' }} />

      {/* Modal for enlarged view - with smooth expand animation */}
      {selectedImage !== null && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center ${isClosing ? 'bg-black/0' : 'bg-black/90'}`}
          style={{
            transition: 'background-color 0.4s ease',
            backdropFilter: isClosing ? 'blur(0px)' : 'blur(8px)'
          }}
          onClick={closeModal}
        >
          <div
            className="relative"
            style={getModalImageStyle()}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images.find((img) => img.id === selectedImage)?.src}
              alt="Enlarged view"
              className="w-full h-full object-contain rounded-3xl"
            />
            <button
              onClick={closeModal}
              className={`absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-all duration-300 ${isClosing ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
