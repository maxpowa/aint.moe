"use strict";

let express = require('express')
let router = express.Router()
let danbooru = require('danbooru')
let apicache = require('apicache')

let shuffle = (array) => {
  let i = 0, j = 0, temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

let handle_request = (req, res, next) => {
  // Skip this request as it's a subpath on the root
  if (req.subdomains.length === 0) return next()

  let subject = req.subdomains.reverse().join(" ")
  subject = subject.replace(/(^|\s)[a-z]/g, (f) => f.toUpperCase() )

  let tags = req.path.replace(/^\//, '')
  tags = tags.split('/')
  // Add * to subject for wildcard danbooru search (misaka will find misaka_mikoto etc)
  tags.push(subject.replace(" ", "_") + "*")

  if (tags.length > 2) {
    var error = new Error('Too many tags specified')
    error.status = 403
    return next(error)
  } else if (tags.length == 1) {
    tags.push("rating:safe")
  }

  danbooru.search(tags.join(" "), {limit: 50}, (err, pageData) => {
    if (err) throw err;
    if (pageData.length === 0) {
      var error = new Error('Not found')
      error.status = 404
      return next(error)
    }

    let previews = pageData.map((val) => {
      return val.preview_file_url
    })
    shuffle(previews)

    res.render('waifu', { subject: subject, previews: previews})
  })
}

router.get('/', apicache.middleware('1 hour'), (req, res, next) => {
  // Handle requests directly to the root
  if (req.subdomains.length === 0) {
    danbooru.search("rating:safe", {limit: 50}, (err, pageData) => {
      if (err) throw err;
      if (pageData.length === 0) {
        var error = new Error('Not found')
        error.status = 404
        return next(error)
      }

      let previews = pageData.map((val) => {
        return val.preview_file_url
      })
      shuffle(previews)

      res.render('index', { previews: previews})
    })
    return
  }

  handle_request(req, res, next)
});

router.get('/*', apicache.middleware('1 hour'), handle_request)

module.exports = router
