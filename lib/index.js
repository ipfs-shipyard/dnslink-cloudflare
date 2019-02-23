const Cloudflare = require('cloudflare')

async function getZoneId (api, name) {
  const zones = await api.zones.browse()

  for (const zone of zones.result) {
    if (zone.name === name) {
      return zone.id
    }
  }

  throw new Error(`zone ${name} couldn't be found`)
}

async function getRecord (api, id, name) {
  const records = await api.dnsRecords.browse(id)

  for (const record of records.result) {
    if (record.type === 'TXT' && record.name === name && record.content.startsWith('dnslink=')) {
      return record
    }
  }

  return null
}

async function update (apiOpts, zoneName, path, recordName) {
  const api = new Cloudflare(apiOpts)

  try {
    const id = await getZoneId(api, zoneName)
    const dnslink = `dnslink=${path}`
    let record = await getRecord(api, id, recordName)

    if (record) {
      record.content = dnslink
      await api.dnsRecords.edit(id, record.id, record)
    } else {
      await api.dnsRecords.add(id, {
        type: 'TXT',
        name: recordName,
        content: dnslink
      })
    }

    console.log(`Updated TXT ${recordName}.${zoneName} to ${dnslink}`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

module.exports = update
