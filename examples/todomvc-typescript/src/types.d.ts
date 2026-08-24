import type { Getter } from 'leaner';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface TodoHeaderProps {
  addTodo( title: string ): void;
}

interface TodoFooterProps {
  todos: Getter<Todo[]>;
  page(): string;
  deleteCompleted(): void;
}

interface TodoItemProps {
  todo: Getter<Todo>;
  toggleTodo( id: number, completed: boolean ): void;
  editTodo( id: number, title: string ): void;
  deleteTodo( id: number ): void;
}
