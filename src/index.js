const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const users = [];

app.use(cors());
app.use(express.json());

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return next();
  } else {
    return response.status(404).json({ error: "User not exists" })
  }
}

function checksExistsTodo(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "todo not found" });
  } else {
    return next()
  }
}


app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some(user => user.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" })
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  return response.status(201).json(user)
});


app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username)
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const userIndex = users.findIndex((user) => user.username === username);
  const todos = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  users[userIndex].todos.push(todos);
  return response.status(201).json(todos);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  users[userIndex].todos[todoIndex].title = title;
  users[userIndex].todos[todoIndex].deadline = deadline;

  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);

  users[userIndex].todos[todoIndex].done = true;
  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);
  users[userIndex].todos.splice(todoIndex, 1); // 2nd parameter means remove one item only
  return response.status(204).json([])
});

module.exports = app;