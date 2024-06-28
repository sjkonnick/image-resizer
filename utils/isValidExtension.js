const isValidExtension = (extension) => {
    return ['jpeg', 'png', 'jpg', 'webp', 'gif', 'jp2'].includes(extension);
}

module.exports = { isValidExtension }