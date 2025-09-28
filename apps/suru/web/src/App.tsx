import { useState, useEffect } from 'react';
import type { ApiResponse } from '@common/types';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const data: ApiResponse<{ tasks: Task[] }> = await response.json();
      if (data.data) {
        setTasks(data.data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask, completed: false })
      });
      const data: ApiResponse<Task> = await response.json();
      if (data.data) {
        setTasks([...tasks, data.data]);
        setNewTask('');
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  return (
    <div className="app">
      <h1>Suru - Task Management</h1>

      <div className="task-input">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Enter a new task..."
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="task-list">
          {tasks.length === 0 ? (
            <li>No tasks yet. Add your first task!</li>
          ) : (
            tasks.map(task => (
              <li key={task.id} className={task.completed ? 'completed' : ''}>
                {task.title}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}