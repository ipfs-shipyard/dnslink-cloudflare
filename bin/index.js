const yargs = require('yargs')
const update = require('../lib')

yargs.command('$0 zone path', 'Updates the dnslink for a Cloudflare configuration. CF_API_KEY and CF_API_EMAIL environment variables must be set.', yargs => {
    yargs.positional('zone', {
      describe: 'Name of the zone to update',
      type: 'string'
    }).positional('path', {
      describe: 'IPFS path',
      type: 'string'
    }).option('record', {
      alias: 'r',
      describe: 'Name of the record to update',
      type: 'string',
      default: '@'
    }).require(['zone', 'path'])
  }, async argv => {
    const key = process.env.CF_API_KEY
    const email = process.env.CF_API_EMAIL

    if (!key|| !email) {
      yargs.showHelp()
      return
    }

    const api = {
      key,
      email
    }

    const opts = {
      record: argv.record === '@' ? argv.zone : argv.record,
      zone: argv.zone,
      path: argv.path
    }

    try {
      const content = await update(api, opts)
      const record = opts.record === opts.zone ? '@' : opts.record
      console.log(`Updated TXT ${record}.${argv.zone} to ${content}`)
    } catch (err) {
      console.log(err)
      process.exit(1)
    }
  })
  .help()
  .argv
