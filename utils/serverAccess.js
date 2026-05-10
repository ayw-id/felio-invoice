import * as axios from 'axios'
import qs from 'qs'

export const requestData = (opt = {}) => {
  const {
    url,
    method = 'post',
    body = null,
    headers = null,
    type = 'builder',
  } = opt
  console.log('process.env.API_AI_CONTENT', process.env.API_AI_CONTENT)
  return axios({
    method,
    url: `${
      type === 'builder'
        ? process.env.API
        : type === 'customer'
        ? process.env.API_CUSTOMER
        : type === 'seller'
        ? process.env.API_MERCHANT
        : type === 'ai-content-user'
        ? process.env.API_AI_CONTENT
        : ''
    }${url}`,
    data: body ? qs.stringify(body) : null,
    ...(headers ? { headers } : {}),
  })
}
