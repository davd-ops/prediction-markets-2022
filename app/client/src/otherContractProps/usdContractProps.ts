export const usdContractAddress = '0xFedD26F7527886d33552E2Df9f9a23B602DD2EF1'

export const usdABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "chainId_",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "src",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "guy",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "src",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "dst",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "DOMAIN_SEPARATOR",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "PERMIT_TYPEHASH",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "usr",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "usr",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "guy",
                "type": "address"
            }
        ],
        "name": "deny",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "usr",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "src",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "dst",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "move",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "nonces",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "holder",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "nonce",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "expiry",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "allowed",
                "type": "bool"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "permit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "usr",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "pull",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "usr",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "push",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "guy",
                "type": "address"
            }
        ],
        "name": "rely",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "dst",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "src",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "dst",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "version",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "wards",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

export const usdBytecode =  {
    "object": "0x60806040523480156200001157600080fd5b506040516200230938038062002309833981810160405281019062000037919062000168565b60016000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055507f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f6040518060400160405280600e81526020017f55534420537461626c65636f696e000000000000000000000000000000000000815250805190602001206040518060400160405280600181526020017f31000000000000000000000000000000000000000000000000000000000000008152508051906020012083306040516020016200012e959493929190620001c7565b604051602081830303815290604052805190602001206005819055505062000286565b60008151905062000162816200026c565b92915050565b6000602082840312156200017b57600080fd5b60006200018b8482850162000151565b91505092915050565b6200019f8162000224565b82525050565b620001b08162000238565b82525050565b620001c18162000262565b82525050565b600060a082019050620001de6000830188620001a5565b620001ed6020830187620001a5565b620001fc6040830186620001a5565b6200020b6060830185620001b6565b6200021a608083018462000194565b9695505050505050565b6000620002318262000242565b9050919050565b6000819050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b620002778162000262565b81146200028357600080fd5b50565b61207380620002966000396000f3fe608060405234801561001057600080fd5b50600436106101425760003560e01c80637ecebe00116100b8578063a9059cbb1161007c578063a9059cbb14610365578063b753a98c14610395578063bb35783b146103b1578063bf353dbb146103cd578063dd62ed3e146103fd578063f2d5d56b1461042d57610142565b80637ecebe00146102c35780638fcbaf0c146102f357806395d89b411461030f5780639c52a7f11461032d5780639dc29fac1461034957610142565b8063313ce5671161010a578063313ce567146102015780633644e5151461021f57806340c10f191461023d57806354fd4d501461025957806365fae35e1461027757806370a082311461029357610142565b806306fdde0314610147578063095ea7b31461016557806318160ddd1461019557806323b872dd146101b357806330adf81f146101e3575b600080fd5b61014f610449565b60405161015c9190611b74565b60405180910390f35b61017f600480360381019061017a9190611872565b610482565b60405161018c9190611a98565b60405180910390f35b61019d610574565b6040516101aa9190611c76565b60405180910390f35b6101cd60048036038101906101c89190611771565b61057a565b6040516101da9190611a98565b60405180910390f35b6101eb610a19565b6040516101f89190611ab3565b60405180910390f35b610209610a40565b6040516102169190611c91565b60405180910390f35b610227610a45565b6040516102349190611ab3565b60405180910390f35b61025760048036038101906102529190611872565b610a4b565b005b610261610bd4565b60405161026e9190611b74565b60405180910390f35b610291600480360381019061028c919061170c565b610c0d565b005b6102ad60048036038101906102a8919061170c565b610cd5565b6040516102ba9190611c76565b60405180910390f35b6102dd60048036038101906102d8919061170c565b610ced565b6040516102ea9190611c76565b60405180910390f35b61030d600480360381019061030891906117c0565b610d05565b005b6103176110bc565b6040516103249190611b74565b60405180910390f35b6103476004803603810190610342919061170c565b6110f5565b005b610363600480360381019061035e9190611872565b6111bd565b005b61037f600480360381019061037a9190611872565b6115da565b60405161038c9190611a98565b60405180910390f35b6103af60048036038101906103aa9190611872565b6115ef565b005b6103cb60048036038101906103c69190611771565b6115ff565b005b6103e760048036038101906103e2919061170c565b611610565b6040516103f49190611c76565b60405180910390f35b61041760048036038101906104129190611735565b611628565b6040516104249190611c76565b60405180910390f35b61044760048036038101906104429190611872565b61164d565b005b6040518060400160405280600e81526020017f55534420537461626c65636f696e00000000000000000000000000000000000081525081565b600081600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516105629190611c76565b60405180910390a36001905092915050565b60015481565b600081600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156105fe576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105f590611c56565b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16141580156106c657506fffffffffffffffffffffffffffffffff600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414155b156108915781600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561078a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078190611bb6565b60405180910390fd5b610810600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548361165d565b600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b6108da600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548361165d565b600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610966600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205483611680565b600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610a069190611c76565b60405180910390a3600190509392505050565b7fea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb60001b81565b601281565b60055481565b60016000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610acc576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ac390611bd6565b60405180910390fd5b610b15600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482611680565b600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610b6460015482611680565b6001819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610bc89190611c76565b60405180910390a35050565b6040518060400160405280600181526020017f310000000000000000000000000000000000000000000000000000000000000081525081565b60016000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414610c8e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c8590611bd6565b60405180910390fd5b60016000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050565b60026020528060005260406000206000915090505481565b60046020528060005260406000206000915090505481565b60006005547fea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb60001b8a8a8a8a8a604051602001610d4896959493929190611ace565b60405160208183030381529060405280519060200120604051602001610d6f929190611a61565b604051602081830303815290604052805190602001209050600073ffffffffffffffffffffffffffffffffffffffff168973ffffffffffffffffffffffffffffffffffffffff161415610df7576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610dee90611bf6565b60405180910390fd5b60018185858560405160008152602001604052604051610e1a9493929190611b2f565b6020604051602081039080840390855afa158015610e3c573d6000803e3d6000fd5b5050506020604051035173ffffffffffffffffffffffffffffffffffffffff168973ffffffffffffffffffffffffffffffffffffffff1614610eb3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610eaa90611c16565b60405180910390fd5b6000861480610ec25750854211155b610f01576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ef890611b96565b60405180910390fd5b600460008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000815480929190610f5190611def565b919050558714610f96576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f8d90611c36565b60405180910390fd5b600085610fa4576000610fb6565b6fffffffffffffffffffffffffffffffff5b6fffffffffffffffffffffffffffffffff16905080600360008c73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508873ffffffffffffffffffffffffffffffffffffffff168a73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040516110a89190611c76565b60405180910390a350505050505050505050565b6040518060400160405280600381526020017f555344000000000000000000000000000000000000000000000000000000000081525081565b60016000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414611176576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161116d90611bd6565b60405180910390fd5b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555050565b80600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561123f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161123690611c56565b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415801561130757506fffffffffffffffffffffffffffffffff600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414155b156114d25780600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410156113cb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113c290611bb6565b60405180910390fd5b611451600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548261165d565b600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b61151b600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548261165d565b600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061156a6001548261165d565b600181905550600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516115ce9190611c76565b60405180910390a35050565b60006115e733848461057a565b905092915050565b6115fa33838361057a565b505050565b61160a83838361057a565b50505050565b60006020528060005260406000206000915090505481565b6003602052816000526040600020602052806000526040600020600091509150505481565b61165882338361057a565b505050565b600082828461166c9190611d29565b915081111561167a57600080fd5b92915050565b600082828461168f9190611cd3565b915081101561169d57600080fd5b92915050565b6000813590506116b281611fca565b92915050565b6000813590506116c781611fe1565b92915050565b6000813590506116dc81611ff8565b92915050565b6000813590506116f18161200f565b92915050565b60008135905061170681612026565b92915050565b60006020828403121561171e57600080fd5b600061172c848285016116a3565b91505092915050565b6000806040838503121561174857600080fd5b6000611756858286016116a3565b9250506020611767858286016116a3565b9150509250929050565b60008060006060848603121561178657600080fd5b6000611794868287016116a3565b93505060206117a5868287016116a3565b92505060406117b6868287016116e2565b9150509250925092565b600080600080600080600080610100898b0312156117dd57600080fd5b60006117eb8b828c016116a3565b98505060206117fc8b828c016116a3565b975050604061180d8b828c016116e2565b965050606061181e8b828c016116e2565b955050608061182f8b828c016116b8565b94505060a06118408b828c016116f7565b93505060c06118518b828c016116cd565b92505060e06118628b828c016116cd565b9150509295985092959890939650565b6000806040838503121561188557600080fd5b6000611893858286016116a3565b92505060206118a4858286016116e2565b9150509250929050565b6118b781611d5d565b82525050565b6118c681611d6f565b82525050565b6118d581611d7b565b82525050565b6118ec6118e782611d7b565b611e38565b82525050565b60006118fd82611cac565b6119078185611cb7565b9350611917818560208601611dbc565b61192081611e71565b840191505092915050565b6000611938601283611cb7565b915061194382611e82565b602082019050919050565b600061195b600283611cc8565b915061196682611eab565b600282019050919050565b600061197e601a83611cb7565b915061198982611ed4565b602082019050919050565b60006119a1601283611cb7565b91506119ac82611efd565b602082019050919050565b60006119c4601583611cb7565b91506119cf82611f26565b602082019050919050565b60006119e7601283611cb7565b91506119f282611f4f565b602082019050919050565b6000611a0a601183611cb7565b9150611a1582611f78565b602082019050919050565b6000611a2d601883611cb7565b9150611a3882611fa1565b602082019050919050565b611a4c81611da5565b82525050565b611a5b81611daf565b82525050565b6000611a6c8261194e565b9150611a7882856118db565b602082019150611a8882846118db565b6020820191508190509392505050565b6000602082019050611aad60008301846118bd565b92915050565b6000602082019050611ac860008301846118cc565b92915050565b600060c082019050611ae360008301896118cc565b611af060208301886118ae565b611afd60408301876118ae565b611b0a6060830186611a43565b611b176080830185611a43565b611b2460a08301846118bd565b979650505050505050565b6000608082019050611b4460008301876118cc565b611b516020830186611a52565b611b5e60408301856118cc565b611b6b60608301846118cc565b95945050505050565b60006020820190508181036000830152611b8e81846118f2565b905092915050565b60006020820190508181036000830152611baf8161192b565b9050919050565b60006020820190508181036000830152611bcf81611971565b9050919050565b60006020820190508181036000830152611bef81611994565b9050919050565b60006020820190508181036000830152611c0f816119b7565b9050919050565b60006020820190508181036000830152611c2f816119da565b9050919050565b60006020820190508181036000830152611c4f816119fd565b9050919050565b60006020820190508181036000830152611c6f81611a20565b9050919050565b6000602082019050611c8b6000830184611a43565b92915050565b6000602082019050611ca66000830184611a52565b92915050565b600081519050919050565b600082825260208201905092915050565b600081905092915050565b6000611cde82611da5565b9150611ce983611da5565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611d1e57611d1d611e42565b5b828201905092915050565b6000611d3482611da5565b9150611d3f83611da5565b925082821015611d5257611d51611e42565b5b828203905092915050565b6000611d6882611d85565b9050919050565b60008115159050919050565b6000819050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600060ff82169050919050565b60005b83811015611dda578082015181840152602081019050611dbf565b83811115611de9576000848401525b50505050565b6000611dfa82611da5565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415611e2d57611e2c611e42565b5b600182019050919050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000601f19601f8301169050919050565b7f5573642f7065726d69742d657870697265640000000000000000000000000000600082015250565b7f1901000000000000000000000000000000000000000000000000000000000000600082015250565b7f5573642f696e73756666696369656e742d616c6c6f77616e6365000000000000600082015250565b7f5573642f6e6f742d617574686f72697a65640000000000000000000000000000600082015250565b7f5573642f696e76616c69642d616464726573732d300000000000000000000000600082015250565b7f5573642f696e76616c69642d7065726d69740000000000000000000000000000600082015250565b7f5573642f696e76616c69642d6e6f6e6365000000000000000000000000000000600082015250565b7f5573642f696e73756666696369656e742d62616c616e63650000000000000000600082015250565b611fd381611d5d565b8114611fde57600080fd5b50565b611fea81611d6f565b8114611ff557600080fd5b50565b61200181611d7b565b811461200c57600080fd5b50565b61201881611da5565b811461202357600080fd5b50565b61202f81611daf565b811461203a57600080fd5b5056fea26469706673582212200cae5c365187bc7e4d4005524609855053441e03c789cc345061c3ee742b327864736f6c63430008040033"
}
