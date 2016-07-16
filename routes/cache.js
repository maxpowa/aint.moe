"use strict";

const request = require('request')
const validUrl = require('valid-url')
const express = require('express')
const from_hex = require('../lib/cache').from_hex
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const stream = require('stream')

const OptiPNG = require('optipng')
const JPEGTran = require('jpegtran')
const GIFsicle = require('gifsicle-stream')

const router = express.Router()

router.get('/:key', (req, res, next) => {
  let url = from_hex(req.params.key);
  if (!validUrl.isUri(url)) {
    let error = new Error('Not found')
    error.status = 404
    return next(error)
  }

  mkdirp.sync('./cache')
  let file = fs.createWriteStream('./cache/' + req.params.key)
  let minifier = new stream.PassThrough();
  let rem = request(url)
    .on('response', response => {
      switch(response.headers['content-type']) {
        case 'image/png':
          minifier = new OptiPNG(['-o7'])
          res.append('X-Image-Optimizer', 'optipng')
          break
        case 'image/jpeg':
          minifier = new JPEGTran(['-optimize', '-perfect'])
          res.append('X-Image-Optimizer', 'jpegtran')
          break
        case 'image/gif':
          minifier = new GIFsicle(['-w', '-O3'])
          res.append('X-Image-Optimizer', 'gifsicle')
          break
        default:
          res.append('X-Image-Optimizer', 'none')
          break
      }
    })
    .pipe(minifier)
    .on('data', chunk => {
      file.write(chunk);
      res.write(chunk);
    })
    .on('end', () => {
      res.end();
    });
})

module.exports = router
