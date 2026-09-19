/*=============== PRELOADER ===============*/
window.addEventListener('load', () => {
   const preloader = document.getElementById('preloader')
   if (preloader) {
      setTimeout(() => preloader.classList.add('is-hidden'), 300)
   }
})

/*=============== SHOW MENU ===============*/
const navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close'),
      navMenu = document.getElementById('nav-menu'),
      navBackdrop = document.getElementById('nav-backdrop')

const openMenu = () => {
   navMenu.classList.add('show-menu')
   navBackdrop.classList.add('show')
   navToggle.setAttribute('aria-expanded', 'true')
   document.body.style.overflow = 'hidden'
}

const closeMenu = () => {
   navMenu.classList.remove('show-menu')
   navBackdrop.classList.remove('show')
   navToggle.setAttribute('aria-expanded', 'false')
   document.body.style.overflow = ''
}

navToggle?.addEventListener('click', openMenu)
navClose?.addEventListener('click', closeMenu)
navBackdrop?.addEventListener('click', closeMenu)

/*=============== REMOVE MENU MOBILE ===============*/
document.querySelectorAll('.nav__link').forEach((link) => {
   link.addEventListener('click', closeMenu)
})

document.addEventListener('keydown', (e) => {
   if (e.key === 'Escape') closeMenu()
})

/*=============== CHANGE BACKGROUND HEADER ===============*/
const header = document.getElementById('header')

const toggleHeaderBg = () => {
   if (window.scrollY >= 40) header.classList.add('scrolled')
   else header.classList.remove('scrolled')
}
window.addEventListener('scroll', toggleHeaderBg, { passive: true })
toggleHeaderBg()

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('main .section[id], .home[id]')
const navLinks = document.querySelectorAll('.nav__link[data-section]')

const setActiveLink = () => {
   const scrollY = window.scrollY
   let currentId = sections[0]?.id

   sections.forEach((section) => {
      const sectionTop = section.offsetTop - header.offsetHeight - 80
      if (scrollY >= sectionTop) currentId = section.id
   })

   navLinks.forEach((link) => {
      link.classList.toggle('active-link', link.dataset.section === currentId)
   })
}
window.addEventListener('scroll', setActiveLink, { passive: true })
setActiveLink()

/*=============== SMOOTH SCROLL WITH HEADER OFFSET ===============*/
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
   anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href')
      if (targetId.length < 2) return
      const target = document.querySelector(targetId)
      if (!target) return
      e.preventDefault()
      const offset = target.offsetTop - header.offsetHeight + 1
      window.scrollTo({ top: offset, behavior: 'smooth' })
   })
})

/*=============== SCROLL REVEAL ANIMATION ===============*/
const revealElements = document.querySelectorAll('[data-reveal]')

const revealObserver = new IntersectionObserver((entries, observer) => {
   entries.forEach((entry) => {
      if (entry.isIntersecting) {
         entry.target.classList.add('reveal-visible')
         observer.unobserve(entry.target)
      }
   })
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' })

revealElements.forEach((el) => revealObserver.observe(el))

/*=============== ANIMATED COUNTERS ===============*/
const counters = document.querySelectorAll('[data-counter]')

const animateCounter = (el) => {
   const target = parseFloat(el.dataset.target)
   const decimals = parseInt(el.dataset.decimal || '0', 10)
   const suffix = el.dataset.suffix || ''
   const duration = 1600
   const start = performance.now()

   const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = target * eased
      el.textContent = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix
      if (progress < 1) requestAnimationFrame(step)
   }
   requestAnimationFrame(step)
}

const counterObserver = new IntersectionObserver((entries, observer) => {
   entries.forEach((entry) => {
      if (entry.isIntersecting) {
         animateCounter(entry.target)
         observer.unobserve(entry.target)
      }
   })
}, { threshold: 0.6 })

counters.forEach((el) => counterObserver.observe(el))

/*=============== PARALLAX ===============*/
const parallaxElements = document.querySelectorAll('[data-parallax]')

const updateParallax = () => {
   const viewportH = window.innerHeight
   parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.1
      const rect = el.getBoundingClientRect()
      const centerOffset = rect.top + rect.height / 2 - viewportH / 2
      el.style.transform = `translate3d(0, ${(-centerOffset * speed).toFixed(1)}px, 0)`
   })
}

