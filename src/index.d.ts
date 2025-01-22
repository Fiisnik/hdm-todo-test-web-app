export interface Task {
  id: number,
  name: string,
  description?: string,
  priority: string,
  tag: string,
  createdAt: string,
  updatedAt: string,
  icon: React.ReactNode;
}
