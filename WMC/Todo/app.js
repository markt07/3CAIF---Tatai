// 1. APPLICATION STATE
import TodoItem from './todo-item.js';
const todos = [];

// 2. STATE ACCESSORS/MUTATORS FN'S
function addTodoItem(text) {
    const todo = new TodoItem(text);
    todos.push(todo);
}

function removeTodoItem(todo) {
    const index = todos.indexOf(todo);
    todos.splice(index, 1);
}

function toggleTodoStatus(todo) {
    todo.toggleCompleted();
}

// 3. DOM Node Refs
const todoInput = document.querySelector('#todo-input');
const todoAdd = document.querySelector('#todo-add');
const todoList = document.querySelector('#todo-list');
const todoListDone = document.querySelector('#todo-list-done');

// 4. DOM Node Creation Fn's
function createTodoElement(todo) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => onTodoStatusChanged(todo));

    const span = document.createElement('span');
    span.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => onDeleteButtonClicked(todo));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    return li;
}

// 5. RENDER FN
function render() {
    todoList.innerHTML = '';
    todoListDone.innerHTML = '';

    for (const todo of todos) {
        const li = createTodoElement(todo);
        if (todo.completed) {
            todoListDone.appendChild(li);
        } else {
            todoList.appendChild(li);
        }
    }
}

// 6. EVENT HANDLERS
function onAddButtonClicked() {
    const text = todoInput.value.trim();
    if (!text) return;
    addTodoItem(text);
    todoInput.value = '';
    render();
}

function onDeleteButtonClicked(todo) {
    removeTodoItem(todo);
    render();
}

function onTodoStatusChanged(todo) {
    toggleTodoStatus(todo);
    render();
}

function onKeyDownEvent(e) {
    if (e.key === 'Enter') onAddButtonClicked();
}

// 7. INIT BINDINGS
todoAdd.addEventListener('click', onAddButtonClicked);
todoInput.addEventListener('keydown', onKeyDownEvent);

// 8. INITIAL RENDER
render();
