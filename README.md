# dnslink-cloudflare

[![](https://img.shields.io/npm/v/dnslink-cloudflare.svg?style=flat-square)](https://www.npmjs.com/package/dnslink-cloudflare)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](https://webchat.freenode.net/?channels=%23ipfs)

> Update dnslink TXT records in Cloudflare

## Usage

```sh
npx dnslink-cloudflare -d <domain> -l <link> [-r record]
```

Required environment variables

- `CF_API_KEY` CloudFlare API key
- `CF_API_EMAIL` CloudFlare API email
- `CF_API_TOKEN` CloudFlare API token

These values are obtained from in the CloudFlare account. https://dash.cloudflare.com/profile/api-tokens

## Contributing

PRs accepted.

## License

MIT © Protocol Labs
