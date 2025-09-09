// Simple in-memory database for experiments
class SimpleDB {
  constructor() {
    this.users = [
      { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-01T10:00:00Z' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-01T10:00:00Z' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-01T10:00:00Z' },
      { id: 4, name: 'Alice Brown', email: 'alice@example.com', created_at: '2024-01-01T10:00:00Z' },
      { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', created_at: '2024-01-01T10:00:00Z' }
    ];

    this.products = [
      { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', created_at: '2024-01-01T10:00:00Z' },
      { id: 2, name: 'Smartphone', price: 599.99, category: 'Electronics', created_at: '2024-01-01T10:00:00Z' },
      { id: 3, name: 'Coffee Mug', price: 12.99, category: 'Kitchen', created_at: '2024-01-01T10:00:00Z' },
      { id: 4, name: 'Book: JavaScript Guide', price: 29.99, category: 'Books', created_at: '2024-01-01T10:00:00Z' },
      { id: 5, name: 'Wireless Headphones', price: 149.99, category: 'Electronics', created_at: '2024-01-01T10:00:00Z' },
      { id: 6, name: 'Desk Chair', price: 199.99, category: 'Furniture', created_at: '2024-01-01T10:00:00Z' },
      { id: 7, name: 'Water Bottle', price: 19.99, category: 'Sports', created_at: '2024-01-01T10:00:00Z' },
      { id: 8, name: 'Notebook', price: 5.99, category: 'Office', created_at: '2024-01-01T10:00:00Z' },
      { id: 9, name: 'USB Cable', price: 9.99, category: 'Electronics', created_at: '2024-01-01T10:00:00Z' },
      { id: 10, name: 'Table Lamp', price: 39.99, category: 'Home', created_at: '2024-01-01T10:00:00Z' }
    ];

    this.orders = [
      { id: 1, user_id: 1, total_amount: 1149.98, created_at: '2024-01-01T11:00:00Z' },
      { id: 2, user_id: 2, total_amount: 179.97, created_at: '2024-01-01T11:00:00Z' },
      { id: 3, user_id: 1, total_amount: 42.98, created_at: '2024-01-01T11:00:00Z' },
      { id: 4, user_id: 3, total_amount: 599.99, created_at: '2024-01-01T11:00:00Z' },
      { id: 5, user_id: 4, total_amount: 249.97, created_at: '2024-01-01T11:00:00Z' }
    ];

    this.orderItems = [
      { id: 1, order_id: 1, product_id: 1, quantity: 1, price: 999.99 },
      { id: 2, order_id: 1, product_id: 5, quantity: 1, price: 149.99 },
      { id: 3, order_id: 2, product_id: 3, quantity: 2, price: 12.99 },
      { id: 4, order_id: 2, product_id: 7, quantity: 1, price: 19.99 },
      { id: 5, order_id: 2, product_id: 8, quantity: 25, price: 5.99 },
      { id: 6, order_id: 3, product_id: 4, quantity: 1, price: 29.99 },
      { id: 7, order_id: 3, product_id: 3, quantity: 1, price: 12.99 },
      { id: 8, order_id: 4, product_id: 2, quantity: 1, price: 599.99 },
      { id: 9, order_id: 5, product_id: 6, quantity: 1, price: 199.99 },
      { id: 10, order_id: 5, product_id: 10, quantity: 1, price: 39.99 },
      { id: 11, order_id: 5, product_id: 9, quantity: 1, price: 9.99 }
    ];

    this.nextUserId = 6;
    this.nextOrderId = 6;
    this.nextOrderItemId = 12;
  }

  // User operations
  createUser(name, email) {
    const user = {
      id: this.nextUserId++,
      name,
      email,
      created_at: new Date().toISOString()
    };
    this.users.push(user);
    return user;
  }

  getUser(id) {
    return this.users.find(user => user.id == id);
  }

  // Product operations
  getProducts(category = null, limit = 10, offset = 0) {
    let filtered = this.products;
    
    if (category) {
      filtered = this.products.filter(p => p.category === category);
    }
    
    return filtered.slice(offset, offset + limit);
  }

  getProduct(id) {
    return this.products.find(product => product.id == id);
  }

  // Order operations
  createOrder(user_id, items) {
    const total_amount = items.reduce((sum, item) => {
      const product = this.getProduct(item.product_id);
      return sum + (product.price * item.quantity);
    }, 0);

    const order = {
      id: this.nextOrderId++,
      user_id,
      total_amount,
      created_at: new Date().toISOString()
    };
    this.orders.push(order);

    // Add order items
    const orderItems = items.map(item => {
      const product = this.getProduct(item.product_id);
      const orderItem = {
        id: this.nextOrderItemId++,
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price
      };
      this.orderItems.push(orderItem);
      return {
        ...orderItem,
        product_name: product.name
      };
    });

    return {
      ...order,
      items: orderItems
    };
  }

  getUserOrders(user_id) {
    const userOrders = this.orders.filter(order => order.user_id == user_id);
    
    return userOrders.map(order => {
      const items = this.orderItems
        .filter(item => item.order_id === order.id)
        .map(item => {
          const product = this.getProduct(item.product_id);
          return {
            ...item,
            product_name: product.name
          };
        });
      
      return {
        ...order,
        items
      };
    });
  }
}

let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new SimpleDB();
  }
  return dbInstance;
}

function setupDatabase() {
  console.log('Setting up in-memory database...');
  dbInstance = new SimpleDB();
  console.log('Database setup complete!');
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, getDatabase };