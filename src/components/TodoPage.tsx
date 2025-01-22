import React, { useState, useEffect } from 'react';
import {
  X,
  MoreHorizontal,
  AlertCircle,
  Smartphone,
  RefreshCw,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import useFetch from '../hooks/useFetch';
import useUiToast from '../hooks/useUiToast';
import { Task } from '../index'; 

type Priority = 'High' | 'Medium' | 'Low';
type Tag = 'To do' | 'In Progress' | 'Done';

const priorityColors: Record<Priority, string> = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800',
};

const tagTitles: Record<Tag, string> = {
  'To do': 'To do',
  'In Progress': 'In Progress',
  Done: 'Done',
};

const TodoPage = () => {
  const api = useFetch();
  const uiToast = useUiToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showMenuTaskId, setShowMenuTaskId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Partial<Task>>({
    name: '',
    description: '',
    priority: 'Medium',
    tag: 'To do',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);

  const filteredTasks = tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedPriorities.length === 0 || selectedPriorities.includes(task.priority as Priority))
  );

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      if (!response) {
        uiToast.error('Error fetching tasks.');
        return;
      }

      setTasks(
        Array.isArray(response)
          ? response.map((task: any) => ({
              ...task,
              icon: getIconByTag(task.tag),
            }))
          : []
      );
    } catch (error) {
      if ((error as Error).message.includes('401')) {
        navigate('/login'); 
      } else {
        uiToast.error('Error fetching tasks.');
      }
    }
  };

  const handleAddOrEditTask = async () => {
    if (!editingTask.name || !editingTask.priority || !editingTask.tag) {
      uiToast.error('Please fill all the required fields.');
      return;
    }

    if (editingTask.description && editingTask.description.length > 191) {
      uiToast.error('Description cannot exceed 191 characters.');
      return;
    }

    try {
      if (editingTask.id) {
        await api.patch(`/tasks/${editingTask.id}`, editingTask);
        uiToast.success('Task updated successfully!');
      } else {
        await api.post('/tasks', editingTask);
        uiToast.success('New task added!');
      }

      setShowModal(false);
      setEditingTask({ name: '', description: '', priority: 'Medium', tag: 'To do' });
      fetchTasks();
    } catch (error) {
      uiToast.error('Error saving the task.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      uiToast.success('Task deleted successfully!');
      fetchTasks();
    } catch (error) {
      uiToast.error('Error deleting the task.');
    }
  };

  const getIconByTag = (tag: Tag): React.ReactNode => {
    switch (tag) {
      case 'To do':
        return <Smartphone className="w-4 h-4 text-gray-600" />;
      case 'In Progress':
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
      case 'Done':
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
      default:
        return <Smartphone className="w-4 h-4 text-gray-600" />;
    }
  };

  const togglePriorityFilter = (priority: Priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  useEffect(() => {
    const checkAuthAndFetchTasks = async () => {
      const token = localStorage.getItem('token'); 
      if (!token) {
        navigate('/login'); 
        return;
      }
      await fetchTasks();
    };

    checkAuthAndFetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-sm text-gray-500">All your tasks here!</p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <input
              type="search"
              placeholder="Search..."
              className="px-3 py-1 border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors"
              >
                Filter
                <ChevronDown className="w-4 h-4" />
              </button>
              {filterOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white shadow-md border rounded-md z-10 p-4">
                  {(['High', 'Medium', 'Low'] as Priority[]).map((priority) => (
                    <div key={priority} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedPriorities.includes(priority)}
                        onChange={() => togglePriorityFilter(priority)}
                        className="form-checkbox h-4 w-4"
                      />
                      <label>{priority}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setEditingTask({ name: '', description: '', priority: 'Medium', tag: 'To do' });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
            >
              New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {(['To do', 'In Progress', 'Done'] as Tag[]).map((tag) => (
            <div key={tag} className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium">{tagTitles[tag]}</h2>
                  <span className="text-sm text-gray-500">
                    {tasks.filter((task) => task.tag === tag).length}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {filteredTasks
                  .filter((task) => task.tag === tag)
                  .map((task) => (
                    <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2">
                          {task.icon}
                          <span className="font-medium">{task.name}</span>
                        </div>
                        <button
                          onClick={() => setShowMenuTaskId(task.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-500 truncate">{task.description}</div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority as Priority]}`}
                      >
                        {task.priority}
                      </span>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(task.updatedAt).toLocaleDateString()}
                      </div>
                      {showMenuTaskId === task.id && (
                        <div className="absolute top-10 right-4 bg-white border rounded shadow-md z-10">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setShowModal(true);
                              setShowMenuTaskId(null);
                            }}
                            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="block px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editingTask.id ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Task name"
              className="w-full p-2 border rounded mb-4"
              value={editingTask.name || ''}
              onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full p-2 border rounded mb-4"
              value={editingTask.description || ''}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
            />
            <select
              className="w-full p-2 border rounded mb-4"
              value={editingTask.priority || 'Medium'}
              onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              className="w-full p-2 border rounded mb-4"
              value={editingTask.tag || 'To do'}
              onChange={(e) => setEditingTask({ ...editingTask, tag: e.target.value as Tag })}
            >
              <option value="To do">To do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <button
              onClick={handleAddOrEditTask}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {editingTask.id ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoPage;
