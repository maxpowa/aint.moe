"use strict";

let express = require('express')
let router = express.Router()
let danbooru = require('danbooru')

let handle_request = (req, res, next) => {
  // Skip this request as it's a subpath on the root
  if (req.subdomains.length === 0) next()

  let subject = req.subdomains.reverse().join(" ")
  subject = subject.replace(/(^|\s)[a-z]/g, (f) => f.toUpperCase() )

  let tags = req.path.replace(/^\//, '')

  tags = req.path.split('/')
  tags.push(subject.replace(" ", "_"))


  danbooru.search(tags.join(" "), {limit: 20}, (err, pageData) => {
    if (err) throw err;
    if (!pageData) throw new Error()

    res.render('index', { title: tags.join(" "), image_url: pageData.random().preview_file_url })
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
