const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username == username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  } else {
    request.user = user;
    return next();
  }
}

app.post("/users", (request, response) => {
  var { name, username } = request.body;

  if (name == null || username == null) {
    return response
      .status(400)
      .json({ error: "Username and Name cannot be null" });
  }

  if (users.find((user) => user.username == username)) {
    return response.status(400).json({ error: "User already exist" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get("/users", (request, response) => {
  return response.status(200).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todo = user.todos.find((todo) => (todo.id = id));

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.status(200).send(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => (todo.id = id));

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  todo.done = true;

  return response.status(200).send(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const id = request.params.id;
  const todo = user.todos.findIndex(todo => todo.id === id)
  console.log(todo)

  if (todo === -1) {
    return response.status(404).json({ error: "No one todo were found" });
  } else {
    user.todos.splice(todo, 1);
    return response.status(204).json();
  }
});

module.exports = app;
