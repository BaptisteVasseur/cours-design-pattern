class DatabaseQuery {
  constructor(table, columns, where, orderBy, limit, offset) {
    this.table = table;
    this.columns = columns;
    this.where = where;
    this.orderBy = orderBy;
    this.limit = limit;
    this.offset = offset;
  }

  execute() {
    let query = `SELECT ${this.columns.join(', ')} FROM ${this.table}`;
    
    if (this.where) {
      query += ` WHERE ${this.where}`;
    }
    
    if (this.orderBy) {
      query += ` ORDER BY ${this.orderBy}`;
    }
    
    if (this.limit) {
      query += ` LIMIT ${this.limit}`;
    }
    
    if (this.offset) {
      query += ` OFFSET ${this.offset}`;
    }

    console.log(query);
    return query;
  }
}

const query = new DatabaseQuery(
  'users',
  ['id', 'name', 'email'],
  'age > 18',
  'name ASC',
  10,
  0
);

// 50 lignes



query.execute();

