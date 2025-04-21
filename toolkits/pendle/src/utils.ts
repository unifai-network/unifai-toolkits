

export function IsEVMAddress(address: string) {
  // regex for evm address
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}



// In Pendle, if gas token is 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee, 
// return 0x0000000000000000000000000000000000000000
export function redefineGasToken(token: string) {
  if (token.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
    return "0x0000000000000000000000000000000000000000";
  }
  return token;
}