let parallaxTicking = false
window.addEventListener('scroll', () => {
   if (!parallaxTicking) {
      requestAnimationFrame(() => {
         updateParallax()
         parallaxTicking = false
      })
      parallaxTicking = true
   }
}, { passive: true })
updateParallax()

/*=============== TESTIMONIAL SLIDER ===============*/
const track = document.getElementById('testimonial-track')
const dotsWrap = document.getElementById('testimonial-dots')
const prevBtn = document.getElementById('testimonial-prev')
const nextBtn = document.getElementById('testimonial-next')

if (track) {
   const slides = Array.from(track.children)
   let index = 0
   let autoplayId

   slides.forEach((_, i) => {
      const dot = document.createElement('button')
      dot.classList.add('testimonial__dot')
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`)
      dot.addEventListener('click', () => goTo(i))
      dotsWrap.appendChild(dot)
   })
   const dots = Array.from(dotsWrap.children)

   const render = () => {
      track.style.transform = `translateX(-${index * 100}%)`
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index))
   }

   const goTo = (i) => {
      index = (i + slides.length) % slides.length
      render()
      restartAutoplay()
   }

   const next = () => goTo(index + 1)
   const prev = () => goTo(index - 1)

   nextBtn?.addEventListener('click', next)
   prevBtn?.addEventListener('click', prev)

   const startAutoplay = () => { autoplayId = setInterval(next, 6000) }
   const restartAutoplay = () => { clearInterval(autoplayId); startAutoplay() }
   startAutoplay()

   const slider = track.closest('.testimonial__slider')
   slider?.addEventListener('mouseenter', () => clearInterval(autoplayId))
   slider?.addEventListener('mouseleave', startAutoplay)

   /* touch / drag swipe */
   let startX = 0, isDragging = false
   track.addEventListener('pointerdown', (e) => {
      isDragging = true
      startX = e.clientX
      clearInterval(autoplayId)
   })
   track.addEventListener('pointerup', (e) => {
      if (!isDragging) return
      isDragging = false
      const delta = e.clientX - startX
      if (delta > 50) prev()
      else if (delta < -50) next()
      else restartAutoplay()
   })

   render()
}

/*=============== GALLERY LIGHTBOX ===============*/
const lightbox = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightbox-img')
const lightboxCaption = document.getElementById('lightbox-caption')
const lightboxClose = document.getElementById('lightbox-close')

document.querySelectorAll('.gallery__item').forEach((item) => {
   item.addEventListener('click', () => {
      const img = item.querySelector('img')
      const caption = item.querySelector('figcaption')
      lightboxImg.src = img.src
      lightboxImg.alt = img.alt
      lightboxCaption.textContent = caption ? caption.textContent : ''
      lightbox.hidden = false
      document.body.style.overflow = 'hidden'
   })
})

const closeLightbox = () => {
   lightbox.hidden = true
   document.body.style.overflow = ''
}

lightboxClose?.addEventListener('click', closeLightbox)
lightbox?.addEventListener('click', (e) => {
   if (e.target === lightbox) closeLightbox()
})
document.addEventListener('keydown', (e) => {
   if (e.key === 'Escape' && !lightbox.hidden) closeLightbox()
})

/*=============== NEWSLETTER FORM ===============*/
const joinForm = document.getElementById('join-form')
const joinNote = document.getElementById('join-note')

joinForm?.addEventListener('submit', (e) => {
   e.preventDefault()
   const email = document.getElementById('join-email').value.trim()
   if (!email) return

   joinNote.innerHTML = '<i class="ri-checkbox-circle-fill"></i> Thanks! Check your inbox to confirm.'
   joinNote.classList.add('success')
   joinForm.reset()

   setTimeout(() => {
      joinNote.innerHTML = '<i class="ri-shield-check-line"></i> No spam. Unsubscribe anytime.'
      joinNote.classList.remove('success')
   }, 4000)
})

/*=============== SHOW SCROLL UP ===============*/
const scrollUpBtn = document.getElementById('scroll-up')

const toggleScrollUp = () => {
   const docHeight = document.documentElement.scrollHeight - window.innerHeight
   const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
   scrollUpBtn.style.setProperty('--scroll', progress.toFixed(1))
   scrollUpBtn.classList.toggle('show', window.scrollY >= 400)
}
window.addEventListener('scroll', toggleScrollUp, { passive: true })
toggleScrollUp()

scrollUpBtn?.addEventListener('click', () => {
   window.scrollTo({ top: 0, behavior: 'smooth' })
})

/*=============== FOOTER YEAR ===============*/
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()
