import { useState } from "react";

const TaskForm = ({ addTask }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask(title);
    setTitle("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="task-title">
        Task title
      </label>
      <div className="task-form-row">
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a clear task, like 'Submit weekly report'"
          aria-label="Task title"
        />
        <button type="submit">Add task</button>
      </div>
      <p className="field-hint">Use a short action so each task is easy to scan later.</p>
    </form>
  );
};

export default TaskForm;
