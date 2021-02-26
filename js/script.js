'use strict';


class Todo {
  constructor(form, input, todoList, todoCompleted) {
    this.form = document.querySelector(form);
    this.input = document.querySelector(input);
    this.todoList = document.querySelector(todoList);
    this.todoCompleted = document.querySelector(todoCompleted);
    this.todoData = new Map(JSON.parse(localStorage.getItem('toDoList')));
  }

  addToStorage() {
    localStorage.setItem('toDoList', JSON.stringify([...this.todoData]));
  }

  render() {
    this.todoList.textContent = '';
    this.todoCompleted.textContent = '';
    this.todoData.forEach(this.createItem, this);
    this.addToStorage();
  }

  createItem(todo) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.key = todo.key;
    li.insertAdjacentHTML('beforeend', `
      <span class="text-todo">${todo.value}</span>
      <div class="todo-buttons">
        <button class="todo-remove"></button>
        <button class="todo-complete"></button>
      </div>
    `);

    if (todo.completed) {
      this.todoCompleted.append(li)
    } else {
      this.todoList.append(li);
    }
  }

  addTodo(event) {
    event.preventDefault();
    if (this.input.value.trim()) {
      const newTodo = {
        value: this.input.value.trim(),
        completed: false,
        key: this.generateKey()
      };
      this.todoData.set(newTodo.key, newTodo);
      this.input.value = '';
      this.render();
    } else {
      alert('Нельзя добавить пустое дело!');
    }
  }

  generateKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  deleteItem(key) {
    if (this.todoData.delete(key)) {
      this.render();
    }
  }

  completeItem(key) {
    if (this.todoData.has(key)) {
      const item = this.todoData.get(key);
      item.completed = !item.completed;
      this.todoData.set(key, item);
      this.render();
    }
  }

  handler() {
    this.todoList.parentNode.addEventListener('click', (event) => {
      const target = event.target;

      if (target.tagName === 'BUTTON') {
        const key = target.closest('.todo-item').key;
        if (key) {
          if (target.classList.contains('todo-remove')) {
            this.deleteItem(key);
          }
          if (target.classList.contains('todo-complete')) {
            this.completeItem(key);
          }
        }
      }
      
    });
  }

  init() {
    this.form.addEventListener('submit', this.addTodo.bind(this));
    this.handler();
    this.render();
  }

}

const todo = new Todo('.todo-control', '.header-input', '.todo-list', '.todo-completed');

todo.init();