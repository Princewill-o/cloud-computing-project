# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createNewProject, getProjectById, updateTaskStatus, listTasksForProject } from '@dataconnect/generated';


// Operation CreateNewProject:  For variables, look at type CreateNewProjectVars in ../index.d.ts
const { data } = await CreateNewProject(dataConnect, createNewProjectVars);

// Operation GetProjectById:  For variables, look at type GetProjectByIdVars in ../index.d.ts
const { data } = await GetProjectById(dataConnect, getProjectByIdVars);

// Operation UpdateTaskStatus:  For variables, look at type UpdateTaskStatusVars in ../index.d.ts
const { data } = await UpdateTaskStatus(dataConnect, updateTaskStatusVars);

// Operation ListTasksForProject:  For variables, look at type ListTasksForProjectVars in ../index.d.ts
const { data } = await ListTasksForProject(dataConnect, listTasksForProjectVars);


```