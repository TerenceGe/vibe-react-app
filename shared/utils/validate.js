export function validateEmail(email) {
  return email && !!email.match(/[^\s@]+@[^\s@]+\.[^\s@]+/gi)
}
