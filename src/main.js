import './style.css'
import { TodoManager } from './todo.js'

// 初始化 TodoManager
const todoManager = new TodoManager();

// DOM 元素引用
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const todoCount = document.getElementById('todo-count');
const clearCompletedButton = document.getElementById('clear-completed');

// 渲染待办事项列表
function renderTodos(todos) {
  // 清空列表
  todoList.innerHTML = '';
  
  // 更新统计信息
  updateStats();
  
  // 显示或隐藏空状态
  if (todos.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  // 渲染每个待办事项
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;
    
    // 创建待办事项内容
    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
      <span class="todo-text">${escapeHTML(todo.text)}</span>
      <div class="todo-actions">
        <button class="edit-button">编辑</button>
        <button class="delete-button">删除</button>
      </div>
    `;
    
    // 添加到列表
    todoList.appendChild(li);
    
    // 添加事件监听
    setupTodoEventListeners(li, todo);
  });
}

// 设置待办事项的事件监听
function setupTodoEventListeners(element, todo) {
  const checkbox = element.querySelector('.todo-checkbox');
  const deleteButton = element.querySelector('.delete-button');
  const editButton = element.querySelector('.edit-button');
  const todoText = element.querySelector('.todo-text');
  
  // 切换完成状态
  checkbox.addEventListener('change', () => {
    todoManager.toggleTodo(todo.id);
  });
  
  // 删除待办事项
  deleteButton.addEventListener('click', () => {
    todoManager.deleteTodo(todo.id);
  });
  
  // 编辑待办事项
  editButton.addEventListener('click', () => {
    startEditingTodo(element, todo);
  });
  
  // 双击文本也可以编辑
  todoText.addEventListener('dblclick', () => {
    startEditingTodo(element, todo);
  });
}

// 开始编辑待办事项
function startEditingTodo(element, todo) {
  const todoText = element.querySelector('.todo-text');
  
  // 创建编辑输入框
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'todo-edit-input';
  editInput.value = todo.text;
  
  // 替换文本为输入框
  element.innerHTML = '';
  element.appendChild(editInput);
  
  // 自动聚焦并选中所有文本
  editInput.focus();
  editInput.select();
  
  // 处理编辑完成
  function finishEditing() {
    const newText = editInput.value;
    if (newText.trim()) {
      todoManager.editTodo(todo.id, newText);
    } else {
      // 如果文本为空，删除该待办事项
      todoManager.deleteTodo(todo.id);
    }
  }
  
  // 按 Enter 保存编辑
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      finishEditing();
    }
    // 按 Escape 取消编辑
    if (e.key === 'Escape') {
      todoManager.notifyListeners(); // 重新渲染以取消编辑
    }
  });
  
  // 失去焦点时保存编辑
  editInput.addEventListener('blur', finishEditing);
}

// 更新统计信息
function updateStats() {
  const stats = todoManager.getStats();
  
  if (stats.total === 0) {
    todoCount.textContent = '暂无待办事项';
  } else if (stats.active === 0) {
    todoCount.textContent = '所有任务已完成！🎉';
  } else {
    todoCount.textContent = `还剩 ${stats.active} 项待完成`;
  }
  
  // 根据是否有已完成的待办事项来启用或禁用清除按钮
  clearCompletedButton.disabled = stats.completed === 0;
  clearCompletedButton.style.opacity = stats.completed === 0 ? '0.5' : '1';
  clearCompletedButton.style.cursor = stats.completed === 0 ? 'not-allowed' : 'pointer';
}

// HTML 转义函数，防止 XSS 攻击
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 添加新的待办事项
function addTodo() {
  const text = todoInput.value;
  if (text.trim()) {
    todoManager.addTodo(text);
    todoInput.value = '';
    todoInput.focus();
  }
}

// 设置初始事件监听
function setupEventListeners() {
  // 添加按钮点击事件
  addButton.addEventListener('click', addTodo);
  
  // 输入框按 Enter 键添加待办事项
  todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });
  
  // 清除已完成的待办事项
  clearCompletedButton.addEventListener('click', () => {
    // 确认对话框
    if (confirm('确定要清除所有已完成的待办事项吗？')) {
      todoManager.clearCompleted();
    }
  });
  
  // 添加 TodoManager 的监听器，当数据变化时重新渲染
  todoManager.addListener(renderTodos);
}

// 初始化应用
function initApp() {
  setupEventListeners();
  
  // 初始渲染
  renderTodos(todoManager.getAllTodos());
  
  // 自动聚焦输入框
  todoInput.focus();
}

// 启动应用
initApp();

// 添加一些模拟数据，让用户第一次打开应用时能看到示例
if (todoManager.getAllTodos().length === 0) {
  todoManager.addTodo('学习 JavaScript 基础知识');
  todoManager.addTodo('完成项目的核心功能');
  todoManager.addTodo('写一篇技术博客');
}
