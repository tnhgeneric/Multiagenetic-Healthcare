
from sub_agents.task_handler import TaskHandler

class AgentDispatcher:
    """
    Sends tasks to sub-agents using MCP/ACL messages, API calls, etc.
    """
    def __init__(self):
        self.disease_prediction_handler = TaskHandler()
        # Add other agent handlers as needed

    def dispatch(self, tasks):
        results = []
        for task in tasks:
            agent = task.get('agent')
            try:
                if agent == 'Disease Prediction Agent':
                    result = self.disease_prediction_handler.handle(task)
                    results.append({'agent': agent, 'result': result, 'error': None})
                else:
                    # Placeholder for other agents
                    results.append({'agent': agent, 'result': None, 'error': 'No handler implemented'})
            except Exception as e:
                results.append({'agent': agent, 'result': None, 'error': str(e)})
        return results
