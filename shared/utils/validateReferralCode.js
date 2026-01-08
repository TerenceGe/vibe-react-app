import * as api from 'api/supabase'

export async function validateReferralCode(code) {
  if (!code || code.trim() === '') {
    return { isValid: true, reason: 'empty' }
  }

  try {
    // 提取基础邀请码（去掉 -BNB、-OKX 等后缀）并 trim
    const baseCode = code.split('-')[0].trim()
    
    console.log('[Referral] Validating code', { 
      originalCode: code, 
      baseCode,
      codeLength: baseCode.length 
    })
    
    const info = await api.getReferralInfo({ referral_code: baseCode })
    
    console.log('[Referral] API response', { 
      info,
      hasInfo: !!info,
      hasData: !!(info && info.data),
      hasReferrer: !!(info && info.data && info.data.referrer)
    })

    if (info && info.data && info.data.referrer) {
      console.log('[Referral] Valid referral code', {
        code,
        referrer: info.data.referrer.username,
        stats: info.data.stats
      })
      return {
        isValid: true,
        reason: 'valid',
        referrerName: info.data.referrer.username
      }
    }

    console.log('[Referral] Code not found - no referrer in response')
    return {
      isValid: false,
      reason: 'not_found',
      error: 'Referral code not found'
    }
  } catch (error) {
    console.error('[Referral] Failed to validate code', { code, error })

    const errorMessage = error?.message || ''

    if (errorMessage.includes('not found') ||
        errorMessage.includes('Invalid referral code') ||
        error?.code === 404) {
      return {
        isValid: false,
        reason: 'not_found',
        error: 'Referral code not found'
      }
    }

    return {
      isValid: false,
      reason: 'api_error',
      error: errorMessage || 'Failed to validate referral code'
    }
  }
}
