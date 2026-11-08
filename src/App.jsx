import { useEffect, useMemo, useState } from 'react'
import './App.css'

const eventDate = new Date('2026-11-21T18:00:00+05:00')
const venue = 'House No. 35, Ghosia Colony, College Road, Johar Town, Lahore'
const venueLink = 'https://www.google.com/maps/search/?api=1&query=House%20No.%2035%2C%20Ghosia%20Colony%2C%20College%20Road%2C%20Johar%20Town%2C%20Lahore'
const whatsappNumber = '923214051843'
const organizer = 'Syed Asad Bukhari'

const schedule = [
  { time: '06:00 PM', title: 'Welcome', copy: 'Arrive, settle in, and let the evening begin with warm welcomes.' },
  { time: '07:00 PM', title: 'Dholki begins', copy: 'The first beats, family songs, and the circle of celebration.' },
  { time: '08:30 PM', title: 'Dholki songs', copy: 'Family songs, claps in rhythm, and a mehfil lit by golden lamps.' },
  { time: '10:30 PM', title: 'Dinner & duas', copy: 'A shared table, heartfelt prayers, and memories to carry home.' },
]

function getCountdown() {
  const remaining = eventDate.getTime() - Date.now()
  if (remaining <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  }
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [isTapping, setIsTapping] = useState(false)
  const [countdown, setCountdown] = useState(getCountdown)
  const [rsvp, setRsvp] = useState('accept')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [isMusicOn, setIsMusicOn] = useState(true)
  const [notice, setNotice] = useState('')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    let frame = 0
    const updateScrollPosition = () => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        frame = 0
      })
    }

    updateScrollPosition()
    window.addEventListener('scroll', updateScrollPosition, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateScrollPosition)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const sections = document.querySelectorAll('.section-block')
    const reveal = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
    }

    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(reveal, { threshold: 0.16 })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [isOpen])

  const rsvpMessage = useMemo(() => {
    const message = rsvp === 'accept'
      ? 'Assalamualaikum! I am delighted to attend Rang-e-Dholki and would love to celebrate this joyful evening with you.'
      : 'Assalamualaikum! With warm wishes, I am unable to attend Rang-e-Dholki but send my blessings and best wishes for the celebration.'
    return `Hello ${organizer}, ${message}`
  }, [rsvp])

  const openInvitation = () => {
    if (isOpen || isOpening || isTapping) return
    setIsMusicOn(true)
    setIsTapping(true)
    window.setTimeout(() => setIsOpening(true), 430)
    window.setTimeout(() => {
      setIsOpen(true)
      setIsOpening(false)
      setIsTapping(false)
    }, 1480)
  }

  const musicPlayer = isMusicOn ? (
    <div className="background-music" aria-label="Dholki background music">
      <video
        className="background-music-video"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster="/dholki-open-cover.webp"
        aria-hidden="true"
      >
        <source src="/dholki-music.mp4" type="video/mp4" />
      </video>
    </div>
  ) : null

  const musicToggleButton = (
    <button
      className={`floating-music-toggle ${isMusicOn ? 'is-active' : ''}`}
      type="button"
      onClick={() => setIsMusicOn((value) => !value)}
      aria-pressed={isMusicOn}
      aria-label={isMusicOn ? 'Pause Dholki music' : 'Play Dholki music'}
      title={isMusicOn ? 'Pause Dholki music' : 'Play Dholki music'}
    >
      <span className="music-toggle-icon" aria-hidden="true">{isMusicOn ? '♫' : '◌'}</span>
    </button>
  )

  const sideRailStyle = {
    '--rail-shift': `${Math.sin(scrollY / 180) * 18}px`,
    '--rail-rotate': `${Math.sin(scrollY / 220) * 7}deg`,
  }

  const openRsvp = (choice) => {
    setRsvp(choice)
    setWhatsappUrl(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(choice === 'accept'
      ? `Hello ${organizer}, I am delighted to attend Rang-e-Dholki and would love to celebrate this joyful evening with you.`
      : `Hello ${organizer}, with warm wishes, I am unable to attend Rang-e-Dholki but send my blessings and best wishes for the celebration.`)}`)
  }

  const shareInvitation = async () => {
    const shareData = {
      title: 'Rang-e-Dholki | Dholki Night',
      text: 'You are warmly invited to an evening of music, light, and celebration.',
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
      await navigator.clipboard.writeText(window.location.href)
      setNotice('Invitation link copied')
    } catch {
      setNotice('Invitation link ready to share')
    }
    window.setTimeout(() => setNotice(''), 2600)
  }

  if (!isOpen) {
    return (
      <>
        {musicPlayer}
        <main className={`envelope-screen ${isOpening ? 'is-opening' : ''}`}>
          {musicToggleButton}
          <div className="envelope-glow" aria-hidden="true" />
          <section className={`envelope-card ${isTapping ? 'is-tapping' : ''} ${isOpening ? 'is-opening' : ''}`} aria-label="Rang-e-Dholki invitation cover">
            <img className="cover-reference-art" src="/dholki-open-cover.webp" alt="Illustrated Dholki Night stage with a glowing decorated dholak, lanterns, and a celebrating couple" loading="lazy" decoding="async" />
            <div className="cover-reference-overlay" aria-hidden="true" />
            <div className="cover-title-overlay">
              <span>Rang-e-Dholki</span>
              <small>21 November 2026 · Lahore</small>
            </div>
            <button className="dholak-open-button" type="button" onClick={openInvitation} aria-label="Tap the dholak to open the Rang-e-Dholki invitation">
              <img className="dholak-tap-hand hand-right" src="/dholki-tap-hand.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />
              <span className="dholak-button-label">Tap the dholak</span>
            </button>
            <div className="envelope-pattern" aria-hidden="true" />
            <div className="envelope-arch" aria-hidden="true" />
            <div className="envelope-flap" aria-hidden="true" />
            <div className="envelope-kicker">Bismillah · In the name of Allah</div>
            <div className="seal-circle"><span>م</span></div>
            <div className="invited-copy">
              <p>You are warmly invited to</p>
              <strong>Rang-e-Dholki</strong>
              <span>Dholki night · 21 November 2026</span>
            </div>
          </section>
          {isOpening && (
            <div className="opening-transition" aria-live="polite">
              <span className="opening-spark" aria-hidden="true">✦</span>
              <p>Rang-e-Dholki</p>
              <span>21 · 11 · 2026</span>
            </div>
          )}
        </main>
      </>
    )
  }

  return (
    <main className="page-shell">
      {musicPlayer}
      {musicToggleButton}
      <div className="scroll-side-decoration side-left" style={sideRailStyle} aria-hidden="true">
        <span className="rail-spark spark-one">✦</span>
        <div className="scroll-rail-line" />
        <img className="side-border-art" src="/dholki-border-ornament.webp" alt="" loading="lazy" decoding="async" />
        <span className="rail-spark spark-two">·</span>
      </div>
      <div className="scroll-side-decoration side-right" style={sideRailStyle} aria-hidden="true">
        <span className="rail-spark spark-one">✦</span>
        <div className="scroll-rail-line" />
        <img className="side-border-art" src="/dholki-border-ornament.webp" alt="" loading="lazy" decoding="async" />
        <span className="rail-spark spark-two">·</span>
      </div>
      <div className="invitation" id="top">
        <div className="grain" aria-hidden="true" />
        <div className="floating-controls" aria-label="Invitation controls">
          <button className="control-pill" type="button" onClick={shareInvitation}>
            <span className="control-icon" aria-hidden="true">↗</span>
            <span>Share</span>
          </button>
        </div>

        <section className="hero" aria-labelledby="invitation-title">
          <div className="arch-frame">
            <div className="arch-inner">
              <p className="arabic-line" dir="rtl">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
              <div className="hero-kicker"><span>✦</span> A DHOLKI NIGHT INVITATION <span>✦</span></div>
              <p className="chapter-mark">CHAPTER ONE · THE MEHFIL</p>
              <h1 id="invitation-title">Rang-e-Dholki</h1>
              <p className="hero-subtitle">An evening of raag, rhythm & togetherness</p>
              <div className="hero-divider"><span>◆</span></div>
              <p className="invited-line">With joy in our hearts, we invite you to celebrate</p>
              <p className="couple-name">Syed Zain-ul-Abideen <em>&</em> Syeda Esha Javeed</p>
              <div className="hero-meta">
                <span>21 · 11 · 2026</span>
                <span className="meta-dot">•</span>
                <span>6:00 PM onwards</span>
              </div>
              <p className="hero-location">Johar Town · Lahore</p>
              <a className="scroll-cue" href="#details">Scroll to enter the mehfil <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </section>

        <section className="countdown-section section-block">
          <div className="section-eyebrow">✦ Counting the days ✦</div>
          <h2>Until the first note begins</h2>
          <div className="countdown-art" aria-hidden="true"><img src="/dholki-open-cover.webp" alt="" loading="lazy" decoding="async" /></div>
          <div className="countdown-grid" aria-label="Countdown to Rang-e-Dholki">
            {[
              ['days', countdown.days],
              ['hours', countdown.hours],
              ['minutes', countdown.minutes],
              ['seconds', countdown.seconds],
            ].map(([label, value]) => (
              <div className="countdown-box" key={label}>
                <strong>{pad(value)}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="timeline-section section-block">
          <div className="section-eyebrow">✦ The order of the evening ✦</div>
          <h2>A little glimpse of what awaits</h2>
          <div className="section-art-line timeline-art-line" aria-hidden="true">
            <img src="/dholki-border-ornament.webp" alt="" loading="lazy" decoding="async" />
            <span>Beats · songs · laughter</span>
            <img src="/dholki-border-ornament.webp" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="timeline">
            {schedule.map((item, index) => (
              <div className="timeline-item" key={item.time}>
                <div className="timeline-time">{item.time}</div>
                <div className="timeline-marker"><span>{String(index + 1).padStart(2, '0')}</span></div>
                <div className="timeline-copy"><h3>{item.title}</h3><p>{item.copy}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="feature-section section-block" id="details">
          <div className="section-heading-row">
            <div>
              <div className="section-eyebrow">Chapter one · 21 November</div>
              <h2>The evening details</h2>
            </div>
            <span className="section-number">01</span>
          </div>
          <div className="section-art-line" aria-hidden="true">
            <img src="/dholki-border-ornament.webp" alt="" loading="lazy" decoding="async" />
            <span>Colour · rhythm · family</span>
            <img src="/dholki-border-ornament.webp" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="feature-grid">
            <div className="feature-copy">
              <p className="feature-script">Dholki Night</p>
              <p>An evening of henna, dholki beats, family songs, and the kind of laughter that stays with you long after the last note.</p>
              <div className="detail-pairs">
                <div><span>Date</span><strong>Saturday, 21 November 2026</strong></div>
                <div><span>Time</span><strong>6:00 PM onwards</strong></div>
              </div>
            </div>
            <div className="venue-card">
              <div className="venue-map-art">
                <iframe src={`https://www.google.com/maps?q=${encodeURIComponent(venue)}&output=embed`} title={`Google Map showing ${venue}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                <span className="map-label">LIVE MAP · LAHORE</span>
              </div>
              <div className="venue-copy">
                <span className="small-label">The gathering place</span>
                <strong>{venue}</strong>
                <a href={venueLink} target="_blank" rel="noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>
        </section>

        <section className="rsvp-section section-block" id="rsvp">
          <div className="section-eyebrow">✦ Reply card ✦</div>
          <h2>Will you join our mehfil?</h2>
          <p className="rsvp-intro">The favour of a reply is requested. Choose your response and we will prepare a WhatsApp message for you.</p>
          <div className="rsvp-grid">
            <button className={`rsvp-card ${rsvp === 'accept' ? 'selected' : ''}`} type="button" onClick={() => openRsvp('accept')}>
              <span className="rsvp-symbol">✓</span><span className="small-label">Accepts with joy</span><strong>Will attend with pleasure</strong>
            </button>
            <button className={`rsvp-card ${rsvp === 'decline' ? 'selected' : ''}`} type="button" onClick={() => openRsvp('decline')}>
              <span className="rsvp-symbol">×</span><span className="small-label">Declines with regret</span><strong>Celebrating from afar</strong>
            </button>
          </div>
        </section>

        <footer className="invitation-footer">
          <div className="footer-monogram">م</div>
          <div className="ornament-row" aria-hidden="true"><span />✦<span /></div>
          <p>With love, prayers & deepest gratitude</p>
          <strong>Syed Zain-ul-Abideen & Syeda Esha Javeed</strong>
          <div className="footer-credit-grid" aria-label="Dholki hosts and welcome">
            <div className="footer-credit">
              <span className="footer-credit-label">Dholki organized by</span>
              <strong>Beloved Mamu &amp; Khala</strong>
              <p>Mr. &amp; Mrs. Asad Bukhari</p>
            </div>
            <div className="footer-credit">
              <span className="footer-credit-label">Looking forward to welcoming you</span>
              <p>Syed Muhammad Qasim Haider<br />&amp;<br />Syed Muhammad Daniyal Haider</p>
            </div>
          </div>
          <a href="#top">Back to the beginning ↑</a>
        </footer>
      </div>

      {notice && <div className="toast" role="status">{notice}</div>}

      {whatsappUrl && (
        <div className="modal-backdrop" role="presentation" onClick={() => setWhatsappUrl('')}>
          <section className="whatsapp-modal" role="dialog" aria-modal="true" aria-labelledby="whatsapp-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header"><span id="whatsapp-title">Ready to reply?</span><button type="button" className="close-button" aria-label="Close" onClick={() => setWhatsappUrl('')}>×</button></div>
            <p className="message-preview">{rsvpMessage}</p>
            <div className="modal-actions"><a className="primary-open" href={whatsappUrl} target="_blank" rel="noreferrer">Open WhatsApp ↗</a><button className="secondary-cancel" type="button" onClick={() => setWhatsappUrl('')}>Not now</button></div>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
