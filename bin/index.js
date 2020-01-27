#!/usr/bin/env node

const yargs = require('yargs')
const update = require('../lib')

const argv = yargs
  .usage('$0', 'Updates the dnslink for a Cloudflare configuration. Both the CF_API_KEY and CF_API_EMAIL environment variables or the CF_API_TOKEN environment variable must be set.')
  .scriptName('dnslink-cloudflare')
  .option('domain', {
    alias: 'd',
    describe: 'Cloudflare domain name',
    type: 'string',
    demandOption: true
  }).option('link', {
    alias: 'l',
    describe: 'dnslink value, eg. ipfs path',
    type: 'string',
    demandOption: true
  }).option('record', {
    alias: 'r',
    describe: 'Domain record name',
    type: 'string',
    default: '@'
  })
  .help()
  .argv

async function run () {
  const key = process.env.CF_API_KEY
  const email = process.env.CF_API_EMAIL
  const token = process.env.CF_API_TOKEN

  if ((!key || !email) && !token) {
    yargs.showHelp()
    return
  }

  const api = {
    key,
    email,
    token
  }

  const opts = {
    record: argv.record === '@' ? argv.domain : `${argv.record}.${argv.domain}`,
    zone: argv.domain,
    link: argv.link
  }

  try {
    const content = await update(api, opts)
    console.log(`Updated TXT ${opts.record} to ${content}`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

run()
