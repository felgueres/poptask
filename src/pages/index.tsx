import { useState, useEffect, useRef, ChangeEvent } from 'react';

interface Task {
  task: string;
  startTime?: Date;
  endTime?: Date;
}

interface CompletedTask {
  task: string;
  duration: number;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [taskInput, setTaskInput] = useState<string>('');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const popSoundRef = useRef<HTMLAudioElement | null>(typeof Audio !== "undefined" ? new Audio('/pop.mp3') : null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const addTask = () => {
    if (taskInput) {
      const newTask: Task = { task: taskInput };
      setTasks(prevTasks => [...prevTasks, newTask]);
      setTaskInput('');
    } else {
      alert('Please enter a valid task.');
    }
  };

  const popTask = () => {
    if (tasks.length > 0) {
      if (currentTask) {
        completeCurrentTask();
      }
      if (popSoundRef.current) {
        popSoundRef.current.play();
      }
      const nextTask = { ...tasks[0], startTime: new Date() };
      setCurrentTask(nextTask);
      setTasks(prevTasks => prevTasks.slice(1));
      setTimeElapsed(0);
    } else {
      alert('No tasks to pop.');
    }
  };

  const completeCurrentTask = () => {
    if (currentTask && currentTask.startTime) {
      const endTime = new Date();
      const duration = (endTime.getTime() - currentTask.startTime.getTime()) / 1000; // Duration in seconds
      const completedTask = { task: currentTask.task, duration };
      setCompletedTasks(prev => [...prev, completedTask]);
    }
  };

  const moveTaskUp = (index: number) => {
    if (index > 0) {
      setTasks(prevTasks => {
        const newTasks = [...prevTasks];
        [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
        return newTasks;
      });
    }
  };

  const moveTaskDown = (index: number) => {
    if (index < tasks.length - 1) {
      setTasks(prevTasks => {
        const newTasks = [...prevTasks];
        [newTasks[index + 1], newTasks[index]] = [newTasks[index], newTasks[index + 1]];
        return newTasks;
      });
    }
  };

  const completeTask = () => {
    if (currentTask) {
      completeCurrentTask();
    }
    setCurrentTask(null);
    clearInterval(intervalRef.current!);
  };

  useEffect(() => {
    if (currentTask) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => {
      clearInterval(intervalRef.current!);
    };
  }, [currentTask]);

  const calculateSegments = (duration: number) => {
    return Math.ceil(duration / 600);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${minutes}m`; // Hours and minutes
    } else {
      return `${mins}m`; // Only minutes
    }
  };

  return (
    <div className='flex flex-col max-w-xl mx-auto mt-5 font-mono p-2'>
      <div className='flex justify-between gap-2 items-center pb-5'>
        <h1 className='flex-1 font-medium text-xl'>
          PopTask
        </h1>
      </div>
      <div className='flex w-full justify-between border-b border-black py-5 gap-5'>
        <div className="flex-1 gap-2 flex flex-col">
          <input
            id="taskInput"
            type="text"
            value={taskInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTaskInput(e.target.value)}
            placeholder="Enter new task"
            className='w-full'
          />
        </div>
        <button className='border-black self-start px-2 border-2' onClick={addTask}>Add task</button>
      </div>
      <div className='flex gap-2 border-b border-black justify-between py-5 items-center'>
        <div className={`flex-1 ${currentTask ? 'bg-orange-300' : ''}`}>{currentTask ? `${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s - ${currentTask.task}` : `Nothing in progress`}</div>
        {currentTask && <button className='border-black px-2 border-2' onClick={completeTask}>End</button>}
        {tasks.length > 0 && <button className='border-black px-2 border-2' onClick={popTask}>Start next</button>}
      </div>
      {
        tasks.length > 0 && <div className='flex flex-col gap-2 py-5'>
          <h2 className='font-bold'>Queue</h2>
          {tasks.map((task, index) => (
            <div key={index} className='flex justify-between'>
              <div> {task.task} {index === 0 ? '(Up next)' : ''}</div>
              <div>
                {index != 0 && <button onClick={() => moveTaskUp(index)}>[+]</button>}
                <button onClick={() => moveTaskDown(index)}>[-]</button>
              </div>
            </div>
          ))}
        </div>
      }

      {completedTasks.length > 0 && (
        <div className='flex flex-col py-5 gap-2'>
          <h2 className='font-bold'>Completed</h2>
          {completedTasks.map((task, index) => (
            <div key={index} className='flex justify-between items-center'>
              <span>{task.task} ({formatDuration(task.duration)})</span>
              <div className='task-segments'>
                {[...Array(calculateSegments(task.duration))].map((_, idx) => (
                  <div key={idx} className='time-segment'></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .task-summary {
          margin-top: 10px;
        }
        .task-segments {
          display: flex;
        }
        .time-segment {
          width: 20px;
          height: 20px;
          margin-right: 5px;
          background-color: blue;
          display: inline-block;
        }
      `}</style>

    </div>
  );
}
