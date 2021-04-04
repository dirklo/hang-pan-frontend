Array.prototype.find_by_id = function(searchId) {
    return this.find((item) => item.id === searchId)
}

Array.prototype.find_by_name = function(searchName) {
    return this.find((item) => item.name === searchName)
}