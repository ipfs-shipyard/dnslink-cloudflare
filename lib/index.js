const got = require('got')

async function getZoneId (api, name) {
  let res

  for (let i = 1; (res = await api(`zones?page=${i}`)) && res.body.result_info.total_pages >= i; i++) {
    for (const zone of res.body.result) {
      if (zone.name === name) {
        return zone.id
      }
    }
  }

  throw new Error(`zone ${name} couldn't be found`)
}

async function getRecord (api, id, name) {
  let res

  for (let i = 1; (res = await api(`zones/${id}/dns_records?type=TXT&page=${i}`)) && res.body.result_info.total_pages >= i; i++) {
    for (const record of res.body.result) {
      if (record.name === name && record.content.startsWith('dnslink=')) {
        return record
      }
    }
  }

  return null
}

function getClient (apiOpts) {
  const opts = {
    prefixUrl: 'https://api.cloudflare.com/client/v4',
    responseType: 'json'
  }

  if (apiOpts.token) {
    opts.headers = {
      Authorization: `Bearer ${apiOpts.token}`
    }
  } else {
    opts.headers = {
      'X-Auth-Email': apiOpts.email,
      'X-Auth-Key': apiOpts.key
    }
  }

  return got.extend(opts)
}

async function update (apiOpts, { zone, link, record }) {
  const api = getClient(apiOpts)
  const id = await getZoneId(api, zone)
  const dnslink = `dnslink=${link}`
  const rec = await getRecord(api, id, record)

  if (rec) {
    await api.patch(`zones/${id}/dns_records/${rec.id}`, {
      json: {
        content: dnslink
      }
    })
  } else {
    await api.post(`zones/${id}/dns_records`, {
      json: {
        type: 'TXT',
        name: record,
        content: dnslink
      }
    })
  }

  return dnslink
}

module.exports = update
