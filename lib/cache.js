"use strict";

let to_hex = (url) => {
  let buffer = new Buffer(url, 'utf-8')
  let bytes = Array.prototype.slice.call(buffer)

  return bytes.map((val) => val.toString(16)).join('')
}

let from_hex = (str) => {
  return new Buffer(str, 'hex').toString('utf-8')
}

let to_cache = (url) => {
  return `/cache/${to_hex(url)}`
}

module.exports = { to_cache: to_cache, from_hex: from_hex }
