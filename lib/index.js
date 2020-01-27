const Cloudflare = require('cloudflare')

async function * browse (api, ...args) {
  let page = 1
  do {
    var response = await api.browse(...args, { page, per_page: 100 })
    yield * response.result
    page = response.result_info.page + 1
  } while (response.result_info.page <= response.result_info.total_pages)
}

async function getZoneId (api, name) {
  const zones = browse(api.zones)

  for await (const zone of zones) {
    if (zone.name === name) {
      return zone.id
    }
  }

  throw new Error(`zone ${name} couldn't be found`)
}

async function getRecord (api, id, name) {
  const records = browse(api.dnsRecords, id)

  for await (const record of records) {
    if (record.type === 'TXT' && record.name === name && record.content.startsWith('dnslink=')) {
      return record
    }
  }

  return null
}

async function update (apiOpts, { zone, link, record }) {
  const api = new Cloudflare(apiOpts)
  const id = await getZoneId(api, zone)
  const dnslink = `dnslink=${link}`
  const rec = await getRecord(api, id, record)

  if (rec) {
    rec.content = dnslink
    await api.dnsRecords.edit(id, rec.id, rec)
  } else {
    await api.dnsRecords.add(id, {
      type: 'TXT',
      name: record,
      content: dnslink
    })
  }

  return dnslink
}

module.exports = update
