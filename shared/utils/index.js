export const errorLoading = (err) => console.error('Dynamic page loading failed: ', err)

export function debounce(func, wait) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 格式化日期为用户友好的格式
 * @param {string} dateString - ISO 8601 日期字符串
 * @returns {string} 格式化后的日期，如 "Nov 23, 2025"
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString // 如果无效日期，返回原字符串
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

/**
 * 格式化日期和时间
 * @param {string} dateString - ISO 8601 日期时间字符串
 * @returns {string} 格式化后的日期时间，如 "Nov 23, 2025 3:32 PM"
 */
export function formatDateTime(dateString) {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }
    return date.toLocaleDateString('en-US', options)
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return dateString
  }
}

/**
 * 格式化为短日期格式
 * @param {string} dateString - ISO 8601 日期字符串
 * @returns {string} 格式化后的日期，如 "2025-11-23"
 */
export function formatDateShort(dateString) {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date short:', error)
    return dateString
  }
}
