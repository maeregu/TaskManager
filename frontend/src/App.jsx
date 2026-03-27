import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import { createTask, deleteTask, getTasks, updateTask } from "./services/api";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        setError(error.message || "Unable to load tasks. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleAddTask = async (title) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    try {
      const newTask = await createTask({ title: trimmedTitle });
      setTasks((currentTasks) => [newTask, ...currentTasks]);
      setError("");
    } catch (error) {
      setError(error.message || "Unable to add the task right now.");
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const updatedTask = await updateTask(task._id, {
        ...task,
        completed: !task.completed,
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask._id === updatedTask._id ? updatedTask : currentTask,
        ),
      );
      setError("");
    } catch (error) {
      setError(error.message || "Unable to update the task.");
    }
  };

  const handleRemoveTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== id),
      );
      setError("");
    } catch (error) {
      setError(error.message || "Unable to delete the task.");
    }
  };

  return (
    <main className="app-shell">
      <section className="app-card">
        <p className="eyebrow">Task Manager</p>
        <h1>Stay on top of what matters.</h1>
        <p className="subtitle">
          Add tasks, mark them complete, and clear them out when you are done.
        </p>

        <TaskForm addTask={handleAddTask} />

        {error ? <p className="message error">{error}</p> : null}
        {loading ? <p className="message">Loading tasks...</p> : null}
        {!loading && !error && tasks.length === 0 ? (
          <p className="message">No tasks yet. Add your first one above.</p>
        ) : null}
        {!loading && tasks.length > 0 ? (
          <>
            <div className="list-header">
              <h2>Your tasks</h2>
              <span className="task-count">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>
            <TaskList
              tasks={tasks}
              toggleTask={handleToggleTask}
              removeTask={handleRemoveTask}
            />
          </>
        ) : null}
      </section>
    </main>
  );
}

export default App;
