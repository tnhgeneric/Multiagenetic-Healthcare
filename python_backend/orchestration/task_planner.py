from typing import List, Dict, Any, Optional
from collections import defaultdict
import logging

# Configure logging
logger = logging.getLogger(__name__)

class TaskPlanner:
    """
    Plans and sequences tasks with semantic understanding.
    Handles dependencies and optimizes task execution based on semantic context.
    """
    def sequence_tasks(self, plan: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Creates a semantically-aware execution plan with proper task sequencing.
        Considers semantic priorities and dependencies.
        """
        # Build dependency graph
        depends_on = defaultdict(list)
        provides_data = {}
        
        # Track semantic priorities
        priority_tasks = defaultdict(list)  # high, medium, low priorities
        
        # First pass: identify data providers
        for task in plan:
            task_id = f"{task['agent']}_{task['action']}"
            # Check what data this task provides
            if 'outputs' in task:
                for output in task['outputs']:
                    provides_data[output] = task_id

        # Second pass: build dependency graph
        for task in plan:
            task_id = f"{task['agent']}_{task['action']}"
            # Check what data this task needs
            if 'inputs' in task:
                for input_data in task['inputs']:
                    if input_data in provides_data:
                        provider = provides_data[input_data]
                        depends_on[task_id].append(provider)

        # Topological sort
        sequenced = []
        visited = set()
        temp_visited = set()

        def visit(task_id):
            if task_id in temp_visited:
                raise ValueError("Circular dependency detected")
            if task_id in visited:
                return
            
            temp_visited.add(task_id)
            for dep in depends_on[task_id]:
                visit(dep)
            temp_visited.remove(task_id)
            visited.add(task_id)
            for task in plan:
                if f"{task['agent']}_{task['action']}" == task_id:
                    # Consider semantic priority when sequencing
                    priority = task.get('priority', 'medium')
                    priority_tasks[priority].append(task)
                    break

        # Process all tasks considering priorities
        for task in plan:
            task_id = f"{task['agent']}_{task['action']}"
            if task_id not in visited:
                visit(task_id)

        # Combine tasks based on priority while maintaining dependencies
        final_sequence = []
        for priority in ['high', 'medium', 'low']:
            priority_group = priority_tasks[priority]
            final_sequence.extend(sorted(
                priority_group,
                key=lambda x: len(depends_on[f"{x['agent']}_{x['action']}"])
            ))
            
        logger.info(f"Planned sequence with {len(final_sequence)} tasks")
        for task in final_sequence:
            logger.debug(f"Task: {task['agent']}_{task['action']} Priority: {task.get('priority', 'medium')}")

        return final_sequence
