// Todo 管理器
class TodoManager {
  constructor() {
    // 从本地存储加载待办事项，如果没有则初始化为空数组
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    this.listeners = [];
    this.notifyListeners();
  }

  // 添加监听器（用于UI更新）
  addListener(listener) {
    this.listeners.push(listener);
  }

  // 通知所有监听器
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.todos));
  }

  // 添加新的待办事项
  addTodo(text) {
    if (!text.trim()) return;
    
    const todo = {
      id: Date.now(), // 使用时间戳作为唯一ID
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    this.todos.push(todo);
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  // 切换待办事项的完成状态
  toggleTodo(id) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveToLocalStorage();
      this.notifyListeners();
    }
  }

  // 删除待办事项
  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  // 编辑待办事项的文本
  editTodo(id, newText) {
    if (!newText.trim()) return;
    
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.text = newText.trim();
      this.saveToLocalStorage();
      this.notifyListeners();
    }
  }

  // 清除已完成的待办事项
  clearCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed);
    this.saveToLocalStorage();
    this.notifyListeners();
  }

  // 将待办事项保存到本地存储
  saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  // 获取所有待办事项
  getAllTodos() {
    return [...this.todos];
  }

  // 获取待办事项的统计信息
  getStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(todo => todo.completed).length;
    const active = total - completed;
    
    return {
      total,
      completed,
      active
    };
  }
}

export { TodoManager };