import axios, { ResponseData } from './index'
import { AxiosPromise } from 'axios'

export const getCountryList = (): AxiosPromise<ResponseData> => {
  return axios.request({
    url: '/v1/open/countries',
    method: 'GET'
  })
}
