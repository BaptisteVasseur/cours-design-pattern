class SQLQuery {
  constructor(builder) {
    this.table = builder.table;
    this.columns = builder.columns;
    this.whereConditions = builder.whereConditions;
    this.joins = builder.joins;
    this.orderByFields = builder.orderByFields;
    this.limitValue = builder.limitValue;
    this.offsetValue = builder.offsetValue;
    this.groupByFields = builder.groupByFields;
  }

  toString() {
    let query = `SELECT ${this.columns.join(', ')} FROM ${this.table}`;

    if (this.joins.length > 0) {
      query += ' ' + this.joins.join(' ');
    }

    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }

    if (this.groupByFields.length > 0) {
      query += ` GROUP BY ${this.groupByFields.join(', ')}`;
    }

    if (this.orderByFields.length > 0) {
      query += ` ORDER BY ${this.orderByFields.join(', ')}`;
    }

    if (this.limitValue) {
      query += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue) {
      query += ` OFFSET ${this.offsetValue}`;
    }

    return query;
  }

  execute() {
    const sql = this.toString();
    console.log('🔍 Exécution de la requête:');
    console.log(`   ${sql}`);
    return sql;
  }
}

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.columns = ['*'];
    this.whereConditions = [];
    this.joins = [];
    this.orderByFields = [];
    this.groupByFields = [];
    this.limitValue = null;
    this.offsetValue = null;
  }

  select(...columns) {
    this.columns = columns;
    return this;
  }

  where(condition, operator = '=', value = null) {
    if (value !== null) {
      const formattedValue = typeof value === 'string' ? `'${value}'` : value;
      this.whereConditions.push(`${condition} ${operator} ${formattedValue}`);
    } else {
      this.whereConditions.push(condition);
    }
    return this;
  }

  join(table, condition) {
    this.joins.push(`INNER JOIN ${table} ON ${condition}`);
    return this;
  }

  leftJoin(table, condition) {
    this.joins.push(`LEFT JOIN ${table} ON ${condition}`);
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this.orderByFields.push(`${field} ${direction}`);
    return this;
  }

  groupBy(...fields) {
    this.groupByFields = fields;
    return this;
  }

  limit(limit) {
    this.limitValue = limit;
    return this;
  }

  offset(offset) {
    this.offsetValue = offset;
    return this;
  }

  build() {
    return new SQLQuery(this);
  }
}

console.log('=== Exemple 1: Requête simple ===\n');

const query1 = new QueryBuilder('users')
  .select('id', 'name', 'email')
  .where('age', '>', 18)
  .orderBy('name', 'ASC')
  .limit(10)
  .build();

query1.execute();

console.log('\n=== Exemple 2: Requête avec JOIN ===\n');

const query2 = new QueryBuilder('orders')
  .select('orders.id', 'orders.total', 'users.name', 'users.email')
  .join('users', 'users.id = orders.user_id')
  .where('orders.status', '=', 'completed')
  .where('orders.total', '>', 100)
  .orderBy('orders.created_at', 'DESC')
  .limit(20)
  .build();

query2.execute();

console.log('\n=== Exemple 3: Requête avec GROUP BY ===\n');

const query3 = new QueryBuilder('products')
  .select('category', 'COUNT(*) as total', 'AVG(price) as avg_price')
  .groupBy('category')
  .orderBy('total', 'DESC')
  .build();

query3.execute();

console.log('\n=== Exemple 4: Requête complexe ===\n');

const query4 = new QueryBuilder('posts')
  .select('posts.*', 'users.name as author', 'COUNT(comments.id) as comment_count')
  .join('users', 'users.id = posts.author_id')
  .leftJoin('comments', 'comments.post_id = posts.id')
  .where('posts.published', '=', true)
  .where('posts.created_at', '>', '2024-01-01')
  .groupBy('posts.id', 'users.name')
  .orderBy('comment_count', 'DESC')
  .limit(5)
  .offset(10)
  .build();

query4.execute();

