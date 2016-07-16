"use strict";

let env = process.env.NODE_ENV || 'development';
if (env === 'production') {
  var LEX = require('letsencrypt-express')
} else {
  var LEX = require('letsencrypt-express').testing()
}
var config = require('config')

var lex = LEX.create({
  configDir: config.get('letsencrypt.directory'),
  approveRegistration: (hostname, approve) => {
    if (hostname.endsWith(config.get("host"))) { // Or check a database or list of allowed domains
      approve(null, {
        domains: [hostname],
        email: config.get("letsencrypt.email"),
        agreeTos: config.get("letsencrypt.agreetos")
      });
    }
  }
});

module.exports = {lex: lex}
