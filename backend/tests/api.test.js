const test = require("node:test");
const assert = require("node:assert/strict");
const Task = require("../models/task");
const createApp = require("../app");
const rateLimiter = require("../middleware/rateLimiter");

const originalFind = Task.find;
const originalFindByIdAndUpdate = Task.findByIdAndUpdate;
const originalFindByIdAndDelete = Task.findByIdAndDelete;
const originalSave = Task.prototype.save;

const startTestServer = async () => {
  const app = createApp();

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`,
      });
    });
  });
};

test.afterEach(() => {
  Task.find = originalFind;
  Task.findByIdAndUpdate = originalFindByIdAndUpdate;
  Task.findByIdAndDelete = originalFindByIdAndDelete;
  Task.prototype.save = originalSave;
  rateLimiter.resetStore();
});

test("GET /api/health returns ok", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.environment, process.env.NODE_ENV || "development");
    assert.equal(typeof body.uptime, "number");
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test("GET /api/tasks returns tasks in descending order", async () => {
  const tasks = [
    { _id: "2", title: "Second", completed: false },
    { _id: "1", title: "First", completed: true },
  ];

  Task.find = () => ({
    sort: async () => tasks,
  });

  const { server, baseUrl } = await startTestServer();

  try {
    const response = await fetch(`${baseUrl}/api/tasks`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, tasks);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test("POST /api/tasks validates title and creates a task", async () => {
  Task.prototype.save = async function saveTask() {
    return {
      _id: this._id.toString(),
      title: this.title,
      completed: this.completed,
    };
  };

  const { server, baseUrl } = await startTestServer();

  try {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "  Ship changes  " }),
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.title, "Ship changes");
    assert.equal(body.completed, false);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test("POST /api/tasks rejects an empty title", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.message, "Title is required");
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test("PUT /api/tasks/:id updates a task", async () => {
  Task.findByIdAndUpdate = async (_id, updates) => ({
    _id: "abc123",
    title: updates.title,
    completed: updates.completed,
  });

  const { server, baseUrl } = await startTestServer();

  try {
    const response = await fetch(`${baseUrl}/api/tasks/abc123`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated task", completed: true }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.title, "Updated task");
    assert.equal(body.completed, true);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test("DELETE /api/tasks/:id returns 204 for an existing task", async () => {
  Task.findByIdAndDelete = async () => ({ _id: "abc123" });

  const { server, baseUrl } = await startTestServer();

  try {
    const response = await fetch(`${baseUrl}/api/tasks/abc123`, {
      method: "DELETE",
    });

    assert.equal(response.status, 204);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test("rate limiter returns 429 after repeated requests", async () => {
  process.env.RATE_LIMIT_MAX = "2";
  rateLimiter.resetStore();

  const { server, baseUrl } = await startTestServer();

  try {
    let response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);

    response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);

    response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 429);
    assert.equal(body.message, "Too many requests, please try again later.");
  } finally {
    delete process.env.RATE_LIMIT_MAX;
    rateLimiter.resetStore();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
