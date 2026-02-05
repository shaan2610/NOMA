const fs = require('fs');
const path = require('path');

// Leer el archivo actual
const filePath = path.join(__dirname, 'packages/nextjs/contracts/deployedContracts.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Encontrar el cierre del objeto 31337 (localhost)
const localhostEnd = content.lastIndexOf('  },\n} as const;');

if (localhostEnd === -1) {
  console.error('No se encontró la estructura esperada del archivo');
  process.exit(1);
}

// Leer el contenido de localhost
const localhostStart = content.indexOf('31337: {');
const localhostContent = content.substring(localhostStart, localhostEnd + 4);

// Crear el contenido para Sepolia reemplazando las direcciones
let sepoliaContent = localhostContent.replace(/31337:/g, '11155111:');

// Reemplazar las direcciones de los contratos
sepoliaContent = sepoliaContent.replace(/"0x0165878A594ca255338adfa4d48449f69242Eb8F"/g, '"0x8f0237b2076887988b796C6054A9a5a6Cf5cA058"'); // LeaseNFT
sepoliaContent = sepoliaContent.replace(/"0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"/g, '"0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b"'); // MockUSDC
sepoliaContent = sepoliaContent.replace(/"0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"/g, '"0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4"'); // NomaPayment
sepoliaContent = sepoliaContent.replace(/"0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"/g, '"0xc8a37Bd0B65862e9e38F7568621e4349d84De007"'); // NomaVault
sepoliaContent = sepoliaContent.replace(/"0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"/g, '"0x54063F6114cCDD076f60a5AB3729a8C89B0264ad"'); // ReputationRegistry

// Insertar el contenido de Sepolia
const newContent = content.substring(0, localhostEnd + 4) + ',\n  ' + sepoliaContent + content.substring(localhostEnd + 4);

// Escribir el archivo actualizado
fs.writeFileSync(filePath, newContent, 'utf-8');

console.log('✅ Sepolia configuration added successfully!');
console.log('Contract addresses:');
console.log('  MockUSDC: 0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b');
console.log('  LeaseNFT: 0x8f0237b2076887988b796C6054A9a5a6Cf5cA058');
console.log('  NomaVault: 0xc8a37Bd0B65862e9e38F7568621e4349d84De007');
console.log('  ReputationRegistry: 0x54063F6114cCDD076f60a5AB3729a8C89B0264ad');
console.log('  NomaPayment: 0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4');
