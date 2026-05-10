export const priceWithCurrency = (amount, useCurrency) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
  return formatter.format(amount).replace('IDR', useCurrency ? 'Rp' : '')
}

export const getShippingPriceRange = (services) => {
  let minPrice = -1
  let maxPrice = 0
  services.forEach((service) => {
    if (minPrice === -1) {
      minPrice = service.value
    } else {
      minPrice = minPrice < service.value ? minPrice : service.value
    }

    if (maxPrice < service.value) {
      maxPrice = service.value
    }
  })

  return {
    min: minPrice,
    max: maxPrice,
  }
}

export const isAlphaNumeric = (str, options = null) => {
  let code, i, len

  let allowUpperCase = false
  let allowDash = false
  if (options) {
    if (options.allowUpperCase) {
      allowUpperCase = true
    }
    if (options.allowDash) {
      allowDash = true
    }
  }

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i)
    if (code === 45) {
      if (!allowDash) {
        return false
      }
    } else if (allowUpperCase) {
      if (
        !(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)
      ) {
        // lower alpha (a-z)
        return false
      }
    } else if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 96 && code < 123)
    ) {
      // lower alpha (a-z)
      return false
    }
  }
  return true
}
