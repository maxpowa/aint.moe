"use strict";

let express = require('express')
let router = express.Router()
let danbooru = require('danbooru')

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

  tags = req.path.split('/')
  // Add * to subject for wildcard danbooru search (misaka will find misaka_mikoto etc)
  tags.push(subject.replace(" ", "_") + "*")


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

    res.render('index', { subject: subject, previews: previews})
  })
}

router.get('/', (req, res, next) => {
  // Handle requests directly to the root
  if (req.subdomains.length === 0) {
    res.render('index', { title: 'Express' })
    return next();
  }

  handle_request(req, res, next)
});

router.get('/*', handle_request)

module.exports = router
