export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type List = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Board = {
  id: string;
  title: string;
  lists: List[];
  userId: string;
};

export type User = {
  id: string;
  username: string;
  password: string;
};

export type Context = {
  user?: { id: string };
};
