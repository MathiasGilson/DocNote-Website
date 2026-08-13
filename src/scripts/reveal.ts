const SELECTOR = ".reveal"
const VISIBLE = "is-visible"

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

export const initReveal = () => {
  const elements = document.querySelectorAll<HTMLElement>(
    `${SELECTOR}:not(.${VISIBLE})`
  )
  if (!elements.length) return

  if (prefersReducedMotion()) {
    elements.forEach((el) => el.classList.add(VISIBLE))
    return
  }

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add(VISIBLE))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add(VISIBLE)
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  )

  elements.forEach((el) => observer.observe(el))
}
