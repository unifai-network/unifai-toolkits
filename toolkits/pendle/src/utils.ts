

export function IsEVMAddress(address: string) {
  // regex for evm address
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}