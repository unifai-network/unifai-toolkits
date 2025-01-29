const whoiser = require('whoiser');

export async function checkDomainAvailability(domainName: string): Promise<string> {
  const domainWhois = await whoiser(domainName, { follow: 1 });
  const firstDomainWhois = whoiser.firstResult(domainWhois);
  const firstTextLine = (firstDomainWhois.text[0] || '').toLowerCase();

  if (firstTextLine.includes('reserved')) {
    return 'reserved';
  } else if (firstDomainWhois['Domain Name'] && firstDomainWhois['Domain Name'].toLowerCase() === domainName.toLowerCase()) {
    return 'registered';
  } else if (firstTextLine.includes(`domain not found`)) {
    return 'available';
  }

  return 'unknown';
}

export async function getDomainWhoisInfo(domainName: string): Promise<any> {
  return await whoiser(domainName);
}
