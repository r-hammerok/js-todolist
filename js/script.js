'use strict';


class Todo {
  constructor(form, input, todoList, todoCompleted) {
    this.classTodoCompleted = todoCompleted;
    this.form = document.querySelector(form);
    this.input = document.querySelector(input);
    this.todoList = document.querySelector(todoList);
    this.todoCompleted = document.querySelector(todoCompleted);
    this.todoContainer = this.todoList.parentNode;
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

  // modifyTodoDataItem(li, removeItem = false) {
  //   if (!li.key) {
  //     return;
  //   }
  //   if (!removeItem) {
  //     const newTodo = {
  //       value: li.querySelector('.text-todo').textContent,
  //       complete: !!li.closest(this.classTodoCompleted),
  //       key: li.key
  //     };
  //     this.todoData.set(newTodo.key, newTodo);
  //   } else {
  //     this.todoData.delete(li.key);
  //   }
  // }

  createItem(todo) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.key = todo.key;
    li.insertAdjacentHTML('beforeend', `
      <span class="text-todo">${todo.value}</span>
      <div class="todo-buttons">
        <button class="todo-edit"></button>
        <button class="todo-remove"></button>
        <button class="todo-complete"></button>
      </div>
    `);

    if (todo.completed) {
      this.todoCompleted.append(li);
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

  deleteItem(item) {
    const fading = (callback) => {
      let opacity = 1, idRequest;
      const opacityItem = () => {
        idRequest = requestAnimationFrame(opacityItem);
  
        item.style.opacity = opacity;
        opacity -= 0.065;
  
        if (opacity < 0) {
          item.style.opacity = 0;
          cancelAnimationFrame(idRequest);
          callback.call(this);
          return;
        }
      };
      opacityItem();
    };
    this.todoData.delete(item.key);
    fading(this.render);
  }

  completeItem(item) {

    const itemTodo = this.todoData.get(item.key);

    let distance = this.todoCompleted.offsetTop + (this.todoCompleted.offsetHeight / 2) - item.offsetTop,
      moveDown = item.offsetTop < this.todoCompleted.offsetTop;
  
    if (itemTodo.completed) {
      // Если дело переносится в незавершенные дела
      distance = item.offsetTop - (this.todoList.offsetTop + (this.todoList.offsetHeight / 2));
    }

    const move = (callback) => {
      let idRequest;
      let currentPos = 0;
      const deltaPos = distance / 10;
      const moveItem = () => {
        idRequest = requestAnimationFrame(moveItem);

        item.style.top = `${currentPos}px`;
        currentPos = moveDown ? currentPos + deltaPos : currentPos - deltaPos;
        if (Math.abs(currentPos) > distance) {
          cancelAnimationFrame(idRequest);
          callback.call(this);
          return;
        }
      };
      moveItem();

    };

    move(this.render);
    itemTodo.completed = !itemTodo.completed;
    this.todoData.set(item.key, itemTodo);
  }

  editItem(item) {

    const liItems = document.querySelectorAll('.todo-container li');
    liItems.forEach((li) => {
      const textLi = li.querySelector('span');
      if (!li.getAttribute('contenteditable') && li.key === item.key) {
        li.style.border = '1px solid black';
        li.style.backgroundColor = '#f3f2f2';
        li.querySelector('button.todo-edit').classList.add('todo-editactive');
        li.setAttribute('contenteditable', true);
      } else if (li.getAttribute('contenteditable')) {
        li.removeAttribute('style');
        li.removeAttribute('contenteditable');
        li.querySelector('button.todo-edit').classList.remove('todo-editactive');

        const itemTodo = this.todoData.get(item.key);
        itemTodo.value = li.querySelector('span').textContent.trim();
        this.todoData.set(item.key, itemTodo);
        this.render();
      }
    });

  }

  handler() {
    this.todoContainer.addEventListener('click', (event) => {
      const target = event.target;

      if (target.tagName === 'BUTTON') {
        const li = target.closest('.todo-item');
        if (li.key) {
          if (target.classList.contains('todo-remove')) {
            this.deleteItem(li);
          }
          if (target.classList.contains('todo-complete')) {
            this.completeItem(li);
          }
          if (target.classList.contains('todo-edit')) {
            this.editItem(li);
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