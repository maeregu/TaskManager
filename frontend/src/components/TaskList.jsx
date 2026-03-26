const TaskList = ({ tasks, toggleTask, removeTask }) => {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>
          <span
            onClick={() => toggleTask(task)}
            style={{ textDecoration: task.completed ? "line-through" : "" }}
          >
            {task.title}
          </span>
          <button onClick={() => removeTask(task._id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;