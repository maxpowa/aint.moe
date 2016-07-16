"use strict";

let request = require('request')
let {parseString} = require('xml2js');

function search(tags, params, callback) {
  let queryString = {
    page: 'dapi',
    s: 'post',
    q: 'index',
  }

  Object.assign(queryString, params)
  queryString.tags = tags

  request({
    uri: 'http://safebooru.org/index.php',
    qs: queryString
  }, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      parseString(body, (error, result) => {
        let posts = result.posts.post;
        if (!posts) {
          error = new Error('No posts found')
          error.status = 404
          return callback(error, null)
        }
        posts = posts.map((val) => {
          return val.$
        })
        callback(error, posts)
      })
    } else {
      callback(error, response)
    }
  })
}


module.exports = { search: search }
