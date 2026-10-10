import raw from '../data/vcards.json'

export const data = raw

const enc = encodeURIComponent

export function iconUrl(contact) {
  return `icons/${enc(contact.category)}/${enc(contact.filename)}.png`
}

export function vcfUrl(contact) {
  return `vcf/${enc(contact.category)}/${enc(contact.filename)}.vcf`
}

export function getCategory(name) {
  return data.categories.find((c) => c.name === name)
}

export function getContactsByCategory(name) {
  return data.contacts
    .filter((c) => c.category === name)
    .sort((a, b) => a.organization.localeCompare(b.organization, 'zh-Hans-CN'))
}

export function findContact(category, filename) {
  return data.contacts.find((c) => c.category === category && c.filename === filename)
}