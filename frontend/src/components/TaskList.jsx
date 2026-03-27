const TaskList = ({ tasks, toggleTask, removeTask }) => {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li className={`task-item ${task.completed ? "is-complete" : ""}`} key={task._id}>
          <button
            type="button"
            className="task-toggle"
            onClick={() => toggleTask(task)}
            aria-label={task.completed ? `Mark ${task.title} as active` : `Mark ${task.title} as complete`}
          >
            <span className="task-title">{task.title}</span>
            <span className="task-status">
              {task.completed ? "Completed" : "Active - click to mark complete"}
            </span>
          </button>
          <button type="button" className="delete-button" onClick={() => removeTask(task._id)}>
            Delete task
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
