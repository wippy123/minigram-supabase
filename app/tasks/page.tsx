import TaskList from "@/components/tasks/TaskList";
import AddTaskForm from "@/components/tasks/AddTaskForm";

export default function TasksPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Tasks</h1>
      <AddTaskForm />
      <hr className="my-6" />
      <TaskList />
    </div>
  );
}
