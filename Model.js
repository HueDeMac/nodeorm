const { connection } = require('./nodeorm');
const { isNullOrUndefined, isArray } = require('util');

class Model {

	static table = ''
	static connection = connection;
	static items = []
	static conditions = []
	static selections = []

	static find(ids) {
		return new Promise((resolve, reject) => {
			let query = 'SELECT ' + this.getSelects() + ' FROM ' + this.table
			if(Array.isArray(ids)){
				query += ' where id in (' + ids.join(',') + ')'
			} else {
				query += ' where id=' + ids
			}
			this.connection.query(query, (err, res) => {
				if (err) {
					reject(err)
				} else {
					resolve(res)
				}
			})
		})
	}

	static select(keyArray) {
		if (Array.isArray(keyArray)) {
			this.selections = keyArray
		} else {
			this.selections.push(keyArray)
		}
		return this
	}

	static where(key, operator, value) {
		let op = '='
		if (!isNullOrUndefined(value)) {
			op = operator
			this.conditions.push({
				key: key,
				operator: op,
				value: value
			})
		} else {
			this.conditions.push({
				key: key,
				operator: op,
				value: operator
			})
		}

		return this
	}

	static get() {
		return new Promise((resolve, reject) => {
			this.connection.query(this.sql(), (e, r, f) => {
				if (e) reject(e)
				else resolve(r)
			})
		})
	}

	static all() {
		return new Promise((resolve, reject) => {
			this.connection.query('SELECT * FROM ' + this.table, (err, res, fld) => {
				if (err) {
					reject(err)
				} else {
					const outputArray = []
					res.forEach(item => {
						const obj = new this
						for (const prop in item) {
							obj[prop] = item[prop]
						}
						outputArray.push(obj)
					})

					resolve(outputArray)
				}
			})
		})
	}

	save() {
		return new Promise((resolve, reject) => {
			if (this.id) {
				this.constructor.connection.query('UPDATE ' + this.constructor.table + ' SET ? where id=' + this.id, this, (e, r) => {
					if (e) reject(e)
					else resolve(r)
				})
			} else {
				this.constructor.connection.query('INSERT INTO ' + this.constructor.table + ' SET ?', this, (e, r, f) => {
					if (e) reject(e)
					else {
						this.id = r.insertId
						resolve(r)
					}
				})
			}
		})
	}

	static create(inputs) {
		return new Promise((resolve, reject) => {
			const qry = 'INSERT INTO ' + this.table + ' SET ?'
			this.connection.query(qry, inputs, (e, r, f) => {
				if (e) {
					reject(e)
				} else {
					const obj = new this
					for (let p in inputs) {
						obj[p] = inputs[p]
					}
					obj.id = r.insertId
					resolve(obj)
				}
			})
		})
	}

	static getWheres() {
		let str = ''

		if (this.conditions.length > 0) {
			this.conditions.forEach(item => {
				let value = item.value
				if (isNaN(item.value)) {
					value = '"' + item.value + '"'
				}
				if (str.length == 0) {
					str += ' where ' + item.key + item.operator + value
				} else {
					str += ' AND ' + item.key + item.operator + value
				}
			})
		}
		return str
	}

	static getSelects() {
		let str = ''
		if (this.selections.length > 0) {
			str = ' ' + this.selections.join(',') + ' '
		} else {
			str = ' * '
		}
		return str
	}

	static sql() {
		return 'select ' + this.getSelects() + ' from ' + this.table + ' ' + this.getWheres()
	}
}

module.exports = { Model }
