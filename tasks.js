const fs = require('fs');
const path = require('path');

const tasksFilePath = path.join(__dirname, 'task.json');

const readTasksFromFile = () => {
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf-8');
    const parsedData = JSON.parse(data);
    return parsedData.tasks || [];
  } catch (error) {
    console.error('Error reading tasks from file:', error);
    return [];
  }
};

const writeTasksToFile = (tasks) => {
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify({ tasks }, null, 2));
  } catch (error) {
    console.error('Error writing tasks to file:', error);
  }
};

let tasks = readTasksFromFile();
let nextId = tasks.length ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;

exports.getAllTasks = (req, res) => {
  tasks = readTasksFromFile();
  res.json(tasks);
};

exports.getTaskById = (req, res) => {
  tasks = readTasksFromFile();
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).send('Task not found');
  res.json(task);
};

exports.createTask = (req, res) => {
  const { title, description, completed } = req.body;
  if (typeof title !== 'string' || typeof description !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).send('Invalid input');
  }
  const task = { id: nextId++, title, description, completed };
  tasks = readTasksFromFile();
  tasks.push(task);
  writeTasksToFile(tasks);
  res.status(201).json(task);
};

exports.updateTask = (req, res) => {
  tasks = readTasksFromFile();
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).send('Task not found');

  const { title, description, completed } = req.body;
  if (typeof title !== 'string' || typeof description !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).send('Invalid input');
  }

  task.title = title;
  task.description = description;
  task.completed = completed;
  writeTasksToFile(tasks);
  res.json(task);
};

exports.deleteTask = (req, res) => {
  tasks = readTasksFromFile();
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) return res.status(404).send('Task not found');

  tasks.splice(taskIndex, 1);
  writeTasksToFile(tasks);
  res.status(204).send();
};
