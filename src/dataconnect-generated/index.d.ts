import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Attachment_Key {
  id: UUIDString;
  __typename?: 'Attachment_Key';
}

export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CreateNewProjectData {
  project_insert: Project_Key;
}

export interface CreateNewProjectVariables {
  name: string;
  description?: string | null;
  dueDate?: DateString | null;
}

export interface GetProjectByIdData {
  project?: {
    id: UUIDString;
    name: string;
    description?: string | null;
    dueDate?: DateString | null;
    owner: {
      id: UUIDString;
      displayName: string;
      email: string;
    } & User_Key;
      tasks_on_project: ({
        id: UUIDString;
        title: string;
        status: string;
      } & Task_Key)[];
  } & Project_Key;
}

export interface GetProjectByIdVariables {
  id: UUIDString;
}

export interface ListTasksForProjectData {
  tasks: ({
    id: UUIDString;
    title: string;
    status: string;
    priority?: number | null;
    dueDate?: DateString | null;
    description?: string | null;
    assignee?: {
      id: UUIDString;
      displayName: string;
    } & User_Key;
  } & Task_Key)[];
}

export interface ListTasksForProjectVariables {
  projectId: UUIDString;
}

export interface ProjectMember_Key {
  projectId: UUIDString;
  userId: UUIDString;
  __typename?: 'ProjectMember_Key';
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface UpdateTaskStatusData {
  task_update?: Task_Key | null;
}

export interface UpdateTaskStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewProjectVariables): MutationRef<CreateNewProjectData, CreateNewProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewProjectVariables): MutationRef<CreateNewProjectData, CreateNewProjectVariables>;
  operationName: string;
}
export const createNewProjectRef: CreateNewProjectRef;

export function createNewProject(vars: CreateNewProjectVariables): MutationPromise<CreateNewProjectData, CreateNewProjectVariables>;
export function createNewProject(dc: DataConnect, vars: CreateNewProjectVariables): MutationPromise<CreateNewProjectData, CreateNewProjectVariables>;

interface GetProjectByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProjectByIdVariables): QueryRef<GetProjectByIdData, GetProjectByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProjectByIdVariables): QueryRef<GetProjectByIdData, GetProjectByIdVariables>;
  operationName: string;
}
export const getProjectByIdRef: GetProjectByIdRef;

export function getProjectById(vars: GetProjectByIdVariables): QueryPromise<GetProjectByIdData, GetProjectByIdVariables>;
export function getProjectById(dc: DataConnect, vars: GetProjectByIdVariables): QueryPromise<GetProjectByIdData, GetProjectByIdVariables>;

interface UpdateTaskStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  operationName: string;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;

export function updateTaskStatus(vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;
export function updateTaskStatus(dc: DataConnect, vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface ListTasksForProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListTasksForProjectVariables): QueryRef<ListTasksForProjectData, ListTasksForProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListTasksForProjectVariables): QueryRef<ListTasksForProjectData, ListTasksForProjectVariables>;
  operationName: string;
}
export const listTasksForProjectRef: ListTasksForProjectRef;

export function listTasksForProject(vars: ListTasksForProjectVariables): QueryPromise<ListTasksForProjectData, ListTasksForProjectVariables>;
export function listTasksForProject(dc: DataConnect, vars: ListTasksForProjectVariables): QueryPromise<ListTasksForProjectData, ListTasksForProjectVariables>;

