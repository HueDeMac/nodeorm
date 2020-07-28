class OneToMany {
    hasMany(From, To, f_id, l_id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM ${To.table} where ${f_id}=${this[l_id]}`
            this.constructor.connection.query(query, (e, r, f) => {
                if (e) reject(e)
                else resolve(r)
            })
        })
    }
}

module.exports = { OneToMany }