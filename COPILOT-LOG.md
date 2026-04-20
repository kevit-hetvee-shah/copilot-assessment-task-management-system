# Copilot Usage Log## 1. Inline Suggestions- [file]: [comment typed] → [what Copilot generated]

Prompt:
```text
# Create a route to list tasks with optional filters for status and priority.
```
Generated code:
```python
@router.get("", response_model=APIResponse, summary="List tasks")
async def list_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by task priority"),
):
    """GET /api/tasks — returns a list of tasks, optionally filtered by status and priority."""
    pass  # TODO: delegate to task_service.list(status=status, priority=priority)
```

  
## 2. Agent Mode Prompts- [prompt] → [files changed / result]

Prompt: 
```
Please create a good jumpstart base repository setup here for frontend as react and fastapi as backend. Make sure to have proepr apps directory structure like apps/src/

- service.py
- routes.py
- dto.py

A libs/utils/ for utiliries like db operations, db setup

app configs ina file and, and app being initlaized from other files with envs being imported from configs.

Use standard react and fastapi best ptactices.

Dont start route implementation. Just app startup.

Also create and keep it update the REDAME file```
```


Files changed:


![img.png](img.png)


Prompt: 
```text
Implement a method to list tasks from the database with optional filters for status and priority. Use the 
    # TaskOut schema for the response. Please actually implement to actually fetch the data from the database and 
    # apply the filters. Use SQLAlchemy for database access, and ensure that the method returns a list of TaskOut objects based on the provided filters.
    # Use SQLite Database for storage, and SQLAlchemy as the ORM to interact with the database. Ensure that the method correctly queries the database for tasks, applies the optional filters for status and priority, and returns a list of TaskOut objects that match the criteria.
```


Output:

![img_1.png](img_1.png)



## 3. Sub-Agent Usage- @ui-agent: [prompt] → [result]
- @backend-agent: [prompt] → [result]
- @testing-agent: [prompt] → [result]
  
  ## 4. Review Agent- Issues found: ...
- Fixes applied: ...
  
  ## 5. Skills- Skill: [name] | Prompt: [prompt] | Changes: [what improved]
  
  ## 6. Playwright MCP- Screenshot taken: yes/no
- E2E test generated: [filename]
