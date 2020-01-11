const Cloudflare = require('cloudflare')

async function getZoneId (api, name, page = 1) {
  const zones = await api.zones.browse({ page })

  for (const zone of zones.result) {
    if (zone.name === name) {
      return zone.id
    }
  }

  if (zones.result_info.page <= zones.result_info.total_pages) {
    return getZoneId(api, name, zones.result_info.page + 1)
  }

  throw new Error(`zone ${name} couldn't be found`)
}

async function getRecord (api, id, name, page = 1) {
  const records = await api.dnsRecords.browse(id, { page })

  for (const record of records.result) {
    if (record.type === 'TXT' && record.name === name && record.content.startsWith('dnslink=')) {
      return record
    }
  }

  if (records.result_info.page <= records.result_info.total_pages) {
    return getRecord(api, id, name, records.result_info.page + 1)
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
