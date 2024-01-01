const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"{{#label}}" must be a valid ObjectId')
    }
    return value
}

const password = (value, helpers) => {
    if (value.length < 8) {
        return helpers.message('password must be at least 8 characters')
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        return helpers.message(
            'password must contain at least 1 letter and 1 number'
        )
    }
    return value
}

const ethAddress = (value, helpers) => {
    // Ensure 42 Characters Long
    if (value.length !== 42) {
        return helpers.message(
            'contractAddress must be valid ETH address. Not 42 characters'
        )
    }
    // Ensure regex matches a hex address
    if (!/^(0x)?[0-9a-f]{40}$/i.test(value)) {
        return helpers.message(
            'contractAddress must be valid ETH address. Not hex'
        )
    }
    return value
}

const moralisChain = (value, helpers) => {
    const validChains = ['eth', 'rinkeby']
    if (!validChains.includes(value)) {
        return helpers.message(
            'chain must be one of: ' + validChains.join(', ')
        )
    }
    return value
}

module.exports = {
    moralisChain,
    ethAddress,
    objectId,
    password,
}
