export const rules = (t) => {
  return {
    nameRules: [
      (val) => !!val || t.$t('errors.requiredName'),
      (val) => /^([a-zA-Z .']){2,30}$/.test(val) || t.$t('errors.invalidName'),
    ],
    emailRules: [
      (v) => !!v || t.$t('errors.requiredEmail'),
      (v) => /.+@.+\..+/.test(v) || t.$t('errors.invalidEmail'),
    ],
    phoneRules: [
      (val) => !!val || t.$t('errors.requiredPhone'),
      (val) => /^([0-9]){9,12}$/.test(val) || t.$t('errors.invalidPhone'),
    ],
    passwordRules: [(val) => val.length > 6 || t.$t('errors.password')],
    requiredRules: [(val) => !!val || t.$t('errors.password')],
    postCodeRules: [
      (val) => !!val || t.$t('errors.requiredField'),
      (val) => /^([0-9]){3,7}$/.test(val) || t.$t('errors.invalidPostCode'),
    ],
  }
}

export const filterPhoneNumber = (phone, callingCode) => {
  return phone
    .replaceAll('-', '')
    .replaceAll(' ', '')
    .replace(`+${callingCode || ''}`, '')
}

export const validate = (t, data) => {
  let error = ''
  const validationRules = rules(t)

  const { name, email, phone, password, postalCode } = data

  if (name !== undefined) {
    error = validationRules.nameRules[0](name)
    if (error !== true) {
      return error
    }
    error = validationRules.nameRules[1](name)
    if (error !== true) {
      return error
    }
  }

  if (email !== undefined) {
    error = validationRules.emailRules[0](email)
    if (error !== true) {
      return error
    }
    error = validationRules.emailRules[1](email)
    if (error !== true) {
      return error
    }
  }

  if (phone !== undefined) {
    error = validationRules.phoneRules[0](phone)
    if (error !== true) {
      return error
    }
    error = validationRules.phoneRules[1](phone)
    if (error !== true) {
      return error
    }
  }

  if (password !== undefined) {
    error = validationRules.passwordRules[0](password)
    if (error !== true) {
      return error
    }
  }

  if (postalCode !== undefined) {
    error = validationRules.postCodeRules[0](postalCode)
    if (error !== true) {
      return error
    }
    error = validationRules.postCodeRules[1](postalCode)
    if (error !== true) {
      return error
    }
  }

  return ''
}
